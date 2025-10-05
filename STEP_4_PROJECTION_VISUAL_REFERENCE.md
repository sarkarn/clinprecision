# Study Document Projection - Visual Reference

## 📊 Quick Overview

```
┌─────────────────────────────────────────────────────────┐
│              STEP 4: PROJECTIONS                        │
│                                                         │
│  ✅ StudyDocumentEntity (Updated)                       │
│  ✅ StudyDocumentAuditEntity (New)                      │
│  ✅ StudyDocumentProjection (7 event handlers)          │
│  ✅ StudyDocumentAuditProjection (7 event handlers)     │
│  ✅ Repositories (Updated/New)                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Event Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         AGGREGATE                                     │
│                  (Command Side - Write)                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Command → StudyDocumentAggregate → Apply Event                     │
│                                          ↓                            │
│                                    Event Store                        │
│                                          ↓                            │
│                                    Publish Event                      │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
                                   ↓
                        ┌──────────┴──────────┐
                        ↓                     ↓
┌────────────────────────────────┐  ┌────────────────────────────────┐
│   StudyDocumentProjection      │  │  StudyDocumentAuditProjection  │
│   (document-projection)        │  │  (document-audit-projection)   │
├────────────────────────────────┤  ├────────────────────────────────┤
│                                │  │                                │
│  Updates document state        │  │  Creates audit records         │
│  - Status transitions          │  │  - Before/after values         │
│  - Metadata changes            │  │  - User context                │
│  - Soft deletes                │  │  - Action details              │
│                                │  │                                │
│        ↓                       │  │        ↓                       │
│  study_documents table         │  │  study_document_audit table    │
│  (Read Model)                  │  │  (Audit Trail)                 │
│                                │  │                                │
└────────────────────────────────┘  └────────────────────────────────┘
```

---

## 📋 Event Handler Matrix

| Event | StudyDocumentProjection | StudyDocumentAuditProjection |
|-------|------------------------|------------------------------|
| **StudyDocumentUploadedEvent** | ✅ Create entity (DRAFT) | ✅ Record UPLOAD action |
| **StudyDocumentDownloadedEvent** | ⚪ No change | ✅ Record DOWNLOAD action |
| **StudyDocumentApprovedEvent** | ✅ Update to CURRENT | ✅ Record STATUS_CHANGE |
| **StudyDocumentSupersededEvent** | ✅ Update to SUPERSEDED | ✅ Record STATUS_CHANGE |
| **StudyDocumentArchivedEvent** | ✅ Update to ARCHIVED | ✅ Record STATUS_CHANGE |
| **StudyDocumentDeletedEvent** | ✅ Set isDeleted=true | ✅ Record DELETE action |
| **StudyDocumentMetadataUpdatedEvent** | ✅ Update metadata | ✅ Record UPDATE action |

---

## 🗃️ Database Schema

### study_documents (Read Model)

```sql
┌─────────────────────────────────────────────────────────────┐
│ study_documents                                             │
├─────────────────────────────────────────────────────────────┤
│ id                      BIGINT PK AUTO_INCREMENT            │
│ aggregate_uuid          VARCHAR(36) UNIQUE NOT NULL ⭐ NEW  │
│ study_id                BIGINT NOT NULL                     │
│ name                    VARCHAR(255) NOT NULL               │
│ document_type           VARCHAR(50) NOT NULL                │
│ file_name               VARCHAR(255) NOT NULL               │
│ file_path               VARCHAR(500) NOT NULL               │
│ file_size               BIGINT NOT NULL                     │
│ mime_type               VARCHAR(100)                        │
│ version                 VARCHAR(50) DEFAULT '1.0'           │
│ status                  ENUM('DRAFT','CURRENT',             │
│                              'SUPERSEDED','ARCHIVED')       │
│ description             TEXT                                │
│ uploaded_by             BIGINT NOT NULL                     │
│ uploaded_at             TIMESTAMP NOT NULL                  │
│ approved_by             VARCHAR(255) ⭐ NEW                 │
│ approved_at             TIMESTAMP ⭐ NEW                    │
│ superseded_by_document_id VARCHAR(36) ⭐ NEW               │
│ archived_by             VARCHAR(255) ⭐ NEW                 │
│ archived_at             TIMESTAMP ⭐ NEW                    │
│ is_deleted              BOOLEAN DEFAULT FALSE ⭐ NEW        │
│ created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP │
│ updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP │
│                                   ON UPDATE CURRENT_TIMESTAMP│
└─────────────────────────────────────────────────────────────┘
```

