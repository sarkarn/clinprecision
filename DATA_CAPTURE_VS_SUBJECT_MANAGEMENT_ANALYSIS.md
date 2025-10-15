# Data Capture vs Subject Management Module Analysis
## Industry Standard Clinical Trial Process Perspective

**Date:** October 14, 2025  
**Purpose:** Analyze current module structure, identify gaps, and propose unified architecture

---

## 📊 Executive Summary

### Current State
- **Two separate modules** with overlapping functionality
- **Data Capture Module:** Forms, visits, data entry
- **Subject Management Module:** Patient status, enrollment tracking
- **Problem:** Unclear boundaries, duplicated concerns, fragmented workflows

### Recommendation
**MERGE INTO SINGLE "CLINICAL OPERATIONS" MODULE** with clear sub-domains:
1. **Subject Lifecycle Management**
2. **Visit Management** 
3. **Data Collection & Entry**
4. **Quality & Compliance**

---

## 🏥 Industry Standard Clinical Trial Process

### CDISC/ICH GCP Standard Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CLINICAL TRIAL LIFECYCLE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. PRE-SCREENING                                                    │
│     ↓                                                                 │
│  2. SCREENING                                                        │
│     ├── Informed Consent (ICF)                                       │
│     ├── Screening Visit (SV)                                         │
│     ├── Eligibility Assessment (Inc/Exc criteria)                    │
│     └── Screen Failure Documentation                                 │
│     ↓                                                                 │
│  3. ENROLLMENT/RANDOMIZATION                                         │
│     ├── Subject ID Assignment                                        │
│     ├── Baseline Assessments                                         │
│     ├── Randomization (if applicable)                                │
│     └── Treatment Assignment                                         │
│     ↓                                                                 │
│  4. ACTIVE TREATMENT                                                 │
│     ├── Protocol Visit Schedule (Day 0, Week 2, Month 1, etc.)      │
│     ├── Visit Windows (±3 days, ±7 days)                            │
│     ├── Form Completion per Visit                                    │
│     ├── Adverse Event Reporting                                      │
│     ├── Concomitant Medications                                      │
│     ├── Protocol Deviations                                          │
│     └── Unscheduled Visits (AE visits, early termination)           │
│     ↓                                                                 │
│  5. COMPLETION/DISCONTINUATION                                       │
│     ├── End of Study (EOS) Visit                                     │
│     ├── Early Termination Visit (if withdrawn)                       │
│     ├── Final Safety Assessments                                     │
│     └── Study Close-out Forms                                        │
│     ↓                                                                 │
│  6. FOLLOW-UP (Optional)                                            │
│     └── Long-term Safety Assessments                                 │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Current Implementation Gap Analysis

### What ClinPrecision Currently Has ✅

| Feature | Status | Location | Quality |
|---------|--------|----------|---------|
| Patient Registration | ✅ Implemented | DataCapture | Good - Event sourcing |
| Patient Enrollment | ✅ Implemented | DataCapture | Good - Event sourcing |
| Status Transitions | ✅ Implemented | SubjectManagement | Good - With validation |
| Status History | ✅ Implemented | Backend | Good - Audit trail |
| Basic Visit Display | ✅ Implemented | DataCapture | Working |
| Form Entry UI | ✅ Implemented | DataCapture | Basic functionality |
| Form Data Storage | ✅ Implemented | Backend | Working |

### Critical Gaps ❌

#### 1. **SCREENING WORKFLOW** 🚨 HIGH PRIORITY
**Industry Standard:**
- Pre-screening questionnaire
- Informed Consent Form (ICF) with e-signature
- Screening visit with eligibility checklist
- Inclusion/Exclusion criteria evaluation (automated scoring)
- Screen failure documentation with reason codes
- Screen failure reporting to regulatory

**Current State:** ❌ NOT IMPLEMENTED
- No ICF management
- No eligibility criteria engine
- No screen failure tracking
- Manual screening process

**Impact:** Cannot properly screen subjects per GCP requirements

---

