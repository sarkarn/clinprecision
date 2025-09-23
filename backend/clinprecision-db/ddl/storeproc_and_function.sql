USE clinprecisiondb;

DELIMITER $$

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
    id, form_data_id, subject_id, subject_visit_id, 
    form_definition_id, form_version, status, data,
    changed_by, change_timestamp, change_type, change_reason
  )
  VALUES (
    UUID(), NEW.id, NEW.subject_id, NEW.subject_visit_id,
    NEW.form_definition_id, NEW.form_version, NEW.status, NEW.data,
    NEW.updated_by, NOW(), change_type, NEW.entry_reason
  );
END //

CREATE TRIGGER after_form_data_insert
AFTER INSERT ON form_data
FOR EACH ROW
BEGIN
  INSERT INTO form_data_history (
    id, form_data_id, subject_id, subject_visit_id, 
    form_definition_id, form_version, status, data,
    changed_by, change_timestamp, change_type, change_reason
  )
  VALUES (
    UUID(), NEW.id, NEW.subject_id, NEW.subject_visit_id,
    NEW.form_definition_id, NEW.form_version, NEW.status, NEW.data,
    NEW.created_by, NOW(), 'create', NEW.entry_reason
  );
END //

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


-- Add helpful views for overview dashboard queries
CREATE OR REPLACE VIEW v_study_overview_summary AS
SELECT 
    s.id,
    s.name,
    s.protocol_number,
    s.therapeutic_area,
    s.study_coordinator,
    s.sponsor,
    CONCAT(s.name, ' (', COALESCE(s.protocol_number, 'No Protocol'), ')') as title,
    CONCAT('Protocol: ', COALESCE(s.protocol_number, 'Not Assigned')) as protocol,
    s.indication,
    s.principal_investigator,
    s.active_sites,
    s.total_sites,
    s.planned_subjects,
    s.enrolled_subjects,
    s.screened_subjects,
    s.randomized_subjects,
    s.completed_subjects,
    s.withdrawn_subjects,
    s.enrollment_rate,
    s.screening_success_rate,
    s.first_patient_in_date,
    s.last_patient_in_date,
    s.estimated_completion_date,
    s.primary_endpoint,
    s.secondary_endpoints,
    s.inclusion_criteria,
    s.exclusion_criteria,
    s.recent_activities,
    s.timeline,
    s.study_duration_weeks,
    s.recruitment_status,
    s.database_lock_status,
    s.data_lock_date,
    s.monitoring_visits_completed,
    s.adverse_events_reported,
    s.protocol_deviations,
    s.queries_open,
    s.queries_resolved,
    s.sdv_percentage,
    ss.name as study_status_name,
    rs.name as regulatory_status_name,
    sp.name as study_phase_name,
    s.created_at,
    s.updated_at
FROM studies s
LEFT JOIN study_status ss ON s.study_status_id = ss.id
LEFT JOIN regulatory_status rs ON s.regulatory_status_id = rs.id  
LEFT JOIN study_phase sp ON s.study_phase_id = sp.id;

-- Create a view for study metrics summary
CREATE OR REPLACE VIEW v_study_metrics_summary AS
SELECT 
    study_id,
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_subjects,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_subjects,
    SUM(CASE WHEN status = 'withdrawn' THEN 1 ELSE 0 END) as withdrawn_subjects,
    SUM(CASE WHEN status = 'screening' THEN 1 ELSE 0 END) as screening_subjects,
    COUNT(*) as total_subjects
FROM subjects 
GROUP BY study_id;

-- Grant permissions to the database user
GRANT SELECT ON v_study_overview_summary TO 'clinprecadmin'@'localhost';
GRANT SELECT ON v_study_metrics_summary TO 'clinprecadmin'@'localhost';

