# Patient Visit and Form Association - Data Source Analysis

**Date:** October 16, 2025  
**Question:** Are patient scheduled visits and associated forms created using study build information or study design tables?  
**Status:** ✅ ANALYSIS COMPLETE

---

## Executive Summary

### ✅ **Answer: You are using STUDY DESIGN TABLES, not study build information**

**Current Implementation:**
- ❌ **NOT** using `study_database_builds` table
- ✅ **YES** using `visit_definitions` table (study design)
- ✅ **YES** using `visit_forms` table (study design)
- ✅ **YES** using `form_definitions` table (study design)

**Your Concern is VALID:** According to clinical trial best practices, you **SHOULD** be using study build information (the finalized, validated study database configuration) rather than the design tables (which may still be in draft/editable state).

---

## Current Architecture (As-Is)

### 1. Patient Enrollment Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Patient Enrollment Triggered                    │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  PatientEnrollmentService.enrollPatient()                            │
│  - Validates patient, study, site                                    │
│  - Sends EnrollPatientCommand to PatientAggregate                    │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  PatientAggregate                                                    │
│  - Emits PatientEnrolledEvent                                        │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  PatientEnrollmentProjector.on(PatientEnrolledEvent)                │
│  - Detects status change to ACTIVE                                   │
│  - Calls ProtocolVisitInstantiationService                           │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  ProtocolVisitInstantiationService.instantiateProtocolVisits()       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  ❌ NOT CHECKING study_database_builds table                   │  │
│  │  ✅ DIRECTLY QUERIES visit_definitions table                   │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  Creates study_visit_instances records                               │
│  - Uses visit_definitions.id as FK (visit_id column)                │
│  - Calculates visit dates from baseline + timepoint offset          │
└──────────────────────────────────────────────────────────────────────┘
```

### 2. Form Association Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│  User navigates to a visit instance in UI                           │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  VisitController.getFormsForVisitInstance(visitInstanceId)           │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│  VisitFormQueryService.getFormsForVisitInstance()                    │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  1. Get visit instance from study_visit_instances               │  │
│  │  2. Extract visit_id (FK to visit_definitions.id)              │  │
│  │  3. ❌ NOT CHECKING study_database_builds                      │  │
│  │  4. ✅ DIRECTLY QUERIES visit_forms table                       │  │
│  │     WHERE visit_definition_id = visit_id                        │  │
│  │  5. Returns forms ordered by display_order                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Code Evidence

### Evidence 1: ProtocolVisitInstantiationService.java

**File:** `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/visit/service/ProtocolVisitInstantiationService.java`

**Lines 119-139 - getProtocolVisits():**

```java
private List<VisitDefinitionEntity> getProtocolVisits(Long studyId, Long armId) {
    List<VisitDefinitionEntity> protocolVisits = new ArrayList<>();

    if (armId != null) {
        // Get arm-specific visits
        List<VisitDefinitionEntity> armVisits =
                visitDefinitionRepository.findByStudyIdAndArmIdOrderBySequenceNumberAsc(studyId, armId);
        protocolVisits.addAll(armVisits);

        log.debug("Found {} arm-specific visits for armId: {}", armVisits.size(), armId);
    }

    // Get common visits (no arm assignment)
    List<VisitDefinitionEntity> commonVisits =
            visitDefinitionRepository.findByStudyIdAndArmIdIsNullOrderBySequenceNumberAsc(studyId);
    protocolVisits.addAll(commonVisits);

    log.debug("Found {} common visits", commonVisits.size());

    // Sort by timepoint (day offset) to ensure correct chronological order
    protocolVisits.sort(Comparator.comparing(VisitDefinitionEntity::getTimepoint));

    return protocolVisits;
}
```

**⚠️ Issue:** Queries `visit_definitions` table directly using `studyId`, **NOT** checking if a study database build exists or using build information.

### Evidence 2: VisitFormQueryService.java

**File:** `backend/clinprecision-clinops-service/src/main/java/com/clinprecision/clinopsservice/visit/service/VisitFormQueryService.java`

**Lines 66-71 - getFormsForVisitInstance():**

```java
// Step 3: Query visit_forms table for this visit definition
Long visitDefinitionId = visitInstance.getVisitId();
List<VisitFormEntity> visitForms = visitFormRepository
        .findByVisitDefinitionIdOrderByDisplayOrderAsc(visitDefinitionId);