#### 2. **PROTOCOL VISIT SCHEDULE** 🚨 HIGH PRIORITY
**Industry Standard:**
```
Study Design:
  Visit 1: Screening (Day -14 to Day -1)
  Visit 2: Baseline (Day 0)
  Visit 3: Week 2 (Day 14 ± 3 days)
  Visit 4: Month 1 (Day 30 ± 7 days)
  Visit 5: Month 3 (Day 90 ± 7 days)
  Visit 6: End of Study (Day 180 ± 7 days)

Subject Enrollment:
  → Auto-generate visit instances for THIS subject
  → Calculate visit windows
  → Schedule visits
  → Track compliance
```

**Current State:** ❌ PARTIALLY IMPLEMENTED
- `visit_definitions` table exists (protocol schedule)
- `study_visit_instances` table exists (subject visits)
- **BUT:** No automatic visit instantiation on enrollment
- **BUT:** No visit window calculations
- **BUT:** No visit scheduling logic
- **BUT:** Manual visit creation only

**Impact:** 
- Sites must manually create each visit for each subject
- No automated compliance tracking
- Protocol deviations not tracked

---

#### 3. **VISIT-FORM ASSOCIATION** 🚨 HIGH PRIORITY
**Industry Standard:**
```
Visit 1 (Screening):
  ├── Informed Consent Form
  ├── Demographics Form
  ├── Medical History Form
  ├── Inclusion/Exclusion Criteria Form
  ├── Vital Signs Form
  └── Laboratory Requisition Form

Visit 2 (Baseline):
  ├── Physical Examination Form
  ├── ECG Form
  ├── Laboratory Results Form
  ├── Concomitant Medications Form
  └── Adverse Events Form (if any)
```

**Current State:** ❌ NOT IMPLEMENTED
- Forms exist independently
- No visit→form binding
- No automatic form list per visit
- CRC must manually find forms

**Impact:**
- CRCs don't know which forms to complete for a visit
- Data completeness not tracked
- Visit completion status unclear

---

#### 4. **VISIT WINDOWS & COMPLIANCE** 🚨 MEDIUM PRIORITY
**Industry Standard:**
```
Visit 3: Week 2 Visit
  Planned Date: Day 14
  Window: Day 11 to Day 17 (±3 days)
  Status Tracking:
    ├── SCHEDULED (before window opens)
    ├── OPEN (within window)
    ├── OVERDUE (window passed, visit not done)
    ├── COMPLETED (visit done within window)
    ├── OUT_OF_WINDOW (visit done outside window → protocol deviation)
    └── MISSED (window passed, visit not done)
```

**Current State:** ❌ NOT IMPLEMENTED
- No visit window calculations
- No "overdue visit" alerts
- No protocol deviation flagging
- No visit compliance reporting

**Impact:**
- Sites miss visit windows
- Protocol deviations not documented
- Regulatory non-compliance

---

#### 5. **ELIGIBILITY CRITERIA ENGINE** 🚨 MEDIUM PRIORITY
**Industry Standard:**
```sql
-- Example Eligibility Criteria
Inclusion Criteria:
1. Age ≥ 18 years                    [REQUIRED]
2. BMI between 18-35 kg/m²           [REQUIRED]
3. Signed ICF                        [REQUIRED]
4. Adequate renal function (eGFR ≥60) [REQUIRED]

Exclusion Criteria:
1. Pregnant or breastfeeding         [AUTOMATIC EXCLUSION]
2. Active malignancy                 [AUTOMATIC EXCLUSION]
3. Prior treatment with study drug   [AUTOMATIC EXCLUSION]

Eligibility Decision:
  ALL inclusion criteria MET = ELIGIBLE
  ANY exclusion criteria MET = NOT ELIGIBLE
```

**Current State:** ❌ NOT IMPLEMENTED
- No criteria definition in study design
- No automated eligibility calculation
- Manual eligibility assessment
- No audit trail of screening decisions

**Impact:**
- Ineligible subjects may be enrolled
- No documentation of eligibility decision
- GCP non-compliance

---

