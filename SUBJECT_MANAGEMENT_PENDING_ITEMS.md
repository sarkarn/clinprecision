# Subject Management - Pending Items

**Module**: Subject Management  
**Current Status**: Week 2 Implementation - Status Management  
**Analysis Date**: October 12, 2025  
**Branch**: patient_status_lifecycle

---

## ✅ What's Complete

### Backend (Fully Implemented) ✅
1. **Patient Status Management** ✅
   - `PatientStatus.java` enum with lifecycle states
   - `PatientStatusHistoryEntity.java` - Complete audit trail
   - `PatientStatusHistoryRepository.java` - Query methods
   - `PatientStatusService.java` - Business logic & validation
   - `PatientStatusController.java` - REST API endpoints
   - `PatientEnrollmentProjector.java` - Event handlers for status changes
   - Database migration: `V1.15__create_patient_status_history.sql`

2. **API Endpoints** ✅
   - `POST /api/v1/patients/{id}/status` - Change status
   - `GET /api/v1/patients/{id}/status` - Get current status
   - `GET /api/v1/patients/{id}/status/history` - Get status history
   - `GET /api/v1/patients/{id}/status/transitions` - Get valid next statuses
   - `GET /api/v1/patients/status/{status}` - Find patients by status
   - `GET /api/v1/patients/status/stuck/{status}` - Find stuck patients

3. **Event Sourcing** ✅
   - `ChangePatientStatusCommand` - Command to change status
   - `PatientStatusChangedEvent` - Event emitted on status change
   - `PatientAggregate` handles commands with validation
   - Projector updates read model and creates history records

4. **Status Validation** ✅
   - Valid transitions enforced: REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED
   - WITHDRAWN allowed from any status
   - Business rules implemented in aggregate

### Frontend (Partially Complete) 🟨

#### Completed Components ✅
1. **PatientStatusBadge.jsx** ✅
   - Color-coded status badges
   - All 6+ statuses supported
   - Proper styling for each status

2. **StatusTransitionDiagram.jsx** ✅
   - Visual workflow diagram
   - Shows status progression
   - Interactive visualization

3. **StatusChangeModal.jsx** ✅
   - Modal dialog for changing status
   - Fetches valid next statuses from API
   - Reason input (required)
   - Notes input (optional)
   - Form validation
   - Success/error handling

4. **SubjectManagementDashboard.jsx** ✅
   - Status distribution statistics
   - Patient counts by status
   - "Stuck patients" alerts
   - Status workflow diagram integration

5. **SubjectList.jsx** ✅
   - Displays status badges
   - Statistics by lifecycle stage
   - Study filtering (PUBLISHED/APPROVED/ACTIVE only)
   - Proper status mapping

6. **Status Mapping** ✅
   - `SubjectService.js` correctly maps all statuses
   - REGISTERED → Registered
   - SCREENING → Screening
   - ENROLLED → Enrolled
   - ACTIVE → Active
   - COMPLETED → Completed
   - WITHDRAWN → Withdrawn

---

## ❌ What's Pending

### 1. Frontend - Missing Implementations

#### A. SubjectDetails.jsx - Not Fully Implemented ❌
**File**: `frontend/clinprecision/src/components/modules/datacapture/SubjectDetails.jsx`

**Current State**: Basic skeleton exists but missing key features

**Missing Features**:
- [ ] **Status display section** - Show current status prominently with badge
- [ ] **"Change Status" button** - Trigger StatusChangeModal
- [ ] **"View Status History" button** - Show history timeline
- [ ] **Status history integration** - Display recent status changes
- [ ] **Status-based actions** - Different actions available based on status
- [ ] **Status transition visualization** - Show where patient is in lifecycle
- [ ] **Last status change metadata** - Who changed, when, why

**Required Integration**:
```jsx
import PatientStatusBadge from '../subjectmanagement/components/PatientStatusBadge';
import StatusChangeModal from '../subjectmanagement/components/StatusChangeModal';
import StatusHistoryTimeline from '../subjectmanagement/components/StatusHistoryTimeline'; // NEEDS TO BE CREATED

// Add to component:
<div className="status-section">
  <PatientStatusBadge status={subject.status} size="lg" />
  <button onClick={() => setShowStatusModal(true)}>Change Status</button>
  <button onClick={() => setShowHistory(true)}>View History</button>
</div>
```

