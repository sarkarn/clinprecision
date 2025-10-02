# ClinPrecision Subject Management Plan

## Overview

This document outlines the comprehensive plan for Subject Management within the ClinPrecision EDC system, defining the scope, implementation phases, and integration with other system modules.

## Current State Analysis

### What's Working ✅
- Patient registration (CREATE patient records)
- Basic data structures for patients and enrollments
- Frontend UI framework for subject management
- Patient projection handling via Axon Framework
- Basic patient API endpoints (`/datacapture-ws/api/v1/patients`)

### What's Missing ❌
- Study enrollment workflow (linking patients to studies)
- Site-specific enrollment
- Screening workflow
- Subject visit scheduling
- Subject status transitions
- Integration between Study Design and Subject Management

## Comprehensive Subject Management Plan

### Phase 1: Core Subject Lifecycle (Current Priority)

#### 1.1 Subject Registration & Screening
```
Pre-Screening → Screening Consent → Screening Assessments → Eligibility Determination
```

**Implementation Components:**
- **Pre-Screening**: Capture basic demographics, initial eligibility check
- **Informed Consent**: Digital consent forms, signature capture
- **Screening Visit**: Schedule and track screening assessments
- **Eligibility**: Inclusion/exclusion criteria evaluation
- **Screen Failure**: Handle patients who don't meet criteria

**Technical Requirements:**
- Extend `PatientEnrollmentController` with screening endpoints
- Add screening visit scheduling functionality
- Implement eligibility criteria evaluation engine
- Create consent management workflow

#### 1.2 Subject Enrollment 
```
Eligibility Confirmed → Study Enrollment → Site Assignment → Subject ID Assignment
```

**Implementation Components:**
- Link eligible patients to specific studies
- Assign patients to investigation sites
- Generate study-specific subject IDs (e.g., STUDY001-SITE01-001)
- Set enrollment date and initial status

**Technical Requirements:**
- Fix current enrollment API (`POST /patients/{patientId}/enroll`)
- Implement site-specific enrollment
- Create subject ID generation logic
- Add enrollment validation rules

#### 1.3 Subject Status Management
```
Registered → Screening → Enrolled → Active → Completed/Withdrawn
```

**Status Transitions:**
- `REGISTERED` → `SCREENING` (when screening visit scheduled)
- `SCREENING` → `ENROLLED` (when eligibility confirmed and enrolled)
- `ENROLLED` → `ACTIVE` (when first treatment/visit occurs)
- `ACTIVE` → `COMPLETED` or `WITHDRAWN` (study conclusion)

**Technical Requirements:**
- Implement status transition validation
- Add audit trail for status changes
- Create status-based business rules
- Frontend status visualization

### Phase 2: Visit & Data Capture Integration

#### 2.1 Visit Scheduling
- Define visit schedules per study protocol
- Schedule individual subject visits
- Track visit compliance and deviations

**Technical Requirements:**
- `subject_visits` table design
- Visit window calculations
- Visit compliance monitoring
- Integration with study protocol definitions

#### 2.2 Data Collection Integration  
- Link subjects to eCRF forms
- Track data completion status per subject/visit
- Subject-specific data queries and resolution

**Technical Requirements:**
- Subject-form associations
- Form completion tracking
- Data quality monitoring per subject
- Query management workflow

### Phase 3: Advanced Features

#### 3.1 Study Management Integration
- Protocol deviations tracking
- Adverse event reporting per subject
- Concomitant medications tracking

#### 3.2 Regulatory & Compliance
- Audit trail for all subject actions
- Regulatory reporting (SAE, protocol deviations)
- Data lock and database freeze

## Study Build Integration Plan

### System Flow: Study Design → Subject Management

```
1. STUDY DESIGN PHASE
   ├── Protocol Development (StudyDesignModule)
   ├── Site Selection & Activation (AdminModule)
   ├── Visit Schedule Definition (StudyDesignModule)
   └── eCRF Design (StudyDesignModule)

2. SUBJECT MANAGEMENT PHASE
   ├── Subject Recruitment (Outside system scope)
   ├── Pre-Screening & Consent (SubjectManagementModule)
   ├── Subject Registration (SubjectManagementModule)
   ├── Eligibility Assessment (SubjectManagementModule)
   ├── Study Enrollment (SubjectManagementModule)
   └── Visit Execution & Data Capture (DataCaptureModule)

3. DATA MANAGEMENT PHASE
   ├── Data Review & Queries (DQManagement)
   ├── Medical Coding (External/Future)
   ├── Database Lock (AdminModule)
   └── Statistical Analysis (External)
```

### Integration Points

1. **Study Design → Subject Management**
   - Study protocols define eligibility criteria
   - Visit schedules determine subject visit plans
   - eCRF definitions enable data collection