-- Create a view for easy document queries with user information
CREATE VIEW v_study_documents_with_users AS
SELECT 
    sd.id,
    sd.study_id,
    sd.name,
    sd.document_type,
    sd.file_name,
    sd.file_path,
    sd.file_size,
    sd.mime_type,
    sd.version,
    sd.status,
    sd.description,
    sd.uploaded_at,
    sd.created_at,
    sd.updated_at,
    CONCAT(u.first_name, ' ', u.last_name) as uploaded_by_name,
    u.email as uploaded_by_email,
    s.name as study_name,
    s.protocol_number
FROM study_documents sd
LEFT JOIN users u ON sd.uploaded_by = u.id
LEFT JOIN studies s ON sd.study_id = s.id;



-- Grant permissions to the application user
GRANT SELECT, INSERT, UPDATE, DELETE ON study_documents TO 'clinprecadmin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON study_document_audit TO 'clinprecadmin'@'localhost';
GRANT SELECT ON v_study_documents_with_users TO 'clinprecadmin'@'localhost';

-- Create stored procedure for secure document deletion
DELIMITER //

CREATE PROCEDURE DeleteStudyDocument(
    IN p_document_id BIGINT,
    IN p_user_id BIGINT,
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT,
    IN p_reason TEXT
)
BEGIN
    DECLARE document_exists INT DEFAULT 0;
    DECLARE document_info JSON;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Check if document exists and get its info
    SELECT COUNT(*), JSON_OBJECT(
        'name', name,
        'document_type', document_type,
        'file_path', file_path,
        'status', status
    )
    INTO document_exists, document_info
    FROM study_documents 
    WHERE id = p_document_id;
    
    IF document_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Document not found';
    END IF;
    
    -- Log the deletion in audit trail
    INSERT INTO study_document_audit (
        document_id, action_type, old_values, performed_by, 
        ip_address, user_agent, notes
    ) VALUES (
        p_document_id, 'DELETE', document_info, p_user_id,
        p_ip_address, p_user_agent, p_reason
    );
    
    -- Delete the document record
    DELETE FROM study_documents WHERE id = p_document_id;
    
    COMMIT;
END //

DELIMITER ;

-- Grant execute permission on the stored procedure
GRANT EXECUTE ON PROCEDURE DeleteStudyDocument TO 'clinprecadmin'@'localhost';

-- Add helpful functions for file size formatting
DELIMITER //

CREATE FUNCTION FormatFileSize(size_bytes BIGINT) 
RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE result VARCHAR(20);
    
    IF size_bytes < 1024 THEN
        SET result = CONCAT(size_bytes, ' B');
    ELSEIF size_bytes < 1048576 THEN
        SET result = CONCAT(ROUND(size_bytes / 1024, 1), ' KB');
    ELSEIF size_bytes < 1073741824 THEN
        SET result = CONCAT(ROUND(size_bytes / 1048576, 1), ' MB');
    ELSE
        SET result = CONCAT(ROUND(size_bytes / 1073741824, 1), ' GB');
    END IF;
    
    RETURN result;
END //

DELIMITER ;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION FormatFileSize TO 'clinprecadmin'@'localhost';

-- Create an enhanced view with formatted file sizes
CREATE VIEW v_study_documents_formatted AS
SELECT 
    sd.*,
    FormatFileSize(sd.file_size) as formatted_file_size,
    CONCAT(u.first_name, ' ', u.last_name) as uploaded_by_name,
    s.name as study_name
FROM study_documents sd
LEFT JOIN users u ON sd.uploaded_by = u.id
LEFT JOIN studies s ON sd.study_id = s.id;

GRANT SELECT ON v_study_documents_formatted TO 'clinprecadmin'@'localhost';

-- View: Active study versions
CREATE OR REPLACE VIEW active_study_versions AS
SELECT 
    sv.*,
    s.name as study_name,
    s.protocol_number
FROM study_versions sv
JOIN studies s ON sv.study_id = s.id
WHERE sv.status = 'ACTIVE';

