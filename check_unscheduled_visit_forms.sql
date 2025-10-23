-- ============================================================================
-- UNSCHEDULED VISIT FORMS DIAGNOSTIC
-- Check if unscheduled visits have unique identifiers
-- ============================================================================

-- Check 1: See all unscheduled visits and their aggregate_uuid
SELECT 
    svi.id AS visit_instance_id,
    svi.subject_id,
    svi.visit_id,
    svi.aggregate_uuid,
    svi.visit_status,
    svi.created_at,
    COUNT(vf.id) AS forms_count
FROM study_visit_instances svi
LEFT JOIN visit_forms vf ON vf.visit_uuid = svi.aggregate_uuid
WHERE svi.visit_id IS NULL  -- Unscheduled visits have NULL visit_id
GROUP BY svi.id, svi.subject_id, svi.visit_id, svi.aggregate_uuid, svi.visit_status, svi.created_at
ORDER BY svi.id;

-- Check 2: Find if multiple unscheduled visits share same aggregate_uuid
SELECT 
    aggregate_uuid,
    COUNT(*) AS visit_count,
    GROUP_CONCAT(id ORDER BY id) AS visit_instance_ids,
    GROUP_CONCAT(subject_id ORDER BY id) AS subject_ids
FROM study_visit_instances
WHERE visit_id IS NULL
GROUP BY aggregate_uuid
HAVING COUNT(*) > 1;

-- Check 3: See visit_forms for unscheduled visits
SELECT 
    vf.id AS visit_form_id,
    vf.visit_uuid,
    vf.visit_definition_id,
    fd.name AS form_name,
    vf.is_required,
    vf.display_order,
    vf.created_at,
    -- Find which visit instances match this visit_uuid
    (SELECT GROUP_CONCAT(svi.id ORDER BY svi.id)
     FROM study_visit_instances svi
     WHERE svi.aggregate_uuid = vf.visit_uuid
       AND svi.visit_id IS NULL) AS matching_visit_instances
FROM visit_forms vf
LEFT JOIN form_definitions fd ON vf.form_definition_id = fd.id
WHERE vf.visit_uuid IS NOT NULL
ORDER BY vf.visit_uuid, vf.display_order;

-- Check 4: Problem scenario - Show which visits incorrectly share forms
SELECT 
    svi.id AS visit_instance_id,
    svi.subject_id,
    svi.aggregate_uuid,
    COUNT(DISTINCT vf.id) AS forms_assigned,
    GROUP_CONCAT(DISTINCT fd.name ORDER BY fd.name SEPARATOR ', ') AS form_names,
    -- Check if other visits have same aggregate_uuid
    (SELECT COUNT(*) - 1  -- Subtract self
     FROM study_visit_instances svi2
     WHERE svi2.aggregate_uuid = svi.aggregate_uuid
       AND svi2.visit_id IS NULL
       AND svi2.id != svi.id) AS other_visits_with_same_uuid
FROM study_visit_instances svi
LEFT JOIN visit_forms vf ON vf.visit_uuid = svi.aggregate_uuid
LEFT JOIN form_definitions fd ON vf.form_definition_id = fd.id
WHERE svi.visit_id IS NULL
GROUP BY svi.id, svi.subject_id, svi.aggregate_uuid
HAVING forms_assigned > 0
ORDER BY svi.aggregate_uuid, svi.id;

-- ============================================================================
-- EXPECTED BEHAVIOR:
-- - Each unscheduled visit instance should have a UNIQUE aggregate_uuid
-- - Forms should be linked to visit_uuid (which equals aggregate_uuid)
-- - If multiple visits share same aggregate_uuid, forms will appear in ALL of them
--
-- ROOT CAUSE:
-- - If Check 2 returns rows: Multiple visits share same aggregate_uuid (BUG!)
-- - If Check 4 shows other_visits_with_same_uuid > 0: Forms leaking between visits
--
-- SOLUTION:
-- - Each visit instance needs its own unique UUID
-- - Option 1: Use visit instance ID directly (convert to UUID format)
-- - Option 2: Ensure aggregate_uuid is generated uniquely per visit instance
-- ============================================================================
