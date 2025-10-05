# Table UUID Analysis - Visual Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│         8 TABLES ANALYZED FOR UUID REQUIREMENTS             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ Is it a Table?   │
                  └──────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   ┌─────────┐         ┌─────────┐        ┌─────────┐
   │ Aggregate│        │  Entity  │       │Projection│
   │  Root?   │        │ within   │       │ / Query  │
   │          │        │Aggregate?│       │  Model?  │
   └─────────┘         └─────────┘        └─────────┘
        │                   │                   │
        ▼                   ▼                   ▼


═══════════════════════════════════════════════════════════════
                      ANALYSIS RESULTS
═══════════════════════════════════════════════════════════════


┌─────────────────────────────────────────────────────────────┐
│ ✅ AGGREGATE ROOTS (Need UUID)                              │
└─────────────────────────────────────────────────────────────┘

  ✅ study_documents
     │
     ├─ Has independent lifecycle? ✓
     ├─ Complex state transitions? ✓
     ├─ Regulatory audit needed? ✓
     ├─ Command-based changes? ✓
     └─ Affects other systems? ✓
     
     Decision: ADD aggregate_uuid
     Aggregate: StudyDocumentAggregate
     Identifier: UUID documentId


┌─────────────────────────────────────────────────────────────┐
│ ❌ ALREADY AGGREGATE ROOTS (Different ID Strategy)         │
└─────────────────────────────────────────────────────────────┘

  ❌ study_versions
     │
     ├─ Aggregate: ProtocolVersionAggregate ✓
     ├─ Uses BIGINT id as identifier ✓
     ├─ Has full event sourcing ✓
     └─ No change needed ✓
     
     Decision: NO aggregate_uuid needed
     Reason: Already uses 'id' field


┌─────────────────────────────────────────────────────────────┐
│ ❌ CHILD ENTITIES (Managed by Parent Aggregate)            │
└─────────────────────────────────────────────────────────────┘

  ❌ study_amendments
     │
     ├─ Parent: ProtocolVersionAggregate
     ├─ Lifecycle: Tied to version (CASCADE DELETE)
     ├─ Access: Always through parent
     └─ Changes: Via parent commands/events
     
     Decision: NO aggregate_uuid needed
     Pattern: Entity within aggregate boundary


  ❌ form_versions
     │
     ├─ Parent: StudyDesignAggregate / FormAggregate
     ├─ Lifecycle: Tied to form definition
     ├─ Access: Through parent aggregate
     └─ Immutable: Version snapshots
     
     Decision: NO aggregate_uuid needed
     Pattern: Child entity


┌─────────────────────────────────────────────────────────────┐
│ ❌ QUERY MODELS / PROJECTIONS (CQRS Read Side)             │
└─────────────────────────────────────────────────────────────┘

  ❌ study_design_progress
     │
     ├─ Updated from: StudyDesignAggregate events
     ├─ Purpose: Track design phase completion
     ├─ Commands: None (read-only)
     └─ Business rules: None
     
     Decision: NO aggregate_uuid needed
     Pattern: Read model projection


  ❌ study_document_audit
     │
     ├─ Updated from: StudyDocumentAggregate events
     ├─ Purpose: Audit trail for documents
     ├─ Immutable: Historical records only
     └─ Already in event store
     
     Decision: NO aggregate_uuid needed
     Pattern: Audit projection


┌─────────────────────────────────────────────────────────────┐
│ ❌ ASSOCIATION TABLES (Many-to-Many Relationships)         │
└─────────────────────────────────────────────────────────────┘

  ❌ organization_studies
     │
     ├─ Links: organizations ↔ studies
     ├─ Managed by: StudyAggregate & OrganizationAggregate
     ├─ Lifecycle: Tied to both parents
     └─ Business logic: None
     
     Decision: NO aggregate_uuid needed
     Pattern: Association table


┌─────────────────────────────────────────────────────────────┐
│ ❌ CONFIGURATION TABLES (Reference Data)                    │
└─────────────────────────────────────────────────────────────┘

  ❌ study_validation_rules
     │
     ├─ Managed by: StudyDesignAggregate
     ├─ Purpose: Form validation configuration
     ├─ Changes: Via design aggregate events
     └─ Lifecycle: Simple activate/deactivate
     
     Decision: NO aggregate_uuid needed
     Pattern: Configuration / Reference data


═══════════════════════════════════════════════════════════════
                    DECISION MATRIX
═══════════════════════════════════════════════════════════════

Table                    │ Aggregate│ Entity │Projection│ UUID?
─────────────────────────┼──────────┼────────┼──────────┼──────
study_documents          │    ✓     │        │          │  ✅
study_versions           │    ✓*    │        │          │  ❌*
study_amendments         │          │   ✓    │          │  ❌
study_design_progress    │          │        │    ✓     │  ❌
organization_studies     │          │   ✓**  │          │  ❌
study_document_audit     │          │        │    ✓     │  ❌
form_versions            │          │   ✓    │          │  ❌
study_validation_rules   │          │   ✓    │          │  ❌

