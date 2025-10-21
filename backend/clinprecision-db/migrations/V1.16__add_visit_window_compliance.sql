-- ================================================================
-- Migration: Add Visit Window Compliance Tracking
-- Gap #4: Visit Window Compliance
-- Date: October 21, 2025
-- Author: Development Team
-- 
-- Purpose: Add columns to track visit windows for protocol compliance
-- 
-- Changes:
-- - Add visit_window_start: Earliest acceptable visit date
-- - Add visit_window_end: Latest acceptable visit date  
-- - Add window_days_before: Days before target (from protocol)
-- - Add window_days_after: Days after target (from protocol)
-- - Add compliance_status: ON_TIME, OVERDUE, MISSED, etc.
-- ================================================================

USE clinprecisiondb;

-- Add visit window tracking columns
ALTER TABLE study_visit_instances 
ADD COLUMN visit_window_start DATE NULL 
    COMMENT 'Earliest acceptable visit date (calculated from protocol timepoint - window_days_before)',
ADD COLUMN visit_window_end DATE NULL 
    COMMENT 'Latest acceptable visit date (calculated from protocol timepoint + window_days_after)',
ADD COLUMN window_days_before INT NULL 
    COMMENT 'Days before target date allowed (from visit_definitions protocol)',
ADD COLUMN window_days_after INT NULL 
    COMMENT 'Days after target date allowed (from visit_definitions protocol)',
ADD COLUMN compliance_status VARCHAR(50) NULL 
    COMMENT 'Visit compliance status: SCHEDULED, WINDOW_OPEN, APPROACHING_DEADLINE, ON_TIME, OVERDUE, MISSED, OUT_OF_WINDOW_EARLY, OUT_OF_WINDOW_LATE';

-- Add index for compliance queries
CREATE INDEX idx_compliance_status ON study_visit_instances(study_id, compliance_status);
CREATE INDEX idx_window_dates ON study_visit_instances(visit_window_start, visit_window_end);

-- ================================================================
-- Compliance Status Values Reference:
-- ================================================================
-- 
-- SCHEDULED: Visit scheduled, window not yet open
-- WINDOW_OPEN: Current date is within visit window, visit not yet completed
-- APPROACHING_DEADLINE: Visit not completed, less than 2 days until window closes
-- ON_TIME: Visit completed within allowed window
-- OVERDUE: Past window_end date, not yet completed (1-7 days late)
-- MISSED: Past window_end date by more than 7 days, not completed
-- OUT_OF_WINDOW_EARLY: Visit completed before window_start date (protocol violation)
-- OUT_OF_WINDOW_LATE: Visit completed after window_end date (protocol violation)
-- 
-- ================================================================

-- Update existing visit_instances_audit table to include new columns
ALTER TABLE study_visit_instances_audit
MODIFY COLUMN new_data JSON COMMENT 'New record data including visit_window_start, visit_window_end, window_days_before, window_days_after, compliance_status';

-- ================================================================
-- Example Usage:
-- ================================================================
-- 
-- Protocol: "Baseline visit at Day 7 (±3 days) after enrollment"
-- Subject enrolled: Oct 10, 2025
-- 
-- Calculation:
--   Target date: Oct 10 + 7 days = Oct 17
--   Window: ±3 days
--   visit_window_start = Oct 14
--   visit_window_end = Oct 20
--   window_days_before = 3
--   window_days_after = 3
--   compliance_status = 'SCHEDULED' (initially)
-- 
-- If visit completed Oct 18: compliance_status = 'ON_TIME'
-- If visit completed Oct 13: compliance_status = 'OUT_OF_WINDOW_EARLY'
-- If visit completed Oct 22: compliance_status = 'OUT_OF_WINDOW_LATE'
-- If not completed by Oct 21: compliance_status = 'OVERDUE'
-- 
-- ================================================================

-- Verification queries
-- SELECT 
--     id,
--     subject_id,
--     visit_date,
--     visit_window_start,
--     visit_window_end,
--     DATEDIFF(visit_window_end, visit_window_start) + 1 AS window_size_days,
--     compliance_status
-- FROM study_visit_instances
-- WHERE visit_window_start IS NOT NULL
-- ORDER BY visit_window_start;

-- ================================================================
-- Rollback Script (if needed):
-- ================================================================
-- 
-- DROP INDEX idx_compliance_status ON study_visit_instances;
-- DROP INDEX idx_window_dates ON study_visit_instances;
-- 
-- ALTER TABLE study_visit_instances 
-- DROP COLUMN visit_window_start,
-- DROP COLUMN visit_window_end,
-- DROP COLUMN window_days_before,
-- DROP COLUMN window_days_after,
-- DROP COLUMN compliance_status;
-- 
-- ================================================================

-- Migration complete
SELECT 'Visit window compliance tracking columns added successfully' AS status;
