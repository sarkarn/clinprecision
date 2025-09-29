-- ClinPrecision Database Schema
-- Consolidated script with all tables properly defined
-- Last updated: September 6, 2025

-- Database and user setup
CREATE USER 'clinprecadmin'@'localhost' IDENTIFIED BY 'passw0rd';
CREATE DATABASE clinprecisiondb;
GRANT ALL PRIVILEGES ON clinprecisiondb.* TO 'clinprecadmin'@'localhost';
USE clinprecisiondb;


-- ===================================================================
-- Code Lists Schema
-- Central management of all application code list values
-- ===================================================================

-- Main code lists table
CREATE TABLE code_lists (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(100) NOT NULL COMMENT 'Category of the code list (e.g., AMENDMENT_TYPE, STUDY_STATUS)',
    code VARCHAR(100) NOT NULL COMMENT 'The code value (e.g., MAJOR, ACTIVE)',
    display_name VARCHAR(200) NOT NULL COMMENT 'Human-readable display name',
    description TEXT COMMENT 'Detailed description of the code',
    sort_order INT DEFAULT 0 COMMENT 'Display sort order',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this code is currently active',
    system_code BOOLEAN DEFAULT FALSE COMMENT 'System codes that cannot be modified',
    parent_code_id BIGINT COMMENT 'For hierarchical code lists',
    metadata JSON COMMENT 'Additional metadata (colors, permissions, etc.)',
    valid_from DATE COMMENT 'Valid from date',
    valid_to DATE COMMENT 'Valid to date (null = indefinite)',
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version_number INT DEFAULT 1 COMMENT 'For optimistic locking',
    
    -- Indexes
    UNIQUE KEY uk_code_lists_category_code (category, code),
    INDEX idx_code_lists_category (category),
    INDEX idx_code_lists_active (is_active),
    INDEX idx_code_lists_sort (category, sort_order),
    INDEX idx_code_lists_parent (parent_code_id),
    
    -- Foreign key constraint for hierarchical relationships
    FOREIGN KEY (parent_code_id) REFERENCES code_lists(id) ON DELETE CASCADE
)COMMENT='Central repository for all application code lists';

-- Audit table for code list changes
CREATE TABLE code_lists_audit (
    audit_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code_list_id BIGINT NOT NULL,
    operation_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON COMMENT 'Previous values before change',
    new_values JSON COMMENT 'New values after change',
    changed_by BIGINT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT COMMENT 'Reason for the change',
    
    INDEX idx_audit_code_list (code_list_id),
    INDEX idx_audit_changed_at (changed_at),
    INDEX idx_audit_changed_by (changed_by)
) COMMENT='Audit trail for code list changes';

-- Translation table for multi-language support (future enhancement)
CREATE TABLE code_list_translations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code_list_id BIGINT NOT NULL,
    language_code VARCHAR(10) NOT NULL DEFAULT 'en',
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_translation_code_lang (code_list_id, language_code),
    FOREIGN KEY (code_list_id) REFERENCES code_lists(id) ON DELETE CASCADE
)COMMENT='Multi-language translations for code lists';

-- Application usage tracking (which modules use which code lists)
CREATE TABLE code_list_usage (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(100) NOT NULL,
    application_module VARCHAR(100) NOT NULL COMMENT 'Module/service name',
    usage_type ENUM('DROPDOWN', 'VALIDATION', 'DISPLAY', 'FILTER') NOT NULL,
    field_name VARCHAR(100) COMMENT 'Field/property name where used',
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_usage_category_module_field (category, application_module, field_name),
    FOREIGN KEY (category) REFERENCES code_lists(category) ON DELETE CASCADE
) COMMENT='Tracks which modules use which code lists';

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

