-- ClinPrecision Database Schema
-- Consolidated script with all tables properly defined
-- Last updated: September 6, 2025

-- Database and user setup
CREATE USER 'clinprecadmin'@'localhost' IDENTIFIED BY 'passw0rd';
CREATE DATABASE clinprecisiondb;
GRANT ALL PRIVILEGES ON clinprecisiondb.* TO 'clinprecadmin'@'localhost';
USE clinprecisiondb;

-- Core user management tables
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    encrypted_password VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(50) COMMENT 'Professional title (e.g., Dr., Prof.)',
    organization_id BIGINT COMMENT 'Primary organization affiliation',
    profession VARCHAR(100) COMMENT 'Professional designation (e.g., MD, RN, PhD)',
    phone VARCHAR(50) COMMENT 'Contact phone number',
    mobile_phone VARCHAR(50) COMMENT 'Mobile phone number',
    address_line1 VARCHAR(255) COMMENT 'Address line 1',
    address_line2 VARCHAR(255) COMMENT 'Address line 2',
    city VARCHAR(100) COMMENT 'City',
    state VARCHAR(100) COMMENT 'State or province',
    postal_code VARCHAR(20) COMMENT 'Postal or ZIP code',
    country VARCHAR(100) COMMENT 'Country',
    status ENUM('active', 'inactive', 'pending', 'locked') DEFAULT 'pending' COMMENT 'User account status',
    last_login_at TIMESTAMP NULL COMMENT 'Last login timestamp',
    password_reset_required BOOLEAN DEFAULT TRUE COMMENT 'Whether password reset is required at next login',
    notes TEXT COMMENT 'Administrative notes about the user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp'
);

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT COMMENT 'Role description',
    is_system_role BOOLEAN DEFAULT FALSE COMMENT 'Whether this is a system-defined role',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE authorities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);

CREATE TABLE roles_authorities (
    roles_id BIGINT NOT NULL,
    authorities_id BIGINT NOT NULL,
    PRIMARY KEY (roles_id, authorities_id),
    FOREIGN KEY (roles_id) REFERENCES roles(id),
    FOREIGN KEY (authorities_id) REFERENCES authorities(id)
);

CREATE TABLE users_roles (
    users_id BIGINT NOT NULL,
    roles_id BIGINT NOT NULL,
    PRIMARY KEY (users_id, roles_id),
    FOREIGN KEY (users_id) REFERENCES users(id),
    FOREIGN KEY (roles_id) REFERENCES roles(id)
);

-- Organization related tables
CREATE TABLE organization_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Organization type name (e.g., Sponsor, CRO, Site, Vendor, Laboratory)',
	code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Organization type Code',
    description TEXT COMMENT 'Description of the organization type',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE organizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Organization name',
    external_id VARCHAR(100) COMMENT 'External identifier for the organization',
    address_line1 VARCHAR(255) COMMENT 'Address line 1',
    address_line2 VARCHAR(255) COMMENT 'Address line 2',
    city VARCHAR(100) COMMENT 'City',
    state VARCHAR(100) COMMENT 'State or province',
    postal_code VARCHAR(20) COMMENT 'Postal or ZIP code',
    country VARCHAR(100) COMMENT 'Country',
    phone VARCHAR(50) COMMENT 'Main phone number',
    email VARCHAR(120) COMMENT 'Main email address',
    website VARCHAR(255) COMMENT 'Organization website',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active' COMMENT 'Organization status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add foreign key for users to organizations after both tables exist
ALTER TABLE users
ADD FOREIGN KEY (organization_id) REFERENCES organizations(id);

CREATE TABLE organization_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    title VARCHAR(100) COMMENT 'Contact person title',
    department VARCHAR(100) COMMENT 'Department within organization',
    email VARCHAR(120) COMMENT 'Contact email',
    phone VARCHAR(50) COMMENT 'Contact phone',
    is_primary BOOLEAN DEFAULT FALSE COMMENT 'Whether this is the primary contact',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- User types and classifications
