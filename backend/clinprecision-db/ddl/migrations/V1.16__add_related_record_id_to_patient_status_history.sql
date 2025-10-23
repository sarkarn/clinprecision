-- Migration: Add related_record_id to patient_status_history
-- Date: 2025-10-23
-- Purpose: Link patient status audit records to external artifacts (e.g. screening form submissions)

ALTER TABLE patient_status_history
    ADD COLUMN related_record_id VARCHAR(100) NULL COMMENT 'Optional external record identifier supporting this status change (e.g. screening form data ID)' AFTER notes;

ALTER TABLE patient_status_history
    ADD INDEX idx_patient_status_history_related_record_id (related_record_id);