### study_document_audit (Audit Trail)

```sql
┌─────────────────────────────────────────────────────────────┐
│ study_document_audit                                        │
├─────────────────────────────────────────────────────────────┤
│ id                      BIGINT PK AUTO_INCREMENT            │
│ document_id             BIGINT NOT NULL FK → study_documents│
│ action_type             ENUM('UPLOAD','DOWNLOAD','UPDATE',  │
│                              'DELETE','STATUS_CHANGE')      │
│ old_values              JSON                                │
│ new_values              JSON                                │
│ performed_by            VARCHAR(255) NOT NULL               │
│ performed_at            TIMESTAMP NOT NULL                  │
│ ip_address              VARCHAR(45)                         │
│ user_agent              TEXT                                │
│ notes                   TEXT                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Projection Handler Details

### StudyDocumentProjection

```java
@Component
@ProcessingGroup("document-projection")
@Transactional
public class StudyDocumentProjection {
    
    @EventHandler
    @Transactional
    public void on(StudyDocumentUploadedEvent event) {
        // Create new entity
        // Set status to DRAFT
        // Set uploaded details
    }
    
    @EventHandler
    @Transactional
    public void on(StudyDocumentApprovedEvent event) {
        // Find entity by aggregate_uuid
        // Update status to CURRENT
        // Set approved_by and approved_at
    }
    
    // ... 5 more event handlers
}
```

**Key Methods**:
- `findEntityOrThrow(String aggregateUuid)` - Lookup helper with error handling

**Features**:
- ✅ Idempotent (checks if entity exists)
- ✅ Transactional
- ✅ Comprehensive logging
- ✅ Error handling

---

### StudyDocumentAuditProjection

```java
@Component
@ProcessingGroup("document-audit-projection")
@Transactional
public class StudyDocumentAuditProjection {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @EventHandler
    @Transactional
    public void on(StudyDocumentUploadedEvent event) {
        // Create audit record
        // Capture new values as JSON
        // Record user context
    }
    
    @EventHandler
    @Transactional
    public void on(StudyDocumentApprovedEvent event) {
        // Create audit record
        // Capture old values (DRAFT)
        // Capture new values (CURRENT + approval details)
        // Mask e-signature for security
    }
    
    // ... 5 more event handlers
}
```

**Key Methods**:
- `getDocumentId(String aggregateUuid)` - Maps UUID to database ID

**Features**:
- ✅ JSON serialization of values
- ✅ Before/after tracking
- ✅ User context capture
- ✅ Security (masks e-signatures)

---

## 📊 Audit Record Examples

### Upload Event
```json
{
  "documentId": 123,
  "actionType": "UPLOAD",
  "performedBy": "john.doe",
  "performedAt": "2024-12-10T10:30:00",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "oldValues": null,
  "newValues": {
    "documentName": "Study Protocol v1.0",
    "documentType": "PROTOCOL",
    "fileName": "protocol.pdf",
    "fileSize": 2048576,
    "version": "1.0",
    "status": "DRAFT"
  },
  "notes": "Document uploaded: Study Protocol v1.0"
}
```

### Approval Event
```json
{
  "documentId": 123,
  "actionType": "STATUS_CHANGE",
  "performedBy": "jane.smith",
  "performedAt": "2024-12-10T14:45:00",
  "ipAddress": "192.168.1.101",
  "userAgent": "Mozilla/5.0...",
  "oldValues": {
    "status": "DRAFT"
  },
  "newValues": {
    "status": "CURRENT",
    "approvedBy": "jane.smith",
    "approvalRole": "Principal Investigator",
    "electronicSignature": "***SIGNATURE_PRESENT***"
  },
  "notes": "Document approved: Reviewed and approved for use"
}
```

### Download Event
```json
{
  "documentId": 123,
  "actionType": "DOWNLOAD",
  "performedBy": "bob.jones",
  "performedAt": "2024-12-10T15:20:00",
  "ipAddress": "192.168.1.102",
  "userAgent": "Mozilla/5.0...",
  "oldValues": null,
  "newValues": null,
  "notes": "Document accessed for site training"
}
```

---

## 🔍 Repository Methods

### StudyDocumentRepository

```java
// ⭐ NEW - Find by aggregate UUID
Optional<StudyDocumentEntity> findByAggregateUuid(String aggregateUuid);