log.info("Found {} form assignments for visit definition {}", visitForms.size(), visitDefinitionId);
```

**⚠️ Issue:** Queries `visit_forms` table directly using `visit_definition_id`, **NOT** checking if forms are from a finalized study build.

### Evidence 3: Database Schema

**File:** `backend/clinprecision-db/ddl/consolidated_schema.sql`

**visit_forms table (lines 998-1020):**

```sql
CREATE TABLE visit_forms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_uuid VARCHAR(255) NULL COMMENT 'UUID linking to StudyDesignAggregate in event store',
    assignment_uuid VARCHAR(255) NULL COMMENT 'Unique UUID for this form assignment from FormAssignedToVisitEvent',
    visit_uuid VARCHAR(255) NULL COMMENT 'UUID reference to VisitDefinition',
    form_uuid VARCHAR(255) NULL COMMENT 'UUID reference to FormDefinition',
    visit_definition_id BIGINT NOT NULL,
    form_definition_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    ...
    FOREIGN KEY (visit_definition_id) REFERENCES visit_definitions(id),
    FOREIGN KEY (form_definition_id) REFERENCES form_definitions(id)
);
```

**⚠️ Observation:** 
- `visit_forms` references `visit_definitions` (design tables)
- No FK to `study_database_builds` table
- No column indicating which build version the form association belongs to

---

## Problem Analysis

### Issue 1: Using Draft/Editable Data for Patient Care

**Current Behavior:**
```
[Study Designer] → Edits visit_definitions → Changes saved
                                                    ↓
[Patient enrolled] → Gets NEW visit schedule (unintended change!)
```

**What Should Happen:**
```
[Study Designer] → Edits visit_definitions → Changes saved to DRAFT
[Study Manager]  → Approves → Triggers Study Database Build
                                                    ↓
[Build Process] → Creates study_database_build record
                → Snapshots visit_definitions → Stored in build config
                → Snapshots visit_forms → Stored in build config
                → Snapshots form_definitions → Stored in build config
                                                    ↓
[Patient enrolled] → Uses FINALIZED build data (stable, validated)
```

### Issue 2: Data Integrity Risk

**Scenario:**
1. Patient A enrolled on Day 1 with Visit Schedule Version 1.0
2. Study designer modifies visit schedule on Day 2
3. Patient B enrolled on Day 3 with Visit Schedule Version 1.1 (different!)
4. **Result:** Two patients in same study have different visit schedules! ❌

**Industry Standard (Medidata Rave, Oracle InForm):**
- All patients enrolled **AFTER** a specific database build use the **SAME** protocol configuration
- Changes to protocol require a new database build (version increment)
- Previous patients can be migrated to new version OR continue on old version (controlled migration)

### Issue 3: Audit Trail Weakness

**Current:** 
- No way to prove which visit schedule version was active when patient was enrolled
- No way to track protocol amendments effectively
- Difficult to answer: "What was the protocol definition when Patient X was enrolled?"

**Should Have:**
- `study_visit_instances.build_id` → FK to `study_database_builds.id`
- `visit_forms.build_id` → FK to `study_database_builds.id`
- Clear audit trail: "Patient enrolled using Build v2.1 dated 2025-10-01"

---

## Recommended Solution

### Approach 1: Add Build Reference (Minimal Change)

#### Database Changes

```sql
-- Add build_id to study_visit_instances
ALTER TABLE study_visit_instances 
ADD COLUMN build_id BIGINT NULL COMMENT 'Study database build version used for this patient',
ADD CONSTRAINT fk_visit_build FOREIGN KEY (build_id) 
    REFERENCES study_database_builds(id) ON DELETE RESTRICT;