CREATE TABLE sites (
	  id bigint NOT NULL AUTO_INCREMENT,
	  aggregate_uuid VARCHAR(255);
	  organization_id bigint NOT NULL COMMENT 'Reference to the parent organization',
	  site_number varchar(255) DEFAULT NULL,
	  principal_investigator_id bigint DEFAULT NULL COMMENT 'Reference to the principal investigator user',
	  status enum('pending','active','suspended','closed') DEFAULT 'pending',
	  activation_date date DEFAULT NULL COMMENT 'Date when site was activated',
	  deactivation_date date DEFAULT NULL COMMENT 'Date when site was deactivated',
	  max_subjects int DEFAULT NULL COMMENT 'Maximum number of subjects allowed at this site',
	  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	  updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	  address_line1 varchar(255) DEFAULT NULL,
	  address_line2 varchar(255) DEFAULT NULL,
	  city varchar(255) DEFAULT NULL,
	  country varchar(255) DEFAULT NULL,
	  email varchar(255) DEFAULT NULL,
	  name varchar(255) NOT NULL,
	  phone varchar(255) DEFAULT NULL,
	  postal_code varchar(255) DEFAULT NULL,
	  state varchar(255) DEFAULT NULL,
	  PRIMARY KEY (id),
	  UNIQUE KEY site_number (site_number,study_id),
	  UNIQUE KEY idx_sites_aggregate_uuid (aggregate_uuid),
	  CONSTRAINT FKxrbt6mjphi09w4pgiwyuispo FOREIGN KEY (principal_investigator_id) REFERENCES users (id),
	  CONSTRAINT sites_ibfk_1 FOREIGN KEY (organization_id) REFERENCES organizations (id)
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
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
    -- Store the entire field structure including metadata in JSON
    fields JSON NOT NULL COMMENT 'Array of field definitions with metadata',
	structure JSON COMMENT 'Organized layout/structure of form fields',
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
	therapeutic_area VARCHAR(255) COMMENT 'Therapeutic area or medical specialty',
	study_coordinator VARCHAR(255) COMMENT 'Study coordinator name',
	active_sites INTEGER DEFAULT 0 COMMENT 'Number of active study sites',
	total_sites INTEGER DEFAULT 0 COMMENT 'Total number of study sites',
	screened_subjects INTEGER DEFAULT 0 COMMENT 'Number of screened subjects',
	randomized_subjects INTEGER DEFAULT 0 COMMENT 'Number of randomized subjects',
	completed_subjects INTEGER DEFAULT 0 COMMENT 'Number of subjects who completed the study',
	withdrawn_subjects INTEGER DEFAULT 0 COMMENT 'Number of withdrawn subjects',
	enrollment_rate DECIMAL(5,2) COMMENT 'Enrollment rate percentage',
	screening_success_rate DECIMAL(5,2) COMMENT 'Screening success rate percentage',
	first_patient_in_date DATE COMMENT 'Date of first patient enrollment',
	last_patient_in_date DATE COMMENT 'Date of last patient enrollment',
	estimated_completion_date DATE COMMENT 'Estimated study completion date',
	primary_endpoint TEXT COMMENT 'Primary endpoint description',
	secondary_endpoints JSON COMMENT 'JSON array of secondary endpoints',
	inclusion_criteria JSON COMMENT 'JSON array of inclusion criteria',
	exclusion_criteria JSON COMMENT 'JSON array of exclusion criteria',
	recent_activities JSON COMMENT 'JSON array of recent study activities',
	timeline JSON COMMENT 'JSON object containing study timeline data',
	study_duration_weeks INTEGER COMMENT 'Planned study duration in weeks',
	data_lock_date DATE COMMENT 'Date when data was locked',
	database_lock_status ENUM('open', 'soft_lock', 'hard_lock') DEFAULT 'open' COMMENT 'Database lock status',
	monitoring_visits_completed INTEGER DEFAULT 0 COMMENT 'Number of monitoring visits completed',
	adverse_events_reported INTEGER DEFAULT 0 COMMENT 'Number of adverse events reported',
	protocol_deviations INTEGER DEFAULT 0 COMMENT 'Number of protocol deviations',
	queries_open INTEGER DEFAULT 0 COMMENT 'Number of open data queries',
	queries_resolved INTEGER DEFAULT 0 COMMENT 'Number of resolved data queries',
	sdv_percentage DECIMAL(5,2) COMMENT 'Source data verification percentage',
	recruitment_status ENUM('not_started', 'recruiting', 'completed', 'suspended') DEFAULT 'not_started' COMMENT 'Patient recruitment status',
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
    version_number VARCHAR(20) NOT NULL,
    status ENUM('DRAFT', 'UNDER_REVIEW', 'SUBMITTED', 'APPROVED', 'ACTIVE', 'SUPERSEDED', 'WITHDRAWN') NOT NULL DEFAULT 'DRAFT',
    amendment_type ENUM('MAJOR', 'MINOR', 'SAFETY', 'ADMINISTRATIVE') NULL,
    amendment_reason TEXT NULL,
    description TEXT NULL,
    changes_summary TEXT NULL,
    impact_assessment TEXT NULL,
    previous_version_id BIGINT NULL,
    created_by BIGINT NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_by BIGINT NULL,
    approved_date DATETIME NULL,
    effective_date DATE NULL,
    requires_regulatory_approval BOOLEAN DEFAULT FALSE,
    notify_stakeholders BOOLEAN DEFAULT TRUE,
    additional_notes TEXT NULL,
    protocol_changes JSON NULL,
    icf_changes JSON NULL,
    regulatory_submissions JSON NULL,
    review_comments JSON NULL,
    metadata JSON NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicate version numbers per study
    UNIQUE KEY uk_study_version_number (study_id, version_number),
    
    -- Foreign key constraints
    CONSTRAINT fk_study_versions_study_id FOREIGN KEY (study_id) REFERENCES studies (id) ON DELETE CASCADE,
    CONSTRAINT fk_study_versions_previous_version FOREIGN KEY (previous_version_id) REFERENCES study_versions (id) ON DELETE SET NULL,
    CONSTRAINT fk_study_versions_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_study_versions_approved_by FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL
);


