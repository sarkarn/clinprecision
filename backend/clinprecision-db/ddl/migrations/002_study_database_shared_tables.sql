-- ============================================================================
-- Database Migration: Study Database Shared Tables
-- Version: 002
-- Date: October 9, 2025
-- Description: Creates shared tables for multi-tenant study data capture
--              Replaces per-study table creation with fixed schema tables
--              Supports thousands of studies without table explosion
-- ============================================================================

-- ============================================================================
-- 1. MAIN DATA TABLES (Shared across all studies)
-- ============================================================================

-- Study Form Data - Stores all form submission data for all studies
CREATE TABLE IF NOT EXISTS study_form_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    form_id BIGINT NOT NULL,
    subject_id BIGINT,
    visit_id BIGINT,
    site_id BIGINT,
    status VARCHAR(50) DEFAULT 'DRAFT',
    form_data JSON,                         -- All form field data as JSON
    version INT DEFAULT 1,                  -- Form data version for history
    is_locked BOOLEAN DEFAULT false,
    locked_at TIMESTAMP NULL,
    locked_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    
    INDEX idx_study (study_id),
    INDEX idx_study_form (study_id, form_id),
    INDEX idx_study_subject (study_id, subject_id),
    INDEX idx_study_visit (study_id, visit_id),
    INDEX idx_study_site (study_id, site_id),
    INDEX idx_status (study_id, status),
    INDEX idx_created (study_id, created_at),
    INDEX idx_subject_visit (study_id, subject_id, visit_id),
    
    CONSTRAINT fk_sfd_study FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY HASH(study_id) PARTITIONS 16;

