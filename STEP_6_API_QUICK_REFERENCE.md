# Step 6 Quick Reference - REST API Endpoints

## Base URL
```
/api/v1/documents
```

## Endpoint Summary

### Commands (Write Operations)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/upload` | Upload new document |
| POST | `/{uuid}/download` | Track download |
| POST | `/{uuid}/approve` | Approve document |
| POST | `/{uuid}/supersede` | Supersede with new version |
| POST | `/{uuid}/archive` | Archive document |
| DELETE | `/{uuid}` | Delete document (soft) |
| PUT | `/{uuid}/metadata` | Update metadata |

### Queries (Read Operations)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/{uuid}` | Get by UUID |
| GET | `/id/{id}` | Get by database ID |
| GET | `/study/{studyId}` | List all for study |
| GET | `/study/{studyId}/status/{status}` | Filter by status |
| GET | `/study/{studyId}/type/{type}` | Filter by type |
| GET | `/study/{studyId}/current` | Current only |
| GET | `/study/{studyId}/draft` | Draft only |
| GET | `/study/{studyId}/archived` | Archived only |
| GET | `/{uuid}/audit` | Audit trail |
| GET | `/study/{studyId}/statistics` | Statistics |
| GET | `/health` | Health check |

## Request/Response Examples

### 1. Upload Document
```bash
curl -X POST http://localhost:8080/api/v1/documents/upload \
  -H "Content-Type: application/json" \
  -d '{
    "studyAggregateUuid": "550e8400-e29b-41d4-a716-446655440000",
    "documentName": "Protocol v2.0",
    "documentType": "PROTOCOL",
    "fileName": "protocol.pdf",
    "filePath": "/docs/protocol.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "version": "2.0",
    "uploadedBy": "john.doe"
  }'

# Response (201)
{
  "aggregateUuid": "660e8400-e29b-41d4-a716-446655440001",
  "databaseId": 123,
  "message": "Document uploaded successfully",
  "status": "DRAFT"
}
```

### 2. Approve Document
```bash
curl -X POST http://localhost:8080/api/v1/documents/{uuid}/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approvedBy": "jane.smith",
    "approvalComments": "Approved",
    "approvalRole": "Principal Investigator"
  }'

# Response (200)
{
  "status": "success",
  "message": "Document approved successfully"
}
```

### 3. Get Document
```bash
curl http://localhost:8080/api/v1/documents/{uuid}

# Response (200)
{
  "id": 123,
  "aggregateUuid": "660e8400-e29b-41d4-a716-446655440001",
  "studyId": 456,
  "documentName": "Protocol v2.0",
  "status": "CURRENT",
  "fileSize": 1024000,
  "formattedFileSize": "1.00 MB",
  ...
}
```

### 4. Get Study Documents
```bash
curl http://localhost:8080/api/v1/documents/study/456

# Response (200)
[
  { "id": 123, "documentName": "Protocol v2.0", "status": "CURRENT", ... },
  { "id": 124, "documentName": "ICF v1.0", "status": "DRAFT", ... },
  ...
]
```

### 5. Get Statistics
```bash
curl http://localhost:8080/api/v1/documents/study/456/statistics

# Response (200)
{
  "studyId": 456,
  "totalCount": 25,
  "currentCount": 15,
  "draftCount": 3,
  "supersededCount": 5,
  "archivedCount": 2,
  "totalFileSize": 52428800,
  "formattedTotalSize": "50.00 MB"
}
```

### 6. Get Audit Trail
```bash
curl http://localhost:8080/api/v1/documents/{uuid}/audit

# Response (200)
[
  {
    "actionType": "APPROVED",
    "performedBy": "jane.smith",
    "performedAt": "2025-10-04T11:00:00",
    ...
  },
  {
    "actionType": "UPLOADED",
    "performedBy": "john.doe",
    "performedAt": "2025-10-04T10:30:00",
    ...
  }
]
```

## Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful operation |
| 201 | Created | Document uploaded |
| 400 | Bad Request | Invalid data or state |
| 404 | Not Found | Document doesn't exist |
| 500 | Server Error | Unexpected error |

## Document Types

```
PROTOCOL
ICF (Informed Consent Form)
IB (Investigator Brochure)
CRF (Case Report Form)
SAE (Serious Adverse Event)
AMENDMENT
APPROVAL_LETTER
ETHICS_APPROVAL
OTHER
```

## Document Status

```
DRAFT → CURRENT → SUPERSEDED
         ↓            ↓
      ARCHIVED ← ARCHIVED
         ↓            ↓
     [DELETED] ← [DELETED]
```

## Error Responses

