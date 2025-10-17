-- ============================================================================
-- Migration: Add Build Tracking to Patient Visit and Form Management
-- Date: 2025-10-16
-- Priority: P0 - CRITICAL
-- Issue: Patient visits and forms currently use study design tables directly
--        instead of finalized study database build information
-- 
-- Impact: Data integrity, regulatory compliance, audit trail
-- ============================================================================

-- ============================================================================
-- PART 1: Add build_id to study_visit_instances
-- ============================================================================
-- Purpose: Track which study database build version was active when patient's
--          visits were instantiated. Ensures protocol consistency.

-- SKIPPED: Column already exists in consolidated_schema.sql
-- ALTER TABLE study_visit_instances 
-- ADD COLUMN build_id BIGINT NULL 
-- COMMENT 'FK to study_database_builds - tracks which build version was used for this patient';

-- ============================================================================
-- PART 2: Add build_id to visit_forms
-- ============================================================================
-- Purpose: Track which build version each form assignment belongs to.
--          Allows multiple build versions to coexist with different form configs.

-- SKIPPED: Column already exists in consolidated_schema.sql
-- ALTER TABLE visit_forms 
-- ADD COLUMN build_id BIGINT NULL 
-- COMMENT 'FK to study_database_builds - tracks which build version this form assignment belongs to';

-- ============================================================================
-- PART 3: Backfill existing data
-- ============================================================================
-- Strategy: Assign existing records to the FIRST COMPLETED build for their study
--           This ensures historical data has proper build tracking

-- Backfill study_visit_instances
UPDATE study_visit_instances svi
INNER JOIN studies s ON s.id = svi.study_id
INNER JOIN (
    SELECT study_id, MIN(id) as first_build_id
    FROM study_database_builds
    WHERE build_status = 'COMPLETED'
    GROUP BY study_id
) builds ON builds.study_id = s.id
SET svi.build_id = builds.first_build_id
WHERE svi.build_id IS NULL;

-- Backfill visit_forms (via visit_definitions relationship)
UPDATE visit_forms vf
INNER JOIN visit_definitions vd ON vd.id = vf.visit_definition_id
INNER JOIN studies s ON s.id = vd.study_id
INNER JOIN (
    SELECT study_id, MIN(id) as first_build_id
    FROM study_database_builds
    WHERE build_status = 'COMPLETED'
    GROUP BY study_id
) builds ON builds.study_id = s.id
SET vf.build_id = builds.first_build_id
WHERE vf.build_id IS NULL;

-- ============================================================================
-- PART 4: Add Foreign Key Constraints
-- ============================================================================
-- Note: Using RESTRICT to prevent accidental deletion of builds that have
--       active patient data. Builds must be marked as RETIRED, not deleted.

-- SKIPPED: Foreign key constraints already exist in consolidated_schema.sql
-- ALTER TABLE study_visit_instances 
-- ADD CONSTRAINT fk_visit_instance_build 
-- FOREIGN KEY (build_id) REFERENCES study_database_builds(id) 
-- ON DELETE RESTRICT;

-- ALTER TABLE visit_forms 
-- ADD CONSTRAINT fk_visit_form_build 
-- FOREIGN KEY (build_id) REFERENCES study_database_builds(id) 
-- ON DELETE RESTRICT;

-- ============================================================================
-- PART 5: Add Indexes for Performance
-- ============================================================================
-- These indexes optimize queries that filter by build_id

-- SKIPPED: Indexes already exist in consolidated_schema.sql
-- CREATE INDEX idx_visit_instances_build_id ON study_visit_instances(build_id);
-- CREATE INDEX idx_visit_instances_study_build ON study_visit_instances(study_id, build_id);
-- CREATE INDEX idx_visit_forms_build_id ON visit_forms(build_id);
-- CREATE INDEX idx_visit_forms_visit_build ON visit_forms(visit_definition_id, build_id);

-- ============================================================================
-- PART 6: Add visit_definitions.build_id (for future use)
-- ============================================================================
-- Purpose: Allow visit definitions to be versioned per build
--          This supports protocol amendments and version comparison

-- SKIPPED: Column already exists in consolidated_schema.sql
-- ALTER TABLE visit_definitions 
-- ADD COLUMN build_id BIGINT NULL 
-- COMMENT 'FK to study_database_builds - tracks which build version this visit definition belongs to';

