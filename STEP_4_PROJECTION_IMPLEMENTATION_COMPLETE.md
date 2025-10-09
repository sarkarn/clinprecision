# Study Document Projection Implementation - Step 4 Complete

## 📋 Overview

Step 4 of the StudyDocument DDD implementation is now complete. We have successfully created the **projection handlers** that update the read models (database tables) from domain events, completing the CQRS pattern.

---

## ✅ What Was Implemented

### 1. **Entity Updates**

#### **StudyDocumentEntity** (Updated)
**File**: `clinprecision-common-lib/src/main/java/com/clinprecision/common/entity/clinops/StudyDocumentEntity.java`

**Added Fields**:
```java
@Column(name = "aggregate_uuid", unique = true, nullable = false, length = 36)
private String aggregateUuid;  // Links to event-sourced aggregate

@Column(name = "approved_by")
private String approvedBy;

@Column(name = "approved_at")
private LocalDateTime approvedAt;

@Column(name = "superseded_by_document_id")
private String supersededByDocumentId;

@Column(name = "archived_by")
private String archivedBy;

@Column(name = "archived_at")
private LocalDateTime archivedAt;

@Column(name = "is_deleted", nullable = false)
private boolean isDeleted = false;
```

**Purpose**: 
- Maps to `study_documents` table
- Stores read model for queries
- Tracks document lifecycle state
- Supports soft deletes

---

#### **StudyDocumentAuditEntity** (New)
**File**: `clinprecision-common-lib/src/main/java/com/clinprecision/common/entity/clinops/StudyDocumentAuditEntity.java`

**Key Fields**:
```java
@Id
private Long id;

@Column(name = "document_id", nullable = false)
private Long documentId;  // Reference to study_documents

@Enumerated(EnumType.STRING)
private ActionType actionType;  // UPLOAD, DOWNLOAD, UPDATE, DELETE, STATUS_CHANGE

@Column(name = "old_values", columnDefinition = "JSON")
private String oldValues;  // Before state

@Column(name = "new_values", columnDefinition = "JSON")
private String newValues;  // After state

private String performedBy;
private LocalDateTime performedAt;
private String ipAddress;
private String userAgent;
private String notes;
```

**Purpose**:
- Maps to `study_document_audit` table
- Stores complete audit trail
- Captures before/after values
- Records user context (IP, user agent)
- Regulatory compliance (21 CFR Part 11)

---

### 2. **Repository Updates**

#### **StudyDocumentRepository** (Updated)
**File**: `clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/repository/StudyDocumentRepository.java`

**Added Method**:
```java
Optional<StudyDocumentEntity> findByAggregateUuid(String aggregateUuid);
```

**Purpose**: Look up document entity by aggregate UUID for projection handlers

---

#### **StudyDocumentAuditRepository** (New)
**File**: `clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/repository/StudyDocumentAuditRepository.java`

**Key Methods**:
```java
List<StudyDocumentAuditEntity> findByDocumentIdOrderByPerformedAtDesc(Long documentId);
List<StudyDocumentAuditEntity> findByDocumentIdAndActionTypeOrderByPerformedAtDesc(Long documentId, ActionType actionType);
List<StudyDocumentAuditEntity> findByActionTypeAndDateRange(ActionType actionType, LocalDateTime start, LocalDateTime end);
List<StudyDocumentAuditEntity> findByPerformedByOrderByPerformedAtDesc(String performedBy);
long countByDocumentId(Long documentId);
void deleteByDocumentId(Long documentId);
```

**Purpose**: Query audit trail for document history

---

### 3. **Projection Handlers**

#### **StudyDocumentProjection** (New)
**File**: `clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/document/projection/StudyDocumentProjection.java`

**Processing Group**: `document-projection` (subscribing/synchronous)

**Event Handlers**:

| Event | Action | Status Change |
|-------|--------|---------------|
| `StudyDocumentUploadedEvent` | Create entity | → DRAFT |
| `StudyDocumentDownloadedEvent` | No change (audit only) | - |
| `StudyDocumentApprovedEvent` | Update status | DRAFT → CURRENT |
| `StudyDocumentSupersededEvent` | Update status | CURRENT → SUPERSEDED |
| `StudyDocumentArchivedEvent` | Update status | * → ARCHIVED |
| `StudyDocumentDeletedEvent` | Set isDeleted=true | - |
| `StudyDocumentMetadataUpdatedEvent` | Update metadata | - |

