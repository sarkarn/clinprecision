# Protocol Version Management - Implementation Guide

## 📋 Overview

This document provides a comprehensive guide for implementing manual protocol version management in the ClinPrecision system. The implementation allows users to have complete control over protocol version creation, approval, and activation while maintaining integration with the existing study workflow.

## 🎯 Objectives

- **Manual Control**: Provide users with complete control over protocol version lifecycle
- **Status Integration**: Seamlessly integrate with existing study status workflow
- **Regulatory Compliance**: Support clinical trial regulatory requirements for protocol versioning
- **User Experience**: Maintain consistency with existing UI patterns while enhancing functionality

## 📊 System Architecture Analysis

### Current Protocol Version System

#### Backend Entities
```java
// StudyVersionEntity - Main protocol version entity
- id: Long (Primary key)
- studyId: Long (Foreign key to study)
- versionNumber: String (e.g., "1.0", "2.1")
- status: VersionStatus (DRAFT, UNDER_REVIEW, SUBMITTED, APPROVED, ACTIVE, SUPERSEDED, WITHDRAWN)
- amendmentType: AmendmentType (MAJOR, MINOR, SAFETY, ADMINISTRATIVE)
- description: String
- createdBy: Long
- approvedBy: Long
- approvedDate: LocalDateTime
- effectiveDate: LocalDate

// StudyAmendmentEntity - Individual amendments within versions
- id: Long
- studyVersionId: Long (Foreign key to StudyVersionEntity)
- amendmentNumber: Integer
- title: String
- amendmentType: AmendmentType
- status: AmendmentStatus (DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, etc.)
```

#### Status Relationship
```
Study Status: PLANNING → PROTOCOL_REVIEW → APPROVED → ACTIVE
Protocol Version Status: DRAFT → UNDER_REVIEW → APPROVED → ACTIVE
Amendment Status: DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED
```

### Current Frontend Architecture

#### Existing Components
- **StudyDesignDashboard.jsx**: Main study workflow management
- **VersionManagementModal.jsx**: Amendment creation and management
- **ProtocolRevisionWorkflow.jsx**: Protocol workflow management
- **useStudyVersioning.js**: Hook for version management operations

## 🚨 Critical Issue: Status Inconsistency

### Problem Identified
The system has inconsistent status naming between backend and frontend:
- Backend uses: `PROTOCOL_REVIEW` (in StudyStatusComputationService)
- Frontend still uses: `UNDER_REVIEW` (in multiple files)

### Files Requiring Status Updates
```
Frontend Files with UNDER_REVIEW references:
├── StudyVersioningService.js (line 308)
├── StudyListGrid.jsx (line 174)
├── VersionManagementModal.jsx (line 156)
├── ProtocolRevisionWorkflow.jsx (lines 239, 581, 621, 760)
├── ApprovalWorkflowInterface.jsx (lines 204, 314, 583)
├── useStudyVersioning.js (lines 46, 47, 238, 243)
└── Documentation files
```

### Required Status Alignment
```javascript
// BEFORE (Inconsistent)
PLANNING → UNDER_REVIEW → APPROVED → ACTIVE  // Frontend
PLANNING → PROTOCOL_REVIEW → APPROVED → ACTIVE  // Backend

// AFTER (Consistent)
PLANNING → PROTOCOL_REVIEW → APPROVED → ACTIVE  // Both
```

## 🎨 Protocol Version Management UI Design

### 1. Primary Integration Point: StudyDesignDashboard

#### Location
Add Protocol Version Management panel in StudyDesignDashboard.jsx between study information and design sections.

#### Visual Layout
```
┌─────────────────────────────────────────────────────────────┐
│ 🏥 ClinPrecision Study Design Dashboard                    │
├─────────────────────────────────────────────────────────────┤
│ Study: Phase III Oncology Trial - Status: PLANNING         │
├─────────────────────────────────────────────────────────────┤
│ 📋 Protocol Version Management                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ Current Protocol Version: v1.0 [DRAFT]               │   │
│ │ ┌─────────────────┐ ┌─────────────────┐ ┌───────────┐ │   │
│ │ │ Edit Version    │ │ Submit Review   │ │ New Version│ │   │
│ │ └─────────────────┘ └─────────────────┘ └───────────┘ │   │
│ │                                                       │   │
│ │ Version Timeline:                                     │   │
│ │ ●─────○─────○─────○                                   │   │
│ │ v1.0  v1.1  v2.0  v2.1                               │   │
│ │ DRAFT                                                 │   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ [Study Design Sections Continue Below...]                  │
└─────────────────────────────────────────────────────────────┘
```

### 2. Protocol Version Management Modal