2. **Site Management → Subject Management**
   - Subjects must be enrolled at activated sites
   - Site-specific enrollment limits and tracking
   - Site coordinator assignments

3. **Subject Management → Data Capture**
   - Subject enrollment triggers eCRF availability
   - Visit completion enables data entry
   - Subject status affects form accessibility

4. **Subject Management → Data Quality**
   - Subject-specific query generation
   - Protocol deviation tracking
   - Compliance monitoring

## Randomization Strategy (External Integration)

### IWRS/IVRS Integration Model

**EDC System Responsibilities:**
```
├── Subject Registration
├── Eligibility Confirmation  
├── Pre-Randomization Data Collection
└── API Call to External IWRS
```

**External IWRS Responsibilities:**
```
├── Randomization Algorithm
├── Treatment Assignment
├── Drug/Device Allocation
└── Return Assignment to EDC
```

**EDC System (Post-Randomization):**
```
├── Receive Treatment Assignment
├── Update Subject Record
└── Enable Treatment-Specific eCRFs
```

### Implementation Approach
- **Phase 1**: Manual treatment assignment (for simple studies)
- **Phase 2**: API integration with external IWRS systems
- **Phase 3**: Built-in simple randomization (only for basic studies where external IWRS is overkill)

## Technical Implementation Priority

### Immediate (Next 2-3 weeks)
1. **Fix Current Enrollment Issue**
   - Complete the patient → study enrollment workflow
   - Fix `studyId` assignment in enrollment records
   - Ensure proper status transitions

2. **Site Association**
   - Ensure subjects are enrolled at specific sites
   - Add site validation to enrollment process
   - Display site information in subject lists

3. **Status Management**
   - Implement proper status transitions
   - Add status validation rules
   - Create status history tracking

4. **Basic Visit Scheduling**
   - Simple visit schedule per subject
   - Visit window calculations
   - Basic visit tracking

### Short Term (1-2 months)
1. **Screening Workflow**
   - Complete screening visit management
   - Screening form integration
   - Eligibility determination workflow

2. **Eligibility Criteria**
   - Automated eligibility checking
   - Configurable inclusion/exclusion criteria
   - Screen failure management

3. **Data Capture Integration**
   - Link subjects to forms
   - Subject-specific form instances
   - Form completion tracking

4. **Subject Dashboard**
   - Comprehensive subject overview
   - Visit timeline visualization
   - Status and compliance indicators

### Medium Term (3-6 months)
1. **Advanced Visit Management**
   - Complex visit schedules
   - Visit windows and deviations
   - Unscheduled visit handling

2. **Protocol Deviation Tracking**
   - Deviation capture and categorization
   - Deviation reporting workflow
   - Impact assessment

3. **IWRS Integration**
   - API framework for external randomization
   - Treatment assignment workflow
   - Drug accountability integration

4. **Advanced Reporting**
   - Subject enrollment reports
   - Study metrics and KPIs
   - Regulatory reporting templates

## Database Schema Design

### Current Tables (Working)
```sql
-- Patient registration
patients (id, firstName, lastName, email, phoneNumber, dateOfBirth, gender, status, aggregateUuid, createdAt, lastModifiedAt)

-- Enrollment records  
patient_enrollment (id, patient_id, study_id, site_id, screening_number, enrollment_date, status, createdAt, lastModifiedAt)
```

### Required New Tables
```sql
-- Visit scheduling and tracking
subject_visits (
    id, enrollment_id, visit_number, visit_name, 
    scheduled_date, actual_date, visit_window_start, visit_window_end,
    status, deviation_reason, createdAt, lastModifiedAt
)

-- Screening and eligibility
eligibility_assessments (
    id, patient_id, study_id, assessment_date,
    meets_inclusion_criteria, exclusion_violations,
    eligible, screen_failure_reason, createdAt
)

-- Status change audit trail
subject_status_history (
    id, enrollment_id, previous_status, new_status,
    change_reason, changed_by, changed_at
)

-- Protocol deviations
protocol_deviations (
    id, enrollment_id, visit_id, deviation_type,
    description, severity, resolution, createdAt
)

-- Treatment assignments (post-randomization)
treatment_assignments (
    id, enrollment_id, treatment_code, assignment_date,
    randomization_number, stratum, createdAt
)
```

### Existing Tables (Extend)
```sql
-- Add columns to patient_enrollment
ALTER TABLE patient_enrollment ADD COLUMN (
    treatment_assignment VARCHAR(50),
    randomization_date TIMESTAMP,
    withdrawal_date TIMESTAMP,
    withdrawal_reason TEXT,
    completion_date TIMESTAMP
);
```

## API Design

### Current Endpoints
- `GET /datacapture-ws/api/v1/patients` - List all patients
- `POST /datacapture-ws/api/v1/patients` - Register new patient
- `POST /datacapture-ws/api/v1/patients/{patientId}/enroll` - Enroll patient in study

