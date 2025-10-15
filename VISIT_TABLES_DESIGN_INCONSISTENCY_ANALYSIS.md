# Visit Tables Analysis - Design Inconsistency Report

**Date:** 2025-10-14  
**Issue:** Two separate visit tables with overlapping purposes  
**Impact:** Confusion, data fragmentation, query complexity

---

## The Problem

Your database has **TWO separate tables** for storing visits:

### Table 1: `visit` (Line 1459)
```sql
CREATE TABLE visit (
    visit_id BINARY(16) PRIMARY KEY COMMENT 'UUID of visit',
    patient_id BIGINT NOT NULL COMMENT 'FK to patients',
    study_id BIGINT NOT NULL COMMENT 'FK to studies',
    site_id BIGINT NOT NULL COMMENT 'FK to sites',
    visit_type VARCHAR(50) NOT NULL,
    visit_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    created_by VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);
```

**Characteristics:**
- Primary key: `visit_id` (UUID/BINARY(16))
- No connection to `visit_definitions`
- Simple structure
- Appears BEFORE the "Study Database Shared Tables" comment
- **Created for:** Unscheduled/ad-hoc visits (event sourcing approach)
- **Used by:** VisitEntity.java, VisitProjector.java, UnscheduledVisitService

### Table 2: `study_visit_instances` (Line 1549)
```sql
CREATE TABLE IF NOT EXISTS study_visit_instances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    visit_id BIGINT NOT NULL,               -- FK to visit_definitions
    subject_id BIGINT NOT NULL,             -- FK to study_subjects
    site_id BIGINT,
    visit_date DATE,                        -- Scheduled/planned date
    actual_visit_date DATE,                 -- Actual date visit occurred
    visit_status VARCHAR(50) DEFAULT 'SCHEDULED',
    window_status VARCHAR(50),              -- ON_TIME, EARLY, LATE, OUT_OF_WINDOW
    completion_percentage DECIMAL(5,2),     -- % of required forms completed
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Characteristics:**
- Primary key: `id` (BIGINT AUTO_INCREMENT)
- **Foreign key to `visit_definitions`** ✅
- Rich metadata (window_status, completion_percentage, actual_visit_date)
- Appears AFTER "Study Database Shared Tables" comment
- **Created for:** Scheduled visits from study design (study build approach)
- **Used by:** Currently NOT USED in backend code

---

## How This Happened (Timeline Analysis)

### Phase 1: Initial Implementation (Older)
**Study Build System** was implemented first:
1. `visit_definitions` table created (line 930) - Defines visit schedule
2. `visit_forms` table created (line 998) - Maps forms to visits
3. `study_visit_instances` table created (line 1549) - Instances of scheduled visits

**Purpose:** Traditional clinical trial approach where study design defines all visits upfront.

**Example:**
```sql
-- Study Design Phase
INSERT INTO visit_definitions VALUES (1, 11, 'Screening', 'SCREENING', 0, 3, 7, true);
INSERT INTO visit_definitions VALUES (2, 11, 'Baseline', 'BASELINE', 30, 3, 7, true);

-- Patient Enrollment
-- Automatically create visit instances from definitions
INSERT INTO study_visit_instances (study_id, visit_id, subject_id, visit_date, visit_status)
SELECT 11, vd.id, 5, DATE_ADD('2025-10-14', INTERVAL vd.timepoint DAY), 'SCHEDULED'
FROM visit_definitions vd WHERE vd.study_id = 11;

-- Result: 4 scheduled visits created for patient
```

### Phase 2: Event Sourcing Implementation (Newer)
**Unscheduled Visit System** was added later:
1. `visit` table created (line 1459) - Simpler structure
2. `VisitAggregate.java` created - Event sourcing aggregate
3. `VisitCreatedEvent` - Domain event
4. `VisitProjector.java` - Projects events to `visit` table
5. `UnscheduledVisitModal.jsx` - Frontend UI

**Purpose:** Support ad-hoc visits (adverse events, unscheduled assessments) using event sourcing pattern.

**Example:**
```java
// Command: CreateUnscheduledVisit
CreateUnscheduledVisitCommand command = new CreateUnscheduledVisitCommand(
    patientId: 5,
    studyId: 11,
    siteId: 3,
    visitType: "ADVERSE_EVENT",
    visitDate: LocalDate.now()
);