-- View: Study version history with changes
CREATE OR REPLACE VIEW study_version_history AS
SELECT 
    sv.*,
    s.name as study_name,
    s.protocol_number,
    prev_sv.version_number as previous_version,
    DATEDIFF(sv.created_date, prev_sv.created_date) as days_since_previous,
    (SELECT COUNT(*) FROM study_amendments sa WHERE sa.study_version_id = sv.id) as amendment_count
FROM study_versions sv
JOIN studies s ON sv.study_id = s.id
LEFT JOIN study_versions prev_sv ON sv.previous_version_id = prev_sv.id
ORDER BY sv.study_id, sv.created_date DESC;

-- View: Pending regulatory approvals
CREATE OR REPLACE VIEW pending_regulatory_approvals AS
SELECT 
    sv.*,
    s.name as study_name,
    s.protocol_number,
    DATEDIFF(NOW(), sv.created_date) as days_pending
FROM study_versions sv
JOIN studies s ON sv.study_id = s.id
WHERE sv.requires_regulatory_approval = TRUE 
  AND sv.status IN ('DRAFT', 'UNDER_REVIEW', 'SUBMITTED')
ORDER BY sv.created_date ASC;

-- =====================================================
-- Stored procedures for common operations
-- =====================================================

DELIMITER //

-- Procedure: Create new study version with automatic version numbering
CREATE PROCEDURE CreateStudyVersion(
    IN p_study_id BIGINT,
    IN p_amendment_type ENUM('MAJOR', 'MINOR', 'SAFETY', 'ADMINISTRATIVE'),
    IN p_amendment_reason TEXT,
    IN p_description TEXT,
    IN p_created_by BIGINT,
    IN p_effective_date DATE,
    IN p_notify_stakeholders BOOLEAN,
    IN p_requires_regulatory BOOLEAN,
    OUT p_version_id BIGINT,
    OUT p_version_number VARCHAR(20)
)
BEGIN
    DECLARE v_latest_version VARCHAR(20);
    DECLARE v_major_num INT DEFAULT 1;
    DECLARE v_minor_num INT DEFAULT 0;
    DECLARE v_new_version VARCHAR(20);
    DECLARE v_previous_version_id BIGINT DEFAULT NULL;
    
    -- Get the latest version for this study
    SELECT version_number, id INTO v_latest_version, v_previous_version_id
    FROM study_versions 
    WHERE study_id = p_study_id 
    ORDER BY created_date DESC 
    LIMIT 1;
    
    -- Calculate next version number
    IF v_latest_version IS NOT NULL THEN
        -- Parse current version (assuming format like 'v1.2')
        SET v_major_num = CAST(SUBSTRING(v_latest_version, 2, LOCATE('.', v_latest_version) - 2) AS UNSIGNED);
        SET v_minor_num = CAST(SUBSTRING(v_latest_version, LOCATE('.', v_latest_version) + 1) AS UNSIGNED);
        
        -- Increment based on amendment type
        IF p_amendment_type IN ('MAJOR', 'SAFETY') THEN
            SET v_major_num = v_major_num + 1;
            SET v_minor_num = 0;
        ELSE
            SET v_minor_num = v_minor_num + 1;
        END IF;
    END IF;
    
    SET v_new_version = CONCAT('v', v_major_num, '.', v_minor_num);
    
    -- Insert new version
    INSERT INTO study_versions (
        study_id, version_number, amendment_type, amendment_reason,
        description, created_by, effective_date, notify_stakeholders,
        requires_regulatory_approval, previous_version_id
    ) VALUES (
        p_study_id, v_new_version, p_amendment_type, p_amendment_reason,
        p_description, p_created_by, p_effective_date, p_notify_stakeholders,
        p_requires_regulatory, v_previous_version_id
    );
    
    SET p_version_id = LAST_INSERT_ID();
    SET p_version_number = v_new_version;
END//