#### 6. **FORM COMPLETION TRACKING** 🚨 MEDIUM PRIORITY
**Industry Standard:**
```
Visit Status:
  ├── Forms Required: 5
  ├── Forms Completed: 3
  ├── Forms In Progress: 1
  ├── Forms Not Started: 1
  └── Completion: 60%

Visit Completion Criteria:
  └── All REQUIRED forms completed → Visit marked COMPLETE
```

**Current State:** ❌ NOT IMPLEMENTED
- No "required vs optional" form concept
- No visit completion percentage
- No visit completion logic
- Forms completed independently of visits

**Impact:**
- Don't know when a visit is complete
- Can't track site performance
- Incomplete data not flagged

---

#### 7. **UNSCHEDULED VISITS** 🚨 LOW PRIORITY
**Industry Standard:**
```
Unscheduled Visit Scenarios:
1. Adverse Event Visit (patient reports SAE)
2. Early Termination Visit (patient withdraws)
3. Compliance Visit (missed protocol visit)
4. Safety Follow-up Visit (abnormal lab results)

Unscheduled Visit Process:
  ├── Create new visit instance (visit_id = NULL or special unscheduled visit definition)
  ├── Document reason for unscheduled visit
  ├── Complete relevant forms
  └── Does NOT impact scheduled visit timeline
```

**Current State:** ✅ PARTIALLY IMPLEMENTED
- UnscheduledVisitModal exists
- Backend service exists
- **BUT:** Removed from status change flow (correct decision!)
- **BUT:** No UI to create unscheduled visit from SubjectDetails

**Impact:**
- CRCs can't document unscheduled visits
- AE visits not tracked properly

---

#### 8. **PROTOCOL DEVIATIONS** 🚨 MEDIUM PRIORITY
**Industry Standard:**
```
Protocol Deviation Types:
1. Visit Window Deviation (visit done outside window)
2. Missed Visit (visit not completed)
3. Eligibility Deviation (enrollment criteria not met)
4. Procedure Deviation (protocol procedure not followed)
5. Consent Deviation (consent issues)

Deviation Tracking:
  ├── Automatic flagging (system detects)
  ├── Manual reporting (site reports)
  ├── Severity classification (Minor, Major, Critical)
  ├── Root cause analysis
  ├── Corrective action plan
  └── Regulatory reporting (if required)
```

**Current State:** ❌ NOT IMPLEMENTED
- No deviation detection
- No deviation documentation
- No deviation reporting

**Impact:**
- Protocol violations not documented
- FDA inspection findings
- Study quality issues

---

#### 9. **VISIT STATUS LIFECYCLE** 🚨 LOW PRIORITY
**Industry Standard:**
```
Visit Status Flow:
SCHEDULED → IN_PROGRESS → COMPLETED → LOCKED → FROZEN

SCHEDULED:      Visit planned, not yet started
IN_PROGRESS:    Visit started, forms being completed
COMPLETED:      All required forms completed
LOCKED:         Data locked, requires unlock to edit
FROZEN:         Database lock, no further changes (study closure)
```

**Current State:** ❌ PARTIALLY IMPLEMENTED
- Visit status exists in `study_visit_instances`
- **BUT:** No status transition logic
- **BUT:** No automatic status updates based on form completion
- **BUT:** No lock/freeze functionality

---

#### 10. **INFORMED CONSENT MANAGEMENT** 🚨 HIGH PRIORITY
**Industry Standard:**
```
ICF Workflow:
1. Present ICF to subject
2. Allow adequate time for review
3. Answer subject questions
4. Subject signs ICF (e-signature)
5. Investigator signs ICF
6. System stores signed ICF PDF
7. ICF version control (track amendments)
8. Re-consent workflow (if protocol amended)

ICF Requirements (21 CFR Part 11):
  ├── E-signature with authentication
  ├── Timestamp of signature
  ├── Stored as immutable PDF
  ├── Audit trail of consent process
  └── Version control
```

**Current State:** ❌ NOT IMPLEMENTED
- No ICF form builder
- No e-signature capability
- No ICF storage
- No version control
- No re-consent workflow

**Impact:**
- Cannot conduct trials per GCP
- Regulatory non-compliance
- Subjects not properly consented

---

