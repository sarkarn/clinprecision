# Phase 2 Component Usage Guide

Quick reference for using Phase 2 Study Database Build components.

---

## 1. BuildStatusBadge

**Purpose:** Display color-coded status badges

**Usage:**
```jsx
import BuildStatusBadge from './BuildStatusBadge';

<BuildStatusBadge 
  status="IN_PROGRESS" 
  size="medium" 
  animated={true} 
/>
```

**Status Values:**
- `IN_PROGRESS` - Blue badge with pulse animation
- `COMPLETED` - Green badge
- `FAILED` - Red badge
- `CANCELLED` - Gray badge

**Sizes:**
- `small` - Compact badge
- `medium` - Standard badge (default)
- `large` - Large badge

---

## 2. BuildProgressBar

**Purpose:** Show animated progress for active builds

**Usage:**
```jsx
import BuildProgressBar from './BuildProgressBar';

<BuildProgressBar 
  build={buildObject}
  showPercentage={true}
  showPhase={true}
  height="medium"
/>
```

**Required Build Properties:**
```javascript
{
  formsConfigured: number,
  tablesCreated: number,
  validationRulesSetup: number,
  buildStatus: string,
  inProgress: boolean
}
```

**Progress Phases:**
- 0-30%: Initializing
- 30-60%: Configuring forms
- 60-90%: Setting up validation
- 90-100%: Finalizing

---

## 3. BuildActionsMenu

**Purpose:** Context-aware dropdown for build actions

**Usage:**
```jsx
import BuildActionsMenu from './BuildActionsMenu';

<BuildActionsMenu
  build={buildObject}
  onClose={() => setShowMenu(false)}
  onViewDetails={handleViewDetails}
  onRefresh={handleRefresh}
  onCancel={handleCancel}
  onRetry={handleRetry}
  onValidate={handleValidate}
/>
```

**Actions by Status:**
| Status | Available Actions |
|--------|------------------|
| ALL | View Details, Refresh Status |
| IN_PROGRESS | + Cancel Build |
| FAILED | + Retry Build |
| COMPLETED | + Validate Database, Download Report |

---

## 4. CancelBuildModal

**Purpose:** Confirmation dialog for cancelling builds

**Usage:**
```jsx
import CancelBuildModal from './CancelBuildModal';

const handleConfirmCancel = async (reason) => {
  try {
    await studyDatabaseBuildService.cancelBuild(build.buildRequestId, reason);
    // Handle success
  } catch (error) {
    throw error; // Modal displays error
  }
};

<CancelBuildModal
  isOpen={showCancelModal}
  onClose={() => setShowCancelModal(false)}
  onConfirm={handleConfirmCancel}
  build={buildObject}
/>
```

**Validation:**
- Reason required (10-500 characters)
- Real-time character counter
- Error display on failure

---

## 5. BuildDetailsModal

**Purpose:** Detailed view with 4 tabs

**Usage:**
```jsx
import BuildDetailsModal from './BuildDetailsModal';

<BuildDetailsModal
  isOpen={showDetailsModal}
  onClose={() => setShowDetailsModal(false)}
  build={buildObject}
  onRefresh={handleRefresh}
/>
```

**Tabs:**
1. **Overview** - Progress, metrics, timing, errors
2. **Configuration** - Build settings and options
3. **Validation** - Validation results and compliance
4. **Timeline** - Visual build timeline

**Required Build Properties:**
```javascript
{
  studyName: string,
  buildRequestId: string,
  buildStatus: string,
  aggregateUuid: string,
  requestedBy: number,
  studyId: number,
  studyProtocol: string,
  formsConfigured: number,
  tablesCreated: number,
  indexesCreated: number,
  validationRulesSetup: number,
  buildStartTime: string,
  buildEndTime: string,
  buildDurationSeconds: number,
  errorMessage: string,
  cancellationTime: string,
  cancelledBy: number,
  cancellationReason: string,
  validationResult: {
    isValid: boolean,
    overallAssessment: string,
    complianceStatus: string,
    performanceScore: string
  }
}
```

---

## 6. StudyDatabaseBuildCard (Enhanced)

**Purpose:** Complete build card with all Phase 2 features

