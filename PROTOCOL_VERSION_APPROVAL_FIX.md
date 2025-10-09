# Protocol Version Approval Fix

## Issue
User cannot approve a protocol version that is in `UNDER_REVIEW` status. When trying to approve the study in the "Publish Study" phase, backend validation correctly rejects it with:
```
Cannot transition study to status APPROVED: Study must have at least one approved protocol version
```

However, there's no way to approve the protocol version from the Protocol Version Management UI because the "Approve" button only shows for `AMENDMENT_REVIEW` status, not `UNDER_REVIEW` status.

## Root Cause Analysis

### Backend Validation (Correct ✅)
**File:** `ProtocolVersionValidationService.java` (Line 170)
```java
// Version must be in UNDER_REVIEW status to be approved
if (version.getStatus() != VersionStatus.UNDER_REVIEW) {
    throw new StudyStatusTransitionException(
        String.format("Cannot approve protocol version %s: Current status is %s (must be UNDER_REVIEW)",
            version.getVersionNumber(), version.getStatus())
    );
}
```

**Backend correctly requires:** Protocol version must be in `UNDER_REVIEW` status to be approved.

### Frontend UI (Bug ❌)
**File:** `ProtocolVersionActions.jsx` (Lines 86-94)
```javascript
case 'UNDER_REVIEW':
    // Protocol is with IRB/EC - limited actions
    break;  // No approve button!

case 'AMENDMENT_REVIEW':
    if (canApprove || statusInfo?.canApprove) {
        actions.push({
            key: 'approve',
            label: 'Approve',
            icon: CheckCircle,
            onClick: onApprove,
            variant: 'success'
        });
    }
    break;
```

**Frontend bug:** Only shows approve button for `AMENDMENT_REVIEW`, not `UNDER_REVIEW`.

## Status Flow
Correct protocol version lifecycle:
```
DRAFT → Submit for Review → UNDER_REVIEW → Approve → APPROVED → Activate → ACTIVE
```

The approve action should be available at `UNDER_REVIEW` status, but frontend was not showing it.

## Solution Implemented

### 1. Added Approve Action for UNDER_REVIEW Status
**File:** `ProtocolVersionActions.jsx`

**Before:**
```javascript
case 'UNDER_REVIEW':
    // Protocol is with IRB/EC - limited actions
    break;
```

**After:**
```javascript
case 'UNDER_REVIEW':
    // Protocol is under internal review - allow approval by authorized users
    if (canApprove || statusInfo?.canApprove) {
        actions.push({
            key: 'approve',
            label: 'Approve Version',
            icon: CheckCircle,
            onClick: onApprove,
            variant: 'success',
            confirmMessage: 'Are you sure you want to approve this protocol version? This will mark it as ready for activation.'
        });
    }
    break;
```

### 2. Updated Quick Actions for List Views
**File:** `ProtocolVersionActions.jsx` (QuickActions component)

**Before:**
```javascript
case 'UNDER_REVIEW':
    return null; // No actions while under external review
```

**After:**
```javascript
case 'UNDER_REVIEW':
    // Show approve action for authorized users
    if (props.canApprove) {
        return {
            key: 'approve',
            label: 'Approve',
            icon: CheckCircle,
            onClick: props.onApprove,
            variant: 'success'
        };
    }
    return null;
```

### 3. Fixed Prop Name Mapping
**File:** `ProtocolVersionPanel.jsx`

**Before:**
```javascript
<ProtocolVersionQuickActions
    version={currentProtocolVersion}
    onApproveVersion={onApproveVersion}  // Wrong prop name
    ...
/>
```

**After:**
```javascript
<ProtocolVersionQuickActions
    version={currentProtocolVersion}
    onApprove={onApproveVersion}  // Correct prop name
    ...
/>
```

## Backend Endpoint Verification

### Approval Endpoint
```
PUT /api/protocol-versions/{id}/approve
```

**Request:**
```json
{
  "approvedBy": "string",
  "approvedDate": "2025-10-09",
  "reason": "Protocol reviewed and approved for use"
}
```

### Bridge Endpoint (Used by Frontend)
```
PUT /api/study-versions/{versionId}/status
```

**Request:**
```json
{
  "status": "APPROVED",
  "reason": "Protocol version approved"
}
```

The bridge endpoint converts legacy ID to UUID and calls the DDD command handler.

## Testing Steps

### 1. Create and Submit Protocol Version
1. Open any study in Study Design
2. Go to Protocol Version Management
3. Create a new protocol version (if not exists)
4. Submit it for review (status changes to `UNDER_REVIEW`)

### 2. Approve Protocol Version
1. The protocol version should now show status `UNDER_REVIEW`
2. **"Approve Version" button should now be visible** ✅
3. Click "Approve Version"
4. Confirm the action
5. Status should change to `APPROVED`

### 3. Approve Study for Publishing
1. Navigate to "Publish Study" phase
2. Study validation should now pass (at least one approved protocol version)
3. Click "Approve Study"
4. Study status should change to `APPROVED`/`READY_TO_PUBLISH`
5. "Publish Study" button should now be visible

## Expected Behavior

### Protocol Version Management
- ✅ DRAFT → Shows "Submit for Review" button
- ✅ UNDER_REVIEW → Shows **"Approve Version" button** (NEW!)
- ✅ APPROVED → Shows "Activate" button
- ✅ ACTIVE → Shows "Create Amendment" button

### Study Publishing Workflow
- ✅ Study with approved protocol version can be approved
- ✅ Approved study can be published
- ✅ Validation errors are clear and actionable

## Files Modified
1. ✅ `ProtocolVersionActions.jsx` - Added approve action for UNDER_REVIEW
2. ✅ `ProtocolVersionPanel.jsx` - Fixed prop name (onApprove)

## Related Components
- `ProtocolVersionManagementModal.jsx` - Uses ProtocolVersionActions
- `useProtocolVersioning.js` - Hook with approve function
- `StudyVersioningService.js` - Service calling backend API
- `ProtocolVersionCommandController.java` - Backend endpoint
- `ProtocolVersionValidationService.java` - Validation logic

## Benefits
- ✅ Complete protocol version lifecycle now functional
- ✅ Users can approve protocols without database manipulation
- ✅ Study publishing workflow unblocked
- ✅ Consistent with backend validation rules
- ✅ Role-based permissions supported (canApprove flag)

## Next Steps
1. Refresh the frontend application
2. Test the approve workflow end-to-end
3. Verify permissions (canApprove flag) work correctly
4. Consider adding role-based access control for approval action
