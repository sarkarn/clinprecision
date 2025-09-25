# Data Capture Module - Comprehensive Implementation Plan

**Version:** 1.0  
**Date:** September 23, 2025  
**Module:** Electronic Data Capture (EDC)  
**Industry Standards:** FDA 21 CFR Part 11, ICH-GCP, CDISC ODM  

---

## Executive Summary

The Data Capture module is the cornerstone of the ClinPrecision clinical trial management system, providing secure, validated, and compliant electronic data capture capabilities that align with industry standards including FDA 21 CFR Part 11, ICH-GCP guidelines, and CDISC data standards.

**Key Objectives:**
- Implement industry-standard EDC workflows following ICH-GCP guidelines
- Ensure 21 CFR Part 11 compliance for electronic records and signatures
- Support CDISC ODM standards for data exchange and submission
- Provide real-time data validation and edit checking
- Enable mobile and offline data entry capabilities
- Implement comprehensive audit trails and data integrity measures

---

## Industry Standards & Regulatory Compliance

### 1. FDA 21 CFR Part 11 Compliance
- **Electronic Records**: Secure creation, modification, and maintenance
- **Electronic Signatures**: Legally binding digital signatures
- **Audit Trails**: Complete change history with user identification
- **System Validation**: Computer system validation (CSV) requirements
- **Access Controls**: Role-based permissions and authentication

### 2. ICH-GCP Guidelines
- **Data Integrity**: ALCOA+ principles (Attributable, Legible, Contemporaneous, Original, Accurate, Complete, Consistent, Enduring, Available)
- **Source Data**: Source data verification and direct data entry
- **Quality Control**: Built-in quality control measures
- **Documentation**: Complete documentation of all procedures

### 3. CDISC Standards
- **ODM (Operational Data Model)**: Standardized data exchange format
- **SDTM (Study Data Tabulation Model)**: Standard structure for clinical trial data
- **Data Standards**: Controlled terminology and coding standards

---

## Clinical Data Capture Workflow (Industry Standard)

### Phase 1: Study Activation & Site Preparation

#### 1.1 Study Database Build
```
Study Design → Database Configuration → User Access Setup → Site Training → Site Activation
```

**Key Activities:**
- Database configuration based on study design
- User role assignment and access provisioning
- Site-specific customization and branding
- System validation and testing
- Site personnel training and certification

#### 1.2 Site Activation Process
```
Site Selection → Regulatory Approvals → Contract Execution → System Setup → Site Activation
```

**Components:**
- Site feasibility assessment
- Regulatory documentation verification
- Technical infrastructure validation
- User account creation and training
- Site activation ceremony and go-live

### Phase 2: Subject Enrollment & Randomization

#### 2.1 Subject Screening Workflow
```
Patient Identification → Consent Process → Screening Assessment → Eligibility Review → Enrollment Decision
```

**Screening Components:**
- Pre-screening questionnaire
- Inclusion/exclusion criteria evaluation
- Informed consent documentation
- Screening failure documentation
- Screen failure reporting

#### 2.2 Subject Enrollment Process
```
Eligibility Confirmation → Consent Documentation → Subject Registration → Randomization → Baseline Assessments
```

**Enrollment Features:**
- Automated eligibility checking
- Electronic consent management
- Unique subject numbering
- Stratified randomization support
- Baseline data collection

### Phase 3: Data Collection & Management

#### 3.1 Visit-Based Data Collection
```
Visit Scheduling → Visit Execution → Data Entry → Real-time Validation → Data Review
```

**Data Collection Features:**
- Visit window management
- Progressive form completion
- Real-time edit checking
- Partial save capabilities
- Mobile-friendly interfaces

#### 3.2 Form-Based Data Entry
```
Form Access → Field Completion → Validation → Save → Review → Lock
```

**Form Management:**
- Dynamic form rendering
- Conditional field display
- Cross-form validation
- Version control
- Form status tracking

---

## Technical Architecture

### Backend Architecture