// Existing methods
List<StudyDocumentEntity> findByStudyIdOrderByUploadedAtDesc(Long studyId);
List<StudyDocumentEntity> findByStudyIdAndStatusOrderByUploadedAtDesc(Long studyId, DocumentStatus status);
Optional<StudyDocumentEntity> findByIdAndStudyId(Long documentId, Long studyId);
```

### StudyDocumentAuditRepository (New)

```java
// Find all audit records for a document
List<StudyDocumentAuditEntity> findByDocumentIdOrderByPerformedAtDesc(Long documentId);

// Find by action type
List<StudyDocumentAuditEntity> findByDocumentIdAndActionTypeOrderByPerformedAtDesc(
    Long documentId, ActionType actionType);

// Find by user
List<StudyDocumentAuditEntity> findByPerformedByOrderByPerformedAtDesc(String performedBy);

// Date range queries
List<StudyDocumentAuditEntity> findByActionTypeAndDateRange(
    ActionType actionType, LocalDateTime start, LocalDateTime end);

// Statistics
long countByDocumentId(Long documentId);
```

---

## 🚀 Usage Examples

### Query Document with Audit Trail

```java
// Get document
Optional<StudyDocumentEntity> doc = documentRepository.findByAggregateUuid(uuid);

if (doc.isPresent()) {
    StudyDocumentEntity document = doc.get();
    
    // Get audit trail
    List<StudyDocumentAuditEntity> audits = 
        auditRepository.findByDocumentIdOrderByPerformedAtDesc(document.getId());
    
    System.out.println("Document: " + document.getName());
    System.out.println("Status: " + document.getStatus());
    System.out.println("Audit records: " + audits.size());
    
    // Print audit trail
    for (StudyDocumentAuditEntity audit : audits) {
        System.out.println(audit.getPerformedAt() + " - " + 
                          audit.getActionType() + " by " + 
                          audit.getPerformedBy());
    }
}
```

### Get Document Statistics

```java
Long studyId = 123L;

// Total documents
long total = documentRepository.countByStudyId(studyId);

// By status
long current = documentRepository.countByStudyIdAndStatus(studyId, DocumentStatus.CURRENT);
long draft = documentRepository.countByStudyIdAndStatus(studyId, DocumentStatus.DRAFT);
long archived = documentRepository.countByStudyIdAndStatus(studyId, DocumentStatus.ARCHIVED);

// Total file size
Long totalSize = documentRepository.getTotalFileSizeByStudyId(studyId);

System.out.println("Total: " + total);
System.out.println("Current: " + current);
System.out.println("Draft: " + draft);
System.out.println("Archived: " + archived);
System.out.println("Total size: " + totalSize + " bytes");
```

---

## ✅ Implementation Checklist

- [x] **Entities**
  - [x] Update StudyDocumentEntity with aggregate_uuid
  - [x] Add lifecycle fields (approved_by, archived_by, etc.)
  - [x] Add is_deleted flag
  - [x] Create StudyDocumentAuditEntity

- [x] **Repositories**
  - [x] Add findByAggregateUuid to StudyDocumentRepository
  - [x] Create StudyDocumentAuditRepository with query methods

- [x] **Projections**
  - [x] Create StudyDocumentProjection (7 event handlers)
  - [x] Create StudyDocumentAuditProjection (7 event handlers)
  - [x] Implement idempotency checks
  - [x] Add transaction management
  - [x] Add comprehensive logging

- [x] **Audit Trail**
  - [x] Capture before/after values
  - [x] Record user context (IP, user agent)
  - [x] JSON serialization for values
  - [x] Security (mask e-signatures)

---

## 📝 Next Steps

### Step 5: Services (PENDING)

```
1. Create StudyDocumentCommandService
   - uploadDocument()
   - approveDocument()
   - supersedeDocument()
   - archiveDocument()
   - deleteDocument()
   - updateMetadata()

2. Create StudyDocumentQueryService
   - findByUuid()
   - findByStudy()
   - findByStudyAndStatus()
   - findByStudyAndType()
   - getAuditTrail()
   - getStatistics()

3. Create DTOs and Mappers
   - DocumentDTO
   - AuditRecordDTO
   - Request/Response classes
```

---

## 🎉 Step 4 Complete!

All projection handlers are now implemented and ready to process events!

**Files Created**: 3  
**Files Modified**: 2  
**Total Event Handlers**: 14 (7 per projection)  
**Compilation Status**: ✅ No errors  
**Ready for**: Step 5 - Services
