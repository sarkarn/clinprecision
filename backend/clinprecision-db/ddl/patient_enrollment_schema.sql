-- Patient Enrollment Database Schema
-- Following established ClinPrecision patterns with aggregate_uuid columns

-- Patient Registration table
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_uuid VARCHAR(255) UNIQUE COMMENT 'UUID used by Axon Framework as aggregate identifier',
    patient_number VARCHAR(50) NOT NULL COMMENT 'Human-readable patient identifier',
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY') NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    status ENUM('REGISTERED', 'SCREENED', 'ELIGIBLE', 'INELIGIBLE', 'WITHDRAWN') DEFAULT 'REGISTERED',
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_patients_aggregate_uuid (aggregate_uuid),
    INDEX idx_patients_patient_number (patient_number),
    INDEX idx_patients_email (email),
    INDEX idx_patients_status (status),
    INDEX idx_patients_created_at (created_at)
) COMMENT 'Patient registration records for clinical trials';


-- Patient Enrollment table (many-to-many: patients can be enrolled in multiple studies)
CREATE TABLE IF NOT EXISTS patient_enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_uuid VARCHAR(255) UNIQUE COMMENT 'UUID used by Axon Framework as aggregate identifier',
    enrollment_number VARCHAR(50) NOT NULL COMMENT 'Human-readable enrollment identifier',
    patient_id BIGINT NOT NULL,
    patient_aggregate_uuid VARCHAR(255) NOT NULL COMMENT 'Reference to patient aggregate',
    study_id BIGINT NOT NULL,
    study_site_id BIGINT NOT NULL,
    site_aggregate_uuid VARCHAR(255) NOT NULL COMMENT 'Reference to site aggregate',
    screening_number VARCHAR(50) NOT NULL,
    enrollment_date DATE NOT NULL,
    enrollment_status ENUM('ENROLLED', 'SCREENING', 'ELIGIBLE', 'INELIGIBLE', 'WITHDRAWN', 'COMPLETED') DEFAULT 'ENROLLED',
    eligibility_confirmed BOOLEAN DEFAULT FALSE,
    eligibility_confirmed_by VARCHAR(255),
    eligibility_confirmed_at TIMESTAMP NULL,
    ineligibility_reason TEXT,
    enrolled_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (study_id) REFERENCES studies(id),
    FOREIGN KEY (study_site_id) REFERENCES site_studies(id),
    
    INDEX idx_enrollments_aggregate_uuid (aggregate_uuid),
    INDEX idx_enrollments_patient (patient_id),
    INDEX idx_enrollments_patient_uuid (patient_aggregate_uuid),
    INDEX idx_enrollments_study (study_id),
    INDEX idx_enrollments_site (study_site_id),
    INDEX idx_enrollments_site_uuid (site_aggregate_uuid),
    INDEX idx_enrollments_status (enrollment_status),
    INDEX idx_enrollments_screening_number (screening_number),
    INDEX idx_enrollments_enrollment_date (enrollment_date),
    
    UNIQUE KEY uk_screening_number (screening_number),
    UNIQUE KEY uk_patient_study_enrollment (patient_id, study_id)
) COMMENT 'Patient enrollment records linking patients to specific studies and sites';

-- Patient Eligibility Assessments (detailed eligibility tracking)
CREATE TABLE IF NOT EXISTS patient_eligibility_assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id BIGINT NOT NULL,
    enrollment_aggregate_uuid VARCHAR(255) NOT NULL,
    assessment_type ENUM('INCLUSION', 'EXCLUSION', 'GENERAL') NOT NULL,
    criterion_description TEXT NOT NULL,
    is_met BOOLEAN NOT NULL,
    assessment_notes TEXT,
    assessed_by VARCHAR(255) NOT NULL,
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (enrollment_id) REFERENCES patient_enrollments(id),
    
    INDEX idx_eligibility_enrollment (enrollment_id),
    INDEX idx_eligibility_enrollment_uuid (enrollment_aggregate_uuid),
    INDEX idx_eligibility_type (assessment_type),
    INDEX idx_eligibility_assessed_at (assessed_at)
) COMMENT 'Detailed eligibility assessments for patient enrollments';

-- Patient Demographics (extended patient information)
CREATE TABLE IF NOT EXISTS patient_demographics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL UNIQUE,
    patient_aggregate_uuid VARCHAR(255) NOT NULL,
    race VARCHAR(100),
    ethnicity VARCHAR(100),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(6,2),
    bmi DECIMAL(4,1) GENERATED ALWAYS AS (weight_kg / POWER(height_cm/100, 2)) STORED,
    blood_type VARCHAR(10),
    medical_record_number VARCHAR(50),
    insurance_information JSON,
    emergency_contact JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    
    INDEX idx_demographics_patient_uuid (patient_aggregate_uuid),
    INDEX idx_demographics_race (race),
    INDEX idx_demographics_ethnicity (ethnicity)
) COMMENT 'Extended demographic information for patients';

-- Audit trail for patient enrollment events (for FDA 21 CFR Part 11 compliance)
CREATE TABLE IF NOT EXISTS patient_enrollment_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    entity_aggregate_uuid VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    old_values JSON COMMENT 'Previous values before change',
    new_values JSON COMMENT 'New values after change',
    performed_by VARCHAR(255) NOT NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    reason TEXT,
    
    INDEX idx_audit_entity_type (entity_type),
    INDEX idx_audit_entity_id (entity_id),
    INDEX idx_audit_entity_uuid (entity_aggregate_uuid),
    INDEX idx_audit_action (action_type),
    INDEX idx_audit_performed_at (performed_at),
    INDEX idx_audit_performed_by (performed_by)
) COMMENT 'Complete audit trail for patient enrollment activities';