// Event: VisitCreatedEvent published
// Projection: Inserts into `visit` table
INSERT INTO visit (visit_id, patient_id, study_id, site_id, visit_type, visit_date, status)
VALUES (UUID(), 5, 11, 3, 'ADVERSE_EVENT', '2025-10-14', 'SCHEDULED');
```

---

## Why This is Problematic

### 1. Data Fragmentation
```
Scheduled visits → stored in study_visit_instances (56 records)
Unscheduled visits → stored in visit (0 records)
```

**Result:** No single source of truth for "all patient visits"

### 2. Query Complexity
```sql
-- To get ALL visits for a patient, you need UNION:
SELECT 
    svi.id, svi.visit_date, vd.name as visit_name, svi.visit_status as status, 
    'SCHEDULED' as source
FROM study_visit_instances svi
JOIN visit_definitions vd ON svi.visit_id = vd.id
WHERE svi.subject_id = 5

UNION ALL

SELECT 
    CONVERT(v.visit_id, CHAR) as id, v.visit_date, v.visit_type as visit_name, 
    v.status, 'UNSCHEDULED' as source
FROM visit v
WHERE v.patient_id = 5;
```

**Problem:** Complex, error-prone, poor performance

### 3. Frontend Confusion
```javascript
// SubjectDetails.jsx tries to fetch visits
const visits = await getPatientVisits(patientId);
```

**Which table does this query?**
- Current implementation: `visit` table (empty)
- Expected data location: `study_visit_instances` table (56 records)
- **Result:** Frontend shows "No visits" despite 56 visits existing!

### 4. Inconsistent Terminology
```
visit.patient_id ≠ study_visit_instances.subject_id
visit.visit_id (UUID) ≠ study_visit_instances.visit_id (FK to definitions)
```

### 5. Duplicate Logic
```
VisitService.getPatientVisits() → queries `visit` table
StudyVisitInstanceService.getSubjectVisits() → would query `study_visit_instances`
```

---

## Root Cause Analysis

### Why Two Tables Exist

**Historical Context:**
1. **Original Design:** Study build system (visit_definitions → study_visit_instances)
2. **Requirement Change:** Need to support unscheduled visits
3. **Implementation Decision:** Add new `visit` table with event sourcing instead of extending existing system
4. **Result:** Two parallel systems that don't integrate

### Architectural Mismatch

**Study Build Approach:**
- Visit definitions = metadata (what visits can exist)
- Visit instances = data (actual visits for patients)
- Relationship-based (FK to visit_definitions)

**Event Sourcing Approach:**
- No visit definitions needed
- Direct visit creation
- UUID-based identity
- Event stream as source of truth

---

## Recommended Solutions

### Solution 1: Merge Tables (Unified Approach) ⭐ RECOMMENDED

**Keep:** `visit_definitions` + `study_visit_instances`  
**Remove:** `visit` table  
**Add:** Support for both scheduled and unscheduled visits in `study_visit_instances`

**Implementation:**

#### Step 1: Add "UNSCHEDULED" Visit Definition Type
```sql
ALTER TABLE visit_definitions 
  MODIFY visit_type ENUM('SCREENING', 'BASELINE', 'TREATMENT', 'FOLLOW_UP', 'UNSCHEDULED', 'END_OF_STUDY') DEFAULT 'TREATMENT';

