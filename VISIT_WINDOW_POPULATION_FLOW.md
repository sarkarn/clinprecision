# Visit Window Data Population Flow
**Date**: October 22, 2025  
**Status**: 🚨 **MISSING CODE** - Window fields not populated during visit instantiation

---

## 📋 Current Problem

**Issue**: Visit Window columns show "No window defined" in SubjectDetails.jsx

**Root Cause**: The window fields (`visitWindowStart`, `visitWindowEnd`, `windowDaysBefore`, `windowDaysAfter`) are **NOT being populated** when protocol visits are created during patient enrollment.

---

## 🏗️ Complete Visit Creation Flow

### Phase 1: Protocol Design (Study Build Phase)
```
┌─────────────────────────────────────────────────────┐
│ Study Designer Creates Visit Schedule              │
├─────────────────────────────────────────────────────┤
│ Table: visit_definitions                            │
│                                                      │
│ Visit 1:                                            │
│   - name: "Screening Visit"                         │
│   - timepoint: -7 (7 days before baseline)         │
│   - window_before: 3 days ← DEFINED HERE           │
│   - window_after: 3 days  ← DEFINED HERE           │
│                                                      │
│ Visit 2:                                            │
│   - name: "Day 1"                                   │
│   - timepoint: 0                                    │
│   - window_before: 0                                │
│   - window_after: 0                                 │
│                                                      │
│ Visit 3:                                            │
│   - name: "Week 2"                                  │
│   - timepoint: 14                                   │
│   - window_before: 2 days ← DEFINED HERE           │
│   - window_after: 2 days  ← DEFINED HERE           │
└─────────────────────────────────────────────────────┘
```

**Key Point**: Window configuration (`window_before`, `window_after`) is stored in `visit_definitions` table during study design.

---

### Phase 2: Patient Enrollment (Visit Instantiation)
```
┌─────────────────────────────────────────────────────┐
│ Patient Enrolled in Study                           │
│ Trigger: Patient status → ACTIVE                    │
├─────────────────────────────────────────────────────┤
│ 1. ProtocolVisitInstantiationService called        │
│    - Method: instantiateProtocolVisits()            │
│    - Input: patientId, studyId, baselineDate       │
│                                                      │
│ 2. Query visit_definitions table                   │
│    - Get all protocol visits for study              │
│    - SELECT * FROM visit_definitions                │
│      WHERE study_id = ? AND is_unscheduled = false │
│                                                      │
│ 3. For each visit definition:                      │
│    - Calculate visitDate = baseline + timepoint     │
│    - Create study_visit_instances row               │
│                                                      │
│ 🚨 PROBLEM: Window fields NOT copied!              │
│    ❌ visitWindowStart = NULL                       │
│    ❌ visitWindowEnd = NULL                         │
│    ❌ windowDaysBefore = NULL                       │
│    ❌ windowDaysAfter = NULL                        │
└─────────────────────────────────────────────────────┘
```

---

### Phase 3: Visit Display (Current Behavior)
```
┌─────────────────────────────────────────────────────┐
│ Frontend: SubjectDetails.jsx                        │
├─────────────────────────────────────────────────────┤
│ API Call: GET /api/visits/patient/{patientId}      │
│                                                      │
│ Backend:                                            │
│   1. PatientVisitService.getPatientVisits()        │
│   2. mapToVisitDto() copies fields:                │
│      - dto.setVisitWindowStart(entity.getVisitWindowStart()) → NULL
│      - dto.setVisitWindowEnd(entity.getVisitWindowEnd())     → NULL
│                                                      │
│ Frontend Renders:                                   │
│   {visit.visitWindowStart && visit.visitWindowEnd ? │
│       <span>window dates</span> :                   │
│       <span>No window defined</span> ← SHOWS THIS  │
│   }                                                 │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 The Fix: Copy Window Configuration During Visit Creation

### Location
**File**: `ProtocolVisitInstantiationService.java`  
**Method**: `createVisitInstance()` (lines 200-225)

### Current Code (INCOMPLETE)
```java
private StudyVisitInstanceEntity createVisitInstance(
        Long patientId,
        Long studyId,
        Long siteId,
        VisitDefinitionEntity visitDef,
        LocalDate baselineDate,
        Long buildId) {

    // Calculate visit date from baseline + day offset
    LocalDate visitDate = calculateVisitDate(baselineDate, visitDef.getTimepoint());

    return StudyVisitInstanceEntity.builder()
            .subjectId(patientId)
            .studyId(studyId)
            .siteId(siteId)
            .visitId(visitDef.getId())
            .visitDate(visitDate)
            .actualVisitDate(null)
            .visitStatus("Scheduled")
            .windowStatus(null)
            .completionPercentage(0.0)
            .aggregateUuid(null)
            .buildId(buildId)
            .notes(null)
            .createdBy(1L)
            // ❌ MISSING: Window fields not set!
            .build();
}
```

### Fixed Code (COMPLETE)
```java
private StudyVisitInstanceEntity createVisitInstance(
        Long patientId,
        Long studyId,
        Long siteId,
        VisitDefinitionEntity visitDef,
        LocalDate baselineDate,
        Long buildId) {

    // Calculate visit date from baseline + day offset
    LocalDate visitDate = calculateVisitDate(baselineDate, visitDef.getTimepoint());
    
    // ✅ FIX: Calculate window dates from visit definition
    Integer windowBefore = visitDef.getWindowBefore() != null ? visitDef.getWindowBefore() : 0;
    Integer windowAfter = visitDef.getWindowAfter() != null ? visitDef.getWindowAfter() : 0;
    
    LocalDate windowStart = visitDate.minusDays(windowBefore);
    LocalDate windowEnd = visitDate.plusDays(windowAfter);

    return StudyVisitInstanceEntity.builder()
            .subjectId(patientId)
            .studyId(studyId)
            .siteId(siteId)
            .visitId(visitDef.getId())
            .visitDate(visitDate)
            .actualVisitDate(null)
            .visitStatus("Scheduled")
            .windowStatus(null)
            .completionPercentage(0.0)
            .aggregateUuid(null)
            .buildId(buildId)
            .notes(null)
            .createdBy(1L)
            // ✅ NEW: Copy window configuration from visit definition
            .visitWindowStart(windowStart)
            .visitWindowEnd(windowEnd)
            .windowDaysBefore(windowBefore)
            .windowDaysAfter(windowAfter)
            .build();
}
```

---

## 📊 Complete Data Flow Example

### Example: Patient Enrolled on Jan 15, 2025

**Step 1**: Visit Definition (Protocol Design)
```sql
-- Table: visit_definitions
id | name        | timepoint | window_before | window_after
1  | Screening   | -7        | 3             | 3
2  | Day 1       | 0         | 0             | 0
3  | Week 2      | 14        | 2             | 2
4  | Month 1     | 30        | 5             | 5
```

**Step 2**: Visit Instantiation (Patient Enrollment on Jan 15)
```java
baselineDate = LocalDate.of(2025, 1, 15);

