# Study DDD API Quick Reference

**Version**: Phase 2 Implementation  
**Base URL**: `http://localhost:8080/api/studies`

## Endpoint Summary

| Method | Path | Purpose | Status |
|--------|------|---------|--------|
| POST | `/ddd` | Create study | ✅ Ready |
| GET | `/uuid/{uuid}` | Get study by UUID | ✅ Ready |
| GET | `/ddd` | List all studies | ✅ Ready |
| PUT | `/uuid/{uuid}` | Update study | ✅ Ready |
| POST | `/uuid/{uuid}/suspend` | Suspend study | ✅ Ready |
| POST | `/uuid/{uuid}/terminate` | Terminate study | ✅ Ready |
| POST | `/uuid/{uuid}/withdraw` | Withdraw study | ✅ Ready |
| POST | `/uuid/{uuid}/complete` | Complete study | ✅ Ready |

---

## 1. Create Study

**Endpoint**: `POST /api/studies/ddd`

**Request Body**:
```json
{
  "name": "Phase III Clinical Trial",
  "organizationId": 123,
  "protocolNumber": "PROTO-2025-001",
  "sponsor": "Pharma Corp",
  "description": "Study of new hypertension treatment",
  "objective": "Evaluate efficacy and safety",
  "studyStatusId": 1,
  "regulatoryStatusId": 2,
  "studyPhaseId": 3,
  "startDate": "2025-01-01",
  "endDate": "2026-12-31",
  "plannedStartDate": "2025-01-15",
  "plannedEndDate": "2026-11-30",
  "studyType": "INTERVENTIONAL",
  "indication": "Hypertension",
  "therapeuticArea": "Cardiovascular",
  "principalInvestigator": "Dr. Jane Smith",
  "targetEnrollment": 500,
  "targetSites": 25,
  "version": "1.0",
  "blinding": "DOUBLE_BLIND",
  "randomization": "STRATIFIED",
  "controlType": "PLACEBO"
}
```

**Response**: `201 Created`
```json
{
  "studyAggregateUuid": "550e8400-e29b-41d4-a716-446655440000",
  "id": 456,
  "name": "Phase III Clinical Trial",
  "protocolNumber": "PROTO-2025-001",
  "sponsor": "Pharma Corp",
  "description": "Study of new hypertension treatment",
  "organizationId": 123,
  "organizationName": "Research Org",
  "targetEnrollment": 500,
  "targetSites": 25,
  "phase": "Phase III",
  "studyType": "INTERVENTIONAL",
  "therapeuticArea": "Cardiovascular",
  "principalInvestigator": "Dr. Jane Smith",
  "status": "PLANNING",
  "createdAt": "2025-10-04T10:30:00",
  "createdBy": "user123"
}
```

**cURL**:
```bash
curl -X POST http://localhost:8080/api/studies/ddd \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Phase III Clinical Trial",
    "organizationId": 123,
    "indication": "Hypertension",
    "studyType": "INTERVENTIONAL",
    "targetEnrollment": 500
  }'
```

---

## 2. Get Study by UUID

**Endpoint**: `GET /api/studies/uuid/{uuid}`

**Response**: `200 OK`
```json
{
  "studyAggregateUuid": "550e8400-e29b-41d4-a716-446655440000",
  "id": 456,
  "name": "Phase III Clinical Trial",
  "protocolNumber": "PROTO-2025-001",
  "sponsor": "Pharma Corp",
  "description": "Study of new hypertension treatment",
  "organizationId": 123,
  "organizationName": "Research Org",
  "targetEnrollment": 500,
  "targetSites": 25,
  "phase": "Phase III",
  "studyType": "INTERVENTIONAL",
  "therapeuticArea": "Cardiovascular",
  "regulatoryStatus": "Approved",
  "principalInvestigator": "Dr. Jane Smith",
  "status": "ACTIVE",
  "createdAt": "2025-10-04T10:30:00",
  "createdBy": "user123",
  "updatedAt": "2025-10-04T14:20:00",
  "updatedBy": "user456"
}
```

**cURL**:
```bash
curl -X GET http://localhost:8080/api/studies/uuid/550e8400-e29b-41d4-a716-446655440000
```