-- Add build_id to visit_forms
ALTER TABLE visit_forms 
ADD COLUMN build_id BIGINT NULL COMMENT 'Build version this form association belongs to',
ADD CONSTRAINT fk_visitform_build FOREIGN KEY (build_id) 
    REFERENCES study_database_builds(id) ON DELETE RESTRICT;

-- Create index for performance
CREATE INDEX idx_visit_forms_build ON visit_forms(build_id);
CREATE INDEX idx_visit_instances_build ON study_visit_instances(build_id);
```

#### Code Changes

**ProtocolVisitInstantiationService.java:**

```java
@Transactional
public List<StudyVisitInstanceEntity> instantiateProtocolVisits(
        Long patientId,
        Long studyId,
        Long siteId,
        Long armId,
        LocalDate baselineDate) {

    log.info("Instantiating protocol visits for patient: patientId={}, studyId={}", patientId, studyId);

    // 🆕 STEP 1: Get active/latest study database build
    StudyDatabaseBuildEntity activeBuild = getActiveStudyBuild(studyId);
    
    if (activeBuild == null) {
        throw new IllegalStateException(
            "No active study database build found for studyId: " + studyId + 
            ". Study must be built before enrolling patients.");
    }
    
    log.info("Using study build: id={}, version={}, status={}", 
             activeBuild.getId(), activeBuild.getBuildRequestId(), activeBuild.getBuildStatus());

    // Check if visits already instantiated (idempotency check)
    if (hasProtocolVisitsInstantiated(patientId)) {
        log.warn("Protocol visits already instantiated for patientId: {}. Skipping.", patientId);
        return studyVisitInstanceRepository.findBySubjectIdOrderByVisitDateDesc(patientId);
    }

    // 🆕 STEP 2: Query visit_definitions FILTERED by build
    List<VisitDefinitionEntity> protocolVisits = getProtocolVisitsFromBuild(
        studyId, armId, activeBuild.getId()
    );

    if (protocolVisits.isEmpty()) {
        log.warn("No protocol visits found for studyId: {}, buildId: {}. No visits created.", 
                 studyId, activeBuild.getId());
        return List.of();
    }

    log.info("Found {} protocol visits from build {}", protocolVisits.size(), activeBuild.getId());

    // Create visit instances
    List<StudyVisitInstanceEntity> instances = new ArrayList<>();

    for (VisitDefinitionEntity visitDef : protocolVisits) {
        try {
            StudyVisitInstanceEntity instance = createVisitInstance(
                    patientId,
                    studyId,
                    siteId,
                    visitDef,
                    baselineDate,
                    activeBuild.getId() // 🆕 Pass build ID
            );

            instances.add(studyVisitInstanceRepository.save(instance));

            log.debug("Created visit instance: visitDefId={}, name={}, date={}, buildId={}",
                    visitDef.getId(), visitDef.getName(), instance.getVisitDate(), activeBuild.getId());

        } catch (Exception e) {
            log.error("Error creating visit instance for visitDefId: {}, name: {}",
                    visitDef.getId(), visitDef.getName(), e);
        }
    }

    log.info("Successfully instantiated {} protocol visits for patientId: {} using build {}",
            instances.size(), patientId, activeBuild.getId());

    return instances;
}

/**
 * 🆕 NEW METHOD: Get active study database build
 */
private StudyDatabaseBuildEntity getActiveStudyBuild(Long studyId) {
    // Query for most recent COMPLETED build
    return studyDatabaseBuildRepository
        .findTopByStudyIdAndBuildStatusOrderByBuildEndTimeDesc(
            studyId, 
            StudyDatabaseBuildStatus.COMPLETED
        )
        .orElse(null);
}

/**
 * 🆕 MODIFIED: Get protocol visits from specific build
 */
