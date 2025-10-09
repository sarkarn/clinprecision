# Table UUID Column Analysis - DDD Requirements

**Date**: October 4, 2025  
**Context**: Analyzing whether specified tables need `aggregate_uuid` columns based on current DDD implementation

---

## Executive Summary

Based on the current DDD/CQRS/Event Sourcing implementation, I've analyzed 8 tables to determine if they require `aggregate_uuid` columns. 

**Key Finding**: Only **2 out of 8 tables** need UUID columns, as most are either child entities within aggregates or reference/audit tables.

---

## Current DDD Aggregate Architecture

### **Existing Aggregates** (with UUID columns):

1. **StudyAggregate** ✅
   - Table: `studies.aggregate_uuid`
   - Aggregate Root: Study lifecycle management
   
2. **ProtocolVersionAggregate** ✅
   - Table: `study_versions.id` (UUID used as primary key)
   - Aggregate Root: Protocol version lifecycle
   
3. **StudyDesignAggregate** ✅
   - Table: `study_arms.aggregate_uuid`, `study_interventions.aggregate_uuid`, `visit_forms.aggregate_uuid`
   - Aggregate Root: Study design (arms, visits, forms)
   
4. **StudyDatabaseBuildAggregate** ✅
   - Separate aggregate for database build process
   - No direct table mapping (pure event sourcing)
   
5. **PatientAggregate** ✅
   - Patient enrollment and management
   
6. **SiteAggregate** ✅
   - Table: `sites.aggregate_uuid`
   - Site management

---

## Table Analysis

### ❌ 1. **study_versions** - NO UUID COLUMN NEEDED

**Current Status**: Already has UUID as primary identifier
```sql
CREATE TABLE study_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    version_number VARCHAR(20) NOT NULL,
    ...
)
```

**Decision**: ❌ **NO aggregate_uuid column needed**

**Reasoning**:
- **This IS an aggregate root itself** (`ProtocolVersionAggregate`)
- The `id` (BIGINT) is used as the aggregate identifier
- `ProtocolVersionAggregate.versionId` maps to `study_versions.id`
- Has its own lifecycle: DRAFT → UNDER_REVIEW → SUBMITTED → APPROVED → ACTIVE
- Referenced by: `study_amendments.study_version_id`

**DDD Pattern**:
```java
@Aggregate
public class ProtocolVersionAggregate {
    @AggregateIdentifier
    private UUID versionId;  // Maps to study_versions.id
    
    private UUID studyAggregateUuid;  // Parent study reference
    private String versionNumber;
    private VersionStatus status;
    ...
}
```

**Relationship**:
- `study_versions.study_id` → `studies.id` (belongs to StudyAggregate)
- `study_versions` is a **separate aggregate**, not a child entity

---

### ❌ 2. **study_amendments** - NO UUID COLUMN NEEDED

**Current Status**: Child entity within ProtocolVersionAggregate
```sql
CREATE TABLE study_amendments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_version_id BIGINT NOT NULL,
    amendment_number INT NOT NULL,
    ...
)
```

**Decision**: ❌ **NO aggregate_uuid column needed**

**Reasoning**:
- **Child entity** of `ProtocolVersionAggregate`, NOT a separate aggregate root
- Amendments are part of the protocol version's lifecycle
- No business rules that operate independently of the version
- Should be managed via `ProtocolVersionAggregate` commands/events
- Lifecycle tied to parent version (CASCADE DELETE)

**DDD Pattern**: Entity within Aggregate Boundary
```
ProtocolVersionAggregate (Root)
  └─ Amendments (Entities)
       - Managed by version aggregate
       - No independent lifecycle
       - Changes emit events from version aggregate
```

**Expected Events** (from ProtocolVersionAggregate):
- `AmendmentAddedEvent`
- `AmendmentApprovedEvent`
- `AmendmentRejectedEvent`

**If you wanted it as aggregate** (not recommended):
```java
@Aggregate
public class AmendmentAggregate {
    @AggregateIdentifier
    private UUID amendmentId;
    private UUID versionId;  // Parent reference
    ...
}
```
But this would be **over-engineering** since amendments don't have complex independent business logic.

