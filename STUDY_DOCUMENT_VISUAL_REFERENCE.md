# Study Document Aggregate - Quick Visual Reference

```
═══════════════════════════════════════════════════════════════
                DOCUMENT LIFECYCLE FLOW
═══════════════════════════════════════════════════════════════

    Upload Command
         │
         ▼
    ┌─────────┐
    │  DRAFT  │ ◄─── Can edit, delete, update metadata
    └─────────┘
         │
         │ Approve Command
         │ (with e-signature if critical)
         ▼
    ┌─────────┐
    │ CURRENT │ ◄─── Active, immutable, in use
    └─────────┘
         │
    ┌────┴─────┬───────────────┐
    │          │               │
    │ Supersede│            Archive
    ▼          │               ▼
┌────────────┐ │         ┌──────────┐
│ SUPERSEDED │ │         │ ARCHIVED │
└────────────┘ │         └──────────┘
    │          │               │
    └──────────┴───────────────┘
               │
            Archive
               ▼
         (Terminal State)


═══════════════════════════════════════════════════════════════
                    COMMAND → EVENT → STATE
═══════════════════════════════════════════════════════════════

Commands (7):                Events (7):                State Changes:
─────────────                ─────────────              ──────────────
Upload                  →    Uploaded          →        status = DRAFT
Download                →    Downloaded        →        (no state change - audit only)
Approve                 →    Approved          →        status = CURRENT
Supersede               →    Superseded        →        status = SUPERSEDED
Archive                 →    Archived          →        status = ARCHIVED
Delete                  →    Deleted           →        isDeleted = true
UpdateMetadata          →    MetadataUpdated   →        name/description/version updated


═══════════════════════════════════════════════════════════════
                    FILES CREATED (16 total)
═══════════════════════════════════════════════════════════════

📁 document/
   ├── 📁 aggregate/
   │   └── ✅ StudyDocumentAggregate.java (500 lines)
   │
   ├── 📁 command/
   │   ├── ✅ UploadStudyDocumentCommand.java
   │   ├── ✅ DownloadStudyDocumentCommand.java
   │   ├── ✅ ApproveStudyDocumentCommand.java
   │   ├── ✅ SupersedeStudyDocumentCommand.java
   │   ├── ✅ ArchiveStudyDocumentCommand.java
   │   ├── ✅ DeleteStudyDocumentCommand.java
   │   └── ✅ UpdateStudyDocumentMetadataCommand.java
   │
   ├── 📁 event/
   │   ├── ✅ StudyDocumentUploadedEvent.java
   │   ├── ✅ StudyDocumentDownloadedEvent.java
   │   ├── ✅ StudyDocumentApprovedEvent.java
   │   ├── ✅ StudyDocumentSupersededEvent.java
   │   ├── ✅ StudyDocumentArchivedEvent.java
   │   ├── ✅ StudyDocumentDeletedEvent.java
   │   └── ✅ StudyDocumentMetadataUpdatedEvent.java
   │
   └── 📁 valueobject/
       ├── ✅ DocumentStatus.java (4 statuses + transitions)
       └── ✅ DocumentType.java (13 types + rules)


═══════════════════════════════════════════════════════════════
                BUSINESS RULES MATRIX
═══════════════════════════════════════════════════════════════

Status:      │ DRAFT │ CURRENT │ SUPERSEDED │ ARCHIVED │
─────────────┼───────┼─────────┼────────────┼──────────┤
Edit         │  ✅   │   ❌    │     ❌     │    ❌    │
Delete       │  ✅   │   ❌    │     ❌     │    ❌    │
Approve      │  ✅   │   ❌    │     ❌     │    ❌    │
Download     │  ✅   │   ✅    │     ✅     │    ✅    │
Supersede    │  ❌   │   ✅    │     ❌     │    ❌    │
Archive      │  ✅   │   ✅    │     ✅     │    ❌    │


═══════════════════════════════════════════════════════════════
             DOCUMENT TYPES & REQUIREMENTS
═══════════════════════════════════════════════════════════════

Type                  │ Requires    │ Requires      │ Critical
                      │ Approval    │ E-Signature   │
──────────────────────┼─────────────┼───────────────┼─────────
PROTOCOL              │     ✅      │      ✅       │    ✅
ICF                   │     ✅      │      ✅       │    ✅
IB                    │     ✅      │      ❌       │    ✅
REGULATORY            │     ✅      │      ✅       │    ✅
AMENDMENT             │     ✅      │      ✅       │    ✅
SAP                   │     ✅      │      ❌       │    ✅
REPORT                │     ✅      │      ❌       │    ✅
CRF                   │     ❌      │      ❌       │    ❌
MANUAL                │     ❌      │      ❌       │    ❌
MONITORING_PLAN       │     ❌      │      ❌       │    ❌
LAB_MANUAL            │     ❌      │      ❌       │    ❌
SITE_DOCUMENT         │     ❌      │      ❌       │    ❌
OTHER                 │     ❌      │      ❌       │    ❌


═══════════════════════════════════════════════════════════════
                REGULATORY COMPLIANCE (21 CFR Part 11)
═══════════════════════════════════════════════════════════════

✅ Audit Trail:
   ├─ Who: User ID in every command
   ├─ What: Event type (Uploaded, Approved, etc.)
   ├─ When: Instant timestamp
   ├─ Where: IP address + user agent
   └─ Why: Reason fields

✅ E-Signature:
   ├─ Required for critical documents
   ├─ Stored in ApprovedEvent
   ├─ Format: "UserID/Timestamp"
   └─ Validated before approval

✅ Immutability:
   ├─ Events never change (event sourcing)
   ├─ CURRENT docs cannot be edited
   └─ State rebuilt from event history

✅ Access Tracking:
   ├─ Every download recorded
   └─ DownloadedEvent with full context


═══════════════════════════════════════════════════════════════
                    EXAMPLE USAGE
═══════════════════════════════════════════════════════════════

// 1. Upload new document
UUID docId = UUID.randomUUID();
commandGateway.send(UploadStudyDocumentCommand.builder()
    .documentId(docId)
    .studyAggregateUuid(studyId)
    .documentName("Protocol v2.0")
    .documentType(DocumentType.PROTOCOL)
    .fileName("protocol_v2.pdf")
    .filePath("/storage/protocols/study123/v2.pdf")
    .fileSize(2048576L)
    .uploadedBy("john.doe@example.com")
    .build());

// → StudyDocumentUploadedEvent
// → Projection updates study_documents table
// → Status: DRAFT


// 2. Approve document
commandGateway.send(ApproveStudyDocumentCommand.builder()
    .documentId(docId)
    .approvedBy("jane.pi@example.com")
    .approvalComments("Protocol reviewed and approved")
    .electronicSignature("JANE_PI/2025-10-04T15:30:00Z")
    .approvalRole("PI")
    .build());

// → StudyDocumentApprovedEvent
// → Projection updates status to CURRENT
// → Document now immutable


// 3. Download document (audit trail)
commandGateway.send(DownloadStudyDocumentCommand.builder()
    .documentId(docId)
    .downloadedBy("crc.user@example.com")
    .ipAddress("192.168.1.100")
    .userAgent("Chrome/120.0.0")
    .reason("Review for data entry")
    .build());

// → StudyDocumentDownloadedEvent
// → Projection updates study_document_audit
// → No state change (audit only)


// 4. Supersede with new version
UUID newDocId = UUID.randomUUID();
// ... upload and approve new document ...

commandGateway.send(SupersedeStudyDocumentCommand.builder()
    .documentId(docId)  // Old document
    .newDocumentId(newDocId)  // New document
    .supersededBy("jane.pi@example.com")
    .supersessionReason("Protocol amendment approved")
    .build());

// → StudyDocumentSupersededEvent
// → Old document status: SUPERSEDED
// → New document status: CURRENT


═══════════════════════════════════════════════════════════════
                    VALIDATION EXAMPLES
═══════════════════════════════════════════════════════════════

❌ Cannot approve without e-signature (PROTOCOL):
   ApproveStudyDocumentCommand (electronicSignature = null)
   → IllegalArgumentException: "Electronic signature required"

❌ Cannot delete CURRENT document:
   DeleteStudyDocumentCommand (document.status = CURRENT)
   → IllegalStateException: "Only DRAFT documents can be deleted"

❌ Cannot supersede DRAFT document:
   SupersedeStudyDocumentCommand (document.status = DRAFT)
   → IllegalStateException: "Only CURRENT documents can be superseded"

❌ Cannot edit CURRENT document:
   UpdateStudyDocumentMetadataCommand (document.status = CURRENT)
   → IllegalStateException: "Only DRAFT documents can be updated"

✅ Can archive from any status (except ARCHIVED):
   ArchiveStudyDocumentCommand (document.status = CURRENT)
   → StudyDocumentArchivedEvent (status → ARCHIVED)


═══════════════════════════════════════════════════════════════
                    NEXT STEPS
═══════════════════════════════════════════════════════════════

📋 Step 4: Create Projections
   ├─ StudyDocumentProjection (updates study_documents table)
   └─ StudyDocumentAuditProjection (updates study_document_audit table)

📋 Step 5: Create Services
   ├─ StudyDocumentCommandService (send commands)
   └─ StudyDocumentQueryService (query projections)

📋 Step 6: Create REST API
   ├─ POST /api/documents/upload
   ├─ GET  /api/documents/{uuid}
   ├─ POST /api/documents/{uuid}/approve
   ├─ POST /api/documents/{uuid}/download
   ├─ POST /api/documents/{uuid}/supersede
   ├─ POST /api/documents/{uuid}/archive
   ├─ DELETE /api/documents/{uuid}
   └─ PATCH /api/documents/{uuid}/metadata

📋 Step 7: Create Tests
   ├─ Unit tests for aggregate
   ├─ Integration tests for full flow
   └─ API tests for endpoints


═══════════════════════════════════════════════════════════════
                    METRICS
═══════════════════════════════════════════════════════════════

Files Created:       16 files
Lines of Code:       ~1,800 lines
Commands:            7 (all lifecycle operations)
Events:              7 (complete audit trail)
Value Objects:       2 (status + type)
Business Rules:      15+ validations
Status Transitions:  6 valid paths
Document Types:      13 types

Implementation:      50% complete
   ✅ Database schema
   ✅ Value objects
   ✅ Commands
   ✅ Events
   ✅ Aggregate
   📋 Projections
   📋 Services
   📋 REST API
   📋 Tests


═══════════════════════════════════════════════════════════════