private List<VisitDefinitionEntity> getProtocolVisitsFromBuild(Long studyId, Long armId, Long buildId) {
    // Option A: If visit_definitions has build_id column
    List<VisitDefinitionEntity> protocolVisits = new ArrayList<>();

    if (armId != null) {
        List<VisitDefinitionEntity> armVisits =
                visitDefinitionRepository.findByStudyIdAndArmIdAndBuildIdOrderBySequenceNumberAsc(
                    studyId, armId, buildId);
        protocolVisits.addAll(armVisits);
    }

    List<VisitDefinitionEntity> commonVisits =
            visitDefinitionRepository.findByStudyIdAndArmIdIsNullAndBuildIdOrderBySequenceNumberAsc(
                studyId, buildId);
    protocolVisits.addAll(commonVisits);

    protocolVisits.sort(Comparator.comparing(VisitDefinitionEntity::getTimepoint));

    return protocolVisits;
}
```

**VisitFormQueryService.java:**

```java
@Transactional(readOnly = true)
public List<VisitFormDto> getFormsForVisitInstance(Long visitInstanceId) {
    log.info("Fetching forms for visit instance: {}", visitInstanceId);

    // Get visit instance
    StudyVisitInstanceEntity visitInstance = visitInstanceRepository.findById(visitInstanceId)
            .orElseThrow(() -> new RuntimeException("Visit instance not found: " + visitInstanceId));

    log.info("Found visit instance: visitId={}, subjectId={}, build_id={}", 
             visitInstance.getId(), visitInstance.getSubjectId(), visitInstance.getBuildId());

    if (visitInstance.getVisitId() == null) {
        log.warn("Visit instance {} is an unscheduled visit. No protocol forms assigned.", visitInstanceId);
        return new ArrayList<>();
    }

    // 🆕 CRITICAL: Query forms using BOTH visit_definition_id AND build_id
    Long visitDefinitionId = visitInstance.getVisitId();
    Long buildId = visitInstance.getBuildId();
    
    if (buildId == null) {
        // Fallback for legacy data (enrolled before build tracking implemented)
        log.warn("Visit instance {} has no build_id. Using latest visit_forms (legacy mode).", visitInstanceId);
        return getLegacyForms(visitDefinitionId, visitInstance);
    }

    // Query visit_forms filtered by build
    List<VisitFormEntity> visitForms = visitFormRepository
            .findByVisitDefinitionIdAndBuildIdOrderByDisplayOrderAsc(visitDefinitionId, buildId);

    log.info("Found {} form assignments for visit definition {} from build {}", 
             visitForms.size(), visitDefinitionId, buildId);

    return visitForms.stream()
            .map(vf -> mapToDto(vf, visitInstance))
            .collect(Collectors.toList());
}
```

### Approach 2: Snapshot Configuration in Build (Recommended)

**Better Approach:** When study database is built, snapshot the entire protocol configuration into `study_database_build_config` table as JSON.

**Advantages:**
- ✅ Complete isolation between builds
- ✅ No need to modify existing tables
- ✅ Easy to compare builds (diff JSON configurations)
- ✅ Can reconstruct exact protocol state from any build
- ✅ Supports protocol amendments cleanly

**Database:**

```sql
CREATE TABLE study_database_build_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    build_id BIGINT NOT NULL,
    config_type ENUM('VISITS', 'FORMS', 'FORM_BINDINGS', 'VALIDATION_RULES') NOT NULL,
    config_data LONGTEXT NOT NULL COMMENT 'JSON snapshot of configuration',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (build_id) REFERENCES study_database_builds(id) ON DELETE CASCADE,
    UNIQUE KEY uk_build_config (build_id, config_type)
);
```

**Build Process:**

```java
// During StudyDatabaseBuildWorkerService.execute()

// Snapshot visit definitions
List<VisitDefinitionEntity> visits = visitDefinitionRepository.findByStudyId(studyId);
String visitsJson = objectMapper.writeValueAsString(visits);
saveBuildConfig(buildId, "VISITS", visitsJson);

