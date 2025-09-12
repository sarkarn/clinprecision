-- Database Migration Script: Convert ENUMs to Lookup Tables
-- Safely migrates existing enum fields to use new lookup table foreign keys
-- Last updated: September 12, 2025

USE clinprecisiondb;

-- =====================================================
-- MIGRATION PLAN OVERVIEW
-- =====================================================
-- This script provides a safe migration path from ENUM fields to lookup table foreign keys
-- 
-- CURRENT STATE:
-- - studies.status uses ENUM('DRAFT', 'ACTIVE', 'APPROVED', 'COMPLETED', 'TERMINATED')
-- - No regulatory_status or study_phase fields currently exist
-- 
-- TARGET STATE:
-- - studies.study_status_id references study_status.id
-- - studies.regulatory_status_id references regulatory_status.id  
-- - studies.study_phase_id references study_phase.id
-- - Original ENUM field preserved during migration for safety

-- =====================================================
-- STEP 1: BACKUP CURRENT DATA (SAFETY MEASURE)
-- =====================================================
-- Create backup table with current studies data
CREATE TABLE studies_backup_pre_migration AS SELECT * FROM studies;

-- =====================================================
-- STEP 2: ADD NEW FOREIGN KEY COLUMNS
-- =====================================================
-- Add new columns without constraints first
ALTER TABLE studies ADD COLUMN study_status_id BIGINT NULL COMMENT 'References study_status.id';
ALTER TABLE studies ADD COLUMN regulatory_status_id BIGINT NULL COMMENT 'References regulatory_status.id';  
ALTER TABLE studies ADD COLUMN study_phase_id BIGINT NULL COMMENT 'References study_phase.id';

-- =====================================================
-- STEP 3: POPULATE NEW COLUMNS BASED ON EXISTING DATA
-- =====================================================
-- Map existing ENUM values to lookup table IDs

-- Map study status values
UPDATE studies s 
JOIN study_status ss ON ss.code = s.status 
SET s.study_status_id = ss.id;

-- For any unmapped status values, log them and set to DRAFT
INSERT INTO migration_log (table_name, issue_type, description, record_count) 
SELECT 'studies', 'unmapped_status', CONCAT('Unmapped status values: ', GROUP_CONCAT(DISTINCT status)), COUNT(*)
FROM studies 
WHERE study_status_id IS NULL AND status IS NOT NULL;

-- Set unmapped statuses to DRAFT (id = 1)
UPDATE studies 
SET study_status_id = (SELECT id FROM study_status WHERE code = 'DRAFT') 
WHERE study_status_id IS NULL;

-- =====================================================
-- STEP 4: SET DEFAULT VALUES FOR NEW FIELDS
-- =====================================================
-- Set default regulatory status for existing studies
UPDATE studies 
SET regulatory_status_id = (SELECT id FROM regulatory_status WHERE code = 'NOT_APPLICABLE')
WHERE regulatory_status_id IS NULL;

-- Set default study phase based on study type or leave NULL for manual assignment
-- This is domain-specific and may need adjustment based on your data
UPDATE studies 
SET study_phase_id = (SELECT id FROM study_phase WHERE code = 'PHASE_II')
WHERE study_phase_id IS NULL 
  AND (title LIKE '%Phase II%' OR title LIKE '%Phase 2%');

UPDATE studies 
SET study_phase_id = (SELECT id FROM study_phase WHERE code = 'PHASE_III')
WHERE study_phase_id IS NULL 
  AND (title LIKE '%Phase III%' OR title LIKE '%Phase 3%');

UPDATE studies 
SET study_phase_id = (SELECT id FROM study_phase WHERE code = 'PHASE_I')
WHERE study_phase_id IS NULL 
  AND (title LIKE '%Phase I%' OR title LIKE '%Phase 1%');

-- =====================================================
-- STEP 5: ADD FOREIGN KEY CONSTRAINTS
-- =====================================================
-- Add foreign key constraints after data is populated
ALTER TABLE studies 
ADD CONSTRAINT fk_studies_study_status 
FOREIGN KEY (study_status_id) REFERENCES study_status(id);

ALTER TABLE studies 
ADD CONSTRAINT fk_studies_regulatory_status 
FOREIGN KEY (regulatory_status_id) REFERENCES regulatory_status(id);

ALTER TABLE studies 
ADD CONSTRAINT fk_studies_study_phase 
FOREIGN KEY (study_phase_id) REFERENCES study_phase(id);

-- =====================================================
-- STEP 6: ADD INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_studies_study_status_id ON studies(study_status_id);
CREATE INDEX idx_studies_regulatory_status_id ON studies(regulatory_status_id);
CREATE INDEX idx_studies_study_phase_id ON studies(study_phase_id);

-- =====================================================
-- STEP 7: VALIDATION QUERIES
-- =====================================================
-- Verify all studies have lookup table references
SELECT 
    'Studies without study_status_id' as check_type,
    COUNT(*) as count
FROM studies 
WHERE study_status_id IS NULL;

SELECT 
    'Studies without regulatory_status_id' as check_type,
    COUNT(*) as count  
FROM studies 
WHERE regulatory_status_id IS NULL;

-- Show distribution of status values after migration
SELECT 
    ss.name as status_name,
    COUNT(*) as study_count
FROM studies s
JOIN study_status ss ON s.study_status_id = ss.id
GROUP BY ss.id, ss.name
ORDER BY ss.display_order;

-- =====================================================
-- STEP 8: UPDATE APPLICATION QUERIES (DOCUMENTATION)
-- =====================================================
-- After migration, update your application to use JOIN queries instead of ENUM values

-- OLD QUERY (using ENUM):
-- SELECT id, title, status FROM studies WHERE status = 'ACTIVE';

-- NEW QUERY (using lookup table):
-- SELECT s.id, s.title, ss.name as status_name, ss.code as status_code
-- FROM studies s
-- JOIN study_status ss ON s.study_status_id = ss.id
-- WHERE ss.code = 'ACTIVE';

-- =====================================================
-- STEP 9: MIGRATION LOG TABLE (FOR TRACKING)
-- =====================================================
CREATE TABLE IF NOT EXISTS migration_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    migration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    table_name VARCHAR(50) NOT NULL,
    issue_type VARCHAR(50) NOT NULL,
    description TEXT,
    record_count INTEGER,
    resolved BOOLEAN DEFAULT FALSE
);

-- Log successful migration
INSERT INTO migration_log (table_name, issue_type, description, record_count)
VALUES ('studies', 'migration_complete', 'Successfully migrated to lookup tables', 
        (SELECT COUNT(*) FROM studies));

-- =====================================================
-- STEP 10: OPTIONAL - REMOVE OLD ENUM COLUMN (AFTER TESTING)
-- =====================================================
-- IMPORTANT: Only run this after thoroughly testing the new lookup table approach
-- and updating all application code to use the new foreign key relationships

-- ALTER TABLE studies DROP COLUMN status;

-- =====================================================
-- ROLLBACK PROCEDURE (IF NEEDED)
-- =====================================================
-- If migration needs to be rolled back:
-- 1. DROP TABLE studies;
-- 2. RENAME TABLE studies_backup_pre_migration TO studies;
-- 3. DROP FOREIGN KEY constraints from other tables if they were added
-- 4. Update application code back to use ENUM values