// Visit 1 (Screening)
visitDate = Jan 15 - 7 days = Jan 8
windowStart = Jan 8 - 3 days = Jan 5
windowEnd = Jan 8 + 3 days = Jan 11

// Visit 2 (Day 1)
visitDate = Jan 15 + 0 days = Jan 15
windowStart = Jan 15 - 0 days = Jan 15
windowEnd = Jan 15 + 0 days = Jan 15

// Visit 3 (Week 2)
visitDate = Jan 15 + 14 days = Jan 29
windowStart = Jan 29 - 2 days = Jan 27
windowEnd = Jan 29 + 2 days = Jan 31

// Visit 4 (Month 1)
visitDate = Jan 15 + 30 days = Feb 14
windowStart = Feb 14 - 5 days = Feb 9
windowEnd = Feb 14 + 5 days = Feb 19
```

**Step 3**: Database Result (study_visit_instances)
```sql
id | subject_id | visit_date | visitWindowStart | visitWindowEnd | windowDaysBefore | windowDaysAfter
1  | 100        | 2025-01-08 | 2025-01-05      | 2025-01-11    | 3                | 3
2  | 100        | 2025-01-15 | 2025-01-15      | 2025-01-15    | 0                | 0
3  | 100        | 2025-01-29 | 2025-01-27      | 2025-01-31    | 2                | 2
4  | 100        | 2025-02-14 | 2025-02-09      | 2025-02-19    | 5                | 5
```

**Step 4**: Frontend Display
```jsx
// SubjectDetails.jsx - Visit Window Column
<td>
    {visit.visitWindowStart && visit.visitWindowEnd ? (
        <>
            <div>
                {new Date(visit.visitWindowStart).toLocaleDateString()} - 
                {new Date(visit.visitWindowEnd).toLocaleDateString()}
            </div>
            {/* Shows: "1/5/2025 - 1/11/2025" */}
        </>
    ) : (
        <span>No window defined</span>
    )}
</td>
```

---

## 🎯 When Window Fields Get Populated

### Trigger Points

#### 1. Protocol Visit Instantiation (NEEDS FIX)
**When**: Patient status changes to ACTIVE (enrollment)  
**Service**: `ProtocolVisitInstantiationService.instantiateProtocolVisits()`  
**Current Status**: ❌ Window fields NOT copied from visit_definitions  
**Fix Required**: Add window calculation logic to `createVisitInstance()`

#### 2. Unscheduled Visit Creation (Already Working?)
**When**: Coordinator creates ad-hoc visit  
**Service**: `PatientVisitService.createUnscheduledVisit()`  
**Current Status**: ❓ Need to verify if window fields are set  
**Note**: Unscheduled visits may not have windows (depends on use case)

#### 3. Manual Visit Creation via UI (Future Feature?)
**When**: User creates visit through UI  
**Frontend**: Visit creation modal  
**Backend**: POST /api/visits  
**Current Status**: ❓ Not implemented yet  

---

## 🔍 Verification Queries

### Check if visits have window data
```sql
SELECT 
    svi.id,
    svi.subject_id,
    vd.name AS visit_name,
    svi.visit_date,
    svi.visitWindowStart,
    svi.visitWindowEnd,
    svi.windowDaysBefore,
    svi.windowDaysAfter,
    vd.window_before AS definition_before,
    vd.window_after AS definition_after