**Error Response**: `404 Not Found`
```json
{
  "timestamp": "2025-10-04T15:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Study not found with UUID: 550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 3. List All Studies

**Endpoint**: `GET /api/studies/ddd`

**Response**: `200 OK`
```json
[
  {
    "studyAggregateUuid": "550e8400-e29b-41d4-a716-446655440000",
    "id": 456,
    "name": "Phase III Clinical Trial",
    "protocolNumber": "PROTO-2025-001",
    "sponsor": "Pharma Corp",
    "organizationId": 123,
    "organizationName": "Research Org",
    "plannedStartDate": "2025-01-01",
    "actualStartDate": "2025-01-15",
    "targetEnrollment": 500,
    "currentEnrollment": 123,
    "phase": "Phase III",
    "studyType": "INTERVENTIONAL",
    "status": "ACTIVE"
  },
  {
    "studyAggregateUuid": "660e8400-e29b-41d4-a716-446655440001",
    "id": 457,
    "name": "Phase II Safety Study",
    "protocolNumber": "PROTO-2025-002",
    "sponsor": "BioTech Inc",
    "organizationId": 124,
    "organizationName": "Clinical Research Center",
    "plannedStartDate": "2025-03-01",
    "actualStartDate": null,
    "targetEnrollment": 200,
    "currentEnrollment": 0,
    "phase": "Phase II",
    "studyType": "OBSERVATIONAL",
    "status": "PLANNING"
  }
]
```

**cURL**:
```bash
curl -X GET http://localhost:8080/api/studies/ddd
```

---

## 4. Update Study

**Endpoint**: `PUT /api/studies/uuid/{uuid}`

**Request Body** (Partial Update - only include fields to update):
```json
{
  "description": "Updated study description",
  "targetEnrollment": 600,
  "therapeuticArea": "Cardiovascular/Renal",
  "principalInvestigator": "Dr. John Doe"
}
```

**Response**: `200 OK`
```json
{
  "studyAggregateUuid": "550e8400-e29b-41d4-a716-446655440000",
  "id": 456,
  "name": "Phase III Clinical Trial",
  "description": "Updated study description",
  "targetEnrollment": 600,
  "therapeuticArea": "Cardiovascular/Renal",
  "principalInvestigator": "Dr. John Doe",
  "updatedAt": "2025-10-04T16:30:00",
  "updatedBy": "user789"
}
```

**cURL**:
```bash
curl -X PUT http://localhost:8080/api/studies/uuid/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated study description",
    "targetEnrollment": 600
  }'
```

**Business Rules**:
- ❌ Cannot update study in terminal states (COMPLETED, TERMINATED, WITHDRAWN)
- ❌ Cannot update study status directly (use status transition endpoints)
- ✅ Only non-null fields in request are updated (partial update)

---

## 5. Suspend Study

**Endpoint**: `POST /api/studies/uuid/{uuid}/suspend`

**Request Body**:
```json
{
  "reason": "Regulatory review required - FDA audit scheduled"
}
```

**Response**: `204 No Content`

**cURL**:
```bash
curl -X POST http://localhost:8080/api/studies/uuid/550e8400-e29b-41d4-a716-446655440000/suspend \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Regulatory review required"
  }'
```

**Business Rules**:
- ✅ Study must be in ACTIVE status
- ✅ Reason is required (validation)
- ✅ Can be reactivated later (not terminal)

**Error Response**: `400 Bad Request`
```json
{
  "timestamp": "2025-10-04T15:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Cannot suspend study - study is not in ACTIVE status"
}
```

---

## 6. Terminate Study

**Endpoint**: `POST /api/studies/uuid/{uuid}/terminate`

**Request Body**:
```json
{
  "reason": "Safety concerns identified during interim analysis"
}
```

**Response**: `204 No Content`

**cURL**:
```bash
curl -X POST http://localhost:8080/api/studies/uuid/550e8400-e29b-41d4-a716-446655440000/terminate \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Safety concerns identified"
  }'
```

**Business Rules**:
- ⚠️ **TERMINAL STATE** - Study cannot be modified after termination
- ✅ Reason is required (validation)
- ✅ Study must be in ACTIVE or SUSPENDED status
- ❌ Cannot be undone

---

## 7. Withdraw Study

**Endpoint**: `POST /api/studies/uuid/{uuid}/withdraw`

**Request Body**:
```json
{
  "reason": "Funding withdrawn by sponsor"
}
```

**Response**: `204 No Content`

**cURL**:
```bash
curl -X POST http://localhost:8080/api/studies/uuid/550e8400-e29b-41d4-a716-446655440000/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Funding withdrawn by sponsor"
  }'
```

**Business Rules**:
- ⚠️ **TERMINAL STATE** - Study cannot be modified after withdrawal
- ✅ Reason is required (validation)
- ✅ Can be executed from any non-terminal status
- ❌ Cannot be undone

---

## 8. Complete Study

**Endpoint**: `POST /api/studies/uuid/{uuid}/complete`

**Request Body**: None

**Response**: `204 No Content`

**cURL**:
```bash
curl -X POST http://localhost:8080/api/studies/uuid/550e8400-e29b-41d4-a716-446655440000/complete
```

**Business Rules**:
- ✅ Study must be in ACTIVE status
- ✅ Marks successful completion
- ✅ No reason required (successful end)
- ✅ Terminal state (cannot be modified after)

---

## Status Transition Rules

```
PLANNING
   ↓
PROTOCOL_DEVELOPMENT
   ↓
UNDER_REVIEW
   ↓
APPROVED
   ↓
ACTIVE ←─────┐
   ↓         │
   ├─→ SUSPENDED ─┘
   ├─→ COMPLETED (terminal)
   ├─→ TERMINATED (terminal)
   └─→ WITHDRAWN (terminal)
