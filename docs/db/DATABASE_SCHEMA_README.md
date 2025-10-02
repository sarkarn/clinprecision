# ClinPrecision Database Schema Documentation

## Overview
The ClinPrecision database schema is designed to support comprehensive clinical trial management, including user management, study design, data capture, and quality control. The schema follows normalized design principles with proper foreign key relationships, audit trails, and flexible JSON storage for dynamic form structures.

## Database Information

### Database Configuration
- **Database Engine**: MySQL 8.0+
- **Character Set**: utf8mb4 with unicode collation
- **Storage Engine**: InnoDB (supports transactions and foreign keys)
- **Database Name**: `clinprecisiondb`
- **Admin User**: `clinprecadmin`
- **Schema File**: `backend/clinprecision-db/ddl/consolidated_schema.sql`

### Connection Details
```sql
-- Database and user setup
CREATE USER 'clinprecadmin'@'localhost' IDENTIFIED BY 'passw0rd';
CREATE DATABASE clinprecisiondb;
GRANT ALL PRIVILEGES ON clinprecisiondb.* TO 'clinprecadmin'@'localhost';
USE clinprecisiondb;
```

## Schema Architecture

### Core Module Overview
The database is organized into logical modules:

1. **User Management Module**: Users, roles, authorities, organizations
2. **Study Design Module**: Studies, forms, visits, study arms
3. **Data Capture Module**: Subjects, form data, visits, audit trails
4. **Administrative Module**: Lookup tables, templates, configurations
5. **Audit & Quality Module**: Data history, queries, verifications

## Table Documentation

### 1. User Management Module

#### users
Core user information with comprehensive profile data.

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
    phone VARCHAR(50) COMMENT 'Contact phone number',
    mobile_phone VARCHAR(50) COMMENT 'Mobile phone number',
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    status ENUM('active', 'inactive', 'pending', 'locked') DEFAULT 'pending',
    last_login_at TIMESTAMP NULL,
    password_reset_required BOOLEAN DEFAULT TRUE,
    notes TEXT COMMENT 'Administrative notes about the user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Key Features**:
- Unique email and user_id for authentication
- Comprehensive address and contact information
- Status tracking for account lifecycle
- Audit timestamps for creation and updates

#### roles
Role definitions for role-based access control.

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

#### authorities
Granular permissions for fine-grained access control.

```sql
CREATE TABLE authorities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);
```

**Common Authorities**:
- CREATE_STUDY, UPDATE_STUDY, DELETE_STUDY
- CREATE_FORM, UPDATE_FORM, DELETE_FORM
- ENTER_DATA, REVIEW_DATA, SIGN_DATA
- CREATE_QUERY, RESOLVE_QUERY
- EXPORT_DATA, IMPORT_DATA

#### Many-to-Many Relationship Tables

**roles_authorities**: Links roles to their permissions
```sql
CREATE TABLE roles_authorities (
    roles_id BIGINT NOT NULL,
    authorities_id BIGINT NOT NULL,
    PRIMARY KEY (roles_id, authorities_id),
    FOREIGN KEY (roles_id) REFERENCES roles(id),
    FOREIGN KEY (authorities_id) REFERENCES authorities(id)
);
```

**users_roles**: Assigns roles to users
```sql
CREATE TABLE users_roles (
    users_id BIGINT NOT NULL,
    roles_id BIGINT NOT NULL,
    PRIMARY KEY (users_id, roles_id),
    FOREIGN KEY (users_id) REFERENCES users(id),
    FOREIGN KEY (roles_id) REFERENCES roles(id)
);
```

#### organizations
Organization management for multi-tenant support.

```sql
CREATE TABLE organizations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    external_id VARCHAR(100),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(120),
    website VARCHAR(255),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### user_types
Classification of users by functional role.

```sql
CREATE TABLE user_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    code VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Common User Types**:
- **CRA**: Clinical Research Associate
- **PI**: Principal Investigator  
- **CRC**: Clinical Research Coordinator
- **DM**: Data Manager
- **QA**: Quality Assurance

### 2. Study Design Module

#### studies
Core study information and metadata.