#### 11. **RANDOMIZATION** 🚨 MEDIUM PRIORITY (FUTURE)
**Industry Standard:**
```
Randomization Process:
1. Subject meets eligibility criteria
2. System generates randomization number
3. Treatment assignment revealed (or blinded)
4. Subject assigned to treatment arm
5. Stratification factors applied (if applicable)
6. Emergency unblinding capability

Stratification Example:
  Gender: Male/Female
  Age Group: <50 / ≥50
  Disease Severity: Mild / Moderate / Severe
```

**Current State:** ❌ NOT IMPLEMENTED
- No randomization engine
- Treatment arms defined but not assigned
- No blinding support
- No stratification

**Impact:**
- Cannot run randomized trials
- Manual randomization required (error-prone)

---

#### 12. **SOURCE DOCUMENT VERIFICATION (SDV)** 🚨 LOW PRIORITY (FUTURE)
**Industry Standard:**
```
SDV Workflow:
1. Monitor visits site
2. Compares eCRF data to source documents
3. Marks fields as "SDV Verified"
4. Documents discrepancies
5. Generates queries for corrections
6. Re-verifies after corrections

SDV Status per Field:
  ├── NOT_VERIFIED
  ├── VERIFIED
  ├── DISCREPANCY_FOUND
  └── RE_VERIFIED
```

**Current State:** ❌ NOT IMPLEMENTED

---

## 🏗️ Proposed Unified Module Architecture

### Single "Clinical Operations" Module

