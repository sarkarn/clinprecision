# Step 5 Quick Reference - Document Services

## Service Layer Structure

```
document/
├── dto/
│   ├── UploadDocumentRequest.java      (Request - Upload)
│   ├── ApprovalRequest.java            (Request - Approve)
│   ├── SupersedeRequest.java           (Request - Supersede)
│   ├── ArchiveRequest.java             (Request - Archive)
│   ├── DeleteRequest.java              (Request - Delete)
│   ├── MetadataUpdateRequest.java      (Request - Update)
│   ├── DocumentDTO.java                (Response - Document)
│   ├── DocumentResponse.java           (Response - Operation result)
│   ├── AuditRecordDTO.java             (Response - Audit record)
│   └── DocumentStatisticsDTO.java      (Response - Statistics)
└── service/
    ├── StudyDocumentCommandService.java  (Write operations)
    └── StudyDocumentQueryService.java    (Read operations)
```

## Command Service API

```java
@Service
@Transactional
public class StudyDocumentCommandService {
    
    // CREATE
    DocumentResponse uploadDocument(UploadDocumentRequest request)
    
    // READ (for audit)
    void downloadDocument(UUID documentId, String downloadedBy, String ipAddress, String userAgent)
    
    // UPDATE
    void approveDocument(UUID documentId, ApprovalRequest request)
    void supersedeDocument(UUID documentId, SupersedeRequest request)
    void archiveDocument(UUID documentId, ArchiveRequest request)
    void updateMetadata(UUID documentId, MetadataUpdateRequest request)
    
    // DELETE (soft)
    void deleteDocument(UUID documentId, DeleteRequest request)
}
```

## Query Service API

```java
@Service
@Transactional(readOnly = true)
public class StudyDocumentQueryService {
    
    // Single document queries
    DocumentDTO findByUuid(UUID uuid)
    Optional<DocumentDTO> findByUuidOptional(UUID uuid)
    DocumentDTO findById(Long id)
    
    // Study-level queries
    List<DocumentDTO> findByStudy(Long studyId)
    List<DocumentDTO> findByStudyAndStatus(Long studyId, String status)
    List<DocumentDTO> findByStudyAndType(Long studyId, String documentType)
    
    // Status-specific queries
    List<DocumentDTO> findCurrentDocuments(Long studyId)
    List<DocumentDTO> findDraftDocuments(Long studyId)
    List<DocumentDTO> findArchivedDocuments(Long studyId)
    
    // Audit queries
    List<AuditRecordDTO> getAuditTrail(UUID documentId)
    List<AuditRecordDTO> getAuditTrailById(Long documentId)
    
    // Statistics
    DocumentStatisticsDTO getStatistics(Long studyId)
}
```

## Document Status Transitions

```
DRAFT ──approve()──> CURRENT ──supersede()──> SUPERSEDED
  │                     │                         │
  └──archive()──> ARCHIVED <──archive()───────────┘
  │                     │                         │
  └──delete()──> [DELETED] <──delete()────────────┘
```

## Usage Examples

### Upload New Document
```java
UploadDocumentRequest request = UploadDocumentRequest.builder()
    .studyAggregateUuid(studyUuid)
    .documentName("Protocol Version 2.0")
    .documentType("PROTOCOL")
    .fileName("protocol_v2.pdf")
    .filePath("/documents/study123/protocol_v2.pdf")
    .fileSize(1024000L)
    .mimeType("application/pdf")
    .version("2.0")
    .uploadedBy("john.doe")
    .build();

DocumentResponse response = commandService.uploadDocument(request);
// Returns: {aggregateUuid: "uuid", databaseId: 123, message: "Document uploaded successfully", status: "DRAFT"}
```

### Approve Document
```java
ApprovalRequest request = ApprovalRequest.builder()
    .approvedBy("jane.smith")
    .approvalComments("Approved for use in study")
    .electronicSignature("****") // Masked in logs
    .approvalRole("Principal Investigator")
    .build();

commandService.approveDocument(documentUuid, request);
// Document transitions from DRAFT to CURRENT
```

### Query Documents
```java
// Get all current documents for a study
List<DocumentDTO> documents = queryService.findCurrentDocuments(studyId);

// Get statistics
DocumentStatisticsDTO stats = queryService.getStatistics(studyId);
// Returns: {totalCount: 25, currentCount: 15, draftCount: 3, supersededCount: 5, archivedCount: 2, ...}

// Get audit trail
List<AuditRecordDTO> audit = queryService.getAuditTrail(documentUuid);
// Returns full history of all actions on the document
```

## Validation Rules

### Upload
- ✅ Study must exist (checked by aggregate)
- ✅ Document name required
- ✅ File path required
- ✅ File size must be positive

### Approve
- ✅ Document must be in DRAFT status
- ✅ Approver username required
- ✅ Approval role required

### Supersede
- ✅ Document must be in CURRENT status
- ✅ New document must exist
- ✅ Superseding user required

### Archive
- ✅ Document must not already be archived
- ✅ Document must not be deleted
- ✅ Archiving user required

### Delete
- ✅ Document must not already be deleted
- ✅ Deletion user required

### Update Metadata
- ✅ Document must not be deleted
- ✅ At least one field must be updated
- ✅ Updating user required

## Error Handling

### Command Service Exceptions
```java
// Document not found
throw new IllegalArgumentException("Document not found: " + uuid);

// Invalid state
throw new IllegalStateException("Only draft documents can be approved. Current status: " + status);

// Projection timeout
throw new RuntimeException("Document projection not found after 30 seconds: " + uuid);
```

### Query Service Exceptions
```java
// Document not found
throw new IllegalArgumentException("Document not found: " + uuid);

// Invalid status
throw new IllegalArgumentException("Invalid document status: " + status);
```

## Audit Trail

All operations create audit records with:
- Action type (UPLOADED, APPROVED, SUPERSEDED, ARCHIVED, DELETED, METADATA_UPDATED, DOWNLOADED)
- Before values (JSON)
- After values (JSON)
- User who performed action
- Timestamp
- IP address
- User agent
- Optional notes

## Performance Considerations

### Command Service
- Waits up to 30 seconds for projection after upload (polls every 100ms)
- Other commands are async (return immediately after sending to event bus)
- Validation queries are optimized (indexed by aggregate_uuid)

### Query Service
- All queries use read-only transactions
- Repository methods use JPA derived queries (optimized)
- Statistics calculated in memory (consider caching for large datasets)
- File size formatting done in Java (no database overhead)

## Testing Strategy

### Unit Tests
- Command service: Mock CommandGateway and Repository
- Query service: Mock Repositories
- Test all validation rules
- Test all state transitions

### Integration Tests
- Use @SpringBootTest with embedded event store
- Test full command → event → projection → query flow
- Test concurrent operations
- Test projection consistency

## Next: Step 6 - REST Controller

```java
@RestController
@RequestMapping("/api/v1/documents")
public class StudyDocumentController {
    private final StudyDocumentCommandService commandService;
    private final StudyDocumentQueryService queryService;
    
    // Map HTTP requests to service methods
    // Add validation, error handling, security
}
```

---
**Status**: Step 5 Complete ✅  
**Ready for**: Step 6 (REST Controller)
