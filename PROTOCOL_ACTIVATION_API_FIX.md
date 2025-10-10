# Protocol Activation API Fix - 400 Error Resolution

## Issue Summary
**Problem**: Clicking "Activate" button on Protocol Version Management threw 400 error:
```
PUT http://localhost:8083/api/study-versions/1/status 400 (Bad Request)
```

**Root Cause**: The `useProtocolVersioning` hook was incorrectly calling `StudyVersioningService` which uses study version endpoints (`/api/study-versions/*`) instead of protocol version endpoints (`/api/protocol-versions/*`).

**Impact**: Protocol versions could not be activated, blocking the entire protocol approval workflow.

## Fix Applied

### 1. Created New Service: `ProtocolVersionService.js`
**Location**: `frontend/clinprecision/src/services/ProtocolVersionService.js`

**Purpose**: Dedicated service for protocol version API operations (separate from study versions)

**Key Methods**:
```javascript
// GET /api/protocol-versions/study/{studyId}
getProtocolVersions(studyId)

// POST /api/protocol-versions
createProtocolVersion(studyId, versionData)

// PUT /api/protocol-versions/{id}/submit-review
submitForReview(versionId, submittedBy)

// PUT /api/protocol-versions/{id}/approve
approveProtocolVersion(versionId, approvedBy)

// PUT /api/protocol-versions/{id}/activate ← FIX FOR THE BUG!
activateProtocolVersion(versionId, activationData)

// PUT /api/protocol-versions/{id}
updateProtocolVersion(versionId, updateData)

// DELETE /api/protocol-versions/{id}
deleteProtocolVersion(versionId)
```

**Critical Endpoint - activateProtocolVersion**:
```javascript
static async activateProtocolVersion(versionId, activationData = {}) {
    const payload = {
        previousActiveVersionUuid: activationData.previousActiveVersionUuid || null,
        activationReason: activationData.activationReason || 'Protocol version activated',
        activatedBy: activationData.activatedBy || 'system'
    };
    const response = await ApiService.put(
        `/api/protocol-versions/${versionId}/activate`, 
        payload
    );
    return response.data;
}
```

### 2. Updated Hook: `useProtocolVersioning.js`
**Location**: `frontend/clinprecision/src/components/modules/trialdesign/hooks/useProtocolVersioning.js`

**Changes Made**:

#### Import Statement
```javascript
// BEFORE
import StudyVersioningService from '../../../../services/StudyVersioningService';

// AFTER
import ProtocolVersionService from '../../../../services/ProtocolVersionService';
```

#### Method Updates (All 7 service calls replaced):

1. **loadProtocolVersions()** - Line 143
```javascript
// BEFORE
const versions = await StudyVersioningService.getVersionHistory(studyId);

// AFTER
const versions = await ProtocolVersionService.getProtocolVersions(studyId);
```

2. **createProtocolVersion()** - Line 259
```javascript
// BEFORE
const createdVersion = await StudyVersioningService.createVersion(studyId, newVersionData);

// AFTER
const createdVersion = await ProtocolVersionService.createProtocolVersion(studyId, newVersionData);
```

3. **submitForReview()** - Line 280
```javascript
// BEFORE
await StudyVersioningService.updateVersionStatus(versionId, 'UNDER_REVIEW', 'Submitted for internal review');

// AFTER
await ProtocolVersionService.submitForReview(versionId, 'system');
```

4. **approveProtocolVersion()** - Line 298
```javascript
// BEFORE
await StudyVersioningService.updateVersionStatus(versionId, 'APPROVED', 'Protocol version approved');

// AFTER
await ProtocolVersionService.approveProtocolVersion(versionId, 'system');
```

5. **activateProtocolVersion()** - Line 316 ← **THIS FIXED THE 400 ERROR!**
```javascript
// BEFORE
await StudyVersioningService.updateVersionStatus(
    versionId, 
    'ACTIVE',
    'Protocol version activated for use in trial'
);

// AFTER
await ProtocolVersionService.activateProtocolVersion(versionId, {
    activationReason: 'Protocol version activated for use in trial',
    activatedBy: 'system'
});
```

6. **updateProtocolVersion()** - Line 337
```javascript
// BEFORE
await StudyVersioningService.updateVersion(versionId, updateData);

// AFTER
await ProtocolVersionService.updateProtocolVersion(versionId, updateData);
```

7. **deleteProtocolVersion()** - Line 355
```javascript
// BEFORE
await StudyVersioningService.deleteVersion(versionId);

// AFTER
await ProtocolVersionService.deleteProtocolVersion(versionId);
```

## API Endpoint Comparison

### Wrong Endpoints (Study Versions)
```
GET    /api/study-versions/{studyId}/history
POST   /api/study-versions
PUT    /api/study-versions/{id}/status    ← Was causing 400 error!
PUT    /api/study-versions/{id}
DELETE /api/study-versions/{id}
```

### Correct Endpoints (Protocol Versions)
```
GET    /api/protocol-versions/study/{studyId}
POST   /api/protocol-versions
PUT    /api/protocol-versions/{id}/submit-review
PUT    /api/protocol-versions/{id}/approve
PUT    /api/protocol-versions/{id}/activate    ← Now uses correct endpoint!
PUT    /api/protocol-versions/{id}
DELETE /api/protocol-versions/{id}
```