---

### ❌ 3. **study_design_progress** - NO UUID COLUMN NEEDED

**Current Status**: Progress tracking table
```sql
CREATE TABLE study_design_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    phase VARCHAR(50) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    percentage INT NOT NULL DEFAULT 0,
    ...
)
```

**Decision**: ❌ **NO aggregate_uuid column needed**

**Reasoning**:
- **Read model / Query side** table for tracking design progress
- No business rules or invariants to enforce
- Simple tracking: which phases are complete, percentage done
- Should be updated via **event projections** from StudyDesignAggregate events
- Not an aggregate root - no command handling

**DDD Pattern**: Query Model (CQRS Read Side)
```
StudyDesignAggregate (Command Side)
    ↓ Events
    ↓ StudyDesignInitializedEvent
    ↓ StudyArmAddedEvent
    ↓ VisitDefinedEvent
    ↓ FormAssignedToVisitEvent
    ↓
Projection Handler → Updates study_design_progress (Query Side)
```

**Recommended Implementation**:
```java
@Component
public class StudyDesignProgressProjection {
    
    @EventHandler
    public void on(StudyArmAddedEvent event) {
        // Calculate progress: arms phase completion
        updateProgress(event.getStudyAggregateUuid(), "arms", calculatePercentage());
    }
    
    @EventHandler
    public void on(FormAssignedToVisitEvent event) {
        // Calculate progress: forms phase completion
        updateProgress(event.getStudyAggregateUuid(), "forms", calculatePercentage());
    }
    
    private void updateProgress(UUID studyId, String phase, int percentage) {
        // Update study_design_progress table
        progressRepository.upsert(studyId, phase, percentage);
    }
}
```

---

### ❌ 4. **organization_studies** - NO UUID COLUMN NEEDED

**Current Status**: Many-to-many relationship table
```sql
CREATE TABLE organization_studies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    study_id BIGINT NOT NULL,
    role ENUM('SPONSOR', 'CRO', 'SITE', ...) NOT NULL,
    ...
)
```

**Decision**: ❌ **NO aggregate_uuid column needed**

**Reasoning**:
- **Association table** between Organizations and Studies
- No independent lifecycle or business logic
- Managed by **StudyAggregate** when assigning organizations
- Managed by **OrganizationAggregate** (if implemented) when adding studies

**DDD Pattern**: Association within Aggregate
```
StudyAggregate
  └─ AssignOrganizationToStudyCommand
       ↓
       StudyOrganizationAssignedEvent
       ↓
       Projection → Insert into organization_studies
```

**Event-Driven Approach**:
```java
// In StudyAggregate
@CommandHandler
public void handle(AssignOrganizationCommand command) {
    // Validate organization exists
    // Validate role is valid
    AggregateLifecycle.apply(new StudyOrganizationAssignedEvent(
        studyAggregateUuid,
        command.getOrganizationId(),
        command.getRole(),
        command.getIsPrimary()
    ));
}

// Projection updates organization_studies table
@EventHandler
public void on(StudyOrganizationAssignedEvent event) {
    organizationStudiesRepository.save(new OrganizationStudyEntity(
        event.getOrganizationId(),
        event.getStudyAggregateUuid(),
        event.getRole()
    ));
}
```

**Note**: If `organizations` table has `aggregate_uuid` (it does now after recent updates), then:
- `organization_studies.organization_id` can be kept as BIGINT for FK integrity
- No need for separate UUID column in the association table

---

### ✅ 5. **study_documents** - YES, UUID COLUMN RECOMMENDED

**Current Status**: No UUID column
```sql
CREATE TABLE study_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    ...
)
```

**Decision**: ✅ **YES, add aggregate_uuid column**

**Reasoning**:
- **Document management has complex business logic**:
  - Version control (DRAFT → CURRENT → SUPERSEDED → ARCHIVED)
  - Regulatory compliance (21 CFR Part 11)
  - Audit trail requirements (who uploaded, downloaded, modified)
  - Approval workflows
  - E-signature requirements
- **Documents are domain entities with lifecycle**
- Should be managed as separate aggregate for regulatory compliance