#### Core Services Structure
```
clinprecision-datacapture-service/
├── src/main/java/com/clinprecision/datacapture/
│   ├── StudyDataCaptureServiceApplication.java
│   ├── config/
│   │   ├── DatabaseConfig.java
│   │   ├── SecurityConfig.java
│   │   ├── ValidationConfig.java
│   │   └── AuditConfig.java
│   ├── controller/
│   │   ├── SubjectController.java           # Subject management endpoints
│   │   ├── DataEntryController.java         # Form data entry APIs
│   │   ├── VisitController.java             # Visit management APIs
│   │   ├── ValidationController.java        # Data validation APIs
│   │   ├── RandomizationController.java     # Randomization services
│   │   ├── ConsentController.java           # Consent management
│   │   └── ReportingController.java         # Data export APIs
│   ├── service/
│   │   ├── subject/
│   │   │   ├── SubjectEnrollmentService.java
│   │   │   ├── SubjectManagementService.java
│   │   │   ├── ConsentManagementService.java
│   │   │   └── RandomizationService.java
│   │   ├── datacapture/
│   │   │   ├── FormDataService.java
│   │   │   ├── DataValidationService.java
│   │   │   ├── EditCheckService.java
│   │   │   ├── DataEntryService.java
│   │   │   └── FormRenderingService.java
│   │   ├── visit/
│   │   │   ├── VisitManagementService.java
│   │   │   ├── VisitSchedulingService.java
│   │   │   └── VisitTrackingService.java
│   │   ├── validation/
│   │   │   ├── RealTimeValidationService.java
│   │   │   ├── CrossFormValidationService.java
│   │   │   ├── BusinessRuleService.java
│   │   │   └── DataIntegrityService.java
│   │   ├── audit/
│   │   │   ├── AuditTrailService.java
│   │   │   ├── ChangeTrackingService.java
│   │   │   └── ComplianceMonitoringService.java
│   │   └── integration/
│   │       ├── StudyDesignIntegrationService.java
│   │       ├── CDISCODMExportService.java
│   │       └── ExternalSystemIntegrationService.java
│   ├── entity/
│   │   ├── subject/
│   │   │   ├── SubjectEntity.java
│   │   │   ├── SubjectConsentEntity.java
│   │   │   ├── SubjectDemographicsEntity.java
│   │   │   └── RandomizationEntity.java
│   │   ├── datacapture/
│   │   │   ├── FormDataEntity.java
│   │   │   ├── FormInstanceEntity.java
│   │   │   ├── FieldDataEntity.java
│   │   │   └── DataEntryLogEntity.java
│   │   ├── visit/
│   │   │   ├── VisitInstanceEntity.java
│   │   │   ├── VisitFormEntity.java
│   │   │   └── VisitScheduleEntity.java
│   │   ├── validation/
│   │   │   ├── EditCheckEntity.java
│   │   │   ├── ValidationRuleEntity.java
│   │   │   └── DataQueryEntity.java
│   │   └── audit/
│   │       ├── AuditTrailEntity.java
│   │       ├── UserSessionEntity.java
│   │       └── SystemEventEntity.java
│   ├── repository/
│   │   ├── SubjectRepository.java
│   │   ├── FormDataRepository.java
│   │   ├── VisitInstanceRepository.java
│   │   ├── EditCheckRepository.java
│   │   └── AuditTrailRepository.java
│   ├── dto/
│   │   ├── subject/
│   │   │   ├── SubjectEnrollmentDto.java
│   │   │   ├── SubjectSummaryDto.java
│   │   │   └── ConsentDto.java
│   │   ├── datacapture/
│   │   │   ├── FormDataDto.java
│   │   │   ├── FieldValueDto.java
│   │   │   └── ValidationResultDto.java
│   │   └── visit/
│   │       ├── VisitInstanceDto.java
│   │       └── VisitScheduleDto.java
│   ├── validation/
│   │   ├── validators/
│   │   │   ├── RequiredFieldValidator.java
│   │   │   ├── RangeValidator.java
│   │   │   ├── FormatValidator.java
│   │   │   ├── ConsistencyValidator.java
│   │   │   └── CustomBusinessRuleValidator.java
│   │   ├── rules/
│   │   │   ├── ValidationRule.java
│   │   │   ├── EditCheck.java
│   │   │   └── BusinessRule.java
│   │   └── engine/
│   │       ├── ValidationEngine.java
│   │       ├── RuleEngine.java
│   │       └── EditCheckEngine.java
│   └── security/
│       ├── DataAccessController.java
│       ├── AuditInterceptor.java
│       ├── EncryptionService.java
│       └── ElectronicSignatureService.java
```

### Frontend Architecture