**Key Features**:
- ✅ Idempotent (checks if entity exists before creating)
- ✅ Transaction management (@Transactional)
- ✅ Comprehensive logging for debugging
- ✅ Error handling with meaningful exceptions
- ✅ Follows established ClinPrecision patterns

**Example Event Handler**:
```java
@EventHandler
@Transactional
public void on(StudyDocumentApprovedEvent event) {
    logger.info("[DOCUMENT_PROJECTION] Processing StudyDocumentApprovedEvent for document: {}", 
                event.getDocumentId());
    
    try {
        StudyDocumentEntity entity = findEntityOrThrow(event.getDocumentId().toString());
        
        entity.setStatus(StudyDocumentEntity.DocumentStatus.CURRENT);
        entity.setApprovedBy(event.getApprovedBy());
        entity.setApprovedAt(event.getApprovedAt().atZone(ZoneId.systemDefault()).toLocalDateTime());
        
        documentRepository.save(entity);
        logger.info("[DOCUMENT_PROJECTION] Document approved and status updated to CURRENT");
        
    } catch (Exception e) {
        logger.error("[DOCUMENT_PROJECTION] Error processing StudyDocumentApprovedEvent: {}", 
                    e.getMessage(), e);
        throw e;
    }
}
```

---

#### **StudyDocumentAuditProjection** (New)
**File**: `clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/document/projection/StudyDocumentAuditProjection.java`

**Processing Group**: `document-audit-projection` (subscribing/synchronous)

**Event Handlers**: All 7 events create audit records

| Event | Action Type | Captures |
|-------|-------------|----------|
| `StudyDocumentUploadedEvent` | UPLOAD | New values (name, type, version, status) |
| `StudyDocumentDownloadedEvent` | DOWNLOAD | Access details, reason |
| `StudyDocumentApprovedEvent` | STATUS_CHANGE | DRAFT → CURRENT, approval details, e-signature |
| `StudyDocumentSupersededEvent` | STATUS_CHANGE | CURRENT → SUPERSEDED, new document ID |
| `StudyDocumentArchivedEvent` | STATUS_CHANGE | → ARCHIVED, retention policy |
| `StudyDocumentDeletedEvent` | DELETE | Soft delete reason |
| `StudyDocumentMetadataUpdatedEvent` | UPDATE | Changed metadata fields |

**Key Features**:
- ✅ Complete audit trail for regulatory compliance
- ✅ Before/after values captured as JSON
- ✅ User context recorded (IP address, user agent)
- ✅ E-signature presence masked for security
- ✅ Detailed notes for each action
- ✅ Uses Jackson ObjectMapper for JSON serialization

**Example Audit Record Creation**:
```java
@EventHandler
@Transactional
public void on(StudyDocumentApprovedEvent event) {
    Long documentId = getDocumentId(event.getDocumentId().toString());
    
    StudyDocumentAuditEntity audit = new StudyDocumentAuditEntity();
    audit.setDocumentId(documentId);
    audit.setActionType(StudyDocumentAuditEntity.ActionType.STATUS_CHANGE);
    audit.setPerformedBy(event.getApprovedBy());
    audit.setPerformedAt(event.getApprovedAt().atZone(ZoneId.systemDefault()).toLocalDateTime());
    audit.setIpAddress(event.getIpAddress());
    audit.setUserAgent(event.getUserAgent());
    
    // Capture old and new values
    Map<String, Object> oldValues = new HashMap<>();
    oldValues.put("status", "DRAFT");
    audit.setOldValues(objectMapper.writeValueAsString(oldValues));
    
    Map<String, Object> newValues = new HashMap<>();
    newValues.put("status", "CURRENT");
    newValues.put("approvedBy", event.getApprovedBy());
    newValues.put("approvalRole", event.getApprovalRole());
    if (event.getElectronicSignature() != null) {
        newValues.put("electronicSignature", "***SIGNATURE_PRESENT***");
    }
    audit.setNewValues(objectMapper.writeValueAsString(newValues));
    
    String notes = "Document approved" + 
                  (event.getApprovalComments() != null ? ": " + event.getApprovalComments() : "");
    audit.setNotes(notes);
    
    auditRepository.save(audit);
}
```

