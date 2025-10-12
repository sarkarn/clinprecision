# Patient Lifecycle Status Analysis & Corrections

## Issue Overview
The Subject Management pages need to correctly reflect the patient lifecycle workflow as defined in the system design.

## Defined Patient Lifecycle Workflow

According to the backend `PatientStatus.java` enum:

```
REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED
     ↓           ↓            ↓         ↓          
                    WITHDRAWN (possible at any stage)
```

### Status Definitions

| Backend Status | Display Name | Description | Clinical Meaning |
|---------------|--------------|-------------|------------------|
| `REGISTERED` | Registered | Patient has been registered in the system | Initial registration, demographic data collected |
| `SCREENING` | Screening | Patient is being screened for eligibility | Undergoing eligibility assessments |
| `ENROLLED` | Enrolled | Patient is enrolled in one or more studies | Accepted into study, not yet active |
| `ACTIVE` | Active | Patient is actively participating in treatment | Currently receiving intervention/treatment |
| `COMPLETED` | Completed | Patient has completed study participation | Successfully finished all study procedures |
| `WITHDRAWN` | Withdrawn | Patient has withdrawn from participation | Discontinued at any stage |

## Current Implementation Issues

### Issue 1: Incorrect Status Mapping in SubjectService.js

**Current Mapping (INCORRECT):**
```javascript
const mapPatientStatusToSubjectStatus = (patientStatus) => {
  const statusMap = {
    'REGISTERED': 'Screening',        // ❌ WRONG - should be 'Registered'
    'ENROLLED': 'Enrolled',           // ✅ Correct
    'ACTIVE': 'Active',               // ✅ Correct
    'COMPLETED': 'Completed',         // ✅ Correct
    'WITHDRAWN': 'Withdrawn',         // ✅ Correct
    'SCREEN_FAILED': 'Screen Failed'  // ✅ Correct
  };
  // ❌ Missing 'SCREENING' status mapping
  
  return statusMap[patientStatus] || patientStatus || 'Active';
};
```

**Problems:**
1. `REGISTERED` is incorrectly mapped to `'Screening'` instead of `'Registered'`
2. `SCREENING` status is missing from the map entirely
3. This breaks the workflow: REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED

### Issue 2: SubjectList.jsx Status Display

**Current Implementation:**
```jsx
{selectedStudy && subjects.length > 0 && (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{subjects.length}</div>
            <div className="text-sm text-gray-600">Total Enrolled</div>
        </div>
        <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
                {subjects.filter(s => s.status === 'Active' || s.status === 'Enrolled').length}
            </div>
            <div className="text-sm text-gray-600">Active Subjects</div>
        </div>
        <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
                {subjects.filter(s => s.status === 'Screening').length}
            </div>
            <div className="text-sm text-gray-600">Screening</div>
        </div>
        <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
                {subjects.filter(s => s.status === 'Withdrawn' || s.status === 'Screen Failed').length}
            </div>
            <div className="text-sm text-gray-600">Discontinued</div>
        </div>
    </div>
)}
```

**Analysis:**
- Filters correctly for `'Screening'` status
- But due to Issue #1, patients with backend status `REGISTERED` are shown as `'Screening'` 
- Real `SCREENING` patients fall through to default display

### Issue 3: SubjectManagementDashboard.jsx Status Cards

**Current Implementation:**
```jsx
<div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
    <div className="text-2xl font-bold text-yellow-600">{patientStats.screeningPatients}</div>
    <div className="text-sm text-yellow-800">In Screening</div>
</div>
```

**Issue:** 
- The backend `patientStats.screeningPatients` likely counts patients with status `SCREENING`
- But frontend is showing `REGISTERED` patients as "Screening" due to wrong mapping
- Need to verify what backend actually returns for `screeningPatients`

## Correct Workflow Implementation

### What Should Happen:

1. **Patient Registration**
   - Patient fills out demographic form
   - Backend creates patient with status `REGISTERED`
   - Frontend displays: `"Registered"`

2. **Screening Phase**
   - Coordinator moves patient to screening (status change event)
   - Backend status changes to `SCREENING`
   - Frontend displays: `"Screening"`
   - Patient undergoes eligibility assessments

3. **Enrollment**
   - Patient passes screening, gets enrolled in study
   - Backend status changes to `ENROLLED`
   - Frontend displays: `"Enrolled"`
   - Study arm assignment, site association created

4. **Active Participation**
   - Patient begins treatment/intervention
   - Backend status changes to `ACTIVE`
   - Frontend displays: `"Active"`
   - Visit data, eCRF entries are captured

5. **Completion or Withdrawal**
   - Patient completes all procedures → `COMPLETED` → `"Completed"`
   - Patient withdraws → `WITHDRAWN` → `"Withdrawn"`
   - Patient fails screening → `SCREEN_FAILED` → `"Screen Failed"`

## Recommended Fixes

### Fix 1: Correct SubjectService.js Status Mapping

**File:** `frontend/clinprecision/src/services/SubjectService.js`

```javascript
/**
 * Map backend patient status to frontend subject status
 * Follows the patient lifecycle: REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED
 * @param {string} patientStatus Backend patient status (enum value)
 * @returns {string} Frontend subject status (display value)
 */
const mapPatientStatusToSubjectStatus = (patientStatus) => {
  const statusMap = {
    'REGISTERED': 'Registered',       // ✅ Patient registered, not yet screening
    'SCREENING': 'Screening',         // ✅ Patient undergoing eligibility screening
    'ENROLLED': 'Enrolled',           // ✅ Patient enrolled in study
    'ACTIVE': 'Active',               // ✅ Patient actively participating
    'COMPLETED': 'Completed',         // ✅ Patient completed study
    'WITHDRAWN': 'Withdrawn',         // ✅ Patient withdrawn
    'SCREEN_FAILED': 'Screen Failed'  // ✅ Patient failed screening
  };
  
  return statusMap[patientStatus] || patientStatus || 'Registered';
};
```