-- Procedure: Activate a study version (mark others as superseded)
CREATE PROCEDURE ActivateStudyVersion(
    IN p_version_id BIGINT
)
BEGIN
    DECLARE v_study_id BIGINT;
    
    -- Get the study ID for this version
    SELECT study_id INTO v_study_id
    FROM study_versions
    WHERE id = p_version_id;
    
    -- Mark all other active versions for this study as superseded
    UPDATE study_versions 
    SET status = 'SUPERSEDED'
    WHERE study_id = v_study_id 
      AND status = 'ACTIVE' 
      AND id != p_version_id;
    
    -- Activate the specified version
    UPDATE study_versions 
    SET status = 'ACTIVE',
        effective_date = COALESCE(effective_date, CURDATE())
    WHERE id = p_version_id;
END//

DELIMITER ;

-- =====================================================
-- Triggers for audit and data integrity
-- =====================================================

-- Trigger: Automatically set amendment number for new amendments
DELIMITER //
CREATE TRIGGER trg_amendment_number_auto_increment
BEFORE INSERT ON study_amendments
FOR EACH ROW
BEGIN
    DECLARE v_next_number INT;
    
    -- Get the next amendment number for this version
    SELECT COALESCE(MAX(amendment_number), 0) + 1
    INTO v_next_number
    FROM study_amendments
    WHERE study_version_id = NEW.study_version_id;
    
    SET NEW.amendment_number = v_next_number;
END//
DELIMITER ;

-- Trigger: Update study amendment count when amendments are added/removed
DELIMITER //
CREATE TRIGGER trg_update_study_amendment_count_insert
AFTER INSERT ON study_versions
FOR EACH ROW
BEGIN
    UPDATE studies 
    SET amendments = (
        SELECT COUNT(*) 
        FROM study_versions sv 
        WHERE sv.study_id = NEW.study_id
    )
    WHERE id = NEW.study_id;
END//

CREATE TRIGGER trg_update_study_amendment_count_delete
AFTER DELETE ON study_versions
FOR EACH ROW
BEGIN
    UPDATE studies 
    SET amendments = (
        SELECT COUNT(*) 
        FROM study_versions sv 
        WHERE sv.study_id = OLD.study_id
    )
    WHERE id = OLD.study_id;
END//
DELIMITER ;


DELIMITER //

CREATE PROCEDURE ComputeAndUpdateStudyStatus(
    IN p_study_id BIGINT,
    IN p_trigger_source VARCHAR(50),
    IN p_trigger_details TEXT
)
BEGIN
    DECLARE v_current_status_id BIGINT;
    DECLARE v_current_status_code VARCHAR(100);
    DECLARE v_computed_status_code VARCHAR(100);
    DECLARE v_computed_status_id BIGINT;
    DECLARE v_status_changed BOOLEAN DEFAULT FALSE;
    DECLARE v_error_message TEXT DEFAULT '';
    
    -- Error handling
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            v_error_message = MESSAGE_TEXT;
        
        INSERT INTO study_status_computation_log (
            study_id, trigger_source, old_status_code, new_status_code,
            computation_result, error_message, created_at
        ) VALUES (
            p_study_id, p_trigger_source, v_current_status_code, NULL,
            'ERROR', v_error_message, NOW()
        );
        
        RESIGNAL;
    END;
    
    -- Get current study status
    SELECT s.study_status_id, ss.code 
    INTO v_current_status_id, v_current_status_code
    FROM studies s
    LEFT JOIN study_status ss ON s.study_status_id = ss.id
    WHERE s.id = p_study_id;
    
    -- Compute new status based on study versions and amendments
    CALL DetermineStudyStatusFromVersions(p_study_id, v_computed_status_code);
    
    -- Get the ID for the computed status
    SELECT id INTO v_computed_status_id
    FROM study_status
    WHERE code = v_computed_status_code;
    
    -- Update study status if it has changed
    IF v_current_status_code != v_computed_status_code OR v_current_status_id IS NULL THEN
        SET v_status_changed = TRUE;
        
        UPDATE studies 
        SET study_status_id = v_computed_status_id,
            updated_at = NOW()
        WHERE id = p_study_id;
        
        -- Log the status change
        CALL LogStudyStatusChange(
            p_study_id, 
            p_trigger_source, 
            v_current_status_code, 
            v_computed_status_code,
            'SUCCESS',
            p_trigger_details
        );
    ELSE
        -- Log that no change was needed
        CALL LogStudyStatusChange(
            p_study_id, 
            p_trigger_source, 
            v_current_status_code, 
            v_computed_status_code,
            'NO_CHANGE',
            p_trigger_details
        );
    END IF;
    
