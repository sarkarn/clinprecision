# Build Tracking: Why build_id Belongs in BOTH Tables

**Date**: October 16, 2025  
**Issue**: User correctly identified that `build_id` should be in `study_form_data`, not just `visit_forms`  
**Status**: Critical Design Flaw Identified - Requires Immediate Fix

---

## 🎯 The Question

**User**: "Why are you adding build_id in the visit_forms table not in the study_form_data table?"

**Answer**: You're **absolutely correct** - we need `build_id` in **BOTH** tables, but for **different reasons**!

---

## 📊 Table Purpose Comparison

### `visit_forms` (Design-Time Table)
**Purpose**: **Protocol definition** - Which forms are assigned to which visits

```sql
CREATE TABLE visit_forms (
    id BIGINT PRIMARY KEY,
    visit_definition_id BIGINT,     -- Which visit
    form_definition_id BIGINT,      -- Which form
    is_required BOOLEAN,
    display_order INT,
    build_id BIGINT,  -- ✅ CORRECT: Tracks which protocol version this assignment belongs to
    -- ...
);
```

**Why build_id here?**
- ✅ Different protocol versions may have different form assignments
- ✅ "Version 1" might require Demographics form on Visit 1
- ✅ "Version 2" might move Demographics to Visit 2
- ✅ Ensures patients see the correct form schedule based on their enrollment build

**Example**:
```sql
-- Build 1: Demographics on Screening Visit
INSERT INTO visit_forms (visit_definition_id, form_definition_id, build_id)
VALUES (1, 100, 1);  -- Visit 1 (Screening), Form 100 (Demographics), Build 1

-- Build 2: Demographics moved to Baseline Visit  
INSERT INTO visit_forms (visit_definition_id, form_definition_id, build_id)
VALUES (2, 100, 2);  -- Visit 2 (Baseline), Form 100 (Demographics), Build 2
```

---

### `study_form_data` (Runtime Table)
**Purpose**: **Actual patient data** - Form submissions with patient answers

```sql
CREATE TABLE study_form_data (
    id BIGINT PRIMARY KEY,
    study_id BIGINT,
    form_id BIGINT,                 -- Which form template
    subject_id BIGINT,              -- Which patient
    visit_id BIGINT,                -- Which visit instance
    form_data JSON,                 -- Patient's actual answers
    status VARCHAR(50),
    build_id BIGINT,  -- ❌ MISSING! Should track which form version was used
    -- ...
);
```

**Why build_id ALSO needed here?**
- ✅ Form **definitions** (structure/fields) can change between builds
- ✅ Patient A (enrolled in Build 1) sees 10 fields in Demographics form
- ✅ Patient B (enrolled in Build 2) sees 12 fields in Demographics form (2 new questions added)
- ✅ When displaying/validating form data, we need to know which form version was filled out
- ✅ **Critical for data integrity** - can't validate Build 1 data against Build 2 schema

---

## 🔥 The Critical Problem

### Current Implementation (WRONG):
```
Patient Enrollment → Gets build_id in study_visit_instances
                  ↓
Creates Visit Instances → Each has build_id
                  ↓
Patient Fills Form → Saved to study_form_data ❌ NO build_id!
                  ↓
Retrieve Form Data → Which form version should we use? 🤷 UNKNOWN!
```

### What Happens Without build_id in study_form_data:

**Scenario 1: Form Structure Changed**
```sql
-- Build 1 (Patient A enrolled here)
form_definitions: {
  "fields": [
    {"id": "name", "type": "text"},
    {"id": "age", "type": "number"}
  ]
}

-- Build 2 (Patient B enrolled here)
form_definitions: {
  "fields": [
    {"id": "name", "type": "text"},
    {"id": "age", "type": "number"},
    {"id": "ethnicity", "type": "select"},  -- NEW FIELD
    {"id": "race", "type": "select"}        -- NEW FIELD
  ]
}

-- Patient A submits Demographics form
INSERT INTO study_form_data (form_id, subject_id, form_data, build_id)
VALUES (100, 1001, '{"name":"John","age":45}', NULL);  -- ❌ NO BUILD ID!

-- Later, system tries to display this form
-- Question: Should it show 2 fields or 4 fields?
-- Answer: UNKNOWN because no build_id! 💥
```

**Scenario 2: Validation Rules Changed**
```sql
-- Build 1: Age range 18-65
-- Build 2: Age range 18-85 (protocol amended)

-- Patient A (Build 1) entered age=70 → Was this VALID or INVALID?
-- Without build_id, we can't tell! 💥
```

**Scenario 3: Field Removed**
```sql
-- Build 1: Has "smoker_status" field
-- Build 2: Field removed (protocol simplified)

-- Patient A (Build 1) submitted smoker_status="yes"
-- Build 2 form definition doesn't have this field
-- System tries to display: Field not found! 💥
```

---

## 🎯 Correct Implementation (BOTH Tables)

### What build_id Tracks in Each Table:

| Table | build_id Purpose | Example |
|-------|-----------------|---------|
| **visit_forms** | Which protocol version assigns this form to this visit | "In Build 1, Demographics is on Visit 1. In Build 2, it's on Visit 2." |
| **study_form_data** | Which form definition version was used when patient filled it out | "This patient filled out the Build 1 version of Demographics (10 fields), not Build 2 version (12 fields)." |

