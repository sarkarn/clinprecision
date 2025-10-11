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


-- Insert initial data for testing (if needed)
-- This would be populated during actual implementation

COMMIT;


DELIMITER $$

CREATE TRIGGER study_field_metadata_after_insert
AFTER INSERT ON study_field_metadata
FOR EACH ROW
BEGIN
    INSERT INTO study_field_metadata_audit (
        id, study_id, form_id, field_name, 
        sdv_required, medical_review_required, critical_data_point, 
        fda_required, audit_trail_level,
        action_type, action_by
    ) VALUES (
        NEW.id, NEW.study_id, NEW.form_id, NEW.field_name,
        NEW.sdv_required, NEW.medical_review_required, NEW.critical_data_point,
        NEW.fda_required, NEW.audit_trail_level,
        'INSERT', NEW.created_by
    );
END$$

CREATE TRIGGER study_field_metadata_after_update
AFTER UPDATE ON study_field_metadata
FOR EACH ROW
BEGIN
    INSERT INTO study_field_metadata_audit (
        id, study_id, form_id, field_name,
        sdv_required, medical_review_required, critical_data_point,
        fda_required, audit_trail_level,
        action_type, action_by
    ) VALUES (
        NEW.id, NEW.study_id, NEW.form_id, NEW.field_name,
        NEW.sdv_required, NEW.medical_review_required, NEW.critical_data_point,
        NEW.fda_required, NEW.audit_trail_level,
        'UPDATE', NEW.updated_by
    );
END$$

DELIMITER ;

-- =====================================================================================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================================================================================

-- Additional composite indexes for common query patterns

-- Field metadata: Find all SDV required fields for a study
CREATE INDEX idx_metadata_sdv_fields ON study_field_metadata(study_id, form_id, sdv_required) 
WHERE sdv_required = TRUE;

-- Field metadata: Find all critical data points
CREATE INDEX idx_metadata_critical ON study_field_metadata(study_id, critical_data_point, safety_data_point)
WHERE critical_data_point = TRUE OR safety_data_point = TRUE;

-- CDASH mappings: Find all fields for a specific SDTM domain
CREATE INDEX idx_cdash_sdtm_domain ON study_cdash_mappings(study_id, sdtm_domain, sdtm_variable);

-- Medical coding: Find all fields requiring medical coding
CREATE INDEX idx_coding_required ON study_medical_coding_config(study_id, form_id, coding_required)
WHERE coding_required = TRUE;

-- Reviews: Find all pending reviews for a study
CREATE INDEX idx_reviews_pending ON study_form_data_reviews(study_id, review_type, review_status, review_date)
WHERE review_status IN ('PENDING', 'IN_PROGRESS');

-- Reviews: Find all queries raised
CREATE INDEX idx_reviews_queries ON study_form_data_reviews(study_id, query_status, query_priority)
WHERE query_id IS NOT NULL;

-- =====================================================================================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================================================================================

-- View: Critical fields requiring SDV
CREATE OR REPLACE VIEW v_study_sdv_required_fields AS
SELECT 
    s.id AS study_id,
    s.name AS study_name,
    fd.id AS form_id,
    fd.name AS form_name,
    sfm.field_name,
    sfm.field_label,
    sfm.sdv_required,
    sfm.medical_review_required,
    sfm.critical_data_point
FROM study_field_metadata sfm
JOIN studies s ON sfm.study_id = s.id
JOIN form_definitions fd ON sfm.form_id = fd.id
WHERE sfm.sdv_required = TRUE
   OR sfm.medical_review_required = TRUE
   OR sfm.critical_data_point = TRUE;

-- View: Pending reviews summary by study
CREATE OR REPLACE VIEW v_study_pending_reviews_summary AS
SELECT 
    study_id,
    review_type,
    review_status,
    COUNT(*) AS pending_count,
    MIN(created_at) AS oldest_pending_date,
    AVG(TIMESTAMPDIFF(HOUR, created_at, CURRENT_TIMESTAMP)) AS avg_age_hours
