# Protocol Version Management Integration Guide

## Overview

This document describes the Phase 1 implementation of Protocol Version Management in the StudyDesignDashboard, including all components, integration points, and usage patterns.

## Implementation Summary

### ✅ Completed Components

#### 1. Core Hook - useProtocolVersioning.js
**Location:** `src/components/modules/trialdesign/study-design/protocol-version/useProtocolVersioning.js`

**Features:**
- Complete protocol version lifecycle management
- CRUD operations for protocol versions
- Status definitions: DRAFT → PROTOCOL_REVIEW → APPROVED → ACTIVE → SUPERSEDED/WITHDRAWN
- Amendment type handling (INITIAL, MINOR, MAJOR, SUBSTANTIAL)
- Version validation and business logic
- Integration with existing StudyVersioningService

**Key Functions:**
```javascript
const {
  versions,           // All protocol versions
  currentVersion,     // Active/latest version
  loading,            // Loading state
  error,              // Error state
  createVersion,      // Create new version
  updateVersion,      // Update existing version
  deleteVersion,      // Delete version
  submitForReview,    // Submit DRAFT → PROTOCOL_REVIEW
  approveVersion,     // PROTOCOL_REVIEW → APPROVED
  activateVersion,    // APPROVED → ACTIVE
  editingVersion,     // Currently editing version
  setEditingVersion   // Set version for editing
} = useProtocolVersioning(studyId);
```

#### 2. Form Component - ProtocolVersionForm.jsx
**Location:** `src/components/modules/trialdesign/study-design/protocol-version/ProtocolVersionForm.jsx`

**Features:**
- Complete form with validation
- Version number management
- Amendment type selection
- Advanced options (effective date, impact assessment, regulatory flags)
- Real-time validation feedback
- Support for both initial versions and amendments

#### 3. Action Components - ProtocolVersionActions.jsx
**Location:** `src/components/modules/trialdesign/study-design/protocol-version/ProtocolVersionActions.jsx`

**Features:**
- Context-sensitive action buttons based on version status
- Multiple display modes: full, compact, quick-actions
- Status-based action visibility and permissions
- Confirmation dialogs for destructive actions
- Loading states and error handling

#### 4. Timeline Component - ProtocolVersionTimeline.jsx
**Location:** `src/components/modules/trialdesign/study-design/protocol-version/ProtocolVersionTimeline.jsx`

**Features:**
- Visual timeline for version history
- Full timeline and compact mini-timeline variants
- Status-based icons and styling
- Version comparison capabilities
- Chronological sorting and filtering

#### 5. Main Modal - ProtocolVersionManagementModal.jsx
**Location:** `src/components/modules/trialdesign/study-design/protocol-version/ProtocolVersionManagementModal.jsx`

**Features:**
- Complete tabbed interface (Overview, Timeline, Create, Edit)
- Version statistics dashboard
- Integrated CRUD operations
- Confirmation dialogs and error handling
- Responsive design with proper modal behavior

#### 6. Dashboard Panel - ProtocolVersionPanel.jsx
**Location:** `src/components/modules/trialdesign/study-design/protocol-version/ProtocolVersionPanel.jsx`

**Features:**
- Main dashboard display component
- Compact and full view modes
- Current version status display
- Primary and secondary action buttons
- Version statistics and progress indicators
- Status-specific information panels

#### 7. Quick Overview - ProtocolVersionQuickOverview.jsx
**Location:** `src/components/modules/trialdesign/study-design/components/ProtocolVersionQuickOverview.jsx`

**Features:**
- Compact display for sidebars
- Integration with existing dashboard patterns
- Quick action access
- Protocol version status at-a-glance

### ✅ StudyDesignDashboard Integration

#### Updated Files:
1. **StudyDesignDashboard.jsx** - Main integration point
   - Added protocol-versions phase to designPhases array
   - Integrated useProtocolVersioning hook
   - Added ProtocolVersionManagementModal state management
   - Updated phase accessibility logic
   - Added protocol-versions content rendering

2. **SmartWorkflowAssistant.jsx** - Workflow guidance
   - Added protocol-versions phase guidance
   - Updated phase ordering for suggestions
   - Added protocol management tips and checklist

### ✅ New Phase Integration

#### Phase Configuration:
```javascript
{
  id: 'protocol-versions',
  name: 'Protocol Versions',
  description: 'Manage protocol versions and amendments',
  icon: <FileText className="h-5 w-5" />,
  path: '/study-design/protocol-versions',
  status: 'AVAILABLE'
}
```

#### Route Access:
- Always accessible (not dependent on other phase completion)
- Available from study creation onwards
- Integrated into workflow progress tracking

## Usage Patterns

### 1. Creating Initial Protocol Version
```javascript
// From StudyDesignDashboard
const handleCreateProtocolVersion = () => {
  setShowProtocolVersionModal(true);
};

// In modal - Create tab
const version = await protocolVersioning.createVersion({
  versionNumber: "1.0",
  description: "Initial protocol version",
  amendmentType: "INITIAL"
});
```

### 2. Managing Protocol Lifecycle
```javascript
// Submit for review
await protocolVersioning.submitForReview(versionId);

// Approve version (with permissions)
await protocolVersioning.approveVersion(versionId);

// Activate version
await protocolVersioning.activateVersion(versionId);
```