**Usage:**
```jsx
import StudyDatabaseBuildCard from './StudyDatabaseBuildCard';

<StudyDatabaseBuildCard
  build={buildObject}
  onRefresh={handleRefresh}
  onBuildUpdated={handleBuildUpdated}
/>
```

**Features:**
- Status badge
- Progress bar (for in-progress builds)
- Metrics grid (Forms, Tables, Indexes, Rules)
- Actions menu
- Timing information
- Integrated modals (Details, Cancel)

**Callbacks:**
```javascript
const handleRefresh = async () => {
  // Refresh single build
};

const handleBuildUpdated = async () => {
  // Refresh all builds after update
};
```

---

## 7. StudyDatabaseBuildFilters (Enhanced)

**Purpose:** Comprehensive filtering with date range

**Usage:**
```jsx
import StudyDatabaseBuildFilters from './StudyDatabaseBuildFilters';

const [filters, setFilters] = useState({
  status: 'ALL',
  searchTerm: '',
  sortBy: 'buildStartTime',
  dateFrom: '',
  dateTo: ''
});

<StudyDatabaseBuildFilters
  filters={filters}
  onFilterChange={setFilters}
  totalBuilds={100}
  filteredBuilds={25}
/>
```

**Filter Object:**
```javascript
{
  status: 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED',
  searchTerm: string,              // Search in name, protocol, requestId
  sortBy: string,                  // Sort field
  dateFrom: string,                // ISO date (YYYY-MM-DD)
  dateTo: string                   // ISO date (YYYY-MM-DD)
}
```

**Sort Options:**
- `buildStartTime` - Latest first (default)
- `-buildStartTime` - Oldest first
- `studyName` - Study name A-Z
- `-studyName` - Study name Z-A
- `buildStatus` - By status
- `buildDurationSeconds` - By duration

**Features:**
- Status dropdown
- Date range picker (collapsible)
- Search input
- Sort dropdown
- Clear all filters
- Results count

---

## Complete Integration Example

```jsx
import React, { useState } from 'react';
import StudyDatabaseBuildCard from './StudyDatabaseBuildCard';
import StudyDatabaseBuildFilters from './StudyDatabaseBuildFilters';
import { useStudyDatabaseBuilds } from '../hooks/useStudyDatabaseBuilds';

const StudyDatabaseBuildPage = () => {
  // Filters state
  const [filters, setFilters] = useState({
    status: 'ALL',
    searchTerm: '',
    sortBy: 'buildStartTime',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch builds with auto-refresh
  const { builds, loading, error, refetch } = useStudyDatabaseBuilds({
    autoRefresh: true,
    refreshInterval: 5000
  });

  // Apply filters
  const filteredBuilds = builds.filter(build => {
    // Status filter
    if (filters.status !== 'ALL' && build.buildStatus !== filters.status) {
      return false;
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        build.studyName?.toLowerCase().includes(searchLower) ||
        build.studyProtocol?.toLowerCase().includes(searchLower) ||
        build.buildRequestId?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const buildDate = new Date(build.buildStartTime);
      if (filters.dateFrom && buildDate < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && buildDate > new Date(filters.dateTo)) {
        return false;
      }
    }

    return true;
  });

  // Handle refresh
  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <StudyDatabaseBuildFilters
        filters={filters}
        onFilterChange={setFilters}
        totalBuilds={builds.length}
        filteredBuilds={filteredBuilds.length}
      />

      {/* Build List */}
      <div className="space-y-4">
        {filteredBuilds.map(build => (
          <StudyDatabaseBuildCard
            key={build.buildRequestId}
            build={build}
            onRefresh={handleRefresh}
            onBuildUpdated={handleRefresh}
          />
        ))}
      </div>
    </div>
  );
};

export default StudyDatabaseBuildPage;
```

---

## Service Layer Integration

All components integrate with `StudyDatabaseBuildService.js`:

```javascript
import studyDatabaseBuildService from '../../../../../services/StudyDatabaseBuildService';

// Calculate progress
const progress = studyDatabaseBuildService.calculateProgress(build);

// Format duration
const duration = studyDatabaseBuildService.formatDuration(seconds);

// Cancel build
await studyDatabaseBuildService.cancelBuild(requestId, reason);

// Retry build
await studyDatabaseBuildService.retryBuild(requestId);

// Validate database
await studyDatabaseBuildService.validateDatabase(requestId);
```

