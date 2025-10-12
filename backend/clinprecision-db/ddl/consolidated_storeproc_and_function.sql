USE clinprecisiondb;

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



DELIMITER //

CREATE FUNCTION IF NOT EXISTS fn_get_patient_status_count(
    p_patient_id BIGINT
) RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE status_count INT;
    
    SELECT COUNT(*) INTO status_count
    FROM patient_status_history
    WHERE patient_id = p_patient_id;
    
    RETURN status_count;
END //


-- ============================================================================
-- Trigger: Validate Status Transition
-- Purpose: Ensure only valid status transitions are recorded
-- ============================================================================

DELIMITER //

CREATE TRIGGER trg_validate_status_transition
BEFORE INSERT ON patient_status_history
FOR EACH ROW
BEGIN
    DECLARE valid_transition BOOLEAN DEFAULT FALSE;
    
    -- Valid transitions:
    -- REGISTERED → SCREENING, WITHDRAWN
    -- SCREENING → ENROLLED, WITHDRAWN
    -- ENROLLED → ACTIVE, WITHDRAWN
    -- ACTIVE → COMPLETED, WITHDRAWN
    -- COMPLETED → (none - terminal)
    -- WITHDRAWN → (none - terminal)
    
    -- Check if transition is valid
    IF (NEW.previous_status = 'REGISTERED' AND NEW.new_status IN ('SCREENING', 'WITHDRAWN')) THEN
        SET valid_transition = TRUE;
    ELSEIF (NEW.previous_status = 'SCREENING' AND NEW.new_status IN ('ENROLLED', 'WITHDRAWN')) THEN
        SET valid_transition = TRUE;
    ELSEIF (NEW.previous_status = 'ENROLLED' AND NEW.new_status IN ('ACTIVE', 'WITHDRAWN')) THEN
        SET valid_transition = TRUE;
    ELSEIF (NEW.previous_status = 'ACTIVE' AND NEW.new_status IN ('COMPLETED', 'WITHDRAWN')) THEN
        SET valid_transition = TRUE;
    ELSEIF (NEW.new_status = 'WITHDRAWN') THEN
        -- Can always withdraw from any non-terminal status
        SET valid_transition = TRUE;
    END IF;
    
    -- Raise error if invalid transition
    IF NOT valid_transition THEN
        SET @error_msg = CONCAT(
            'Invalid status transition: ', 
            NEW.previous_status, 
            ' -> ', 
            NEW.new_status,
            '. Valid transitions: REGISTERED->SCREENING, SCREENING->ENROLLED, ENROLLED->ACTIVE, ACTIVE->COMPLETED, ANY->WITHDRAWN'
        );
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @error_msg;
    END IF;
    
    -- Validate reason is not empty
    IF NEW.reason IS NULL OR TRIM(NEW.reason) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reason is required for status change';
    END IF;
END //

DELIMITER ;