// Snapshot form bindings
List<VisitFormEntity> bindings = visitFormRepository.findByStudyId(studyId);
String bindingsJson = objectMapper.writeValueAsString(bindings);
saveBuildConfig(buildId, "FORM_BINDINGS", bindingsJson);

// Snapshot form definitions
List<FormDefinitionEntity> forms = formDefinitionRepository.findByStudyId(studyId);
String formsJson = objectMapper.writeValueAsString(forms);
saveBuildConfig(buildId, "FORMS", formsJson);
```

**Runtime:**

```java
// When instantiating visits
String visitsConfig = studyDatabaseBuildConfigRepository
    .findByBuildIdAndConfigType(buildId, "VISITS")
    .getConfigData();

List<VisitDefinitionSnapshot> visits = objectMapper.readValue(
    visitsConfig, 
    new TypeReference<List<VisitDefinitionSnapshot>>() {}
);

// Create visit instances from snapshot
for (VisitDefinitionSnapshot visitSnapshot : visits) {
    createVisitInstanceFromSnapshot(patientId, visitSnapshot, buildId);
}
```

---

## Impact Analysis

### What Needs to Change

#### High Priority (P0):
1. ✅ Add `build_id` column to `study_visit_instances` table
2. ✅ Add `build_id` column to `visit_forms` table (OR use snapshot approach)
3. ✅ Modify `ProtocolVisitInstantiationService` to check for active build
4. ✅ Modify `VisitFormQueryService` to filter by build
5. ✅ Add `StudyDatabaseBuildRepository.findActiveByStudyId()` method
6. ✅ Add validation: Prevent patient enrollment if no completed build exists

#### Medium Priority (P1):
7. ✅ Create `study_database_build_config` table for snapshots
8. ✅ Modify `StudyDatabaseBuildWorkerService` to snapshot configurations
9. ✅ Add UI indicator showing which build version is active
10. ✅ Add API endpoint: `GET /api/studies/{studyId}/active-build`

#### Low Priority (P2):
11. ✅ Add data migration for existing patients (assign to earliest build)
12. ✅ Add audit report: "Protocol Configuration at Patient Enrollment"
13. ✅ Add UI: "View Protocol Changes Between Builds"
14. ✅ Add validation: Warn if protocol changed since last enrollment

---

## Migration Plan

### Phase 1: Add Build Tracking (Immediate - 2 hours)

```sql
-- 1. Add columns
ALTER TABLE study_visit_instances ADD COLUMN build_id BIGINT NULL;
ALTER TABLE visit_forms ADD COLUMN build_id BIGINT NULL;

-- 2. Backfill existing data (assign to first build)
UPDATE study_visit_instances svi
JOIN (
    SELECT study_id, MIN(id) as first_build_id
    FROM study_database_builds
    WHERE build_status = 'COMPLETED'
    GROUP BY study_id
) builds ON builds.study_id = svi.study_id
SET svi.build_id = builds.first_build_id
WHERE svi.build_id IS NULL;

UPDATE visit_forms vf
JOIN visit_definitions vd ON vd.id = vf.visit_definition_id
JOIN (
    SELECT study_id, MIN(id) as first_build_id
    FROM study_database_builds
    WHERE build_status = 'COMPLETED'
    GROUP BY study_id
) builds ON builds.study_id = vd.study_id
SET vf.build_id = builds.first_build_id
WHERE vf.build_id IS NULL;

-- 3. Add foreign keys
ALTER TABLE study_visit_instances 
ADD CONSTRAINT fk_visit_build FOREIGN KEY (build_id) 
    REFERENCES study_database_builds(id) ON DELETE RESTRICT;

ALTER TABLE visit_forms 
ADD CONSTRAINT fk_visitform_build FOREIGN KEY (build_id) 
    REFERENCES study_database_builds(id) ON DELETE RESTRICT;

