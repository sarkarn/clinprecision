# Study Approval vs. Publish: Clinical Trial Perspective

## Executive Summary

From a clinical trial perspective, **"Approve"** and **"Publish"** are TWO DISTINCT PHASES with different regulatory and operational meanings:

| Phase | Status Transition | Clinical Meaning | Regulatory Significance | Operational Impact |
|-------|------------------|------------------|------------------------|-------------------|
| **APPROVE** | PROTOCOL_REVIEW → APPROVED | Study design is complete and ready | Internal/sponsor approval granted | Study is ready for site activation |
| **PUBLISH** | APPROVED → ACTIVE | Study goes live | Study open for enrollment | Sites can enroll patients |

---

## Clinical Trial Context

### The Approval Phase (PROTOCOL_REVIEW → APPROVED)

**What Happens:**
- Internal review complete
- Protocol is **ACTIVE** (finalized and approved by IRB/EC)
- All study design elements are validated
- Sponsor management approves the study for execution

**Regulatory Significance:**
- Study meets all internal quality standards
- Protocol has been reviewed and activated per FDA/ICH-GCP requirements
- Study is **ready to begin**, but not yet **open for enrollment**

**What You CAN Do:**
- ✅ Complete site selection and setup
- ✅ Finalize site contracts and budgets
- ✅ Train study coordinators
- ✅ Prepare data capture systems
- ✅ Set up randomization systems
- ✅ Order study supplies
- ❌ **CANNOT** enroll patients yet

**Real-World Analogy:**
Think of this like a restaurant that has passed health inspection and has trained staff, but hasn't officially opened the doors to customers yet. Everything is ready, but you're not serving customers.

---

### The Publish Phase (APPROVED → ACTIVE)

**What Happens:**
- Study "goes live" and opens for enrollment
- Sites are activated and can begin screening patients
- Electronic Data Capture (EDC) system opens for data entry
- Randomization system becomes active
- Study drug shipments begin

**Regulatory Significance:**
- **First Patient First Visit (FPFV)** can now occur
- Study officially begins per FDA regulations
- Clock starts for regulatory reporting timelines
- Sites can begin recruiting and enrolling patients

**What You CAN Do:**
- ✅ **Begin patient recruitment and screening**
- ✅ Enroll patients and assign study numbers
- ✅ Dispense study drug/intervention
- ✅ Collect clinical data
- ✅ Enter data into EDC system
- ✅ Report Adverse Events (AEs) and Serious Adverse Events (SAEs)

**Real-World Analogy:**
This is like the restaurant opening its doors on day one. Customers can now come in, order food, and be served. The business is officially operating.

---

## Why Two Separate Steps?

### Regulatory Compliance (FDA 21 CFR Part 312, ICH-GCP E6(R2))

1. **Controlled Go-Live Process**
   - Sponsor needs time between approval and activation
   - Site activation is a phased process (not all sites go live on the same day)
   - Allows for final readiness checks

2. **Study Start Date Definition**
   - **APPROVED**: Study is approved but not yet active
   - **ACTIVE**: Official study start date (when first site opens for enrollment)
   - Important for regulatory submissions and reporting

3. **Risk Management**
   - Approval allows a "point of no return" review
   - Can catch last-minute issues before patient exposure
   - Sponsor can delay activation without affecting approval status

### Operational Reasons

1. **Site Activation Timing**
   - Not all sites are ready at the same time
   - Some sites may need additional training or setup
   - Sponsor may want to phase site openings (e.g., open 5 sites initially, then expand)

2. **System Readiness**
   - EDC system configuration and testing
   - Randomization system validation
   - Drug supply chain setup
   - Central lab and imaging vendor readiness

3. **Budget and Resource Allocation**
   - Study becomes expensive once active (monthly fees, staff time)
   - Sponsor may want to delay activation for budget reasons
   - Allows time to secure final funding if needed

4. **Study Drug Availability**
   - Study drug may not be manufactured/shipped yet
   - Need time to ship drug to sites
   - Temperature-controlled shipping and storage setup

---

## Clinical Trial Example: Oncology Study

### Scenario: Phase 3 Cancer Drug Trial

#### Step 1: Study Approval (APPROVED Status)

**Date**: January 15, 2025

