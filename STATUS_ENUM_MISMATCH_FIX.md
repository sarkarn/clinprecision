# Status Enum Mismatch Fix - Protocol Review Issue

## Problem
**Error**: `400 Bad Request` when calling `/api/study-versions/2/status`

## Root Cause
Frontend and backend are using **different enum values** for the "Under Review" status:

### Backend (StudyVersionEntity.java)
```java
public enum VersionStatus {
    DRAFT,
    UNDER_REVIEW,          // ✅ Backend uses this
    AMENDMENT_REVIEW,
    SUBMITTED,
    APPROVED,
    ACTIVE,
    SUPERSEDED,
    WITHDRAWN
}
```

### Frontend (Multiple Components)
```javascript
// ❌ Frontend uses this (doesn't exist in backend enum)
status === 'PROTOCOL_REVIEW'
```

### What Happens
1. Frontend sends: `{ "status": "PROTOCOL_REVIEW" }`
2. Backend tries: `VersionStatus.valueOf("PROTOCOL_REVIEW")`
3. Result: `IllegalArgumentException` → 400 Bad Request
4. Log shows: `line 42: catch (IllegalArgumentException e) { return ResponseEntity.badRequest().build(); }`

## Solution
Replace all frontend occurrences of `PROTOCOL_REVIEW` with `UNDER_REVIEW` to match the backend enum.

## Files to Update

### 1. ProtocolVersionTimeline.jsx
**Lines to change**: 24
```jsx
// BEFORE
case 'PROTOCOL_REVIEW':

// AFTER
case 'UNDER_REVIEW':
```

### 2. ProtocolVersionPanel.jsx
**Lines to change**: 47, 112, 117, 383, 392
```jsx
// BEFORE
case 'PROTOCOL_REVIEW':
status === 'PROTOCOL_REVIEW'

// AFTER
case 'UNDER_REVIEW':
status === 'UNDER_REVIEW'
```

### 3. ProtocolVersionActions.jsx
**Lines to change**: 67
```jsx
// BEFORE
label: 'Submit for Review',  // value: 'PROTOCOL_REVIEW' somewhere

// AFTER
label: 'Submit for Review',  // value: 'UNDER_REVIEW'
```

### 4. ProtocolVersionManagementModal.jsx
**Lines to change**: 361
```jsx
// BEFORE
{protocolVersions.filter(v => v.status === 'PROTOCOL_REVIEW').length}

// AFTER
{protocolVersions.filter(v => v.status === 'UNDER_REVIEW').length}
```

### 5. ProtocolManagementDashboard.jsx
**Lines to change**: 143
```jsx
// BEFORE
label: 'Submit for Review',  // with 'PROTOCOL_REVIEW' value

// AFTER
label: 'Submit for Review',  // with 'UNDER_REVIEW' value
```

### 6. StudyPublishWorkflow.jsx
**Lines to change**: 18, 201, 215, 216, 275, 347, 508, 774, 786
```jsx
// BEFORE
'PROTOCOL_REVIEW'

// AFTER
'UNDER_REVIEW'
```

### 7. ProtocolRevisionWorkflow.jsx
**Lines to change**: 239, 581, 621, 760
```jsx
// BEFORE
status: 'PROTOCOL_REVIEW'
status === 'PROTOCOL_REVIEW'

// AFTER
status: 'UNDER_REVIEW'
status === 'UNDER_REVIEW'
```

### 8. StudyDesignDashboard.jsx
**Lines to change**: 729, 739
```jsx
// BEFORE
// Submit study for review (changes status from PLANNING to PROTOCOL_REVIEW)
if (currentStatus === 'PROTOCOL_REVIEW')

// AFTER
// Submit study for review (changes status from PLANNING to UNDER_REVIEW)
if (currentStatus === 'UNDER_REVIEW')
```

### 9. VersionManagementModal.jsx
**Lines to change**: 156 (appears twice)
```jsx
// BEFORE
[VERSION_STATUS.PROTOCOL_REVIEW.value]: { ... }

// AFTER
[VERSION_STATUS.UNDER_REVIEW.value]: { ... }
```

### 10. useProtocolVersioning.js (if exists)
Check for any `PROTOCOL_REVIEW` references

## Additional Considerations

### If there's a constants file
Look for:
```javascript
export const VERSION_STATUS = {
    PROTOCOL_REVIEW: { value: 'PROTOCOL_REVIEW', label: 'Under Review' },
    // Should be:
    UNDER_REVIEW: { value: 'UNDER_REVIEW', label: 'Under Review' },
}
```

### Status Display Mapping
Ensure all status display functions map correctly:
```javascript
const getStatusDisplay = (status) => {
    switch (status) {
        case 'UNDER_REVIEW':  // Not 'PROTOCOL_REVIEW'
            return {
                icon: Clock,
                color: 'text-yellow-600',
                label: 'Under Review'  // Keep label friendly
            };
    }
};
```

## Testing Checklist
After making changes:
- [ ] Status update API call succeeds (no 400 error)
- [ ] "Submit for Review" button works
- [ ] Status displays correctly as "Under Review" in UI
- [ ] Timeline shows correct status icon/color
- [ ] Version filtering by status works
- [ ] Status transitions (DRAFT → UNDER_REVIEW → APPROVED) work

## Why This Happened
Likely during refactoring, the frontend team used `PROTOCOL_REVIEW` (which sounds appropriate for clinical trials) while the backend used the more generic `UNDER_REVIEW`. Both teams need to align on the same enum values.

## Prevention
1. **Single source of truth**: Consider generating TypeScript types from backend Java enums
2. **API contract testing**: Add integration tests that validate enum values
3. **Documentation**: Keep frontend-backend enum mapping documented
4. **Code review**: Check enum consistency when adding new status values

---
**Date**: October 4, 2025  
**Issue**: 400 Bad Request on `/api/study-versions/2/status`  
**Branch**: CLINOPS