-- 4. Add indexes
CREATE INDEX idx_visit_forms_build ON visit_forms(build_id);
CREATE INDEX idx_visit_instances_build ON study_visit_instances(build_id);
```

### Phase 2: Update Java Code (3-4 hours)

1. Update `ProtocolVisitInstantiationService`
2. Update `VisitFormQueryService`
3. Add `StudyDatabaseBuildRepository` methods
4. Update DTOs to include `buildId`
5. Add validation in `PatientEnrollmentService`
6. Add unit tests

### Phase 3: Create Build Snapshots (Future Enhancement - 8 hours)

1. Create `study_database_build_config` table
2. Modify `StudyDatabaseBuildWorkerService`
3. Create snapshot/restore services
4. Add UI for build comparison
5. Add API endpoints

---

## Validation Checklist

After implementing the fix, verify:

- [ ] ✅ Patient enrollment fails if no completed build exists
- [ ] ✅ All visit instances have valid `build_id` populated
- [ ] ✅ Forms displayed for visit match the build version
- [ ] ✅ Two patients enrolled at different times with different builds see different forms (if protocol changed)
- [ ] ✅ Audit trail shows which build was used for each patient
- [ ] ✅ Legacy patients (enrolled before fix) have `build_id` backfilled
- [ ] ✅ UI shows active build version on enrollment page
- [ ] ✅ Cannot modify protocol after build without creating new build

---

## Comparison: Current vs Recommended

| Aspect | Current (Wrong) | Recommended (Correct) |
|--------|----------------|----------------------|
| Data Source | `visit_definitions` directly | `study_database_builds` config |
| Protocol Stability | ❌ Changes affect existing patients | ✅ Locked per build version |
| Audit Trail | ❌ Cannot prove what was active | ✅ Complete version history |
| Patient Consistency | ❌ Different schedules possible | ✅ Same schedule per build |
| Amendment Support | ❌ Manual tracking | ✅ Automatic versioning |
| Compliance | ❌ FDA/MHRA concerns | ✅ 21 CFR Part 11 compliant |
| Industry Standard | ❌ Non-standard | ✅ Matches Medidata/Oracle |

---

## Conclusion

### Summary

**You are CORRECT to be concerned!** 

The current implementation uses study design tables (`visit_definitions`, `visit_forms`) directly, which means:
- ❌ Patients get the **current** protocol state, not the **validated** build state
- ❌ Protocol changes affect existing patients (unintended consequences)
- ❌ No way to prove which protocol version was active at enrollment
- ❌ Violates clinical trial best practices

**Recommended Action: HIGH PRIORITY FIX NEEDED**

1. **Immediate** (Today): Add `build_id` columns and enforce build validation
2. **Short-term** (This week): Update Java services to use build references
3. **Long-term** (Next sprint): Implement full snapshot/versioning system

This is a **data integrity and compliance issue** that should be addressed before production deployment.

---

## Related Files

**Database:**
- `backend/clinprecision-db/ddl/consolidated_schema.sql`
- Tables: `study_visit_instances`, `visit_forms`, `visit_definitions`, `study_database_builds`

**Java Services:**
- `ProtocolVisitInstantiationService.java` - **NEEDS MODIFICATION** ⚠️
- `VisitFormQueryService.java` - **NEEDS MODIFICATION** ⚠️
- `PatientEnrollmentProjector.java` - Calls instantiation service
- `StudyDatabaseBuildWorkerService.java` - Should snapshot configs

**Controllers:**
- `VisitController.java` - Returns forms for visit
- `StudyDatabaseBuildController.java` - Triggers builds

---

**Status:** ⚠️ **CRITICAL ISSUE IDENTIFIED - FIX REQUIRED**  
**Priority:** **P0 - High Priority**  
**Estimated Effort:** 8-12 hours (including testing)  
**Risk if not fixed:** Data integrity issues, compliance violations, patient safety concerns
