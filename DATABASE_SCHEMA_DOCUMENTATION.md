# ClinPrecision Database Schema Documentation

## Overview
The ClinPrecision database schema is designed to support comprehensive clinical trial management, including user management, study design, data capture, and regulatory compliance. Built on MySQL with a normalized relational design optimized for clinical research workflows.

## Database Configuration

### Connection Details
```sql
CREATE USER 'clinprecadmin'@'localhost' IDENTIFIED BY 'passw0rd';
CREATE DATABASE clinprecisiondb;
GRANT ALL PRIVILEGES ON clinprecisiondb.* TO 'clinprecadmin'@'localhost';
USE clinprecisiondb;
```

### Schema Design Principles
- **Normalization**: 3NF compliance for data integrity
- **Audit Trail**: Comprehensive tracking of all data changes  
- **Versioning**: Built-in versioning for studies and forms
- **Soft Deletes**: Logical deletion preserving historical data
- **Constraints**: Foreign key relationships ensuring referential integrity
- **Indexing**: Strategic indexes for query performance

## Core Domain Models

## 1. User Management Domain

### 1.1 Users Table
**Purpose**: Central user registry for all system participants

```sql
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
    phone VARCHAR(50),
    mobile_phone VARCHAR(50),
    -- Address fields
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    -- Status and security
    status ENUM('active', 'inactive', 'pending', 'locked') DEFAULT 'pending',
    last_login_at TIMESTAMP NULL,
    password_reset_required BOOLEAN DEFAULT TRUE,
    notes TEXT COMMENT 'Administrative notes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Key Features**:
- Unique email and user_id for authentication
- Professional information for regulatory compliance
- Status tracking for account lifecycle
- Audit timestamps for security tracking

### 1.2 Authorization Framework

**Roles Table**:
```sql
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Authorities Table**:
```sql
CREATE TABLE authorities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);
```

**Many-to-Many Relationships**:
```sql
-- Role-Authority mapping
CREATE TABLE roles_authorities (
    roles_id BIGINT NOT NULL,
    authorities_id BIGINT NOT NULL,
    PRIMARY KEY (roles_id, authorities_id),
    FOREIGN KEY (roles_id) REFERENCES roles(id),
    FOREIGN KEY (authorities_id) REFERENCES authorities(id)
);

-- User-Role mapping  
CREATE TABLE users_roles (
    users_id BIGINT NOT NULL,
    roles_id BIGINT NOT NULL,
    PRIMARY KEY (users_id, roles_id),
    FOREIGN KEY (users_id) REFERENCES users(id),
    FOREIGN KEY (roles_id) REFERENCES roles(id)
);
```

### 1.3 User Classification

**User Types Table**:
```sql
CREATE TABLE user_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'e.g., CRA, PI, CRC, DM',
    description TEXT,
    code VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**User-UserType Association**:
```sql
CREATE TABLE users_user_types (
    users_id BIGINT NOT NULL,
    user_types_id BIGINT NOT NULL,
    PRIMARY KEY (users_id, user_types_id),
    FOREIGN KEY (users_id) REFERENCES users(id),
    FOREIGN KEY (user_types_id) REFERENCES user_types(id)
);
```

## 2. Organization Management Domain

### 2.1 Organizations Table
**Purpose**: Manage pharmaceutical companies, CROs, sites, and vendors

```sql
CREATE TABLE organizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    external_id VARCHAR(100) COMMENT 'External system identifier',
    -- Address information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    -- Contact information
    phone VARCHAR(50),
    email VARCHAR(120),
    website VARCHAR(255),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2.2 Organization Contacts
**Purpose**: Multiple contact persons per organization

```sql
CREATE TABLE organization_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    department VARCHAR(100),
    email VARCHAR(120),
    phone VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);
```

### 2.3 Organization Roles
**Purpose**: Define organization types and capabilities

```sql
CREATE TABLE organization_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Sponsor, CRO, Site, Vendor, Laboratory',
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 3. Study Management Domain

### 3.1 Study Lookup Tables
**Purpose**: Standardized vocabulary for study attributes

**Study Status**:
```sql
CREATE TABLE study_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE COMMENT 'DRAFT, ACTIVE, COMPLETED',
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    allows_modification BOOLEAN DEFAULT TRUE,
    is_final_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Regulatory Status**:
```sql
CREATE TABLE regulatory_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE COMMENT 'PENDING_APPROVAL, APPROVED',
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    requires_documentation BOOLEAN DEFAULT FALSE,
    allows_enrollment BOOLEAN DEFAULT FALSE,
    regulatory_category ENUM('PRE_SUBMISSION', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Study Phase**:
```sql
CREATE TABLE study_phase (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE COMMENT 'PHASE_I, PHASE_II',
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    typical_duration_months INTEGER,
    typical_patient_count_min INTEGER,
    typical_patient_count_max INTEGER,
    phase_category ENUM('PRECLINICAL', 'EARLY_PHASE', 'EFFICACY', 'REGISTRATION', 'POST_MARKET'),
    requires_ide BOOLEAN DEFAULT FALSE,
    requires_ind BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3.2 Studies Table
**Purpose**: Core study registry with comprehensive metadata

```sql
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
    -- Clinical trial specific fields
    indication VARCHAR(500) COMMENT 'Medical condition being studied',
    study_type VARCHAR(50) DEFAULT 'INTERVENTIONAL',
    principal_investigator VARCHAR(255),
    sites INTEGER DEFAULT 0,
    planned_subjects INTEGER DEFAULT 0,
    enrolled_subjects INTEGER DEFAULT 0,
    target_enrollment INTEGER DEFAULT 0,
    primary_objective TEXT,
    amendments INTEGER DEFAULT 0,
    -- Foreign key references to lookup tables
    study_status_id BIGINT NULL,
    regulatory_status_id BIGINT NULL,
    study_phase_id BIGINT NULL,
    metadata JSON,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Foreign key constraints
    CONSTRAINT fk_studies_study_status FOREIGN KEY (study_status_id) REFERENCES study_status(id),
    CONSTRAINT fk_studies_regulatory_status FOREIGN KEY (regulatory_status_id) REFERENCES regulatory_status(id),
    CONSTRAINT fk_studies_study_phase FOREIGN KEY (study_phase_id) REFERENCES study_phase(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 3.3 Study-Organization Relationships
**Purpose**: Multi-organization study support with role definitions

```sql
CREATE TABLE organization_studies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    study_id BIGINT NOT NULL,
    role ENUM('SPONSOR', 'CRO', 'SITE', 'VENDOR', 'LABORATORY', 'REGULATORY', 'STATISTICS', 'SAFETY') NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE COMMENT 'Primary organization for this role',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    UNIQUE KEY (organization_id, study_id, role)
);
```

### 3.4 Study Arms and Randomization
**Purpose**: Support for multi-arm randomized studies

```sql
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
```

## 4. Site Management Domain

### 4.1 Sites Table
**Purpose**: Clinical trial sites with investigator assignments

```sql
CREATE TABLE sites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    site_number VARCHAR(50) NOT NULL,
    study_id BIGINT NOT NULL,
    principal_investigator_id BIGINT,
    status ENUM('pending', 'active', 'suspended', 'closed') DEFAULT 'pending',
    activation_date DATE,
    deactivation_date DATE,
    max_subjects INT COMMENT 'Enrollment cap for this site',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (principal_investigator_id) REFERENCES users(id),
    UNIQUE KEY (site_number, study_id)
);
```

## 5. Form Management Domain

### 5.1 Form Templates
**Purpose**: Reusable form templates across studies

```sql
CREATE TABLE form_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'Business identifier',
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) COMMENT 'Demographics, Safety, Laboratory, etc.',
    version VARCHAR(20) DEFAULT '1.0',
    is_latest_version BOOLEAN DEFAULT TRUE,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    fields JSON NOT NULL COMMENT 'Complete field definitions with metadata',
    tags TEXT COMMENT 'Comma-separated search tags',
    usage_count INT DEFAULT 0,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 5.2 Form Definitions  
**Purpose**: Study-specific form instances

```sql
CREATE TABLE form_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    form_type VARCHAR(100) NULL,
    version VARCHAR(20) DEFAULT '1.0',
    is_latest_version BOOLEAN DEFAULT TRUE,
    parent_version_id VARCHAR(36) DEFAULT NULL,
    version_notes TEXT,
    is_locked BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'approved', 'retired') DEFAULT 'draft',
    template_id BIGINT NULL COMMENT 'Source template reference',
    template_version VARCHAR(36) NULL,
    tags TEXT NULL,
    fields JSON NOT NULL COMMENT 'Field definitions with metadata',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_form_template FOREIGN KEY (template_id) REFERENCES form_templates(id) ON DELETE SET NULL
);
```

## 6. Visit Schedule Domain

### 6.1 Visit Definitions
**Purpose**: Study visit schedule and timepoint definitions