CREATE TABLE user_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'User type name (e.g., CRA, PI, CRC, DM)',
    description TEXT COMMENT 'Description of the user type',
	code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique code for the user type',
    category VARCHAR(50) NOT NULL COMMENT 'Category of the user type',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE users_user_types (
    users_id BIGINT NOT NULL,
    user_types_id BIGINT NOT NULL,
    PRIMARY KEY (users_id, user_types_id),
    FOREIGN KEY (users_id) REFERENCES users(id),
    FOREIGN KEY (user_types_id) REFERENCES user_types(id)
);

-- =====================================================
-- 1. STUDY STATUS LOOKUP TABLE
-- =====================================================
CREATE TABLE study_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE COMMENT 'Short code for the status (e.g., DRAFT, ACTIVE)',
    name VARCHAR(200) NOT NULL UNIQUE COMMENT 'Display name for the status',
    description TEXT COMMENT 'Detailed description of the status',
    display_order INTEGER NOT NULL COMMENT 'Order for UI display (lower numbers first)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this status is currently active/selectable',
    allows_modification BOOLEAN DEFAULT TRUE COMMENT 'Whether studies in this status can be modified',
    is_final_status BOOLEAN DEFAULT FALSE COMMENT 'Whether this is a terminal status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_study_status_code (code),
    INDEX idx_study_status_active (is_active),
    INDEX idx_study_status_display_order (display_order)
);

-- =====================================================
-- 2. REGULATORY STATUS LOOKUP TABLE
-- =====================================================
CREATE TABLE regulatory_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE COMMENT 'Short code for regulatory status (e.g., PENDING_APPROVAL, APPROVED)',
    name VARCHAR(200) NOT NULL UNIQUE COMMENT 'Display name for regulatory status',
    description TEXT COMMENT 'Detailed description of the regulatory status',
    display_order INTEGER NOT NULL COMMENT 'Order for UI display (lower numbers first)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this status is currently active/selectable',
    requires_documentation BOOLEAN DEFAULT FALSE COMMENT 'Whether this status requires supporting documentation',
    allows_enrollment BOOLEAN DEFAULT FALSE COMMENT 'Whether patient enrollment is allowed in this status',
    regulatory_category ENUM('PRE_SUBMISSION', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN') 
        NOT NULL COMMENT 'High-level categorization of regulatory status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_regulatory_status_code (code),
    INDEX idx_regulatory_status_category (regulatory_category),
    INDEX idx_regulatory_status_active (is_active),
    INDEX idx_regulatory_status_display_order (display_order)
);

-- =====================================================
-- 3. STUDY PHASE LOOKUP TABLE
-- =====================================================
CREATE TABLE study_phase (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE COMMENT 'Short code for the phase (e.g., PHASE_I, PHASE_II)',
    name VARCHAR(200) NOT NULL UNIQUE COMMENT 'Display name for the phase',
    description TEXT COMMENT 'Detailed description of the study phase',
    display_order INTEGER NOT NULL COMMENT 'Order for UI display (lower numbers first)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this phase is currently active/selectable',
    typical_duration_months INTEGER COMMENT 'Typical duration in months for this phase',
    typical_patient_count_min INTEGER COMMENT 'Typical minimum number of patients for this phase',
    typical_patient_count_max INTEGER COMMENT 'Typical maximum number of patients for this phase',
    phase_category ENUM('PRECLINICAL', 'EARLY_PHASE', 'EFFICACY', 'REGISTRATION', 'POST_MARKET') 
        NOT NULL COMMENT 'High-level categorization of study phase',
    requires_ide BOOLEAN DEFAULT FALSE COMMENT 'Whether this phase typically requires IDE (Investigational Device Exemption)',
    requires_ind BOOLEAN DEFAULT FALSE COMMENT 'Whether this phase typically requires IND (Investigational New Drug)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_study_phase_code (code),
    INDEX idx_study_phase_category (phase_category),
    INDEX idx_study_phase_active (is_active),
    INDEX idx_study_phase_display_order (display_order)
);

