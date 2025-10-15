-- =================================================================
-- Visit Table Migration Script
-- Date: 2025-10-14
-- Purpose: Prepare study_visit_instances for unified visit model
-- =================================================================

-- This script adds columns to study_visit_instances to support both:
-- 1. Scheduled visits (from visit_definitions) - existing functionality
-- 2. Unscheduled visits (from events) - new functionality

-- =================================================================
-- STEP 1: Add new columns for unscheduled visits
-- =================================================================

-- Add aggregate_uuid for event sourcing (links to VisitCreatedEvent)
ALTER TABLE study_visit_instances 
  ADD COLUMN IF NOT EXISTS aggregate_uuid VARCHAR(36) 
  COMMENT 'UUID for event sourcing - populated for unscheduled visits created via events';

-- Add notes column (was in visit table, now needed here)
ALTER TABLE study_visit_instances 
  ADD COLUMN IF NOT EXISTS notes TEXT 
  COMMENT 'Visit notes and comments';

-- Add created_by column (was in visit table, now needed here)
ALTER TABLE study_visit_instances 
  ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) 
  COMMENT 'User who created the visit';

-- =================================================================
-- STEP 2: Make visit_id nullable (for unscheduled visits)
-- =================================================================

-- Unscheduled visits won't have a visit_definition, so visit_id should be NULL
ALTER TABLE study_visit_instances 
  MODIFY COLUMN visit_id BIGINT NULL 
  COMMENT 'FK to visit_definitions (NULL for unscheduled visits)';

-- =================================================================
-- STEP 3: Add indexes for performance
-- =================================================================

-- Index for aggregate_uuid lookups (event sourcing queries)
CREATE INDEX IF NOT EXISTS idx_aggregate_uuid 
  ON study_visit_instances(aggregate_uuid);

-- Index for created_by (audit queries)
CREATE INDEX IF NOT EXISTS idx_created_by 
  ON study_visit_instances(created_by);

-- =================================================================
-- STEP 4: Verify changes
-- =================================================================

-- Check table structure
DESCRIBE study_visit_instances;

-- Check existing data (should be 56 records for study_id=11)
SELECT 
    COUNT(*) as total_visits,
    COUNT(CASE WHEN visit_id IS NOT NULL THEN 1 END) as scheduled_visits,
    COUNT(CASE WHEN visit_id IS NULL THEN 1 END) as unscheduled_visits,
    COUNT(CASE WHEN aggregate_uuid IS NOT NULL THEN 1 END) as event_sourced_visits
FROM study_visit_instances
WHERE study_id = 11;

-- Expected output:
-- total_visits: 56
-- scheduled_visits: 56
-- unscheduled_visits: 0
-- event_sourced_visits: 0

-- =================================================================
-- STEP 5: (OPTIONAL) Migrate data from visit table if needed
-- =================================================================

-- Check if visit table has any data
SELECT COUNT(*) as visit_table_count FROM visit;

-- If visit table has data, migrate it:
/*
INSERT INTO study_visit_instances (
    study_id, 
    visit_id, 
    subject_id, 
    site_id, 
    visit_date, 
    visit_status, 
    aggregate_uuid, 
    notes, 
    created_by
)
SELECT 
    v.study_id,
    NULL, -- No visit definition for unscheduled
    v.patient_id as subject_id,
    v.site_id,
    v.visit_date,
    v.status as visit_status,
    CONVERT(v.visit_id, CHAR) as aggregate_uuid, -- Preserve UUID
    v.notes,
    v.created_by
FROM visit v;
*/

-- =================================================================
-- STEP 6: (AFTER TESTING) Drop the visit table
-- =================================================================

-- ⚠️ DO NOT RUN THIS UNTIL:
-- 1. Backend tested and working
-- 2. Frontend displaying visits correctly
-- 3. Unscheduled visit creation tested
-- 4. All team members confirmed migration successful

/*
DROP TABLE IF EXISTS visit;

-- Also remove from schema documentation
-- Update consolidated_schema.sql to remove visit table definition
*/

-- =================================================================
-- Rollback Script (if needed)
-- =================================================================

/*
-- Remove new columns
ALTER TABLE study_visit_instances 
  DROP COLUMN aggregate_uuid,
  DROP COLUMN notes,
  DROP COLUMN created_by;

-- Restore visit_id NOT NULL constraint
ALTER TABLE study_visit_instances 
  MODIFY COLUMN visit_id BIGINT NOT NULL;

-- Drop indexes
DROP INDEX idx_aggregate_uuid ON study_visit_instances;
DROP INDEX idx_created_by ON study_visit_instances;
*/

-- =================================================================
-- Verification Queries
-- =================================================================

-- Query to test after backend deployment:
-- This should return 56 visits for patient 5 (if enrolled in study 11)
SELECT 
    svi.id,
    svi.study_id,
    svi.subject_id,
    svi.visit_date,
    svi.visit_status,
    svi.aggregate_uuid,
    vd.name as visit_name,
    vd.visit_type,
    CASE 
        WHEN svi.visit_id IS NULL THEN 'UNSCHEDULED'
        ELSE 'SCHEDULED'
    END as visit_source
FROM study_visit_instances svi
LEFT JOIN visit_definitions vd ON svi.visit_id = vd.id
WHERE svi.subject_id = 5
ORDER BY svi.visit_date DESC;

-- Query to verify unscheduled visit creation:
-- After creating an unscheduled visit via UI, this should show the new record
SELECT 
    id,
    study_id,
    subject_id,
    visit_date,
    visit_status,
    aggregate_uuid,
    notes,
    created_by,
    created_at
FROM study_visit_instances
WHERE aggregate_uuid IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- =================================================================
-- END OF MIGRATION SCRIPT
-- =================================================================
