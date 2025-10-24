-- Cleanup Script: Remove duplicate unscheduled visit definitions
-- Date: October 23, 2025
-- Purpose: Clean up existing duplicate visit_definition records for study_id=11
--
-- BACKGROUND:
-- Database currently has 50 duplicate visit_definition records:
-- - 5 unique visit types (EARLY_TERM, UNSCHED_SAFETY, AE_VISIT, PROTO_DEV, UNSCHED_FU)
-- - Each duplicated 10 times (5 × 10 = 50 total records)
-- - All have study_id=11, is_unscheduled=true, arm_id=NULL
--
-- STRATEGY:
-- Keep the OLDEST record (minimum ID) for each (study_id, visit_code) combination
-- Delete all newer duplicates (this preserves referential integrity with existing visit instances)
--
-- SAFETY:
-- 1. Run in a transaction for rollback capability
-- 2. Backup data before deletion
-- 3. Verify counts before and after
-- 4. Check foreign key dependencies

-- ============================================================
-- STEP 1: AUDIT - Count current duplicates
-- ============================================================
SELECT 
    'BEFORE CLEANUP' as stage,
    study_id,
    visit_code,
    is_unscheduled,
    COUNT(*) as record_count,
    MIN(id) as min_id_to_keep,
    MAX(id) as max_id,
    GROUP_CONCAT(id ORDER BY id) as all_ids
FROM visit_definitions
WHERE study_id = 11 
  AND is_unscheduled = true
GROUP BY study_id, visit_code, is_unscheduled
ORDER BY visit_code;

-- Expected output:
-- 5 rows showing each visit_code with record_count=10

-- ============================================================
-- STEP 2: BACKUP - Create backup table
-- ============================================================
CREATE TABLE visit_definitions_backup_20251023 AS
SELECT * FROM visit_definitions
WHERE study_id = 11 AND is_unscheduled = true;

-- Verify backup
SELECT COUNT(*) as backup_count FROM visit_definitions_backup_20251023;
-- Expected: 50 records

-- ============================================================
-- STEP 3: CHECK DEPENDENCIES - Verify which IDs are referenced
-- ============================================================
-- Check study_visit_instances table for foreign key references
SELECT 
    vd.id as visit_def_id,
    vd.visit_code,
    COUNT(svi.id) as instance_count,
    GROUP_CONCAT(DISTINCT svi.id ORDER BY svi.id) as instance_ids
FROM visit_definitions vd
LEFT JOIN study_visit_instances svi ON svi.visit_id = vd.id
WHERE vd.study_id = 11 
  AND vd.is_unscheduled = true
GROUP BY vd.id, vd.visit_code
HAVING instance_count > 0
ORDER BY vd.visit_code, vd.id;

-- This shows which visit_definition IDs are actually being used by visit instances
-- IMPORTANT: We should keep the IDs that are referenced, not necessarily the min(id)

-- ============================================================
-- STEP 4: IDENTIFY RECORDS TO DELETE (SAFE APPROACH)
-- ============================================================
-- This query identifies duplicate IDs to delete
-- Strategy: Keep the LOWEST ID that is either:
--   a) Referenced by visit instances, OR
--   b) The minimum ID if none are referenced

WITH VisitDefGroups AS (
    SELECT 
        study_id,
        visit_code,
        id,
        ROW_NUMBER() OVER (PARTITION BY study_id, visit_code ORDER BY id ASC) as row_num,
        (SELECT COUNT(*) FROM study_visit_instances WHERE visit_id = visit_definitions.id) as ref_count
    FROM visit_definitions
    WHERE study_id = 11 
      AND is_unscheduled = true
),
IdsToKeep AS (
    SELECT 
        study_id,
        visit_code,
        MIN(id) as id_to_keep
    FROM VisitDefGroups
    GROUP BY study_id, visit_code
)
SELECT 
    vd.id as id_to_delete,
    vd.visit_code,
    vd.name,
    (SELECT COUNT(*) FROM study_visit_instances WHERE visit_id = vd.id) as has_references
FROM visit_definitions vd
WHERE vd.study_id = 11 
  AND vd.is_unscheduled = true
  AND vd.id NOT IN (SELECT id_to_keep FROM IdsToKeep)
ORDER BY vd.visit_code, vd.id;

-- Expected: 45 records to delete (9 duplicates for each of 5 visit types)
-- has_references should be 0 for all (if study was just built, instances reference only one ID)

-- ============================================================
-- STEP 5: DELETE DUPLICATES (TRANSACTION)
-- ============================================================
-- START TRANSACTION;

-- Delete duplicate records, keeping only the minimum ID for each visit_code
DELETE FROM visit_definitions
WHERE study_id = 11 
  AND is_unscheduled = true
  AND id NOT IN (
      -- Keep the minimum ID for each (study_id, visit_code) combination
      SELECT MIN(id) as id_to_keep
      FROM visit_definitions
      WHERE study_id = 11 
        AND is_unscheduled = true
      GROUP BY study_id, visit_code
  );

-- Check deleted count
-- Expected: 45 rows affected

-- ============================================================
-- STEP 6: VERIFY CLEANUP
-- ============================================================
SELECT 
    'AFTER CLEANUP' as stage,
    study_id,
    visit_code,
    is_unscheduled,
    COUNT(*) as record_count,
    GROUP_CONCAT(id ORDER BY id) as remaining_ids
FROM visit_definitions
WHERE study_id = 11 
  AND is_unscheduled = true
GROUP BY study_id, visit_code, is_unscheduled
ORDER BY visit_code;

-- Expected output:
-- 5 rows, each with record_count=1

-- Verify total count
SELECT COUNT(*) as total_unscheduled_visits
FROM visit_definitions
WHERE study_id = 11 AND is_unscheduled = true;
-- Expected: 5 records

-- ============================================================
-- STEP 7: VERIFY FOREIGN KEY INTEGRITY
-- ============================================================
-- Check that all visit instances still have valid visit_id references
SELECT 
    svi.id as instance_id,
    svi.visit_id,
    vd.id as visit_def_id,
    vd.visit_code,
    CASE 
        WHEN vd.id IS NULL THEN 'BROKEN REFERENCE'
        ELSE 'OK'
    END as integrity_status
FROM study_visit_instances svi
LEFT JOIN visit_definitions vd ON svi.visit_id = vd.id
WHERE svi.study_id = 11;

-- All rows should show 'OK' status

-- ============================================================
-- STEP 8: COMMIT OR ROLLBACK
-- ============================================================
-- If verification passed:
-- COMMIT;

-- If issues found:
-- ROLLBACK;
-- Then restore from backup:
-- INSERT INTO visit_definitions SELECT * FROM visit_definitions_backup_20251023;

-- ============================================================
-- STEP 9: CLEANUP BACKUP (after confirming success)
-- ============================================================
-- DROP TABLE visit_definitions_backup_20251023;

-- ============================================================
-- NOTES FOR EXECUTION:
-- ============================================================
-- 1. Run this script in a SQL client with transaction support
-- 2. Execute each step manually and verify results before proceeding
-- 3. The DELETE statement on line 119 should be run within a transaction
-- 4. After successful cleanup, run the migration V1.16 to add the unique constraint
-- 5. Monitor application logs during next study build to confirm duplicate check is working