FROM study_visit_instances svi
JOIN visit_definitions vd ON svi.visit_id = vd.id
WHERE svi.subject_id = 1
ORDER BY svi.visit_date;
```

**Expected Result (BEFORE FIX)**:
```
visitWindowStart | visitWindowEnd | windowDaysBefore | windowDaysAfter
NULL            | NULL          | NULL             | NULL
```

**Expected Result (AFTER FIX)**:
```
visitWindowStart | visitWindowEnd | windowDaysBefore | windowDaysAfter
2025-01-05      | 2025-01-11    | 3                | 3
```

---

## 📝 Implementation Checklist

### Step 1: Fix ProtocolVisitInstantiationService ✅ READY
- [ ] Modify `createVisitInstance()` method
- [ ] Add window date calculation logic
- [ ] Copy `windowDaysBefore` and `windowDaysAfter` from visit definition
- [ ] Calculate `visitWindowStart` = visitDate - windowBefore
- [ ] Calculate `visitWindowEnd` = visitDate + windowAfter

### Step 2: Rebuild Backend
- [ ] Run `mvn clean install` in clinprecision-clinops-service
- [ ] Verify BUILD SUCCESS
- [ ] Restart backend service

### Step 3: Test with New Patient Enrollment
- [ ] Create new patient in UI
- [ ] Change status to ACTIVE (triggers visit instantiation)
- [ ] Verify visits created with window dates
- [ ] Query database to confirm window fields populated

### Step 4: Backfill Existing Visits (Optional)
- [ ] Create SQL script to populate windows for existing visits
- [ ] Join study_visit_instances with visit_definitions
- [ ] Calculate and UPDATE window fields
- [ ] Test with sample data first

### Step 5: Verify Frontend Display
- [ ] Navigate to SubjectDetails.jsx
- [ ] Confirm "Visit Window" column shows dates
- [ ] Check VisitDetails.jsx shows compliance panel
- [ ] Test all compliance scenarios

---

## 🚀 Quick Fix SQL (Temporary Workaround)

If you need to test the UI immediately before rebuilding backend:

```sql
-- Backfill window dates for existing visits
UPDATE study_visit_instances svi
SET 
    visitWindowStart = svi.visit_date - INTERVAL '1 day' * COALESCE(vd.window_before, 0),
    visitWindowEnd = svi.visit_date + INTERVAL '1 day' * COALESCE(vd.window_after, 0),
    windowDaysBefore = COALESCE(vd.window_before, 0),
    windowDaysAfter = COALESCE(vd.window_after, 0)
FROM visit_definitions vd
WHERE svi.visit_id = vd.id
  AND svi.visitWindowStart IS NULL;
```

**WARNING**: This is a one-time fix for existing data. The backend code MUST be fixed to prevent this issue for future enrollments.

---

## 💡 Why This Matters

### User Impact
1. **Coordinators** can't see visit windows in patient visit list
2. **Data Entry** staff don't know when visits are due
3. **Compliance** badges always show "N/A"
4. **Protocol Violations** not detected
5. **Overdue Visits** not highlighted

### System Impact
1. Gap #4 Phases 6 & 7 UI features don't work
2. Compliance filtering shows no results
3. Window compliance panel never appears
4. Business logic in VisitComplianceService can't calculate status
5. Days overdue counter always returns 0

---

## 🎓 Industry Standards

### Medidata Rave
- Visit windows defined in Protocol Designer
- Automatically copied to patient visits during randomization
- Compliance calculated in real-time
- Protocol deviations flagged automatically

### Oracle InForm
- Visit windows configured in Study Build
- Patient visits inherit window configuration
- Visit windows displayed in Visit Schedule view
- Overdue visits highlighted in red

### ClinPrecision (Our System)
- ✅ Windows defined in visit_definitions (Protocol Design)
- ❌ Windows NOT copied during patient enrollment ← **FIX THIS**
- ✅ Compliance calculation logic exists (VisitComplianceService)
- ✅ UI components exist (SubjectDetails, VisitDetails)
- ❌ Data not populated → Features don't work ← **FIX THIS**

---

## 📚 Related Documentation

- **Gap #4 Backend**: dd3f90d - VisitComplianceService, DTO fields, database migration
- **Gap #4 Phase 6**: ff44933 - SubjectDetails.jsx compliance UI
- **Gap #4 Phase 7**: abb9b6d - VisitDetails.jsx window panel
- **Database Schema**: V1.16__add_visit_window_compliance.sql
- **Visit Definition**: VisitDefinitionEntity.java (window_before, window_after)

---

**Next Action**: Fix `ProtocolVisitInstantiationService.createVisitInstance()` to copy window fields from visit definitions.

**Priority**: HIGH - All Phase 6 & 7 UI features depend on this data.

**Estimated Time**: 15 minutes to fix + 5 minutes to rebuild + 10 minutes to test = **30 minutes total**