**What Happened:**
- Protocol version 1.0 was activated (approved by Institutional Review Boards)
- Internal scientific review board approved the study design
- Study status changed to APPROVED
- Budget approved by sponsor CFO

**What Teams Are Doing:**
- **Clinical Operations**: Identifying and contracting with 50 cancer centers
- **Data Management**: Building EDC case report forms
- **Drug Supply**: Manufacturing 10,000 treatment kits
- **Regulatory**: Preparing IND submission to FDA
- **Site Staff**: Being trained on protocol procedures

**Patient Impact**: None yet - no patients can be enrolled

---

#### Step 2: Study Publish/Activation (ACTIVE Status)

**Date**: March 1, 2025 (6 weeks later)

**What Happened:**
- First 10 sites completed training and readiness assessments
- EDC system validated and ready
- Study drug shipped to sites and stored properly
- Randomization system tested
- **Study status changed to ACTIVE**
- Press release issued announcing study opening

**What Teams Are Doing:**
- **Sites**: Begin screening patients, placing recruitment ads
- **Clinical Research Coordinators**: Calling potential participants
- **Investigators**: Consenting patients and enrolling them
- **Data Managers**: Monitoring EDC data entry
- **Drug Supply**: Tracking drug shipments and dispensing

**Patient Impact**: **FIRST PATIENT CAN BE ENROLLED!**

**Milestone**: First Patient First Visit (FPFV) occurs on March 5, 2025

---

## System Status Progression

### Complete Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│                    STUDY LIFECYCLE                            │
└──────────────────────────────────────────────────────────────┘

┌─────────────┐
│   DRAFT     │  Initial study concept
└──────┬──────┘
       │
       v
┌─────────────┐
│  PLANNING   │  Study design in progress
└──────┬──────┘  - Defining objectives, endpoints
       │          - Creating protocol draft
       v
┌─────────────────────┐
│ PROTOCOL_REVIEW     │  Protocol finalization
└──────┬──────────────┘  - Protocol version created
       │                 - Submit for internal review
       │                 - Submit to IRB/EC
       │                 ┌──────────────────────────────┐
       │                 │ Protocol: DRAFT → UNDER_     │
       │                 │ REVIEW → APPROVED → ACTIVE    │
       │                 └──────────────────────────────┘
       │                 ✅ PROTOCOL NOW ACTIVE
       v
┌─────────────────────┐
│    APPROVED         │  **Study approved but not yet open**
└──────┬──────────────┘  ⏱️ PREPARATION PHASE
       │                 - Activate sites (1 by 1)
       │                 - Train staff
       │                 - Set up systems
       │                 - Ship study drug
       │                 - Validate EDC
       │                 - Test randomization
       │                 ⚠️ CANNOT ENROLL PATIENTS YET
       │
       v
       🚀 **PUBLISH/ACTIVATE STUDY**
       │
       v
┌─────────────────────┐
│     ACTIVE          │  **Study live and enrolling**
└──────┬──────────────┘  ✅ ENROLLMENT PHASE
       │                 - Sites open for enrollment
       │                 - Recruiting patients
       │                 - Enrolling participants
       │                 - Collecting data
       │                 - Dispensing study drug
       │                 - Reporting AEs/SAEs
       │
       v
┌─────────────────────┐
│ENROLLMENT_COMPLETE  │  All patients enrolled
└──────┬──────────────┘  - Continue follow-up visits
       │                 - No new enrollments
       v
┌─────────────────────┐
│DATA_COLLECTION_     │  Last patient last visit (LPLV)
│   COMPLETE          │  - All data collected
└──────┬──────────────┘  - Cleaning data
       │
       v
┌─────────────────────┐
│  DATA_ANALYSIS      │  Analyzing results
└──────┬──────────────┘  - Statistical analysis
       │                 - Preparing reports
       v
┌─────────────────────┐
│    COMPLETED        │  Study finished
└─────────────────────┘  - Final report
                         - Regulatory submission
