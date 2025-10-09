USE clinprecisiondb;

DELIMITER $$


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


-- Grant permissions to the application user
GRANT SELECT, INSERT, UPDATE, DELETE ON study_documents TO 'clinprecadmin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON study_document_audit TO 'clinprecadmin'@'localhost';

DELIMITER ;


-- Create triggers for audit trail
DELIMITER //

CREATE TRIGGER code_lists_audit_insert
    AFTER INSERT ON code_lists
    FOR EACH ROW
BEGIN
    INSERT INTO code_lists_audit (
        code_list_id, operation_type, new_values, changed_by, change_reason
    ) VALUES (
        NEW.id, 'INSERT', 
        JSON_OBJECT(
            'category', NEW.category,
            'code', NEW.code,
            'display_name', NEW.display_name,
            'description', NEW.description,
            'is_active', NEW.is_active
        ),
        NEW.created_by, 'Initial creation'
    );
END //

CREATE TRIGGER code_lists_audit_update
    AFTER UPDATE ON code_lists
    FOR EACH ROW
BEGIN
    INSERT INTO code_lists_audit (
        code_list_id, operation_type, old_values, new_values, changed_by
    ) VALUES (
        NEW.id, 'UPDATE',
        JSON_OBJECT(
            'category', OLD.category,
            'code', OLD.code,
            'display_name', OLD.display_name,
            'description', OLD.description,
            'is_active', OLD.is_active
        ),
        JSON_OBJECT(
            'category', NEW.category,
            'code', NEW.code,
            'display_name', NEW.display_name,
            'description', NEW.description,
            'is_active', NEW.is_active
        ),
        NEW.updated_by
    );
END //

CREATE TRIGGER code_lists_audit_delete
    AFTER DELETE ON code_lists
    FOR EACH ROW
BEGIN
    INSERT INTO code_lists_audit (
        code_list_id, operation_type, old_values, changed_by, change_reason
    ) VALUES (
        OLD.id, 'DELETE',
        JSON_OBJECT(
            'category', OLD.category,
            'code', OLD.code,
            'display_name', OLD.display_name,
            'description', OLD.description,
            'is_active', OLD.is_active
        ),
        OLD.updated_by, 'Record deleted'
    );
END //

DELIMITER ;


-- Insert initial data for testing (if needed)
-- This would be populated during actual implementation

COMMIT;