END//

-- =====================================================
-- Procedure to determine study status from versions and amendments
-- =====================================================

CREATE PROCEDURE DetermineStudyStatusFromVersions(
    IN p_study_id BIGINT,
    OUT p_computed_status VARCHAR(100)
)
BEGIN
    DECLARE v_has_active_versions INT DEFAULT 0;
    DECLARE v_has_approved_versions INT DEFAULT 0;
    DECLARE v_has_under_review_versions INT DEFAULT 0;
    DECLARE v_has_draft_versions INT DEFAULT 0;
    DECLARE v_has_pending_safety_amendments INT DEFAULT 0;
    DECLARE v_has_critical_amendments INT DEFAULT 0;
    DECLARE v_total_versions INT DEFAULT 0;
    DECLARE v_current_status_code VARCHAR(100);
    
    -- Get current status to consider for transitions
    SELECT ss.code INTO v_current_status_code
    FROM studies s
    LEFT JOIN study_status ss ON s.study_status_id = ss.id
    WHERE s.id = p_study_id;
    
    -- Count versions by status
    SELECT 
        COUNT(*) as total_versions,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_versions,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved_versions,
        SUM(CASE WHEN status = 'UNDER_REVIEW' THEN 1 ELSE 0 END) as under_review_versions,
        SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as draft_versions
    INTO v_total_versions, v_has_active_versions, v_has_approved_versions, 
         v_has_under_review_versions, v_has_draft_versions
    FROM study_versions
    WHERE study_id = p_study_id;
    
    -- Check for pending safety amendments
    SELECT COUNT(*) INTO v_has_pending_safety_amendments
    FROM study_amendments sa
    JOIN study_versions sv ON sa.study_version_id = sv.id
    WHERE sv.study_id = p_study_id
      AND sa.amendment_type = 'SAFETY'
      AND sa.status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW');
    
    -- Check for critical amendments requiring immediate attention
    SELECT COUNT(*) INTO v_has_critical_amendments
    FROM study_amendments sa
    JOIN study_versions sv ON sa.study_version_id = sv.id
    WHERE sv.study_id = p_study_id
      AND sa.amendment_type = 'SAFETY'
      AND sa.status = 'UNDER_REVIEW'
      AND sa.requires_regulatory_notification = TRUE;
    
    -- Apply status computation logic
    
    -- 1. If study has active versions, it should be ACTIVE (unless there are critical issues)
    IF v_has_active_versions > 0 THEN
        IF v_has_critical_amendments > 0 THEN
            SET p_computed_status = 'SUSPENDED';
        ELSE
            SET p_computed_status = 'ACTIVE';
        END IF;
        
    -- 2. If study has approved versions but no active ones, it should be APPROVED
    ELSEIF v_has_approved_versions > 0 THEN
        SET p_computed_status = 'APPROVED';
        
    -- 3. If study has versions under review, it should be UNDER_REVIEW
    ELSEIF v_has_under_review_versions > 0 THEN
        SET p_computed_status = 'UNDER_REVIEW';
        
    -- 4. If study only has draft versions, it should be DRAFT or PLANNING
    ELSEIF v_has_draft_versions > 0 THEN
        -- If there are pending safety amendments, keep in PLANNING
        IF v_has_pending_safety_amendments > 0 THEN
            SET p_computed_status = 'PLANNING';
        ELSE
            SET p_computed_status = 'DRAFT';
        END IF;
        
    -- 5. If no versions exist, default to DRAFT
    ELSEIF v_total_versions = 0 THEN
        SET p_computed_status = 'DRAFT';
        
    -- 6. For terminal states, preserve existing status if it's terminal
    ELSEIF v_current_status_code IN ('COMPLETED', 'TERMINATED', 'WITHDRAWN') THEN
        SET p_computed_status = v_current_status_code;
        
    -- 7. Default fallback
    ELSE
        SET p_computed_status = 'DRAFT';
    END IF;
    