### Correct Data Flow:

```
Patient Enrollment (Build 1)
  ↓
study_visit_instances.build_id = 1 ✅
  ↓
Query: "Which forms for this visit?" 
  → SELECT * FROM visit_forms WHERE visit_id=X AND build_id=1 ✅
  ↓
Patient Fills Demographics Form (Build 1 version)
  ↓
study_form_data.build_id = 1 ✅
  ↓
Later: "Display this form data"
  → Get form_definition for build_id=1
  → Show 10 fields (correct version)
  → Validate against Build 1 rules ✅
```

---

## 📋 Real-World Example

### Multi-Build Clinical Trial Scenario:

**Timeline**:
- **Jan 2025**: Study launches with Build 1
- **Mar 2025**: Protocol amendment approved → Build 2 created
- **Jun 2025**: Another amendment → Build 3 created

**Patient Enrollment**:
```sql
-- Patient A enrolled in January (Build 1)
INSERT INTO study_visit_instances (subject_id, visit_id, build_id)
VALUES (1001, 1, 1);

-- Patient B enrolled in April (Build 2)  
INSERT INTO study_visit_instances (subject_id, visit_id, build_id)
VALUES (1002, 1, 2);

-- Patient C enrolled in July (Build 3)
INSERT INTO study_visit_instances (subject_id, visit_id, build_id)
VALUES (1003, 1, 3);
```

**Form Data Submissions**:
```sql
-- Patient A fills Demographics (Build 1 version - 10 fields)
INSERT INTO study_form_data (subject_id, form_id, visit_id, form_data, build_id)
VALUES (1001, 100, 5001, '{"name":"Alice",...}', 1);  -- ✅ build_id=1

-- Patient B fills Demographics (Build 2 version - 12 fields)
INSERT INTO study_form_data (subject_id, form_id, visit_id, form_data, build_id)
VALUES (1002, 100, 5002, '{"name":"Bob",...}', 2);  -- ✅ build_id=2

-- Patient C fills Demographics (Build 3 version - 11 fields)
INSERT INTO study_form_data (subject_id, form_id, visit_id, form_data, build_id)
VALUES (1003, 100, 5003, '{"name":"Charlie",...}', 3);  -- ✅ build_id=3
```

**Data Retrieval**:
```sql
-- Display Alice's Demographics form
SELECT 
    sfd.form_data,
    fd.fields  -- Get form structure from Build 1
FROM study_form_data sfd
JOIN form_definitions fd ON fd.id = sfd.form_id AND fd.build_id = sfd.build_id
WHERE sfd.id = 1;
-- ✅ Shows 10 fields (correct Build 1 version)

-- Display Bob's Demographics form
SELECT 
    sfd.form_data,
    fd.fields  -- Get form structure from Build 2
FROM study_form_data sfd
JOIN form_definitions fd ON fd.id = sfd.form_id AND fd.build_id = sfd.build_id
WHERE sfd.id = 2;
-- ✅ Shows 12 fields (correct Build 2 version)
```

---

## 🔍 How to Derive build_id for study_form_data

### Method 1: From Visit Instance (RECOMMENDED)
```sql
-- When patient fills form during a visit
INSERT INTO study_form_data (
    study_id, form_id, subject_id, visit_id, 
    form_data, build_id, created_by
)
SELECT 
    :study_id,
    :form_id,
    :subject_id,
    :visit_id,
    :form_data,
    svi.build_id,  -- ✅ Get build_id from visit instance
    :user_id
FROM study_visit_instances svi
WHERE svi.id = :visit_id;
```

### Method 2: From Patient Enrollment
```sql
-- For unscheduled forms (not tied to specific visit)
INSERT INTO study_form_data (
    study_id, form_id, subject_id, 
    form_data, build_id, created_by
)
SELECT 
    :study_id,
    :form_id,
    :subject_id,
    :form_data,
    pe.build_id,  -- Get from patient enrollment record
    :user_id
FROM patient_enrollments pe
WHERE pe.patient_id = :subject_id 
  AND pe.study_id = :study_id;
```

### Method 3: From Active Build (For Non-Visit Forms)
```sql
-- For standalone forms (queries, administrative forms)
INSERT INTO study_form_data (
    study_id, form_id, form_data, build_id, created_by
)
SELECT 
    :study_id,
    :form_id,
    :form_data,
    sdb.id,  -- Get current active build
    :user_id
FROM study_database_builds sdb
WHERE sdb.study_id = :study_id
  AND sdb.build_status = 'COMPLETED'
ORDER BY sdb.build_end_time DESC
LIMIT 1;
```

---

## ⚠️ Impact of Current Missing build_id

### Data Integrity Issues:
1. ❌ **Cannot determine which form version patient saw**
2. ❌ **Cannot validate data against correct validation rules**
3. ❌ **Cannot display form with correct field structure**
4. ❌ **Cannot export data with correct schema**
5. ❌ **Cannot audit which protocol version was followed**

