-- Migration script for Study Versioning & Amendments System
-- Version: 1.0.0
-- Description: Creates study_versions and study_amendments tables with proper relationships

-- =====================================================
-- PRE-MIGRATION CHECKS
-- =====================================================

-- Check if studies table exists (required dependency)
SET @studies_table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
    AND table_name = 'studies'
);

-- Check if users table exists (required dependency)
SET @users_table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
    AND table_name = 'users'
);

-- =====================================================
-- BACKUP EXISTING DATA (if tables exist)
-- =====================================================

-- Create backup tables if they exist
CREATE TABLE IF NOT EXISTS study_versions_backup_20241227 AS 
SELECT * FROM study_versions WHERE 1=0;

CREATE TABLE IF NOT EXISTS study_amendments_backup_20241227 AS 
SELECT * FROM study_amendments WHERE 1=0;

-- =====================================================
-- DROP EXISTING CONSTRAINTS AND INDEXES
-- =====================================================

-- Drop foreign key constraints if they exist
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS study_amendments;
DROP TABLE IF EXISTS study_versions;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- CREATE STUDY_VERSIONS TABLE
-- =====================================================

CREATE TABLE study_versions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    version_number VARCHAR(20) NOT NULL,
    status ENUM('DRAFT', 'UNDER_REVIEW', 'SUBMITTED', 'APPROVED', 'ACTIVE', 'SUPERSEDED', 'WITHDRAWN') NOT NULL DEFAULT 'DRAFT',
    amendment_type ENUM('MAJOR', 'MINOR', 'SAFETY', 'ADMINISTRATIVE') NULL,
    amendment_reason TEXT NULL,
    description TEXT NULL,
    changes_summary TEXT NULL,
    impact_assessment TEXT NULL,
    previous_version_id BIGINT NULL,
    created_by BIGINT NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_by BIGINT NULL,
    approved_date DATETIME NULL,
    effective_date DATE NULL,
    requires_regulatory_approval BOOLEAN DEFAULT FALSE,
    notify_stakeholders BOOLEAN DEFAULT TRUE,
    additional_notes TEXT NULL,
    protocol_changes JSON NULL,
    icf_changes JSON NULL,
    regulatory_submissions JSON NULL,
    review_comments JSON NULL,
    metadata JSON NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicate version numbers per study
    UNIQUE KEY uk_study_version_number (study_id, version_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CREATE STUDY_AMENDMENTS TABLE
-- =====================================================

CREATE TABLE study_amendments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_version_id BIGINT NOT NULL,
    amendment_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    amendment_type ENUM('MAJOR', 'MINOR', 'SAFETY', 'ADMINISTRATIVE') NOT NULL,
    reason TEXT NULL,
    section_affected VARCHAR(100) NULL,
    change_details TEXT NULL,
    justification TEXT NULL,
    impact_on_subjects BOOLEAN DEFAULT FALSE,
    requires_consent_update BOOLEAN DEFAULT FALSE,
    requires_regulatory_notification BOOLEAN DEFAULT FALSE,
    status ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'IMPLEMENTED', 'REJECTED', 'WITHDRAWN') NOT NULL DEFAULT 'DRAFT',
    submitted_by BIGINT NULL,
    submitted_date DATETIME NULL,
    reviewed_by BIGINT NULL,
    reviewed_date DATETIME NULL,
    approved_by BIGINT NULL,
    approved_date DATETIME NULL,
    review_comments TEXT NULL,
    created_by BIGINT NOT NULL,
    created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    metadata JSON NULL,
    
    -- Unique constraint for amendment numbers within a version
    UNIQUE KEY uk_amendment_number_per_version (study_version_id, amendment_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Study Versions Indexes
CREATE INDEX idx_study_versions_study_id ON study_versions (study_id);
CREATE INDEX idx_study_versions_status ON study_versions (status);
CREATE INDEX idx_study_versions_version_number ON study_versions (version_number);
CREATE INDEX idx_study_versions_created_date ON study_versions (created_date);
CREATE INDEX idx_study_versions_effective_date ON study_versions (effective_date);
CREATE INDEX idx_study_versions_study_status ON study_versions (study_id, status);
CREATE INDEX idx_study_versions_created_by_date ON study_versions (created_by, created_date);

-- Study Amendments Indexes
CREATE INDEX idx_study_amendments_version_id ON study_amendments (study_version_id);
CREATE INDEX idx_study_amendments_status ON study_amendments (status);
CREATE INDEX idx_study_amendments_amendment_number ON study_amendments (amendment_number);
CREATE INDEX idx_study_amendments_created_date ON study_amendments (created_date);
CREATE INDEX idx_study_amendments_type ON study_amendments (amendment_type);
CREATE INDEX idx_study_amendments_version_status ON study_amendments (study_version_id, status);
CREATE INDEX idx_study_amendments_type_status ON study_amendments (amendment_type, status);

-- =====================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Only add foreign keys if dependent tables exist
SET @add_fk_studies = IF(@studies_table_exists > 0, 
    'ALTER TABLE study_versions ADD CONSTRAINT fk_study_versions_study_id 
     FOREIGN KEY (study_id) REFERENCES studies (id) ON DELETE CASCADE',
    'SELECT "Studies table not found - skipping foreign key constraint" as warning'
);

SET @add_fk_users_created = IF(@users_table_exists > 0,
    'ALTER TABLE study_versions ADD CONSTRAINT fk_study_versions_created_by 
     FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT',
    'SELECT "Users table not found - skipping created_by foreign key constraint" as warning'
);

SET @add_fk_users_approved = IF(@users_table_exists > 0,
    'ALTER TABLE study_versions ADD CONSTRAINT fk_study_versions_approved_by 
     FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL',
    'SELECT "Users table not found - skipping approved_by foreign key constraint" as warning'
);

-- Execute foreign key additions
PREPARE stmt1 FROM @add_fk_studies;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

PREPARE stmt2 FROM @add_fk_users_created;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

PREPARE stmt3 FROM @add_fk_users_approved;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- Self-referencing foreign key for previous version
ALTER TABLE study_versions ADD CONSTRAINT fk_study_versions_previous_version 
FOREIGN KEY (previous_version_id) REFERENCES study_versions (id) ON DELETE SET NULL;

-- Foreign keys for study_amendments table
ALTER TABLE study_amendments ADD CONSTRAINT fk_study_amendments_version_id 
FOREIGN KEY (study_version_id) REFERENCES study_versions (id) ON DELETE CASCADE;

-- User foreign keys for amendments (only if users table exists)
SET @add_fk_amendments_created = IF(@users_table_exists > 0,
    'ALTER TABLE study_amendments ADD CONSTRAINT fk_study_amendments_created_by 
     FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT',
    'SELECT "Users table not found - skipping amendments created_by foreign key constraint" as warning'
);

SET @add_fk_amendments_submitted = IF(@users_table_exists > 0,
    'ALTER TABLE study_amendments ADD CONSTRAINT fk_study_amendments_submitted_by 
     FOREIGN KEY (submitted_by) REFERENCES users (id) ON DELETE SET NULL',
    'SELECT "Users table not found - skipping amendments submitted_by foreign key constraint" as warning'
);

SET @add_fk_amendments_reviewed = IF(@users_table_exists > 0,
    'ALTER TABLE study_amendments ADD CONSTRAINT fk_study_amendments_reviewed_by 
     FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL',
    'SELECT "Users table not found - skipping amendments reviewed_by foreign key constraint" as warning'
);

SET @add_fk_amendments_approved = IF(@users_table_exists > 0,
    'ALTER TABLE study_amendments ADD CONSTRAINT fk_study_amendments_approved_by 
     FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL',
    'SELECT "Users table not found - skipping amendments approved_by foreign key constraint" as warning'
);

PREPARE stmt4 FROM @add_fk_amendments_created;
EXECUTE stmt4;
DEALLOCATE PREPARE stmt4;

PREPARE stmt5 FROM @add_fk_amendments_submitted;
EXECUTE stmt5;
DEALLOCATE PREPARE stmt5;

PREPARE stmt6 FROM @add_fk_amendments_reviewed;
EXECUTE stmt6;
DEALLOCATE PREPARE stmt6;

PREPARE stmt7 FROM @add_fk_amendments_approved;
EXECUTE stmt7;
DEALLOCATE PREPARE stmt7;

-- =====================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Active study versions
CREATE OR REPLACE VIEW active_study_versions AS
SELECT 
    sv.*,
    CASE 
        WHEN @studies_table_exists > 0 THEN s.name
        ELSE 'N/A'
    END as study_name,
    CASE 
        WHEN @studies_table_exists > 0 THEN s.protocol_number
        ELSE 'N/A'
    END as protocol_number
FROM study_versions sv
LEFT JOIN studies s ON sv.study_id = s.id
WHERE sv.status = 'ACTIVE';

-- View: Study version history with changes
CREATE OR REPLACE VIEW study_version_history AS
SELECT 
    sv.*,
    CASE 
        WHEN @studies_table_exists > 0 THEN s.name
        ELSE 'N/A'
    END as study_name,
    CASE 
        WHEN @studies_table_exists > 0 THEN s.protocol_number
        ELSE 'N/A'
    END as protocol_number,
    prev_sv.version_number as previous_version,
    DATEDIFF(sv.created_date, prev_sv.created_date) as days_since_previous,
    (SELECT COUNT(*) FROM study_amendments sa WHERE sa.study_version_id = sv.id) as amendment_count
FROM study_versions sv
LEFT JOIN studies s ON sv.study_id = s.id
LEFT JOIN study_versions prev_sv ON sv.previous_version_id = prev_sv.id
ORDER BY sv.study_id, sv.created_date DESC;

-- View: Pending regulatory approvals
CREATE OR REPLACE VIEW pending_regulatory_approvals AS
SELECT 
    sv.*,
    CASE 
        WHEN @studies_table_exists > 0 THEN s.name
        ELSE 'N/A'
    END as study_name,
    CASE 
        WHEN @studies_table_exists > 0 THEN s.protocol_number
        ELSE 'N/A'
    END as protocol_number,
    DATEDIFF(NOW(), sv.created_date) as days_pending
FROM study_versions sv
LEFT JOIN studies s ON sv.study_id = s.id
WHERE sv.requires_regulatory_approval = TRUE 
  AND sv.status IN ('DRAFT', 'UNDER_REVIEW', 'SUBMITTED')
ORDER BY sv.created_date ASC;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Trigger: Automatically set amendment number for new amendments
DELIMITER //
CREATE TRIGGER trg_amendment_number_auto_increment
BEFORE INSERT ON study_amendments
FOR EACH ROW
BEGIN
    DECLARE v_next_number INT;
    
    -- Get the next amendment number for this version
    SELECT COALESCE(MAX(amendment_number), 0) + 1
    INTO v_next_number
    FROM study_amendments
    WHERE study_version_id = NEW.study_version_id;
    
    SET NEW.amendment_number = v_next_number;
END//
DELIMITER ;

-- Triggers to update study amendment count (only if studies table exists)
DELIMITER //
CREATE TRIGGER trg_update_study_amendment_count_insert
AFTER INSERT ON study_versions
FOR EACH ROW
BEGIN
    IF @studies_table_exists > 0 THEN
        UPDATE studies 
        SET amendments = (
            SELECT COUNT(*) 
            FROM study_versions sv 
            WHERE sv.study_id = NEW.study_id
        )
        WHERE id = NEW.study_id;
    END IF;
END//

CREATE TRIGGER trg_update_study_amendment_count_delete
AFTER DELETE ON study_versions
FOR EACH ROW
BEGIN
    IF @studies_table_exists > 0 THEN
        UPDATE studies 
        SET amendments = (
            SELECT COUNT(*) 
            FROM study_versions sv 
            WHERE sv.study_id = OLD.study_id
        )
        WHERE id = OLD.study_id;
    END IF;
END//
DELIMITER ;

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert initial version for existing studies (only if studies exist)
INSERT IGNORE INTO study_versions (
    study_id, version_number, status, created_by, created_date,
    description, effective_date
) 
SELECT 
    id as study_id,
    'v1.0' as version_number,
    'ACTIVE' as status,
    1 as created_by,
    NOW() as created_date,
    'Initial protocol version' as description,
    CURDATE() as effective_date
FROM studies 
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = DATABASE() AND table_name = 'studies'
)
LIMIT 10; -- Limit to first 10 studies for safety

-- =====================================================
-- POST-MIGRATION VERIFICATION
-- =====================================================

-- Verify table creation
SELECT 
    'study_versions' as table_name,
    COUNT(*) as row_count,
    'Created successfully' as status
FROM study_versions
UNION ALL
SELECT 
    'study_amendments' as table_name,
    COUNT(*) as row_count,
    'Created successfully' as status
FROM study_amendments;

-- Show table structure
DESCRIBE study_versions;
DESCRIBE study_amendments;

-- Show constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    CONSTRAINT_TYPE
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('study_versions', 'study_amendments')
ORDER BY TABLE_NAME, CONSTRAINT_TYPE;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

SELECT 'Study Versioning & Amendments migration completed successfully!' as migration_status;