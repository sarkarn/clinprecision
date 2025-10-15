# Study Build Process and Visit Capture Explanation

**Date:** 2025-10-14  
**Context:** User question: "Why does the study build process capture necessary information to capture subject visit?"

---

## Table of Contents
1. [Overview](#overview)
2. [Study Build Phase (Design Time)](#study-build-phase)
3. [Runtime Phase (Data Capture)](#runtime-phase)
4. [Why You're Not Seeing Visits](#why-youre-not-seeing-visits)
5. [Current System Architecture](#current-system-architecture)
6. [How to Fix](#how-to-fix)

---

## Overview

Clinical trials operate in **two distinct phases**:

1. **Study Build (Design Time)** - Define trial structure
2. **Runtime (Execution Time)** - Collect patient data

The study build process captures **metadata** that governs **how** data is collected during runtime. Without this metadata, the system doesn't know:
- What visits to create
- When visits should occur
- What data to collect at each visit

---

## Study Build Phase (Design Time)

### Purpose
Define the **structure and schedule** of the clinical trial **before** enrolling any patients.

### What Gets Defined

#### 1. Visit Definitions (`visit_definitions` table)
```sql
CREATE TABLE visit_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    visit_name VARCHAR(100) NOT NULL,      -- "Screening", "Baseline", "Week 4"
    visit_code VARCHAR(50),                -- "SCR", "BL", "W4"
    visit_type VARCHAR(50) NOT NULL,       -- SCREENING, TREATMENT, FOLLOW_UP
    sequence_number INT,                   -- Visit order: 1, 2, 3...
    day_offset INT,                        -- Days from baseline: 0, 7, 28, 56
    window_before_days INT,                -- -7 (visit window start)
    window_after_days INT,                 -- +7 (visit window end)
    is_required BOOLEAN DEFAULT true,      -- Mandatory vs optional
    INDEX idx_study (study_id)
);
```

**Example Data:**
```sql
INSERT INTO visit_definitions VALUES
(1, 11, 'Screening Visit', 'SCR', 'SCREENING', 1, -14, -7, 0, true),
(2, 11, 'Baseline Visit', 'BL', 'BASELINE', 2, 0, 0, 0, true),
(3, 11, 'Week 4 Visit', 'W4', 'TREATMENT', 3, 28, -3, 3, true),
(4, 11, 'Week 8 Visit', 'W8', 'TREATMENT', 4, 56, -7, 7, true),
(5, 11, 'End of Study', 'EOS', 'FOLLOW_UP', 5, 84, -14, 14, true);
```

#### 2. Form Definitions (`forms` table)
```sql
CREATE TABLE forms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    form_name VARCHAR(200) NOT NULL,       -- "Demographics", "Vitals", "Adverse Events"
    form_code VARCHAR(50),                 -- "DEMO", "VITALS", "AE"
    form_type VARCHAR(50),                 -- DATA_COLLECTION, CONSENT, QUERY
    form_structure JSON,                   -- Field definitions, validation rules
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true
);
```

**Example Data:**
```sql
INSERT INTO forms VALUES
(1, 11, 'Informed Consent Form', 'ICF', 'CONSENT', '{"fields": [...]}', 1, true),
(2, 11, 'Demographics Form', 'DEMO', 'DATA_COLLECTION', '{"fields": [...]}', 1, true),
(3, 11, 'Vitals Form', 'VITALS', 'DATA_COLLECTION', '{"fields": [...]}', 1, true),
(4, 11, 'Adverse Events Form', 'AE', 'DATA_COLLECTION', '{"fields": [...]}', 1, true);
```

#### 3. Visit-Form Associations (`visit_forms` table)
```sql
CREATE TABLE visit_forms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    visit_id BIGINT NOT NULL,              -- FK to visit_definitions
    form_id BIGINT NOT NULL,               -- FK to forms
    is_required BOOLEAN DEFAULT true,
    sequence_number INT,                   -- Form order within visit
    UNIQUE KEY uk_visit_form (visit_id, form_id)
);
```

**Example Data (Screening Visit Forms):**
```sql
INSERT INTO visit_forms VALUES
(1, 11, 1, 1, true, 1),  -- Screening requires Informed Consent (first)
(2, 11, 1, 2, true, 2),  -- Screening requires Demographics (second)
(3, 11, 1, 3, true, 3);  -- Screening requires Vitals (third)
```

**What This Means:**
- **Screening Visit** requires 3 forms
- Forms must be filled in order: ICF → Demographics → Vitals
- All forms are mandatory (`is_required=true`)

---

## Runtime Phase (Data Capture)

### How Study Build Metadata is Used

#### Step 1: Patient Enrollment
```
User clicks "Register Patient"
   ↓
PatientRegisteredEvent published
   ↓
PatientProjectionHandler creates patient record
```

#### Step 2: Patient Enrolls in Study
```
User enrolls patient in specific study
   ↓
EnrollPatientCommand sent
   ↓
PatientEnrolledEvent published
   ↓
PatientEnrollmentProjector:
  - Creates enrollment record
  - (Should trigger) Visit Schedule Generation ❌ MISSING
```

#### Step 3: Visit Schedule Generation (MISSING IN CURRENT SYSTEM)
```sql
-- Query visit_definitions for study
SELECT * FROM visit_definitions WHERE study_id = 11;

-- For each visit definition, create visit instance
INSERT INTO study_visit_instances (study_id, visit_id, subject_id, site_id, visit_date, visit_status)
SELECT 
    11,                                    -- study_id
    vd.id,                                 -- visit_definition_id
    5,                                     -- subject_id (patient)
    3,                                     -- site_id
    DATE_ADD(enrollment_date, INTERVAL vd.day_offset DAY),  -- calculated visit date
    'SCHEDULED'                            -- status
FROM visit_definitions vd
WHERE vd.study_id = 11
ORDER BY vd.sequence_number;

-- Result: Creates 5 visit instances for patient
-- 1. Screening (enrollment_date - 14 days)
-- 2. Baseline (enrollment_date)
-- 3. Week 4 (enrollment_date + 28 days)
-- 4. Week 8 (enrollment_date + 56 days)
-- 5. End of Study (enrollment_date + 84 days)
```

#### Step 4: Data Collection at Visit
```
Patient arrives for Screening Visit
   ↓
Site coordinator opens visit in UI
   ↓
System displays required forms (from visit_forms table):
  - Informed Consent Form ✓
  - Demographics Form ✓
  - Vitals Form ✓
   ↓
Coordinator fills out forms
   ↓
Form data saved to study_form_data table:
  - study_id = 11
  - form_id = 1 (ICF)
  - subject_id = 5
  - visit_id = 123 (from study_visit_instances)
  - form_data = {JSON with field values}
```

---

## Why You're Not Seeing Visits

### Current System Architecture

Your system has **TWO visit tables**:

#### Table 1: `study_visit_instances` (Study Build System)
- **Purpose:** Track **scheduled** visits based on visit_definitions
- **Created:** Automatically when patient enrolls in study
- **Requires:** Study build metadata (visit_definitions, visit_forms)
- **Status:** ❌ **NOT IMPLEMENTED** in current projection logic

#### Table 2: `visit` (Unscheduled Visit System)
- **Purpose:** Track **ad-hoc/unscheduled** visits (manual creation)
- **Created:** Manually by user via `UnscheduledVisitModal`
- **Requires:** User to click "Create Visit" button
- **Status:** ✅ **IMPLEMENTED** in VisitProjector

### The Disconnect

**Expected Flow (With Study Build):**
```
Patient Enrolled → Query visit_definitions → Create visit_instances → Display in UI
```

**Actual Flow (Current System):**
```
Patient Enrolled → Nothing happens
   ↓
User must manually create each visit:
   1. Change status to SCREENING
   2. Click "Yes, Create Visit" button
   3. Fill out UnscheduledVisitModal
   4. Visit created in `visit` table
```

### Why You're Not Seeing Visits

**Root Causes:**

1. **No Automatic Visit Generation:**
   - `PatientEnrollmentProjector.on(PatientEnrolledEvent)` doesn't query `visit_definitions`
   - No logic to create visit instances from study metadata
   - Visits only created when user manually clicks "Create Visit"

2. **Study Build Metadata May Not Exist:**
   - `visit_definitions` table may be empty (no visits defined for study)
   - `visit_forms` table may be empty (no forms assigned to visits)
   - Without this metadata, system doesn't know what visits to create

3. **User Workflow Requires Manual Visit Creation:**
   - After status change (REGISTERED → SCREENING)
   - Modal asks: "Would you like to create a Screening Visit?"
   - User must click "Yes, Create Visit"
   - Only then is visit created

---

## Current System Architecture

### What Works ✅

**1. Unscheduled Visit Creation**
```javascript
// Frontend: UnscheduledVisitModal.jsx
const visitData = {
    patientId: 5,
    studyId: 11,
    siteId: 3,
    visitType: 'SCREENING',
    visitDate: '2025-10-14',
    createdBy: 'Dr. Smith',
    notes: 'Initial screening'
};

await VisitService.createUnscheduledVisit(visitData);
```

```java
// Backend: VisitController.java
@PostMapping("/unscheduled")
public ResponseEntity<Map<String, Object>> createUnscheduledVisit(@RequestBody CreateUnscheduledVisitCommand command) {
    UUID visitId = visitCommandService.createUnscheduledVisit(command);
    // Returns visitId
}
```

```java
// Event Sourcing: VisitAggregate.java
public VisitAggregate(CreateUnscheduledVisitCommand command) {
    AggregateLifecycle.apply(new VisitCreatedEvent(...));
}
```

```java
// Projection: VisitProjector.java
@EventHandler
public void on(VisitCreatedEvent event) {
    VisitEntity visit = new VisitEntity();
    visit.setVisitId(event.getVisitId());
    visit.setPatientId(event.getPatientId());
    // ... set all fields
    visitRepository.save(visit);
}
```

**2. Visit Retrieval**
```javascript
// Frontend: SubjectDetails.jsx
const visits = await getPatientVisits(patientId);
setVisits(visits);
```

```java
// Backend: VisitController.java
@GetMapping("/patient/{patientId}")
public ResponseEntity<List<VisitEntity>> getPatientVisits(@PathVariable Long patientId) {
    return visitRepository.findByPatientIdOrderByVisitDateDesc(patientId);
}
```

### What's Missing ❌

**1. Study Build Metadata Population**
- No UI to define visit schedule for study
- No UI to assign forms to visits
- `visit_definitions` table empty
- `visit_forms` table empty

**2. Automatic Visit Instance Creation**
- When patient enrolls → Should query visit_definitions
- Should create visit instances for entire study duration
- Should calculate visit dates based on `day_offset`
- Not implemented in `PatientEnrollmentProjector`

**3. Visit Window Management**
- No logic to track visit windows (±7 days)
- No alerts for missed visits
- No status tracking (ON_TIME, EARLY, LATE, OUT_OF_WINDOW)

---

## How to Fix

### Option 1: Implement Full Study Build System (Proper Solution)

**Step 1: Create Study Build UI**
```javascript
// New component: StudyVisitScheduleBuilder.jsx
// Features:
// - Add visit definitions
// - Set visit windows
// - Assign forms to visits
// - Preview visit schedule
```

**Step 2: Populate Metadata Tables**
```sql
-- Example: Define visit schedule for study
INSERT INTO visit_definitions (study_id, visit_name, visit_type, day_offset, window_before_days, window_after_days)
VALUES
(11, 'Screening', 'SCREENING', -14, -7, 0),
(11, 'Baseline', 'BASELINE', 0, 0, 0),
(11, 'Week 4', 'TREATMENT', 28, -3, 3);

-- Assign forms to visits
INSERT INTO visit_forms (study_id, visit_id, form_id, is_required, sequence_number)
VALUES
(11, 1, 1, true, 1),  -- Screening requires ICF
(11, 1, 2, true, 2),  -- Screening requires Demographics
(11, 1, 3, true, 3);  -- Screening requires Vitals
```

**Step 3: Add Visit Generation Logic to Projector**
```java
// PatientEnrollmentProjector.java
@EventHandler
@Transactional
public void on(PatientEnrolledEvent event) {
    // ... existing enrollment logic ...
    
    // NEW: Generate visit instances from visit_definitions
    List<VisitDefinitionEntity> visitDefs = visitDefinitionRepository
        .findByStudyIdOrderBySequenceNumber(event.getStudyId());
    
    LocalDate enrollmentDate = event.getEnrollmentDate();
    
    for (VisitDefinitionEntity visitDef : visitDefs) {
        // Calculate visit date
        LocalDate visitDate = enrollmentDate.plusDays(visitDef.getDayOffset());
        
        // Create visit instance command
        CreateScheduledVisitCommand visitCommand = CreateScheduledVisitCommand.builder()
            .patientId(patient.getId())
            .studyId(realStudyId)
            .siteId(event.getSiteId())
            .visitDefinitionId(visitDef.getId())
            .visitType(visitDef.getVisitType())
            .visitDate(visitDate)
            .status("SCHEDULED")
            .createdBy(event.getEnrolledBy())
            .build();
        
        // Send command to create visit
        visitCommandService.createScheduledVisit(visitCommand);
        
        log.info("Created scheduled visit: {} for patient {} on {}", 
            visitDef.getVisitName(), patient.getId(), visitDate);
    }
}
```

**Step 4: Update UI to Show Generated Visits**
```javascript
// SubjectDetails.jsx already has visit display logic
// Visits will automatically appear after enrollment
useEffect(() => {
    if (subject?.id) {
        fetchVisits(); // Will now return generated visits
    }
}, [subject?.id]);
```

### Option 2: Quick Fix (Current System)

**Accept Manual Visit Creation** and improve the workflow:

**Step 1: Pre-populate Study and Site IDs**
```javascript
// StatusChangeModal.jsx
const handleStatusChanged = async () => {
    // After successful status change
    if (shouldPromptForVisit(newStatus)) {
        // Auto-open visit modal with pre-filled data
        setShowVisitModal(true);
        setVisitModalData({
            patientId: subject.id,
            studyId: subject.studyId,      // ✅ Pre-filled
            siteId: subject.siteId,        // ✅ Pre-filled
            visitType: getVisitTypeForStatus(newStatus),
            visitDate: new Date().toISOString().split('T')[0]
        });
    }
};
```

**Step 2: Add "Quick Create" Button**
```javascript
// SubjectDetails.jsx - Add button to visits section
<div className="flex justify-between items-center mb-2">
    <h4 className="font-medium">Visits</h4>
    <div className="flex gap-2">
        <button 
            onClick={() => setShowVisitModal(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
            + Create Visit
        </button>
        <Link to={`/datacapture-management/subjects/${subjectId}/visits`}>
            View All Visits
        </Link>
    </div>
</div>
```

**Step 3: Verify Subject Has Study/Site Data**
```sql
-- Check if subject has necessary enrollment data
SELECT 
    p.id as patient_id,
    p.patient_number,
    pe.study_id,
    pe.study_site_id as site_id,
    pe.enrollment_date
FROM patient p
LEFT JOIN patient_enrollments pe ON p.id = pe.patient_id
WHERE p.id = 5;

-- If study_id or site_id is NULL, visits cannot be created
```

---

## Summary

### The Core Problem

**Study Build Process** defines the **metadata** (what visits exist, when they occur, what forms are needed).  
**Runtime System** uses this metadata to **generate visit instances** automatically when patients enroll.

**Your System:**
- Has runtime visit creation (UnscheduledVisitModal) ✅
- Has visit storage (visit table) ✅
- Has visit retrieval (getPatientVisits API) ✅
- **Missing:** Automatic visit generation from study metadata ❌
- **Missing:** Study build metadata population (visit_definitions) ❌

### Why You're Not Seeing Visits

1. **No visits have been manually created** via UnscheduledVisitModal
2. **No automatic visit generation** happens at enrollment
3. **Study build metadata may not exist** (visit_definitions table empty)

### Quick Test

**Check if study has visit definitions:**
```sql
SELECT * FROM visit_definitions WHERE study_id = 11;
-- If empty → No visits will be generated
```

**Check if patient has enrollment data:**
```sql
SELECT * FROM patient_enrollments WHERE patient_id = 5;
-- Need: study_id, study_site_id (for creating visits)
```

**Manually create a test visit:**
1. Open SubjectDetails page for patient
2. Click "Change Status" → Change to SCREENING
3. When prompted "Create Screening Visit?" → Click "Yes, Create Visit"
4. Fill out visit date and notes
5. Submit
6. Visit should now appear in visits list

### Recommended Path Forward

**Short-term (This Week):**
- ✅ Accept manual visit creation workflow
- ✅ Add "Quick Create Visit" button to SubjectDetails
- ✅ Ensure subject has study_id and site_id populated
- ✅ Test manual visit creation end-to-end

**Long-term (Next Sprint):**
- 📋 Design Study Build UI (visit schedule builder)
- 📋 Populate visit_definitions and visit_forms tables
- 📋 Implement automatic visit generation in PatientEnrollmentProjector
- 📋 Add visit window tracking and alerts

---

## Conclusion

The study build process is **essential** because it defines the **trial protocol** that governs data collection. Without it, the system doesn't know:
- What visits should exist
- When visits should occur
- What data to collect at each visit

Your current system supports **ad-hoc visit creation**, which works for:
- Unscheduled visits (adverse events, early terminations)
- Pilots and demos
- Simple workflows

But for **production clinical trials**, you'll need the full study build system to:
- Automatically generate visit schedules
- Enforce protocol compliance
- Track visit windows and missed visits
- Ensure complete data collection

**For now**, you can manually create visits via the UnscheduledVisitModal to see them appear in SubjectDetails. This will unblock testing while the full study build system is implemented.
