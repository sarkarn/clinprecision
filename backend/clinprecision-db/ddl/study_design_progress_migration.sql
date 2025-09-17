-- Study Design Progress Table Migration
-- Adds table to track design progress for studies
-- File: study_design_progress_migration.sql
-- Date: September 16, 2025

USE clinprecisiondb;

-- Create study_design_progress table
CREATE TABLE study_design_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    phase VARCHAR(50) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    percentage INT NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    
    -- Constraints
    UNIQUE KEY unique_study_phase (study_id, phase),
    FOREIGN KEY fk_design_progress_study (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY fk_design_progress_created_by (created_by) REFERENCES users(id),
    FOREIGN KEY fk_design_progress_updated_by (updated_by) REFERENCES users(id),
    
    -- Indexes for performance
    INDEX idx_design_progress_study_id (study_id),
    INDEX idx_design_progress_phase (phase),
    INDEX idx_design_progress_completed (completed),
    INDEX idx_design_progress_updated_at (updated_at)
);

-- Add comments to table and columns
ALTER TABLE study_design_progress COMMENT = 'Tracks progress of study design phases';
ALTER TABLE study_design_progress MODIFY COLUMN id BIGINT AUTO_INCREMENT COMMENT 'Primary key';
ALTER TABLE study_design_progress MODIFY COLUMN study_id BIGINT NOT NULL COMMENT 'Foreign key to studies table';
ALTER TABLE study_design_progress MODIFY COLUMN phase VARCHAR(50) NOT NULL COMMENT 'Design phase name (basic-info, arms, visits, forms, review, publish, revisions)';
ALTER TABLE study_design_progress MODIFY COLUMN completed BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether this phase is completed';
ALTER TABLE study_design_progress MODIFY COLUMN percentage INT NOT NULL DEFAULT 0 COMMENT 'Completion percentage (0-100)';
ALTER TABLE study_design_progress MODIFY COLUMN notes TEXT COMMENT 'Optional notes about the phase progress';
ALTER TABLE study_design_progress MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp';
ALTER TABLE study_design_progress MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record update timestamp';
ALTER TABLE study_design_progress MODIFY COLUMN created_by BIGINT COMMENT 'User who created this record';
ALTER TABLE study_design_progress MODIFY COLUMN updated_by BIGINT COMMENT 'User who last updated this record';

-- Insert initial data for existing studies (optional)
-- This will create basic-info progress entries for all existing studies
INSERT INTO study_design_progress (study_id, phase, completed, percentage, created_at, updated_at)
SELECT 
    id as study_id,
    'basic-info' as phase,
    TRUE as completed,
    100 as percentage,
    NOW() as created_at,
    NOW() as updated_at
FROM studies
WHERE NOT EXISTS (
    SELECT 1 FROM study_design_progress 
    WHERE study_design_progress.study_id = studies.id 
    AND study_design_progress.phase = 'basic-info'
);

-- Create default progress entries for other phases for existing studies
INSERT INTO study_design_progress (study_id, phase, completed, percentage, created_at, updated_at)
SELECT 
    studies.id as study_id,
    phases.phase_name as phase,
    FALSE as completed,
    0 as percentage,
    NOW() as created_at,
    NOW() as updated_at
FROM studies
CROSS JOIN (
    SELECT 'arms' as phase_name
    UNION SELECT 'visits'
    UNION SELECT 'forms' 
    UNION SELECT 'review'
    UNION SELECT 'publish'
    UNION SELECT 'revisions'
) phases
WHERE NOT EXISTS (
    SELECT 1 FROM study_design_progress 
    WHERE study_design_progress.study_id = studies.id 
    AND study_design_progress.phase = phases.phase_name
);

-- Create a view for easy progress reporting
CREATE VIEW v_study_design_progress_summary AS
SELECT 
    s.id as study_id,
    s.name as study_name,
    COUNT(sdp.id) as total_phases,
    SUM(CASE WHEN sdp.completed = TRUE THEN 1 ELSE 0 END) as completed_phases,
    ROUND(AVG(sdp.percentage), 2) as overall_completion_percentage,
    MAX(sdp.updated_at) as last_progress_update
FROM studies s
LEFT JOIN study_design_progress sdp ON s.id = sdp.study_id
GROUP BY s.id, s.name;

-- Grant permissions (adjust as needed for your user)
GRANT SELECT, INSERT, UPDATE, DELETE ON study_design_progress TO 'clinprecadmin'@'localhost';
GRANT SELECT ON v_study_design_progress_summary TO 'clinprecadmin'@'localhost';

-- Add some helpful stored procedures
DELIMITER //

-- Procedure to initialize design progress for a new study
CREATE PROCEDURE InitializeStudyDesignProgress(IN p_study_id BIGINT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Insert basic-info as completed (since study creation is done)
    INSERT INTO study_design_progress (study_id, phase, completed, percentage)
    VALUES (p_study_id, 'basic-info', TRUE, 100)
    ON DUPLICATE KEY UPDATE 
        completed = TRUE, 
        percentage = 100,
        updated_at = NOW();
    
    -- Insert other phases as not completed
    INSERT INTO study_design_progress (study_id, phase, completed, percentage)
    VALUES 
        (p_study_id, 'arms', FALSE, 0),
        (p_study_id, 'visits', FALSE, 0),
        (p_study_id, 'forms', FALSE, 0),
        (p_study_id, 'review', FALSE, 0),
        (p_study_id, 'publish', FALSE, 0),
        (p_study_id, 'revisions', FALSE, 0)
    ON DUPLICATE KEY UPDATE 
        updated_at = NOW();
    
    COMMIT;
END //

-- Procedure to mark a phase as completed
CREATE PROCEDURE MarkPhaseCompleted(IN p_study_id BIGINT, IN p_phase VARCHAR(50), IN p_percentage INT)
BEGIN
    UPDATE study_design_progress 
    SET completed = TRUE, 
        percentage = COALESCE(p_percentage, 100),
        updated_at = NOW()
    WHERE study_id = p_study_id AND phase = p_phase;
END //

DELIMITER ;

-- Grant execute permissions on procedures
GRANT EXECUTE ON PROCEDURE InitializeStudyDesignProgress TO 'clinprecadmin'@'localhost';
GRANT EXECUTE ON PROCEDURE MarkPhaseCompleted TO 'clinprecadmin'@'localhost';

-- Migration completed successfully
SELECT 'Study design progress table migration completed successfully' AS message;