### 404 Not Found
```json
// Empty response body
```

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Only draft documents can be approved. Current status: CURRENT"
}
```

### 500 Server Error
```json
{
  "timestamp": "2025-10-04T12:00:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Failed to process request",
  "path": "/api/v1/documents/upload"
}
```

## Request DTOs

### UploadDocumentRequest
```java
{
  "studyAggregateUuid": UUID (required),
  "documentName": String (required),
  "documentType": String (required),
  "fileName": String (required),
  "filePath": String (required),
  "fileSize": Long (required, > 0),
  "mimeType": String,
  "version": String,
  "description": String,
  "uploadedBy": String (required),
  "ipAddress": String,
  "userAgent": String
}
```

### ApprovalRequest
```java
{
  "approvedBy": String (required),
  "approvalComments": String,
  "electronicSignature": String,
  "approvalRole": String (required),
  "ipAddress": String,
  "userAgent": String
}
```

### SupersedeRequest
```java
{
  "newDocumentId": UUID (required),
  "supersededBy": String (required),
  "supersessionReason": String,
  "ipAddress": String,
  "userAgent": String
}
```

### ArchiveRequest
```java
{
  "archivedBy": String (required),
  "archivalReason": String,
  "retentionPolicy": String,
  "ipAddress": String,
  "userAgent": String
}
```

### DeleteRequest
```java
{
  "deletedBy": String (required),
  "deletionReason": String,
  "ipAddress": String,
  "userAgent": String
}
```

### MetadataUpdateRequest
```java
{
  "newDocumentName": String,
  "newDescription": String,
  "newVersion": String,
  "updatedBy": String (required),
  "updateReason": String,
  "ipAddress": String,
  "userAgent": String
}
```

## Response DTOs

### DocumentResponse
```java
{
  "aggregateUuid": String,
  "databaseId": Long,
  "message": String,
  "status": String
}
```

### DocumentDTO
```java
{
  "id": Long,
  "aggregateUuid": String,
  "studyId": Long,
  "documentName": String,
  "documentType": String,
  "fileName": String,
  "filePath": String,
  "fileSize": Long,
  "formattedFileSize": String,
  "mimeType": String,
  "version": String,
  "status": String,
  "description": String,
  "uploadedBy": Long,
  "uploadedByUsername": String,
  "uploadedAt": LocalDateTime,
  "approvedBy": String,
  "approvedAt": LocalDateTime,
  "supersededByDocumentId": String,
  "archivedBy": String,
  "archivedAt": LocalDateTime,
  "isDeleted": Boolean,
  "createdAt": LocalDateTime,
  "updatedAt": LocalDateTime
}
```

### DocumentStatisticsDTO
```java
{
  "studyId": Long,
  "totalCount": long,
  "currentCount": long,
  "draftCount": long,
  "supersededCount": long,
  "archivedCount": long,
  "totalFileSize": Long,
  "formattedTotalSize": String
}
```

### AuditRecordDTO
```java
{
  "id": Long,
  "documentId": Long,
  "actionType": String,
  "oldValues": String (JSON),
  "newValues": String (JSON),
  "performedBy": String,
  "performedAt": LocalDateTime,
  "ipAddress": String,
  "userAgent": String,
  "notes": String
}
```

## Testing with Postman

### Collection Structure
```
Study Documents API
├── Commands
│   ├── Upload Document
│   ├── Approve Document
│   ├── Supersede Document
│   ├── Archive Document
│   ├── Delete Document
│   └── Update Metadata
├── Queries
│   ├── Get by UUID
│   ├── Get by ID
│   ├── List by Study
│   ├── Filter by Status
│   ├── Filter by Type
│   ├── Get Audit Trail
│   └── Get Statistics
└── Health Check
```

### Environment Variables
```
base_url=http://localhost:8080
study_uuid=550e8400-e29b-41d4-a716-446655440000
document_uuid={{uploaded_document_uuid}}
study_id=1
```

## Common Workflows

### 1. New Document Upload Flow
```
1. POST /upload → Get UUID
2. GET /{uuid} → Verify DRAFT status
3. POST /{uuid}/approve → Transition to CURRENT
4. GET /{uuid}/audit → View history
```

### 2. Document Versioning Flow
```
1. POST /upload (new version) → Get new UUID
2. POST /{old_uuid}/supersede → Mark old as SUPERSEDED
3. GET /study/{studyId}/current → Verify only new version is current
```

### 3. Document Lifecycle Management
```
1. GET /study/{studyId} → List all documents
2. GET /study/{studyId}/statistics → View counts
3. POST /{uuid}/archive → Archive old documents
4. DELETE /{uuid} → Soft delete obsolete documents
```

---
**Status**: Step 6 Complete ✅  
**Endpoints**: 19 total (7 commands + 12 queries)  
**Ready for**: Testing and Integration