```

**Valid Transitions**:
- PLANNING → PROTOCOL_DEVELOPMENT, WITHDRAWN
- PROTOCOL_DEVELOPMENT → UNDER_REVIEW, WITHDRAWN
- UNDER_REVIEW → APPROVED, PROTOCOL_DEVELOPMENT, WITHDRAWN
- APPROVED → ACTIVE, WITHDRAWN
- ACTIVE → SUSPENDED, COMPLETED, TERMINATED
- SUSPENDED → ACTIVE, TERMINATED

**Terminal States** (no further transitions):
- COMPLETED
- TERMINATED
- WITHDRAWN

---

## Error Responses

### Validation Errors

**Response**: `400 Bad Request`
```json
{
  "timestamp": "2025-10-04T15:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Study name is required"
    },
    {
      "field": "organizationId",
      "message": "Organization is required"
    }
  ]
}
```

### Business Rule Violations

**Response**: `400 Bad Request`
```json
{
  "timestamp": "2025-10-04T15:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Cannot modify study - study is in terminal state"
}
```

### Not Found

**Response**: `404 Not Found`
```json
{
  "timestamp": "2025-10-04T15:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Study not found with UUID: 550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Testing with Postman

### Environment Variables
```json
{
  "base_url": "http://localhost:8080",
  "study_uuid": "{{created_study_uuid}}"
}
```

### Collection Order
1. Create Study → Save `studyAggregateUuid` to variable
2. Get Study by UUID → Use saved UUID
3. Update Study → Use saved UUID
4. Suspend Study → Use saved UUID
5. Get Study → Verify status = SUSPENDED

---

## Integration with Frontend

### React/TypeScript Example

```typescript
// Create study
const createStudy = async (studyData: StudyCreateRequest) => {
  const response = await fetch('http://localhost:8080/api/studies/ddd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studyData)
  });
  
  if (!response.ok) throw new Error('Failed to create study');
  
  const study: StudyResponse = await response.json();
  return study.studyAggregateUuid; // Use UUID for further operations
};

// Get study
const getStudy = async (uuid: string) => {
  const response = await fetch(`http://localhost:8080/api/studies/uuid/${uuid}`);
  
  if (!response.ok) {
    if (response.status === 404) throw new Error('Study not found');
    throw new Error('Failed to fetch study');
  }
  
  return await response.json();
};

// Update study
const updateStudy = async (uuid: string, updates: Partial<StudyUpdateRequest>) => {
  const response = await fetch(`http://localhost:8080/api/studies/uuid/${uuid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) throw new Error('Failed to update study');
  
  return await response.json();
};

// Suspend study
const suspendStudy = async (uuid: string, reason: string) => {
  const response = await fetch(`http://localhost:8080/api/studies/uuid/${uuid}/suspend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  
  if (!response.ok) throw new Error('Failed to suspend study');
};
```

---

## Migration Path

### Phase 1: Parallel Running (Current)
- ✅ Legacy endpoints: `/api/studies` and `/api/studies/{id}`
- ✅ DDD endpoints: `/api/studies/ddd` and `/api/studies/uuid/{uuid}`
- Frontend can use both simultaneously

### Phase 2: Gradual Migration
- New features use DDD endpoints only
- Existing features gradually migrate to UUID-based routing
- Both ID and UUID available in responses (bridge pattern)

### Phase 3: Legacy Deprecation
- Mark legacy endpoints as `@Deprecated`
- Add deprecation warnings to responses
- Monitor usage metrics

### Phase 4: Legacy Removal
- Remove legacy endpoints
- Remove legacy DTOs
- Full DDD/CQRS architecture

---

## Event Sourcing Benefits

### Audit Trail
Every study change creates an immutable event:
- StudyCreatedEvent
- StudyUpdatedEvent
- StudySuspendedEvent
- StudyTerminatedEvent
- StudyWithdrawnEvent
- StudyCompletedEvent

### Time Travel
Replay events to reconstruct study state at any point:
```java
List<DomainEventMessage<?>> events = eventStore.readEvents(studyUuid);
// Replay events to rebuild aggregate state
```

### Event Store Query (Axon Server)
```
http://localhost:8024
→ Event Store
→ Search by Aggregate ID: 550e8400-e29b-41d4-a716-446655440000
→ View all events for this study
```

---

## Quick Start Checklist

- [ ] Run database migration (V1_0_0__Add_Study_Aggregate_UUID.sql)
- [ ] Start application (`mvn spring-boot:run`)
- [ ] Test create endpoint with curl
- [ ] Verify study created in database
- [ ] Test get endpoint with returned UUID
- [ ] Test update endpoint
- [ ] Test status transition endpoints
- [ ] Verify events in Axon Server (if running)

---

**API Version**: Phase 2 Implementation  
**Status**: ✅ Ready for Testing  
**Documentation**: Complete  
**Next Steps**: Integration Testing