### Required New Endpoints
```
Subject Management:
POST   /datacapture-ws/api/v1/patients/{patientId}/screen        - Start screening
PUT    /datacapture-ws/api/v1/patients/{patientId}/eligibility   - Update eligibility
GET    /datacapture-ws/api/v1/studies/{studyId}/subjects         - Get subjects by study
PUT    /datacapture-ws/api/v1/enrollments/{enrollmentId}/status  - Update subject status

Visit Management:
GET    /datacapture-ws/api/v1/enrollments/{enrollmentId}/visits  - Get visit schedule
POST   /datacapture-ws/api/v1/visits                             - Schedule visit
PUT    /datacapture-ws/api/v1/visits/{visitId}                   - Update visit

Reporting:
GET    /datacapture-ws/api/v1/studies/{studyId}/enrollment-stats - Enrollment statistics
GET    /datacapture-ws/api/v1/sites/{siteId}/subjects           - Subjects by site
```

## Frontend Component Architecture

### Current Components
- `SubjectManagementDashboard.jsx` - Main dashboard
- `SubjectList.jsx` - List subjects by study
- `SubjectEnrollment.jsx` - Enrollment form
- `SubjectDetails.jsx` - Subject detail view

### Required New Components
```
Screening:
- ScreeningWorkflow.jsx       - Multi-step screening process
- EligibilityAssessment.jsx   - Eligibility criteria checklist
- ConsentManagement.jsx       - Digital consent forms

Visit Management:
- VisitSchedule.jsx           - Subject visit timeline
- VisitDetails.jsx            - Individual visit management
- VisitCompliance.jsx         - Compliance monitoring

Advanced Features:
- SubjectDashboard.jsx        - Comprehensive subject overview
- ProtocolDeviations.jsx      - Deviation tracking
- TreatmentAssignment.jsx     - Treatment/randomization display
```

## Integration with Existing Modules

### Study Design Module
- Import study protocols for eligibility criteria
- Use visit schedules for subject visit planning
- Reference eCRF definitions for data collection

### Admin Module  
- Use site activation status for enrollment validation
- Reference user roles for access control
- Integrate with site management workflows

### Data Capture Module
- Subject-specific form instances
- Visit-based data entry workflows
- Subject compliance tracking

### DQ Management Module
- Subject-specific query generation
- Protocol deviation workflows
- Data quality metrics per subject

## Scope Boundaries

### What ClinPrecision Subject Management INCLUDES
✅ Subject registration and demographics  
✅ Study enrollment and site assignment  
✅ Visit scheduling and tracking  
✅ Subject status management  
✅ Eligibility assessment  
✅ Basic protocol deviation tracking  
✅ Integration with eCRF data collection  
✅ Subject reporting and metrics  

### What ClinPrecision EXCLUDES (External Systems)
❌ **Randomization** (IWRS/IVRS systems)  
❌ **Drug Supply Management** (IWRS systems)  
❌ **Statistical Analysis** (SAS/R/SPSS)  
❌ **Regulatory Submissions** (eCTD systems)  
❌ **Clinical Trial Management** (Full CTMS features like budgets, contracts)  
❌ **Patient Recruitment** (CRM/Marketing systems)  
❌ **Medical Device Integration** (Device-specific protocols)  

## Success Metrics

### Phase 1 Success Criteria
- [ ] Patients can be successfully enrolled in studies with proper `studyId` assignment
- [ ] Subject status transitions work correctly (REGISTERED → SCREENING → ENROLLED)
- [ ] Subjects display correctly in study-specific lists
- [ ] Site-specific enrollment tracking functions
- [ ] Basic visit scheduling operational

### Phase 2 Success Criteria  
- [ ] Complete screening workflow operational
- [ ] Eligibility criteria evaluation automated
- [ ] Subject-form associations working
- [ ] Visit compliance monitoring active
- [ ] Subject dashboard provides comprehensive overview

### Phase 3 Success Criteria
- [ ] Protocol deviation tracking complete
- [ ] External IWRS integration framework ready
- [ ] Advanced reporting suite operational
- [ ] Regulatory compliance features implemented
- [ ] Production-ready performance and scalability

## Risk Mitigation

### Technical Risks
- **Database Performance**: Monitor query performance as subject data grows
- **Integration Complexity**: Phased approach to avoid over-engineering
- **Data Integrity**: Robust validation and audit trails

### Business Risks  
- **Scope Creep**: Clear boundaries defined for external system integration
- **Regulatory Compliance**: Focus on core EDC requirements, not specialized regulatory features
- **User Adoption**: Intuitive UI design following clinical workflow patterns

---

*This document serves as the master plan for Subject Management development. It should be updated as implementation progresses and requirements evolve.*

**Last Updated**: October 2, 2025  
**Version**: 1.0  
**Status**: In Development - Phase 1