CREATE TABLE study_amendments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_version_id BIGINT NOT NULL,
    amendment_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    amendment_type ENUM('MAJOR', 'MINOR', 'SAFETY', 'ADMINISTRATIVE') NOT NULL,
    reason TEXT NULL,
    section_affected VARCHAR(100) NULL,
    change_details TEXT NULL,
    justification TEXT NULL,
    impact_on_subjects BOOLEAN DEFAULT FALSE,
    requires_consent_update BOOLEAN DEFAULT FALSE,
    requires_regulatory_notification BOOLEAN DEFAULT FALSE,
    status ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'IMPLEMENTED', 'REJECTED', 'WITHDRAWN') NOT NULL DEFAULT 'DRAFT',
    submitted_by BIGINT NULL,
    submitted_date DATETIME NULL,
    reviewed_by BIGINT NULL,
    reviewed_date DATETIME NULL,
    approved_by BIGINT NULL,
    approved_date DATETIME NULL,
    review_comments TEXT NULL,
    created_by BIGINT NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    metadata JSON NULL,
    

    -- Unique constraint for amendment numbers within a version
    UNIQUE KEY uk_amendment_number_per_version (study_version_id, amendment_number),
    
    -- Foreign key constraints
    CONSTRAINT fk_study_amendments_version_id FOREIGN KEY (study_version_id) REFERENCES study_versions (id) ON DELETE CASCADE,
    CONSTRAINT fk_study_amendments_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_study_amendments_submitted_by FOREIGN KEY (submitted_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_study_amendments_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_study_amendments_approved_by FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL
);

-- Create study_design_progress table
CREATE TABLE study_design_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key',
    study_id BIGINT NOT NULL COMMENT 'Foreign key to studies table',
    phase VARCHAR(50) NOT NULL COMMENT 'Design phase name (basic-info, arms, visits, forms, review, publish, revisions)',
    completed BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether this phase is completed',
    percentage INT NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100) COMMENT 'Completion percentage (0-100)',
    notes TEXT COMMENT 'Optional notes about the phase progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    created_by BIGINT COMMENT 'User who created this record',
    updated_by BIGINT COMMENT 'User who last updated this record',
    
    -- Constraints
    UNIQUE KEY unique_study_phase (study_id, phase),
    FOREIGN KEY fk_design_progress_study (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY fk_design_progress_created_by (created_by) REFERENCES users(id),
    FOREIGN KEY fk_design_progress_updated_by (updated_by) REFERENCES users(id)
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

-- Study Documents Table (MVP Version)
CREATE TABLE study_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL COMMENT 'Reference to studies table',
    name VARCHAR(255) NOT NULL COMMENT 'Display name of the document',
    document_type VARCHAR(50) NOT NULL COMMENT 'Type of document (Protocol, ICF, IB, CRF, etc.)',
    file_name VARCHAR(255) NOT NULL COMMENT 'Original filename',
    file_path VARCHAR(500) NOT NULL COMMENT 'Path to stored file',
    file_size BIGINT NOT NULL COMMENT 'File size in bytes',
    mime_type VARCHAR(100) COMMENT 'MIME type of the file',
    version VARCHAR(50) DEFAULT '1.0' COMMENT 'Document version',
    status ENUM('DRAFT', 'CURRENT', 'SUPERSEDED', 'ARCHIVED') DEFAULT 'CURRENT' COMMENT 'Document status',
    description TEXT COMMENT 'Document description',
    uploaded_by BIGINT NOT NULL COMMENT 'User who uploaded the document',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Upload timestamp',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp',
    
    -- Foreign key constraints
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    
    -- Indexes for performance
    INDEX idx_study_documents_study_id (study_id),
    INDEX idx_study_documents_type (document_type),
    INDEX idx_study_documents_status (status),
    INDEX idx_study_documents_uploaded_at (uploaded_at)
) COMMENT 'Store study documents and their metadata';