#### Component Structure
```
protocol-version/
├── ProtocolVersionManagementModal.jsx     (Main modal component)
├── ProtocolVersionForm.jsx                (Version creation/editing form)
├── ProtocolVersionTimeline.jsx            (Version history timeline)
├── ProtocolVersionActions.jsx             (Status-based action buttons)
└── ProtocolVersionComparison.jsx          (Version comparison tool)
```

#### Modal Features
```javascript
// ProtocolVersionManagementModal.jsx
const ProtocolVersionManagementModal = ({
  isOpen,
  onClose,
  studyId,
  currentVersion,
  mode // 'create', 'edit', 'view', 'approve'
}) => {
  // State management for version operations
  // Form handling for version creation/editing
  // Status transition management
  // Integration with approval workflow
}
```

### 3. Enhanced Dashboard Integration

#### StudyDesignDashboard Enhancements
```javascript
// Add to StudyDesignDashboard.jsx state
const [protocolVersions, setProtocolVersions] = useState([]);
const [currentProtocolVersion, setCurrentProtocolVersion] = useState(null);
const [showProtocolVersionModal, setShowProtocolVersionModal] = useState(false);
const [protocolVersionMode, setProtocolVersionMode] = useState('view');

// Protocol version management functions
const handleCreateProtocolVersion = () => {
  setProtocolVersionMode('create');
  setShowProtocolVersionModal(true);
};

const handleEditProtocolVersion = (version) => {
  setProtocolVersionMode('edit');
  setCurrentProtocolVersion(version);
  setShowProtocolVersionModal(true);
};

const handleSubmitForReview = async (versionId) => {
  // Submit protocol version for review
  // Update study status if needed
};
```

## 🔧 Implementation Strategy

### Phase 1: Status Consistency Fix (Priority: CRITICAL)

#### Step 1: Update Frontend Constants
```javascript
// In useStudyVersioning.js - Replace UNDER_REVIEW with PROTOCOL_REVIEW
export const VERSION_STATUS = {
  DRAFT: { value: 'DRAFT', label: 'Draft' },
  PROTOCOL_REVIEW: { value: 'PROTOCOL_REVIEW', label: 'Protocol Review' }, // Updated
  SUBMITTED: { value: 'SUBMITTED', label: 'Submitted' },
  APPROVED: { value: 'APPROVED', label: 'Approved' },
  ACTIVE: { value: 'ACTIVE', label: 'Active' },
  SUPERSEDED: { value: 'SUPERSEDED', label: 'Superseded' },
  WITHDRAWN: { value: 'WITHDRAWN', label: 'Withdrawn' }
};
```

#### Step 2: Update All Component References
```javascript
// Replace all instances of UNDER_REVIEW with PROTOCOL_REVIEW
// Files to update:
- StudyVersioningService.js
- StudyListGrid.jsx  
- VersionManagementModal.jsx
- ProtocolRevisionWorkflow.jsx
- ApprovalWorkflowInterface.jsx
- useStudyVersioning.js
```

#### Step 3: Update Status Styling
```javascript
// In component styling configurations
const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PROTOCOL_REVIEW: 'bg-yellow-100 text-yellow-700', // Updated
  APPROVED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-blue-100 text-blue-700'
};
```

### Phase 2: Protocol Version Management Components

#### Component 1: Protocol Version Panel
```javascript
// Add to StudyDesignDashboard.jsx
const ProtocolVersionPanel = ({ 
  study, 
  currentVersion, 
  onCreateVersion, 
  onEditVersion, 
  onSubmitReview 
}) => {
  return (
    <div className="protocol-version-panel bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          📋 Protocol Version Management
        </h3>
        <Button 
          onClick={onCreateVersion}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          New Version
        </Button>
      </div>
      
      <ProtocolVersionStatus version={currentVersion} />
      <ProtocolVersionActions 
        version={currentVersion}
        onEdit={onEditVersion}
        onSubmit={onSubmitReview}
      />
      <ProtocolVersionTimeline versions={allVersions} />
    </div>
  );
};
```

#### Component 2: Protocol Version Form
```javascript
// ProtocolVersionForm.jsx
const ProtocolVersionForm = ({ 
  mode, 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    versionNumber: '',
    description: '',
    amendmentType: null,
    changesSummary: '',
    effectiveDate: '',
    requiresRegulatoryApproval: false,
    notifyStakeholders: true
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* Version number field - auto-suggested but editable */}
      <FormField 
        label="Version Number"
        value={formData.versionNumber}
        onChange={handleVersionNumberChange}
        suggestions={suggestedVersionNumbers}
      />
      
      {/* Amendment type selection */}
      <FormField 
        label="Amendment Type"
        type="select"
        options={AMENDMENT_TYPES}
        value={formData.amendmentType}
        onChange={handleAmendmentTypeChange}
      />
      
      {/* Additional fields... */}
    </form>
  );
};
```