---

## 📊 Architecture Overview

### **CQRS Pattern Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Command Side                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  REST API → Command → CommandHandler (Aggregate)                │
│                            ↓                                     │
│                        Apply Event                               │
│                            ↓                                     │
│                    Event Store (Axon)                            │
│                            ↓                                     │
└─────────────────────────────────────────────────────────────────┘
                             ↓
                      Event Published
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                         Query Side                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  StudyDocumentProjection                                  │  │
│  │  - Processing Group: document-projection                  │  │
│  │  - Updates: study_documents table                         │  │
│  │  - 7 Event Handlers                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│                   study_documents table                          │
│                   (Read Model for Queries)                       │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  StudyDocumentAuditProjection                             │  │
│  │  - Processing Group: document-audit-projection            │  │
│  │  - Updates: study_document_audit table                    │  │
│  │  - 7 Event Handlers                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            ↓                                     │
│                 study_document_audit table                       │
│                 (Audit Trail for Compliance)                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Event Flow Example: Document Approval

```
1. User clicks "Approve" button in UI
   ↓
2. Frontend sends POST /api/documents/{id}/approve
   ↓
3. Controller receives request
   ↓
4. Command Service creates ApproveStudyDocumentCommand
   ↓
5. Axon routes command to StudyDocumentAggregate
   ↓
6. Aggregate validates:
   - Document status is DRAFT
   - E-signature present for critical docs
   ↓
7. Aggregate applies StudyDocumentApprovedEvent
   ↓
8. Event stored in Axon Event Store
   ↓
9. Event published to event handlers
   ↓
10. StudyDocumentProjection receives event
    - Finds document by aggregate_uuid
    - Updates status to CURRENT
    - Sets approvedBy and approvedAt
    - Saves to study_documents table
   ↓
11. StudyDocumentAuditProjection receives event
    - Creates audit record
    - Captures old status (DRAFT)
    - Captures new status (CURRENT)
    - Records approval details
    - Saves to study_document_audit table
   ↓
12. Frontend queries GET /api/documents/{id}
    - Reads from study_documents table
    - Returns updated document with CURRENT status
```

---

## 📝 Database Schema Updates

### **study_documents Table** (Updated)

```sql
CREATE TABLE study_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_uuid VARCHAR(36) NOT NULL UNIQUE,  -- ✅ Added
    study_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    version VARCHAR(50) DEFAULT '1.0',
    status ENUM('DRAFT', 'CURRENT', 'SUPERSEDED', 'ARCHIVED') DEFAULT 'CURRENT',
    description TEXT,
    uploaded_by BIGINT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by VARCHAR(255),              -- ✅ Added
    approved_at TIMESTAMP,                 -- ✅ Added
    superseded_by_document_id VARCHAR(36), -- ✅ Added
    archived_by VARCHAR(255),              -- ✅ Added
    archived_at TIMESTAMP,                 -- ✅ Added
    is_deleted BOOLEAN DEFAULT FALSE,      -- ✅ Added
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    INDEX idx_study_documents_aggregate_uuid (aggregate_uuid),
    INDEX idx_study_documents_study_id (study_id)
);
```

### **study_document_audit Table** (Already in schema)

```sql
CREATE TABLE study_document_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    action_type ENUM('UPLOAD', 'DOWNLOAD', 'UPDATE', 'DELETE', 'STATUS_CHANGE') NOT NULL,
    old_values JSON,
    new_values JSON,
    performed_by BIGINT NOT NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    notes TEXT,
    
    FOREIGN KEY (document_id) REFERENCES study_documents(id) ON DELETE CASCADE,
    INDEX idx_document_audit_document_id (document_id),
    INDEX idx_document_audit_performed_at (performed_at)
);
```

---

## 🎯 Key Design Decisions

### 1. **Separate Projection Handlers**
- **Why**: Separation of concerns - document state vs audit trail
- **Benefit**: Can scale independently, different processing groups
- **Pattern**: Follows established ClinPrecision architecture

### 2. **Synchronous Processing Groups**
- **Why**: Immediate consistency for read models
- **Benefit**: Users see changes immediately after commands
- **Trade-off**: Slightly slower command processing vs eventual consistency

