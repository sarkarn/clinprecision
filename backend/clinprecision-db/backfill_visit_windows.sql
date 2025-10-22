-- Backfill Visit Window Data for Existing Visits
-- Created: October 22, 2025
-- Purpose: Populate visitWindowStart, visitWindowEnd, windowDaysBefore, windowDaysAfter
--          for visits created before the window population fix

-- Gap #4 Context:
-- The window fields were added in V1.16 migration (dd3f90d), but
-- ProtocolVisitInstantiationService wasn't copying them from visit_definitions.
-- This script backfills the data for existing visits.

-- ============================================================
-- STEP 1: Verify Current State
-- ============================================================

-- Check how many visits are missing window data
SELECT 
    COUNT(*) AS total_visits,
    SUM(CASE WHEN visitWindowStart IS NULL THEN 1 ELSE 0 END) AS missing_window_start,
    SUM(CASE WHEN visitWindowEnd IS NULL THEN 1 ELSE 0 END) AS missing_window_end,
    SUM(CASE WHEN windowDaysBefore IS NULL THEN 1 ELSE 0 END) AS missing_days_before,
    SUM(CASE WHEN windowDaysAfter IS NULL THEN 1 ELSE 0 END) AS missing_days_after
FROM study_visit_instances
WHERE visit_id IS NOT NULL; -- Protocol visits only (not unscheduled)

-- Preview visits that need backfilling
SELECT 
    svi.id,
    svi.subject_id,
    vd.name AS visit_name,
    svi.visit_date,
    svi.visitWindowStart AS current_window_start,
    svi.visitWindowEnd AS current_window_end,
    vd.window_before,
    vd.window_after,
    -- What the values SHOULD be:
    svi.visit_date - INTERVAL '1 day' * COALESCE(vd.window_before, 0) AS calculated_window_start,
    svi.visit_date + INTERVAL '1 day' * COALESCE(vd.window_after, 0) AS calculated_window_end
FROM study_visit_instances svi
JOIN visit_definitions vd ON svi.visit_id = vd.id
WHERE svi.visitWindowStart IS NULL
  AND svi.visit_id IS NOT NULL
LIMIT 10;

-- ============================================================
-- STEP 2: Backfill Window Data (DRY RUN - SELECT ONLY)
-- ============================================================

-- Preview the updates (run this first to verify logic)
SELECT 
    svi.id AS visit_instance_id,
    svi.subject_id,
    vd.name AS visit_name,
    svi.visit_date,
    COALESCE(vd.window_before, 0) AS window_before_days,
    COALESCE(vd.window_after, 0) AS window_after_days,
    svi.visit_date - INTERVAL '1 day' * COALESCE(vd.window_before, 0) AS new_window_start,
    svi.visit_date + INTERVAL '1 day' * COALESCE(vd.window_after, 0) AS new_window_end,
    'UPDATE' AS action
FROM study_visit_instances svi
JOIN visit_definitions vd ON svi.visit_id = vd.id
WHERE svi.visitWindowStart IS NULL
  AND svi.visit_id IS NOT NULL;

-- ============================================================
-- STEP 3: Execute Backfill (ACTUAL UPDATE)
-- ============================================================

-- WARNING: This will modify data. Review DRY RUN results first!

BEGIN;

-- Update visit window fields for all protocol visits missing window data
UPDATE study_visit_instances svi
SET 
    visitWindowStart = svi.visit_date - INTERVAL '1 day' * COALESCE(vd.window_before, 0),
    visitWindowEnd = svi.visit_date + INTERVAL '1 day' * COALESCE(vd.window_after, 0),
    windowDaysBefore = COALESCE(vd.window_before, 0),
    windowDaysAfter = COALESCE(vd.window_after, 0)
FROM visit_definitions vd
WHERE svi.visit_id = vd.id
  AND svi.visitWindowStart IS NULL
  AND svi.visit_id IS NOT NULL; -- Only protocol visits (not unscheduled)

-- Show how many rows were updated
GET DIAGNOSTICS affected_rows = ROW_COUNT;
RAISE NOTICE 'Updated % visit instances with window data', affected_rows;

-- Verify the update
SELECT 
    COUNT(*) AS total_updated,
    MIN(visitWindowStart) AS earliest_window_start,
    MAX(visitWindowEnd) AS latest_window_end
FROM study_visit_instances
WHERE visitWindowStart IS NOT NULL
  AND visitWindowEnd IS NOT NULL;

-- If everything looks good, COMMIT. Otherwise, ROLLBACK.
-- COMMIT;
ROLLBACK; -- Change to COMMIT after verification

-- ============================================================
-- STEP 4: Verification Queries
-- ============================================================