---

## Custom Hooks Integration

Components work with Phase 1 custom hooks:

```javascript
import { useStudyDatabaseBuilds } from '../hooks/useStudyDatabaseBuilds';
import { useBuildStatus } from '../hooks/useBuildStatus';
import { useBuildActions } from '../hooks/useBuildActions';

// Fetch all builds with auto-refresh
const { builds, loading, error, refetch } = useStudyDatabaseBuilds({
  autoRefresh: true,
  refreshInterval: 5000
});

// Poll single build status
const { status, progress, polling } = useBuildStatus(buildRequestId, {
  enabled: true,
  interval: 3000
});

// Build actions
const { cancelBuild, retryBuild, validateDatabase, loading, error } = 
  useBuildActions();
```

---

## Styling Guidelines

### Color Scheme
```javascript
// Status colors
const statusColors = {
  IN_PROGRESS: 'blue',   // bg-blue-100, text-blue-800
  COMPLETED: 'green',    // bg-green-100, text-green-800
  FAILED: 'red',         // bg-red-100, text-red-800
  CANCELLED: 'gray'      // bg-gray-100, text-gray-800
};

// Metric colors
const metricColors = {
  forms: 'blue',         // bg-blue-100, text-blue-600
  tables: 'green',       // bg-green-100, text-green-600
  indexes: 'purple',     // bg-purple-100, text-purple-600
  rules: 'orange'        // bg-orange-100, text-orange-600
};
```

### Animations
```css
/* Add to tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s linear infinite',
        'shimmer': 'shimmer 2s infinite'
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }
    }
  }
}
```

---

## Accessibility

All components include:
- ✅ ARIA roles and labels
- ✅ Semantic HTML
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ Color contrast compliance

---

## Best Practices

1. **Error Handling:**
   ```javascript
   try {
     await action();
   } catch (error) {
     console.error('Action failed:', error);
     // Show error to user
   }
   ```

2. **Loading States:**
   ```javascript
   {loading && <LoadingSpinner />}
   {!loading && data && <Content data={data} />}
   ```

3. **Modal Management:**
   ```javascript
   const [showModal, setShowModal] = useState(false);
   
   // Open
   setShowModal(true);
   
   // Close
   setShowModal(false);
   ```

4. **Async Operations:**
   ```javascript
   const handleAction = async () => {
     setLoading(true);
     try {
       await performAction();
       await refetch(); // Refresh data
     } catch (error) {
       setError(error.message);
     } finally {
       setLoading(false);
     }
   };
   ```

---

## Testing

### Component Testing
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import BuildStatusBadge from './BuildStatusBadge';

test('renders status badge', () => {
  render(<BuildStatusBadge status="IN_PROGRESS" />);
  expect(screen.getByText('In Progress')).toBeInTheDocument();
});
```

### Integration Testing
```javascript
test('complete build workflow', async () => {
  const { getByText, getByRole } = render(<StudyDatabaseBuildCard build={mockBuild} />);
  
  // Open actions menu
  fireEvent.click(getByRole('button', { name: /actions/i }));
  
  // Click cancel
  fireEvent.click(getByText('Cancel Build'));
  
  // Verify modal opens
  expect(screen.getByText('Cancel Build')).toBeInTheDocument();
});
```

---

## Troubleshooting

### Common Issues

1. **Components not rendering:**
   - Check import paths
   - Verify build object has required properties
   - Check console for errors

2. **Animations not working:**
   - Ensure Tailwind CSS is configured
   - Add custom animations to tailwind.config.js

3. **Service calls failing:**
   - Verify StudyDatabaseBuildService is imported correctly
   - Check API endpoints are configured
   - Review network tab for errors

4. **Modals not closing:**
   - Verify onClose callback is provided
   - Check state management
   - Ensure overlay click handler is working

---

## Support

For issues or questions:
1. Check component documentation
2. Review usage examples
3. Check console for errors
4. Verify all required props are provided
5. Test with mock data first

---

**Last Updated:** Phase 2 Implementation Complete  
**Version:** 1.0  
**Status:** Production Ready ✅