CREATE TABLE IF NOT EXISTS form_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique template identifier (e.g., DEMO-001)',
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) COMMENT 'Template category (Demographics, Safety, Laboratory, etc.)',
    version VARCHAR(20) DEFAULT '1.0',
    is_latest_version BOOLEAN DEFAULT TRUE,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    -- Store the entire field structure including metadata in JSON
    fields JSON NOT NULL COMMENT 'Array of field definitions with metadata',
    tags TEXT COMMENT 'Comma-separated tags for searching/filtering',
    usage_count INT DEFAULT 0 COMMENT 'Number of times template has been used',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_template_category (category),
    INDEX idx_template_status (status),
    INDEX idx_template_latest (is_latest_version)
);

-- Create form template versions table for version history
CREATE TABLE IF NOT EXISTS form_template_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_id BIGINT NOT NULL,
    version VARCHAR(20) NOT NULL,
    version_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    version_notes TEXT,
    fields_snapshot JSON NOT NULL COMMENT 'Snapshot of fields at this version',
    FOREIGN KEY (template_id) REFERENCES form_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY unique_template_version (template_id, version)
);

-- =====================================================
-- 4. FOREIGN KEY RELATIONSHIPS (Optional - for future enhancement)
-- =====================================================
-- Note: These can be added later when refactoring the studies table to use lookup tables

-- Example of how to add foreign keys to studies table:
-- ALTER TABLE studies ADD COLUMN study_status_id BIGINT;
-- ALTER TABLE studies ADD COLUMN regulatory_status_id BIGINT;  
-- ALTER TABLE studies ADD COLUMN study_phase_id BIGINT;
-- 
-- ALTER TABLE studies ADD FOREIGN KEY (study_status_id) REFERENCES study_status(id);
-- ALTER TABLE studies ADD FOREIGN KEY (regulatory_status_id) REFERENCES regulatory_status(id);
-- ALTER TABLE studies ADD FOREIGN KEY (study_phase_id) REFERENCES study_phase(id);

-- =====================================================
-- 5. AUDIT LOG TABLE (Optional - for tracking changes)
-- =====================================================
CREATE TABLE study_lookup_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL COMMENT 'Name of the lookup table that was modified',
    record_id BIGINT NOT NULL COMMENT 'ID of the record that was modified',
    action_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL COMMENT 'Type of action performed',
    old_values JSON COMMENT 'Previous values (for UPDATE and DELETE)',
    new_values JSON COMMENT 'New values (for INSERT and UPDATE)',
    modified_by BIGINT COMMENT 'User ID who made the change',
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_audit_table_record (table_name, record_id),
    INDEX idx_audit_modified_at (modified_at),
    FOREIGN KEY (modified_by) REFERENCES users(id)
);

-- Study related tables
CREATE TABLE studies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sponsor VARCHAR(255),
    protocol_number VARCHAR(100),
    version VARCHAR(20) DEFAULT '1.0',
    is_latest_version BOOLEAN DEFAULT TRUE,
    parent_version_id VARCHAR(36) DEFAULT NULL,
    version_notes TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
	indication VARCHAR(500) COMMENT 'Medical indication or condition being studied',
	study_type VARCHAR(50) DEFAULT 'INTERVENTIONAL' COMMENT 'Type of study: INTERVENTIONAL, OBSERVATIONAL, etc.',
	principal_investigator VARCHAR(255) COMMENT 'Name of the principal investigator',
	sites INTEGER DEFAULT 0 COMMENT 'Number of study sites',
	planned_subjects INTEGER DEFAULT 0 COMMENT 'Number of planned subjects for enrollment',
	enrolled_subjects INTEGER DEFAULT 0 COMMENT 'Number of currently enrolled subjects',
	target_enrollment INTEGER DEFAULT 0 COMMENT 'Target enrollment number',
	primary_objective TEXT COMMENT 'Primary objective of the study',
	amendments INTEGER DEFAULT 0 COMMENT 'Number of amendments made to the study',
	study_status_id BIGINT NULL COMMENT 'References study_status.id',
    regulatory_status_id BIGINT NULL COMMENT 'References regulatory_status.id',
    study_phase_id BIGINT NULL COMMENT 'References study_phase.id',
    metadata JSON,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	modified_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_studies_study_status FOREIGN KEY (study_status_id)   REFERENCES study_status(id),
    CONSTRAINT fk_studies_regulatory_status FOREIGN KEY (regulatory_status_id) REFERENCES regulatory_status(id),
	CONSTRAINT fk_studies_study_phase FOREIGN KEY (study_phase_id) REFERENCES study_phase(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);