### Phase 3: Advanced Features

#### Version Comparison Tool
```javascript
// ProtocolVersionComparison.jsx
const ProtocolVersionComparison = ({ 
  version1, 
  version2, 
  onClose 
}) => {
  return (
    <div className="version-comparison-container">
      <div className="comparison-header">
        <h3>Version Comparison: {version1.versionNumber} vs {version2.versionNumber}</h3>
      </div>
      
      <div className="comparison-content">
        <div className="side-by-side-diff">
          <VersionDetails version={version1} />
          <VersionDetails version={version2} />
        </div>
        
        <div className="change-summary">
          <ChangeHighlights changes={calculateChanges(version1, version2)} />
        </div>
      </div>
    </div>
  );
};
```

## 🚀 User Experience Workflows

### Workflow 1: Initial Protocol Version Creation
```
1. User opens StudyDesignDashboard for new study (PLANNING status)
2. Protocol Version Panel shows "No protocol version created"
3. User clicks "Create Initial Version"
4. ProtocolVersionForm opens with:
   - Suggested version: "1.0"
   - Amendment type: Not applicable (initial version)
   - Required fields: Description, effective date
5. User fills form and saves → Version created as DRAFT
6. Panel updates to show current version with edit/submit options
```

### Workflow 2: Submit Protocol for Review
```
1. User has DRAFT protocol version
2. User clicks "Submit for Review" in Protocol Version Panel
3. Confirmation dialog with impact summary
4. System updates:
   - Protocol version status: DRAFT → PROTOCOL_REVIEW
   - Study status: PLANNING → PROTOCOL_REVIEW (if first submission)
5. Panel updates to show review status and pending actions
```

### Workflow 3: Protocol Version Approval
```
1. Protocol version in PROTOCOL_REVIEW status
2. Authorized user (PI/Coordinator) opens version for review
3. Review interface shows:
   - Version details and changes
   - Review comments section
   - Approve/Reject actions
4. User approves → Status changes to APPROVED
5. System enables study approval (PROTOCOL_REVIEW → APPROVED)
```

### Workflow 4: Creating Protocol Amendment
```
1. Study in ACTIVE status with active protocol version
2. User identifies need for protocol change
3. User clicks "Create Amendment Version"
4. ProtocolVersionForm opens with:
   - Auto-incremented version number (e.g., 1.0 → 1.1)
   - Amendment type selection required
   - Previous version reference
   - Change justification required
5. Amendment goes through approval workflow
6. Upon activation, previous version becomes SUPERSEDED
```

## 🔒 Authorization & Security

### Permission Levels
```javascript
const PROTOCOL_PERMISSIONS = {
  CREATE_VERSION: ['PI', 'STUDY_COORDINATOR'],
  EDIT_VERSION: ['PI', 'STUDY_COORDINATOR'],
  SUBMIT_REVIEW: ['PI', 'STUDY_COORDINATOR'],
  APPROVE_VERSION: ['PI', 'REGULATORY_MANAGER'],
  ACTIVATE_VERSION: ['PI', 'REGULATORY_MANAGER'],
  VIEW_VERSIONS: ['ALL_STUDY_TEAM']
};
```

### Validation Rules
```javascript
const VALIDATION_RULES = {
  VERSION_NUMBER: {
    required: true,
    unique: true,
    format: /^\d+\.\d+(\.\d+)?$/ // e.g., 1.0, 2.1, 1.0.1
  },
  
  AMENDMENT_REQUIREMENTS: {
    major: ['changesSummary', 'impactAssessment', 'regulatoryApproval'],
    minor: ['changesSummary'],
    safety: ['changesSummary', 'impactAssessment', 'regulatoryApproval', 'urgentApproval'],
    administrative: ['changesSummary']
  },
  
  STATUS_TRANSITIONS: {
    DRAFT: ['PROTOCOL_REVIEW', 'WITHDRAWN'],
    PROTOCOL_REVIEW: ['APPROVED', 'DRAFT', 'WITHDRAWN'],
    APPROVED: ['ACTIVE', 'WITHDRAWN'],
    ACTIVE: ['SUPERSEDED'],
    SUPERSEDED: [], // Terminal state
    WITHDRAWN: [] // Terminal state
  }
};
```

## 📱 Integration Points

