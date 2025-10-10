# ⚠️ SUPERSEDED - DO NOT USE ⚠️

**This document describes an INCORRECT implementation that was later corrected.**

**See Instead**: [`CRITICAL_WORKFLOW_CORRECTION_FDA_COMPLIANT.md`](./CRITICAL_WORKFLOW_CORRECTION_FDA_COMPLIANT.md)

**Why Superseded**: This document describes fixing the UI to prevent protocol activation until study was approved. However, this approach was **backwards** and violated FDA/ICH-GCP regulations. The correct workflow requires protocol activation **BEFORE** study approval, not after.

---

# Protocol Activation Workflow Fix (INCORRECT - FOR HISTORICAL REFERENCE ONLY)

## Problem Summary

Users were encountering a 500 error when trying to activate an APPROVED protocol version because the study was still in PROTOCOL_REVIEW status. The backend validation correctly enforced that protocol versions can only be activated when the study status is APPROVED or ACTIVE, but the frontend was showing the "Activate" button regardless of study status, leading to confusing errors.

### Error Details
```
Error activating protocol version: Study status is PROTOCOL_REVIEW (must be APPROVED or ACTIVE)
```

## Root Cause Analysis

### Backend Validation (Correct)
The `ProtocolVersionValidationService` has proper business rule validation in `validateActivation()` method:

```java
// Study must be in appropriate status to activate version
if (!"APPROVED".equals(studyStatus) && !"ACTIVE".equals(studyStatus)) {
    throw new StudyStatusTransitionException(
        String.format("Cannot activate protocol version %s: Study status is %s (must be APPROVED or ACTIVE)",
            version.getVersionNumber(), studyStatus)
    );
}
```

### Frontend Issue (Fixed)
The `ProtocolVersionActions` component was showing the activate button based solely on the protocol version status (APPROVED), without checking the study status. This led to:
1. User sees "Activate" button
2. User clicks button
3. Backend correctly rejects with 500 error
4. User confused about why activation failed

## Business Process

### Workflow Sequence
1. **Protocol Version Lifecycle**: DRAFT → UNDER_REVIEW → APPROVED → ACTIVE
2. **Study Lifecycle**: PLANNING → PROTOCOL_REVIEW → APPROVED → ACTIVE
3. **Business Rule**: Protocol versions can only be activated when study is APPROVED or ACTIVE

### Regulatory Rationale
This business rule makes sense for regulatory compliance - you don't want to activate protocols in unapproved studies. The study must be approved first before any protocol version can be activated.

### Correct Workflow
1. Create and edit protocol version (DRAFT)
2. Submit protocol version for review (DRAFT → UNDER_REVIEW)
3. Approve protocol version (UNDER_REVIEW → APPROVED)
4. **Go to Publish Study phase**
5. **Approve study** (PROTOCOL_REVIEW → APPROVED)
6. Return to Protocol Version Management
7. Activate protocol version (APPROVED → ACTIVE)

## Solution Implemented

### Important: Two Locations Fixed

The activate button appears in **two different locations**, and both have been fixed:

1. **Protocol Management Page (List View)**: 
   - Navigation: Study List → Click "Manage Protocol" → Protocol Management page
   - Shows all protocol versions in a list with inline action buttons
   - Fixed in: `ProtocolManagementDashboard.jsx` - `getVersionActions()` function

2. **Protocol Version Management Modal (Detail View)**:
   - Navigation: Protocol Management page → Click "View" button → Modal opens
   - Shows detailed protocol version information with action buttons
   - Fixed in: `ProtocolVersionActions.jsx` component (used by modal)

Both locations now properly check study status before showing the activate button.

### 1. Pass Study Status to Components

**File**: `ProtocolManagementDashboard.jsx`

Added `studyStatus` prop to `ProtocolVersionManagementModal`:

```jsx
<ProtocolVersionManagementModal
    isOpen={showVersionModal}
    studyId={studyId}
    studyName={study?.name}
    studyStatus={study?.studyStatus?.code}  // ✅ Added
    initialVersionId={selectedVersionId}
    onClose={() => {
        setShowVersionModal(false);
        setSelectedVersionId(null);
    }}
    onVersionCreated={() => {
        loadProtocolVersions();
    }}
    onVersionUpdated={() => {
        loadProtocolVersions();
    }}
/>
```

### 2. Update Modal to Receive and Forward Study Status

**File**: `ProtocolVersionManagementModal.jsx`

Updated component props:
```jsx
const ProtocolVersionManagementModal = ({
    isOpen,
    onClose,
    studyId,
    studyName = '',
    studyStatus = null,  // ✅ Added
    mode = 'manage',
    initialVersionId = null,
    onVersionCreated,
    onVersionUpdated
}) => {
```

