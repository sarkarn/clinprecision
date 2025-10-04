# Study Status Computation Service

## Overview

The `StudyStatusComputationService` is a centralized service that implements comprehensive business rules for study status transitions and status computation. This service addresses the major gap identified in item 1 of the gap analysis by providing:

1. **Centralized State Machine**: Complete study status transition rules
2. **Business Rule Validation**: Comprehensive validation for each status transition
3. **Status Computation**: Automatic computation of study status based on protocol versions
4. **Integration Points**: Clean integration with existing StudyService

## Features

### 1. Study Status State Machine

The service defines a complete state machine for study status transitions:

```
DRAFT → UNDER_REVIEW, PLANNING, WITHDRAWN
PLANNING → UNDER_REVIEW, DRAFT, WITHDRAWN  
UNDER_REVIEW → APPROVED, DRAFT, PLANNING, REJECTED, WITHDRAWN
APPROVED → ACTIVE, WITHDRAWN
REJECTED → DRAFT, PLANNING, WITHDRAWN
ACTIVE → COMPLETED, TERMINATED, SUSPENDED
SUSPENDED → ACTIVE, TERMINATED
COMPLETED → (terminal state)
TERMINATED → (terminal state)
WITHDRAWN → (terminal state)
```

### 2. Business Rule Validation

Each status transition includes specific business rules:

- **UNDER_REVIEW**: Requires study name, description, and primary objective
- **APPROVED**: Must have been under review and have at least one approved protocol version
- **ACTIVE**: Must be approved, have active protocol version, and complete design phases
- **COMPLETED**: Must be active first
- **SUSPENDED**: Only active studies can be suspended
- **TERMINATED**: Can happen from most non-terminal states

### 3. Status Computation

Automatically computes correct study status based on:
- Current study status
- Protocol version statuses  
- Business rules and constraints

### 4. Integration Methods

The service provides these key methods:

- `isValidStatusTransition()`: Check if transition is allowed
- `validateStatusTransition()`: Full validation with business rules
- `computeStudyStatus()`: Compute correct status based on versions
- `allowsModification()`: Check if study can be modified
- `getStatusTransitionRecommendations()`: Get all valid next statuses

## API Endpoints

The new `StudyStatusController` provides REST endpoints:

### Status Management
- `PUT /api/v1/studies/{studyId}/status` - Change study status
- `GET /api/v1/studies/{studyId}/status/transitions` - Get valid next statuses
- `GET /api/v1/studies/{studyId}/status/modification-allowed` - Check modification permission
- `POST /api/v1/studies/{studyId}/status/compute` - Compute and update status
- `POST /api/v1/studies/{studyId}/status/publish` - Publish study (set to ACTIVE)

### Request/Response Examples

**Change Status:**
```json
PUT /api/v1/studies/123/status
{
  "status": "UNDER_REVIEW"
}
```

**Get Valid Transitions:**
```json
GET /api/v1/studies/123/status/transitions
[
  {
    "targetStatus": "APPROVED",
    "isAllowed": true,
    "requirements": [],
    "description": "Study has been approved and ready for activation"
  },
  {
    "targetStatus": "REJECTED", 
    "isAllowed": true,
    "requirements": [],
    "description": "Study has been rejected and needs revision"
  }
]
```

## Integration with Existing Code

### StudyService Integration

The `StudyService` has been enhanced with:
- Dependency injection of `StudyStatusComputationService`
- Updated `publishStudy()` method with proper validation
- New methods: `changeStudyStatus()`, `getValidNextStatuses()`, `allowsModification()`, `computeAndUpdateStudyStatus()`

### Backward Compatibility

All existing functionality remains unchanged. The new service enhances existing methods and provides additional capabilities without breaking changes.

## Benefits

1. **Centralized Logic**: All status transition logic in one place
2. **Comprehensive Validation**: Business rules enforced consistently  
3. **Automatic Computation**: Status automatically computed from protocol versions
4. **Clear API**: RESTful endpoints for frontend integration
5. **Extensible**: Easy to add new statuses and rules
6. **Testable**: Isolated business logic for better testing

## Future Enhancements

1. **Event-Driven Updates**: Automatic status computation on protocol version changes
2. **Audit Trail**: Track all status changes with reasons
3. **Custom Workflows**: Organization-specific status workflows
4. **Integration**: Connect with external regulatory systems
5. **Notifications**: Automatic notifications on status changes

## Usage Examples

### Basic Status Change
```java
// Validate and change status
StudyResponseDto response = studyService.changeStudyStatus(studyId, "ACTIVE");
```

### Get Valid Next Statuses
```java
// Get recommendations for next statuses
List<StatusTransitionRecommendation> recommendations = 
    studyService.getValidNextStatuses(studyId);
```

### Check Modification Permission
```java
// Check if study can be modified
boolean canModify = studyService.allowsModification(studyId);
```

### Automatic Status Computation
```java
// Compute and update status based on protocol versions
StudyResponseDto response = studyService.computeAndUpdateStudyStatus(studyId);
```

This implementation provides a robust foundation for study status management that can be extended as the system evolves.