-- Create generic "Unscheduled Visit" definitions
INSERT INTO visit_definitions (study_id, name, visit_type, timepoint, is_required)
SELECT DISTINCT id, 'Unscheduled Visit', 'UNSCHEDULED', 0, false
FROM studies;
```

#### Step 2: Modify `study_visit_instances` to Support Both Types
```sql
ALTER TABLE study_visit_instances 
  ADD COLUMN is_scheduled BOOLEAN DEFAULT true COMMENT 'false for ad-hoc/unscheduled visits',
  ADD COLUMN visit_name VARCHAR(255) COMMENT 'Override name for unscheduled visits',
  ADD COLUMN aggregate_uuid VARCHAR(36) COMMENT 'UUID for event sourcing (unscheduled visits)',
  MODIFY visit_id BIGINT NULL COMMENT 'NULL for unscheduled visits without definition';
```

#### Step 3: Update Backend to Use Single Table
```java
// VisitProjector.java
@EventHandler
public void on(VisitCreatedEvent event) {
    // Create study_visit_instance instead of visit
    StudyVisitInstanceEntity visit = StudyVisitInstanceEntity.builder()
        .studyId(event.getStudyId())
        .visitId(null) // No visit definition for unscheduled
        .subjectId(event.getPatientId())
        .siteId(event.getSiteId())
        .visitDate(event.getVisitDate())
        .visitStatus(event.getStatus())
        .isScheduled(false) // Mark as unscheduled
        .visitName(getVisitTypeName(event.getVisitType())) // "Adverse Event Visit"
        .aggregateUuid(event.getVisitId().toString()) // Event sourcing UUID
        .notes(event.getNotes())
        .build();
    
    studyVisitInstanceRepository.save(visit);
}
```

#### Step 4: Single Query for All Visits
```java
// Now a simple query returns BOTH scheduled and unscheduled visits
@Query("SELECT v FROM StudyVisitInstanceEntity v WHERE v.subjectId = :subjectId ORDER BY v.visitDate DESC")
List<StudyVisitInstanceEntity> findBySubjectIdOrderByVisitDateDesc(@Param("subjectId") Long subjectId);
```

#### Step 5: Migrate Existing Data (If Any)
```sql
-- If visit table had data, migrate it
INSERT INTO study_visit_instances (
    study_id, visit_id, subject_id, site_id, visit_date, visit_status, 
    is_scheduled, visit_name, aggregate_uuid, notes
)
SELECT 
    v.study_id, 
    NULL, -- no visit definition
    v.patient_id, 
    v.site_id, 
    v.visit_date, 
    v.status,
    false, -- unscheduled
    v.visit_type, -- use visit type as name
    CONVERT(v.visit_id, CHAR), -- preserve UUID
    v.notes
FROM visit v;

-- Then drop visit table
DROP TABLE visit;
```

**Benefits:**
- ✅ Single source of truth
- ✅ Simpler queries
- ✅ Unified UI
- ✅ Preserves study build metadata
- ✅ Supports both scheduled and unscheduled visits
- ✅ Event sourcing still works (via aggregate_uuid column)

---

### Solution 2: Keep Both Tables (Dual Approach)

**Keep:** Both `visit` and `study_visit_instances`  
**Fix:** Make them work together

**Implementation:**

#### Create Unified View
```sql
CREATE VIEW all_patient_visits AS
SELECT 
    svi.id,
    CAST(svi.id AS CHAR) as visit_id,
    svi.subject_id as patient_id,
    svi.study_id,
    svi.site_id,
    vd.name as visit_name,
    vd.visit_type,
    svi.visit_date,
    svi.actual_visit_date,
    svi.visit_status as status,
    svi.window_status,
    svi.completion_percentage,
    'SCHEDULED' as source,
    true as is_scheduled,
    svi.created_at,
    svi.notes
FROM study_visit_instances svi
JOIN visit_definitions vd ON svi.visit_id = vd.id

UNION ALL

SELECT 
    NULL as id,
    CONVERT(v.visit_id, CHAR) as visit_id,
    v.patient_id,
    v.study_id,
    v.site_id,
    v.visit_type as visit_name,
    v.visit_type,
    v.visit_date,
    NULL as actual_visit_date,
    v.status,
    NULL as window_status,
    NULL as completion_percentage,
    'UNSCHEDULED' as source,
    false as is_scheduled,
    v.created_at,
    v.notes
