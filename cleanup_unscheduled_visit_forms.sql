-- ============================================================================
-- CLEANUP: Remove Incorrectly Shared Unscheduled Visit Forms
-- Issue: Forms added to one unscheduled visit appearing in all unscheduled visits
-- Root Cause: All unscheduled visits sharing same aggregate_uuid
-- ============================================================================

-- STEP 1: Backup existing visit_forms before cleanup
-- (Run this first in case you need to restore)
CREATE TABLE visit_forms_backup_20251023 AS 
SELECT * FROM visit_forms WHERE visit_uuid IS NOT NULL;

-- STEP 2: Find all incorrectly linked forms
-- These are forms where visit_uuid matches multiple visit instances
SELECT 
    vf.id AS visit_form_id,
    vf.visit_uuid,
    fd.name AS form_name,
    vf.created_at,
    COUNT(DISTINCT svi.id) AS affected_visits,
    GROUP_CONCAT(DISTINCT svi.id ORDER BY svi.id) AS visit_instance_ids
FROM visit_forms vf
INNER JOIN form_definitions fd ON vf.form_definition_id = fd.id
LEFT JOIN study_visit_instances svi ON svi.aggregate_uuid = vf.visit_uuid
WHERE vf.visit_uuid IS NOT NULL
  AND svi.visit_id IS NULL  -- Unscheduled visits only
GROUP BY vf.id, vf.visit_uuid, fd.name, vf.created_at
HAVING COUNT(DISTINCT svi.id) > 1
ORDER BY vf.created_at DESC;

-- STEP 3: DELETE all incorrectly linked forms
-- These will need to be re-added after backend restart
-- WARNING: This removes ALL unscheduled visit forms that use aggregate_uuid
DELETE FROM visit_forms
WHERE visit_uuid IS NOT NULL
  AND visit_uuid IN (
      -- Find visit_uuids that match multiple visit instances
      SELECT DISTINCT svi.aggregate_uuid
      FROM study_visit_instances svi
      WHERE svi.visit_id IS NULL
        AND svi.aggregate_uuid IS NOT NULL
      GROUP BY svi.aggregate_uuid
      HAVING COUNT(*) > 1
  );

-- Alternative STEP 3: If you want to be more conservative, delete ALL unscheduled visit forms
-- (Safer approach - ensures clean slate for new UUID scheme)
-- DELETE FROM visit_forms WHERE visit_uuid IS NOT NULL;

-- STEP 4: Verify cleanup - should return 0 rows
SELECT 
    vf.id AS visit_form_id,
    vf.visit_uuid,
    COUNT(DISTINCT svi.id) AS affected_visits
FROM visit_forms vf
LEFT JOIN study_visit_instances svi ON svi.aggregate_uuid = vf.visit_uuid
WHERE vf.visit_uuid IS NOT NULL
  AND svi.visit_id IS NULL
GROUP BY vf.id, vf.visit_uuid
HAVING COUNT(DISTINCT svi.id) > 1;

-- ============================================================================
-- AFTER RUNNING THIS CLEANUP:
-- ============================================================================
/*
1. Restart clinops-service with the new code
2. New UUID format will be used: "00000000-0000-0000-0000-{visitInstanceId}"
3. Each visit instance gets its own unique UUID
4. Re-add forms to unscheduled visits through the UI
5. Forms will now be correctly isolated per visit instance

Example:
- Visit Instance 28 → UUID: 00000000-0000-0000-0000-000000000028
- Visit Instance 45 → UUID: 00000000-0000-0000-0000-000000000045
- Visit Instance 99 → UUID: 00000000-0000-0000-0000-000000000099

Each gets its own forms, no more leaking!
*/