### 3. **Idempotent Event Handlers**
- **Why**: Events can be replayed or reprocessed
- **Implementation**: Check if entity exists before creating
- **Benefit**: Safe to replay events, no duplicate records

### 4. **JSON for Audit Values**
- **Why**: Flexible schema for capturing changes
- **Benefit**: Can add new fields without schema migration
- **Tool**: Jackson ObjectMapper for serialization

### 5. **Soft Deletes**
- **Why**: Regulatory compliance requires audit trail
- **Implementation**: `is_deleted` flag instead of DELETE
- **Benefit**: Complete history preserved

---

## 🧪 Testing Strategy

### **Unit Tests** (To be created in Step 7)

```java
@Test
public void testDocumentUploadedEventCreatesEntity() {
    // Given
    StudyDocumentUploadedEvent event = createUploadEvent();
    
    // When
    projection.on(event);
    
    // Then
    Optional<StudyDocumentEntity> entity = repository.findByAggregateUuid(event.getDocumentId().toString());
    assertThat(entity).isPresent();
    assertThat(entity.get().getStatus()).isEqualTo(DocumentStatus.DRAFT);
}

@Test
public void testDocumentApprovedEventUpdatesStatus() {
    // Given
    createExistingDocument();
    StudyDocumentApprovedEvent event = createApprovalEvent();
    
    // When
    projection.on(event);
    
    // Then
    Optional<StudyDocumentEntity> entity = repository.findByAggregateUuid(event.getDocumentId().toString());
    assertThat(entity.get().getStatus()).isEqualTo(DocumentStatus.CURRENT);
    assertThat(entity.get().getApprovedBy()).isEqualTo(event.getApprovedBy());
}
```

### **Integration Tests** (To be created in Step 7)

```java
@Test
public void testCompleteDocumentLifecycle() {
    // Upload → Approve → Supersede → Archive
    
    // 1. Upload document
    UUID docId = commandGateway.sendAndWait(uploadCommand);
    
    // Verify entity created
    StudyDocumentEntity entity = findByUuid(docId);
    assertThat(entity.getStatus()).isEqualTo(DocumentStatus.DRAFT);
    
    // Verify audit record
    List<StudyDocumentAuditEntity> audits = auditRepository.findByDocumentId(entity.getId());
    assertThat(audits).hasSize(1);
    assertThat(audits.get(0).getActionType()).isEqualTo(ActionType.UPLOAD);
    
    // 2. Approve document
    commandGateway.sendAndWait(approveCommand);
    
    // Verify status updated
    entity = findByUuid(docId);
    assertThat(entity.getStatus()).isEqualTo(DocumentStatus.CURRENT);
    
    // Verify audit record
    audits = auditRepository.findByDocumentId(entity.getId());
    assertThat(audits).hasSize(2);
    assertThat(audits.get(0).getActionType()).isEqualTo(ActionType.STATUS_CHANGE);
    
    // ... continue for supersede and archive
}
```

---

## 📈 Metrics and Monitoring

### **Logging Tags** (for log aggregation)
- `[DOCUMENT_PROJECTION]` - Document state updates
- `[DOCUMENT_AUDIT_PROJECTION]` - Audit trail creation

### **Key Metrics to Monitor**
1. Event processing time (ms)
2. Projection lag (time between event and projection update)
3. Failed event processing count
4. Repository query performance
5. Audit record creation rate

### **Health Checks**
```java
// Check if projection handlers are running
- document-projection processing group active
- document-audit-projection processing group active

// Check if repositories are accessible
- documentRepository.count() > 0
- auditRepository.count() > 0
```

---

## 🚀 Next Steps (Step 5: Services)

### **StudyDocumentCommandService** 📋 PENDING
```java
@Service
public class StudyDocumentCommandService {
    public CompletableFuture<UUID> uploadDocument(UploadDocumentRequest request);
    public CompletableFuture<Void> approveDocument(UUID documentId, ApprovalRequest request);
    public CompletableFuture<Void> supersede Document(UUID documentId, SupersedeRequest request);
    public CompletableFuture<Void> archiveDocument(UUID documentId, ArchiveRequest request);
    public CompletableFuture<Void> deleteDocument(UUID documentId, DeleteRequest request);
    public CompletableFuture<Void> updateMetadata(UUID documentId, MetadataRequest request);
}
```