#### Component Structure
```
frontend/clinprecision/src/components/modules/datacapture/
├── DataCaptureModule.jsx                    # Main module router
├── common/
│   ├── components/
│   │   ├── DataCaptureHeader.jsx
│   │   ├── StudyContextBanner.jsx
│   │   ├── NavigationSidebar.jsx
│   │   ├── StatusIndicators.jsx
│   │   └── ProgressTracker.jsx
│   ├── hooks/
│   │   ├── useDataCapture.js
│   │   ├── useFormValidation.js
│   │   ├── useSubjectManagement.js
│   │   └── useVisitManagement.js
│   └── utils/
│       ├── validationUtils.js
│       ├── formatUtils.js
│       └── auditUtils.js
├── subject-management/
│   ├── enrollment/
│   │   ├── SubjectEnrollmentWizard.jsx
│   │   ├── EligibilityChecker.jsx
│   │   ├── ConsentManagement.jsx
│   │   ├── RandomizationInterface.jsx
│   │   └── EnrollmentConfirmation.jsx
│   ├── management/
│   │   ├── SubjectListGrid.jsx
│   │   ├── SubjectDetails.jsx
│   │   ├── SubjectSearch.jsx
│   │   ├── SubjectFilters.jsx
│   │   └── SubjectStatusTracker.jsx
│   └── demographics/
│       ├── DemographicsForm.jsx
│       ├── MedicalHistory.jsx
│       └── BaselineCharacteristics.jsx
├── data-entry/
│   ├── forms/
│   │   ├── DynamicFormRenderer.jsx
│   │   ├── FormFieldComponents/
│   │   │   ├── TextFieldComponent.jsx
│   │   │   ├── NumberFieldComponent.jsx
│   │   │   ├── DateFieldComponent.jsx
│   │   │   ├── DropdownComponent.jsx
│   │   │   ├── CheckboxComponent.jsx
│   │   │   ├── RadioButtonComponent.jsx
│   │   │   └── FileUploadComponent.jsx
│   │   ├── FormNavigation.jsx
│   │   ├── FormValidationDisplay.jsx
│   │   └── FormProgressIndicator.jsx
│   ├── validation/
│   │   ├── RealTimeValidator.jsx
│   │   ├── EditCheckDisplay.jsx
│   │   ├── ValidationSummary.jsx
│   │   └── CrossFormValidation.jsx
│   ├── workflow/
│   │   ├── DataEntryWorkflow.jsx
│   │   ├── FormStatusManager.jsx
│   │   ├── SaveProgressManager.jsx
│   │   └── FormLockingInterface.jsx
│   └── mobile/
│       ├── MobileFormRenderer.jsx
│       ├── TouchOptimizedControls.jsx
│       └── OfflineDataManager.jsx
├── visit-management/
│   ├── scheduling/
│   │   ├── VisitScheduler.jsx
│   │   ├── VisitCalendar.jsx
│   │   ├── VisitWindows.jsx
│   │   └── ReschedulingInterface.jsx
│   ├── tracking/
│   │   ├── VisitTracker.jsx
│   │   ├── VisitCompletionStatus.jsx
│   │   ├── MissedVisitManager.jsx
│   │   └── VisitReporting.jsx
│   └── execution/
│       ├── VisitExecutionDashboard.jsx
│       ├── ProcedureChecklist.jsx
│       └── VisitSummary.jsx
├── quality-control/
│   ├── monitoring/
│   │   ├── DataQualityDashboard.jsx
│   │   ├── CompletionMetrics.jsx
│   │   ├── EditCheckSummary.jsx
│   │   └── AuditTrailViewer.jsx
│   ├── review/
│   │   ├── DataReviewInterface.jsx
│   │   ├── QueryManagement.jsx
│   │   ├── DiscrepancyResolution.jsx
│   │   └── SignOffWorkflow.jsx
│   └── reports/
│       ├── DataListings.jsx
│       ├── ComplianceReports.jsx
│       └── MetricsReports.jsx
└── administration/
    ├── site-management/
    │   ├── SiteActivation.jsx
    │   ├── UserManagement.jsx
    │   └── PermissionsManager.jsx
    ├── system-admin/
    │   ├── DatabaseManagement.jsx
    │   ├── SystemConfiguration.jsx
    │   └── MaintenanceTools.jsx
    └── compliance/
        ├── AuditTrailManager.jsx
        ├── ElectronicSignatures.jsx
        └── ValidationDocumentation.jsx
```

---

## Database Schema Design

### Subject Management Tables