### 3. Creating Amendments
```javascript
const amendment = await protocolVersioning.createVersion({
  versionNumber: "1.1",
  description: "Safety reporting update",
  amendmentType: "MINOR",
  effectiveDate: "2024-02-01"
});
```

### 4. Version History and Timeline
```javascript
// Display timeline
<ProtocolVersionTimeline
  versions={protocolVersioning.versions}
  currentVersionId={protocolVersioning.currentVersion?.id}
  onVersionSelect={handleVersionSelect}
/>

// Mini timeline for dashboard
<ProtocolVersionMiniTimeline
  versions={versions}
  currentVersionId={currentVersionId}
  onVersionSelect={onVersionSelect}
/>
```

## Integration Points

### 1. Backend Integration
- **StudyVersioningService.js** - Existing service for API calls
- **StudyVersionController** - Backend REST endpoints
- **StudyStatusComputationService** - Status validation logic

### 2. Frontend Integration
- **StudyDesignDashboard** - Main integration point
- **WorkflowProgressTracker** - Phase progress tracking
- **SmartWorkflowAssistant** - Contextual guidance
- **NavigationSidebar** - Workflow navigation

### 3. State Management
- **useProtocolVersioning** - Centralized state management
- **StudyDesignDashboard state** - Modal and phase management
- **Local component state** - Form and UI interactions

## Key Features

### 1. Status-Based Actions
- **DRAFT**: Edit, Submit for Review, Delete
- **PROTOCOL_REVIEW**: View only, waiting for approval
- **APPROVED**: Activate, View
- **ACTIVE**: Create Amendment, View
- **SUPERSEDED/WITHDRAWN**: View only (historical)

### 2. Amendment Types
- **INITIAL**: First version of the protocol
- **MINOR**: Non-substantial changes
- **MAJOR**: Substantial changes requiring review
- **SUBSTANTIAL**: Significant changes requiring regulatory approval

### 3. Validation Rules
- Version number uniqueness
- Amendment type consistency
- Status transition validation
- Required field validation
- Business logic enforcement

### 4. User Experience
- Intuitive workflow progression
- Context-sensitive actions
- Clear status indicators
- Comprehensive validation feedback
- Responsive design

## Testing Scenarios

### 1. Protocol Version Creation
- [ ] Create initial protocol version
- [ ] Create minor amendment
- [ ] Create major amendment
- [ ] Validate version numbering
- [ ] Test form validation

### 2. Status Transitions
- [ ] Submit draft for review
- [ ] Approve protocol version
- [ ] Activate approved version
- [ ] Create amendment from active version

### 3. UI Components
- [ ] Modal opens and closes properly
- [ ] Timeline displays correctly
- [ ] Actions are contextually appropriate
- [ ] Loading states work correctly
- [ ] Error handling displays properly

### 4. Integration
- [ ] Dashboard phase navigation
- [ ] Workflow assistant guidance
- [ ] Progress tracking updates
- [ ] Modal state management

## Future Enhancements (Phase 2)

### 1. Advanced Features
- [ ] Version comparison tool
- [ ] Bulk amendment operations
- [ ] Template-based versions
- [ ] Automated numbering schemes
- [ ] Version archival/restore

### 2. Regulatory Features
- [ ] Regulatory authority tracking
- [ ] Site-specific approvals
- [ ] Compliance dashboard
- [ ] Audit trail enhancements
- [ ] Document generation

### 3. Collaboration Features
- [ ] Multi-user editing
- [ ] Comment system
- [ ] Approval workflows
- [ ] Notification system
- [ ] Role-based permissions

### 4. Analytics
- [ ] Version usage metrics
- [ ] Amendment impact analysis
- [ ] Approval time tracking
- [ ] Regulatory compliance reports

## Troubleshooting

### Common Issues

1. **Modal not opening**
   - Check `showProtocolVersionModal` state
   - Verify `setShowProtocolVersionModal` function
   - Ensure proper component mounting

2. **Hook not loading data**
   - Verify `studyId` parameter
   - Check network requests in browser dev tools
   - Confirm backend API availability

3. **Actions not working**
   - Check version status and permissions
   - Verify action button conditions
   - Ensure proper error handling

4. **Timeline not displaying**
   - Check versions array data
   - Verify sorting and filtering logic
   - Ensure proper date formatting

### Debug Tips

```javascript
// Enable hook debugging
console.log('Protocol Versioning State:', {
  versions: protocolVersioning.versions,
  currentVersion: protocolVersioning.currentVersion,
  loading: protocolVersioning.loading,
  error: protocolVersioning.error
});

// Check modal state
console.log('Modal State:', {
  showProtocolVersionModal,
  editingVersion: protocolVersioning.editingVersion
});
```

## Conclusion

The Phase 1 Protocol Version Management implementation provides a comprehensive foundation for managing protocol versions and amendments within the StudyDesignDashboard. All core components are complete and integrated, providing users with intuitive tools for protocol lifecycle management while maintaining consistency with existing design patterns and workflows.

The implementation follows best practices for React component development, state management, and user experience design, ensuring maintainability and extensibility for future enhancements.