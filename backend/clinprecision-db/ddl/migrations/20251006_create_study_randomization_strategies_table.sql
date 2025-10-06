-- Migration: Create study_randomization_strategies table
-- Date: 2025-10-06
-- Description: Create normalized table for randomization strategy data
--              to replace JSON column approach with zero technical debt

CREATE TABLE IF NOT EXISTS study_randomization_strategies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_arm_id BIGINT NOT NULL,
    
    -- Randomization strategy fields
    type VARCHAR(100) NOT NULL COMMENT 'Type of randomization (SIMPLE, BLOCK, STRATIFIED, etc.)',
    ratio VARCHAR(50) NULL COMMENT 'Randomization ratio (e.g., 1:1, 2:1:1)',
    block_size INT NULL COMMENT 'Block size for block randomization',
    stratification_factors TEXT NULL COMMENT 'Comma-separated stratification factors',
    notes TEXT NULL COMMENT 'Additional notes about randomization strategy',
    
    -- Audit fields
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
    
    -- Foreign key constraint
    CONSTRAINT fk_study_randomization_strategies_study_arm_id 
        FOREIGN KEY (study_arm_id) REFERENCES study_arms(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_study_randomization_strategies_study_arm_id (study_arm_id),
    INDEX idx_study_randomization_strategies_type (type),
    INDEX idx_study_randomization_strategies_is_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Randomization strategies for study arms - normalized approach for zero technical debt';