**Priority**: 🔴 **HIGH** - Core user workflow

---

#### B. StatusHistoryTimeline.jsx - Not Created ❌
**File**: `frontend/clinprecision/src/components/modules/subjectmanagement/components/StatusHistoryTimeline.jsx`

**Status**: **NOT CREATED** (mentioned in WEEK_2 plan as Task 8)

**Required Features**:
- [ ] Timeline view of status changes
- [ ] Shows: previous status → new status
- [ ] Shows: reason, changed by, date/time
- [ ] Expandable for full notes
- [ ] Filterable by status
- [ ] Sortable by date
- [ ] Export to CSV functionality
- [ ] Responsive design

**Visual Layout**:
```
┌────────────────────────────────────────┐
│ Status History - Patient SCR-001       │
├────────────────────────────────────────┤
│ ○ ENROLLED → ACTIVE                    │
│   Reason: First treatment completed    │
│   By: dr.smith | Oct 12, 2025 10:30   │
│   [Show Full Notes]                    │
├────────────────────────────────────────┤
│ ○ SCREENING → ENROLLED                 │
│   Reason: Passed eligibility criteria  │
│   By: coordinator | Oct 10, 2025 14:15│
└────────────────────────────────────────┘
```

**API Integration**:
```javascript
PatientStatusService.getStatusHistory(patientId)
  .then(history => setStatusHistory(history));
```

**Priority**: 🟡 **MEDIUM** - Important for audit trail but not blocking

---

#### C. SubjectList.jsx - Placeholder Action Buttons ❌
**File**: `frontend/clinprecision/src/components/modules/datacapture/SubjectList.jsx`

**Current State**: Buttons exist but don't do anything

**Lines 254-259** (Current Code):
```jsx
<button className="text-gray-600 hover:text-gray-900">
    Edit
</button>
<button className="text-red-600 hover:text-red-900">
    Withdraw
</button>
```

**Missing Implementation**:
- [ ] **"Edit" button** - Should open subject edit form/modal
- [ ] **"Withdraw" button** - Should trigger status change to WITHDRAWN
  - Should open confirmation dialog
  - Should use StatusChangeModal with pre-selected WITHDRAWN status
  - Should require withdrawal reason

**Recommended Implementation**:
```jsx
<button 
    onClick={() => handleEditSubject(subject.id)}
    className="text-gray-600 hover:text-gray-900"
>
    Edit
</button>
<button 
    onClick={() => handleWithdrawSubject(subject)}
    className="text-red-600 hover:text-red-900"
    disabled={subject.status === 'Withdrawn' || subject.status === 'Completed'}
>
    Withdraw
</button>

// Handler:
const handleWithdrawSubject = (subject) => {
    setSelectedPatient(subject);
    setPreselectedStatus('WITHDRAWN');
    setShowStatusModal(true);
};
```

**Priority**: 🟡 **MEDIUM** - Convenience feature

---

#### D. Authentication Integration - TODOs ⚠️
**File**: `StatusChangeModal.jsx`

**Current TODOs** (Lines 38, 56, 366):
```javascript
changedBy: '' // TODO: Get from auth context
// Set default changedBy (TODO: replace with authenticated user)
{/* Changed By (Hidden for now - TODO: get from auth) */}
```

**Missing**:
- [ ] Integration with authentication context
- [ ] Get current user from auth system
- [ ] Populate `changedBy` automatically
- [ ] Remove manual input field for changedBy

**Required**:
```jsx
import { useAuth } from '../../../context/AuthContext'; // Assuming you have this

const { currentUser } = useAuth();

// Set formData.changedBy to currentUser.email or currentUser.username
useEffect(() => {
    if (currentUser) {
        setFormData(prev => ({
            ...prev,
            changedBy: currentUser.email || currentUser.username
        }));
    }
}, [currentUser]);
```

**Priority**: 🟡 **MEDIUM** - Security/audit requirement, but can work with placeholder

---

### 2. Backend - Minor Enhancements

#### A. Performance Optimization ⚠️
**Potential Issues**:
- [ ] **Status history pagination** - No pagination on history endpoint
  - Patients with many status changes may have slow queries
  - Recommend: Add pagination parameters (page, size)
  - Recommend: Add limit parameter (default 50)

- [ ] **Caching** - No caching for frequently accessed data
  - Current status lookup could be cached
  - Valid transitions list could be cached
  - Recommend: Add Spring Cache annotations