CREATE TABLE study_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    version VARCHAR(20) NOT NULL,
    version_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    version_notes TEXT,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE organization_studies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    study_id BIGINT NOT NULL,
    role ENUM('SPONSOR', 'CRO', 'SITE', 'VENDOR', 'LABORATORY', 'REGULATORY', 'STATISTICS', 'SAFETY') NOT NULL COMMENT 'Role of the organization in the study',
	is_primary BOOLEAN DEFAULT FALSE COMMENT 'Whether this organization is primary for its role',
    start_date DATE COMMENT 'Start date of organization involvement',
    end_date DATE COMMENT 'End date of organization involvement',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    UNIQUE KEY (organization_id, study_id, role)
);

-- Study arms
CREATE TABLE study_arms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    randomization_ratio INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
);

-- Sites and visits
CREATE TABLE sites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL COMMENT 'Reference to the parent organization',
    site_number VARCHAR(50) NOT NULL COMMENT 'Site identifier within the study',
    study_id BIGINT NOT NULL COMMENT 'Reference to the study',
    principal_investigator_id BIGINT COMMENT 'Reference to the principal investigator user',
    status ENUM('pending', 'active', 'suspended', 'closed') DEFAULT 'pending',
    activation_date DATE COMMENT 'Date when site was activated',
    deactivation_date DATE COMMENT 'Date when site was deactivated',
    max_subjects INT COMMENT 'Maximum number of subjects allowed at this site',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    UNIQUE KEY (site_number, study_id)
);

CREATE TABLE visit_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    arm_id BIGINT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    timepoint INT NOT NULL,  -- Days from baseline (can be negative for screening)
    window_before INT DEFAULT 0,
    window_after INT DEFAULT 0,
    visit_type ENUM('screening', 'baseline', 'treatment', 'follow_up', 'unscheduled') DEFAULT 'treatment',
    is_required BOOLEAN DEFAULT TRUE,
    sequence_number INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (arm_id) REFERENCES study_arms(id) ON DELETE SET NULL
);

-- Form definitions
CREATE TABLE form_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
	form_type VARCHAR(100) NULL COMMENT 'Form Type of the form (Demographics, Safety, etc.)',
    version VARCHAR(20) DEFAULT '1.0',
    is_latest_version BOOLEAN DEFAULT TRUE,
    parent_version_id VARCHAR(36) DEFAULT NULL,
    version_notes TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'approved', 'retired') DEFAULT 'draft',
    template_id BIGINT NULL COMMENT 'Reference to form_templates table for template-based forms',
	template_version VARCHAR(36) NULL COMMENT 'Version of template used when form was created',
	tags TEXT NULL COMMENT 'Comma-separated tags for searching/filtering',
    -- Store the entire field structure including metadata in JSON
    fields JSON NOT NULL COMMENT 'Array of field definitions with metadata. Each field has a ONE-TO-ONE relationship with its metadata.',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
	CONSTRAINT fk_form_template FOREIGN KEY (template_id) REFERENCES form_templates(id) ON DELETE SET NULL
);

CREATE TABLE form_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_id BIGINT NOT NULL,
    version VARCHAR(20) NOT NULL,
    version_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    version_notes TEXT,
    FOREIGN KEY (form_id) REFERENCES form_definitions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE visit_forms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    visit_definition_id BIGINT NOT NULL,
    form_definition_id BIGINT NOT NULL,
    sequence_number INT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    update_reason VARCHAR(255),
    FOREIGN KEY (visit_definition_id) REFERENCES visit_definitions(id) ON DELETE CASCADE,
    FOREIGN KEY (form_definition_id) REFERENCES form_definitions(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id),
    UNIQUE KEY (visit_definition_id, form_definition_id)
);

