-- ClinPrecision Data Capture Service - Study Database Build Schema
-- Phase 1.1 Implementation: Study Database Build
-- Date: September 23, 2025

USE clinprecisiondb;

-- Study Database Build tracking table
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
CREATE TABLE EXISTS study_database_validations (
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

-- Indexes for existing tables to support database build operations
-- (These will be created if they don't already exist)

-- Subjects table indexes for study-specific queries
CREATE INDEX  idx_subjects_study_status ON subjects(study_id, status);
CREATE INDEX  idx_subjects_enrollment_date ON subjects(enrollment_date);


-- Form field data indexes
CREATE INDEX  idx_form_field_data_form_field ON form_field_data(form_instance_id, field_name);
CREATE INDEX  idx_form_field_data_entry_time ON form_field_data(entry_timestamp);

-- Visit instances indexes
CREATE INDEX  idx_visit_instances_subject_date ON visit_instances(subject_id, actual_date);
CREATE INDEX  idx_visit_instances_status ON visit_instances(visit_status);

-- Audit trail indexes for compliance
CREATE INDEX  idx_audit_trail_table_record ON audit_trail(table_name, record_id);
CREATE INDEX  idx_audit_trail_timestamp ON audit_trail(changed_at);
CREATE INDEX  idx_audit_trail_user ON audit_trail(changed_by);

-- Study-specific database functions and procedures

-- Function to check database readiness for a study
DELIMITER //
CREATE FUNCTION  is_study_database_ready(p_study_id BIGINT) 
RETURNS BOOLEAN
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE build_count INT DEFAULT 0;
    DECLARE completed_builds INT DEFAULT 0;
    DECLARE validation_status VARCHAR(20);
    
    -- Check if study has completed database builds
    SELECT COUNT(*) INTO build_count 
    FROM study_database_builds 
    WHERE study_id = p_study_id;
    
    SELECT COUNT(*) INTO completed_builds 
    FROM study_database_builds 
    WHERE study_id = p_study_id AND build_status = 'COMPLETED';
    
    -- Check if study database configuration is validated
    SELECT IF(is_validated = TRUE, 'VALIDATED', 'NOT_VALIDATED') INTO validation_status
    FROM study_database_configurations 
    WHERE study_id = p_study_id;
    
    -- Return true if study has completed builds and is validated
    RETURN (completed_builds > 0 AND validation_status = 'VALIDATED');
END//
DELIMITER ;

-- Stored procedure to get study database build summary
DELIMITER //
CREATE PROCEDURE  get_study_database_build_summary(IN p_study_id BIGINT)
BEGIN
    SELECT 
        sdb.id,
        sdb.build_request_id,
        sdb.build_status,
        sdb.build_start_time,
        sdb.build_end_time,
        TIMESTAMPDIFF(MINUTE, sdb.build_start_time, sdb.build_end_time) as build_duration_minutes,
        sdb.tables_created,
        sdb.indexes_created,
        sdb.triggers_created,
        sdb.forms_configured,
        sdb.validation_rules_created,
        u.first_name,
        u.last_name,
        sdc.estimated_subject_count,
        sdc.estimated_form_instances,
        sdc.storage_estimate_gb,
        sdc.is_validated as config_validated
    FROM study_database_builds sdb
    LEFT JOIN users u ON sdb.requested_by = u.id
    LEFT JOIN study_database_configurations sdc ON sdb.study_id = sdc.study_id
    WHERE sdb.study_id = p_study_id
    ORDER BY sdb.build_start_time DESC;
END//
DELIMITER ;

-- Insert initial data for testing (if needed)
-- This would be populated during actual implementation

COMMIT;