-- Backfill visit_definitions
UPDATE visit_definitions vd
INNER JOIN studies s ON s.id = vd.study_id
INNER JOIN (
    SELECT study_id, MIN(id) as first_build_id
    FROM study_database_builds
    WHERE build_status = 'COMPLETED'
    GROUP BY study_id
) builds ON builds.study_id = s.id
SET vd.build_id = builds.first_build_id
WHERE vd.build_id IS NULL;

-- SKIPPED: Foreign key and indexes already exist in consolidated_schema.sql
-- ALTER TABLE visit_definitions 
-- ADD CONSTRAINT fk_visit_definition_build 
-- FOREIGN KEY (build_id) REFERENCES study_database_builds(id) 
-- ON DELETE RESTRICT;

-- CREATE INDEX idx_visit_definitions_build_id ON visit_definitions(build_id);
-- CREATE INDEX idx_visit_definitions_study_build ON visit_definitions(study_id, build_id);

-- ============================================================================
-- PART 7: Add form_definitions.build_id (for future use)
-- ============================================================================
-- Purpose: Allow form definitions to be versioned per build

-- SKIPPED: Column already exists in consolidated_schema.sql
-- ALTER TABLE form_definitions 
-- ADD COLUMN build_id BIGINT NULL 
-- COMMENT 'FK to study_database_builds - tracks which build version this form definition belongs to';

-- Backfill form_definitions
UPDATE form_definitions fd
INNER JOIN studies s ON s.id = fd.study_id
INNER JOIN (
    SELECT study_id, MIN(id) as first_build_id
    FROM study_database_builds
    WHERE build_status = 'COMPLETED'
    GROUP BY study_id
) builds ON builds.study_id = s.id
SET fd.build_id = builds.first_build_id
WHERE fd.build_id IS NULL;

-- SKIPPED: Foreign key and indexes already exist in consolidated_schema.sql
-- ALTER TABLE form_definitions 
-- ADD CONSTRAINT fk_form_definition_build 
-- FOREIGN KEY (build_id) REFERENCES study_database_builds(id) 
-- ON DELETE RESTRICT;

-- CREATE INDEX idx_form_definitions_build_id ON form_definitions(build_id);
-- CREATE INDEX idx_form_definitions_study_build ON form_definitions(study_id, build_id);

-- ============================================================================
-- PART 8: Add study_form_data.build_id (CRITICAL FOR DATA INTEGRITY)
-- ============================================================================
-- Purpose: Track which form definition version was used when patient filled out form
--          Essential for displaying correct form structure and validating against
--          the right schema/rules. Without this, we cannot determine which form
--          version (10 fields vs 12 fields) the patient actually filled out.

-- SKIPPED: Column already exists in consolidated_schema.sql
-- ALTER TABLE study_form_data 
-- ADD COLUMN build_id BIGINT NULL 
-- COMMENT 'FK to study_database_builds - tracks which form definition version was used for this submission';

-- Backfill study_form_data.build_id from visit instances
-- Strategy: Get build_id from the visit instance this form belongs to
UPDATE study_form_data sfd
INNER JOIN study_visit_instances svi ON svi.id = sfd.visit_id
SET sfd.build_id = svi.build_id
WHERE sfd.build_id IS NULL
  AND sfd.visit_id IS NOT NULL;

-- For form data NOT tied to visits (standalone forms, queries, etc.)
-- use the first completed build for that study
UPDATE study_form_data sfd
INNER JOIN studies s ON s.id = sfd.study_id
INNER JOIN (
    SELECT study_id, MIN(id) as first_build_id
    FROM study_database_builds
    WHERE build_status = 'COMPLETED'
    GROUP BY study_id
) builds ON builds.study_id = s.id
SET sfd.build_id = builds.first_build_id
WHERE sfd.build_id IS NULL;

-- SKIPPED: Foreign key and indexes already exist in consolidated_schema.sql
-- Add foreign key constraint
-- ALTER TABLE study_form_data 
-- ADD CONSTRAINT fk_study_form_data_build 
-- FOREIGN KEY (build_id) REFERENCES study_database_builds(id) 
-- ON DELETE RESTRICT;

-- Add indexes
-- CREATE INDEX idx_study_form_data_build_id ON study_form_data(build_id);
-- CREATE INDEX idx_study_form_data_study_build ON study_form_data(study_id, build_id);
-- CREATE INDEX idx_study_form_data_form_build ON study_form_data(form_id, build_id);