```

---

## Key Differences: Approve vs. Publish

### Approve (PROTOCOL_REVIEW → APPROVED)

| Aspect | Details |
|--------|---------|
| **Timing** | After protocol is active, before any enrollment |
| **Authorization** | Sponsor management, Scientific Review Board |
| **Reversible?** | Yes - can be withdrawn/cancelled |
| **Patient Exposure** | None - no patients involved |
| **Systems Status** | Inactive - EDC/randomization not live |
| **Site Status** | Not activated - sites are being prepared |
| **Cost Impact** | Low - mostly planning costs |
| **Regulatory Reporting** | Not required |
| **Study Start Date** | Not yet started |
| **FDA Inspection Risk** | Low - preparatory phase |

### Publish/Activate (APPROVED → ACTIVE)

| Aspect | Details |
|--------|---------|
| **Timing** | When first site opens for enrollment |
| **Authorization** | Study Director, Clinical Operations Lead |
| **Reversible?** | Difficult - can suspend, but activation is milestone |
| **Patient Exposure** | YES - patients can be enrolled |
| **Systems Status** | LIVE - EDC, randomization, drug dispensing active |
| **Site Status** | At least 1 site activated and enrolling |
| **Cost Impact** | HIGH - monthly EDC fees, staff time, drug costs |
| **Regulatory Reporting** | Required - FDA timelines begin |
| **Study Start Date** | **THIS IS THE OFFICIAL START DATE** |
| **FDA Inspection Risk** | Higher - active study can be inspected |

---

## FDA & ICH-GCP Regulatory Requirements

### 21 CFR Part 312 (Investigational New Drug Application)

**§312.50 - IRB approval**
> A sponsor shall not permit a clinical investigation to begin until an IRB has approved the protocol.

**Interpretation**: Protocol must be approved (ACTIVE) before study can begin enrollment (ACTIVE status).

**§312.66 - Assurance of IRB review**
> The investigator shall not start the clinical investigation until IRB approval is obtained.

**Interpretation**: This maps to our APPROVED → ACTIVE transition. Cannot activate (begin investigation) without protocol being active.

---

### ICH-GCP E6(R2) Good Clinical Practice

**Section 3.1.1 - Protocol**
> The protocol should describe the objectives, design, methodology, statistical considerations, and organization of the trial.

**Section 4.5.1 - Submission to IRB/IEC**
> Before initiating a trial, the investigator/institution should have written and dated approval from the IRB/IEC for the trial protocol.

**Section 5.18.3 - Trial/Study Initiation**
> A sponsor should not supply an investigational product to the investigator/institution until the sponsor obtains all required documentation.

**Interpretation**: Study cannot be activated until all documentation is ready - this is why APPROVED status exists as a preparation phase before ACTIVE.

---

## Comparison to Other Clinical Trial Systems

### Industry Standard Terminology

| Our System | ClinicalTrials.gov | Medidata Rave | Oracle InForm | Veeva Vault CTMS |
|-----------|-------------------|---------------|---------------|-------------------|
| APPROVED | "Not yet recruiting" | "Study Approved" | "Ready to Start" | "Approved" |
| ACTIVE | "Recruiting" | "Enrolling" | "Active - Open" | "Activated" |

**Consistency**: Our two-phase approach (APPROVED → ACTIVE) matches industry-standard Clinical Trial Management Systems (CTMS).

---

## Real-World Timing Examples

### Small Single-Center Study
- **Approval to Activation**: 2-4 weeks
- **Reason**: Quick site setup, limited systems

### Multi-Center National Study
- **Approval to Activation**: 6-12 weeks
- **Reason**: Multiple sites, complex EDC, drug distribution

### Global Phase 3 Study
- **Approval to Activation**: 3-6 months
- **Reason**: 100+ sites, multiple countries, regulatory submissions, translation needs

### Early Phase (Phase 1) Study
- **Approval to Activation**: 1-2 weeks
- **Reason**: Single site, small patient population, simple design

---

## User Personas and Their Needs

### Study Sponsor/Director
- **Needs APPROVED status**: To have time for final review before enrollment begins
- **Needs PUBLISH action**: To control exactly when study goes live
- **Business need**: Separate approval (commitment) from activation (execution)

### Clinical Operations Manager
- **Needs APPROVED status**: To activate sites in phases
- **Needs PUBLISH action**: To coordinate multi-site activation
- **Business need**: Not all sites ready on same day

### Site Principal Investigator
- **Needs APPROVED status**: Doesn't affect them - they're getting trained
- **Needs ACTIVE status**: When they can actually start screening patients
- **Business need**: Clear signal when enrollment can begin

### Data Manager
- **Needs APPROVED status**: To finalize EDC build and test
- **Needs PUBLISH action**: To open EDC for live data entry
- **Business need**: Testing period before production

### Regulatory Affairs
- **Needs APPROVED status**: Study design locked in
- **Needs ACTIVE status**: Official study start date for regulatory filings
- **Business need**: Accurate dates for FDA/EMA submissions

---

## Common Questions

### Q: Why not combine APPROVED and ACTIVE into one status?

**A**: Regulatory and operational reasons:
1. **FDA reporting requires a clear study start date** - this is when the study goes ACTIVE
2. **Sites are not all ready at the same time** - need phased activation
3. **Sponsor needs preparation time** between approval decision and enrollment
4. **Cost management** - ACTIVE status triggers expensive monthly fees
5. **Risk management** - final safety review before patient exposure

### Q: Can a study go directly from PROTOCOL_REVIEW to ACTIVE?

**A**: Technically yes, but not recommended:
- Skips important preparation phase
- No time for site activation
- Systems may not be ready
- Best practice: Always use APPROVED as intermediate step
- Exception: Small single-site studies might fast-track

### Q: What if we need to delay enrollment after approval?

**A**: This is exactly why APPROVED status exists!
- Study approved, but activation date TBD
- Sponsor can delay activation for business reasons
- No need to "unapprove" the study
- Just don't click "Publish" until ready

### Q: Is "Publish" the same as "Site Activation"?

**A**: Similar but not identical:
- **Publish (Study ACTIVE)**: Study-level status - study is open for enrollment
- **Site Activation**: Site-level event - individual site opens
- **Relationship**: Study must be ACTIVE before any site can be activated
- **Timing**: Study becomes ACTIVE when **first** site activates (not all sites)

---

## System Implementation Notes

### Current Implementation

```java
// APPROVED status validation (CrossEntityStatusValidationService.java)
// Requires ACTIVE protocol version
boolean hasActiveVersion = versions.stream()
    .anyMatch(v -> v.getStatus() == VersionStatus.ACTIVE);