```sql
-- Core subject information
CREATE TABLE subjects (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT NOT NULL,
    site_id BIGINT NOT NULL,
    subject_number VARCHAR(50) UNIQUE NOT NULL,
    subject_initials VARCHAR(10),
    screening_number VARCHAR(50),
    randomization_number VARCHAR(50),
    treatment_arm_id BIGINT,
    enrollment_date DATE,
    randomization_date DATE,
    date_of_birth DATE,
    gender ENUM('M', 'F', 'O', 'U'),
    status ENUM('PRE_SCREENING', 'SCREENING', 'SCREEN_FAILED', 'ENROLLED', 
                'RANDOMIZED', 'ACTIVE', 'COMPLETED', 'WITHDRAWN', 'LOST_TO_FOLLOWUP'),
    withdrawal_date DATE,
    withdrawal_reason VARCHAR(500),
    completion_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    last_modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_modified_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (study_id) REFERENCES studies(id),
    FOREIGN KEY (site_id) REFERENCES sites(id),
    FOREIGN KEY (treatment_arm_id) REFERENCES study_arms(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    INDEX idx_subject_study (study_id),
    INDEX idx_subject_site (site_id),
    INDEX idx_subject_status (status),
    INDEX idx_subject_number (subject_number)
);

-- Subject consent management
CREATE TABLE subject_consent (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_id BIGINT NOT NULL,
    consent_version VARCHAR(20) NOT NULL,
    consent_date DATE NOT NULL,
    consent_time TIME,
    witnessed_by VARCHAR(255),
    consent_type ENUM('INITIAL', 'RECONSENT', 'WITHDRAWAL'),
    consent_status ENUM('OBTAINED', 'WITHDRAWN', 'EXPIRED'),
    consent_document_path VARCHAR(500),
    electronic_signature BOOLEAN DEFAULT FALSE,
    signature_timestamp TIMESTAMP,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    INDEX idx_consent_subject (subject_id),
    INDEX idx_consent_date (consent_date)
);

-- Subject demographics and characteristics
CREATE TABLE subject_demographics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_id BIGINT NOT NULL UNIQUE,
    race ENUM('WHITE', 'BLACK_AFRICAN_AMERICAN', 'ASIAN', 'AMERICAN_INDIAN_ALASKA_NATIVE', 
             'NATIVE_HAWAIIAN_PACIFIC_ISLANDER', 'OTHER', 'MIXED', 'UNKNOWN'),
    ethnicity ENUM('HISPANIC_LATINO', 'NOT_HISPANIC_LATINO', 'UNKNOWN'),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(6,2),
    bmi DECIMAL(4,1) GENERATED ALWAYS AS (weight_kg / POWER(height_cm/100, 2)) STORED,
    medical_history_significant BOOLEAN,
    concomitant_medications BOOLEAN,
    allergies_known BOOLEAN,
    smoking_status ENUM('NEVER', 'FORMER', 'CURRENT', 'UNKNOWN'),
    alcohol_use ENUM('NONE', 'OCCASIONAL', 'MODERATE', 'HEAVY', 'UNKNOWN'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_modified_by BIGINT,
    
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    INDEX idx_demographics_race (race),
    INDEX idx_demographics_ethnicity (ethnicity)
);

-- Randomization records
CREATE TABLE subject_randomization (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_id BIGINT NOT NULL UNIQUE,
    study_id BIGINT NOT NULL,
    randomization_date DATE NOT NULL,
    randomization_time TIME,
    treatment_arm_id BIGINT NOT NULL,
    randomization_number VARCHAR(50) UNIQUE,
    randomization_method ENUM('SIMPLE', 'BLOCK', 'STRATIFIED', 'ADAPTIVE'),
    stratification_factors JSON,
    allocated_treatment VARCHAR(255),
    randomization_system VARCHAR(100),
    randomized_by BIGINT,
    is_emergency_unblinding BOOLEAN DEFAULT FALSE,
    unblinding_date DATE,
    unblinding_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (study_id) REFERENCES studies(id),
    FOREIGN KEY (treatment_arm_id) REFERENCES study_arms(id),
    FOREIGN KEY (randomized_by) REFERENCES users(id),
    
    INDEX idx_randomization_date (randomization_date),
    INDEX idx_randomization_arm (treatment_arm_id)
);
```

### Visit Management Tables

```sql
-- Visit instances for each subject
CREATE TABLE visit_instances (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_id BIGINT NOT NULL,
    visit_definition_id BIGINT NOT NULL,
    visit_number VARCHAR(20),
    planned_date DATE,
    actual_date DATE,
    visit_window_start DATE,
    visit_window_end DATE,
    visit_status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'CANCELLED', 'RESCHEDULED'),
    visit_type ENUM('SCREENING', 'BASELINE', 'TREATMENT', 'FOLLOW_UP', 'UNSCHEDULED', 'END_OF_STUDY'),
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    visit_notes TEXT,
    missed_reason VARCHAR(500),
    rescheduled_reason VARCHAR(500),
    original_planned_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    last_modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_modified_by BIGINT,
    
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (visit_definition_id) REFERENCES visit_definitions(id),
    
    INDEX idx_visit_subject (subject_id),
    INDEX idx_visit_definition (visit_definition_id),
    INDEX idx_visit_date (actual_date),
    INDEX idx_visit_status (visit_status),
    
    UNIQUE KEY unique_subject_visit (subject_id, visit_definition_id)
);

-- Visit procedures and assessments
CREATE TABLE visit_procedures (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    visit_instance_id BIGINT NOT NULL,
    procedure_name VARCHAR(255) NOT NULL,
    procedure_type ENUM('ASSESSMENT', 'SAMPLE_COLLECTION', 'MEDICATION', 'IMAGING', 'PROCEDURE', 'OTHER'),
    is_required BOOLEAN DEFAULT TRUE,
    completion_status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NOT_DONE', 'NOT_APPLICABLE'),
    not_done_reason VARCHAR(500),
    procedure_date DATE,
    procedure_time TIME,
    performed_by VARCHAR(255),
    procedure_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (visit_instance_id) REFERENCES visit_instances(id),
    INDEX idx_procedure_visit (visit_instance_id),
    INDEX idx_procedure_status (completion_status)
);

-- Visit deviations and issues
CREATE TABLE visit_deviations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    visit_instance_id BIGINT NOT NULL,
    deviation_type ENUM('WINDOW_DEVIATION', 'PROCEDURE_DEVIATION', 'SAFETY_ISSUE', 'PROTOCOL_VIOLATION'),
    deviation_description TEXT NOT NULL,
    deviation_date DATE,
    severity ENUM('MINOR', 'MAJOR', 'CRITICAL'),
    impact_on_study ENUM('NONE', 'MINIMAL', 'MODERATE', 'SIGNIFICANT'),
    corrective_action TEXT,
    preventive_action TEXT,
    reported_to_sponsor BOOLEAN DEFAULT FALSE,
    sponsor_notification_date DATE,
    resolution_status ENUM('OPEN', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED'),
    resolved_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    FOREIGN KEY (visit_instance_id) REFERENCES visit_instances(id),
    INDEX idx_deviation_visit (visit_instance_id),
    INDEX idx_deviation_type (deviation_type),
    INDEX idx_deviation_severity (severity)
);
```