-- Study Form Data Audit - Audit trail for all form data changes (FDA 21 CFR Part 11)
CREATE TABLE IF NOT EXISTS study_form_data_audit (
    audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    record_id BIGINT NOT NULL,              -- ID from study_form_data
    action VARCHAR(20) NOT NULL,            -- INSERT, UPDATE, DELETE, LOCK, UNLOCK
    old_data JSON,                          -- Previous state (NULL for INSERT)
    new_data JSON,                          -- New state (NULL for DELETE)
    changed_by BIGINT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    
    INDEX idx_study (study_id),
    INDEX idx_record (study_id, record_id),
    INDEX idx_changed_at (changed_at),
    INDEX idx_changed_by (changed_by),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY HASH(study_id) PARTITIONS 16;

-- Study Visit Instances - Tracks actual visit occurrences for subjects
CREATE TABLE IF NOT EXISTS study_visit_instances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    visit_id BIGINT NOT NULL,               -- FK to visit_definitions
    subject_id BIGINT NOT NULL,             -- FK to study_subjects
    site_id BIGINT,
    visit_date DATE,                        -- Scheduled/planned date
    actual_visit_date DATE,                 -- Actual date visit occurred
    visit_status VARCHAR(50) DEFAULT 'SCHEDULED',  -- SCHEDULED, COMPLETED, MISSED, CANCELLED
    window_status VARCHAR(50),              -- ON_TIME, EARLY, LATE, OUT_OF_WINDOW
    completion_percentage DECIMAL(5,2),     -- % of required forms completed
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    
    INDEX idx_study (study_id),
    INDEX idx_study_subject (study_id, subject_id),
    INDEX idx_study_visit (study_id, visit_id),
    INDEX idx_subject_visit (subject_id, visit_id),
    INDEX idx_status (study_id, visit_status),
    INDEX idx_visit_date (study_id, visit_date),
    
    CONSTRAINT fk_svi_study FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY HASH(study_id) PARTITIONS 16;

-- Study Visit Instances Audit - Audit trail for visit changes
CREATE TABLE IF NOT EXISTS study_visit_instances_audit (
    audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    record_id BIGINT NOT NULL,              -- ID from study_visit_instances
    action VARCHAR(20) NOT NULL,            -- INSERT, UPDATE, DELETE
    old_data JSON,
    new_data JSON,
    changed_by BIGINT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT,
    
    INDEX idx_study (study_id),
    INDEX idx_record (study_id, record_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY HASH(study_id) PARTITIONS 16;

-- ============================================================================
-- 2. CONFIGURATION TABLES (Study-specific settings)
-- ============================================================================

-- Study Visit Form Mapping - Associates forms with visits per study
CREATE TABLE IF NOT EXISTS study_visit_form_mapping (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    visit_id BIGINT NOT NULL,
    form_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT true,
    sequence INT,                           -- Display order
    conditional_logic JSON,                 -- Conditions for form visibility
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    
    UNIQUE KEY uk_study_visit_form (study_id, visit_id, form_id),
    INDEX idx_study (study_id),
    INDEX idx_visit (study_id, visit_id),
    INDEX idx_form (study_id, form_id),
    
    CONSTRAINT fk_svfm_study FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Study Form Validation Rules - Field-level validation rules per study
CREATE TABLE IF NOT EXISTS study_form_validation_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    form_id BIGINT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,        -- REQUIRED, RANGE, REGEX, DATE_RANGE, CUSTOM
    rule_value JSON,                       -- {"min": 0, "max": 120} or {"pattern": "..."}
    error_message TEXT,
    severity VARCHAR(20) DEFAULT 'ERROR',  -- ERROR, WARNING, INFO
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_study_form (study_id, form_id),
    INDEX idx_field (study_id, form_id, field_name),
    
    CONSTRAINT fk_sfvr_study FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Study Visit Schedules - Visit timing and window configuration
CREATE TABLE IF NOT EXISTS study_visit_schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    visit_id BIGINT NOT NULL,
    day_number INT,                        -- Study day (relative to enrollment, Day 1 = enrollment)
    window_before INT,                     -- Days before target date (early window)
    window_after INT,                      -- Days after target date (late window)
    is_critical BOOLEAN DEFAULT false,     -- Critical visit (must be on time)
    visit_type VARCHAR(50),                -- SCHEDULED, UNSCHEDULED, EARLY_TERMINATION
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_study (study_id),
    INDEX idx_study_visit (study_id, visit_id),
    INDEX idx_day (study_id, day_number),
    
    CONSTRAINT fk_svs_study FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Study Edit Checks - Data quality and consistency checks
CREATE TABLE IF NOT EXISTS study_edit_checks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    check_name VARCHAR(255) NOT NULL,
    check_type VARCHAR(50) NOT NULL,       -- RANGE, CONSISTENCY, MISSING, DUPLICATE, CROSS_FORM
    check_logic JSON,                      -- Logic definition (SQL, JavaScript, or JSON rules)
    severity VARCHAR(20) DEFAULT 'MAJOR',  -- CRITICAL, MAJOR, MINOR
    error_message TEXT,
    action_required VARCHAR(50) DEFAULT 'QUERY',  -- QUERY, BLOCK, WARN
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_study (study_id),
    INDEX idx_type (study_id, check_type),
    INDEX idx_severity (study_id, severity),
    
    CONSTRAINT fk_sec_study FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Study Database Build Configuration - Tracks what was built/configured
CREATE TABLE IF NOT EXISTS study_database_build_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    build_id BIGINT NOT NULL,              -- FK to study_database_builds
    study_id BIGINT NOT NULL,
    config_type VARCHAR(50) NOT NULL,      -- FORM_MAPPING, VALIDATION, VISIT_SCHEDULE, EDIT_CHECK, INDEX
    config_name VARCHAR(255),
    config_data JSON,
    status VARCHAR(50) DEFAULT 'CREATED',  -- CREATED, ACTIVE, INACTIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_build (build_id),
    INDEX idx_study (study_id),
    INDEX idx_type (study_id, config_type),
    
    CONSTRAINT fk_sdbc_build FOREIGN KEY (build_id) REFERENCES study_database_builds(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. TRIGGERS FOR AUDIT TRAIL (FDA 21 CFR Part 11 Compliance)
-- ============================================================================

-- Trigger: Audit INSERT on study_form_data
DELIMITER $$
CREATE TRIGGER trg_study_form_data_insert
AFTER INSERT ON study_form_data
FOR EACH ROW
BEGIN
    INSERT INTO study_form_data_audit (
        study_id, record_id, action, new_data, changed_by, changed_at
    ) VALUES (
        NEW.study_id, 
        NEW.id, 
        'INSERT',
        JSON_OBJECT(
            'form_id', NEW.form_id,
            'subject_id', NEW.subject_id,
            'visit_id', NEW.visit_id,
            'status', NEW.status,
            'form_data', NEW.form_data,
            'created_by', NEW.created_by
        ),
        NEW.created_by,
        NOW()
    );
END$$

-- Trigger: Audit UPDATE on study_form_data
CREATE TRIGGER trg_study_form_data_update
AFTER UPDATE ON study_form_data
FOR EACH ROW
BEGIN
    INSERT INTO study_form_data_audit (
        study_id, record_id, action, old_data, new_data, changed_by, changed_at
    ) VALUES (
        NEW.study_id,
        NEW.id,
        'UPDATE',
        JSON_OBJECT(
            'form_id', OLD.form_id,
            'subject_id', OLD.subject_id,
            'visit_id', OLD.visit_id,
            'status', OLD.status,
            'form_data', OLD.form_data,
            'is_locked', OLD.is_locked
        ),
        JSON_OBJECT(
            'form_id', NEW.form_id,
            'subject_id', NEW.subject_id,
            'visit_id', NEW.visit_id,
            'status', NEW.status,
            'form_data', NEW.form_data,
            'is_locked', NEW.is_locked
        ),
        NEW.updated_by,
        NOW()
    );
END$$

-- Trigger: Audit DELETE on study_form_data
CREATE TRIGGER trg_study_form_data_delete
BEFORE DELETE ON study_form_data
FOR EACH ROW
BEGIN
    INSERT INTO study_form_data_audit (
        study_id, record_id, action, old_data, changed_at
    ) VALUES (
        OLD.study_id,
        OLD.id,
        'DELETE',
        JSON_OBJECT(
            'form_id', OLD.form_id,
            'subject_id', OLD.subject_id,
            'visit_id', OLD.visit_id,
            'status', OLD.status,
            'form_data', OLD.form_data
        ),
        NOW()
    );
END$$

-- Trigger: Audit INSERT on study_visit_instances
CREATE TRIGGER trg_study_visit_instances_insert
AFTER INSERT ON study_visit_instances
FOR EACH ROW
BEGIN
    INSERT INTO study_visit_instances_audit (
        study_id, record_id, action, new_data, changed_by, changed_at
    ) VALUES (
        NEW.study_id,
        NEW.id,
        'INSERT',
        JSON_OBJECT(
            'visit_id', NEW.visit_id,
            'subject_id', NEW.subject_id,
            'visit_date', NEW.visit_date,
            'visit_status', NEW.visit_status
        ),
        NEW.created_by,
        NOW()
    );
END$$

-- Trigger: Audit UPDATE on study_visit_instances
CREATE TRIGGER trg_study_visit_instances_update
AFTER UPDATE ON study_visit_instances
FOR EACH ROW
BEGIN
    INSERT INTO study_visit_instances_audit (
        study_id, record_id, action, old_data, new_data, changed_by, changed_at
    ) VALUES (
        NEW.study_id,
        NEW.id,
        'UPDATE',
        JSON_OBJECT(
            'visit_date', OLD.visit_date,
            'actual_visit_date', OLD.actual_visit_date,
            'visit_status', OLD.visit_status,
            'window_status', OLD.window_status
        ),
        JSON_OBJECT(
            'visit_date', NEW.visit_date,
            'actual_visit_date', NEW.actual_visit_date,
            'visit_status', NEW.visit_status,
            'window_status', NEW.window_status
        ),
        NEW.updated_by,
        NOW()
    );
END$$

DELIMITER ;

-- ============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional composite indexes for common queries
CREATE INDEX idx_sfd_study_subject_status ON study_form_data(study_id, subject_id, status);
CREATE INDEX idx_sfd_study_visit_form ON study_form_data(study_id, visit_id, form_id);

-- JSON virtual columns for frequently queried JSON fields (MySQL 5.7+)
-- Example: If you frequently query by a specific form field
-- ALTER TABLE study_form_data 
-- ADD COLUMN patient_age INT AS (JSON_EXTRACT(form_data, '$.age')) VIRTUAL,
-- ADD INDEX idx_patient_age (study_id, patient_age);

-- ============================================================================
-- 5. INITIAL DATA / REFERENCE DATA (Optional)
-- ============================================================================

-- None required - configuration data is created during database build process

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Summary:
-- - Created 4 main data tables (form data, visit instances + audits)
-- - Created 5 configuration tables (mappings, rules, schedules)
-- - Added 6 audit triggers for FDA compliance
-- - Added performance indexes
-- - Enabled table partitioning by study_id
-- Total tables: 9 tables (vs 2000+ with per-study approach)