END//

-- =====================================================
-- Procedure to log study status changes
-- =====================================================

CREATE PROCEDURE LogStudyStatusChange(
    IN p_study_id BIGINT,
    IN p_trigger_source VARCHAR(50),
    IN p_old_status_code VARCHAR(100),
    IN p_new_status_code VARCHAR(100),
    IN p_computation_result VARCHAR(20),
    IN p_trigger_details TEXT
)
BEGIN
    INSERT INTO study_status_computation_log (
        study_id, 
        trigger_source, 
        old_status_code, 
        new_status_code,
        computation_result,
        trigger_details,
        created_at
    ) VALUES (
        p_study_id, 
        p_trigger_source, 
        p_old_status_code, 
        p_new_status_code,
        p_computation_result,
        p_trigger_details,
        NOW()
    );
END//

DELIMITER ;

-- =====================================================
-- Create logging table for status computation tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS study_status_computation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    trigger_source VARCHAR(50) NOT NULL COMMENT 'Source of the trigger (version_change, amendment_change, etc.)',
    old_status_code VARCHAR(100) COMMENT 'Previous status code',
    new_status_code VARCHAR(100) COMMENT 'New computed status code',
    computation_result ENUM('SUCCESS', 'NO_CHANGE', 'ERROR') NOT NULL,
    trigger_details TEXT COMMENT 'Additional details about what triggered the computation',
    error_message TEXT COMMENT 'Error message if computation failed',
    computation_time_ms INT COMMENT 'Time taken for computation in milliseconds',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_study_status_log_study_id (study_id),
    INDEX idx_study_status_log_source (trigger_source),
    INDEX idx_study_status_log_result (computation_result),
    INDEX idx_study_status_log_created (created_at),
    
    -- Foreign key constraint
    CONSTRAINT fk_status_log_study_id FOREIGN KEY (study_id) REFERENCES studies (id) ON DELETE CASCADE
);

-- =====================================================
-- Triggers for study_versions table
-- =====================================================

DELIMITER //

-- Trigger: When a study version is updated
CREATE TRIGGER trg_compute_study_status_on_version_change
AFTER UPDATE ON study_versions
FOR EACH ROW
BEGIN
    DECLARE v_trigger_details TEXT;
    
    -- Only trigger if status actually changed
    IF OLD.status != NEW.status THEN
        SET v_trigger_details = CONCAT(
            'Version ', NEW.version_number, 
            ' status changed from ', OLD.status, 
            ' to ', NEW.status,
            ' (Version ID: ', NEW.id, ')'
        );
        
        CALL ComputeAndUpdateStudyStatus(
            NEW.study_id, 
            'version_update', 
            v_trigger_details
        );
    END IF;
END//

-- Trigger: When a new study version is inserted
CREATE TRIGGER trg_compute_study_status_on_version_insert
AFTER INSERT ON study_versions
FOR EACH ROW
BEGIN
    DECLARE v_trigger_details TEXT;
    
    SET v_trigger_details = CONCAT(
        'New version ', NEW.version_number, 
        ' created with status ', NEW.status,
        ' (Version ID: ', NEW.id, ')'
    );
    
    CALL ComputeAndUpdateStudyStatus(
        NEW.study_id, 
        'version_insert', 
        v_trigger_details
    );
END//

-- Trigger: When a study version is deleted
CREATE TRIGGER trg_compute_study_status_on_version_delete
AFTER DELETE ON study_versions
FOR EACH ROW
BEGIN
    DECLARE v_trigger_details TEXT;
    
    SET v_trigger_details = CONCAT(
        'Version ', OLD.version_number, 
        ' deleted (had status ', OLD.status, ')',
        ' (Version ID: ', OLD.id, ')'
    );
    
    CALL ComputeAndUpdateStudyStatus(
        OLD.study_id, 
        'version_delete', 
        v_trigger_details
    );