```sql
CREATE TABLE visit_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    arm_id BIGINT COMMENT 'Optional arm-specific visits',
    name VARCHAR(255) NOT NULL,
    description TEXT,
    timepoint INT NOT NULL COMMENT 'Days from baseline (negative for screening)',
    window_before INT DEFAULT 0 COMMENT 'Visit window in days',
    window_after INT DEFAULT 0,
    visit_type ENUM('screening', 'baseline', 'treatment', 'follow_up', 'unscheduled') DEFAULT 'treatment',
    is_required BOOLEAN DEFAULT TRUE,
    sequence_number INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (arm_id) REFERENCES study_arms(id) ON DELETE SET NULL
);
```

### 6.2 Visit-Form Associations
**Purpose**: Define which forms are required at each visit

```sql
CREATE TABLE visit_forms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    visit_definition_id BIGINT NOT NULL,
    form_definition_id BIGINT NOT NULL,
    sequence_number INT NOT NULL COMMENT 'Order of form completion',
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
```

## 7. Subject and Data Capture Domain

### 7.1 Subjects Table
**Purpose**: Study participants with enrollment tracking

```sql
CREATE TABLE subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    protocol_subject_id VARCHAR(100) NOT NULL COMMENT 'Study-specific subject ID',
    study_id BIGINT NOT NULL,
    arm_id BIGINT COMMENT 'Randomization arm assignment',
    enrollment_date DATE NOT NULL,
    status ENUM('screening', 'active', 'completed', 'withdrawn', 'screen_failed') DEFAULT 'screening',
    withdrawal_reason TEXT,
    demographics JSON COMMENT 'Subject demographic data',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id),
    FOREIGN KEY (arm_id) REFERENCES study_arms(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY (protocol_subject_id, study_id)
);
```

### 7.2 Subject Visits
**Purpose**: Track individual subject visit completion

```sql
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
```

### 7.3 Form Data
**Purpose**: Actual clinical data entry with versioning

```sql
CREATE TABLE form_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT NOT NULL,
    subject_visit_id BIGINT NOT NULL,
    form_definition_id BIGINT NOT NULL,
    form_version BIGINT NOT NULL,
    uses_latest_form_version BOOLEAN DEFAULT TRUE,
    status ENUM('not_started', 'incomplete', 'complete', 'signed', 'locked', 'superseded') DEFAULT 'not_started',
    data JSON COMMENT 'Form field values keyed by field ID',
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
```

## 8. Data Quality and Verification Domain

### 8.1 Field Verifications
**Purpose**: Source Data Verification (SDV) and medical review tracking

```sql
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
```

### 8.2 Data Queries
**Purpose**: Data discrepancy and query management

```sql
CREATE TABLE data_queries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_data_id BIGINT NOT NULL,
    field_id VARCHAR(100) COMMENT 'Specific field if applicable',
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
```

### 8.3 Query Responses
**Purpose**: Query resolution dialogue

```sql
CREATE TABLE query_responses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    query_id BIGINT NOT NULL,
    response_text TEXT NOT NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES data_queries(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

## 9. User Management and Qualifications Domain

### 9.1 User Qualifications
**Purpose**: Track user training, certifications, and qualifications

```sql
CREATE TABLE user_qualifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    qualification_type ENUM('training', 'certification', 'license', 'education') NOT NULL,
    name VARCHAR(255) NOT NULL,
    issuer VARCHAR(255),
    identifier VARCHAR(100) COMMENT 'Certificate/license number',
    issue_date DATE,
    expiry_date DATE,
    attachment_url VARCHAR(512),
    verified BOOLEAN DEFAULT FALSE,
    verified_by BIGINT,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);
```

### 9.2 Data Delegations
**Purpose**: User delegation and responsibility assignments

```sql
CREATE TABLE data_delegations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    delegator_id BIGINT NOT NULL,
    delegatee_id BIGINT NOT NULL,
    delegation_type ENUM('data_entry', 'review', 'query_resolution', 'signature') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT,
    status ENUM('active', 'revoked', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (delegator_id) REFERENCES users(id),
    FOREIGN KEY (delegatee_id) REFERENCES users(id)
);
```

### 9.3 User-Study-Site Relationships

**User Study Roles**:
```sql
CREATE TABLE user_study_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    study_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    site_id BIGINT COMMENT 'Optional site-specific assignment',
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE SET NULL,
    UNIQUE KEY (user_id, study_id, role_id, site_id)
);
```

**User Site Assignments**:
```sql
CREATE TABLE user_site_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    site_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    UNIQUE KEY (user_id, site_id, role_id)
);
```

## 10. Audit and History Domain

### 10.1 Form Data History
**Purpose**: Complete audit trail of form data changes

```sql
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
```

### 10.2 General Audit Trail
**Purpose**: System-wide audit logging

```sql
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
```

### 10.3 User Session Tracking
**Purpose**: Security and compliance session logging

```sql
CREATE TABLE user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    login_at TIMESTAMP NOT NULL,
    logout_at TIMESTAMP NULL,
    session_status ENUM('active', 'expired', 'logged_out') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 11. Database Triggers and Automation