-- ============================================================================
-- PART 9: Add study_form_data_audit.build_id (FDA 21 CFR Part 11 COMPLIANCE)
-- ============================================================================
-- Purpose: Track which protocol version was active when each change was made
--          CRITICAL for FDA compliance - must be able to prove which protocol
--          version was in effect at the time of each data change
--
-- Without build_id in audit table:
--   - Cannot reconstruct historical form structure at point in time
--   - Cannot prove compliance with protocol version in effect
--   - Cannot detect protocol deviations
--   - INCOMPLETE AUDIT TRAIL = FDA VIOLATION
--
-- FDA 21 CFR Part 11 requires complete, immutable audit trail with ability
-- to reconstruct data at any historical point in time.

-- SKIPPED: Column already exists in consolidated_schema.sql
-- ALTER TABLE study_form_data_audit 
-- ADD COLUMN build_id BIGINT NULL 
-- COMMENT 'FK to study_database_builds - tracks protocol version when change was made (FDA 21 CFR Part 11 compliance)';

-- Backfill audit records from main study_form_data table
UPDATE study_form_data_audit a
INNER JOIN study_form_data sfd ON sfd.id = a.record_id
SET a.build_id = sfd.build_id
WHERE a.build_id IS NULL
  AND sfd.build_id IS NOT NULL;

-- For audit records where main record doesn't have build_id yet,
-- use the build that was COMPLETED at the time of the change
UPDATE study_form_data_audit a
SET a.build_id = (
    SELECT sdb.id
    FROM study_database_builds sdb
    WHERE sdb.study_id = a.study_id
      AND sdb.build_status = 'COMPLETED'
      AND sdb.build_end_time <= a.changed_at
    ORDER BY sdb.build_end_time DESC
    LIMIT 1
)
WHERE a.build_id IS NULL;

-- SKIPPED: Foreign key and indexes already exist in consolidated_schema.sql
-- Add foreign key constraint
-- ALTER TABLE study_form_data_audit 
-- ADD CONSTRAINT fk_study_form_data_audit_build 
-- FOREIGN KEY (build_id) REFERENCES study_database_builds(id) 
-- ON DELETE RESTRICT;

-- Add indexes for audit trail queries
-- CREATE INDEX idx_study_form_data_audit_build_id ON study_form_data_audit(build_id);
-- CREATE INDEX idx_study_form_data_audit_record_build ON study_form_data_audit(record_id, build_id);
-- CREATE INDEX idx_study_form_data_audit_study_build ON study_form_data_audit(study_id, build_id);

-- ============================================================================
-- PART 10: Verification Queries
-- ============================================================================
-- Run these queries after migration to verify success

-- Check that all visit instances have build_id
-- Expected: 0 rows (all should have build_id)
-- SELECT COUNT(*) as missing_build_id 
-- FROM study_visit_instances 
-- WHERE build_id IS NULL;

-- Check that all visit_forms have build_id
-- Expected: 0 rows
-- SELECT COUNT(*) as missing_build_id 
-- FROM visit_forms 
-- WHERE build_id IS NULL;

-- Check that all study_form_data have build_id
-- Expected: 0 rows
-- SELECT COUNT(*) as missing_build_id 
-- FROM study_form_data 
-- WHERE build_id IS NULL;

-- Check that all study_form_data_audit have build_id
-- Expected: 0 rows
-- SELECT COUNT(*) as missing_build_id 
-- FROM study_form_data_audit 
-- WHERE build_id IS NULL;

-- View distribution of visits per build
-- SELECT 
--     b.id as build_id,
--     b.build_request_id,
--     b.study_name,
--     COUNT(DISTINCT svi.id) as visit_count,
--     COUNT(DISTINCT sfd.id) as form_data_count,
--     COUNT(DISTINCT a.audit_id) as audit_trail_count
-- FROM study_database_builds b
-- LEFT JOIN study_visit_instances svi ON svi.build_id = b.id
-- LEFT JOIN study_form_data sfd ON sfd.build_id = b.id
-- LEFT JOIN study_form_data_audit a ON a.build_id = b.id
-- GROUP BY b.id, b.build_request_id, b.study_name
-- ORDER BY b.id;