END//

-- =====================================================
-- Triggers for study_amendments table
-- =====================================================

-- Trigger: When a study amendment is updated
CREATE TRIGGER trg_compute_study_status_on_amendment_change
AFTER UPDATE ON study_amendments
FOR EACH ROW
BEGIN
    DECLARE v_study_id BIGINT;
    DECLARE v_trigger_details TEXT;
    
    -- Get the study ID from the version
    SELECT study_id INTO v_study_id
    FROM study_versions
    WHERE id = NEW.study_version_id;
    
    -- Only trigger if status changed or if it's a safety amendment
    IF OLD.status != NEW.status OR (NEW.amendment_type = 'SAFETY' AND OLD.amendment_type != 'SAFETY') THEN
        SET v_trigger_details = CONCAT(
            'Amendment ', NEW.amendment_number, 
            ' (', NEW.amendment_type, ') status changed from ', OLD.status, 
            ' to ', NEW.status,
            ' (Amendment ID: ', NEW.id, ', Version ID: ', NEW.study_version_id, ')'
        );
        
        CALL ComputeAndUpdateStudyStatus(
            v_study_id, 
            'amendment_update', 
            v_trigger_details
        );
    END IF;
END//

-- Trigger: When a new study amendment is inserted
CREATE TRIGGER trg_compute_study_status_on_amendment_insert
AFTER INSERT ON study_amendments
FOR EACH ROW
BEGIN
    DECLARE v_study_id BIGINT;
    DECLARE v_trigger_details TEXT;
    
    -- Get the study ID from the version
    SELECT study_id INTO v_study_id
    FROM study_versions
    WHERE id = NEW.study_version_id;
    
    SET v_trigger_details = CONCAT(
        'New amendment ', NEW.amendment_number, 
        ' (', NEW.amendment_type, ') created with status ', NEW.status,
        ' (Amendment ID: ', NEW.id, ', Version ID: ', NEW.study_version_id, ')'
    );
    
    CALL ComputeAndUpdateStudyStatus(
        v_study_id, 
        'amendment_insert', 
        v_trigger_details
    );
END//

-- Trigger: When a study amendment is deleted
CREATE TRIGGER trg_compute_study_status_on_amendment_delete
AFTER DELETE ON study_amendments
FOR EACH ROW
BEGIN
    DECLARE v_study_id BIGINT;
    DECLARE v_trigger_details TEXT;
    
    -- Get the study ID from the version
    SELECT study_id INTO v_study_id
    FROM study_versions
    WHERE id = OLD.study_version_id;
    
    SET v_trigger_details = CONCAT(
        'Amendment ', OLD.amendment_number, 
        ' (', OLD.amendment_type, ') deleted (had status ', OLD.status, ')',
        ' (Amendment ID: ', OLD.id, ', Version ID: ', OLD.study_version_id, ')'
    );
    
    CALL ComputeAndUpdateStudyStatus(
        v_study_id, 
        'amendment_delete', 
        v_trigger_details
    );
END//

DELIMITER ;

-- =====================================================
-- Additional utility procedures
-- =====================================================

DELIMITER //

-- Procedure: Manually trigger status computation for a study
CREATE PROCEDURE ManuallyComputeStudyStatus(
    IN p_study_id BIGINT,
    IN p_reason TEXT
)
BEGIN
    DECLARE v_trigger_details TEXT;
    
    SET v_trigger_details = CONCAT('Manual computation requested: ', COALESCE(p_reason, 'No reason provided'));
    
    CALL ComputeAndUpdateStudyStatus(
        p_study_id, 
        'manual_computation', 
        v_trigger_details
    );
END//