Passed to `ProtocolVersionActions`:
```jsx
<ProtocolVersionActions
    version={selectedVersion}
    studyStatus={studyStatus}  // ✅ Added
    onEdit={handleEditVersion}
    onSubmitReview={handleSubmitForReview}
    onApprove={handleApproveVersion}
    onActivate={handleActivateVersion}
    onDelete={handleDeleteVersion}
    onView={() => { }}
    canEdit={true}
    canApprove={true}
    canActivate={true}
    loading={loading}
/>
```

### 3. Add Workflow Guidance Message

**File**: `ProtocolVersionManagementModal.jsx`

Added helpful info banner when protocol is approved but study isn't:

```jsx
{/* Workflow guidance message */}
{selectedVersion.status === 'APPROVED' && 
 studyStatus !== 'APPROVED' && 
 studyStatus !== 'ACTIVE' && (
    <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
            <p className="text-sm font-medium text-amber-900 mb-1">
                Study Approval Required
            </p>
            <p className="text-sm text-amber-700">
                This protocol version has been approved, but the study must be approved before the protocol can be activated. 
                Navigate to the <strong>Publish Study</strong> phase and click <strong>Approve Study</strong> to proceed.
            </p>
        </div>
    </div>
)}
```

### 4a. Update Activate Button Logic (List View)

**File**: `ProtocolManagementDashboard.jsx`

Updated `getVersionActions()` function to check study status in APPROVED case:

```jsx
case 'APPROVED':
    // Check if study is approved or active before allowing activation
    const studyApproved = study?.studyStatus?.code === 'APPROVED' || study?.studyStatus?.code === 'ACTIVE';
    if (studyApproved) {
        actions.push({
            label: 'Activate',
            icon: CheckCircle,
            onClick: () => handleActivateVersion(version.id),
            variant: 'primary'
        });
    } else {
        actions.push({
            label: 'Activate',
            icon: AlertTriangle,
            onClick: () => { },
            variant: 'outline',
            disabled: true,
            tooltip: 'Study must be approved before protocol version can be activated'
        });
    }
    break;
```

Enhanced button rendering to support disabled state and tooltips:

```jsx
<div className="flex items-center space-x-2">
    {actions.map((action, index) => {
        const ActionIcon = action.icon;
        const baseClasses = "inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed";
        const variantClasses = {
            primary: "text-white bg-blue-600 hover:bg-blue-700",
            outline: "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
            danger: "text-red-700 bg-white border border-red-300 hover:bg-red-50"
        };

        return (
            <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}  // ✅ Added
                className={`${baseClasses} ${variantClasses[action.variant] || variantClasses.outline}`}
                title={action.tooltip || action.label}  // ✅ Added tooltip support
            >
                <ActionIcon className="h-4 w-4 mr-1.5" />
                {action.label}
            </button>
        );
    })}
</div>
```

### 4b. Update Activate Button Logic (Modal View)

**File**: `ProtocolVersionActions.jsx`

Added `studyStatus` prop:
```jsx
const ProtocolVersionActions = ({
    version,
    studyStatus = null,  // ✅ Added
    onEdit,
    onSubmitReview,
    onApprove,
    onActivate,
    onDelete,
    onView,
    onCreateAmendment,
    canEdit = false,
    canApprove = false,
    canActivate = false,
    loading = false,
    compact = false
}) => {
```

Updated APPROVED case to validate study status:
```jsx
case 'APPROVED':
    if (canActivate || statusInfo?.canActivate) {
        // Check if study is approved or active
        const studyApproved = studyStatus === 'APPROVED' || studyStatus === 'ACTIVE';
        
        if (studyApproved) {
            actions.push({
                key: 'activate',
                label: 'Activate',
                icon: Play,
                onClick: onActivate,
                variant: 'primary',
                confirmMessage: 'Are you sure you want to activate this protocol version? This will supersede the current active version.'
            });
        } else {
            // Show disabled button with tooltip
            actions.push({
                key: 'activate-disabled',
                label: 'Activate',
                icon: AlertTriangle,
                onClick: null,
                variant: 'secondary',
                disabled: true,
                tooltip: 'Study must be approved before protocol version can be activated'
            });
        }
    }
    break;
```

