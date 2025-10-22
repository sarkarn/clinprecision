-- ================================================================
-- Visit Progress Percentage Diagnostic Query
-- Run this to check individual visit completion calculation
-- ================================================================

-- Step 1: Pick a visit to diagnose (replace visit_id = 123 with your actual visit ID)
SET @visit_instance_id = 123;  -- Change this to your test visit ID

-- Step 2: Get visit information
SELECT 
    'Visit Information' as section,
    svi.id as visit_instance_id,
    svi.visit_id as visit_definition_id,
    svi.subject_id,
    svi.visit_status,
    vd.name as visit_name
FROM study_visit_instances svi
LEFT JOIN visit_definitions vd ON svi.visit_id = vd.id
WHERE svi.id = @visit_instance_id;

-- Step 3: Count TOTAL forms defined for this visit (from visit_forms)
SELECT 
    'Total Forms (from visit_forms)' as section,
    COUNT(*) as total_forms_defined
FROM visit_forms vf
WHERE vf.visit_definition_id = (
    SELECT visit_id FROM study_visit_instances WHERE id = @visit_instance_id
);

-- Step 4: Show ALL form submissions for this visit (including drafts)
SELECT 
    'All Form Submissions' as section,
    sfd.id,
    sfd.form_id,
    sf.name as form_name,
    sfd.status,
    sfd.created_at,
    sfd.updated_at
FROM study_form_data sfd
LEFT JOIN study_forms sf ON sfd.form_id = sf.id
WHERE sfd.visit_id = @visit_instance_id
ORDER BY sfd.form_id, sfd.created_at DESC;

-- Step 5: Count SUBMITTED/LOCKED forms (OLD WAY - wrong, counts duplicates)
SELECT 
    'Completed Forms - OLD METHOD (WRONG)' as section,
    COUNT(*) as completed_count_OLD_METHOD
FROM study_form_data
WHERE visit_id = @visit_instance_id
  AND status IN ('SUBMITTED', 'LOCKED');

-- Step 6: Count UNIQUE SUBMITTED/LOCKED forms (NEW WAY - correct with DISTINCT)
SELECT 
    'Completed Forms - NEW METHOD (CORRECT)' as section,
    COUNT(DISTINCT form_id) as completed_count_NEW_METHOD
FROM study_form_data
WHERE visit_id = @visit_instance_id
  AND status IN ('SUBMITTED', 'LOCKED');

-- Step 7: Show which forms are completed (distinct form_ids)
SELECT 
    'Completed Forms Detail' as section,
    DISTINCT sfd.form_id,
    sf.name as form_name,
    COUNT(*) as submission_count,
    MAX(sfd.updated_at) as latest_submission
FROM study_form_data sfd
LEFT JOIN study_forms sf ON sfd.form_id = sf.id
WHERE sfd.visit_id = @visit_instance_id
  AND sfd.status IN ('SUBMITTED', 'LOCKED')
GROUP BY sfd.form_id, sf.name
ORDER BY sfd.form_id;

-- Step 8: Calculate percentage (OLD vs NEW)
SELECT 
    'Percentage Calculation' as section,
    total.total_forms,
    old.old_completed,
    new.new_completed,
    ROUND((old.old_completed / total.total_forms * 100), 1) as old_percentage_WRONG,
    ROUND((new.new_completed / total.total_forms * 100), 1) as new_percentage_CORRECT
FROM
    (SELECT COUNT(*) as total_forms 
     FROM visit_forms 
     WHERE visit_definition_id = (SELECT visit_id FROM study_visit_instances WHERE id = @visit_instance_id)) total,
    (SELECT COUNT(*) as old_completed 
     FROM study_form_data 
     WHERE visit_id = @visit_instance_id AND status IN ('SUBMITTED', 'LOCKED')) old,
    (SELECT COUNT(DISTINCT form_id) as new_completed 
     FROM study_form_data 
     WHERE visit_id = @visit_instance_id AND status IN ('SUBMITTED', 'LOCKED')) new;

-- ================================================================
-- HOW TO USE:
-- ================================================================
-- 1. Change @visit_instance_id at the top to your test visit ID
-- 2. Run all queries
-- 3. Compare old_percentage_WRONG vs new_percentage_CORRECT
-- 4. If they're different, backend needs restart with new code
-- 5. If they're the same, issue is somewhere else
-- ================================================================

-- Step 9: Show form submission history (to see if forms were resubmitted)
SELECT 
    'Form Submission History' as section,
    sf.name as form_name,
    sfd.form_id,
    sfd.status,
    sfd.created_at,
    sfd.updated_at,
    CASE 
        WHEN sfd.status IN ('SUBMITTED', 'LOCKED') THEN 'COUNTED'
        ELSE 'NOT COUNTED'
    END as counted_in_percentage
FROM study_form_data sfd
LEFT JOIN study_forms sf ON sfd.form_id = sf.id
WHERE sfd.visit_id = @visit_instance_id
ORDER BY sf.name, sfd.created_at;

-- ================================================================
-- EXPECTED OUTPUT EXAMPLE:
-- ================================================================
-- Visit has 4 forms total
-- User submitted all 4 forms
-- User re-submitted form #1 (now have 5 total submissions)
--
-- OLD METHOD (WRONG): 5 completed / 4 total = 125% ❌
-- NEW METHOD (CORRECT): 4 unique forms / 4 total = 100% ✓
-- ================================================================
