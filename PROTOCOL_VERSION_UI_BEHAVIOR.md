# Protocol Version Status UI Behavior Summary

## Status Name Verification ✅

**Correct Status:** `UNDER_REVIEW`  
**Source:** `VersionStatus.java` line 16
```java
UNDER_REVIEW("Under Review", "Under internal review", 2)
```

## UI Button Behavior by Status

### Status: DRAFT
- ✅ **Edit** button - Enabled (`canEdit: true`)
- ✅ **Submit for Review** button - Enabled (`canSubmit: true`)
- ✅ **Delete** button - Enabled
- ❌ Approve button - Hidden (`canApprove: false`)
- ❌ Activate button - Hidden (`canActivate: false`)

### Status: UNDER_REVIEW
- ❌ **Edit** button - Hidden (`canEdit: false`)
- ❌ **Submit for Review** button - **HIDDEN** (`canSubmit: false`) ✅ 
- ❌ Delete button - Hidden
- ❌ Approve button - Hidden (`canApprove: false`)
- ❌ Activate button - Hidden (`canActivate: false`)
- ℹ️  **Only "View Details" button available**

### Status: AMENDMENT_REVIEW
- ❌ Edit button - Hidden (`canEdit: false`)
- ❌ Submit for Review button - Hidden (`canSubmit: false`)
- ✅ **Approve** button - Enabled (`canApprove: true`)
- ❌ Activate button - Hidden (`canActivate: false`)

### Status: APPROVED
- ❌ Edit button - Hidden (`canEdit: false`)
- ❌ Submit for Review button - Hidden (`canSubmit: false`)
- ❌ Approve button - Hidden (`canApprove: false`)
- ✅ **Activate** button - Enabled (`canActivate: true`)

### Status: ACTIVE
- ❌ Edit button - Hidden (`canEdit: false`)
- ❌ Submit for Review button - Hidden (`canSubmit: false`)
- ✅ **Create Amendment** button - Enabled
- ❌ Activate button - Hidden (`canActivate: false`)

### Status: SUPERSEDED / WITHDRAWN
- ℹ️  **Only "View Details" button available (terminal states)**

## Code References

### Backend - Status Enum
**File:** `VersionStatus.java`
```java
DRAFT("Draft", "In development", 1),
UNDER_REVIEW("Under Review", "Under internal review", 2),  // ← CORRECT NAME
AMENDMENT_REVIEW("Amendment Review", "Protocol amendment under review", 3),
SUBMITTED("Submitted", "Submitted to regulatory authority", 4),
APPROVED("Approved", "Approved by regulatory authority", 5),
ACTIVE("Active", "Currently active version", 6),
SUPERSEDED("Superseded", "Replaced by newer version", 7),
WITHDRAWN("Withdrawn", "Withdrawn/cancelled", 8)
```

### Frontend - Status Configuration
**File:** `useProtocolVersioning.js` (lines 28-36)
```javascript
UNDER_REVIEW: {
  value: 'UNDER_REVIEW',
  label: 'Submitted for Review',
  description: 'Submitted to IRB/EC for review',
  color: 'bg-yellow-100 text-yellow-700',
  canEdit: false,
  canSubmit: false,  // ← Button should be HIDDEN
  canApprove: false,
  canActivate: false
}
```

### Frontend - Action Button Logic
**File:** `ProtocolVersionActions.jsx` (lines 48-74)
```jsx
switch (status) {
    case 'DRAFT':
        if (canEdit || statusInfo?.canEdit) {
            actions.push({ key: 'edit', label: 'Edit', ... });
        }

        if (statusInfo?.canSubmit) {  // ← Only shows if canSubmit is true
            actions.push({
                key: 'submit',
                label: 'Submit for Review',
                icon: Send,
                onClick: onSubmitReview,
                variant: 'primary'
            });
        }
        break;

    case 'UNDER_REVIEW':
        // Protocol is with IRB/EC - limited actions
        break;  // ← No actions added (only View Details from "always" actions)
```

## Status Transition Rules

From `VersionStatus.java` (lines 58-62):
```java
case DRAFT -> newStatus == UNDER_REVIEW ||  // ✅ Can submit for review
             newStatus == SUBMITTED ||
             newStatus == WITHDRAWN;

case UNDER_REVIEW -> newStatus == DRAFT ||       // Can revert to draft
                    newStatus == AMENDMENT_REVIEW ||
                    newStatus == SUBMITTED ||
                    newStatus == APPROVED ||
                    newStatus == WITHDRAWN;
```

## Testing Checklist

- [ ] Create new protocol version (Status: DRAFT)
  - **Expected:** "Submit for Review" button visible
  
- [ ] Click "Submit for Review"
  - **Expected:** Status changes to UNDER_REVIEW
  - **Expected:** Success message shown
  - **Expected:** Page refreshes/reloads versions
  
- [ ] Check UI after submission
  - **Expected:** Status badge shows "Submitted for Review" (yellow)
  - **Expected:** "Submit for Review" button **HIDDEN/REMOVED**
  - **Expected:** Only "View Details" button visible
  - **Expected:** Edit and Delete buttons hidden

- [ ] Verify status in backend logs
  ```
  BRIDGE: Current version status: DRAFT
  BRIDGE: Attempting to change status from DRAFT to UNDER_REVIEW
  BRIDGE: ✓ Parsed status enum successfully: UNDER_REVIEW
  BRIDGE: Status change reason: 'Submitted for internal review'
  BRIDGE: ✓ Command executed successfully!
  ```

- [ ] Verify status in database
  ```sql
  SELECT id, version_number, status FROM protocol_versions WHERE id = 1;
  -- Expected: status = 'UNDER_REVIEW'
  ```

## Conclusion

✅ **Status name is correct:** `UNDER_REVIEW`  
✅ **Button logic is correct:** "Submit for Review" button is already configured to hide when status is `UNDER_REVIEW`  
✅ **UI should work as expected:** Once you submit for review and frontend reloads the version data, the button should disappear

**The functionality is already implemented correctly!** No code changes needed for this behavior.

---

**Date:** October 8, 2025  
**Status:** ✅ Verified Correct
