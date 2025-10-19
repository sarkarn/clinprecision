# EDC Blinding Architecture Decision
**Date**: October 18, 2025  
**Status**: ✅ APPROVED - Regulatory Compliance Decision  
**Priority**: 🔴 CRITICAL - Blocks Subject Edit Feature

---

## Executive Summary

**DECISION**: ClinPrecision EDC will **NOT** store patient-to-treatment-arm assignments in the database. Treatment arm information during study design is **retained**, but individual patient arm assignments are **removed** to ensure regulatory compliance with clinical trial blinding requirements.

**Key Principle**: EDC systems should maintain blinding integrity. Randomization and treatment assignment are handled by separate IWRS/RTSM systems.

---

## Table of Contents
1. [Context & Problem](#context--problem)
2. [Regulatory Requirements](#regulatory-requirements)
3. [Architecture Decision](#architecture-decision)
4. [What We Keep vs. Remove](#what-we-keep-vs-remove)
5. [System Separation of Concerns](#system-separation-of-concerns)
6. [Implementation Plan](#implementation-plan)
7. [Future Integration Points](#future-integration-points)

---

## Context & Problem

### Original Design Flaw
The initial implementation added `arm_id`, `arm_assigned_at`, and `arm_assigned_by` columns to the `patient_enrollments` table. This created a **direct database link** between patient identity and treatment assignment, which:

❌ **Violates blinding** - Any database query can expose arm assignments  
❌ **Creates security risk** - Unauthorized access to DB reveals unblinded data  
❌ **Breaks regulatory compliance** - FDA 21 CFR Part 11, ICH E6(R2) require blinding maintenance  
❌ **Enables accidental unblinding** - Developers, DBAs, analysts can see arm assignments  
❌ **Undermines study integrity** - Protocol violations can invalidate entire trials  

### Why This Matters
- **FDA Audits**: Inspectors check how blinding is maintained in electronic systems
- **GCP Compliance**: ICH E6(R2) requires systems to preserve blinding
- **Study Validity**: Unblinding can introduce bias and invalidate results
- **Legal Liability**: Protocol violations can lead to study termination or rejection

---

## Regulatory Requirements

### FDA 21 CFR Part 11 (Electronic Records)
```
§11.10 Controls for closed systems
Systems must:
- Limit system access to authorized individuals
- Use secure, computer-generated, time-stamped audit trails
- Use authority checks to ensure authorized users only can access functions
- Prevent unauthorized modification of blinded data
```

### ICH E6(R2) Good Clinical Practice
```
Section 5.5.3 Blinding/Masking
- Blinding/masking procedures should be documented
- Systems should protect against accidental or premature unblinding
- Access to randomization information should be restricted
- Emergency unblinding procedures must be documented and audited
```

### Study Blinding Levels (from `studies` table)
```sql
blinding_type ENUM('open_label', 'single_blind', 'double_blind', 'triple_blind')
```

| Blinding Level | Who is Blinded | EDC Arm Access |
|---------------|---------------|----------------|
| **Open Label** | No one | ✅ Can show arm (if needed) |
| **Single-Blind** | Patient only | ⚠️ Investigator can see (controlled access) |
| **Double-Blind** | Patient + Investigator | ❌ NO ACCESS - Separate IWRS only |
| **Triple-Blind** | Patient + Investigator + Analyst | ❌ NO ACCESS - Separate IWRS only |

**DECISION**: For regulatory safety and simplicity, **EDC will NOT store arm assignments regardless of blinding level**.

---

## Architecture Decision

### Core Principle
> **EDC systems capture clinical data. IWRS/RTSM systems manage randomization and supply.**

### What This Means
```
┌─────────────────────────────────────────────────────────────┐
│                    Clinical Trial Ecosystem                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐         ┌──────────────────┐            │
│  │  ClinPrecision │         │   IWRS/RTSM      │            │
│  │     (EDC)      │         │   System         │            │
│  ├────────────────┤         ├──────────────────┤            │
│  │ • Patient Data │         │ • Randomization  │            │
│  │ • Visit Forms  │◄────────┤ • Arm Assignment │            │
│  │ • CRF Entry    │  API    │ • Drug Supply    │            │
│  │ • Adverse Evt  │         │ • Unblinding Log │            │
│  │ • Lab Results  │         │ • Emergency Code │            │
│  └────────────────┘         └──────────────────┘            │
│         ▲                            │                       │
│         │                            │                       │
│         │      No Arm Storage        │  Stores Assignment    │
│         │      In Database           │  Securely             │
│         │                            │                       │
│  ┌──────┴────────┐          ┌───────▼──────┐               │
│  │  Investigator │          │  Pharmacist   │               │
│  │  (Blinded)    │          │  (Unblinded)  │               │
│  └───────────────┘          └───────────────┘               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Separation of Concerns

| Concern | System | Purpose |
|---------|--------|---------|
| **Study Design** | EDC (ClinPrecision) | Define arms during protocol design |
| **Randomization** | IWRS/RTSM | Assign patients to arms using randomization algorithm |
| **Drug Supply** | IWRS/RTSM | Manage investigational product inventory |
| **Unblinding** | IWRS/RTSM | Emergency and scheduled unblinding with audit |
| **Data Capture** | EDC (ClinPrecision) | Collect clinical data (blinded to arm) |
| **Safety Reporting** | Safety DB | Track AEs, may need unblinded arm info |

---

## What We Keep vs. Remove

### ✅ KEEP: Study Design Information

**Table**: `study_arms`  
**Purpose**: Define treatment arms during protocol development  
**Rationale**: Investigators NEED to know what arms exist for protocol understanding, visit schedules, and consent discussions. They just can't know which patients are in which arms.

```sql
-- KEPT: study_arms table
CREATE TABLE study_arms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,              -- e.g., "Drug A 50mg"
    description TEXT,                         -- e.g., "Active treatment arm"
    type ENUM('treatment', 'control', ...),   -- Arm classification
    sequence_number INT NOT NULL,             -- Display order
    target_enrollment INT,                    -- How many subjects planned
    randomization_ratio DECIMAL(5,2),         -- Allocation ratio
    planned_subjects INT,                     -- Legacy field
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id)
);
```

**Why Keep This?**
- ✅ Needed for protocol design and IRB submission
- ✅ Required for visit schedule creation (visits may vary by arm)
- ✅ Essential for informed consent (patients told about possible arms)
- ✅ Used for enrollment capacity planning
- ✅ Displayed in protocol documents and study reports
- ✅ No patient-identifiable information linked

**What Can Be Shown in UI?**
- ✅ List of arms in study design interface
- ✅ Arm details during protocol creation
- ✅ Visit schedules per arm
- ✅ Forms per arm (if arm-specific)
- ✅ Enrollment targets per arm (aggregate only)

---

### ❌ REMOVE: Patient-to-Arm Assignment

**Table**: `patient_enrollments` (columns to remove)  
**Purpose**: Originally tried to track which patient is in which arm  
**Problem**: Creates unblindable database link

```sql
-- REMOVED: These columns violate blinding
ALTER TABLE patient_enrollments 
    DROP COLUMN arm_id,              -- ❌ Direct link to treatment arm
    DROP COLUMN arm_assigned_at,      -- ❌ When patient was randomized
    DROP COLUMN arm_assigned_by;      -- ❌ Who performed randomization
```

**Why Remove This?**
- ❌ Creates queryable patient-to-arm link in database
- ❌ Accessible to developers, DBAs, support staff (unintentional unblinding)
- ❌ Audit logs show arm changes (exposes assignments)
- ❌ Backups contain unblinded data
- ❌ Reports could accidentally join patient + arm data
- ❌ No role-based access control at database level

**What Happens to Patient Randomization?**
- Randomization performed in **external IWRS/RTSM system**
- Pharmacist accesses IWRS to dispense correct medication
- EDC stores only: enrollment date, site, study (no arm)
- If arm needed for analysis: Retrieved from IWRS during database lock

---

### ❌ REMOVE: API Endpoints Exposing Arm Data

**Service**: `PatientEnrollmentService.java`  
**Controller**: `PatientEnrollmentController.java`  
**DTO**: `PatientDto.java`

```java
// REMOVED: Arm lookup in service layer
// OLD CODE (violates blinding):
if (enrollment.getTreatmentArmId() != null) {
    studyArmRepository.findById(enrollment.getTreatmentArmId()).ifPresent(arm -> {
        builder.treatmentArm(arm.getId().toString());      // ❌ Exposes arm
        builder.treatmentArmName(arm.getName());           // ❌ Exposes arm name
    });
}

// NEW CODE (compliant):
// No arm lookup at all - API never returns patient arm data
```

**Why Remove This?**
- ❌ Any API consumer (frontend, reports, integrations) can see arm
- ❌ No role-based access control checks
- ❌ API logs contain unblinded data
- ❌ Frontend caches patient+arm in browser
- ❌ Accidental display in UI components

---

### ❌ REMOVE: Frontend Arm Display

**Components**: `SubjectList.jsx`, `SubjectEdit.jsx`  
**Service**: `SubjectService.js`

```javascript
// REMOVED: Treatment arm field in subject edit form
<div>
    <label>Treatment Arm</label>
    <input 
        value={subject.treatmentArm}    // ❌ Shows arm name
        disabled                         // ❌ Even if disabled, visible
    />
</div>

// NEW: Either hide field completely OR show:
<div>
    <label>Treatment Arm</label>
    <input value="BLINDED" disabled className="text-gray-400" />
</div>
```

**Why Remove This?**
- ❌ Visible in browser (investigator sees arm)
- ❌ Stored in browser cache/local storage
- ❌ Screen sharing/screenshots expose arm
- ❌ Browser dev tools show API responses with arm data
- ❌ Audit trail screenshots contain unblinded info

---

## System Separation of Concerns

### EDC (ClinPrecision) Responsibilities
```
✅ Study Protocol Design
   - Define study arms (name, type, description)
   - Create visit schedules per arm
   - Design arm-specific forms

✅ Patient Enrollment
   - Record enrollment date
   - Track site enrollment
   - Verify eligibility criteria
   - Store demographics (BLINDED to arm)

✅ Data Capture
   - CRF data entry
   - Adverse event reporting
   - Lab result recording
   - Query management

✅ Study Monitoring
   - Enrollment progress by site
   - Data completion rates
   - Query resolution tracking

❌ NOT RESPONSIBLE FOR:
   - Randomization algorithm execution
   - Treatment arm assignment
   - Drug supply management
   - Unblinding (except viewing external IWRS data if authorized)
```

### IWRS/RTSM System Responsibilities
```
✅ Randomization
   - Execute randomization algorithm
   - Balance across sites/strata
   - Generate randomization list
   - Assign patient to arm

✅ Treatment Assignment
   - Store patient-to-arm mapping
   - Provide treatment code to pharmacist
   - Manage randomization envelopes

✅ Drug Supply Management
   - Track investigational product inventory
   - Reserve medication for patient
   - Reorder supplies when low

✅ Unblinding
   - Emergency unblinding with reason
   - Scheduled unblinding at study end
   - Generate unblinding reports
   - Audit all unblinding events
```

### Integration Between Systems

**Scenario 1: Patient Enrollment & Randomization**
```
1. Investigator enrolls patient in EDC
   POST /clinops-ws/api/v1/patients/enroll
   Body: { firstName, lastName, dateOfBirth, studyId, siteId }
   
2. EDC returns enrollment confirmation
   Response: { patientId: 12345, enrollmentDate: "2025-10-18" }
   
3. Investigator calls IWRS (phone/web)
   "I need to randomize patient 12345"
   
4. IWRS performs randomization
   - Checks eligibility
   - Applies stratification
   - Assigns to arm (stored in IWRS only)
   - Returns randomization number: "R-001234"
   
5. Pharmacist dispenses medication
   - Logs into IWRS
   - Enters randomization number
   - IWRS shows: "Dispense Kit 456 (Drug A 50mg)"
   - Pharmacist gives kit to site staff
   
6. Patient receives treatment (BLINDED)
   - Patient receives kit labeled "Study Drug"
   - Investigator does NOT know if Drug A or Placebo
   - EDC records "Study drug administered" (no arm)
```

**Scenario 2: Emergency Unblinding**
```
1. Serious Adverse Event occurs
   - Investigator enters SAE in EDC (blinded)
   
2. Medical decision requires knowing arm
   - Investigator calls IWRS unblinding hotline
   - Provides patient ID and medical justification
   
3. IWRS logs unblinding event
   - Records: Who, When, Patient, Reason
   - Reveals: "Patient in Drug A 50mg arm"
   - Sends notification to sponsor
   
4. EDC remains blinded
   - SAE report does NOT update with arm info
   - Only unblinding coordinator sees IWRS log
```

**Scenario 3: Database Lock for Analysis**
```
1. Study completes, all patients finish
   
2. Data manager locks EDC database
   - All queries resolved
   - All data cleaned and verified
   
3. Statistician requests unblinded dataset
   - Exports patient data from EDC (without arms)
   - Exports arm assignments from IWRS
   
4. Datasets merged in secure analysis environment
   - EDC: patient_id, demographics, outcomes
   - IWRS: patient_id, arm_id
   - MERGED: patient_id, arm_id, outcomes
   
5. Analysis performed with arm as factor
```

---

## Implementation Plan

### Phase 1: Database Schema Cleanup ⚠️ CRITICAL
**Priority**: 🔴 IMMEDIATE - Regulatory Compliance

**Actions**:
1. Create rollback migration: `20251018_remove_treatment_arm_from_patient_enrollments.sql`
2. Drop foreign key constraint to `study_arms`
3. Drop indexes on arm columns
4. Drop columns: `arm_id`, `arm_assigned_at`, `arm_assigned_by`
5. Update audit table to remove arm change triggers (if any)

**Migration Script**:
```sql
-- ROLLBACK: Remove patient-to-arm assignment for blinding compliance
-- This ensures EDC does not store unblinded treatment assignments

-- Drop indexes
DROP INDEX IF EXISTS idx_patient_enrollments_arm_id ON patient_enrollments;
DROP INDEX IF EXISTS idx_patient_enrollments_study_arm ON patient_enrollments;
DROP INDEX IF EXISTS idx_patient_enrollments_site_arm ON patient_enrollments;

-- Drop foreign key constraint
ALTER TABLE patient_enrollments 
DROP FOREIGN KEY IF EXISTS fk_patient_enrollment_arm;

-- Drop columns
ALTER TABLE patient_enrollments 
DROP COLUMN IF EXISTS arm_id,
DROP COLUMN IF EXISTS arm_assigned_at,
DROP COLUMN IF EXISTS arm_assigned_by;

-- Add comment documenting why these columns don't exist
ALTER TABLE patient_enrollments 
COMMENT = 'Patient enrollments - Blinding compliant (no arm assignments stored in EDC)';
```

**Status**: ⏳ READY TO EXECUTE

---

### Phase 2: Backend Code Cleanup
**Priority**: 🔴 HIGH - Must match database schema

**Files to Modify**:

#### 1. `PatientEnrollmentEntity.java`
```java
// REMOVE these fields:
@Column(name = "arm_id")
private Long treatmentArmId;

@Column(name = "arm_assigned_at")
private LocalDateTime armAssignedAt;

@Column(name = "arm_assigned_by")
private String armAssignedBy;

// REMOVE getters/setters
```

#### 2. `PatientEnrollmentService.java`
```java
// REMOVE arm lookup logic:
// OLD CODE (lines 372-376):
if (enrollment.getTreatmentArmId() != null) {
    studyArmRepository.findById(enrollment.getTreatmentArmId()).ifPresent(arm -> {
        builder.treatmentArm(arm.getId().toString());
        builder.treatmentArmName(arm.getName());
    });
}
// DELETE THIS ENTIRE BLOCK
```

#### 3. `PatientDto.java`
```java
// REMOVE these fields:
private String treatmentArm;
private String treatmentArmName;

// REMOVE from builder
```

#### 4. Update Command/Event Classes (if any)
- Search for `armId`, `treatmentArm` in event sourcing code
- Remove from command DTOs
- Remove from event payloads

**Status**: ⏳ READY TO IMPLEMENT

---

### Phase 3: Frontend Cleanup
**Priority**: 🔴 HIGH - Remove arm display from UI

**Files to Modify**:

#### 1. `SubjectService.js`
```javascript
// REMOVE these field mappings:
armId: patient.treatmentArm,
armName: patient.treatmentArmName

// UPDATE updatePatient() to not send arm fields
```

#### 2. `SubjectList.jsx`
```jsx
// REMOVE arm column from patient grid:
{
    Header: 'Treatment Arm',
    accessor: 'treatmentArm',     // ❌ DELETE THIS COLUMN
}

// OR show "BLINDED" for all patients:
{
    Header: 'Treatment Arm',
    accessor: () => 'BLINDED',
    Cell: ({ value }) => (
        <span className="text-gray-400 italic">{value}</span>
    )
}
```

#### 3. `SubjectEdit.jsx`
```jsx
// OPTION 1: Remove arm field completely
// Delete the entire treatment arm form field

// OPTION 2: Show "BLINDED" placeholder
<div>
    <label className="block text-sm font-medium text-gray-700">
        Treatment Arm
    </label>
    <input
        type="text"
        value="BLINDED"
        disabled
        className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-400"
    />
    <p className="mt-1 text-sm text-gray-500">
        Treatment assignments managed by external IWRS system
    </p>
</div>
```

#### 4. `SubjectEnrollment.jsx`
```jsx
// KEEP this - enrollment form shows available arms
// Investigator needs to know what arms exist for patient discussion
// But they don't see which arm the patient will be assigned to

<select name="armId" ...>
    <option value="">Select an arm</option>
    {studyArms.map(arm => (
        <option key={arm.id} value={arm.id}>
            {arm.name}
        </option>
    ))}
</select>

// ⚠️ CLARIFICATION: This dropdown might need removal too
// Need to check: Is this for IWRS integration or EDC enrollment?
// If for patient enrollment: REMOVE (randomization in IWRS)
// If for study setup: KEEP (protocol design)
```

**Status**: ⏳ READY TO IMPLEMENT

---

### Phase 4: Documentation Updates
**Priority**: 🟡 MEDIUM - Update all implementation docs

**Documents to Update**:
1. ~~`TREATMENT_ARM_AND_SITE_IMPLEMENTATION.md`~~ - Mark as deprecated
2. ~~`TREATMENT_ARM_QUICK_REFERENCE.md`~~ - Mark as deprecated
3. ~~`TREATMENT_ARM_IMPLEMENTATION_SUMMARY.md`~~ - Mark as deprecated
4. ~~`SUBJECT_EDIT_COMPLETE_IMPLEMENTATION.md`~~ - Update to remove arm sections
5. `DATABASE_SCHEMA_README.md` - Document why patient_enrollments has no arm_id
6. Create: `IWRS_INTEGRATION_PLACEHOLDER.md` - Future integration guide

**Status**: ⏳ READY TO EXECUTE

---

### Phase 5: Testing Plan
**Priority**: 🟡 MEDIUM - After implementation

**Test Cases**:
1. ✅ Database Migration
   - Run rollback migration successfully
   - Verify columns dropped
   - Verify indexes removed
   - Verify foreign key gone
   
2. ✅ Backend Compilation
   - Build project: `mvn clean install`
   - No compilation errors
   - No references to removed fields
   
3. ✅ API Testing
   - GET `/api/v1/patients/{id}` - No arm fields in response
   - PUT `/api/v1/patients/{id}` - Cannot update arm
   - POST `/api/v1/patients/enroll` - No arm assignment
   
4. ✅ Frontend Display
   - Subject list: No arm column OR shows "BLINDED"
   - Subject edit: No arm field OR shows "BLINDED"
   - Subject enrollment: [TBD based on IWRS integration]
   
5. ✅ Study Design Unaffected
   - Can still create study arms
   - Can still edit arm details
   - Can still view arm-specific visit schedules
   - Visit schedules per arm still work

**Status**: ⏳ PENDING IMPLEMENTATION

---

## Future Integration Points

### When IWRS Integration Is Needed

**Scenario 1: View Randomization Status**
If sponsor requires seeing randomization status in EDC:
```
┌─────────────────────────────────────────┐
│ Patient: John Doe                       │
│ Enrollment Date: 2025-10-18             │
│                                          │
│ Randomization Status:                   │
│ ✅ Randomized on 2025-10-18 14:30       │
│ 📦 Randomization #: R-001234            │
│ 🔒 Treatment Arm: BLINDED               │
│                                          │
│ [View in IWRS] (opens external system)  │
└─────────────────────────────────────────┘
```

**Implementation**:
- EDC calls IWRS API: `GET /iwrs/api/randomization-status/{patientId}`
- IWRS returns: `{ randomized: true, randomizationNumber: "R-001234", armName: null }`
- EDC shows: "Randomized" but NOT arm name

---

**Scenario 2: Unblinding Coordinator Dashboard**
If authorized users need to see unblinded data:
```
Role: Unblinding Coordinator
Permission: VIEW_UNBLINDED_DATA

┌─────────────────────────────────────────────────────────┐
│ Unblinded Patient List (RESTRICTED ACCESS)             │
├─────────────────────────────────────────────────────────┤
│ Patient ID │ Name       │ Site    │ Arm                │
│ 001        │ John Doe   │ Site 1  │ Drug A 50mg        │
│ 002        │ Jane Smith │ Site 1  │ Placebo            │
│ 003        │ Bob Jones  │ Site 2  │ Drug A 50mg        │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:
- Check user role: `if (user.hasPermission("VIEW_UNBLINDED_DATA"))`
- Call IWRS API: `GET /iwrs/api/patient-arms?studyId={studyId}`
- Show data ONLY to authorized users
- Log all access to audit trail

---

**Scenario 3: Database Lock Export**
When study completes and data needs analysis:
```
┌──────────────────────────────────────────┐
│ Database Lock Wizard                     │
├──────────────────────────────────────────┤
│ Step 1: ✅ Lock EDC Database             │
│ Step 2: ✅ Export Clinical Data          │
│ Step 3: ⏳ Export Randomization Data     │
│                                           │
│ [Connect to IWRS] button                 │
│                                           │
│ IWRS Integration:                        │
│ 📡 Connecting to IWRS...                 │
│ ✅ Retrieved 150 patient assignments     │
│ 💾 Exported to: randomization_data.csv   │
│                                           │
│ Step 4: ⏳ Merge Datasets                │
└──────────────────────────────────────────┘
```

**Implementation**:
- EDC exports: `patient_clinical_data.csv` (no arms)
- Call IWRS: `GET /iwrs/api/export-assignments?studyId={id}`
- IWRS returns: `patient_arm_assignments.csv`
- Merge in SAS/R: `MERGE clinical BY patientId WITH arms BY patientId`

---

## Summary

### ✅ Approved Architecture

**EDC System (ClinPrecision)**:
- ✅ Stores study arm definitions (protocol design)
- ✅ Creates arm-specific visit schedules
- ✅ Captures clinical data (blinded to arm)
- ❌ Does NOT store patient-to-arm assignments
- ❌ Does NOT display treatment arm in patient records
- ❌ Does NOT perform randomization

**External IWRS System**:
- ✅ Performs randomization
- ✅ Stores patient-to-arm assignments
- ✅ Manages drug supply
- ✅ Handles emergency unblinding
- ✅ Provides unblinded reports when authorized

### 🎯 Implementation Priority
1. 🔴 **Database migration** (remove arm columns) - CRITICAL
2. 🔴 **Backend cleanup** (remove entity fields, service logic) - HIGH  
3. 🔴 **Frontend cleanup** (remove arm display) - HIGH
4. 🟡 **Documentation** (update/deprecate old docs) - MEDIUM
5. 🟢 **Testing** (verify blinding maintained) - AFTER IMPLEMENTATION

### 📋 Next Steps
See **Implementation Plan** section for detailed execution steps.

---

**Document Owner**: Development Team  
**Regulatory Review**: Required before production deployment  
**Last Updated**: October 18, 2025  
**Related Documents**:
- `DATABASE_SCHEMA_README.md` - Table structures
- `AUDIT_TRAIL_DESIGN_EXPLANATION.md` - Audit pattern
- [Future] `IWRS_INTEGRATION_GUIDE.md` - External system integration

---

## Appendix: Study Design vs. Patient Data

### Key Distinction

**Study Design (KEEP)**:
```
"This study has 3 arms: Drug A, Drug B, Placebo"
↑ Protocol information - needed for study setup
```

**Patient Assignment (REMOVE)**:
```
"Patient John Doe is in Drug A arm"
↑ Unblinded information - violates blinding
```

### Why Study Arms Table Stays

The `study_arms` table is **protocol metadata**, not **patient data**:

```sql
-- study_arms: Protocol Design (KEPT)
| id | study_id | name          | type      | planned_subjects |
|----|----------|---------------|-----------|------------------|
| 1  | 101      | Drug A 50mg   | TREATMENT | 50               |
| 2  | 101      | Drug A 100mg  | TREATMENT | 50               |
| 3  | 101      | Placebo       | PLACEBO   | 50               |

-- This is like saying "My house has 3 bedrooms"
-- Doesn't tell you who sleeps in which bedroom
```

```sql
-- patient_enrollments: Patient Data (ARM COLUMNS REMOVED)
| id | study_id | first_name | last_name | enrollment_date | arm_id |
|----|----------|------------|-----------|-----------------|--------|
| 1  | 101      | John       | Doe       | 2025-10-18      | 1      | ❌ REMOVED
| 2  | 101      | Jane       | Smith     | 2025-10-18      | 3      | ❌ REMOVED

-- This WAS like saying "John sleeps in bedroom 1 (Drug A)"
-- NOW: Only says "John lives in the house" (enrolled in study)
```

### Use Cases for study_arms Table

✅ **Protocol Writing**:
"This study compares Drug A 50mg vs. Drug A 100mg vs. Placebo..."

✅ **IRB Submission**:
"Patients will be randomized to one of three arms..."

✅ **Visit Schedule Design**:
- Arm 1: Visits at Week 0, 2, 4, 8, 12
- Arm 2: Visits at Week 0, 4, 8, 12
- Arm 3: Visits at Week 0, 4, 12

✅ **Informed Consent**:
"You may receive Drug A 50mg, Drug A 100mg, or Placebo..."

✅ **Enrollment Planning**:
"We need 50 subjects per arm = 150 total enrollment"

❌ **NOT for Patient Records**:
~~"Patient 001 is in Arm 1 (Drug A 50mg)"~~ ← This is unblinding!

---

## Regulatory Citation Summary

| Regulation | Requirement | How We Comply |
|------------|-------------|---------------|
| FDA 21 CFR Part 11 §11.10(d) | Limit system access to authorized individuals | EDC has NO arm data to restrict access to |
| FDA 21 CFR Part 11 §11.10(g) | Authority checks for function access | No unblinding function exists in EDC |
| ICH E6(R2) 5.5.3 | Protect against accidental unblinding | EDC database physically lacks arm assignments |
| ICH E6(R2) 5.5.3 | Document blinding procedures | This document + IWRS integration guide |
| ICH E6(R2) 5.5.3 | Restrict randomization access | Randomization in separate IWRS system |
| EU GCP Directive 2001/20/EC | Maintain trial blinding | EDC cannot reveal what it doesn't store |

---

**END OF DOCUMENT**
