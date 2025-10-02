# Study Database Build - Frontend UI Integration Plan

**Date:** October 2, 2025  
**Backend Status:** Phase 1-4 Complete ✅  
**Frontend Status:** Not Started ⏳

---

## 🎯 Overview

This document outlines the complete plan for integrating the Study Database Build feature with the ClinPrecision React frontend. The feature will be added to the **Study Management** module with a dedicated UI for database build operations.

---

## 📋 Table of Contents

1. [UI Component Architecture](#ui-component-architecture)
2. [Navigation Integration](#navigation-integration)
3. [API Integration Layer](#api-integration-layer)
4. [Component Implementation Plan](#component-implementation-plan)
5. [State Management](#state-management)
6. [Real-time Updates](#real-time-updates)
7. [User Experience Flow](#user-experience-flow)
8. [Wireframes & Mockups](#wireframes--mockups)
9. [Implementation Timeline](#implementation-timeline)
10. [Testing Strategy](#testing-strategy)

---

## 1. UI Component Architecture

### Component Hierarchy

```
StudyManagement/
├── StudyDatabaseBuildPage.jsx              (Main page container)
│   ├── StudyDatabaseBuildHeader.jsx        (Page header with actions)
│   ├── StudyDatabaseBuildList.jsx          (List of all builds)
│   │   ├── StudyDatabaseBuildCard.jsx      (Individual build card)
│   │   │   ├── BuildStatusBadge.jsx        (Status indicator)
│   │   │   ├── BuildProgressBar.jsx        (Progress visualization)
│   │   │   └── BuildActionsMenu.jsx        (Actions dropdown)
│   │   └── StudyDatabaseBuildFilters.jsx   (Filter & search controls)
│   ├── BuildStudyDatabaseModal.jsx         (Create new build modal)
│   ├── BuildDetailsModal.jsx               (View build details)
│   ├── CancelBuildModal.jsx                (Confirm cancellation)
│   └── BuildMetricsCard.jsx                (Build statistics)
└── hooks/
    ├── useStudyDatabaseBuilds.js           (Custom hook for builds)
    ├── useBuildStatus.js                   (Real-time status updates)
    └── useBuildActions.js                  (Command operations)
```

### Component Responsibilities

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| **StudyDatabaseBuildPage** | Main container | Layout, routing, state management |
| **StudyDatabaseBuildList** | Display builds | Pagination, filtering, sorting |
| **StudyDatabaseBuildCard** | Single build | Status, progress, actions |
| **BuildStudyDatabaseModal** | Create build | Form validation, submission |
| **BuildDetailsModal** | View details | Metrics, logs, validation results |
| **CancelBuildModal** | Cancel build | Confirmation, reason input |

---

## 2. Navigation Integration

### Add to Study Management Menu

**Location:** `frontend/clinprecision/src/components/modules/studymanagement/`

#### Update StudyManagementLayout.jsx

```jsx
const navigationItems = [
  { name: 'Studies', path: '/studies', icon: BeakerIcon },
  { name: 'Study Sites', path: '/study-sites', icon: BuildingOfficeIcon },
  { name: 'Database Build', path: '/database-builds', icon: CircleStackIcon }, // NEW
  { name: 'Settings', path: '/settings', icon: CogIcon },
];
```

#### Add Route in App.jsx

```jsx
// In Routes configuration
<Route path="/study-management/database-builds" element={<StudyDatabaseBuildPage />} />
```

### Breadcrumb Navigation

```
Home > Study Management > Database Builds > [Build Details]
```

---

## 3. API Integration Layer

### Create API Service

**File:** `frontend/clinprecision/src/services/studyDatabaseBuildService.js`

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';
const STUDY_DB_BUILD_API = `${API_BASE_URL}/api/v1/study-database-builds`;

class StudyDatabaseBuildService {
  
  // ==================== COMMAND OPERATIONS ====================
  
  /**
   * Build a study database
   * POST /api/v1/study-database-builds
   */
  async buildStudyDatabase(buildRequest) {
    const response = await axios.post(STUDY_DB_BUILD_API, buildRequest);
    return response.data;
  }
  
  /**
   * Validate a study database
   * POST /api/v1/study-database-builds/{buildRequestId}/validate
   */
  async validateStudyDatabase(buildRequestId, validationOptions) {
    const response = await axios.post(
      `${STUDY_DB_BUILD_API}/${buildRequestId}/validate`,
      validationOptions
    );
    return response.data;
  }
  
  /**
   * Cancel a study database build
   * POST /api/v1/study-database-builds/{buildRequestId}/cancel
   */
  async cancelStudyDatabaseBuild(buildRequestId, cancellationReason) {
    const response = await axios.post(
      `${STUDY_DB_BUILD_API}/${buildRequestId}/cancel`,
      { cancellationReason }
    );
    return response.data;
  }
  
  /**
   * Complete a study database build
   * POST /api/v1/study-database-builds/{buildRequestId}/complete
   */
  async completeStudyDatabaseBuild(buildRequestId, completionData) {
    const response = await axios.post(
      `${STUDY_DB_BUILD_API}/${buildRequestId}/complete`,
      completionData
    );
    return response.data;
  }
  
  // ==================== QUERY OPERATIONS ====================
  
  /**
   * Get build by ID
   * GET /api/v1/study-database-builds/{id}
   */
  async getBuildById(id) {
    const response = await axios.get(`${STUDY_DB_BUILD_API}/${id}`);
    return response.data;
  }
  
  /**
   * Get build by request ID
   * GET /api/v1/study-database-builds/request/{buildRequestId}
   */
  async getBuildByRequestId(buildRequestId) {
    const response = await axios.get(`${STUDY_DB_BUILD_API}/request/${buildRequestId}`);
    return response.data;
  }
  
  /**
   * Get all builds for a study
   * GET /api/v1/study-database-builds/study/{studyId}
   */
  async getBuildsByStudyId(studyId) {
    const response = await axios.get(`${STUDY_DB_BUILD_API}/study/${studyId}`);
    return response.data;
  }
  
  /**
   * Get latest build for a study
   * GET /api/v1/study-database-builds/study/{studyId}/latest
   */
  async getLatestBuildForStudy(studyId) {
    const response = await axios.get(`${STUDY_DB_BUILD_API}/study/${studyId}/latest`);
    return response.data;
  }
  
  /**
   * Get in-progress builds
   * GET /api/v1/study-database-builds/in-progress
   */
  async getInProgressBuilds() {
    const response = await axios.get(`${STUDY_DB_BUILD_API}/in-progress`);
    return response.data;
  }
  
  /**
   * Get recent builds
   * GET /api/v1/study-database-builds/recent?days=7
   */
  async getRecentBuilds(days = 7) {
    const response = await axios.get(`${STUDY_DB_BUILD_API}/recent?days=${days}`);
    return response.data;
  }
  
  /**
   * Check if study has active build
   * GET /api/v1/study-database-builds/study/{studyId}/has-active
   */
  async hasActiveBuild(studyId) {
    const response = await axios.get(`${STUDY_DB_BUILD_API}/study/${studyId}/has-active`);
    return response.data.hasActiveBuild;
  }
  
  /**
   * Get build statistics for study
   * GET /api/v1/study-database-builds/study/{studyId}/count
   */
  async getBuildCountForStudy(studyId) {
    const response = await axios.get(`${STUDY_DB_BUILD_API}/study/${studyId}/count`);
    return response.data.count;
  }
}

export default new StudyDatabaseBuildService();
```

---

## 4. Component Implementation Plan

### 4.1 Main Page Component

**File:** `StudyDatabaseBuildPage.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import StudyDatabaseBuildList from './StudyDatabaseBuildList';
import BuildStudyDatabaseModal from './BuildStudyDatabaseModal';
import BuildMetricsCard from './BuildMetricsCard';
import { useStudyDatabaseBuilds } from './hooks/useStudyDatabaseBuilds';

const StudyDatabaseBuildPage = () => {
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null);
  
  const {
    builds,
    loading,
    error,
    refreshBuilds,
    inProgressCount,
    completedCount,
    failedCount
  } = useStudyDatabaseBuilds();
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Study Database Builds
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and monitor study database build processes
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={refreshBuilds}
            className="btn-secondary"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowBuildModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Build Database
          </button>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <BuildMetricsCard
          title="In Progress"
          count={inProgressCount}
          color="blue"
          icon="clock"
        />
        <BuildMetricsCard
          title="Completed"
          count={completedCount}
          color="green"
          icon="check"
        />
        <BuildMetricsCard
          title="Failed"
          count={failedCount}
          color="red"
          icon="exclamation"
        />
        <BuildMetricsCard
          title="Total Builds"
          count={builds.length}
          color="gray"
          icon="database"
        />
      </div>
      
      {/* Build List */}
      <StudyDatabaseBuildList
        builds={builds}
        loading={loading}
        error={error}
        onRefresh={refreshBuilds}
      />
      
      {/* Build Modal */}
      {showBuildModal && (
        <BuildStudyDatabaseModal
          isOpen={showBuildModal}
          onClose={() => setShowBuildModal(false)}
          onSuccess={refreshBuilds}
          selectedStudy={selectedStudy}
        />
      )}
    </div>
  );
};

export default StudyDatabaseBuildPage;
```

### 4.2 Build List Component

**File:** `StudyDatabaseBuildList.jsx`

```jsx
import React, { useState } from 'react';
import StudyDatabaseBuildCard from './StudyDatabaseBuildCard';
import StudyDatabaseBuildFilters from './StudyDatabaseBuildFilters';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

const StudyDatabaseBuildList = ({ builds, loading, error, onRefresh }) => {
  const [filters, setFilters] = useState({
    status: 'ALL',
    studyId: null,
    searchTerm: '',
    sortBy: 'startTime',
    sortOrder: 'desc'
  });
  
  // Filter and sort builds
  const filteredBuilds = builds
    .filter(build => {
      if (filters.status !== 'ALL' && build.buildStatus !== filters.status) return false;
      if (filters.studyId && build.studyId !== filters.studyId) return false;
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          build.studyName?.toLowerCase().includes(searchLower) ||
          build.buildRequestId?.toLowerCase().includes(searchLower) ||
          build.studyProtocol?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aValue = a[filters.sortBy];
      const bValue = b[filters.sortBy];
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      return aValue > bValue ? order : -order;
    });
  
  if (loading) {
    return <LoadingSpinner message="Loading builds..." />;
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading builds: {error.message}</p>
        <button onClick={onRefresh} className="btn-secondary mt-2">
          Retry
        </button>
      </div>
    );
  }
  
  if (builds.length === 0) {
    return (
      <EmptyState
        title="No Database Builds"
        description="Start by building a database for your study"
        icon="database"
      />
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Filters */}
      <StudyDatabaseBuildFilters
        filters={filters}
        onFilterChange={setFilters}
        totalBuilds={builds.length}
        filteredBuilds={filteredBuilds.length}
      />
      
      {/* Build Cards */}
      <div className="space-y-3">
        {filteredBuilds.map(build => (
          <StudyDatabaseBuildCard
            key={build.id}
            build={build}
            onRefresh={onRefresh}
          />
        ))}
      </div>
      
      {filteredBuilds.length === 0 && (
        <EmptyState
          title="No Matching Builds"
          description="Try adjusting your filters"
          icon="filter"
        />
      )}
    </div>
  );
};

export default StudyDatabaseBuildList;
```

### 4.3 Build Card Component

**File:** `StudyDatabaseBuildCard.jsx`

```jsx
import React, { useState } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  StopCircleIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import BuildStatusBadge from './BuildStatusBadge';
import BuildProgressBar from './BuildProgressBar';
import BuildActionsMenu from './BuildActionsMenu';
import BuildDetailsModal from './BuildDetailsModal';
import { formatDateTime, formatDuration } from '../../../utils/dateUtils';

const StudyDatabaseBuildCard = ({ build, onRefresh }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'CANCELLED':
        return <StopCircleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          {/* Left Section - Build Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-3">
              {getStatusIcon(build.buildStatus)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {build.studyName}
                </h3>
                <p className="text-sm text-gray-600">
                  Protocol: {build.studyProtocol} • Request ID: {build.buildRequestId}
                </p>
              </div>
            </div>
            
            {/* Build Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <BuildStatusBadge status={build.buildStatus} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Forms</p>
                <p className="text-sm font-medium">{build.formsConfigured || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tables</p>
                <p className="text-sm font-medium">{build.tablesCreated || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Started</p>
                <p className="text-sm font-medium">{formatDateTime(build.buildStartTime)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-medium">
                  {build.buildDurationSeconds 
                    ? formatDuration(build.buildDurationSeconds)
                    : 'In progress...'}
                </p>
              </div>
            </div>
            
            {/* Progress Bar (only for in-progress builds) */}
            {build.inProgress && (
              <BuildProgressBar build={build} />
            )}
          </div>
          
          {/* Right Section - Actions */}
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
            </button>
            
            {showActions && (
              <BuildActionsMenu
                build={build}
                onClose={() => setShowActions(false)}
                onViewDetails={() => {
                  setShowDetails(true);
                  setShowActions(false);
                }}
                onRefresh={onRefresh}
              />
            )}
          </div>
        </div>
        
        {/* View Details Button */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => setShowDetails(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Details →
          </button>
        </div>
      </div>
      
      {/* Details Modal */}
      {showDetails && (
        <BuildDetailsModal
          build={build}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
};

export default StudyDatabaseBuildCard;
```

---

## 5. State Management

### Custom Hooks

#### useStudyDatabaseBuilds.js

```javascript
import { useState, useEffect, useCallback } from 'react';
import studyDatabaseBuildService from '../../../services/studyDatabaseBuildService';

export const useStudyDatabaseBuilds = (studyId = null) => {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchBuilds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      if (studyId) {
        data = await studyDatabaseBuildService.getBuildsByStudyId(studyId);
      } else {
        data = await studyDatabaseBuildService.getRecentBuilds(30);
      }
      
      setBuilds(data);
    } catch (err) {
      setError(err);
      console.error('Error fetching builds:', err);
    } finally {
      setLoading(false);
    }
  }, [studyId]);
  
  useEffect(() => {
    fetchBuilds();
    
    // Auto-refresh every 30 seconds for in-progress builds
    const interval = setInterval(() => {
      const hasInProgress = builds.some(b => b.buildStatus === 'IN_PROGRESS');
      if (hasInProgress) {
        fetchBuilds();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchBuilds]);
  
  // Calculate metrics
  const inProgressCount = builds.filter(b => b.buildStatus === 'IN_PROGRESS').length;
  const completedCount = builds.filter(b => b.buildStatus === 'COMPLETED').length;
  const failedCount = builds.filter(b => b.buildStatus === 'FAILED').length;
  const cancelledCount = builds.filter(b => b.buildStatus === 'CANCELLED').length;
  
  return {
    builds,
    loading,
    error,
    refreshBuilds: fetchBuilds,
    inProgressCount,
    completedCount,
    failedCount,
    cancelledCount
  };
};
```

---

## 6. Real-time Updates

### Polling Strategy

```javascript
// Poll every 10 seconds for in-progress builds
useEffect(() => {
  if (!build.inProgress) return;
  
  const pollInterval = setInterval(async () => {
    try {
      const updated = await studyDatabaseBuildService.getBuildByRequestId(
        build.buildRequestId
      );
      setBuild(updated);
      
      // Stop polling if build finished
      if (updated.buildStatus !== 'IN_PROGRESS') {
        clearInterval(pollInterval);
      }
    } catch (error) {
      console.error('Error polling build status:', error);
    }
  }, 10000); // 10 seconds
  
  return () => clearInterval(pollInterval);
}, [build.buildRequestId, build.inProgress]);
```

### WebSocket Integration (Future Enhancement)

```javascript
// Connect to WebSocket for real-time updates
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8081/ws/study-database-builds');
  
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    
    if (update.type === 'BUILD_STATUS_UPDATE') {
      setBuild(prevBuild => ({
        ...prevBuild,
        ...update.data
      }));
    }
  };
  
  return () => ws.close();
}, []);
```

---

## 7. User Experience Flow

### 7.1 Building a Study Database

**User Journey:**

1. **Entry Point:** User navigates to "Database Builds" from Study Management
2. **Action:** Clicks "Build Database" button
3. **Modal Opens:** Build configuration form displayed
4. **Form Fields:**
   - Select Study (dropdown with autocomplete)
   - Study Name (auto-filled)
   - Study Protocol (auto-filled)
   - Build Configuration (optional JSON editor)
5. **Validation:** 
   - Check if study has active build
   - Validate required fields
6. **Submission:** 
   - Show loading spinner
   - API call to POST /api/v1/study-database-builds
7. **Success:** 
   - Modal closes
   - Success toast notification
   - New build card appears at top of list
   - Build status shows "IN_PROGRESS"
8. **Monitoring:** 
   - Progress bar animates
   - Auto-refresh every 30 seconds
   - Real-time status updates

### 7.2 Viewing Build Details

**User Journey:**

1. **Click:** User clicks "View Details" on build card
2. **Modal Opens:** Detailed view displayed
3. **Tabs:**
   - **Overview:** Summary, status, metrics
   - **Configuration:** Build settings, form count
   - **Validation:** Validation results, compliance
   - **Logs:** Build process logs (future)
   - **Timeline:** Event history (future)
4. **Actions Available:**
   - Download build report
   - Cancel build (if in progress)
   - Retry build (if failed)
   - View related study

### 7.3 Cancelling a Build

**User Journey:**

1. **Click:** User clicks "Cancel" from actions menu
2. **Confirmation Modal:** Displays impact warning
3. **Required Input:** Cancellation reason (textarea)
4. **Submit:** API call to POST /{buildRequestId}/cancel
5. **Success:** 
   - Build status changes to "CANCELLED"
   - Cancellation reason displayed
   - Audit trail recorded

---

## 8. Wireframes & Mockups

### Main Page Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Study Database Builds                    [Refresh] [Build DB]  │
│ Manage and monitor study database build processes              │
├────────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│ │In Progress│ │Completed│ │ Failed  │ │  Total  │             │
│ │    3    │ │   15    │ │    2    │ │   20    │             │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘             │
├────────────────────────────────────────────────────────────────┤
│ [Status ▼] [Study ▼] [Search...        ] [Sort: Recent ▼]     │
├────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ 🔵 CARDIO-2024                                      ⋮    │  │
│ │ Protocol: CARD-001 • Request ID: BUILD-123-1234567890   │  │
│ │ ┌─────┬─────┬───────┬─────────┬─────────┐              │  │
│ │ │Status│Forms│Tables │ Started │Duration │              │  │
│ │ │In Prog│ 10 │  25   │ 2m ago  │  2m 15s │              │  │
│ │ └─────┴─────┴───────┴─────────┴─────────┘              │  │
│ │ [████████████████────────] 75% Complete                 │  │
│ │ View Details →                                           │  │
│ └──────────────────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ ✅ DIABETES-2024                                    ⋮    │  │
│ │ Protocol: DIA-002 • Request ID: BUILD-456-0987654321   │  │
│ │ ...                                                      │  │
│ └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Build Details Modal

```
┌────────────────────────────────────────────────────────────────┐
│ Build Details: CARDIO-2024                              [✕]    │
├────────────────────────────────────────────────────────────────┤
│ [Overview] [Configuration] [Validation] [Logs] [Timeline]     │
├────────────────────────────────────────────────────────────────┤
│ BUILD INFORMATION                                              │
│ • Build Request ID: BUILD-123-1234567890                      │
│ • Study: CARDIO-2024 (ID: 123)                                │
│ • Protocol: CARD-001                                           │
│ • Status: IN_PROGRESS                                          │
│ • Started: Oct 2, 2025 10:30 AM                               │
│ • Duration: 2 minutes 15 seconds                              │
│                                                                │
│ BUILD METRICS                                                  │
│ ┌────────────────┬────────────────┬────────────────┐         │
│ │ Forms: 10      │ Tables: 25     │ Indexes: 50    │         │
│ │ Rules: 100     │ Triggers: 15   │ Duration: 2m   │         │
│ └────────────────┴────────────────┴────────────────┘         │
│                                                                │
│ PROGRESS                                                       │
│ [████████████████████────────────] 75%                        │
│ Current Phase: Creating validation rules...                   │
│                                                                │
│                                    [Cancel Build] [Download]  │
└────────────────────────────────────────────────────────────────┘
```

---

## 9. Implementation Timeline

### Phase 1: Foundation (Week 1)
- ✅ Set up component structure
- ✅ Create API service layer
- ✅ Implement custom hooks
- ✅ Add navigation menu item
- ✅ Create basic page layout

### Phase 2: Core Components (Week 2)
- ✅ Build List component
- ✅ Build Card component
- ✅ Status badges and progress bars
- ✅ Filters and search
- ✅ Pagination

### Phase 3: Modals & Forms (Week 3)
- ✅ Build Database Modal
- ✅ Build Details Modal
- ✅ Cancel Build Modal
- ✅ Form validation
- ✅ Error handling

### Phase 4: Polish & Features (Week 4)
- ✅ Real-time status updates
- ✅ Metrics dashboard
- ✅ Export/download functionality
- ✅ Responsive design
- ✅ Loading states & animations

### Phase 5: Testing & Integration (Week 5)
- ✅ Unit tests (Jest + React Testing Library)
- ✅ Integration tests
- ✅ E2E tests (Cypress)
- ✅ UAT with stakeholders
- ✅ Performance optimization

---

## 10. Testing Strategy

### Unit Tests

```javascript
describe('StudyDatabaseBuildCard', () => {
  it('renders build information correctly', () => {
    const build = {
      id: 1,
      studyName: 'CARDIO-2024',
      buildStatus: 'IN_PROGRESS',
      formsConfigured: 10
    };
    
    render(<StudyDatabaseBuildCard build={build} />);
    
    expect(screen.getByText('CARDIO-2024')).toBeInTheDocument();
    expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
  });
  
  it('shows progress bar for in-progress builds', () => {
    const build = { inProgress: true };
    
    render(<StudyDatabaseBuildCard build={build} />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

### Integration Tests

```javascript
describe('Build Database Flow', () => {
  it('creates a new build successfully', async () => {
    render(<StudyDatabaseBuildPage />);
    
    // Click "Build Database" button
    fireEvent.click(screen.getByText('Build Database'));
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Study'), { 
      target: { value: '123' } 
    });
    
    // Submit
    fireEvent.click(screen.getByText('Start Build'));
    
    // Wait for success
    await waitFor(() => {
      expect(screen.getByText(/Build started successfully/)).toBeInTheDocument();
    });
  });
});
```

---

## 📚 Summary

### Backend (Complete ✅)
- ✅ Phase 1: Commands & Events
- ✅ Phase 2: Aggregate
- ✅ Phase 3: Projection & Repository
- ✅ Phase 4: Services & Controller
- ✅ 20+ REST API endpoints
- ✅ Complete CQRS implementation

### Frontend (Planned ⏳)
- **Total Components:** ~15 components
- **Total Hooks:** 3 custom hooks
- **API Service:** 1 comprehensive service
- **Estimated Effort:** 5 weeks
- **Key Features:**
  - Real-time build monitoring
  - Interactive progress tracking
  - Comprehensive filtering & search
  - Detailed metrics dashboard
  - Responsive design

### Next Steps

1. **Review & Approval:** Get stakeholder sign-off on UI design
2. **API Testing:** Test all backend endpoints with Postman/Thunder Client
3. **Component Development:** Start with Phase 1 components
4. **Iterative Development:** Build, test, refine each component
5. **Integration:** Connect frontend to backend
6. **UAT:** User acceptance testing
7. **Production Deployment:** Deploy to production environment

---

**Ready for Frontend Development!** 🚀
