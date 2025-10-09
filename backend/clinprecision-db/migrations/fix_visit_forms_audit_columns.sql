-- Add missing audit columns to visit_forms table
-- Fix for: Unknown column 'vfe1_0.created_by' in 'field list' error

ALTER TABLE visit_forms 
    ADD COLUMN created_by BIGINT NULL COMMENT 'User ID who created this form assignment' AFTER created_at,
    ADD COLUMN deleted_at TIMESTAMP NULL COMMENT 'Timestamp when soft deleted' AFTER is_deleted,
    ADD COLUMN deleted_by VARCHAR(100) NULL COMMENT 'User who deleted this form assignment' AFTER deleted_at,
    ADD COLUMN deletion_reason TEXT NULL COMMENT 'Reason for deletion' AFTER deleted_by;

-- Add foreign key for created_by if needed
ALTER TABLE visit_forms 
    ADD CONSTRAINT fk_visit_forms_created_by FOREIGN KEY (created_by) REFERENCES users(id);

-- Verify the changes
DESCRIBE visit_forms;