-- Subjects and data entry
CREATE TABLE subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    protocol_subject_id VARCHAR(100) NOT NULL,
    study_id BIGINT NOT NULL,
    arm_id BIGINT,
    enrollment_date DATE NOT NULL,
    status ENUM('screening', 'active', 'completed', 'withdrawn', 'screen_failed') DEFAULT 'screening',
    withdrawal_reason TEXT,
    demographics JSON,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id),
    FOREIGN KEY (arm_id) REFERENCES study_arms(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY (protocol_subject_id, study_id)
);

CREATE TABLE subject_visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT NOT NULL,
    visit_definition_id BIGINT NOT NULL,
    scheduled_date DATE,
    actual_date DATE,
    status ENUM('scheduled', 'in_progress', 'completed', 'missed', 'not_applicable') DEFAULT 'scheduled',
    completion_notes TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (visit_definition_id) REFERENCES visit_definitions(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE form_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT NOT NULL,
    subject_visit_id BIGINT NOT NULL,
    form_definition_id BIGINT NOT NULL,
    form_version BIGINT NOT NULL,
    uses_latest_form_version BOOLEAN DEFAULT TRUE,
    status ENUM('not_started', 'incomplete', 'complete', 'signed', 'locked', 'superseded') DEFAULT 'not_started',
    data JSON COMMENT 'The actual form data values keyed by field ID',
    entry_reason VARCHAR(255),
    form_version_used VARCHAR(255),
    created_by BIGINT,
    updated_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    signed_by BIGINT,
    signed_at TIMESTAMP NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_visit_id) REFERENCES subject_visits(id) ON DELETE CASCADE,
    FOREIGN KEY (form_definition_id) REFERENCES form_definitions(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    FOREIGN KEY (signed_by) REFERENCES users(id),
    UNIQUE KEY (subject_visit_id, form_definition_id)
);

CREATE TABLE form_data_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_data_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    subject_visit_id BIGINT NOT NULL,
    form_definition_id BIGINT NOT NULL,
    form_version VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    data JSON,
    changed_by BIGINT,
    change_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_type ENUM('create', 'update', 'sign', 'lock', 'unlock', 'version_upgrade') NOT NULL,
    change_reason TEXT,
    FOREIGN KEY (form_data_id) REFERENCES form_data(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Quality control and verification
CREATE TABLE field_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_data_id BIGINT NOT NULL,
    field_id VARCHAR(100) NOT NULL,
    verification_type ENUM('sdv', 'medical_review', 'data_review') NOT NULL,
    status ENUM('pending', 'verified', 'queried', 'resolved') DEFAULT 'pending',
    verified_by BIGINT,
    verified_at TIMESTAMP NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (form_data_id) REFERENCES form_data(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id),
    UNIQUE KEY (form_data_id, field_id, verification_type)
);

-- Data queries
CREATE TABLE data_queries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_data_id BIGINT NOT NULL,
    field_id VARCHAR(100),
    query_text TEXT NOT NULL,
    status ENUM('open', 'answered', 'closed') DEFAULT 'open',
    created_by BIGINT NOT NULL,
    assigned_to BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    closed_by BIGINT,
    FOREIGN KEY (form_data_id) REFERENCES form_data(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (closed_by) REFERENCES users(id)
);

CREATE TABLE query_responses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    query_id BIGINT NOT NULL,
    response_text TEXT NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES data_queries(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- User-study relationships
CREATE TABLE user_study_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    study_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    site_id BIGINT COMMENT 'Optional site assignment',
    start_date DATE NOT NULL COMMENT 'Start date of role assignment',
    end_date DATE COMMENT 'End date of role assignment',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
    UNIQUE KEY (user_id, study_id, role_id, site_id)
);

CREATE TABLE user_site_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    site_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE COMMENT 'End date of assignment',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    UNIQUE KEY (user_id, site_id, role_id)
);