-- After backfill, verify all visits have window data
SELECT 
    COUNT(*) AS total_protocol_visits,
    SUM(CASE WHEN visitWindowStart IS NOT NULL THEN 1 ELSE 0 END) AS have_window_start,
    SUM(CASE WHEN visitWindowEnd IS NOT NULL THEN 1 ELSE 0 END) AS have_window_end,
    SUM(CASE WHEN windowDaysBefore IS NOT NULL THEN 1 ELSE 0 END) AS have_days_before,
    SUM(CASE WHEN windowDaysAfter IS NOT NULL THEN 1 ELSE 0 END) AS have_days_after
FROM study_visit_instances
WHERE visit_id IS NOT NULL;

-- Sample of backfilled data
SELECT 
    svi.id,
    svi.subject_id,
    vd.name AS visit_name,
    svi.visit_date,
    svi.visitWindowStart,
    svi.visitWindowEnd,
    svi.windowDaysBefore,
    svi.windowDaysAfter,
    -- Verify calculation is correct
    (svi.visit_date - svi.visitWindowStart) AS actual_days_before,
    (svi.visitWindowEnd - svi.visit_date) AS actual_days_after
FROM study_visit_instances svi
JOIN visit_definitions vd ON svi.visit_id = vd.id
WHERE svi.visitWindowStart IS NOT NULL
ORDER BY svi.subject_id, svi.visit_date
LIMIT 20;

-- ============================================================
-- STEP 5: Edge Cases
-- ============================================================

-- Unscheduled visits (visit_id IS NULL) should NOT have windows
SELECT 
    id,
    subject_id,
    visit_date,
    visitWindowStart,
    visitWindowEnd,
    'Unscheduled visit should NOT have window' AS note
FROM study_visit_instances
WHERE visit_id IS NULL
  AND (visitWindowStart IS NOT NULL OR visitWindowEnd IS NOT NULL);

-- Visits with zero-day windows (exact date visits like Day 1)
SELECT 
    svi.id,
    svi.subject_id,
    vd.name,
    svi.visit_date,
    svi.visitWindowStart,
    svi.visitWindowEnd,
    'Window start = window end = visit date' AS note
FROM study_visit_instances svi
JOIN visit_definitions vd ON svi.visit_id = vd.id
WHERE svi.visitWindowStart = svi.visitWindowEnd
  AND svi.visitWindowStart = svi.visit_date;

-- ============================================================
-- STEP 6: Manual Backfill Example (Single Subject)
-- ============================================================

-- If you want to backfill just one patient for testing:
UPDATE study_visit_instances svi
SET 
    visitWindowStart = svi.visit_date - INTERVAL '1 day' * COALESCE(vd.window_before, 0),
    visitWindowEnd = svi.visit_date + INTERVAL '1 day' * COALESCE(vd.window_after, 0),
    windowDaysBefore = COALESCE(vd.window_before, 0),
    windowDaysAfter = COALESCE(vd.window_after, 0)
FROM visit_definitions vd
WHERE svi.visit_id = vd.id
  AND svi.subject_id = 1 -- Replace with actual patient ID
  AND svi.visitWindowStart IS NULL;

-- Verify single subject
SELECT 
    id,
    visit_date,
    visitWindowStart,
    visitWindowEnd,
    windowDaysBefore,
    windowDaysAfter
FROM study_visit_instances
WHERE subject_id = 1
ORDER BY visit_date;

-- ============================================================
-- USAGE INSTRUCTIONS
-- ============================================================
/*

1. VERIFY CURRENT STATE:
   - Run queries in STEP 1 to see how many visits need backfilling
   
2. DRY RUN:
   - Run SELECT query in STEP 2 to preview changes
   - Verify window dates look correct
   
3. EXECUTE BACKFILL:
   - Review DRY RUN results
   - Change ROLLBACK to COMMIT in STEP 3
   - Run the UPDATE within the transaction
   - If successful, COMMIT. If issues, ROLLBACK.
   
4. VERIFY:
   - Run queries in STEP 4 to confirm all visits have window data
   - Check sample rows to ensure calculations are correct
   
5. TEST IN UI:
   - Navigate to SubjectDetails.jsx
   - Verify "Visit Window" column shows dates (not "No window defined")
   - Check VisitDetails.jsx shows compliance panel
   
6. FUTURE:
   - This is a ONE-TIME fix for existing data
   - New enrollments will populate windows automatically
   - Backend fix in ProtocolVisitInstantiationService.java

*/

-- ============================================================
-- EXAMPLE OUTPUT (After Backfill)
-- ============================================================
/*

subject_id | visit_name  | visit_date  | visitWindowStart | visitWindowEnd | windowDaysBefore | windowDaysAfter
-----------|-------------|-------------|------------------|----------------|------------------|----------------
1          | Screening   | 2025-01-08  | 2025-01-05      | 2025-01-11    | 3                | 3
1          | Day 1       | 2025-01-15  | 2025-01-15      | 2025-01-15    | 0                | 0
1          | Week 2      | 2025-01-29  | 2025-01-27      | 2025-01-31    | 2                | 2
1          | Month 1     | 2025-02-14  | 2025-02-09      | 2025-02-19    | 5                | 5

*/