```sql
CREATE TABLE studies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_identifier VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    short_title VARCHAR(200),
    description TEXT,
    sponsor VARCHAR(255),
    indication VARCHAR(255),
    study_status_id BIGINT,
    regulatory_status_id BIGINT,
    study_phase_id BIGINT,
    is_randomized BOOLEAN DEFAULT FALSE,
    is_blinded BOOLEAN DEFAULT FALSE,
    blinding_type ENUM('open_label', 'single_blind', 'double_blind', 'triple_blind'),
    primary_objective TEXT,
    secondary_objectives TEXT,
    inclusion_criteria TEXT,
    exclusion_criteria TEXT,
    target_enrollment INT,
    enrollment_start_date DATE,
    enrollment_end_date DATE,
    study_start_date DATE,
    estimated_completion_date DATE,
    actual_completion_date DATE,
    protocol_version VARCHAR(50),
    protocol_date DATE,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_status_id) REFERENCES study_status(id),
    FOREIGN KEY (regulatory_status_id) REFERENCES regulatory_status(id),
    FOREIGN KEY (study_phase_id) REFERENCES study_phase(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**Key Features**:
- Comprehensive study metadata
- Regulatory and status tracking
- Timeline management
- Protocol versioning

#### study_arms
Treatment arms for randomized studies.

```sql
CREATE TABLE study_arms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('treatment', 'control', 'placebo', 'combination') NOT NULL DEFAULT 'treatment',
    sequence_number INT NOT NULL,
    target_enrollment INT,
    randomization_ratio DECIMAL(5,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    UNIQUE KEY uk_study_arms_study_sequence (study_id, sequence_number)
);
```

#### study_interventions
Interventions within study arms.

```sql
CREATE TABLE study_interventions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_arm_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('drug', 'device', 'procedure', 'behavioral', 'other') NOT NULL DEFAULT 'drug',
    description TEXT,
    dosage VARCHAR(255),
    frequency VARCHAR(255),
    duration VARCHAR(255),
    route_of_administration VARCHAR(100),
    instructions TEXT,
    sequence_number INT NOT NULL DEFAULT 1,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_arm_id) REFERENCES study_arms(id) ON DELETE CASCADE
);
```

#### visit_definitions
Visit schedule and timeline definitions.

```sql
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
```

**Key Features**:
- Timeline-based scheduling with timepoints
- Visit windows for scheduling flexibility
- Visit type classification
- Optional arm-specific visits

#### form_definitions
Dynamic form structures with JSON storage.

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
    template_id BIGINT NULL,
    template_version VARCHAR(36) NULL,
    tags TEXT NULL,
    -- JSON storage for dynamic form structure
    fields JSON NOT NULL COMMENT 'Array of field definitions with metadata',
    structure JSON COMMENT 'Organized layout/structure of form fields',
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_form_template FOREIGN KEY (template_id) REFERENCES form_templates(id) ON DELETE SET NULL
);
```

**JSON Field Structure Example**:
```json
{
  "fields": [
    {
      "id": "subject_id",
      "type": "text",
      "label": "Subject ID",
      "required": true,
      "validation": {
        "pattern": "^[A-Z]{2}[0-9]{4}$"
      }
    },
    {
      "id": "visit_date",
      "type": "date",
      "label": "Visit Date",
      "required": true
    }
  ]
}
```

#### visit_forms
Association between visits and forms.