**SQL Query Example**:
```java
// Current (no pagination):
@Query("SELECT h FROM PatientStatusHistoryEntity h WHERE h.patientId = :patientId ORDER BY h.changedAt DESC")
List<PatientStatusHistoryEntity> findByPatientIdOrderByChangedAtDesc(Long patientId);

// Recommended (with pagination):
@Query("SELECT h FROM PatientStatusHistoryEntity h WHERE h.patientId = :patientId ORDER BY h.changedAt DESC")
Page<PatientStatusHistoryEntity> findByPatientIdOrderByChangedAtDesc(Long patientId, Pageable pageable);
```

**Priority**: 🟢 **LOW** - Optimization, not blocking

---

#### B. Additional Query Methods ⚠️
**PatientStatusHistoryRepository.java** - Could add:

- [ ] `findByNewStatus(String status)` - Find all patients who reached a status
- [ ] `findByChangedBetween(LocalDateTime start, LocalDateTime end)` - Date range query
- [ ] `countByPatientId(Long patientId)` - Count status changes for patient
- [ ] `findRecentChanges(int limit)` - Get most recent changes across all patients

**Use Cases**:
- Dashboard: "Recent status changes" widget
- Reports: Status change analytics
- Audits: Find all changes in date range

**Priority**: 🟢 **LOW** - Nice to have

---

### 3. Testing Gaps

#### A. Frontend E2E Tests ❌
**Missing Tests**:
- [ ] Status change workflow test
- [ ] Status history display test  
- [ ] Invalid transition handling test
- [ ] Status badge rendering test
- [ ] Status modal validation test

**Priority**: 🟡 **MEDIUM** - Quality assurance

---

#### B. Backend Integration Tests ⚠️
**Partial Coverage**:
- [ ] Test status history pagination
- [ ] Test concurrent status changes
- [ ] Test event replay scenarios
- [ ] Test projector idempotency

**Priority**: 🟡 **MEDIUM** - Quality assurance

---

### 4. Documentation Gaps

#### A. User Documentation ❌
**Missing**:
- [ ] **CRC User Guide** - How to change patient status
- [ ] **Status Lifecycle Guide** - What each status means
- [ ] **Troubleshooting Guide** - Common issues and fixes
- [ ] **Video Tutorial** - Screen recording of status change workflow

**Priority**: 🟡 **MEDIUM** - User adoption

---

#### B. API Documentation ⚠️
**Current State**: Swagger docs exist but could be enhanced

**Enhancements Needed**:
- [ ] Add more examples for each endpoint
- [ ] Document error codes and messages
- [ ] Add sequence diagrams for workflows
- [ ] Add response schema examples

**Priority**: 🟢 **LOW** - Documentation improvement

---

### 5. Subject Management - Other Missing Features

#### A. Subject Edit Functionality ❌
**Current State**: "Edit" button exists but does nothing

**Missing**:
- [ ] **SubjectEditModal.jsx** or **SubjectEditForm.jsx** - NOT CREATED
- [ ] Edit subject demographic data
- [ ] Edit enrollment information
- [ ] Update treatment arm assignment
- [ ] Update site assignment
- [ ] Validation logic
- [ ] Backend API endpoint: `PUT /api/v1/patients/{id}`

**Priority**: 🟡 **MEDIUM** - Common user need

---

#### B. Subject Search/Filter ❌
**Current State**: SubjectList shows all subjects for selected study

**Missing Features**:
- [ ] Search by screening number
- [ ] Search by patient number
- [ ] Filter by status
- [ ] Filter by site
- [ ] Filter by treatment arm
- [ ] Filter by enrollment date range
- [ ] Export filtered results

**Priority**: 🟢 **LOW** - Usability enhancement

---

#### C. Bulk Operations ❌
**Missing**:
- [ ] Bulk status change (select multiple subjects)
- [ ] Bulk export to CSV/Excel
- [ ] Bulk print subject labels
- [ ] Bulk email notifications

**Priority**: 🟢 **LOW** - Advanced feature

---

#### D. Subject Withdrawal Workflow ❌
**Current State**: Can change status to WITHDRAWN, but no formal workflow