```
┌────────────────────────────────────────────────────────────────────┐
│                    CLINICAL OPERATIONS MODULE                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  1. SUBJECT LIFECYCLE MANAGEMENT                          │     │
│  ├──────────────────────────────────────────────────────────┤     │
│  │  • Patient Registration                                   │     │
│  │  • Screening Workflow                                     │     │
│  │    ├── Pre-screening                                      │     │
│  │    ├── Informed Consent (ICF)                             │     │
│  │    ├── Screening Visit                                    │     │
│  │    ├── Eligibility Assessment                             │     │
│  │    └── Screen Failure Documentation                       │     │
│  │  • Enrollment & Randomization                             │     │
│  │  • Subject Status Management                              │     │
│  │    ├── REGISTERED → SCREENING → ENROLLED → ACTIVE        │     │
│  │    └── Status History & Audit Trail                       │     │
│  │  • Subject Dashboard                                      │     │
│  │  • Demographics & Medical History                         │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  2. VISIT MANAGEMENT                                      │     │
│  ├──────────────────────────────────────────────────────────┤     │
│  │  • Protocol Visit Schedule (from Study Design)            │     │
│  │  • Visit Instantiation (auto-generate on enrollment)      │     │
│  │  • Visit Windows & Compliance                             │     │
│  │  • Scheduled Visits                                       │     │
│  │  • Unscheduled Visits (AE, Early Term, etc.)             │     │
│  │  • Visit Status Lifecycle                                 │     │
│  │    └── SCHEDULED → IN_PROGRESS → COMPLETED → LOCKED      │     │
│  │  • Visit Timeline View                                    │     │
│  │  • Overdue Visit Alerts                                   │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  3. DATA COLLECTION & ENTRY                               │     │
│  ├──────────────────────────────────────────────────────────┤     │
│  │  • Visit-Form Association                                 │     │
│  │  • Form Instance Management                               │     │
│  │  • Dynamic Form Rendering                                 │     │
│  │  • Data Entry with Auto-save                              │     │
│  │  • Real-time Validation & Edit Checks                     │     │
│  │  • Form Completion Tracking                               │     │
│  │  • Required vs Optional Forms                             │     │
│  │  • Form Status (Draft → Submitted → Verified → Locked)   │     │
│  │  • Audit Trail per Field                                  │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  4. QUALITY & COMPLIANCE                                  │     │
│  ├──────────────────────────────────────────────────────────┤     │
│  │  • Eligibility Criteria Engine                            │     │
│  │  • Protocol Deviation Detection & Tracking                │     │
│  │  • Data Quality Queries                                   │     │
│  │  • Source Document Verification (SDV)                     │     │
│  │  • E-Signatures (21 CFR Part 11)                         │     │
│  │  • Audit Trail & Change History                           │     │
│  │  • Data Lock & Database Freeze                            │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Implementation Priority Matrix

### Phase 1: Foundation (Weeks 1-4) 🚨 CRITICAL

| Priority | Feature | Effort | Impact | Dependencies |
|----------|---------|--------|--------|--------------|
| **P0** | **Merge modules into "Clinical Operations"** | 1 week | Very High | None |
| **P0** | **Protocol visit instantiation on enrollment** | 1 week | Very High | Visit definitions exist |
| **P0** | **Visit-Form association** | 1 week | Very High | Forms exist |
| **P0** | **Form completion tracking** | 3 days | High | Visit-form association |
| **P1** | **Screening workflow (basic)** | 1 week | High | Patient registration |
| **P1** | **Visit windows & compliance** | 1 week | High | Visit instances |

**Deliverables:**
- ✅ Single unified module
- ✅ Visits auto-created on enrollment
- ✅ Forms associated with visits
- ✅ Visit completion tracking
- ✅ Basic screening workflow

---

### Phase 2: Core Clinical Features (Weeks 5-8) 🔥 HIGH PRIORITY

| Priority | Feature | Effort | Impact | Dependencies |
|----------|---------|--------|--------|--------------|
| **P1** | **Eligibility criteria engine** | 2 weeks | High | Study design |
| **P1** | **Informed Consent (ICF) basic** | 2 weeks | Very High | E-signature |
| **P2** | **Protocol deviation detection** | 1 week | Medium | Visit windows |
| **P2** | **Unscheduled visit creation UI** | 3 days | Medium | Visit management |
| **P2** | **Visit status lifecycle** | 1 week | Medium | Form completion |

**Deliverables:**
- ✅ Eligibility automated
- ✅ Basic ICF with e-signature
- ✅ Deviation tracking
- ✅ Unscheduled visits supported

---

### Phase 3: Advanced Features (Weeks 9-12) 📈 MEDIUM PRIORITY

| Priority | Feature | Effort | Impact | Dependencies |
|----------|---------|--------|--------|--------------|
| **P2** | **ICF version control & re-consent** | 1 week | Medium | Basic ICF |
| **P2** | **Randomization engine** | 2 weeks | High | Eligibility |
| **P3** | **Source Document Verification (SDV)** | 2 weeks | Low | Data entry |
| **P3** | **Database lock & freeze** | 1 week | Medium | Data quality |

---

## 🎯 Recommended Immediate Actions

### Week 1: Module Consolidation
1. **Rename "DataCapture" → "ClinicalOperations"**
2. **Merge SubjectManagement into ClinicalOperations**
3. **Reorganize frontend folder structure:**
   ```
   frontend/clinprecision/src/components/modules/clinical-operations/
   ├── subject-lifecycle/
   │   ├── PatientRegistration.jsx
   │   ├── ScreeningWorkflow.jsx
   │   ├── SubjectEnrollment.jsx
   │   ├── SubjectList.jsx
   │   ├── SubjectDetails.jsx
   │   └── StatusManagement/
   ├── visit-management/
   │   ├── VisitSchedule.jsx
   │   ├── VisitDetails.jsx
   │   ├── UnscheduledVisitModal.jsx
   │   └── VisitCompliance.jsx
   ├── data-entry/
   │   ├── FormList.jsx
   │   ├── FormEntry.jsx
   │   ├── FormView.jsx
   │   └── FormValidation.jsx
   └── compliance/
       ├── ProtocolDeviations.jsx
       ├── EligibilityAssessment.jsx
       └── InformedConsent.jsx
   ```

### Week 2-3: Protocol Visit Instantiation
1. **Create VisitInstantiationService**
   ```java
   public class VisitInstantiationService {
       // When patient enrolled in study
       public void instantiateProtocolVisits(Long enrollmentId, Long studyId) {
           // 1. Get all visit_definitions for study
           // 2. Create study_visit_instances for each definition
           // 3. Calculate visit windows
           // 4. Set visit status = SCHEDULED
       }
   }
   ```

2. **Update PatientEnrollmentProjector**
   ```java
   @EventHandler
   public void on(PatientEnrolledEvent event) {
       // ... existing enrollment logic
       
       // NEW: Auto-instantiate visits
       visitInstantiationService.instantiateProtocolVisits(
           enrollment.getId(),
           event.getStudyId()
       );
   }
   ```

### Week 3-4: Visit-Form Association
1. **Create visit_form_assignments table**
   ```sql
   CREATE TABLE visit_form_assignments (
       id BIGINT PRIMARY KEY AUTO_INCREMENT,
       visit_definition_id BIGINT NOT NULL,
       form_definition_id BIGINT NOT NULL,
       is_required BOOLEAN DEFAULT TRUE,
       display_order INT,
       FOREIGN KEY (visit_definition_id) REFERENCES visit_definitions(id),
       FOREIGN KEY (form_definition_id) REFERENCES form_definitions(id),
       UNIQUE KEY (visit_definition_id, form_definition_id)
   );
   ```

2. **Update FormList.jsx to show visit-specific forms**
   ```javascript
   // Get forms for this visit from visit-form assignments
   const visitForms = await VisitService.getFormsForVisit(visitInstanceId);
   ```

---

## 🤔 Single Module vs Two Modules?

### ❌ Current Two-Module Approach Problems:
1. **Unclear boundaries** - Is visit management in DataCapture or SubjectManagement?
2. **Duplicated concerns** - Both deal with patient/subject
3. **Fragmented workflows** - Status change in one module, visit in another
4. **Confusing navigation** - Users don't know where to go
5. **Code duplication** - Similar services/repositories in both

### ✅ Single "Clinical Operations" Module Benefits:
1. **Clear workflow** - All subject activities in one place
2. **Unified navigation** - One dashboard for CRCs
3. **Coherent data model** - All related entities together
4. **Better maintainability** - Single codebase for clinical operations
5. **Industry standard** - EDC systems have ONE clinical module

### Industry Benchmarks:
- **Medidata Rave**: One "Study Conduct" module
- **Oracle InForm**: One "Clinical Data Management" module
- **REDCap**: One unified data collection module
- **OpenClinica**: One "Study" module

**Recommendation: MERGE into single module** ✅

---

## 📊 Success Metrics

### Phase 1 Success Criteria
- [ ] Single "Clinical Operations" module with clear navigation
- [ ] Visits auto-created on enrollment (100% of subjects)
- [ ] Forms displayed per visit (not generic list)
- [ ] Visit completion percentage calculated
- [ ] CRCs can complete screening workflow

### Phase 2 Success Criteria
- [ ] Eligibility automatically calculated (no manual assessment)
- [ ] ICF captured with e-signature
- [ ] Protocol deviations auto-flagged
- [ ] Visit compliance reporting available

### Phase 3 Success Criteria
- [ ] Randomization engine operational
- [ ] SDV workflow complete
- [ ] Database lock/freeze capability
- [ ] 100% GCP compliant workflows

---

## 📚 References

### Industry Standards
- ICH E6(R2) Good Clinical Practice
- CDISC CDASH (Clinical Data Acquisition Standards Harmonization)
- FDA 21 CFR Part 11 (Electronic Records/Signatures)
- GAMP 5 (Quality Risk Management for Computerized Systems)

### Competitor EDC Systems
- Medidata Rave
- Oracle InForm
- OpenClinica
- REDCap
- Veeva Vault CTMS

---

## 🎯 Conclusion

**Current state:** Two modules with unclear boundaries and major clinical workflow gaps

**Recommendation:**
1. **MERGE modules** → Single "Clinical Operations" module
2. **Implement Phase 1** (4 weeks) → Protocol visit instantiation + visit-form association
3. **Implement Phase 2** (4 weeks) → Screening workflow + eligibility engine + ICF
4. **Implement Phase 3** (4 weeks) → Randomization + SDV + compliance features

**Expected outcome:** Industry-standard EDC clinical operations with GCP-compliant workflows

---

**Next Step:** Get stakeholder approval for module merge and Phase 1 implementation plan.