```sql
CREATE TABLE visit_forms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    visit_definition_id BIGINT NOT NULL,
    form_definition_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    is_conditional BOOLEAN DEFAULT FALSE,
    conditional_logic TEXT,
    display_order INT DEFAULT 1,
    instructions TEXT,
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

### 3. Data Capture Module

#### subjects
Patient/subject enrollment and management.

```sql
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
```

**Demographics JSON Example**:
```json
{
  "age": 45,
  "gender": "F",
  "race": "Caucasian",
  "ethnicity": "Non-Hispanic",
  "date_of_birth": "1979-03-15"
}
```

#### subject_visits
Individual visit instances for subjects.

```sql
CREATE TABLE subject_visits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT NOT NULL,
    visit_definition_id BIGINT NOT NULL,
    scheduled_date DATE,
    actual_date DATE,
    status ENUM('scheduled', 'in_progress', 'completed', 'missed', 'cancelled') DEFAULT 'scheduled',
    visit_notes TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (visit_definition_id) REFERENCES visit_definitions(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### form_data
Captured form data with JSON storage and audit trail.

```sql
CREATE TABLE form_data (
    id VARCHAR(36) PRIMARY KEY,  -- UUID
    subject_id BIGINT NOT NULL,
    subject_visit_id BIGINT,
    form_definition_id BIGINT NOT NULL,
    form_version VARCHAR(20) NOT NULL,
    status ENUM('empty', 'in_progress', 'complete', 'signed', 'locked') DEFAULT 'empty',
    data JSON NOT NULL,
    entry_reason TEXT,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    signed_by BIGINT,
    signed_at TIMESTAMP NULL,
    locked_by BIGINT,
    locked_at TIMESTAMP NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_visit_id) REFERENCES subject_visits(id),
    FOREIGN KEY (form_definition_id) REFERENCES form_definitions(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    FOREIGN KEY (signed_by) REFERENCES users(id),
    FOREIGN KEY (locked_by) REFERENCES users(id)
);
```

**Form Data JSON Example**:
```json
{
  "subject_id": "ABC001",
  "visit_date": "2024-09-16",
  "vital_signs": {
    "systolic_bp": 120,
    "diastolic_bp": 80,
    "heart_rate": 72,
    "temperature": 98.6
  },
  "adverse_events": []
}
```

### 4. Administrative Module

#### Lookup Tables

**study_status**: Study lifecycle status values
```sql
CREATE TABLE study_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
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

**regulatory_status**: Regulatory approval status tracking
```sql
CREATE TABLE regulatory_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    requires_documentation BOOLEAN DEFAULT FALSE,
    allows_enrollment BOOLEAN DEFAULT FALSE,
    regulatory_category ENUM('PRE_SUBMISSION', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**study_phase**: Clinical trial phases
```sql
CREATE TABLE study_phase (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    typical_duration_months INTEGER,
    typical_patient_count_min INTEGER,
    typical_patient_count_max INTEGER,
    phase_category ENUM('PRECLINICAL', 'EARLY_PHASE', 'EFFICACY', 'REGISTRATION', 'POST_MARKET') NOT NULL,
    requires_ide BOOLEAN DEFAULT FALSE,
    requires_ind BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### form_templates
Reusable form templates for standardization.

```sql
CREATE TABLE form_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    version VARCHAR(20) DEFAULT '1.0',
    is_latest_version BOOLEAN DEFAULT TRUE,
    parent_version_id BIGINT,
    status ENUM('draft', 'approved', 'retired') DEFAULT 'draft',
    is_system_template BOOLEAN DEFAULT FALSE,
    -- JSON structure matching form_definitions
    fields JSON NOT NULL,
    structure JSON,
    tags TEXT,
    usage_count INT DEFAULT 0,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_version_id) REFERENCES form_templates(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 5. Audit & Quality Module

#### form_data_history
Complete audit trail for form data changes.

```sql
CREATE TABLE form_data_history (
    id VARCHAR(36) PRIMARY KEY,  -- UUID
    form_data_id VARCHAR(36) NOT NULL,
    subject_id BIGINT NOT NULL,
    subject_visit_id BIGINT,
    form_definition_id BIGINT NOT NULL,
    form_version VARCHAR(20) NOT NULL,
    status ENUM('empty', 'in_progress', 'complete', 'signed', 'locked') NOT NULL,
    data JSON NOT NULL,
    changed_by BIGINT NOT NULL,
    change_timestamp TIMESTAMP NOT NULL,
    change_type ENUM('create', 'update', 'sign', 'lock', 'unlock', 'version_upgrade') NOT NULL,
    change_reason TEXT,
    FOREIGN KEY (form_data_id) REFERENCES form_data(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);
```

#### data_queries
Data quality queries and resolutions.

```sql
CREATE TABLE data_queries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_data_id VARCHAR(36) NOT NULL,
    field_name VARCHAR(255),
    query_type ENUM('missing_data', 'inconsistent_data', 'clarification', 'protocol_deviation', 'other') NOT NULL,
    query_text TEXT NOT NULL,
    status ENUM('open', 'answered', 'resolved', 'cancelled') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    created_by BIGINT NOT NULL,
    assigned_to BIGINT,
    response_text TEXT,
    responded_by BIGINT,
    responded_at TIMESTAMP NULL,
    resolved_by BIGINT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (form_data_id) REFERENCES form_data(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (responded_by) REFERENCES users(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id)
);
```

#### field_verifications
Field-level data verification and approval.

```sql
CREATE TABLE field_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_data_id VARCHAR(36) NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    verification_status ENUM('unverified', 'verified', 'rejected') DEFAULT 'unverified',
    verification_notes TEXT,
    verified_by BIGINT,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (form_data_id) REFERENCES form_data(id),
    FOREIGN KEY (verified_by) REFERENCES users(id),
    UNIQUE KEY uk_field_verifications (form_data_id, field_name)
);
```

## Database Relationships

### Entity Relationship Diagram

```
Users (1) ←→ (N) User_Roles (N) ←→ (1) Roles (1) ←→ (N) Role_Authorities (N) ←→ (1) Authorities

Organizations (1) ←→ (N) Users

Studies (1) ←→ (N) Study_Arms (1) ←→ (N) Study_Interventions
Studies (1) ←→ (N) Visit_Definitions (1) ←→ (N) Visit_Forms (N) ←→ (1) Form_Definitions
Studies (1) ←→ (N) Form_Definitions
Studies (1) ←→ (N) Subjects (1) ←→ (N) Subject_Visits (1) ←→ (N) Form_Data

Form_Data (1) ←→ (N) Form_Data_History
Form_Data (1) ←→ (N) Data_Queries
Form_Data (1) ←→ (N) Field_Verifications

Form_Templates (1) ←→ (N) Form_Definitions
```

### Key Relationships

1. **User Management**: Users belong to organizations and have multiple roles
2. **Study Design**: Studies contain arms, visits, and forms in hierarchical structure
3. **Data Capture**: Subjects enroll in studies and complete visits with form data
4. **Audit Trail**: All data changes tracked in history tables
5. **Quality Control**: Queries and verifications linked to specific form data

## Indexes and Performance

### Primary Indexes
All tables have auto-increment primary keys for optimal performance.

### Foreign Key Indexes
Automatic indexes on all foreign key columns for join performance.

### Custom Indexes
```sql
-- Performance indexes for common query patterns
CREATE INDEX idx_form_definitions_study ON form_definitions(study_id);
CREATE INDEX idx_subjects_study ON subjects(study_id);
CREATE INDEX idx_subject_visits_subject ON subject_visits(subject_id);
CREATE INDEX idx_form_data_subject ON form_data(subject_id);
CREATE INDEX idx_form_data_visit ON form_data(subject_visit_id);
CREATE INDEX idx_data_queries_form ON data_queries(form_data_id);
CREATE INDEX idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX idx_studies_sponsor ON studies(sponsor);
CREATE INDEX idx_studies_indication ON studies(indication);
CREATE INDEX idx_studies_created_at ON studies(created_at);
```

## Data Migration and Setup

### Schema Creation
```bash
# Create database and user
mysql -u root -p < backend/clinprecision-db/ddl/consolidated_schema.sql

# Verify schema creation
mysql -u clinprecadmin -p -e "USE clinprecisiondb; SHOW TABLES;"
```

### Sample Data Setup
```sql
-- Load sample data
SOURCE backend/clinprecision-db/data/sample_data_setup.sql;
SOURCE backend/clinprecision-db/data/organization_setup.sql;
```

### Data Validation
```sql
-- Verify table relationships
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = 'clinprecisiondb'
ORDER BY TABLE_NAME, CONSTRAINT_NAME;
```

## Backup and Recovery

### Backup Strategy
```bash
# Full database backup
mysqldump -u clinprecadmin -p --single-transaction --routines --triggers clinprecisiondb > clinprecision_backup_$(date +%Y%m%d).sql

# Schema-only backup
mysqldump -u clinprecadmin -p --no-data clinprecisiondb > clinprecision_schema_$(date +%Y%m%d).sql

# Data-only backup
mysqldump -u clinprecadmin -p --no-create-info clinprecisiondb > clinprecision_data_$(date +%Y%m%d).sql
```

### Recovery Procedures
```bash
# Full restore
mysql -u clinprecadmin -p clinprecisiondb < clinprecision_backup_20240916.sql

# Schema-only restore
mysql -u clinprecadmin -p clinprecisiondb < clinprecision_schema_20240916.sql
```

## Security Considerations

### Data Protection
- **Encrypted Passwords**: BCrypt encryption for user passwords
- **Audit Trail**: Complete change history for all sensitive data
- **Data Integrity**: Foreign key constraints prevent orphaned records
- **Access Control**: Role-based permissions at database and application level

### Sensitive Data Handling
- **PII Protection**: Patient identifiers stored separately from medical data
- **Data Anonymization**: Support for de-identification processes
- **Compliance**: HIPAA, GDPR, and 21 CFR Part 11 considerations

## Database Maintenance

### Regular Maintenance Tasks
```sql
-- Analyze table statistics
ANALYZE TABLE users, studies, form_data, subjects;

-- Optimize tables
OPTIMIZE TABLE form_data_history, data_queries;

-- Check table integrity
CHECK TABLE form_data, subject_visits;

-- Monitor index usage
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    INDEX_NAME,
    SEQ_IN_INDEX,
    COLUMN_NAME,
    CARDINALITY
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'clinprecisiondb'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
```

### Performance Monitoring
```sql
-- Check slow queries
SELECT 
    query_time,
    lock_time,
    rows_sent,
    rows_examined,
    sql_text
FROM mysql.slow_log
WHERE start_time > DATE_SUB(NOW(), INTERVAL 1 DAY)
ORDER BY query_time DESC;

-- Monitor table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows
FROM information_schema.tables
WHERE table_schema = 'clinprecisiondb'
ORDER BY (data_length + index_length) DESC;
```

## JSON Field Usage

### Form Structure JSON
The `fields` JSON column in `form_definitions` stores dynamic form configurations:

```json
{
  "fields": [
    {
      "id": "vital_signs_systolic",
      "type": "number",
      "label": "Systolic Blood Pressure",
      "required": true,
      "validation": {
        "min": 70,
        "max": 250,
        "unit": "mmHg"
      },
      "metadata": {
        "category": "vital_signs",
        "data_type": "numeric",
        "cdisc_domain": "VS"
      }
    }
  ],
  "layout": {
    "sections": [
      {
        "title": "Vital Signs",
        "fields": ["vital_signs_systolic", "vital_signs_diastolic"]
      }
    ]
  }
}
```

### Data JSON Storage
The `data` JSON column in `form_data` stores collected form responses:

```json
{
  "vital_signs_systolic": {
    "value": 120,
    "unit": "mmHg",
    "timestamp": "2024-09-16T10:30:00Z",
    "entered_by": "user123"
  },
  "vital_signs_diastolic": {
    "value": 80,
    "unit": "mmHg",
    "timestamp": "2024-09-16T10:30:00Z",
    "entered_by": "user123"
  }
}
```

## Database Version Control

### Schema Versioning
- **Migration Scripts**: Sequential numbered migration files
- **Version Tracking**: Database version stored in metadata table
- **Rollback Support**: Down migration scripts for each change

### Change Management Process
1. **Development**: Create migration script in development environment
2. **Testing**: Apply migration to test database
3. **Staging**: Deploy to staging environment for validation
4. **Production**: Coordinated deployment with application updates

## Troubleshooting

### Common Issues

#### Connection Problems
```sql
-- Check user permissions
SELECT User, Host FROM mysql.user WHERE User = 'clinprecadmin';
SHOW GRANTS FOR 'clinprecadmin'@'localhost';

-- Check database existence
SHOW DATABASES LIKE 'clinprecisiondb';
```

#### Performance Issues
```sql
-- Identify slow queries
SHOW PROCESSLIST;

-- Check index usage
EXPLAIN SELECT * FROM form_data WHERE subject_id = 123;

-- Monitor locks
SELECT * FROM information_schema.INNODB_LOCKS;
```

#### Data Integrity Issues
```sql
-- Check foreign key constraints
SELECT * FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = 'clinprecisiondb' AND CONSTRAINT_TYPE = 'FOREIGN KEY';

-- Verify orphaned records
SELECT fd.* FROM form_data fd 
LEFT JOIN subjects s ON fd.subject_id = s.id 
WHERE s.id IS NULL;
```

## Future Enhancements

### Planned Schema Improvements
- **Partitioning**: Table partitioning for large datasets
- **Archiving**: Automated data archiving for completed studies
- **Replication**: Master-slave replication for read scalability
- **Sharding**: Horizontal scaling for multi-tenant deployments

### New Features
- **Document Storage**: BLOB/File storage for supporting documents
- **Event Sourcing**: Event-driven architecture for audit trails
- **Time-Series Data**: Optimized storage for continuous monitoring data
- **Search Integration**: Full-text search capabilities for form data