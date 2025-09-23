# Study-Level Status Transition Validation Implementation

## Overview

This document describes the implementation of **Task 2: Add study-level status transition validation in StudyService**. This enhancement provides comprehensive validation for all study operations that can affect study status, ensuring data integrity and business rule compliance.

## Implementation Summary

### 🎯 **Core Validation Methods Added**

1. **`validateStudyModificationAllowed()`** - Checks if study status allows modifications
2. **`validateStatusTransition()`** - Validates specific status transitions with business rules
3. **`validateStudyEntityIntegrity()`** - Ensures required fields based on current status
4. **`validateCrossEntityConsistency()`** - Validates consistency between study and protocol versions
5. **`validateStudyOperation()`** - Comprehensive validation wrapper for all operations

### 🔧 **Enhanced Methods**

All study operations now include comprehensive validation:

- **`createStudy()`** - Added entity integrity validation
- **`updateStudy()`** - Added modification permission validation
- **`changeStudyStatus()`** - Enhanced with comprehensive validation
- **`publishStudy()`** - Enhanced with comprehensive validation

### 🚀 **New Lifecycle Operations**

Added complete study lifecycle management with validation:

- **`suspendStudy()`** - Suspend active studies
- **`resumeStudy()`** - Resume suspended studies  
- **`completeStudy()`** - Complete active studies
- **`terminateStudy()`** - Terminate studies with reason
- **`withdrawStudy()`** - Withdraw studies with reason

## Validation Layers

### 1. Modification Permission Validation

```java
private void validateStudyModificationAllowed(StudyEntity study, String operation)
```

**Purpose**: Prevents modifications to studies in statuses that shouldn't allow changes

**Validation Rules**:
- Uses `StudyStatusComputationService.allowsModification()`
- Blocks modifications for ACTIVE, COMPLETED, TERMINATED, WITHDRAWN studies
- Allows modifications for DRAFT, PLANNING, UNDER_REVIEW, REJECTED studies

**Triggered By**: `updateStudy()`, `updateStudyDetails()`

### 2. Status Transition Validation

```java
private void validateStatusTransition(StudyEntity study, String newStatus, String operation)
```

**Purpose**: Ensures only valid status transitions occur according to business rules

**Validation Rules**:
- Uses centralized state machine from `StudyStatusComputationService`
- Validates business rules for each target status
- Provides detailed error messages for invalid transitions

**Triggered By**: `changeStudyStatus()`, `publishStudy()`, lifecycle operations

### 3. Entity Integrity Validation

```java
private void validateStudyEntityIntegrity(StudyEntity study, String operation)
```

**Purpose**: Ensures required fields are present based on current study status

**Validation Rules**:
- **UNDER_REVIEW/APPROVED/ACTIVE**: Requires name, description, primary objective
- **All Statuses**: Basic entity validation

**Triggered By**: All study operations

### 4. Cross-Entity Consistency Validation

```java
private void validateCrossEntityConsistency(StudyEntity study, String operation)
```

**Purpose**: Validates consistency between study status and related entities

**Validation Rules**:
- **ACTIVE Studies**: Should have active protocol versions
- **COMPLETED Studies**: Should have proper closure documentation
- **TERMINATED/WITHDRAWN**: Should have termination documentation

**Integration Points**: Ready for extension with protocol version validation

### 5. Comprehensive Operation Validation

```java
private void validateStudyOperation(StudyEntity study, String newStatus, String operation)
```

**Purpose**: Orchestrates all validation layers for any study operation

**Validation Sequence**:
1. Entity integrity validation
2. Status transition validation (if status change)
3. Cross-entity consistency validation

## API Endpoints Enhanced

### Study Status Management
- `PUT /api/v1/studies/{studyId}/status` - Change status (enhanced validation)
- `POST /api/v1/studies/{studyId}/status/publish` - Publish study (enhanced validation)

### New Lifecycle Operations
- `POST /api/v1/studies/{studyId}/status/suspend` - Suspend study
- `POST /api/v1/studies/{studyId}/status/resume` - Resume study
- `POST /api/v1/studies/{studyId}/status/complete` - Complete study
- `POST /api/v1/studies/{studyId}/status/terminate` - Terminate study
- `POST /api/v1/studies/{studyId}/status/withdraw` - Withdraw study

### Request Examples

**Suspend Study:**
```json
POST /api/v1/studies/123/status/suspend
{
  "reason": "Safety concerns require immediate suspension"
}
```

**Terminate Study:**
```json
POST /api/v1/studies/123/status/terminate
{
  "reason": "Insufficient enrollment after extended recruitment period"
}
```

## Validation Error Handling

### Error Types and Messages

1. **Modification Permission Errors**:
   ```
   "Cannot update study: Study is in 'ACTIVE' status which does not allow modifications"
   ```

2. **Status Transition Errors**:
   ```
   "Cannot change status to ACTIVE: Study must have at least one approved protocol version"
   ```

3. **Entity Integrity Errors**:
   ```
   "Study name is required for status: UNDER_REVIEW"
   ```

4. **Cross-Entity Consistency Errors**:
   ```
   "Study ACTIVE status is inconsistent with protocol version statuses"
   ```

## Integration with Existing System

### Backward Compatibility
- All existing functionality preserved
- No breaking changes to existing API endpoints
- Enhanced validation provides additional safety

### Integration Points
- Uses `StudyStatusComputationService` for centralized business rules
- Integrates with `StudyValidationService` for basic validation
- Compatible with existing `StudyMapper` and repository layers

### Extension Points
- Cross-entity validation ready for protocol version integration
- Audit trail integration points identified
- Custom workflow integration ready

## Benefits Achieved

### 🛡️ **Data Integrity**
- Prevents invalid status transitions
- Ensures required data at each status level
- Maintains consistency across related entities

### 🏗️ **Business Rule Enforcement**
- Centralized validation logic
- Consistent application across all operations
- Clear error messages for troubleshooting

### 🔧 **Maintainability**
- Modular validation methods
- Single responsibility principle
- Easy to extend and modify

### 🚀 **Operational Excellence**
- Complete study lifecycle management
- Proper audit trail support
- Regulatory compliance support

## Future Enhancements

### 1. Audit Trail Integration
```java
// Add to validation methods
auditService.logStatusValidation(study.getId(), operation, result);
```

### 2. Protocol Version Integration
```java
// In validateCrossEntityConsistency()
protocolVersionService.validateConsistencyWithStudyStatus(study);
```

### 3. Notification Integration
```java
// In lifecycle operations
notificationService.notifyStatusChange(study, oldStatus, newStatus, reason);
```

### 4. Workflow Integration
```java
// Custom workflows per organization
workflowService.validateCustomBusinessRules(study, newStatus);
```

## Usage Examples

### Basic Status Change with Validation
```java
// Automatically validates transition and business rules
StudyResponseDto response = studyService.changeStudyStatus(studyId, "UNDER_REVIEW");
```

### Study Lifecycle Management
```java
// Suspend with reason
StudyResponseDto suspended = studyService.suspendStudy(studyId, "Safety review required");

// Resume when ready
StudyResponseDto resumed = studyService.resumeStudy(studyId);

// Complete when finished
StudyResponseDto completed = studyService.completeStudy(studyId);
```

### Update with Permission Validation
```java
// Automatically checks if study status allows modifications
StudyResponseDto updated = studyService.updateStudy(studyId, updateRequest);
```

This implementation provides a robust foundation for study status management with comprehensive validation, proper error handling, and clear extension points for future enhancements.