FROM visit v;
```

#### Query the View
```java
@Query(value = "SELECT * FROM all_patient_visits WHERE patient_id = :patientId ORDER BY visit_date DESC", nativeQuery = true)
List<Map<String, Object>> findAllVisitsByPatientId(@Param("patientId") Long patientId);
```

**Drawbacks:**
- ❌ View complexity
- ❌ Two tables to maintain
- ❌ Confusing for developers
- ❌ Harder to enforce data integrity

---

### Solution 3: Deprecate Study Build (Event-Only Approach)

**Keep:** `visit` table  
**Remove:** `visit_definitions` + `study_visit_instances`  
**Assumption:** All visits created on-demand (no pre-scheduling)

**Drawbacks:**
- ❌ Loses 56 existing scheduled visits
- ❌ No visit schedule planning
- ❌ No visit windows or protocol compliance
- ❌ Doesn't match clinical trial requirements

**Not recommended** for clinical trials.

---

## Current State Summary

### What You Have Now:

**Database:**
- ✅ `visit_definitions`: 4 visit definitions for study 11
- ✅ `study_visit_instances`: 56 scheduled visit instances (14 sets of 4 visits each)
- ❌ `visit`: Empty (0 records)

**Backend:**
- ✅ `VisitEntity` → maps to `visit` table
- ✅ `VisitRepository` → queries `visit` table
- ✅ `VisitProjector` → projects to `visit` table
- ❌ No entity/repository for `study_visit_instances`

**Frontend:**
- ✅ `VisitService.getPatientVisits()` → calls `/api/v1/visits/patient/{patientId}`
- ❌ Backend returns empty list (queries empty `visit` table)
- ❌ Frontend shows "No visits" despite 56 visits in `study_visit_instances`

**Result:**
```
User: "Why can't I see visits?"
System: Queries wrong table (visit instead of study_visit_instances)
```

---

## Immediate Fix (Quick Solution)

**Option A: Query study_visit_instances**

I've already created the entities and repositories for you:
- ✅ `StudyVisitInstanceEntity.java`
- ✅ `StudyVisitInstanceRepository.java`

**Next steps:**
1. Update `UnscheduledVisitService` to query `study_visit_instances`
2. Map `study_visit_instances` data to `VisitDto`
3. Test frontend - visits should now appear

**Option B: Migrate data to visit table**

Project existing visits into `visit` table:
```sql
INSERT INTO visit (visit_id, patient_id, study_id, site_id, visit_type, visit_date, status, created_at, notes)
SELECT 
    UUID(),
    svi.subject_id,
    svi.study_id,
    svi.site_id,
    vd.visit_type,
    svi.visit_date,
    svi.visit_status,
    svi.created_at,
    svi.notes
FROM study_visit_instances svi
JOIN visit_definitions vd ON svi.visit_id = vd.id;
```

---

## Recommendation

**Implement Solution 1: Merge Tables (Unified Approach)**

**Why:**
- Leverages existing study build infrastructure (56 visits already created)
- Supports future requirements (visit windows, protocol compliance)
- Simpler for developers (one table to query)
- Maintains event sourcing capability
- Industry standard for clinical trials

**Timeline:**
- Phase 1 (Now): Use `study_visit_instances` for queries (quick fix)
- Phase 2 (Next Sprint): Merge tables and update all code
- Phase 3 (Future): Add visit window tracking, protocol compliance

---

## Conclusion

**The Root Cause:**
Two different implementation approaches (study build vs event sourcing) created two separate tables without integration.

**The Impact:**
Data exists but isn't visible because frontend/backend query the wrong table.

**The Solution:**
Consolidate into single `study_visit_instances` table that supports both scheduled (from definitions) and unscheduled (from events) visits.

**Next Action:**
Choose Solution 1 for long-term success, or use quick fix (query study_visit_instances) to unblock testing immediately.