-- Document audit trail for tracking changes
CREATE TABLE study_document_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL COMMENT 'Reference to study_documents table',
    action_type ENUM('UPLOAD', 'DOWNLOAD', 'UPDATE', 'DELETE', 'STATUS_CHANGE') NOT NULL COMMENT 'Type of action performed',
    old_values JSON COMMENT 'Previous values (for updates)',
    new_values JSON COMMENT 'New values (for updates)',
    performed_by BIGINT NOT NULL COMMENT 'User who performed the action',
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the action was performed',
    ip_address VARCHAR(45) COMMENT 'IP address of the user',
    user_agent TEXT COMMENT 'Browser/client information',
    notes TEXT COMMENT 'Additional notes about the action',
    
    -- Foreign key constraints
    FOREIGN KEY (document_id) REFERENCES study_documents(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id),
    
    -- Indexes for performance
    INDEX idx_document_audit_document_id (document_id),
    INDEX idx_document_audit_performed_at (performed_at),
    INDEX idx_document_audit_action_type (action_type)
) COMMENT 'Audit trail for document management actions';

-- Study arms
CREATE TABLE study_arms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'TREATMENT',
    sequence_number INTEGER NOT NULL,
    planned_subjects INTEGER DEFAULT 0,
    study_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
    
    -- Foreign key constraint to studies table
    CONSTRAINT fk_study_arms_study_id FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    
    -- Unique constraint on study_id and sequence_number
	CONSTRAINT chk_study_arms_type CHECK (type IN ('TREATMENT', 'PLACEBO', 'CONTROL', 'ACTIVE_COMPARATOR')),
    CONSTRAINT uk_study_arms_study_sequence UNIQUE (study_id, sequence_number),
    CONSTRAINT chk_study_arms_sequence CHECK (sequence_number > 0),
    CONSTRAINT chk_study_arms_planned_subjects CHECK (planned_subjects >= 0)
);

CREATE TABLE study_interventions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'DRUG',
    dosage VARCHAR(255),
    frequency VARCHAR(255),
    route VARCHAR(255),
    study_arm_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
    
    -- Foreign key constraint to study_arms table
    CONSTRAINT fk_interventions_study_arm_id FOREIGN KEY (study_arm_id) REFERENCES study_arms(id) ON DELETE CASCADE,
    
    -- Check constraints for data integrity
    CONSTRAINT chk_interventions_type CHECK (type IN ('DRUG', 'DEVICE', 'PROCEDURE', 'BEHAVIORAL', 'OTHER'))
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
    visit_type ENUM('SCREENING', 'BASELINE', 'TREATMENT', 'FOLLOW_UP', 'UNSCHEDULED', 'END_OF_STUDY') DEFAULT 'TREATMENT',
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
    status ENUM('DRAFT', 'APPROVED', 'RETIRED') DEFAULT 'DRAFT',
    template_id BIGINT NULL COMMENT 'Reference to form_templates table for template-based forms',
	template_version VARCHAR(36) NULL COMMENT 'Version of template used when form was created',
	tags TEXT NULL COMMENT 'Comma-separated tags for searching/filtering',
    -- Store the entire field structure including metadata in JSON
    fields JSON NOT NULL COMMENT 'Array of field definitions with metadata. Each field has a ONE-TO-ONE relationship with its metadata.',
	structure JSON COMMENT 'Organized layout/structure of form fields (matching form_templates structure)',
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
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version_notes TEXT,
    FOREIGN KEY (form_id) REFERENCES form_definitions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE visit_forms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    visit_definition_id BIGINT NOT NULL,
    form_definition_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    is_conditional BOOLEAN DEFAULT FALSE,
    conditional_logic TEXT COMMENT 'JSON or expression for conditional forms',
    display_order INT DEFAULT 1 COMMENT 'Order for display in UI',
    instructions TEXT COMMENT 'Specific instructions for this form in this visit',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    update_reason VARCHAR(255),
    FOREIGN KEY (visit_definition_id) REFERENCES visit_definitions(id) ON DELETE CASCADE,
    FOREIGN KEY (form_definition_id) REFERENCES form_definitions(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id),
    UNIQUE KEY (visit_definition_id, form_definition_id)
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


