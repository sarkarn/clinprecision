CREATE USER 'clinprecadmin'@'localhost' IDENTIFIED BY 'passw0rd';
CREATE DATABASE clinprecisiondb;
GRANT ALL PRIVILEGES ON clinprecisiondb.* TO 'clinprecadmin'@'localhost';
USE clinprecisiondb;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    encrypted_password VARCHAR(255) NOT NULL UNIQUE
);


CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL
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


CREATE TABLE studies (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sponsor VARCHAR(255),
  protocol_number VARCHAR(100),
  phase VARCHAR(20),
  status ENUM('draft', 'active', 'completed', 'terminated') DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  metadata JSON,
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Study arms
CREATE TABLE study_arms (
  id VARCHAR(36) PRIMARY KEY,
  study_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  randomization_ratio INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
);

-- Visit schedule definitions
CREATE TABLE visit_definitions (
  id VARCHAR(36) PRIMARY KEY,
  study_id VARCHAR(36) NOT NULL,
  arm_id VARCHAR(36),
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

-- Form templates/definitions with JSON for flexible field structure
CREATE TABLE form_definitions (
  id VARCHAR(36) PRIMARY KEY,
  study_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(20) DEFAULT '1.0',
  status ENUM('draft', 'approved', 'retired') DEFAULT 'draft',
  template_id VARCHAR(50),
  -- Store the entire field structure including metadata in JSON
  -- This directly maps to your CRFBuilder format
  fields JSON NOT NULL COMMENT 'Array of field definitions with metadata including QC flags',
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Map forms to visits
CREATE TABLE visit_forms (
  id VARCHAR(36) PRIMARY KEY,
  visit_definition_id VARCHAR(36) NOT NULL,
  form_definition_id VARCHAR(36) NOT NULL,
  sequence_number INT NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visit_definition_id) REFERENCES visit_definitions(id) ON DELETE CASCADE,
  FOREIGN KEY (form_definition_id) REFERENCES form_definitions(id) ON DELETE CASCADE,
  UNIQUE KEY (visit_definition_id, form_definition_id)
);

-- Subjects enrolled in studies
CREATE TABLE subjects (
  id VARCHAR(36) PRIMARY KEY,
  subject_id VARCHAR(100) NOT NULL,
  study_id VARCHAR(36) NOT NULL,
  arm_id VARCHAR(36),
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
  UNIQUE KEY (subject_id, study_id)
);

-- Subject visits (actual visit records)
CREATE TABLE subject_visits (
  id VARCHAR(36) PRIMARY KEY,
  subject_id VARCHAR(36) NOT NULL,
  visit_definition_id VARCHAR(36) NOT NULL,
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

-- Form data (the actual data entered)
CREATE TABLE form_data (
  id VARCHAR(36) PRIMARY KEY,
  subject_id VARCHAR(36) NOT NULL,
  subject_visit_id VARCHAR(36) NOT NULL,
  form_definition_id VARCHAR(36) NOT NULL,
  form_version VARCHAR(20) NOT NULL,
  status ENUM('not_started', 'incomplete', 'complete', 'signed', 'locked') DEFAULT 'not_started',
  -- Store form data as JSON matching the structure from form_definitions
  data JSON COMMENT 'The actual form data values keyed by field ID',
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

-- Quality control verifications for fields
-- This tracks the status of SDV, MReview, and DReview flags from your CRFBuilder
CREATE TABLE field_verifications (
  id VARCHAR(36) PRIMARY KEY,
  form_data_id VARCHAR(36) NOT NULL,
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

-- Data queries (questions/issues about form data)
CREATE TABLE data_queries (
  id VARCHAR(36) PRIMARY KEY,
  form_data_id VARCHAR(36) NOT NULL,
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

-- Query responses
CREATE TABLE query_responses (
  id VARCHAR(36) PRIMARY KEY,
  query_id VARCHAR(36) NOT NULL,
  response_text TEXT NOT NULL,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (query_id) REFERENCES data_queries(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Audit trail for data changes
CREATE TABLE audit_trail (
  id VARCHAR(36) PRIMARY KEY,
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

-- Indexes for common query patterns
CREATE INDEX idx_form_definitions_study ON form_definitions(study_id);
CREATE INDEX idx_subjects_study ON subjects(study_id);
CREATE INDEX idx_subject_visits_subject ON subject_visits(subject_id);
CREATE INDEX idx_form_data_subject ON form_data(subject_id);
CREATE INDEX idx_form_data_visit ON form_data(subject_visit_id);
CREATE INDEX idx_field_verifications_form ON field_verifications(form_data_id);
CREATE INDEX idx_data_queries_form ON data_queries(form_data_id);
CREATE INDEX idx_audit_trail_entity ON audit_trail(entity_type, entity_id);