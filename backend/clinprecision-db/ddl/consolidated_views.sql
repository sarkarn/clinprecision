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


CREATE OR REPLACE VIEW v_patient_current_status AS
SELECT 
    psh.patient_id,
    psh.aggregate_uuid,
    psh.new_status AS current_status,
    psh.previous_status,
    psh.reason,
    psh.changed_by,
    psh.changed_at,
    psh.notes,
    DATEDIFF(NOW(), psh.changed_at) AS days_in_current_status
FROM patient_status_history psh
INNER JOIN (
    SELECT patient_id, MAX(changed_at) AS max_changed_at
    FROM patient_status_history
    GROUP BY patient_id
) latest ON psh.patient_id = latest.patient_id 
    AND psh.changed_at = latest.max_changed_at;


CREATE OR REPLACE VIEW v_status_transition_summary AS
SELECT 
    previous_status,
    new_status,
    COUNT(*) AS transition_count,
    COUNT(DISTINCT patient_id) AS unique_patients,
    MIN(changed_at) AS first_transition_date,
    MAX(changed_at) AS last_transition_date
FROM patient_status_history
GROUP BY previous_status, new_status
ORDER BY transition_count DESC, previous_status, new_status;