**Recommended Schema Change**:
```sql
ALTER TABLE study_documents 
ADD COLUMN aggregate_uuid VARCHAR(36) NOT NULL UNIQUE 
COMMENT 'UUID for DocumentAggregate in event store'
AFTER id;

CREATE INDEX idx_study_documents_aggregate_uuid ON study_documents(aggregate_uuid);
```

**DDD Pattern**: Separate Aggregate
```java
@Aggregate
public class StudyDocumentAggregate {
    
    @AggregateIdentifier
    private UUID documentId;  // Maps to study_documents.aggregate_uuid
    
    private UUID studyAggregateUuid;
    private String documentName;
    private DocumentType documentType;
    private DocumentStatus status;  // DRAFT, CURRENT, SUPERSEDED, ARCHIVED
    private String version;
    private String filePath;
    
    @CommandHandler
    public StudyDocumentAggregate(UploadStudyDocumentCommand command) {
        // Validate file size, type
        // Validate user permissions
        AggregateLifecycle.apply(StudyDocumentUploadedEvent.builder()
            .documentId(command.getDocumentId())
            .studyId(command.getStudyId())
            .fileName(command.getFileName())
            .uploadedBy(command.getUserId())
            .build());
    }
    
    @CommandHandler
    public void handle(ApproveDocumentCommand command) {
        // Validate current status is DRAFT
        // Validate approver has permissions
        // Validate e-signature if required
        AggregateLifecycle.apply(new DocumentApprovedEvent(
            documentId,
            command.getApprovedBy(),
            command.getSignature()
        ));
    }
    
    @CommandHandler
    public void handle(SupersedeDocumentCommand command) {
        // Current document status must be CURRENT
        // New version must be provided
        AggregateLifecycle.apply(new DocumentSupersededEvent(
            documentId,
            command.getNewDocumentId(),
            command.getSupersededBy()
        ));
    }
}
```

**Benefits of Document Aggregate**:
1. **Regulatory Compliance**: Complete audit trail via event sourcing
2. **Version Control**: Explicit state transitions with events
3. **Security**: Command-based access control
4. **Audit Trail**: Every action (upload, download, approve) is an event
5. **Testability**: Business rules testable without database

---

### ✅ 6. **study_document_audit** - NO UUID COLUMN NEEDED (Keep as Projection)

**Current Status**: Audit trail table
```sql
CREATE TABLE study_document_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    action_type ENUM('UPLOAD', 'DOWNLOAD', 'UPDATE', ...) NOT NULL,
    ...
)
```

**Decision**: ❌ **NO aggregate_uuid column needed**

**Reasoning**:
- **This is a projection/read model**, not an aggregate
- Should be populated from `StudyDocumentAggregate` events
- Every event from document aggregate creates an audit entry
- No independent business logic or lifecycle

**DDD Pattern**: Event Projection
```java
@Component
public class StudyDocumentAuditProjection {
    
    @EventHandler
    public void on(StudyDocumentUploadedEvent event) {
        auditRepository.save(StudyDocumentAudit.builder()
            .documentId(event.getDocumentId())
            .actionType("UPLOAD")
            .performedBy(event.getUploadedBy())
            .performedAt(event.getOccurredAt())
            .newValues(toJson(event))
            .build());
    }
    
    @EventHandler
    public void on(DocumentDownloadedEvent event) {
        auditRepository.save(StudyDocumentAudit.builder()
            .documentId(event.getDocumentId())
            .actionType("DOWNLOAD")
            .performedBy(event.getDownloadedBy())
            .performedAt(event.getOccurredAt())
            .ipAddress(event.getIpAddress())
            .userAgent(event.getUserAgent())
            .build());
    }
    
    @EventHandler
    public void on(DocumentApprovedEvent event) {
        auditRepository.save(StudyDocumentAudit.builder()
            .documentId(event.getDocumentId())
            .actionType("STATUS_CHANGE")
            .performedBy(event.getApprovedBy())
            .performedAt(event.getOccurredAt())
            .oldValues(Json.of("status", "DRAFT"))
            .newValues(Json.of("status", "CURRENT"))
            .build());
    }
}
```

