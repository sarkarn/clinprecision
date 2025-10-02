# Protocol Version Management - Implementation Guide

**Version:** 2.0  
**Date:** October 2, 2025  
**Audience:** Frontend Developers, Backend Developers, System Architects, QA Engineers  
**Module:** Study Design & Protocol Management

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Critical Status Consistency Issue](#critical-status-consistency-issue)
4. [Component Architecture](#component-architecture)
5. [API Integration](#api-integration)
6. [Frontend Implementation](#frontend-implementation)
7. [State Management](#state-management)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Purpose

This document provides complete technical implementation guidance for the Protocol Version Management feature in ClinPrecision. It covers:

- System architecture and design decisions
- Critical status consistency requirements
- Component-level implementation details
- API integration patterns
- State management strategies
- Testing and deployment procedures

### Target Audience

- **Frontend Developers** - React component implementation
- **Backend Developers** - API service integration
- **System Architects** - Architecture review and decisions
- **QA Engineers** - Testing requirements and strategies
- **DevOps Engineers** - Deployment procedures

### Implementation Phases

The Protocol Version Management feature was implemented in three phases:

| Phase | Focus | Status | Components |
|-------|-------|--------|------------|
| **Phase 1** | Core Components & State Management | ✅ Complete | Modal, Form, Actions, Timeline, Panel, QuickOverview |
| **Phase 2** | Dashboard Integration | ✅ Complete | StudyDesignDashboard integration, navigation |
| **Phase 3** | Advanced Features | 🔄 In Progress | Version comparison, bulk operations, reporting |

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Study Design Dashboard                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Protocol Version Management Panel           │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │      Protocol Version Quick Overview       │    │   │
│  │  └────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │      Protocol Version Timeline             │    │   │
│  │  └────────────────────────────────────────────┘    │   │
│  │  ┌────────────────────────────────────────────┐    │   │
│  │  │      Protocol Version Actions              │    │   │
│  │  └────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
      ┌──────────────────────────────────────────┐
      │    useProtocolVersioning Hook             │
      │  (State Management & Business Logic)      │
      └──────────────────────────────────────────┘
                         │
                         ▼
      ┌──────────────────────────────────────────┐
      │    protocolVersionService API             │
      │  (Backend Communication Layer)            │
      └──────────────────────────────────────────┘
                         │
                         ▼
      ┌──────────────────────────────────────────┐
      │  StudyDesign Service (Backend)            │
      │  /api/studydesign/protocol-versions       │
      └──────────────────────────────────────────┘
```

### Component Hierarchy

```
StudyDesignDashboard
├── ProtocolVersionPanel
│   ├── ProtocolVersionQuickOverview
│   │   ├── Current version display
│   │   ├── Status indicator
│   │   └── Quick actions
│   ├── ProtocolVersionTimeline
│   │   ├── Version history cards
│   │   ├── Status transitions
│   │   └── Timeline navigation
│   ├── ProtocolVersionActions
│   │   ├── Create version button
│   │   ├── Create amendment button
│   │   └── Bulk action buttons
│   └── ProtocolVersionModal
│       └── ProtocolVersionForm
│           ├── Version details inputs
│           ├── Amendment type selector
│           ├── Date picker
│           └── Form validation
└── useProtocolVersioning (custom hook)
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend Framework** | React 18.2+ | Component architecture |
| **State Management** | Custom Hooks + Context | Protocol version state |
| **UI Library** | Ant Design 5.x | UI components |
| **HTTP Client** | Axios | API communication |
| **Date Handling** | Day.js | Date formatting and validation |
| **Form Validation** | Ant Design Form + Custom | Input validation |
| **Styling** | CSS Modules | Component-scoped styles |

---

## Critical Status Consistency Issue

### 🚨 CRITICAL: Status Naming Inconsistency

**Issue Identified:** October 2, 2025

There is a **critical inconsistency** between backend and frontend status naming that MUST be resolved:

#### Backend Enum Definition
```java
// Backend: StudyStatus.java
public enum StudyStatus {
    DRAFT,
    PLANNING,
    PROTOCOL_REVIEW,  // ✅ Backend uses PROTOCOL_REVIEW
    APPROVED,
    ACTIVE,
    COMPLETED,
    TERMINATED,
    SUSPENDED
}
```

#### Frontend Implementation (INCORRECT)
```javascript
// Frontend: Current implementation uses WRONG status name
const PROTOCOL_STATUS = {
  DRAFT: 'DRAFT',
  UNDER_REVIEW: 'UNDER_REVIEW',  // ❌ WRONG - Backend doesn't recognize this
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  SUPERSEDED: 'SUPERSEDED',
  WITHDRAWN: 'WITHDRAWN'
};
```

### Impact

This inconsistency causes:

1. **API Request Failures** - Backend rejects status updates with `UNDER_REVIEW`
2. **Status Display Errors** - UI shows incorrect status
3. **Workflow Breaks** - Submit for review functionality fails
4. **Data Sync Issues** - Frontend and backend status out of sync

### Required Fix

#### 1. Update Frontend Constants

**File:** `src/constants/protocolVersionConstants.js`

```javascript
// BEFORE (WRONG)
export const PROTOCOL_VERSION_STATUS = {
  DRAFT: 'DRAFT',
  UNDER_REVIEW: 'UNDER_REVIEW',  // ❌ WRONG
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  SUPERSEDED: 'SUPERSEDED',
  WITHDRAWN: 'WITHDRAWN'
};

// AFTER (CORRECT)
export const PROTOCOL_VERSION_STATUS = {
  DRAFT: 'DRAFT',
  PROTOCOL_REVIEW: 'PROTOCOL_REVIEW',  // ✅ CORRECT - matches backend
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  SUPERSEDED: 'SUPERSEDED',
  WITHDRAWN: 'WITHDRAWN'
};
```

#### 2. Update Status Display Labels

**File:** `src/constants/protocolVersionConstants.js`

```javascript
export const STATUS_LABELS = {
  DRAFT: 'Draft',
  PROTOCOL_REVIEW: 'Under Review',  // ✅ Display label can still say "Under Review"
  APPROVED: 'Approved',
  ACTIVE: 'Active',
  SUPERSEDED: 'Superseded',
  WITHDRAWN: 'Withdrawn'
};

export const STATUS_COLORS = {
  DRAFT: 'default',
  PROTOCOL_REVIEW: 'processing',  // Blue/processing indicator
  APPROVED: 'success',
  ACTIVE: 'success',
  SUPERSEDED: 'warning',
  WITHDRAWN: 'error'
};
```

#### 3. Update All Component References

**Files requiring updates:**

1. **ProtocolVersionForm.jsx**
   - Line ~156: Status transition logic
   - Line ~203: Submit for review handler

2. **ProtocolVersionTimeline.jsx**
   - Line ~78: Status badge display
   - Line ~134: Status filter logic

3. **ProtocolVersionQuickOverview.jsx**
   - Line ~45: Current status display
   - Line ~89: Status change notification

4. **ProtocolVersionActions.jsx**
   - Line ~67: Action button visibility
   - Line ~112: Status-based action enabling

5. **useProtocolVersioning.js**
   - Line ~234: submitForReview function
   - Line ~189: Status validation

6. **protocolVersionService.js**
   - Line ~98: API request payload
   - Line ~145: Status parameter validation

### Implementation Checklist

Use this checklist to ensure complete fix:

- [ ] Update `PROTOCOL_VERSION_STATUS` constant
- [ ] Add `STATUS_LABELS` mapping for display
- [ ] Update `ProtocolVersionForm.jsx` status references
- [ ] Update `ProtocolVersionTimeline.jsx` status display
- [ ] Update `ProtocolVersionQuickOverview.jsx` status display
- [ ] Update `ProtocolVersionActions.jsx` action logic
- [ ] Update `useProtocolVersioning.js` hook
- [ ] Update `protocolVersionService.js` API service
- [ ] Search codebase for any other `UNDER_REVIEW` references
- [ ] Update unit tests with correct status
- [ ] Update integration tests
- [ ] Test complete workflow: Draft → Protocol Review → Approved → Active
- [ ] Verify backend communication successful
- [ ] Update documentation

### Testing Requirements

After fix implementation:

```javascript
// Test Case 1: Submit for Review
test('should update status to PROTOCOL_REVIEW when submitting for review', async () => {
  const version = { id: '123', status: 'DRAFT' };
  const result = await submitForReview(version.id);
  expect(result.status).toBe('PROTOCOL_REVIEW');  // ✅ Must be PROTOCOL_REVIEW
});

// Test Case 2: API Communication
test('should send PROTOCOL_REVIEW status to backend', async () => {
  const mockAxios = jest.spyOn(axios, 'put');
  await updateVersionStatus('123', 'PROTOCOL_REVIEW');
  expect(mockAxios).toHaveBeenCalledWith(
    expect.any(String),
    expect.objectContaining({ status: 'PROTOCOL_REVIEW' })
  );
});

// Test Case 3: Display Label
test('should display "Under Review" for PROTOCOL_REVIEW status', () => {
  const { getByText } = render(<StatusBadge status="PROTOCOL_REVIEW" />);
  expect(getByText('Under Review')).toBeInTheDocument();
});
```

### Deployment Notes

⚠️ **This is a BREAKING CHANGE**

- Coordinate with backend team
- Verify backend enum hasn't changed
- Test in staging environment first
- Plan for potential data migration
- Communicate with QA team
- Update user documentation

---

## Component Architecture

### Core Components

#### 1. ProtocolVersionModal

**Purpose:** Container for protocol version creation/editing form

**Location:** `src/components/StudyDesign/ProtocolVersion/ProtocolVersionModal.jsx`

**Props:**
```javascript
{
  visible: boolean,           // Modal visibility
  mode: 'create' | 'edit',    // Creation or edit mode
  version: object | null,     // Version to edit (null for create)
  onClose: function,          // Close handler
  onSuccess: function         // Success callback
}
```

**Key Features:**
- Modal dialog wrapper
- Handles create/edit modes
- Form submission orchestration
- Success/error notifications
- Loading states

**Implementation:**
```javascript
import React from 'react';
import { Modal } from 'antd';
import ProtocolVersionForm from './ProtocolVersionForm';

const ProtocolVersionModal = ({ 
  visible, 
  mode, 
  version, 
  onClose, 
  onSuccess 
}) => {
  return (
    <Modal
      title={mode === 'create' ? 'Create Protocol Version' : 'Edit Protocol Version'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <ProtocolVersionForm
        mode={mode}
        version={version}
        onSuccess={onSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default ProtocolVersionModal;
```

---

#### 2. ProtocolVersionForm

**Purpose:** Form for creating/editing protocol versions

**Location:** `src/components/StudyDesign/ProtocolVersion/ProtocolVersionForm.jsx`

**Props:**
```javascript
{
  mode: 'create' | 'edit',
  version: object | null,
  studyId: string,
  onSuccess: function,
  onCancel: function
}
```

**Form Fields:**
- **versionNumber** (string, required) - Format: X.Y
- **description** (string, required) - Max 500 chars
- **amendmentType** (enum, required) - INITIAL|MINOR|MAJOR|SUBSTANTIAL
- **effectiveDate** (date, optional) - Future date validation
- **changeSummary** (string, optional) - Detailed change description
- **rationale** (string, optional) - Justification for changes
- **impactAssessment** (string, optional) - Impact analysis
- **regulatoryApprovalRequired** (boolean) - Default: false
- **notifyStakeholders** (boolean) - Default: true

**Validation Rules:**
```javascript
const validationRules = {
  versionNumber: {
    required: true,
    pattern: /^\d+\.\d+$/,
    message: 'Version must be in format X.Y (e.g., 1.0, 2.1)'
  },
  description: {
    required: true,
    maxLength: 500,
    message: 'Description is required (max 500 characters)'
  },
  amendmentType: {
    required: true,
    message: 'Amendment type is required'
  },
  effectiveDate: {
    validator: (rule, value) => {
      if (value && value.isBefore(dayjs(), 'day')) {
        return Promise.reject('Effective date must be today or in the future');
      }
      return Promise.resolve();
    }
  }
};
```

**Key Features:**
- Dynamic field visibility based on mode
- Version number auto-suggestion
- Amendment type selection
- Date picker with validation
- Rich text editor for descriptions
- Form validation
- Auto-save draft capability

---

#### 3. ProtocolVersionTimeline

**Purpose:** Visual timeline display of protocol version history

**Location:** `src/components/StudyDesign/ProtocolVersion/ProtocolVersionTimeline.jsx`

**Props:**
```javascript
{
  versions: array,              // Array of version objects
  currentVersionId: string,     // ID of active version
  onVersionClick: function,     // Click handler for version details
  onVersionEdit: function,      // Edit handler
  onVersionDelete: function     // Delete handler (draft only)
}
```

**Display Features:**
- Chronological timeline layout
- Version cards with key info
- Status badges with colors
- Action buttons per version
- Active version highlighting
- Responsive design

**Implementation Pattern:**
```javascript
const ProtocolVersionTimeline = ({ versions, currentVersionId, onVersionClick }) => {
  const sortedVersions = [...versions].sort((a, b) => 
    new Date(b.createdDate) - new Date(a.createdDate)
  );

  return (
    <div className="protocol-version-timeline">
      <Timeline>
        {sortedVersions.map(version => (
          <Timeline.Item
            key={version.id}
            color={getStatusColor(version.status)}
            className={version.id === currentVersionId ? 'active' : ''}
          >
            <VersionCard 
              version={version}
              isActive={version.id === currentVersionId}
              onClick={() => onVersionClick(version)}
            />
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};
```

---

#### 4. ProtocolVersionActions

**Purpose:** Action buttons for protocol version operations

**Location:** `src/components/StudyDesign/ProtocolVersion/ProtocolVersionActions.jsx`

**Props:**
```javascript
{
  version: object,               // Current version
  onCreateVersion: function,     // Create new version handler
  onCreateAmendment: function,   // Create amendment handler
  onSubmitReview: function,      // Submit for review handler
  onApprove: function,           // Approve handler
  onActivate: function,          // Activate handler
  onWithdraw: function,          // Withdraw handler
  permissions: object            // User permissions
}
```

**Action Logic:**
```javascript
const getAvailableActions = (version, permissions) => {
  const actions = [];

  // Create Version - only if no active version or user is manager
  if (!hasActiveVersion || permissions.canCreateVersion) {
    actions.push('CREATE_VERSION');
  }

  // Create Amendment - only if there's an active version
  if (hasActiveVersion && permissions.canCreateAmendment) {
    actions.push('CREATE_AMENDMENT');
  }

  // Submit for Review - only DRAFT versions
  if (version.status === 'DRAFT' && permissions.canSubmit) {
    actions.push('SUBMIT_REVIEW');
  }

  // Approve - only PROTOCOL_REVIEW versions
  if (version.status === 'PROTOCOL_REVIEW' && permissions.canApprove) {
    actions.push('APPROVE');
    actions.push('REJECT');
  }

  // Activate - only APPROVED versions
  if (version.status === 'APPROVED' && permissions.canActivate) {
    actions.push('ACTIVATE');
  }

  // Withdraw - any non-terminal status
  if (!['ACTIVE', 'SUPERSEDED', 'WITHDRAWN'].includes(version.status) && 
      permissions.canWithdraw) {
    actions.push('WITHDRAW');
  }

  return actions;
};
```

---

#### 5. ProtocolVersionPanel

**Purpose:** Main container panel integrating all protocol version components

**Location:** `src/components/StudyDesign/ProtocolVersion/ProtocolVersionPanel.jsx`

**Props:**
```javascript
{
  studyId: string,              // Current study ID
  expanded: boolean,            // Panel expansion state
  onToggle: function            // Toggle expansion handler
}
```

**Component Structure:**
```javascript
const ProtocolVersionPanel = ({ studyId, expanded, onToggle }) => {
  const {
    versions,
    currentVersion,
    loading,
    createVersion,
    createAmendment,
    updateVersion,
    deleteVersion,
    submitForReview,
    approveVersion,
    activateVersion
  } = useProtocolVersioning(studyId);

  return (
    <Panel 
      header="Protocol Version Management"
      expanded={expanded}
      onToggle={onToggle}
    >
      <ProtocolVersionQuickOverview 
        currentVersion={currentVersion}
        totalVersions={versions.length}
      />
      
      <ProtocolVersionActions
        version={currentVersion}
        onCreateVersion={handleCreateVersion}
        onCreateAmendment={handleCreateAmendment}
      />
      
      <ProtocolVersionTimeline
        versions={versions}
        currentVersionId={currentVersion?.id}
        onVersionClick={handleVersionClick}
      />
      
      <ProtocolVersionModal
        visible={modalVisible}
        mode={modalMode}
        version={selectedVersion}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </Panel>
  );
};
```

---

#### 6. ProtocolVersionQuickOverview

**Purpose:** Summary display of current protocol version status

**Location:** `src/components/StudyDesign/ProtocolVersion/ProtocolVersionQuickOverview.jsx`

**Props:**
```javascript
{
  currentVersion: object | null,  // Active version object
  totalVersions: number,          // Total version count
  pendingApprovals: number        // Count of versions in review
}
```

**Display Elements:**
- Current version number
- Current status badge
- Last modified date
- Total version count
- Pending approval indicator
- Quick action buttons

---

## API Integration

### API Service Layer

**File:** `src/services/protocolVersionService.js`

### Endpoint Mapping

| Operation | Method | Endpoint | Purpose |
|-----------|--------|----------|---------|
| List Versions | GET | `/api/studydesign/studies/{studyId}/protocol-versions` | Get all versions for study |
| Get Version | GET | `/api/studydesign/protocol-versions/{versionId}` | Get single version details |
| Create Version | POST | `/api/studydesign/studies/{studyId}/protocol-versions` | Create new version |
| Update Version | PUT | `/api/studydesign/protocol-versions/{versionId}` | Update existing version |
| Delete Version | DELETE | `/api/studydesign/protocol-versions/{versionId}` | Delete draft version |
| Submit Review | PUT | `/api/studydesign/protocol-versions/{versionId}/submit` | Submit for review |
| Approve | PUT | `/api/studydesign/protocol-versions/{versionId}/approve` | Approve version |
| Reject | PUT | `/api/studydesign/protocol-versions/{versionId}/reject` | Reject back to draft |
| Activate | PUT | `/api/studydesign/protocol-versions/{versionId}/activate` | Activate version |
| Withdraw | PUT | `/api/studydesign/protocol-versions/{versionId}/withdraw` | Withdraw version |

### Service Implementation

```javascript
import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';

const API_BASE_URL = '/api/studydesign';

// Get all protocol versions for a study
export const getProtocolVersions = async (studyId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/studies/${studyId}/protocol-versions`
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get single protocol version
export const getProtocolVersion = async (versionId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/protocol-versions/${versionId}`
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Create new protocol version
export const createProtocolVersion = async (studyId, versionData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/studies/${studyId}/protocol-versions`,
      {
        ...versionData,
        status: 'DRAFT'  // Always create as DRAFT
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Update protocol version (DRAFT only)
export const updateProtocolVersion = async (versionId, versionData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/protocol-versions/${versionId}`,
      versionData
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Submit for review - ✅ MUST use PROTOCOL_REVIEW status
export const submitForReview = async (versionId, comments = '') => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/protocol-versions/${versionId}/submit`,
      {
        status: 'PROTOCOL_REVIEW',  // ✅ CRITICAL: Use PROTOCOL_REVIEW
        comments
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Approve version
export const approveVersion = async (versionId, approvalData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/protocol-versions/${versionId}/approve`,
      {
        approvedBy: approvalData.approvedBy,
        approvalDate: approvalData.approvalDate,
        comments: approvalData.comments
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Activate version
export const activateVersion = async (versionId, effectiveDate) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/protocol-versions/${versionId}/activate`,
      {
        effectiveDate: effectiveDate || new Date().toISOString()
      }
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Delete version (DRAFT only)
export const deleteProtocolVersion = async (versionId) => {
  try {
    await axios.delete(
      `${API_BASE_URL}/protocol-versions/${versionId}`
    );
    return { success: true };
  } catch (error) {
    throw handleApiError(error);
  }
};
```

### Request/Response Formats

#### Create Version Request
```json
{
  "versionNumber": "1.0",
  "description": "Initial protocol version",
  "amendmentType": "INITIAL",
  "effectiveDate": "2025-11-01T00:00:00Z",
  "changeSummary": "",
  "rationale": "",
  "impactAssessment": "",
  "regulatoryApprovalRequired": true,
  "notifyStakeholders": true
}
```

#### Version Response
```json
{
  "id": "pv_123456789",
  "studyId": "study_987654321",
  "versionNumber": "1.0",
  "status": "DRAFT",
  "amendmentType": "INITIAL",
  "description": "Initial protocol version",
  "effectiveDate": "2025-11-01T00:00:00Z",
  "createdBy": "user_123",
  "createdDate": "2025-10-02T16:30:00Z",
  "lastModifiedBy": "user_123",
  "lastModifiedDate": "2025-10-02T16:30:00Z",
  "approvalHistory": [],
  "changeLog": []
}
```

---

## Frontend Implementation

### Custom Hook: useProtocolVersioning

**File:** `src/hooks/useProtocolVersioning.js`

**Purpose:** Centralized state management and business logic for protocol versions

```javascript
import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import * as protocolVersionService from '../services/protocolVersionService';

const useProtocolVersioning = (studyId) => {
  const [versions, setVersions] = useState([]);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all versions
  const loadVersions = useCallback(async () => {
    if (!studyId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await protocolVersionService.getProtocolVersions(studyId);
      setVersions(data);
      
      // Find active version
      const active = data.find(v => v.status === 'ACTIVE');
      setCurrentVersion(active || null);
    } catch (err) {
      setError(err.message);
      message.error('Failed to load protocol versions');
    } finally {
      setLoading(false);
    }
  }, [studyId]);

  // Create new version
  const createVersion = useCallback(async (versionData) => {
    setLoading(true);
    try {
      const newVersion = await protocolVersionService.createProtocolVersion(
        studyId,
        versionData
      );
      await loadVersions(); // Reload all versions
      message.success('Protocol version created successfully');
      return newVersion;
    } catch (err) {
      message.error('Failed to create protocol version');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [studyId, loadVersions]);

  // Submit for review - ✅ Uses PROTOCOL_REVIEW status
  const submitForReview = useCallback(async (versionId, comments) => {
    setLoading(true);
    try {
      await protocolVersionService.submitForReview(versionId, comments);
      await loadVersions();
      message.success('Version submitted for review');
    } catch (err) {
      message.error('Failed to submit for review');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadVersions]);

  // Approve version
  const approveVersion = useCallback(async (versionId, approvalData) => {
    setLoading(true);
    try {
      await protocolVersionService.approveVersion(versionId, approvalData);
      await loadVersions();
      message.success('Version approved successfully');
    } catch (err) {
      message.error('Failed to approve version');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadVersions]);

  // Activate version
  const activateVersion = useCallback(async (versionId, effectiveDate) => {
    setLoading(true);
    try {
      await protocolVersionService.activateVersion(versionId, effectiveDate);
      await loadVersions();
      message.success('Version activated successfully');
    } catch (err) {
      message.error('Failed to activate version');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadVersions]);

  // Delete version (DRAFT only)
  const deleteVersion = useCallback(async (versionId) => {
    setLoading(true);
    try {
      await protocolVersionService.deleteProtocolVersion(versionId);
      await loadVersions();
      message.success('Version deleted successfully');
    } catch (err) {
      message.error('Failed to delete version');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadVersions]);

  // Load versions on mount
  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  return {
    versions,
    currentVersion,
    loading,
    error,
    createVersion,
    submitForReview,
    approveVersion,
    activateVersion,
    deleteVersion,
    reloadVersions: loadVersions
  };
};

export default useProtocolVersioning;
```

---

## State Management

### State Flow

```
User Action
    ↓
Component Handler
    ↓
useProtocolVersioning Hook
    ↓
API Service Layer
    ↓
Backend API
    ↓
Response Processing
    ↓
State Update
    ↓
Component Re-render
```

### State Structure

```javascript
{
  // Protocol versions state
  versions: [
    {
      id: string,
      versionNumber: string,
      status: string,  // ✅ Must be PROTOCOL_REVIEW (not UNDER_REVIEW)
      amendmentType: string,
      description: string,
      effectiveDate: string,
      createdDate: string,
      createdBy: string,
      // ... other fields
    }
  ],
  
  // Current active version
  currentVersion: object | null,
  
  // Loading states
  loading: boolean,
  
  // Error handling
  error: string | null
}
```

---

## Testing Strategy

### Unit Tests

**File:** `src/components/StudyDesign/ProtocolVersion/__tests__/ProtocolVersionForm.test.js`

```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProtocolVersionForm from '../ProtocolVersionForm';

describe('ProtocolVersionForm', () => {
  test('renders form with all required fields', () => {
    render(<ProtocolVersionForm mode="create" />);
    
    expect(screen.getByLabelText('Version Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Amendment Type')).toBeInTheDocument();
  });

  test('validates version number format', async () => {
    render(<ProtocolVersionForm mode="create" />);
    
    const versionInput = screen.getByLabelText('Version Number');
    fireEvent.change(versionInput, { target: { value: 'invalid' } });
    fireEvent.blur(versionInput);
    
    await waitFor(() => {
      expect(screen.getByText(/Version must be in format X.Y/)).toBeInTheDocument();
    });
  });

  // ✅ Test correct status usage
  test('creates version with PROTOCOL_REVIEW status when submitting', async () => {
    const onSuccess = jest.fn();
    render(<ProtocolVersionForm mode="create" onSuccess={onSuccess} />);
    
    // Fill form and submit...
    // Verify that status is PROTOCOL_REVIEW (not UNDER_REVIEW)
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'PROTOCOL_REVIEW' })
    );
  });
});
```

### Integration Tests

Test complete workflows:
- Create version → Submit → Approve → Activate
- Create amendment → Submit → Approve → Activate (supersedes previous)
- Reject workflow → Back to draft → Resubmit

### E2E Tests

**File:** `cypress/e2e/protocol-version-management.cy.js`

```javascript
describe('Protocol Version Management E2E', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/study-design/study-123');
  });

  it('should create and activate first protocol version', () => {
    // Click create button
    cy.get('[data-testid="create-version-btn"]').click();
    
    // Fill form
    cy.get('[name="versionNumber"]').type('1.0');
    cy.get('[name="description"]').type('Initial protocol');
    cy.get('[name="amendmentType"]').select('INITIAL');
    
    // Submit form
    cy.get('[data-testid="submit-btn"]').click();
    
    // Verify creation
    cy.contains('Protocol version created successfully');
    
    // Submit for review
    cy.get('[data-testid="submit-review-btn"]').click();
    
    // ✅ Verify correct status
    cy.get('[data-testid="status-badge"]').should('contain', 'Under Review');
    cy.get('[data-testid="status-badge"]').should('have.attr', 'data-status', 'PROTOCOL_REVIEW');
  });
});
```

---

## Deployment

### Pre-Deployment Checklist

- [ ] ✅ Status consistency issue resolved (UNDER_REVIEW → PROTOCOL_REVIEW)
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Backend API endpoints verified
- [ ] Database migrations applied (if needed)
- [ ] Environment variables configured

### Deployment Steps

1. **Merge to develop branch**
   ```bash
   git checkout develop
   git merge feature/protocol-version-management
   git push origin develop
   ```

2. **Deploy to staging**
   - Automated CI/CD pipeline triggered
   - Run smoke tests in staging
   - Verify all functionality

3. **QA validation in staging**
   - QA team performs full regression
   - Test all user workflows
   - Verify status consistency

4. **Production deployment**
   - Schedule maintenance window if needed
   - Deploy backend changes first
   - Deploy frontend changes
   - Verify deployment
   - Monitor error logs

5. **Post-deployment validation**
   - Smoke test in production
   - Monitor application logs
   - Check error tracking (Sentry/etc.)
   - Verify user access

### Rollback Plan

If critical issues discovered:

1. Rollback frontend to previous version
2. Rollback backend if needed
3. Restore database if migrations applied
4. Communicate with users
5. Investigate and fix issues
6. Redeploy with fixes

---

## Troubleshooting

### Common Development Issues

#### Issue: Status mismatch errors

**Symptom:** API returns 400 error when updating status

**Cause:** Using `UNDER_REVIEW` instead of `PROTOCOL_REVIEW`

**Fix:** Update all references to use `PROTOCOL_REVIEW`

---

#### Issue: Form validation not triggering

**Symptom:** Invalid data being submitted

**Cause:** Ant Design Form validation rules not properly configured

**Fix:**
```javascript
<Form.Item
  name="versionNumber"
  rules={[
    { required: true, message: 'Version number is required' },
    { pattern: /^\d+\.\d+$/, message: 'Must be format X.Y' }
  ]}
>
  <Input placeholder="1.0" />
</Form.Item>
```

---

#### Issue: Timeline not updating after create

**Symptom:** New version not appearing in timeline

**Cause:** Not reloading versions after creation

**Fix:** Call `reloadVersions()` after successful creation

---

### Production Issues

#### Issue: Version activation fails

**Check:**
1. Is there already an active version?
2. Does user have activation permission?
3. Is version status APPROVED?
4. Check backend logs for errors

#### Issue: Notifications not being sent

**Check:**
1. Email service configuration
2. Notification service status
3. User email preferences
4. Backend notification logs

---

## Document Information

**Version:** 2.0  
**Last Updated:** October 2, 2025  
**Document Owner:** ClinPrecision Development Team  
**Review Cycle:** After each major feature update

**Related Documents:**
- [Protocol Version User Guide](./PROTOCOL_VERSION_USER_GUIDE.md)
- [Protocol Version Status Workflow](./PROTOCOL_VERSION_STATUS_WORKFLOW.md)
- [Protocol Version Lifecycle](./PROTOCOL_VERSION_LIFECYCLE.md)

**Change History:**
- Version 1.0 (June 2025): Initial implementation documentation
- Version 1.5 (August 2025): Added dashboard integration
- Version 2.0 (October 2025): Consolidated from multiple sources, added critical status fix documentation

---

*This document is proprietary and confidential. Unauthorized distribution is prohibited.*
