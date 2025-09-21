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