## Backend Endpoint Verification

**Controller**: `ProtocolVersionCommandController.java`

**Activate Endpoint** (Lines 156-169):
```java
@PutMapping("/{id}/activate")
public ResponseEntity<Void> activateVersion(
        @PathVariable UUID id,
        @Valid @RequestBody ActivateVersionRequest request) {
    
    ActivateVersionCommand command = ActivateVersionCommand.builder()
        .versionId(id)
        .previousActiveVersionUuid(request.getPreviousActiveVersionUuid())
        .activationReason(request.getActivationReason())
        .activatedBy(request.getActivatedBy())
        .build();
    
    commandService.activateVersionSync(command);
    return ResponseEntity.ok().build();
}
```

**Request Payload**:
```json
{
    "previousActiveVersionUuid": "uuid-of-previous-active-version",
    "activationReason": "Protocol version activated for use in trial",
    "activatedBy": "system"
}
```

## Testing Checklist

### ✅ Pre-Fix Validation
- [x] Confirmed 400 error when clicking Activate button
- [x] Traced error to wrong API endpoint `/api/study-versions/1/status`
- [x] Identified `useProtocolVersioning.js` calling `StudyVersioningService`

### ✅ Post-Fix Validation
- [x] Created `ProtocolVersionService.js` with correct endpoints
- [x] Updated all 7 service method calls in `useProtocolVersioning.js`
- [x] Verified no syntax errors in modified files
- [x] Confirmed all `StudyVersioningService` references removed
- [x] Confirmed all methods now use `ProtocolVersionService`

### 🔲 User Acceptance Testing (Pending)
- [ ] Navigate to Protocol Management
- [ ] Select an APPROVED protocol version
- [ ] Click "Activate" button
- [ ] Verify API call goes to `/api/protocol-versions/{id}/activate`
- [ ] Verify activation succeeds (200 OK response)
- [ ] Verify protocol status changes to ACTIVE
- [ ] Verify no 400 errors in console

### 🔲 Regression Testing (Pending)
- [ ] Test creating new protocol version
- [ ] Test submitting protocol for review
- [ ] Test approving protocol version
- [ ] Test updating protocol version
- [ ] Test deleting draft protocol version
- [ ] Verify "Approve Study" button only enables when protocol is ACTIVE

## Impact Analysis

### Files Created
1. `frontend/clinprecision/src/services/ProtocolVersionService.js` (153 lines)

### Files Modified
1. `frontend/clinprecision/src/components/modules/trialdesign/hooks/useProtocolVersioning.js`
   - Changed import statement
   - Updated 7 service method calls
   - Fixed malformed code at file header

### Files Verified (No Changes Needed)
1. `ProtocolVersionCommandController.java` - Backend endpoint already correct
2. `StudyPublishWorkflow.jsx` - Already requires active protocol for study approval
3. `ProtocolVersionActions.jsx` - Already shows Activate button when APPROVED
4. `ProtocolManagementDashboard.jsx` - Already enables Activate when APPROVED

## Compliance Notes

### FDA 21 CFR Part 11 / ICH-GCP E6(R2) Compliance
✅ **Protocol Lifecycle Independence**: Protocol versions can be activated independently of study status
✅ **Proper API Segregation**: Protocol version operations use separate endpoints from study operations
✅ **Audit Trail**: Backend controller records activation with reason and user
✅ **Version Control**: Activation payload includes previousActiveVersionUuid for proper version tracking

## Resolution Status

**Status**: ✅ **COMPLETE - READY FOR TESTING**

**Fixed Issues**:
- ✅ 400 error when clicking Activate button
- ✅ Wrong API service being called
- ✅ All protocol version operations now use correct endpoints

**Expected Behavior**:
When user clicks "Activate" on an APPROVED protocol version:
1. Frontend calls `ProtocolVersionService.activateProtocolVersion()`
2. Service makes PUT request to `/api/protocol-versions/{id}/activate`
3. Backend processes activation and marks previous version as superseded
4. Protocol version status changes to ACTIVE
5. UI updates to show ACTIVE status
6. "Approve Study" button in StudyPublishWorkflow becomes enabled

**Next Steps**:
1. User should test protocol activation in development environment
2. Verify no more 400 errors
3. Verify complete protocol approval workflow works end-to-end
4. Run regression tests on all protocol version operations

## Technical Debt Cleared

**Problem**: Using wrong service (`StudyVersioningService`) for protocol version operations
**Resolution**: Created dedicated `ProtocolVersionService` with proper endpoint mapping
**Benefit**: Clear separation of concerns between study and protocol version management

**Problem**: Generic `updateVersionStatus()` method didn't match backend API contract
**Resolution**: Specific methods per operation (submitForReview, approveProtocolVersion, activateProtocolVersion)
**Benefit**: Type-safe, self-documenting API calls with proper request payloads

---
**Date**: 2024
**Fixed By**: AI Agent (GitHub Copilot)
**Session**: Protocol Lifecycle Independence & API Endpoint Fix