### Form Data Management Tables

```sql
-- Form instances for data collection
CREATE TABLE form_instances (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_id BIGINT NOT NULL,
    visit_instance_id BIGINT,
    form_definition_id BIGINT NOT NULL,
    form_version VARCHAR(20) NOT NULL,
    instance_name VARCHAR(255),
    form_status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE', 'VERIFIED', 'LOCKED', 'FROZEN'),
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_required BOOLEAN DEFAULT TRUE,
    due_date DATE,
    first_entry_date DATE,
    last_entry_date DATE,
    completion_date DATE,
    verification_date DATE,
    lock_date DATE,
    entry_user_id BIGINT,
    verifier_user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_modified_by BIGINT,
    
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (visit_instance_id) REFERENCES visit_instances(id),
    FOREIGN KEY (form_definition_id) REFERENCES form_definitions(id),
    FOREIGN KEY (entry_user_id) REFERENCES users(id),
    FOREIGN KEY (verifier_user_id) REFERENCES users(id),
    
    INDEX idx_form_subject (subject_id),
    INDEX idx_form_visit (visit_instance_id),
    INDEX idx_form_definition (form_definition_id),
    INDEX idx_form_status (form_status),
    
    UNIQUE KEY unique_subject_visit_form (subject_id, visit_instance_id, form_definition_id)
);

-- Individual field data storage
CREATE TABLE form_field_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    form_instance_id BIGINT NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    field_label VARCHAR(500),
    field_value TEXT,
    field_display_value TEXT,
    field_type ENUM('TEXT', 'NUMBER', 'DATE', 'TIME', 'DATETIME', 'DROPDOWN', 'CHECKBOX', 'RADIO', 'FILE'),
    data_type ENUM('STRING', 'INTEGER', 'DECIMAL', 'DATE', 'TIME', 'BOOLEAN', 'BLOB'),
    unit_of_measure VARCHAR(50),
    is_required BOOLEAN DEFAULT FALSE,
    is_calculated BOOLEAN DEFAULT FALSE,
    calculation_formula TEXT,
    entry_sequence INT,
    entry_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    entered_by BIGINT,
    modified_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (form_instance_id) REFERENCES form_instances(id),
    FOREIGN KEY (entered_by) REFERENCES users(id),
    FOREIGN KEY (modified_by) REFERENCES users(id),
    
    INDEX idx_field_form_instance (form_instance_id),
    INDEX idx_field_name (field_name),
    INDEX idx_field_entry_time (entry_timestamp),
    
    UNIQUE KEY unique_form_field (form_instance_id, field_name)
);

-- Data change history for audit trail
CREATE TABLE form_data_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    form_field_data_id BIGINT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type ENUM('INSERT', 'UPDATE', 'DELETE', 'VERIFY', 'LOCK', 'UNLOCK'),
    change_reason ENUM('DATA_ENTRY', 'DATA_CORRECTION', 'QUERY_RESOLUTION', 'SYSTEM_UPDATE', 'MIGRATION'),
    change_comment TEXT,
    change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by BIGINT NOT NULL,
    ip_address VARCHAR(45),
    session_id VARCHAR(255),
    is_electronic_signature BOOLEAN DEFAULT FALSE,
    signature_hash VARCHAR(512),
    
    FOREIGN KEY (form_field_data_id) REFERENCES form_field_data(id),
    FOREIGN KEY (changed_by) REFERENCES users(id),
    
    INDEX idx_history_field (form_field_data_id),
    INDEX idx_history_timestamp (change_timestamp),
    INDEX idx_history_user (changed_by)
);
```

### Validation and Edit Check Tables