### Compliance Issues (21 CFR Part 11):
1. ❌ **No traceability** - Can't prove which protocol version was used
2. ❌ **Data integrity violation** - Form data disconnected from definition
3. ❌ **Audit trail incomplete** - Missing critical versioning info

### Functional Bugs:
1. 🐛 Form display errors when structure changed
2. 🐛 Validation errors using wrong rule set
3. 🐛 Export errors due to schema mismatch
4. 🐛 Query errors when fields renamed/removed

---

## 🚀 Required Fix

### 1. Update Migration Script
**File**: `backend/clinprecision-db/migrations/20251016_add_build_tracking_to_patient_visits.sql`

**Add to existing migration**:
```sql
-- Add build_id to study_form_data table
ALTER TABLE study_form_data 
ADD COLUMN build_id BIGINT NULL COMMENT 'FK to study_database_builds - tracks which form version was used';

-- Add foreign key
ALTER TABLE study_form_data 
ADD CONSTRAINT fk_study_form_data_build 
FOREIGN KEY (build_id) REFERENCES study_database_builds(id);

-- Add index
CREATE INDEX idx_study_form_data_build_id ON study_form_data(build_id);

-- Backfill existing data
UPDATE study_form_data sfd
JOIN study_visit_instances svi ON svi.id = sfd.visit_id
SET sfd.build_id = svi.build_id
WHERE sfd.visit_id IS NOT NULL;

-- For forms not tied to visits, use first completed build
UPDATE study_form_data sfd
LEFT JOIN study_database_builds sdb ON sdb.study_id = sfd.study_id
SET sfd.build_id = (
    SELECT id FROM study_database_builds
    WHERE study_id = sfd.study_id
      AND build_status = 'COMPLETED'
    ORDER BY build_end_time ASC
    LIMIT 1
)
WHERE sfd.build_id IS NULL;
```

---

### 2. Update Java Entity
**File**: `StudyFormDataEntity.java`

```java
@Entity
@Table(name = "study_form_data")
public class StudyFormDataEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ... existing fields ...
    
    @Column(name = "build_id")
    private Long buildId;  // ✅ ADD THIS FIELD
    
    @Column(name = "form_data", columnDefinition = "JSON")
    private String formData;
    
    // ... rest of entity ...
}
```

---

### 3. Update Form Save Service
**File**: `FormDataService.java` (or similar)

```java
public StudyFormDataEntity saveFormData(FormDataDto dto) {
    // Get build_id from visit instance
    StudyVisitInstanceEntity visitInstance = visitInstanceRepository
        .findById(dto.getVisitId())
        .orElseThrow(() -> new RuntimeException("Visit not found"));
    
    Long buildId = visitInstance.getBuildId();
    
    if (buildId == null) {
        log.error("Visit instance {} has NULL build_id!", dto.getVisitId());
        // Fallback: get active build
        buildId = getActiveBuildId(dto.getStudyId());
    }
    
    StudyFormDataEntity entity = StudyFormDataEntity.builder()
        .studyId(dto.getStudyId())
        .formId(dto.getFormId())
        .subjectId(dto.getSubjectId())
        .visitId(dto.getVisitId())
        .formData(dto.getFormData())
        .buildId(buildId)  // ✅ SET BUILD ID
        .build();
    
    return studyFormDataRepository.save(entity);
}
```

---

### 4. Update Form Retrieval Service
**File**: `FormDataQueryService.java` (or similar)

```java
public FormDataDto getFormData(Long formDataId) {
    StudyFormDataEntity formData = studyFormDataRepository
        .findById(formDataId)
        .orElseThrow();
    
    // Get form definition for the CORRECT build version
    FormDefinitionEntity formDef = formDefinitionRepository
        .findByIdAndBuildId(formData.getFormId(), formData.getBuildId())
        .orElseThrow(() -> new RuntimeException(
            "Form definition not found for build " + formData.getBuildId()));
    
    // ✅ Now we have the correct form structure for this data
    return mapToDto(formData, formDef);
}
```

---

## ✅ Summary

**Your Question**: Why `build_id` in `visit_forms` but not `study_form_data`?

**Answer**: **You're absolutely right** - it should be in BOTH!

| Table | Reason for build_id |
|-------|-------------------|
| `visit_forms` | Tracks which protocol version assigns forms to visits |
| `study_form_data` | **CRITICAL** - Tracks which form definition version patient filled out |

**Without build_id in study_form_data**:
- ❌ Can't determine which form version patient saw
- ❌ Can't validate data correctly
- ❌ Can't display form correctly
- ❌ Compliance violation (no version traceability)

**Action Required**:
1. ✅ Update migration to add `build_id` to `study_form_data`
2. ✅ Update `StudyFormDataEntity.java`
3. ✅ Update form save/retrieve services
4. ✅ Backfill existing data

**Priority**: **P0 CRITICAL** - Same as original build tracking issue

---

**Thank you for catching this!** This is exactly the kind of critical design review that prevents major data integrity issues.

---

**Document Created**: October 16, 2025  
**Identified By**: User  
**Status**: ✅ **DESIGN FLAW CONFIRMED - FIX REQUIRED**
