-- Cleanup Script: Remove auto-created unscheduled visit instances
-- Date: October 18, 2025
-- Purpose: Remove unscheduled visit instances that were incorrectly auto-created during enrollment

USE clinprecision;

-- Show what will be deleted (for verification)
SELECT 
    svi.id,
    svi.subject_id,
    vd.name AS visit_name,
    vd.visit_code,
    vd.is_unscheduled,
    svi.visit_status,
    svi.created_at
FROM study_visit_instances svi
JOIN visit_definitions vd ON svi.visit_id = vd.id
WHERE vd.is_unscheduled = TRUE
ORDER BY svi.subject_id, svi.created_at;

-- Uncomment the following lines to actually delete the records
-- (Review the SELECT output first!)

/*
DELETE svi 
FROM study_visit_instances svi
JOIN visit_definitions vd ON svi.visit_id = vd.id
WHERE vd.is_unscheduled = TRUE;

SELECT CONCAT('Deleted ', ROW_COUNT(), ' unscheduled visit instances') AS Result;
*/

-- Optional: Also remove form-visit mappings for unscheduled visits
-- (These shouldn't exist but let's clean them up just in case)

SELECT 
    vf.id,
    vd.name AS visit_name,
    vd.visit_code,
    fd.name AS form_name,
    vd.is_unscheduled
FROM visit_forms vf
JOIN visit_definitions vd ON vf.visit_definition_id = vd.id
JOIN form_definitions fd ON vf.form_definition_id = fd.id
WHERE vd.is_unscheduled = TRUE;

/*
DELETE vf 
FROM visit_forms vf
JOIN visit_definitions vd ON vf.visit_definition_id = vd.id
WHERE vd.is_unscheduled = TRUE;

SELECT CONCAT('Deleted ', ROW_COUNT(), ' form-visit mappings for unscheduled visits') AS Result;
*/