FROM study_form_data_reviews
WHERE review_status IN ('PENDING', 'IN_PROGRESS')
GROUP BY study_id, review_type, review_status;

-- =====================================================================================================================
-- SAMPLE DATA (for testing)
-- =====================================================================================================================

-- Insert sample field metadata for testing
-- This would normally be created by the worker service during database build

-- Example: Vital Signs form with SDV requirements
INSERT INTO study_field_metadata (
    study_id, form_id, field_name, field_label,
    sdv_required, critical_data_point, safety_data_point,
    fda_required, audit_trail_level,
    validation_rules
) VALUES
(1, 1, 'systolic_bp', 'Systolic Blood Pressure', TRUE, TRUE, TRUE, TRUE, 'FULL', 
 '{"min": 60, "max": 250, "unit": "mmHg", "precision": 0}'),
(1, 1, 'diastolic_bp', 'Diastolic Blood Pressure', TRUE, TRUE, TRUE, TRUE, 'FULL',
 '{"min": 40, "max": 150, "unit": "mmHg", "precision": 0}'),
(1, 1, 'heart_rate', 'Heart Rate', TRUE, TRUE, TRUE, TRUE, 'FULL',
 '{"min": 30, "max": 200, "unit": "bpm", "precision": 0}');

-- Example: CDASH mappings for vital signs
INSERT INTO study_cdash_mappings (
    study_id, form_id, field_name,
    cdash_domain, cdash_variable, cdash_label,
    sdtm_domain, sdtm_variable, sdtm_datatype,
    origin
) VALUES
(1, 1, 'systolic_bp', 'VS', 'SYSBP', 'Systolic Blood Pressure', 'VS', 'VSORRES', 'NUM', 'CRF'),
(1, 1, 'diastolic_bp', 'VS', 'DIABP', 'Diastolic Blood Pressure', 'VS', 'VSORRES', 'NUM', 'CRF'),
(1, 1, 'heart_rate', 'VS', 'HR', 'Heart Rate', 'VS', 'VSORRES', 'NUM', 'CRF');

-- =====================================================================================================================
-- VERIFICATION QUERIES
-- =====================================================================================================================

-- Verify table creation
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME,
    TABLE_COMMENT
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'clinprecision'
  AND TABLE_NAME IN (
    'study_field_metadata',
    'study_cdash_mappings',
    'study_medical_coding_config',
    'study_form_data_reviews'
  );

-- Verify partitioning
SELECT 
    TABLE_NAME,
    PARTITION_NAME,
    PARTITION_METHOD,
    PARTITION_EXPRESSION,
    TABLE_ROWS
FROM INFORMATION_SCHEMA.PARTITIONS
WHERE TABLE_SCHEMA = 'clinprecision'
  AND TABLE_NAME IN (
    'study_field_metadata',
    'study_cdash_mappings',
    'study_medical_coding_config',
    'study_form_data_reviews'
  )
ORDER BY TABLE_NAME, PARTITION_ORDINAL_POSITION;

-- Verify triggers
SELECT 
    TRIGGER_NAME,
    EVENT_MANIPULATION,
    EVENT_OBJECT_TABLE,
    ACTION_TIMING,
    ACTION_STATEMENT
FROM INFORMATION_SCHEMA.TRIGGERS
WHERE TRIGGER_SCHEMA = 'clinprecision'
  AND TRIGGER_NAME LIKE 'study_field_metadata%';

-- Verify indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    NON_UNIQUE
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'clinprecision'
  AND TABLE_NAME IN (
    'study_field_metadata',
    'study_cdash_mappings',
    'study_medical_coding_config',
    'study_form_data_reviews'
  )
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- =====================================================================================================================
-- MIGRATION COMPLETE
-- =====================================================================================================================

SELECT 'Phase 6 Migration Complete: Item-Level Metadata Tables Created' AS status;

UPDATE study_cdash_mappings 
SET data_origin = 'COLLECTED' 
WHERE data_origin IS NULL;

SELECT 'Phase 6 schema fix completed successfully' AS status;