-- Patient users
CREATE TABLE patient_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT 'Reference to base user record',
    subject_id BIGINT COMMENT 'Optional link to subject record',
    consent_status ENUM('pending', 'consented', 'withdrawn') DEFAULT 'pending',
    consent_date DATE COMMENT 'Date when consent was provided',
    device_id VARCHAR(255) COMMENT 'ID of patient device if applicable',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- Delegation and qualifications
CREATE TABLE data_delegations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    delegator_id BIGINT NOT NULL COMMENT 'User delegating the responsibility',
    delegatee_id BIGINT NOT NULL COMMENT 'User receiving the responsibility',
    delegation_type ENUM('data_entry', 'review', 'query_resolution', 'signature') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE COMMENT 'End date of delegation',
    reason TEXT COMMENT 'Reason for delegation',
    status ENUM('active', 'revoked', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (delegator_id) REFERENCES users(id),
    FOREIGN KEY (delegatee_id) REFERENCES users(id)
);

CREATE TABLE user_qualifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    qualification_type ENUM('training', 'certification', 'license', 'education') NOT NULL,
    name VARCHAR(255) NOT NULL COMMENT 'Name of qualification',
    issuer VARCHAR(255) COMMENT 'Issuing organization',
    identifier VARCHAR(100) COMMENT 'Certificate/license number',
    issue_date DATE COMMENT 'Date of issuance',
    expiry_date DATE COMMENT 'Expiration date if applicable',
    attachment_url VARCHAR(512) COMMENT 'URL to certificate document',
    verified BOOLEAN DEFAULT FALSE COMMENT 'Whether qualification has been verified',
    verified_by BIGINT COMMENT 'User who verified the qualification',
    verified_at TIMESTAMP NULL COMMENT 'When verification occurred',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Audit and logging tables
CREATE TABLE audit_trail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    field_name VARCHAR(100),
    old_value JSON,
    new_value JSON,
    change_type ENUM('create', 'update', 'delete', 'sign', 'verify', 'query') NOT NULL,
    reason TEXT,
    performed_by BIGINT NOT NULL,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

CREATE TABLE user_audit_trail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT 'User whose data was changed',
    field_name VARCHAR(100) NOT NULL COMMENT 'Field that was changed',
    old_value TEXT COMMENT 'Previous value',
    new_value TEXT COMMENT 'New value',
    changed_by BIGINT NOT NULL COMMENT 'User who made the change',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the change was made',
    reason TEXT COMMENT 'Reason for the change',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE TABLE organization_audit_trail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by BIGINT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE TABLE locking_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entity_id VARCHAR(36) NOT NULL COMMENT 'ID of the entity (study or form) that was locked/unlocked',
    entity_type VARCHAR(50) NOT NULL COMMENT 'Type of entity (STUDY or FORM)',
    operation VARCHAR(20) NOT NULL COMMENT 'Operation performed (LOCK or UNLOCK)',
    reason TEXT COMMENT 'Reason provided for the operation',
    user_id BIGINT NOT NULL COMMENT 'ID of the user who performed the operation',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when the operation was performed',
    INDEX idx_entity_id (entity_id),
    INDEX idx_entity_type (entity_type),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(100) NOT NULL COMMENT 'Unique session identifier',
    ip_address VARCHAR(50) COMMENT 'IP address of the session',
    user_agent TEXT COMMENT 'Browser/device information',
    login_at TIMESTAMP NOT NULL COMMENT 'Login timestamp',
    logout_at TIMESTAMP NULL COMMENT 'Logout timestamp',
    session_status ENUM('active', 'expired', 'logged_out') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id)
);


ALTER TABLE study_status COMMENT = 'Lookup table for study lifecycle status values';
ALTER TABLE regulatory_status COMMENT = 'Lookup table for regulatory approval status values';
ALTER TABLE study_phase COMMENT = 'Lookup table for clinical study phase values';
ALTER TABLE study_lookup_audit COMMENT = 'Audit trail for changes to lookup table values';