### 11.1 Form Data History Triggers
**Purpose**: Automatic audit trail generation

```sql
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
    form_data_id, subject_id, subject_visit_id, 
    form_definition_id, form_version, status, data,
    changed_by, change_timestamp, change_type, change_reason
  )
  VALUES (
    NEW.id, NEW.subject_id, NEW.subject_visit_id,
    NEW.form_definition_id, NEW.form_version, NEW.status, NEW.data,
    NEW.updated_by, NOW(), change_type, NEW.entry_reason
  );
END //

DELIMITER ;
```

## 12. Performance Optimization

### 12.1 Strategic Indexing
```sql
-- Core entity indexes
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_studies_sponsor ON studies(sponsor);
CREATE INDEX idx_studies_status ON studies(study_status_id);

-- Form and data indexes
CREATE INDEX idx_form_definitions_study ON form_definitions(study_id);
CREATE INDEX idx_form_data_subject ON form_data(subject_id);
CREATE INDEX idx_form_data_visit ON form_data(subject_visit_id);

-- Audit and query indexes  
CREATE INDEX idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX idx_data_queries_form ON data_queries(form_data_id);
CREATE INDEX idx_field_verifications_form ON field_verifications(form_data_id);

-- User relationship indexes
CREATE INDEX idx_user_study_roles_user ON user_study_roles(user_id);
CREATE INDEX idx_user_study_roles_study ON user_study_roles(study_id);
CREATE INDEX idx_organization_studies_primary ON organization_studies(study_id, role, is_primary);
```

### 12.2 Partitioning Strategy
```sql
-- Partition audit tables by date for performance
ALTER TABLE audit_trail PARTITION BY RANGE (YEAR(performed_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027)
);
```

## 13. Data Integrity and Constraints

### 13.1 Check Constraints
```sql
-- Ensure logical data integrity
ALTER TABLE subjects ADD CONSTRAINT chk_enrollment_date 
CHECK (enrollment_date <= CURDATE());

ALTER TABLE visit_definitions ADD CONSTRAINT chk_visit_window 
CHECK (window_before >= 0 AND window_after >= 0);

ALTER TABLE studies ADD CONSTRAINT chk_study_dates 
CHECK (start_date <= end_date);
```

### 13.2 Business Rules
- Users must belong to at least one organization
- Studies require at least one sponsor organization
- Form data cannot be modified once signed and locked
- Site numbers must be unique within a study
- Principal investigators must have appropriate qualifications

## 14. Security Considerations

### 14.1 Data Encryption
- Sensitive fields encrypted at rest
- Password hashing with BCrypt
- Personal identifiers protection
- GDPR compliance for EU subjects

### 14.2 Access Control
- Row-level security for multi-tenant access
- Role-based data filtering
- Audit trail for all data access
- Automated session timeout

## 15. Backup and Recovery

### 15.1 Backup Strategy
```sql
-- Daily full backup
mysqldump --single-transaction --routines --triggers clinprecisiondb > backup_$(date +%Y%m%d).sql

-- Incremental backups using binary logs
mysqlbinlog --start-datetime="2024-01-01 00:00:00" mysql-bin.000001
```

### 15.2 Point-in-Time Recovery
- Binary log retention for 30 days
- Full backup retention for 1 year
- Transaction log shipping for DR sites

## 16. Monitoring and Maintenance

### 16.1 Performance Monitoring
```sql
-- Query performance analysis
SELECT * FROM performance_schema.events_statements_summary_by_digest 
WHERE digest_text LIKE '%form_data%' 
ORDER BY avg_timer_wait DESC;

-- Index usage monitoring  
SELECT object_schema, object_name, index_name, count_read, count_write
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = 'clinprecisiondb';
```

### 16.2 Regular Maintenance
- Weekly index optimization
- Monthly statistics update
- Quarterly archive old audit data
- Annual capacity planning review

This database schema provides a robust foundation for clinical trial management with comprehensive audit trails, flexible user management, and scalable data capture capabilities while maintaining regulatory compliance and data integrity.