```sql
-- Edit check definitions
CREATE TABLE edit_check_definitions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT,
    form_definition_id BIGINT,
    field_name VARCHAR(255),
    check_name VARCHAR(255) NOT NULL,
    check_type ENUM('REQUIRED', 'RANGE', 'FORMAT', 'LOGICAL', 'CONSISTENCY', 'CUSTOM'),
    check_description TEXT,
    validation_rule TEXT NOT NULL,
    error_message TEXT,
    severity ENUM('ERROR', 'WARNING', 'INFO'),
    is_blocking BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    FOREIGN KEY (study_id) REFERENCES studies(id),
    FOREIGN KEY (form_definition_id) REFERENCES form_definitions(id),
    
    INDEX idx_edit_check_study (study_id),
    INDEX idx_edit_check_form (form_definition_id),
    INDEX idx_edit_check_field (field_name)
);

-- Edit check execution results
CREATE TABLE edit_check_results (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    form_field_data_id BIGINT NOT NULL,
    edit_check_definition_id BIGINT NOT NULL,
    check_result ENUM('PASS', 'FAIL', 'WARNING', 'NOT_APPLICABLE'),
    error_message TEXT,
    check_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_timestamp TIMESTAMP,
    resolution_comment TEXT,
    resolved_by BIGINT,
    is_waived BOOLEAN DEFAULT FALSE,
    waiver_reason TEXT,
    waived_by BIGINT,
    waived_at TIMESTAMP,
    
    FOREIGN KEY (form_field_data_id) REFERENCES form_field_data(id),
    FOREIGN KEY (edit_check_definition_id) REFERENCES edit_check_definitions(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id),
    FOREIGN KEY (waived_by) REFERENCES users(id),
    
    INDEX idx_check_result_field (form_field_data_id),
    INDEX idx_check_result_definition (edit_check_definition_id),
    INDEX idx_check_result_status (check_result),
    INDEX idx_check_timestamp (check_timestamp)
);

-- Data queries for manual review
CREATE TABLE data_queries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    study_id BIGINT NOT NULL,
    subject_id BIGINT,
    form_instance_id BIGINT,
    form_field_data_id BIGINT,
    query_type ENUM('AUTO_GENERATED', 'MANUAL', 'SYSTEM', 'MEDICAL_REVIEW'),
    query_category ENUM('MISSING_DATA', 'INCONSISTENT_DATA', 'OUT_OF_RANGE', 'CLARIFICATION', 
                       'MEDICAL_QUERY', 'PROTOCOL_DEVIATION', 'SAFETY_QUERY'),
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    query_status ENUM('OPEN', 'ANSWERED', 'CLOSED', 'CANCELLED', 'DEFERRED'),
    query_text TEXT NOT NULL,
    response_text TEXT,
    resolution_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    assigned_to BIGINT,
    answered_at TIMESTAMP,
    answered_by BIGINT,
    closed_at TIMESTAMP,
    closed_by BIGINT,
    due_date DATE,
    escalation_level INT DEFAULT 1,
    is_critical BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (study_id) REFERENCES studies(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (form_instance_id) REFERENCES form_instances(id),
    FOREIGN KEY (form_field_data_id) REFERENCES form_field_data(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    
    INDEX idx_query_study (study_id),
    INDEX idx_query_subject (subject_id),
    INDEX idx_query_status (query_status),
    INDEX idx_query_priority (priority),
    INDEX idx_query_created (created_at)
);
```

---

## Implementation Phases

### Phase 1: Foundation & Infrastructure (Weeks 1-4)

#### Week 1: Database & Security Foundation
**Objectives:**
- Set up database schema for core tables
- Implement security and authentication
- Establish audit trail infrastructure

**Deliverables:**
- Complete database schema implementation
- User authentication and authorization
- Basic audit trail capture
- Security configuration (encryption, access controls)

**Technical Tasks:**
```sql
-- Database setup tasks
1. Create all core tables (subjects, visits, forms, audit)
2. Set up foreign key relationships and constraints
3. Create indexes for performance optimization
4. Implement database triggers for audit trail
5. Configure database connection pooling
6. Set up backup and recovery procedures
```

#### Week 2: Core Subject Management
**Objectives:**
- Implement subject enrollment workflows
- Create basic subject management interfaces
- Set up randomization infrastructure

**Deliverables:**
- Subject enrollment service and APIs
- Basic subject list and detail views
- Randomization service foundation
- Consent management infrastructure

**Backend Tasks:**
```java
// Key service implementations
@Service
public class SubjectEnrollmentService {
    // Subject eligibility checking
    public EligibilityResult checkEligibility(Long studyId, EligibilityDto criteria)
    
    // Subject enrollment
    public SubjectDto enrollSubject(SubjectEnrollmentDto enrollmentData)
    
    // Randomization
    public RandomizationResult randomizeSubject(Long subjectId, RandomizationRequest request)
}

@Service
public class ConsentManagementService {
    // Consent documentation
    public ConsentDto documentConsent(ConsentDto consent)
    
    // Consent verification
    public boolean verifyConsent(Long subjectId, String consentVersion)
}
```

#### Week 3: Form Infrastructure
**Objectives:**
- Implement dynamic form rendering engine
- Create form data storage and retrieval
- Set up basic validation framework

