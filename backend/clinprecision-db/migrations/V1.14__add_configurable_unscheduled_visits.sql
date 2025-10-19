-- Migration: V1.14 - Add Configurable Unscheduled Visits Support
-- Date: October 18, 2025
-- Purpose: Enable configurable unscheduled visit types with proper foreign key support

-- ============================================================================
-- Step 1: Add is_unscheduled column to visit_definitions
-- ============================================================================
ALTER TABLE visit_definitions 
ADD COLUMN is_unscheduled BOOLEAN DEFAULT FALSE 
COMMENT 'TRUE for unscheduled visits (not in protocol timeline)';

CREATE INDEX idx_visit_def_unscheduled ON visit_definitions(study_id, is_unscheduled);

-- ============================================================================
-- Step 2: Create unscheduled_visit_config table for system-wide configuration
-- ============================================================================
CREATE TABLE unscheduled_visit_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    visit_code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique code (e.g., EARLY_TERM, AE_VISIT)',
    visit_name VARCHAR(100) NOT NULL COMMENT 'Display name (e.g., Early Termination Visit)',
    description TEXT COMMENT 'Detailed description of visit purpose',
    visit_order INT DEFAULT 9000 COMMENT 'Sort order (9000+ for unscheduled)',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT 'Enable/disable this visit type',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    
    INDEX idx_enabled (is_enabled),
    INDEX idx_visit_code (visit_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Configurable unscheduled visit types';

-- ============================================================================
-- Step 3: Insert default unscheduled visit configurations
-- ============================================================================
INSERT INTO unscheduled_visit_config 
    (visit_code, visit_name, description, visit_order, is_enabled, created_by) 
VALUES
    ('EARLY_TERM', 'Early Termination Visit', 
     'Visit conducted when subject discontinues from study prematurely', 
     9001, TRUE, 'SYSTEM'),
    
    ('UNSCHED_SAFETY', 'Unscheduled Safety Visit', 
     'Visit conducted for safety monitoring outside scheduled visits', 
     9002, TRUE, 'SYSTEM'),
    
    ('AE_VISIT', 'Adverse Event Visit', 
     'Visit conducted to assess or follow up on adverse event', 
     9003, TRUE, 'SYSTEM'),
    
    ('PROTO_DEV', 'Protocol Deviation Visit', 
     'Visit conducted outside protocol due to deviation or amendment', 
     9004, TRUE, 'SYSTEM'),
    
    ('UNSCHED_FU', 'Unscheduled Follow-up', 
     'Unplanned follow-up visit for additional monitoring', 
     9005, TRUE, 'SYSTEM');

-- ============================================================================
-- Step 4: Create audit triggers for unscheduled_visit_config
-- ============================================================================
DELIMITER $$

CREATE TRIGGER trg_unscheduled_visit_config_audit_insert
AFTER INSERT ON unscheduled_visit_config
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (
        table_name,
        operation,
        record_id,
        changed_by,
        changed_at,
        new_values
    ) VALUES (
        'unscheduled_visit_config',
        'INSERT',
        NEW.id,
        NEW.created_by,
        NOW(),
        JSON_OBJECT(
            'visit_code', NEW.visit_code,
            'visit_name', NEW.visit_name,
            'is_enabled', NEW.is_enabled
        )
    );
END$$

CREATE TRIGGER trg_unscheduled_visit_config_audit_update
AFTER UPDATE ON unscheduled_visit_config
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (
        table_name,
        operation,
        record_id,
        changed_by,
        changed_at,
        old_values,
        new_values
    ) VALUES (
        'unscheduled_visit_config',
        'UPDATE',
        NEW.id,
        NEW.updated_by,
        NOW(),
        JSON_OBJECT(
            'visit_code', OLD.visit_code,
            'visit_name', OLD.visit_name,
            'is_enabled', OLD.is_enabled
        ),
        JSON_OBJECT(
            'visit_code', NEW.visit_code,
            'visit_name', NEW.visit_name,
            'is_enabled', NEW.is_enabled
        )
    );
END$$

DELIMITER ;

-- ============================================================================
-- Step 5: Add helpful comments
-- ============================================================================
ALTER TABLE visit_definitions 
MODIFY COLUMN id BIGINT AUTO_INCREMENT 
COMMENT 'Primary key; copied to study_visit_instances.visit_id for FK relationship';

ALTER TABLE study_visit_instances
MODIFY COLUMN visit_id BIGINT NOT NULL 
COMMENT 'FK to visit_definitions.id - now supports both scheduled and unscheduled visits';

-- ============================================================================
-- Verification Queries (commented out - for manual testing)
-- ============================================================================
-- SELECT * FROM unscheduled_visit_config WHERE is_enabled = TRUE;
-- SELECT * FROM visit_definitions WHERE is_unscheduled = TRUE;
-- SHOW COLUMNS FROM visit_definitions LIKE 'is_unscheduled';