CREATE TABLE study_database_builds (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    build_request_id VARCHAR(100) UNIQUE NOT NULL,
    build_status ENUM('IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'IN_PROGRESS',
    build_start_time TIMESTAMP NULL,
    build_end_time TIMESTAMP NULL,
    requested_by BIGINT NOT NULL,
    build_configuration LONGTEXT COMMENT 'JSON configuration for the build',
    validation_results LONGTEXT COMMENT 'JSON validation results',
    error_details LONGTEXT COMMENT 'Error details if build failed',
    tables_created INT DEFAULT 0 COMMENT 'Number of tables created',
    indexes_created INT DEFAULT 0 COMMENT 'Number of indexes created',
    triggers_created INT DEFAULT 0 COMMENT 'Number of triggers created',
    forms_configured INT DEFAULT 0 COMMENT 'Number of forms configured in form_definitions table',
    validation_rules_created INT DEFAULT 0 COMMENT 'Number of validation rules created',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id),
    
    -- Indexes for performance
    INDEX idx_study_db_builds_study (study_id),
    INDEX idx_study_db_builds_status (build_status),
    INDEX idx_study_db_builds_requested_by (requested_by),
    INDEX idx_study_db_builds_start_time (build_start_time),
    INDEX idx_study_db_builds_request_id (build_request_id)
) COMMENT='Tracks database build processes for clinical studies';

-- Study Validation Rules table
-- Note: References form_definitions from consolidated schema instead of redundant study_form_definitions
CREATE TABLE study_validation_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    form_definition_id BIGINT,
    rule_name VARCHAR(255) NOT NULL,
    rule_type ENUM('REQUIRED', 'RANGE', 'FORMAT', 'LOGICAL', 'CONSISTENCY', 'CROSS_FORM', 'CUSTOM', 'BUSINESS_RULE') NOT NULL,
    field_name VARCHAR(255) COMMENT 'Target field name',
    rule_expression LONGTEXT NOT NULL COMMENT 'Rule expression or logic',
    error_message TEXT NOT NULL,
    warning_message TEXT,
    severity ENUM('ERROR', 'WARNING', 'INFO') DEFAULT 'ERROR',
    is_blocking BOOLEAN DEFAULT FALSE COMMENT 'Whether this rule blocks form completion',
    is_active BOOLEAN DEFAULT TRUE,
    execution_order INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    
    -- Foreign key constraints
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (form_definition_id) REFERENCES form_definitions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    
    -- Indexes
    INDEX idx_validation_rules_study (study_id),
    INDEX idx_validation_rules_form (form_definition_id),
    INDEX idx_validation_rules_field (field_name),
    INDEX idx_validation_rules_type (rule_type),
    INDEX idx_validation_rules_active (is_active)
) COMMENT='Validation rules for study forms and fields - references form_definitions from consolidated schema';

-- Study Database Configuration table
CREATE TABLE study_database_configurations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL UNIQUE,
    database_schema_version VARCHAR(20) NOT NULL,
    performance_settings LONGTEXT COMMENT 'JSON performance configuration',
    audit_settings LONGTEXT COMMENT 'JSON audit trail configuration',
    compliance_settings LONGTEXT COMMENT 'JSON compliance configuration (21 CFR Part 11, etc.)',
    backup_settings LONGTEXT COMMENT 'JSON backup and recovery configuration',
    security_settings LONGTEXT COMMENT 'JSON security configuration',
    estimated_subject_count INT,
    estimated_form_instances INT,
    estimated_data_points BIGINT,
    storage_estimate_gb DECIMAL(10,2),
    is_validated BOOLEAN DEFAULT FALSE,
    validation_date TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    configured_by BIGINT NOT NULL,
    
    -- Foreign key constraints
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (configured_by) REFERENCES users(id),
    
    -- Indexes
    INDEX idx_db_config_study (study_id),
    INDEX idx_db_config_validation (is_validated),
    INDEX idx_db_config_active (is_active)
) COMMENT='Database configuration settings for studies';

-- Study Database Validation History table
CREATE TABLE study_database_validations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    validation_type ENUM('SCHEMA', 'DATA_INTEGRITY', 'PERFORMANCE', 'COMPLIANCE', 'SYSTEM_READINESS', 'FULL') NOT NULL,
    validation_status ENUM('PASSED', 'FAILED', 'WARNING') NOT NULL,
    validation_results LONGTEXT COMMENT 'JSON validation results and details',
    error_count INT DEFAULT 0,
    warning_count INT DEFAULT 0,
    validation_duration_seconds INT,
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validated_by BIGINT NOT NULL,
    
    -- Foreign key constraints
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (validated_by) REFERENCES users(id),
    
    -- Indexes
    INDEX idx_db_validations_study (study_id),
    INDEX idx_db_validations_type (validation_type),
    INDEX idx_db_validations_status (validation_status),
    INDEX idx_db_validations_date (validated_at)
) COMMENT='Database validation history and results';

