-- Migration Script for Study Database Build - Add DDD/CQRS Support
-- Date: October 2, 2025
-- Purpose: Add aggregate_uuid column to support Axon Framework event sourcing

USE clinprecision;

-- Add aggregate_uuid column to study_database_builds table
ALTER TABLE study_database_builds
ADD COLUMN aggregate_uuid VARCHAR(255) UNIQUE COMMENT 'Aggregate UUID from Axon Framework - links to event-sourced aggregate'
AFTER id;

-- Add index for performance
CREATE INDEX idx_study_db_builds_aggregate_uuid ON study_database_builds(aggregate_uuid);

-- Add additional columns for enhanced DDD/CQRS support
ALTER TABLE study_database_builds
ADD COLUMN study_name VARCHAR(500) COMMENT 'Study name for display purposes'
AFTER study_id;

ALTER TABLE study_database_builds
ADD COLUMN study_protocol VARCHAR(100) COMMENT 'Study protocol identifier'
AFTER study_name;

ALTER TABLE study_database_builds
ADD COLUMN cancelled_by VARCHAR(255) COMMENT 'User ID who cancelled the build'
AFTER error_details;

ALTER TABLE study_database_builds
ADD COLUMN cancelled_at TIMESTAMP NULL COMMENT 'When the build was cancelled'
AFTER cancelled_by;

ALTER TABLE study_database_builds
ADD COLUMN cancellation_reason TEXT COMMENT 'Reason for cancellation'
AFTER cancelled_at;

ALTER TABLE study_database_builds
ADD COLUMN validation_status VARCHAR(50) COMMENT 'Validation status (PASSED, FAILED, WARNING)'
AFTER validation_results;

ALTER TABLE study_database_builds
ADD COLUMN validated_at TIMESTAMP NULL COMMENT 'When validation was completed'
AFTER validation_status;

ALTER TABLE study_database_builds
ADD COLUMN validated_by VARCHAR(255) COMMENT 'User ID who performed validation'
AFTER validated_at;

-- Update build_status enum to match DDD aggregate status
-- Note: MySQL doesn't support direct enum modification, so we need to alter the column
ALTER TABLE study_database_builds
MODIFY COLUMN build_status ENUM('IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED') 
NOT NULL DEFAULT 'IN_PROGRESS'
COMMENT 'Current build status - aligned with StudyDatabaseBuildAggregate';

-- Add comment to requested_by to clarify it's a user ID
ALTER TABLE study_database_builds
MODIFY COLUMN requested_by BIGINT NOT NULL 
COMMENT 'User ID who requested the build';

COMMIT;

-- Verification queries
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_KEY,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'clinprecision_dev'
  AND TABLE_NAME = 'study_database_builds'
ORDER BY ORDINAL_POSITION;