### Fix 2: Update SubjectList.jsx Statistics

**File:** `frontend/clinprecision/src/components/modules/datacapture/SubjectList.jsx`

```jsx
{selectedStudy && subjects.length > 0 && (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{subjects.length}</div>
            <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
                {subjects.filter(s => s.status === 'Registered').length}
            </div>
            <div className="text-sm text-gray-600">Registered</div>
        </div>
        <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
                {subjects.filter(s => s.status === 'Screening').length}
            </div>
            <div className="text-sm text-gray-600">Screening</div>
        </div>
        <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
                {subjects.filter(s => s.status === 'Active' || s.status === 'Enrolled').length}
            </div>
            <div className="text-sm text-gray-600">Active/Enrolled</div>
        </div>
        <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
                {subjects.filter(s => s.status === 'Completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
                {subjects.filter(s => s.status === 'Withdrawn' || s.status === 'Screen Failed').length}
            </div>
            <div className="text-sm text-gray-600">Discontinued</div>
        </div>
    </div>
)}
```

**OR** Keep 4 columns and combine statuses logically:

```jsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
    <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{subjects.length}</div>
        <div className="text-sm text-gray-600">Total Enrolled</div>
    </div>
    <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">
            {subjects.filter(s => s.status === 'Registered' || s.status === 'Screening').length}
        </div>
        <div className="text-sm text-gray-600">Pre-Enrollment</div>
    </div>
    <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
            {subjects.filter(s => s.status === 'Enrolled' || s.status === 'Active').length}
        </div>
        <div className="text-sm text-gray-600">Active</div>
    </div>
    <div className="text-center">
        <div className="text-2xl font-bold text-gray-600">
            {subjects.filter(s => s.status === 'Completed' || s.status === 'Withdrawn' || s.status === 'Screen Failed').length}
        </div>
        <div className="text-sm text-gray-600">Completed/Discontinued</div>
    </div>
</div>
```

### Fix 3: Update Status Badge Colors

**File:** `frontend/clinprecision/src/components/modules/datacapture/SubjectList.jsx`

```jsx
<span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
    ${subject.status === 'Registered' ? 'bg-gray-100 text-gray-800' :
      subject.status === 'Screening' ? 'bg-yellow-100 text-yellow-800' :
      subject.status === 'Enrolled' ? 'bg-blue-100 text-blue-800' :
      subject.status === 'Active' ? 'bg-green-100 text-green-800' :
      subject.status === 'Completed' ? 'bg-purple-100 text-purple-800' :
      subject.status === 'Withdrawn' ? 'bg-red-100 text-red-800' :
      subject.status === 'Screen Failed' ? 'bg-red-100 text-red-800' :
      'bg-gray-100 text-gray-800'}`}>
    {subject.status}
</span>
```

## Backend Status Tracking

### PatientStatus Enum (Backend)
✅ Already correctly defined with proper workflow

### Status Transition Rules (Backend)
The backend should enforce these transitions:
- `REGISTERED` → `SCREENING` (start eligibility screening)
- `SCREENING` → `ENROLLED` (passed screening, enrolled in study)
- `SCREENING` → `SCREEN_FAILED` (failed eligibility criteria)
- `ENROLLED` → `ACTIVE` (began treatment/intervention)
- `ACTIVE` → `COMPLETED` (finished all procedures)
- Any status → `WITHDRAWN` (patient withdrew consent)

## Testing Checklist

After implementing fixes:

### Unit Testing
- [ ] Verify `mapPatientStatusToSubjectStatus()` maps all statuses correctly
- [ ] Test status badge colors for each status
- [ ] Test statistics calculations with mixed status patients

### Integration Testing
- [ ] Register a new patient → Status shows `"Registered"`
- [ ] Move patient to screening → Status shows `"Screening"`
- [ ] Enroll patient in study → Status shows `"Enrolled"`
- [ ] Activate patient → Status shows `"Active"`
- [ ] Complete patient → Status shows `"Completed"`
- [ ] Withdraw patient at each stage → Status shows `"Withdrawn"`

### UI Testing
- [ ] Subject List displays correct status for each patient
- [ ] Statistics cards show correct counts per status
- [ ] Status badges use correct colors
- [ ] Subject Management Dashboard shows correct distribution
- [ ] Status transitions work correctly in status change modal

## Summary

**Current State:** ❌ INCORRECT
- `REGISTERED` mapped to `'Screening'` (wrong)
- `SCREENING` status missing from map
- Patient lifecycle workflow not properly reflected in UI

**Desired State:** ✅ CORRECT
- All 6 statuses properly mapped
- UI reflects true patient lifecycle
- Statistics accurately show patients in each stage

**Impact:**
- **High**: Affects all subject management views
- **Critical**: Misrepresents actual patient status to users
- **User Confusion**: Coordinators see wrong status information

**Priority:** 🔴 **HIGH** - Fix immediately to ensure data integrity and user trust

---

**Date:** 2025-10-12  
**Module:** Subject Management  
**Issue Type:** Status Mapping & Display  
**Status:** Analysis Complete, Fixes Documented