-- Create indexes for common query patterns
CREATE INDEX idx_form_definitions_study ON form_definitions(study_id);
CREATE INDEX idx_subjects_study ON subjects(study_id);
CREATE INDEX idx_subject_visits_subject ON subject_visits(subject_id);
CREATE INDEX idx_form_data_subject ON form_data(subject_id);
CREATE INDEX idx_form_data_visit ON form_data(subject_visit_id);
CREATE INDEX idx_field_verifications_form ON field_verifications(form_data_id);
CREATE INDEX idx_data_queries_form ON data_queries(form_data_id);
CREATE INDEX idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_sites_study ON sites(study_id);
CREATE INDEX idx_sites_organization ON sites(organization_id);
CREATE INDEX idx_user_study_roles_user ON user_study_roles(user_id);
CREATE INDEX idx_user_study_roles_study ON user_study_roles(study_id);
CREATE INDEX idx_user_study_roles_site ON user_study_roles(site_id);
CREATE INDEX idx_user_site_assignments_user ON user_site_assignments(user_id);
CREATE INDEX idx_user_site_assignments_site ON user_site_assignments(site_id);
CREATE INDEX idx_patient_users_subject ON patient_users(subject_id);
-- Create index for efficient querying of primary organizations
CREATE INDEX idx_organization_studies_primary ON organization_studies(study_id, role, is_primary);
CREATE INDEX idx_studies_sponsor ON studies(sponsor);
CREATE INDEX idx_studies_indication ON studies(indication);
CREATE INDEX idx_studies_created_at ON studies(created_at);
CREATE INDEX idx_studies_updated_at ON studies(updated_at);
CREATE INDEX idx_studies_study_status_id ON studies(study_status_id);
CREATE INDEX idx_studies_regulatory_status_id ON studies(regulatory_status_id);
CREATE INDEX idx_studies_study_phase_id ON studies(study_phase_id);
-- Add template_id column to form_definitions table to link study forms to templates
CREATE INDEX idx_form_template ON form_definitions(template_id);
CREATE INDEX idx_form_status ON form_definitions(status);


-- Insert default user types


-- Remaining role-authority assignments can be added as needed

-- Define triggers for form data history
DELIMITER //

CREATE TRIGGER after_form_data_update
AFTER UPDATE ON form_data
FOR EACH ROW
BEGIN
  DECLARE change_type VARCHAR(20);
  
  IF OLD.status != NEW.status THEN
    IF NEW.status = 'signed' THEN
      SET change_type = 'sign';
    ELSEIF NEW.status = 'locked' THEN
      SET change_type = 'lock';
    ELSEIF OLD.status = 'locked' AND NEW.status != 'locked' THEN
      SET change_type = 'unlock';
    ELSE
      SET change_type = 'update';
    END IF;
  ELSEIF OLD.form_definition_id != NEW.form_definition_id OR OLD.form_version != NEW.form_version THEN
    SET change_type = 'version_upgrade';
  ELSE
    SET change_type = 'update';
  END IF;
  
  INSERT INTO form_data_history (
    id, form_data_id, subject_id, subject_visit_id, 
    form_definition_id, form_version, status, data,
    changed_by, change_timestamp, change_type, change_reason
  )
  VALUES (
    UUID(), NEW.id, NEW.subject_id, NEW.subject_visit_id,
    NEW.form_definition_id, NEW.form_version, NEW.status, NEW.data,
    NEW.updated_by, NOW(), change_type, NEW.entry_reason
  );
END //

CREATE TRIGGER after_form_data_insert
AFTER INSERT ON form_data
FOR EACH ROW
BEGIN
  INSERT INTO form_data_history (
    id, form_data_id, subject_id, subject_visit_id, 
    form_definition_id, form_version, status, data,
    changed_by, change_timestamp, change_type, change_reason
  )
  VALUES (
    UUID(), NEW.id, NEW.subject_id, NEW.subject_visit_id,
    NEW.form_definition_id, NEW.form_version, NEW.status, NEW.data,
    NEW.created_by, NOW(), 'create', NEW.entry_reason
  );
END //

DELIMITER ;