* Already aggregate, uses 'id' field instead of 'aggregate_uuid'
** Association table, not a traditional entity


═══════════════════════════════════════════════════════════════
                  IMPLEMENTATION FLOW
═══════════════════════════════════════════════════════════════

Current State:
┌──────────────┐
│ studies      │──┐
│ + uuid       │  │
└──────────────┘  │
                  │
┌──────────────┐  │
│ study_docs   │◄─┘
│ - uuid       │  (No UUID - needs fixing)
└──────────────┘


After Migration:
┌──────────────┐
│ studies      │──┐
│ + uuid       │  │
└──────────────┘  │
                  │
┌──────────────┐  │
│ study_docs   │◄─┘
│ + uuid       │  ✅ (UUID added)
└──────────────┘


Implementation:
┌─────────────────────────────────────────────┐
│ 1. Run Migration                            │
│    V1_1_0__Add_Study_Documents_...sql       │
│    • Add aggregate_uuid column              │
│    • Backfill with UUIDs                    │
│    • Create index                           │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 2. Create Aggregate                         │
│    StudyDocumentAggregate.java              │
│    • @AggregateIdentifier UUID documentId   │
│    • Command handlers                       │
│    • Event sourcing handlers                │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 3. Create Commands & Events                 │
│    • UploadStudyDocumentCommand             │
│    • ApproveStudyDocumentCommand            │
│    • StudyDocumentUploadedEvent             │
│    • StudyDocumentApprovedEvent             │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 4. Create Projections                       │
│    StudyDocumentProjection                  │
│    • Updates study_documents table          │
│    StudyDocumentAuditProjection             │
│    • Updates study_document_audit table     │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ 5. Create Services & Controllers            │
│    • StudyDocumentCommandService            │
│    • StudyDocumentQueryService              │
│    • REST API endpoints                     │
└─────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════
                  AGGREGATE HIERARCHY
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                     StudyAggregate                          │
│                     (Root - UUID)                           │
└─────────────────────────────────────────────────────────────┘
     │
     ├─ OrganizationStudies (Association)
     │
     ├─── ProtocolVersionAggregate ◄───┐
     │    (Separate Root - BIGINT id)   │
     │                                  │
     │    └─ Amendments (Entities) ────┘
     │
     ├─── StudyDesignAggregate ◄───────┐
     │    (Separate Root - UUID)        │
     │                                  │
     │    ├─ Arms (Entities)            │
     │    ├─ Visits (Entities)          │
     │    ├─ Forms (Entities)           │
     │    ├─ FormVersions (Entities) ───┘
     │    └─ ValidationRules (Config)
     │
     └─── StudyDocumentAggregate ◄─────┐  ✅ NEW!
          (Separate Root - UUID)        │
                                        │
          └─ DocumentAudit (Projection)─┘


═══════════════════════════════════════════════════════════════
               REGULATORY COMPLIANCE VIEW
═══════════════════════════════════════════════════════════════

FDA 21 CFR Part 11 Requirements:

┌──────────────────┐
│ StudyAggregate   │  ✅ Event Sourcing = Audit Trail
│ + UUID           │  ✅ Immutable Events
└──────────────────┘  ✅ E-Signatures via Events

┌──────────────────┐
│ StudyDocument    │  ✅ Event Sourcing = Audit Trail
│ + UUID (NEW!)    │  ✅ Immutable Events
└──────────────────┘  ✅ E-Signatures via Events
                      ✅ Version Control
                      ✅ Status Transitions
                      ✅ Approval Workflows

┌──────────────────┐
│ DocumentAudit    │  ✅ Complete History
│ (Projection)     │  ✅ Who, What, When, Why
└──────────────────┘  ✅ Queryable for Inspections


═══════════════════════════════════════════════════════════════
                      FINAL SUMMARY
═══════════════════════════════════════════════════════════════

                    ┌───────────┐
                    │ 8 Tables  │
                    │ Analyzed  │
                    └───────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         ┌────▼────┐           ┌───▼────┐
         │ 1 Table │           │7 Tables│
         │ Needs   │           │  Do    │
         │  UUID   │           │  Not   │
         └────┬────┘           └───┬────┘
              │                    │
       ┌──────▼──────┐    ┌────────▼────────┐
       │study_        │    │• study_versions │
       │documents     │    │• study_amendments│
       │             │    │• design_progress│
       │✅ Complex    │    │• org_studies    │
       │✅ Lifecycle  │    │• doc_audit      │
       │✅ Regulatory │    │• form_versions  │
       │✅ Governance │    │• validation_rules│
       └─────────────┘    └─────────────────┘


═══════════════════════════════════════════════════════════════

📊 SCORE: 1/8 tables need UUID (12.5%)
✅ STATUS: Analysis Complete
🚀 NEXT: Run migration for study_documents

═══════════════════════════════════════════════════════════════