### **StudyDocumentQueryService** 📋 PENDING
```java
@Service
public class StudyDocumentQueryService {
    public Optional<DocumentDTO> findByUuid(UUID uuid);
    public List<DocumentDTO> findByStudy(Long studyId);
    public List<DocumentDTO> findByStudyAndStatus(Long studyId, DocumentStatus status);
    public List<DocumentDTO> findByStudyAndType(Long studyId, DocumentType type);
    public List<AuditRecordDTO> getAuditTrail(UUID documentId);
    public DocumentStatisticsDTO getStatistics(Long studyId);
}
```

### **REST Controller** 📋 PENDING
```java
@RestController
@RequestMapping("/api/documents")
public class StudyDocumentController {
    @PostMapping("/upload")
    public ResponseEntity<DocumentResponse> uploadDocument(@RequestBody UploadRequest request);
    
    @GetMapping("/{uuid}")
    public ResponseEntity<DocumentDTO> getDocument(@PathVariable UUID uuid);
    
    @PostMapping("/{uuid}/approve")
    public ResponseEntity<Void> approveDocument(@PathVariable UUID uuid, @RequestBody ApprovalRequest request);
    
    @PostMapping("/{uuid}/supersede")
    public ResponseEntity<Void> supersedeDocument(@PathVariable UUID uuid, @RequestBody SupersedeRequest request);
    
    @PostMapping("/{uuid}/archive")
    public ResponseEntity<Void> archiveDocument(@PathVariable UUID uuid, @RequestBody ArchiveRequest request);
    
    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID uuid);
    
    @PutMapping("/{uuid}/metadata")
    public ResponseEntity<Void> updateMetadata(@PathVariable UUID uuid, @RequestBody MetadataRequest request);
    
    @GetMapping("/{uuid}/audit")
    public ResponseEntity<List<AuditRecordDTO>> getAuditTrail(@PathVariable UUID uuid);
}
```

---

## 📚 Files Created/Modified

### **Created** (3 files):
1. ✅ `StudyDocumentAuditEntity.java` - Audit trail entity
2. ✅ `StudyDocumentProjection.java` - Document state projection handler
3. ✅ `StudyDocumentAuditProjection.java` - Audit trail projection handler
4. ✅ `StudyDocumentAuditRepository.java` - Audit repository

### **Modified** (2 files):
1. ✅ `StudyDocumentEntity.java` - Added aggregate_uuid and lifecycle fields
2. ✅ `StudyDocumentRepository.java` - Added findByAggregateUuid method

---

## ✅ Step 4 Completion Checklist

- [x] Update StudyDocumentEntity with aggregate_uuid field
- [x] Add approval, supersession, archival fields to entity
- [x] Add soft delete flag (is_deleted)
- [x] Create StudyDocumentAuditEntity for audit trail
- [x] Create StudyDocumentAuditRepository
- [x] Update StudyDocumentRepository with findByAggregateUuid
- [x] Create StudyDocumentProjection handler (7 event handlers)
- [x] Create StudyDocumentAuditProjection handler (7 event handlers)
- [x] Implement idempotency checks
- [x] Add comprehensive logging
- [x] Add transaction management
- [x] Capture before/after values in audit
- [x] Record user context (IP, user agent)
- [x] Follow established ClinPrecision patterns

---

## 🎉 Summary

**Step 4 is complete!** We have successfully implemented the projection handlers that bridge the command side (aggregates) with the query side (read models). The system now:

✅ Creates document records from upload events  
✅ Updates document status through lifecycle transitions  
✅ Maintains complete audit trail for regulatory compliance  
✅ Captures before/after values for all changes  
✅ Records user context for every action  
✅ Supports soft deletes for data retention  
✅ Follows CQRS pattern with separate processing groups  
✅ Implements idempotent event handlers  
✅ Provides comprehensive logging for debugging  

**Next**: Proceed to **Step 5 - Services** to create command and query services that will be used by the REST API.

---

**Implementation Date**: December 2024  
**Status**: ✅ COMPLETE  
**Next Step**: Step 5 - Create Command and Query Services
