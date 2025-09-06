-- Create table for locking audit
CREATE TABLE IF NOT EXISTS locking_audit (
    id VARCHAR(36) PRIMARY KEY,
    entity_id VARCHAR(36) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    operation VARCHAR(20) NOT NULL,
    reason TEXT,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_entity_id (entity_id),
    INDEX idx_entity_type (entity_type),
    INDEX idx_user_id (user_id)
);

-- Add comment to explain the table
ALTER TABLE locking_audit COMMENT = 'Tracks locking and unlocking operations on studies and forms';

-- Add comments to explain columns
ALTER TABLE locking_audit 
    MODIFY COLUMN id VARCHAR(36) COMMENT 'Primary key for the audit record',
    MODIFY COLUMN entity_id VARCHAR(36) COMMENT 'ID of the entity (study or form) that was locked/unlocked',
    MODIFY COLUMN entity_type VARCHAR(50) COMMENT 'Type of entity (STUDY or FORM)',
    MODIFY COLUMN operation VARCHAR(20) COMMENT 'Operation performed (LOCK or UNLOCK)',
    MODIFY COLUMN reason TEXT COMMENT 'Reason provided for the operation',
    MODIFY COLUMN user_id BIGINT COMMENT 'ID of the user who performed the operation',
    MODIFY COLUMN created_at TIMESTAMP COMMENT 'Timestamp when the operation was performed';