**Deliverables:**
- Dynamic form rendering service
- Form data CRUD operations
- Basic field validation
- Form status management

**Frontend Components:**
```jsx
// Core form components
const DynamicFormRenderer = ({ formDefinition, formData, onSave }) => {
  // Render forms based on JSON definition
  // Handle field interactions
  // Manage form state
}

const FormFieldComponent = ({ field, value, onChange, validation }) => {
  // Individual field rendering
  // Real-time validation display
  // Field-specific interactions
}
```

#### Week 4: Visit Management Foundation
**Objectives:**
- Implement visit scheduling and tracking
- Create visit instance management
- Set up visit completion workflows

**Deliverables:**
- Visit scheduling service
- Visit instance CRUD operations
- Basic visit tracking interface
- Visit window calculations

### Phase 2: Core Data Entry & Validation (Weeks 5-8)

#### Week 5: Advanced Form Features
**Objectives:**
- Implement conditional logic and dependencies
- Add calculated fields and formulas
- Create advanced field types (file upload, signature)

**Deliverables:**
- Conditional field display logic
- Calculated field engine
- File upload and management
- Advanced field validation

**Key Features:**
```javascript
// Conditional logic engine
class ConditionalLogicEngine {
  evaluateCondition(condition, formData) {
    // Parse and evaluate conditional expressions
    // Support for complex logical operations
    // Dynamic field show/hide
  }
  
  updateFieldVisibility(formData, conditions) {
    // Update form UI based on conditions
    // Handle field dependencies
  }
}

// Calculation engine
class CalculationEngine {
  executeCalculation(formula, formData) {
    // Parse mathematical expressions
    // Support for date/time calculations
    // Cross-field calculations
  }
}
```

#### Week 6: Real-time Validation System
**Objectives:**
- Implement comprehensive edit check engine
- Create real-time validation feedback
- Set up cross-form validation

**Deliverables:**
- Edit check execution engine
- Real-time validation display
- Cross-form consistency checks
- Validation error management

**Validation Framework:**
```java
@Component
public class ValidationEngine {
    public ValidationResult validateField(FieldValidationRequest request) {
        List<ValidationResult> results = new ArrayList<>();
        
        // Required field validation
        if (field.isRequired() && isEmpty(field.getValue())) {
            results.add(createError("Field is required"));
        }
        
        // Range validation
        if (field.hasRange() && !isInRange(field.getValue(), field.getRange())) {
            results.add(createError("Value out of range"));
        }
        
        // Format validation
        if (field.hasFormat() && !matchesFormat(field.getValue(), field.getFormat())) {
            results.add(createError("Invalid format"));
        }
        
        // Custom business rules
        results.addAll(executeCustomRules(field, request.getFormData()));
        
        return ValidationResult.builder()
            .isValid(results.stream().noneMatch(r -> r.getSeverity() == ERROR))
            .validationErrors(results)
            .build();
    }
}
```

#### Week 7: Data Quality & Edit Checks
**Objectives:**
- Implement automated edit check execution
- Create query generation system
- Set up data quality monitoring

**Deliverables:**
- Automated edit check processing
- Query generation and management
- Data quality dashboard
- Edit check resolution workflows

#### Week 8: Mobile & Offline Support
**Objectives:**
- Optimize UI for mobile devices
- Implement offline data entry
- Create data synchronization

**Deliverables:**
- Mobile-responsive form interfaces
- Offline data storage (IndexedDB)
- Data synchronization service
- Conflict resolution handling

**Mobile Features:**
```jsx
// Mobile-optimized form component
const MobileFormRenderer = ({ formDefinition, isOffline }) => {
  const [offlineData, setOfflineData] = useLocalStorage('formData');
  const [syncStatus, setSyncStatus] = useState('offline');
  
  const handleSave = useCallback(async (formData) => {
    if (isOffline) {
      // Save to local storage
      setOfflineData(formData);
      showNotification('Data saved offline');
    } else {
      // Sync with server
      try {
        await syncFormData(formData);
        setSyncStatus('synced');
      } catch (error) {
        // Fall back to offline storage
        setOfflineData(formData);
        setSyncStatus('pending');
      }
    }
  }, [isOffline]);
  
  return (
    <div className="mobile-form">
      <SyncStatusIndicator status={syncStatus} />
      <FormRenderer onSave={handleSave} />
    </div>
  );
};
```

### Phase 3: Advanced Features & Workflows (Weeks 9-12)

#### Week 9: Advanced Visit Management
**Objectives:**
- Implement visit window management
- Create advanced scheduling features
- Set up visit deviation tracking

**Deliverables:**
- Visit window calculation engine
- Advanced visit scheduling
- Visit deviation management
- Visit compliance reporting

#### Week 10: Data Review & Approval Workflows
**Objectives:**
- Implement data review workflows
- Create approval and sign-off processes
- Set up role-based data access