-- Study Build Notifications table (for tracking build status notifications)
CREATE TABLE study_build_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    build_request_id VARCHAR(100) NOT NULL,
    notification_type ENUM('BUILD_STARTED', 'BUILD_COMPLETED', 'BUILD_FAILED', 'VALIDATION_COMPLETED', 'VALIDATION_FAILED') NOT NULL,
    recipient_user_id BIGINT NOT NULL,
    notification_message TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (build_request_id) REFERENCES study_database_builds(build_request_id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_user_id) REFERENCES users(id),
    
    -- Indexes
    INDEX idx_build_notifications_request (build_request_id),
    INDEX idx_build_notifications_recipient (recipient_user_id),
    INDEX idx_build_notifications_sent (is_sent)
) COMMENT='Notifications related to database build processes';

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
-- Create indexes for performance optimization
CREATE INDEX idx_study_arms_study_id ON study_arms(study_id);
CREATE INDEX idx_study_arms_sequence ON study_arms(study_id, sequence_number);
CREATE INDEX idx_study_arms_type ON study_arms(type);
CREATE INDEX idx_study_interventions_study_arm_id ON study_interventions(study_arm_id);
CREATE INDEX idx_study_interventions_type ON study_interventions(type);
 -- Indexes for performance
CREATE INDEX idx_design_progress_study_id ON study_design_progress (study_id);
CREATE INDEX idx_design_progress_phase ON study_design_progress (phase);
CREATE INDEX idx_design_progress_completed ON study_design_progress (completed);
CREATE INDEX idx_design_progress_updated_at ON study_design_progress (updated_at);
CREATE INDEX idx_studies_therapeutic_area ON studies(therapeutic_area);
CREATE INDEX idx_studies_study_coordinator ON studies(study_coordinator);
CREATE INDEX idx_studies_enrollment_rate ON studies(enrollment_rate);
CREATE INDEX idx_studies_recruitment_status ON studies(recruitment_status);
CREATE INDEX idx_studies_database_lock_status ON studies(database_lock_status);
CREATE INDEX idx_studies_first_patient_in ON studies(first_patient_in_date);
CREATE INDEX idx_studies_estimated_completion ON studies(estimated_completion_date);

    -- Indexes for performance
CREATE INDEX idx_study_versions_study_id ON study_versions(study_id);
CREATE INDEX idx_study_versions_status ON study_versions(status);
CREATE INDEX idx_study_versions_version_number ON study_versions(version_number);
CREATE INDEX idx_study_versions_created_date ON study_versions(created_date);
CREATE INDEX idx_study_versions_effective_date ON study_versions(effective_date);
-- Indexes for performance
CREATE INDEX idx_study_amendments_version_id ON study_amendments(study_version_id);
CREATE INDEX idx_study_amendments_status ON study_amendments(status);
CREATE INDEX idx_study_amendments_amendment_number ON study_amendments(amendment_number);
CREATE INDEX idx_study_amendments_created_date ON study_amendments(created_date);
CREATE INDEX idx_study_amendments_type ON study_amendments(amendment_type);

-- Additional composite indexes for common query patterns
CREATE INDEX idx_study_versions_study_status ON study_versions (study_id, status);
CREATE INDEX idx_study_versions_status_type ON study_versions (status, amendment_type);
CREATE INDEX idx_study_versions_created_by_date ON study_versions (created_by, created_date);
CREATE INDEX idx_study_amendments_version_status ON study_amendments (study_version_id, status);
CREATE INDEX idx_study_amendments_type_status ON study_amendments (amendment_type, status);
CREATE INDEX idx_study_amendments_safety_status ON study_amendments (amendment_type, status, requires_regulatory_notification);


-- Create indexes for performance
-- Create indexes for performance
-- Note: Using CAST to convert JSON extracted value to VARCHAR for indexing
CREATE INDEX idx_code_lists_color ON code_lists((CAST(JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.color')) AS CHAR(100))));
CREATE INDEX idx_code_lists_valid_date ON code_lists(valid_from, valid_to);


