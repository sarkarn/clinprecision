# UUID Column Requirements - Quick Reference

**Date**: October 4, 2025

---

## Quick Answer

Out of 8 tables analyzed, only **1 table needs a UUID column**:

### ✅ **Needs UUID Column:**
- **study_documents** - Document management with complex lifecycle and regulatory requirements

### ❌ **Do NOT Need UUID Column:**
- **study_versions** - Already an aggregate root using ID as identifier
- **study_amendments** - Child entity of ProtocolVersionAggregate
- **study_design_progress** - Query model/projection table
- **organization_studies** - Association table between aggregates
- **study_document_audit** - Audit projection from document events
- **form_versions** - Child entity within StudyDesignAggregate
- **study_validation_rules** - Configuration data managed via events

---

## Detailed Analysis

### **study_documents** ✅ ADD UUID

**Why**: 
- Complex lifecycle (DRAFT → CURRENT → SUPERSEDED → ARCHIVED)
- Regulatory compliance requirements (21 CFR Part 11)
- Needs complete audit trail
- E-signature workflows
- Version control with approval process

**Schema Change**:
```sql
ALTER TABLE study_documents 
ADD COLUMN aggregate_uuid VARCHAR(36) NOT NULL UNIQUE 
COMMENT 'UUID for StudyDocumentAggregate in event store'
AFTER id;

CREATE INDEX idx_study_documents_aggregate_uuid ON study_documents(aggregate_uuid);
```

**Implementation Needed**:
- Create `StudyDocumentAggregate`
- Commands: Upload, Download, Approve, Supersede, Archive
- Events: DocumentUploaded, DocumentApproved, DocumentSuperseded, etc.
- Projection: Update study_documents table from events

---

## Why Others Don't Need UUID

### **study_versions** - Already an Aggregate
- `ProtocolVersionAggregate` exists
- Uses `id` (BIGINT) as aggregate identifier
- Has own lifecycle: DRAFT → UNDER_REVIEW → APPROVED → ACTIVE
- Already implements event sourcing

### **study_amendments** - Child Entity
- Part of `ProtocolVersionAggregate` boundary
- No independent lifecycle
- Managed via version aggregate commands
- CASCADE DELETE with parent version

### **study_design_progress** - Query Model
- Tracking table, not aggregate
- Updated from `StudyDesignAggregate` events
- No business rules or commands
- Pure read model (CQRS query side)

### **organization_studies** - Association Table
- Many-to-many relationship
- No independent logic
- Managed by `StudyAggregate` or `OrganizationAggregate`
- Simple reference data

### **study_document_audit** - Event Projection
- Audit trail from document events
- Immutable historical records
- No commands or business logic
- Already captured in event store

### **form_versions** - Child Entity
- Part of form/study design domain
- No independent lifecycle
- Managed via `StudyDesignAggregate`
- Immutable version snapshots

### **study_validation_rules** - Configuration Data
- Validation rule definitions
- Managed via `StudyDesignAggregate` events
- No complex state transitions
- Reference/configuration table

---

## DDD Decision Matrix

Use this to decide if a table needs UUID:

| Criteria | study_documents | Others |
|----------|----------------|---------|
| Independent lifecycle? | ✅ YES | ❌ NO |
| Complex business rules? | ✅ YES | ❌ NO |
| Command-based changes? | ✅ YES | ❌ NO |
| State transitions? | ✅ YES | ❌ NO |
| Regulatory audit trail? | ✅ YES | ❌ NO |
| **Needs UUID?** | **✅ YES** | **❌ NO** |

---

## Implementation Priority

### **High Priority** (Immediate)
1. ✅ Add UUID column to `study_documents`
2. ✅ Backfill existing documents with UUIDs
3. ✅ Create index on aggregate_uuid

### **Medium Priority** (Next Sprint)
1. 📝 Implement `StudyDocumentAggregate`
2. 📝 Create document management commands/events
3. 📝 Build projection for study_documents table
4. 📝 Build projection for study_document_audit table

### **Low Priority** (Future Enhancement)
1. 🔄 Review if form management needs separate aggregate
2. 🔄 Review if validation rules need more sophisticated handling
3. 🔄 Consider organization service/aggregate implementation

---

## SQL Script - Add UUID to study_documents

```sql
-- Step 1: Add column (nullable initially)
ALTER TABLE study_documents 
ADD COLUMN aggregate_uuid VARCHAR(36) NULL 
COMMENT 'UUID for StudyDocumentAggregate in event store'
AFTER id;

-- Step 2: Backfill existing records
UPDATE study_documents 
SET aggregate_uuid = UUID() 
WHERE aggregate_uuid IS NULL;

-- Step 3: Make column NOT NULL and UNIQUE
ALTER TABLE study_documents 
MODIFY COLUMN aggregate_uuid VARCHAR(36) NOT NULL UNIQUE;

-- Step 4: Create index for performance
CREATE INDEX idx_study_documents_aggregate_uuid 
ON study_documents(aggregate_uuid);

-- Step 5: Verify
SELECT 
    COUNT(*) as total_documents,
    COUNT(DISTINCT aggregate_uuid) as unique_uuids,
    MIN(LENGTH(aggregate_uuid)) as min_length,
    MAX(LENGTH(aggregate_uuid)) as max_length
FROM study_documents;
-- Expected: total_documents = unique_uuids, min_length = max_length = 36
```

---

## Verification Queries

### Check Current Schema
```sql
-- Check if aggregate_uuid exists in each table
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_KEY
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'clinprecisiondb'
AND TABLE_NAME IN (
    'study_versions',
    'study_amendments',
    'study_design_progress',
    'organization_studies',
    'study_documents',
    'study_document_audit',
    'form_versions',
    'study_validation_rules'
)
AND COLUMN_NAME LIKE '%uuid%'
ORDER BY TABLE_NAME, ORDINAL_POSITION;
```

### Check Existing Aggregates
```sql
-- Check tables that already have aggregate_uuid
SELECT 
    'studies' as table_name,
    COUNT(*) as total_rows,
    COUNT(aggregate_uuid) as rows_with_uuid,
    COUNT(DISTINCT aggregate_uuid) as unique_uuids
FROM studies

UNION ALL

SELECT 
    'organizations',
    COUNT(*),
    COUNT(aggregate_uuid),
    COUNT(DISTINCT aggregate_uuid)
FROM organizations

UNION ALL

SELECT 
    'sites',
    COUNT(*),
    COUNT(aggregate_uuid),
    COUNT(DISTINCT aggregate_uuid)
FROM sites;
```

---

## Related Documentation

- **Full Analysis**: `TABLE_UUID_COLUMN_ANALYSIS.md`
- **DDD Implementation**: `STUDY_DDD_MIGRATION_PLAN.md`
- **Phase 2 Complete**: `PHASE_2_COMPLETE.md`
- **Database Schema**: `DATABASE_SCHEMA_AND_DEMO_DATA_UPDATES.md`

---

**Summary**: Only `study_documents` needs UUID column for proper aggregate management. All other tables are either child entities, projections, or already aggregates with different identifier strategies.