### Study Status Integration
```javascript
// StudyStatusComputationService.js equivalent in frontend
const updateStudyStatusOnProtocolChange = (protocolVersion, studyStatus) => {
  const transitions = {
    // Protocol version submitted → Study under protocol review
    [PROTOCOL_EVENTS.VERSION_SUBMITTED]: {
      from: 'PLANNING',
      to: 'PROTOCOL_REVIEW'
    },
    
    // Protocol version approved → Study can be approved
    [PROTOCOL_EVENTS.VERSION_APPROVED]: {
      requiresApprovedVersion: true,
      enables: 'STUDY_APPROVAL'
    },
    
    // Protocol version activated → Study becomes active
    [PROTOCOL_EVENTS.VERSION_ACTIVATED]: {
      from: 'APPROVED',
      to: 'ACTIVE'
    }
  };
};
```

### Backend API Integration
```javascript
// useProtocolVersioning.js hook
export const useProtocolVersioning = (studyId) => {
  // API calls to StudyVersionController endpoints
  const createVersion = async (versionData) => {
    return await api.post(`/api/studies/${studyId}/versions`, versionData);
  };
  
  const submitForReview = async (versionId) => {
    return await api.post(`/api/studies/${studyId}/versions/${versionId}/submit`);
  };
  
  const approveVersion = async (versionId) => {
    return await api.post(`/api/studies/${studyId}/versions/${versionId}/approve`);
  };
  
  const activateVersion = async (versionId) => {
    return await api.post(`/api/studies/${studyId}/versions/${versionId}/activate`);
  };
};
```

## 📋 Implementation Checklist

### Critical Fixes (Must Complete First)
- [ ] Update all UNDER_REVIEW references to PROTOCOL_REVIEW in frontend
- [ ] Align status constants across all components
- [ ] Update status styling and labels
- [ ] Test status transition workflow end-to-end

### Core Protocol Version Management
- [ ] Create ProtocolVersionManagementModal component
- [ ] Implement ProtocolVersionForm with validation
- [ ] Add Protocol Version Panel to StudyDesignDashboard
- [ ] Create useProtocolVersioning hook
- [ ] Implement status-based action buttons

### Enhanced Features
- [ ] Protocol Version Timeline component
- [ ] Version comparison functionality
- [ ] Advanced approval workflow integration
- [ ] Notification system for stakeholders
- [ ] Audit trail for version changes

### Testing & Documentation
- [ ] Unit tests for protocol version components
- [ ] Integration tests for status transitions
- [ ] User acceptance testing scenarios
- [ ] API documentation updates
- [ ] User guide updates

## 🔍 Testing Strategy

### Unit Tests
```javascript
// ProtocolVersionManagementModal.test.jsx
describe('Protocol Version Management', () => {
  test('creates new protocol version with correct data', () => {
    // Test version creation form
  });
  
  test('validates version number uniqueness', () => {
    // Test validation rules
  });
  
  test('handles status transitions correctly', () => {
    // Test status workflow
  });
});
```

### Integration Tests
```javascript
// StudyWorkflow.integration.test.js
describe('Study-Protocol Version Integration', () => {
  test('study status updates when protocol version submitted', () => {
    // Test status synchronization
  });
  
  test('study approval requires approved protocol version', () => {
    // Test dependency validation
  });
});
```

## 📚 Documentation Updates

### Files Requiring Updates
- [ ] STUDY_DESIGN_USER_GUIDE.md - Update status references
- [ ] DATABASE_SCHEMA_README.md - Align status enums
- [ ] API documentation - Update endpoint descriptions
- [ ] Component documentation - Add protocol version components

### User Training Materials
- [ ] Protocol version management workflow guide
- [ ] Amendment creation best practices
- [ ] Regulatory compliance checklist
- [ ] Troubleshooting common issues

## 🎯 Success Metrics

### Functional Requirements
- ✅ Users can manually create protocol versions
- ✅ Version numbers are editable but validated for uniqueness
- ✅ Status transitions follow regulatory requirements
- ✅ Integration with study approval workflow
- ✅ Clear separation between protocol versions and amendments

### User Experience Goals
- ✅ Intuitive interface following existing UI patterns
- ✅ Clear visual indication of current version status
- ✅ Easy access to version history and comparison
- ✅ Context-sensitive actions based on user permissions
- ✅ Seamless integration with existing study workflow

## 🚀 Deployment Strategy

### Phase 1: Status Fix (Immediate)
1. Update all UNDER_REVIEW references
2. Deploy and test status consistency
3. Verify study workflow functionality

### Phase 2: Core Features (Sprint 1)
1. Implement Protocol Version Panel in StudyDesignDashboard
2. Create ProtocolVersionManagementModal
3. Add basic CRUD operations
4. Test integration with existing workflow

### Phase 3: Enhanced Features (Sprint 2)
1. Add version timeline and comparison
2. Implement advanced approval workflows
3. Add notification and audit features
4. Complete user testing and documentation

This comprehensive implementation guide provides the foundation for adding robust, user-controlled protocol version management to the ClinPrecision system while maintaining regulatory compliance and excellent user experience.