Enhanced button rendering to handle disabled state and tooltips:
```jsx
return (
    <div className={`flex ${compact ? 'gap-1' : 'gap-2'} ${compact ? 'flex-wrap' : 'flex-row'}`}>
        {actions.map((action) => {
            const Icon = action.icon;
            const isLoading = loading;
            const isDisabled = action.disabled || isLoading;  // ✅ Added

            return (
                <button
                    key={action.key}
                    onClick={() => !isDisabled && handleActionClick(action)}  // ✅ Modified
                    disabled={isDisabled}  // ✅ Modified
                    className={getButtonStyle(action.variant, compact)}
                    title={action.tooltip || action.label}  // ✅ Modified to show tooltip
                >
                    <Icon className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${compact || action.always ? '' : 'mr-2'}`} />
                    {!compact && <span>{action.label}</span>}
                </button>
            );
        })}
    </div>
);
```

## User Experience Improvements

### Before Fix
1. User approves protocol version ✅
2. User sees "Activate" button (misleading)
3. User clicks "Activate"
4. Error: "Study status is PROTOCOL_REVIEW (must be APPROVED or ACTIVE)" ❌
5. User confused about workflow

### After Fix
1. User approves protocol version ✅
2. User sees:
   - ⚠️ Disabled "Activate" button with warning icon
   - 📋 Info banner: "Study Approval Required"
   - 📝 Clear message: "Navigate to the Publish Study phase and click Approve Study to proceed"
3. User approves study in Publish Study phase ✅
4. User returns to Protocol Version Management
5. User sees enabled "Activate" button ✅
6. User clicks "Activate"
7. Protocol version successfully activated ✅

## Testing Scenarios

### Scenario 1: Protocol Approved, Study Not Approved (List View)
- **Location**: Protocol Management page (grid/list view)
- **Protocol Status**: APPROVED
- **Study Status**: PROTOCOL_REVIEW
- **Expected UI**:
  - ⚠️ "Activate" button disabled with warning icon
  - Tooltip: "Study must be approved before protocol version can be activated"
  - Button is grayed out and not clickable
- **Expected Backend**: Would reject activation with 400/500 error (if somehow bypassed)

### Scenario 2: Protocol Approved, Study Not Approved (Modal View)
- **Location**: Protocol Version Management modal (after clicking View)
- **Protocol Status**: APPROVED
- **Study Status**: PROTOCOL_REVIEW
- **Expected UI**:
  - ⚠️ "Activate" button disabled with warning icon
  - Tooltip: "Study must be approved before protocol version can be activated"
  - Info banner with workflow guidance message
- **Expected Backend**: Would reject activation with 400/500 error (if somehow bypassed)

### Scenario 3: Protocol Approved, Study Approved (Both Views)
- **Location**: Both list view and modal view
- **Protocol Status**: APPROVED
- **Study Status**: APPROVED
- **Expected UI**:
  - ✅ "Activate" button enabled with checkmark icon
  - Confirmation prompt on click
- **Expected Backend**: Successfully activates protocol version

### Scenario 4: Protocol Approved, Study Active (Both Views)
- **Location**: Both list view and modal view
- **Protocol Status**: APPROVED
- **Study Status**: ACTIVE
- **Expected UI**:
  - ✅ "Activate" button enabled with checkmark icon
  - Confirmation prompt on click
- **Expected Backend**: Successfully activates protocol version

## Files Modified

1. **ProtocolManagementDashboard.jsx**
   - Added `studyStatus={study?.studyStatus?.code}` prop to modal
   - **Updated `getVersionActions()` function** to check study status in APPROVED case
   - Show disabled "Activate" button with warning icon when study not approved
   - Added tooltip: "Study must be approved before protocol version can be activated"
   - Enhanced button rendering to support `disabled` prop and `tooltip` attribute

2. **ProtocolVersionManagementModal.jsx**
   - Added `studyStatus` parameter to component props
   - Passed `studyStatus` to `ProtocolVersionActions`
   - Added workflow guidance info banner

3. **ProtocolVersionActions.jsx**
   - Added `studyStatus` parameter to component props
   - Updated APPROVED case to validate study status
   - Show disabled button when study not approved
   - Added tooltip support for disabled state
   - Enhanced button rendering to handle disabled state

## Next Steps

1. **Test full workflow**:
   - Create protocol version → Submit → Approve → Attempt activation (should be disabled)
   - Go to Publish Study → Approve study
   - Return to protocol version management → Activate (should work)

2. **Verify other usage locations**:
   - Check if `ProtocolVersionActions` is used elsewhere (e.g., `ProtocolVersionPanel`)
   - Ensure study status is passed in all locations

3. **Consider future enhancements**:
   - Add study status indicator in Protocol Version Management modal header
   - Add "Go to Publish Study" button in the info banner for quick navigation
   - Show study approval status in protocol version timeline

## Related Documentation

- `PROTOCOL_VERSION_APPROVAL_FIX.md` - Previous fix for approve button showing for UNDER_REVIEW status
- `USER_AUDIT_TRACKING_FIX.md` - Related fix for user audit fields
- Backend validation: `ProtocolVersionValidationService.validateActivation()`
- Business rules: Protocol Version and Study Status workflows

## Conclusion

This fix improves the user experience by:
1. ✅ Preventing confusing 500 errors
2. ✅ Clearly indicating why activation is disabled
3. ✅ Guiding users through the correct workflow sequence
4. ✅ Maintaining backend validation integrity
5. ✅ Following regulatory compliance best practices

The UI now correctly reflects the backend business rules and guides users through the proper workflow sequence for activating protocol versions.