-- Procedure: Batch compute status for all studies
CREATE PROCEDURE BatchComputeAllStudyStatuses()
BEGIN
    DECLARE v_study_id BIGINT;
    DECLARE v_study_count INT DEFAULT 0;
    DECLARE v_done INT DEFAULT FALSE;
    
    DECLARE study_cursor CURSOR FOR 
        SELECT id FROM studies WHERE id IS NOT NULL;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;
    
    OPEN study_cursor;
    
    study_loop: LOOP
        FETCH study_cursor INTO v_study_id;
        
        IF v_done THEN
            LEAVE study_loop;
        END IF;
        
        CALL ManuallyComputeStudyStatus(v_study_id, 'Batch computation');
        SET v_study_count = v_study_count + 1;
    END LOOP;
    
    CLOSE study_cursor;
    
    SELECT CONCAT('Computed status for ', v_study_count, ' studies') as result;
END//

CREATE PROCEDURE GetStudyStatusComputationHistory(
    IN p_study_id BIGINT,
    IN p_limit INT
)
BEGIN
    DECLARE v_limit INT;

    -- Set default limit if NULL or <= 0
    SET v_limit = IFNULL(p_limit, 50);

    SELECT 
        id,
        study_id,
        trigger_source,
        old_status_code,
        new_status_code,
        computation_result,
        trigger_details,
        error_message,
        created_at
    FROM study_status_computation_log
    WHERE study_id = p_study_id
    ORDER BY created_at DESC
    LIMIT v_limit;
END//

DELIMITER ;



-- =====================================================
-- Views for monitoring status computation
-- =====================================================

-- View: Recent status changes
CREATE OR REPLACE VIEW recent_status_changes AS
SELECT 
    l.*,
    s.name as study_name,
    s.protocol_number,
    old_ss.name as old_status_name,
    new_ss.name as new_status_name
FROM study_status_computation_log l
JOIN studies s ON l.study_id = s.id
LEFT JOIN study_status old_ss ON l.old_status_code = old_ss.code
LEFT JOIN study_status new_ss ON l.new_status_code = new_ss.code
WHERE l.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY l.created_at DESC;

-- View: Studies with frequent status changes
CREATE OR REPLACE VIEW studies_frequent_status_changes AS
SELECT 
    l.study_id,
    s.name as study_name,
    s.protocol_number,
    COUNT(*) as change_count,
    MAX(l.created_at) as last_change,
    COUNT(DISTINCT l.new_status_code) as unique_statuses
FROM study_status_computation_log l
JOIN studies s ON l.study_id = s.id
WHERE l.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND l.computation_result = 'SUCCESS'
GROUP BY l.study_id, s.name, s.protocol_number
HAVING change_count > 5
ORDER BY change_count DESC;

-- View: Error summary for status computation
CREATE OR REPLACE VIEW status_computation_errors AS
SELECT 
    l.study_id,
    s.name as study_name,
    s.protocol_number,
    l.trigger_source,
    l.error_message,
    l.created_at
FROM study_status_computation_log l
JOIN studies s ON l.study_id = s.id
WHERE l.computation_result = 'ERROR'
  AND l.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY l.created_at DESC;

-- =====================================================
-- Grant permissions (adjust as needed for your setup)
-- =====================================================

-- Grant execute permissions to clinprecadmin
GRANT EXECUTE ON PROCEDURE ComputeAndUpdateStudyStatus TO 'clinprecadmin'@'localhost';
GRANT EXECUTE ON PROCEDURE DetermineStudyStatusFromVersions TO 'clinprecadmin'@'localhost';
GRANT EXECUTE ON PROCEDURE LogStudyStatusChange TO 'clinprecadmin'@'localhost';
GRANT EXECUTE ON PROCEDURE ManuallyComputeStudyStatus TO 'clinprecadmin'@'localhost';
GRANT EXECUTE ON PROCEDURE BatchComputeAllStudyStatuses TO 'clinprecadmin'@'localhost';
GRANT EXECUTE ON PROCEDURE GetStudyStatusComputationHistory TO 'clinprecadmin'@'localhost';
