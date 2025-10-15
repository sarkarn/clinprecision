-- Quick Migration: Add columns to study_visit_instances
-- Run this script to fix the "Unknown column 'aggregate_uuid'" error

-- Step 1: Add aggregate_uuid column
ALTER TABLE study_visit_instances 
ADD COLUMN aggregate_uuid VARCHAR(36) NULL 
COMMENT 'UUID for event sourcing - populated for unscheduled visits created via events';

-- Step 2: Make visit_id nullable (for unscheduled visits)
ALTER TABLE study_visit_instances 
MODIFY COLUMN visit_id BIGINT NULL 
COMMENT 'FK to visit_definitions (NULL for unscheduled visits)';

-- Step 3: Update created_by to VARCHAR (currently BIGINT, should be username)
ALTER TABLE study_visit_instances 
MODIFY COLUMN created_by VARCHAR(100) NULL 
COMMENT 'User who created the visit';

-- Step 4: Add index for aggregate_uuid lookups
CREATE INDEX idx_aggregate_uuid ON study_visit_instances(aggregate_uuid);

-- Step 5: Verify changes
DESCRIBE study_visit_instances;

-- Step 6: Check existing data (should be 56 records for study_id=11)
SELECT COUNT(*) as total_visits FROM study_visit_instances WHERE study_id = 11;

-- Success! Now restart your backend service.