-- View distribution of form assignments per build
-- SELECT 
--     b.id as build_id,
--     b.build_request_id,
--     b.study_name,
--     COUNT(vf.id) as form_assignment_count
-- FROM study_database_builds b
-- LEFT JOIN visit_forms vf ON vf.build_id = b.id
-- GROUP BY b.id, b.build_request_id, b.study_name
-- ORDER BY b.id;

-- Comprehensive build tracking summary
-- SELECT 
--     'study_visit_instances' as table_name,
--     COUNT(*) as total_rows,
--     COUNT(build_id) as rows_with_build_id,
--     COUNT(*) - COUNT(build_id) as rows_missing_build_id
-- FROM study_visit_instances
-- UNION ALL
-- SELECT 
--     'visit_forms',
--     COUNT(*),
--     COUNT(build_id),
--     COUNT(*) - COUNT(build_id)
-- FROM visit_forms
-- UNION ALL
-- SELECT 
--     'visit_definitions',
--     COUNT(*),
--     COUNT(build_id),
--     COUNT(*) - COUNT(build_id)
-- FROM visit_definitions
-- UNION ALL
-- SELECT 
--     'form_definitions',
--     COUNT(*),
--     COUNT(build_id),
--     COUNT(*) - COUNT(build_id)
-- FROM form_definitions
-- UNION ALL
-- SELECT 
--     'study_form_data',
--     COUNT(*),
--     COUNT(build_id),
--     COUNT(*) - COUNT(build_id)
-- FROM study_form_data
-- UNION ALL
-- SELECT 
--     'study_form_data_audit',
--     COUNT(*),
--     COUNT(build_id),
--     COUNT(*) - COUNT(build_id)
-- FROM study_form_data_audit;
-- Expected: All rows should have build_id (missing count = 0)

-- ============================================================================
-- ROLLBACK PLAN (if needed)
-- ============================================================================
-- IF MIGRATION FAILS, run these commands to rollback:
--
-- -- Rollback Part 9: study_form_data_audit
-- ALTER TABLE study_form_data_audit DROP FOREIGN KEY fk_study_form_data_audit_build;
-- ALTER TABLE study_form_data_audit DROP COLUMN build_id;
-- DROP INDEX idx_study_form_data_audit_build_id ON study_form_data_audit;
-- DROP INDEX idx_study_form_data_audit_record_build ON study_form_data_audit;
-- DROP INDEX idx_study_form_data_audit_study_build ON study_form_data_audit;
--
-- -- Rollback Part 8: study_form_data
-- ALTER TABLE study_form_data DROP FOREIGN KEY fk_study_form_data_build;
-- ALTER TABLE study_form_data DROP COLUMN build_id;
-- DROP INDEX idx_study_form_data_build_id ON study_form_data;
-- DROP INDEX idx_study_form_data_study_build ON study_form_data;
-- DROP INDEX idx_study_form_data_form_build ON study_form_data;
--
-- -- Rollback Part 7: form_definitions
-- ALTER TABLE form_definitions DROP FOREIGN KEY fk_form_definition_build;
-- ALTER TABLE form_definitions DROP COLUMN build_id;
-- DROP INDEX idx_form_definitions_build_id ON form_definitions;
-- DROP INDEX idx_form_definitions_study_build ON form_definitions;
--
-- -- Rollback Part 6: visit_definitions
-- ALTER TABLE visit_definitions DROP FOREIGN KEY fk_visit_definition_build;
-- ALTER TABLE visit_definitions DROP COLUMN build_id;
-- DROP INDEX idx_visit_definitions_build_id ON visit_definitions;
-- DROP INDEX idx_visit_definitions_study_build ON visit_definitions;
--
-- -- Rollback Part 2: visit_forms
-- ALTER TABLE visit_forms DROP FOREIGN KEY fk_visit_form_build;
-- ALTER TABLE visit_forms DROP COLUMN build_id;
-- DROP INDEX idx_visit_forms_build_id ON visit_forms;
-- DROP INDEX idx_visit_forms_visit_build ON visit_forms;
--
-- -- Rollback Part 1: study_visit_instances
-- ALTER TABLE study_visit_instances DROP FOREIGN KEY fk_visit_instance_build;
-- ALTER TABLE study_visit_instances DROP COLUMN build_id;
-- DROP INDEX idx_visit_instances_build_id ON study_visit_instances;
-- DROP INDEX idx_visit_instances_study_build ON study_visit_instances;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