**Why Not an Aggregate**:
- Audit entries never change after creation (immutable)
- No business rules to enforce
- Pure historical record
- Already captured in event store - this is just a queryable projection

---

### ❌ 7. **form_versions** - NO UUID COLUMN NEEDED

**Current Status**: Version tracking for forms
```sql
CREATE TABLE form_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_id BIGINT NOT NULL,
    version VARCHAR(20) NOT NULL,
    ...
)
```

**Decision**: ❌ **NO aggregate_uuid column needed**

**Reasoning**:
- **Child entity** within `FormDefinitionAggregate` (if it exists)
- OR part of `StudyDesignAggregate` domain
- Form versioning is typically managed by the parent form aggregate
- No independent lifecycle - versions are immutable snapshots

**Current DDD Pattern**: Part of StudyDesignAggregate
```java
// In StudyDesignAggregate or FormAggregate
@CommandHandler
public void handle(CreateFormVersionCommand command) {
    // Validate form exists
    // Validate version number sequence
    AggregateLifecycle.apply(new FormVersionCreatedEvent(
        studyDesignId,
        command.getFormId(),
        command.getVersionNumber(),
        command.getCreatedBy()
    ));
}
```

**Alternative**: If forms have complex versioning logic, consider FormAggregate
```java
@Aggregate
public class FormAggregate {
    @AggregateIdentifier
    private UUID formId;
    
    private List<FormVersion> versions = new ArrayList<>();
    private String currentVersion;
    
    // Then form_definitions.aggregate_uuid would be needed
    // And form_versions would remain a child entity table
}
```

But based on current implementation with `StudyDesignAggregate`, forms are managed there.

---

### ❌ 8. **study_validation_rules** - NO UUID COLUMN NEEDED

**Current Status**: Validation rule definitions
```sql
CREATE TABLE study_validation_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    form_definition_id BIGINT,
    rule_name VARCHAR(255) NOT NULL,
    rule_type ENUM('REQUIRED', 'RANGE', ...) NOT NULL,
    ...
)
```

**Decision**: ❌ **NO aggregate_uuid column needed**

**Reasoning**:
- **Configuration/reference data**, not a domain aggregate
- Validation rules are typically part of form design
- Should be managed via `StudyDesignAggregate` or form management
- No complex lifecycle or state transitions
- Rules are activated/deactivated, not versioned as aggregates

**DDD Pattern**: Value Object or Entity within StudyDesignAggregate
```java
// In StudyDesignAggregate
@CommandHandler
public void handle(AddValidationRuleCommand command) {
    // Validate rule syntax
    // Validate form exists
    AggregateLifecycle.apply(new ValidationRuleAddedEvent(
        studyDesignId,
        command.getFormId(),
        command.getRuleName(),
        command.getRuleExpression(),
        command.getCreatedBy()
    ));
}

@CommandHandler
public void handle(UpdateValidationRuleCommand command) {
    // Validate rule exists
    // Validate new expression syntax
    AggregateLifecycle.apply(new ValidationRuleUpdatedEvent(
        studyDesignId,
        command.getRuleId(),
        command.getNewExpression(),
        command.getUpdatedBy()
    ));
}
```

**Projection**: study_validation_rules table is updated from events
```java
@EventHandler
public void on(ValidationRuleAddedEvent event) {
    validationRuleRepository.save(new StudyValidationRuleEntity(
        event.getStudyDesignId(),
        event.getFormId(),
        event.getRuleName(),
        event.getRuleExpression()
    ));
}
```

**Why Not an Aggregate**:
- Validation rules don't have independent lifecycle
- They're configuration for form behavior
- Changes are simple updates, not complex state transitions
- Part of form/study design domain

---

## Summary Table