**Deliverables:**
- Data review interface
- Multi-level approval workflows
- Electronic signature integration
- Review status tracking

#### Week 11: Advanced Reporting & Export
**Objectives:**
- Implement data export capabilities
- Create standard reports
- Set up CDISC ODM export

**Deliverables:**
- Data export service (multiple formats)
- Standard report templates
- CDISC ODM export functionality
- Custom report builder

#### Week 12: Performance & Optimization
**Objectives:**
- Optimize database queries
- Implement caching strategies
- Performance testing and tuning

**Deliverables:**
- Query optimization
- Caching implementation
- Performance monitoring
- Load testing results

### Phase 4: Integration & Testing (Weeks 13-16)

#### Week 13: Study Design Integration
**Objectives:**
- Integrate with study design module
- Implement form binding synchronization
- Create design change propagation

**Deliverables:**
- Study design service integration
- Form definition synchronization
- Visit definition integration
- Design change handling

#### Week 14: Quality Control Integration
**Objectives:**
- Integrate with quality control systems
- Implement query management
- Set up monitoring dashboards

**Deliverables:**
- Query management integration
- Quality metrics calculation
- Monitoring dashboard
- Alert systems

#### Week 15: Comprehensive Testing
**Objectives:**
- Execute comprehensive test suite
- Performance and load testing
- Security and compliance testing

**Deliverables:**
- Unit test coverage (>90%)
- Integration test suite
- Performance test results
- Security audit report

#### Week 16: Documentation & Training
**Objectives:**
- Complete system documentation
- Create user training materials
- Prepare deployment documentation

**Deliverables:**
- Technical documentation
- User manuals and guides
- Training materials
- Deployment procedures

---

## Quality Assurance & Validation

### Computer System Validation (CSV)
Following FDA 21 CFR Part 11 and GAMP 5 guidelines:

#### Validation Documentation
```
Validation Master Plan (VMP)
├── User Requirements Specification (URS)
├── Functional Specification (FS)
├── Design Specification (DS)
├── Installation Qualification (IQ)
├── Operational Qualification (OQ)
├── Performance Qualification (PQ)
└── Traceability Matrix
```

#### Test Categories
- **Unit Testing**: Individual component validation
- **Integration Testing**: Module interaction validation
- **System Testing**: End-to-end workflow validation
- **User Acceptance Testing**: Business requirement validation
- **Performance Testing**: Load and stress testing
- **Security Testing**: Vulnerability and penetration testing

### Data Integrity (ALCOA+)
- **Attributable**: All data attributed to specific users
- **Legible**: Data readable and understandable
- **Contemporaneous**: Data recorded at time of activity
- **Original**: First recording or certified true copy
- **Accurate**: Data free from errors
- **Complete**: All data captured and retained
- **Consistent**: Data follows established procedures
- **Enduring**: Data preserved for required retention period
- **Available**: Data accessible for review and inspection

---

## Deployment Strategy

### Environment Setup
```
Development → Testing → Staging → Production
     ↓         ↓        ↓         ↓
   Unit Tests  Integration  UAT   Monitoring
   Code Review   Tests     Load   Maintenance
                          Tests
```

### Infrastructure Requirements

#### Production Environment
- **Application Servers**: 3+ nodes with load balancing
- **Database**: MySQL cluster with replication
- **Storage**: Encrypted file storage with backup
- **Monitoring**: Comprehensive application and infrastructure monitoring
- **Security**: WAF, DDoS protection, intrusion detection

#### Backup & Disaster Recovery
- **Daily Backups**: Automated database and file backups
- **Point-in-Time Recovery**: Transaction log backups
- **Geographic Replication**: Multi-region disaster recovery
- **Recovery Testing**: Regular DR procedure testing

---

## Success Metrics & KPIs

### Technical Performance
- **Response Time**: < 2 seconds for form loading
- **Data Entry Speed**: 50% faster than paper-based
- **System Availability**: 99.9% uptime
- **Data Accuracy**: 99.99% accuracy with validation

### User Adoption
- **User Training**: 95% completion rate
- **System Usage**: 90% daily active users
- **User Satisfaction**: 4.5/5 rating
- **Support Tickets**: < 5% users requiring support

### Compliance & Quality
- **Audit Readiness**: 100% compliance with 21 CFR Part 11
- **Data Integrity**: Zero critical data integrity issues
- **Query Resolution**: 90% queries resolved within 48 hours
- **Edit Check Accuracy**: 95% accurate validation

### Business Impact
- **Study Startup**: 30% faster database build
- **Data Collection**: 40% faster data entry
- **Query Resolution**: 50% faster query turnaround
- **Regulatory Submissions**: 25% faster preparation

---

This comprehensive implementation plan provides a roadmap for building an industry-standard EDC system that meets all regulatory requirements while providing superior user experience and operational efficiency. The phased approach ensures systematic development with continuous validation and testing throughout the implementation process.