**Missing**:
- [ ] **WithdrawalModal.jsx** - Dedicated withdrawal form
- [ ] Withdrawal reason categories (dropdown)
- [ ] Withdrawal date selection
- [ ] Withdrawal confirmation with warnings
- [ ] Automatic study database update
- [ ] Notification to PI/coordinator
- [ ] Withdrawal report generation

**Priority**: 🟡 **MEDIUM** - Regulatory requirement

---

#### E. Subject Lifecycle Reports ❌
**Missing Reports**:
- [ ] Enrollment funnel report (REGISTERED → SCREENING → ENROLLED → ACTIVE)
- [ ] Screen failure analysis report
- [ ] Withdrawal analysis report
- [ ] Time-in-status report (how long in each status)
- [ ] Status transition matrix (which transitions happen most)
- [ ] Site-level enrollment report

**Priority**: 🟢 **LOW** - Analytics feature

---

## 📊 Summary by Priority

### 🔴 HIGH Priority (Blocking/Critical)
1. **SubjectDetails.jsx - Status Management Integration**
   - Essential for viewing individual subject status
   - Blocks complete user workflow
   - **Estimate**: 2-3 hours

### 🟡 MEDIUM Priority (Important, Not Blocking)
2. **StatusHistoryTimeline.jsx - Create Component**
   - Audit trail visibility
   - **Estimate**: 2-3 hours

3. **SubjectList.jsx - Wire Up Action Buttons**
   - Edit and Withdraw functionality
   - **Estimate**: 1-2 hours

4. **Authentication Integration in StatusChangeModal**
   - Security/audit requirement
   - **Estimate**: 30 minutes (once auth context exists)

5. **Subject Edit Functionality**
   - Common user need
   - **Estimate**: 3-4 hours

6. **Subject Withdrawal Workflow**
   - Regulatory requirement
   - **Estimate**: 2-3 hours

7. **Testing - E2E and Integration**
   - Quality assurance
   - **Estimate**: 4-6 hours

### 🟢 LOW Priority (Nice to Have)
8. Performance optimization (pagination, caching)
9. Additional query methods
10. Subject search/filter enhancements
11. Bulk operations
12. Lifecycle reports
13. Enhanced documentation

---

## 🎯 Recommended Next Steps

### Immediate (Next Session)
1. ✅ Complete SubjectDetails.jsx integration (2-3 hours)
   - Add status display section
   - Wire up StatusChangeModal
   - Add status history button

2. ✅ Create StatusHistoryTimeline component (2-3 hours)
   - Timeline UI
   - API integration
   - Filtering and sorting

3. ✅ Wire up Edit/Withdraw buttons (1-2 hours)
   - Implement handlers
   - Add confirmation dialogs

**Total Immediate Work**: ~6-8 hours

### Short Term (This Week)
4. Subject edit functionality
5. Authentication integration
6. Subject withdrawal workflow
7. E2E testing

**Total Short Term Work**: ~10-12 hours

### Medium Term (Next Week)
8. Performance optimization
9. Subject search/filter
10. Additional reports
11. Documentation

---

## ✅ Definition of "Complete"

Subject Management will be considered **feature-complete** when:

**Core Features** ✅
- [x] Patient status can be changed through UI
- [x] Status history is tracked and auditable
- [x] Status badges display correctly everywhere
- [x] Valid transitions are enforced
- [x] Dashboard shows status distribution

**Pending Features** ❌
- [ ] Individual subject details show full status management
- [ ] Status history timeline is visible
- [ ] Edit subject functionality works
- [ ] Withdraw subject has proper workflow
- [ ] Authentication is integrated
- [ ] All action buttons are functional

**Quality** ⚠️
- [ ] E2E tests cover main workflows
- [ ] Integration tests cover edge cases
- [ ] User documentation exists
- [ ] No critical bugs

---

## 📈 Progress Tracking

**Overall Subject Management Completion**: ~75% ✅

- Backend: **100%** ✅ (Fully implemented)
- Frontend Core: **80%** 🟨 (Status change working, history needs component)
- Frontend Integration: **60%** 🟨 (Dashboard done, details pending)
- Testing: **40%** ⚠️ (Backend tested, frontend needs E2E)
- Documentation: **50%** ⚠️ (Technical docs exist, user docs pending)

---

**Last Updated**: October 12, 2025  
**Analyzed By**: AI Assistant  
**Branch**: patient_status_lifecycle  
**Status**: Week 2 In Progress - 75% Complete