| Table | UUID Column Needed? | Reasoning | DDD Pattern |
|-------|---------------------|-----------|-------------|
| **study_versions** | ❌ NO | Already an aggregate root (ProtocolVersionAggregate) using id as UUID | Aggregate Root |
| **study_amendments** | ❌ NO | Child entity of ProtocolVersionAggregate | Entity within Aggregate |
| **study_design_progress** | ❌ NO | Read model for tracking progress | Query Model (CQRS) |
| **organization_studies** | ❌ NO | Association table between aggregates | Association Table |
| **study_documents** | ✅ YES | Complex lifecycle, regulatory compliance | **Aggregate Root** |
| **study_document_audit** | ❌ NO | Audit trail projection from document events | Event Projection |
| **form_versions** | ❌ NO | Child entity of form/design aggregate | Entity within Aggregate |
| **study_validation_rules** | ❌ NO | Configuration data managed via design aggregate | Value Object/Configuration |

---

## Recommended Actions

### ✅ **Action 1: Add UUID to study_documents**

```sql
-- Add aggregate_uuid column
ALTER TABLE study_documents 
ADD COLUMN aggregate_uuid VARCHAR(36) NOT NULL UNIQUE 
COMMENT 'UUID for StudyDocumentAggregate in event store'
AFTER id;

-- Create index
CREATE INDEX idx_study_documents_aggregate_uuid 
ON study_documents(aggregate_uuid);

-- Backfill existing documents with UUIDs
UPDATE study_documents 
SET aggregate_uuid = UUID() 
WHERE aggregate_uuid IS NULL;
```

### 📝 **Action 2: Create StudyDocumentAggregate**

Create DDD aggregate for document management:
- `StudyDocumentAggregate.java`
- Commands: Upload, Download, Approve, Supersede, Archive, Delete
- Events: Uploaded, Downloaded, Approved, Superseded, Archived, Deleted
- Query model: study_documents table (projection)
- Audit trail: study_document_audit table (projection)

### 🔄 **Action 3: Update Projections**

Ensure these tables are updated via event handlers:
- `study_design_progress` ← StudyDesignAggregate events
- `study_document_audit` ← StudyDocumentAggregate events
- `study_validation_rules` ← StudyDesignAggregate events
- `form_versions` ← StudyDesignAggregate events

### ⚠️ **Action 4: Consider Protocol Version UUID**

`study_versions` uses BIGINT as aggregate ID. Consider:
- Migration to UUID as primary key (breaking change)
- OR keep current pattern (BIGINT works fine)
- Ensure Axon configuration maps correctly

Current pattern in ProtocolVersionAggregate:
```java
@AggregateIdentifier
private UUID versionId;  // Maps to study_versions.id (stored as BIGINT)
```

This works because MySQL can store UUIDs as BINARY(16) or use BIGINT generated from UUID.

---

## DDD Principles Applied

### **Aggregate Root Criteria**

A table needs `aggregate_uuid` if:
1. ✅ Has independent lifecycle and business rules
2. ✅ Can be modified via commands (not just updates)
3. ✅ Has complex state transitions requiring validation
4. ✅ Needs regulatory audit trail
5. ✅ Changes affect other parts of the system

### **Entity within Aggregate Criteria**

A table does NOT need `aggregate_uuid` if:
1. ❌ Lifecycle tied to parent aggregate (cascade delete)
2. ❌ No independent business logic
3. ❌ Always accessed through parent aggregate
4. ❌ Simple CRUD operations

### **Query Model Criteria**

A table does NOT need `aggregate_uuid` if:
1. ❌ Pure read model (no commands)
2. ❌ Populated from event projections
3. ❌ Used for queries and reporting only
4. ❌ No business rules to enforce

---

## Next Steps

1. **Immediate**: Add UUID to `study_documents` table
2. **Short-term**: Implement `StudyDocumentAggregate` with CQRS
3. **Medium-term**: Create projections for progress tracking tables
4. **Long-term**: Consider additional aggregates for complex domains:
   - FormAggregate (if form versioning becomes complex)
   - ValidationRuleAggregate (if rules become more sophisticated)

---

## Questions for Discussion

1. **Document Management**: Do you want full event sourcing for documents with e-signatures?
2. **Form Versioning**: Is current approach sufficient, or do forms need separate aggregate?
3. **Validation Rules**: Should rules be versioned with protocols or managed separately?
4. **Organization Management**: Should organizations have their own service/aggregate?

---

**Last Updated**: October 4, 2025  
**Status**: Analysis Complete  
**Recommendation**: Add UUID to study_documents only