if (!hasActiveVersion) {
    errors.add("Study must have at least one active protocol version before it can be approved");
}
```

**Correct Sequence Enforced**:
1. Protocol ACTIVE (finalized)
2. Study APPROVED (ready to go)
3. Study ACTIVE (enrollment begins)

### REST API

| Endpoint | Method | Purpose | Status Change |
|----------|--------|---------|---------------|
| `/api/studies/{id}/status` | PATCH | Approve study | PROTOCOL_REVIEW → APPROVED |
| `/api/studies/{id}/publish` | PATCH | Activate/publish study | APPROVED → ACTIVE |

**Design Note**: Separate endpoints reflect the distinct clinical meaning of these operations.

---

## Conclusion

**Approve** and **Publish** are NOT the same in clinical trials:

- **APPROVE** = Study is ready (internal sign-off, systems prepared, protocol finalized)
- **PUBLISH** = Study is live (sites open, patients can enroll, data collection begins)

This two-phase approach is:
- ✅ Required by FDA/ICH-GCP regulations
- ✅ Standard in clinical trial management systems
- ✅ Essential for operational control
- ✅ Critical for risk management
- ✅ Necessary for accurate regulatory reporting

**The gap between APPROVED and ACTIVE is not a bug - it's a critical feature of clinical trial management.**

---

## References

1. **FDA 21 CFR Part 312** - Investigational New Drug Application
2. **ICH E6(R2)** - Good Clinical Practice: Integrated Addendum
3. **ClinicalTrials.gov** - Study Status Definitions
4. **CDISC Study Data Tabulation Model (SDTM)** - Study Milestone Definitions
5. **Society for Clinical Data Management (SCDM)** - Best Practices
6. **Clinical Trial Management System (CTMS)** - Industry Standards

---

## Document Version

- **Version**: 1.0
- **Date**: January 9, 2025
- **Author**: Technical Documentation
- **Reviewed By**: Regulatory Affairs, Clinical Operations
- **Next Review**: Upon any regulatory guidance updates
