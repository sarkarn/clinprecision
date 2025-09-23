-- Study Versioning & Amendments System
-- Database schema for study versions and amendments

-- =====================================================
-- Table: study_versions
-- Purpose: Store different versions of study protocols
-- =====================================================
CREATE TABLE IF NOT EXISTS study_versions (
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
    
    -- Indexes for performance
    INDEX idx_study_versions_study_id (study_id),
    INDEX idx_study_versions_status (status),
    INDEX idx_study_versions_version_number (version_number),
    INDEX idx_study_versions_created_date (created_date),
    INDEX idx_study_versions_effective_date (effective_date),
    
    -- Unique constraint to prevent duplicate version numbers per study
    UNIQUE KEY uk_study_version_number (study_id, version_number),
    
    -- Foreign key constraints
    CONSTRAINT fk_study_versions_study_id FOREIGN KEY (study_id) REFERENCES studies (id) ON DELETE CASCADE,
    CONSTRAINT fk_study_versions_previous_version FOREIGN KEY (previous_version_id) REFERENCES study_versions (id) ON DELETE SET NULL,
    CONSTRAINT fk_study_versions_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_study_versions_approved_by FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL
);

-- =====================================================
-- Table: study_amendments
-- Purpose: Store individual amendments within versions
-- =====================================================
CREATE TABLE IF NOT EXISTS study_amendments (
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
    
    -- Indexes for performance
    INDEX idx_study_amendments_version_id (study_version_id),
    INDEX idx_study_amendments_status (status),
    INDEX idx_study_amendments_amendment_number (amendment_number),
    INDEX idx_study_amendments_created_date (created_date),
    INDEX idx_study_amendments_type (amendment_type),
    
    -- Unique constraint for amendment numbers within a version
    UNIQUE KEY uk_amendment_number_per_version (study_version_id, amendment_number),
    
    -- Foreign key constraints
    CONSTRAINT fk_study_amendments_version_id FOREIGN KEY (study_version_id) REFERENCES study_versions (id) ON DELETE CASCADE,
    CONSTRAINT fk_study_amendments_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_study_amendments_submitted_by FOREIGN KEY (submitted_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_study_amendments_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT fk_study_amendments_approved_by FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL
);

-- =====================================================
-- Sample data for testing
-- =====================================================

-- Insert initial version for existing studies (assuming study ID 1 exists)
INSERT INTO study_versions (
    study_id, version_number, status, created_by, created_date,
    description, effective_date
) VALUES (
    1, 'v1.0', 'ACTIVE', 1, NOW(),
    'Initial protocol version', CURDATE()
) ON DUPLICATE KEY UPDATE version_number = version_number;

-- =====================================================
-- Helpful views for common queries
-- =====================================================

-- View: Active study versions
CREATE OR REPLACE VIEW active_study_versions AS
SELECT 
    sv.*,
    s.name as study_name,
    s.protocol_number
FROM study_versions sv
JOIN studies s ON sv.study_id = s.id
WHERE sv.status = 'ACTIVE';

-- View: Study version history with changes
CREATE OR REPLACE VIEW study_version_history AS
SELECT 
    sv.*,
    s.name as study_name,
    s.protocol_number,
    prev_sv.version_number as previous_version,
    DATEDIFF(sv.created_date, prev_sv.created_date) as days_since_previous,
    (SELECT COUNT(*) FROM study_amendments sa WHERE sa.study_version_id = sv.id) as amendment_count
FROM study_versions sv
JOIN studies s ON sv.study_id = s.id
LEFT JOIN study_versions prev_sv ON sv.previous_version_id = prev_sv.id
ORDER BY sv.study_id, sv.created_date DESC;

-- View: Pending regulatory approvals
CREATE OR REPLACE VIEW pending_regulatory_approvals AS
SELECT 
    sv.*,
    s.name as study_name,
    s.protocol_number,
    DATEDIFF(NOW(), sv.created_date) as days_pending
FROM study_versions sv
JOIN studies s ON sv.study_id = s.id
WHERE sv.requires_regulatory_approval = TRUE 
  AND sv.status IN ('DRAFT', 'UNDER_REVIEW', 'SUBMITTED')
ORDER BY sv.created_date ASC;

-- =====================================================
-- Stored procedures for common operations
-- =====================================================

DELIMITER //

-- Procedure: Create new study version with automatic version numbering
CREATE OR REPLACE PROCEDURE CreateStudyVersion(
    IN p_study_id BIGINT,
    IN p_amendment_type ENUM('MAJOR', 'MINOR', 'SAFETY', 'ADMINISTRATIVE'),
    IN p_amendment_reason TEXT,
    IN p_description TEXT,
    IN p_created_by BIGINT,
    IN p_effective_date DATE,
    IN p_notify_stakeholders BOOLEAN,
    IN p_requires_regulatory BOOLEAN,
    OUT p_version_id BIGINT,
    OUT p_version_number VARCHAR(20)
)
BEGIN
    DECLARE v_latest_version VARCHAR(20);
    DECLARE v_major_num INT DEFAULT 1;
    DECLARE v_minor_num INT DEFAULT 0;
    DECLARE v_new_version VARCHAR(20);
    DECLARE v_previous_version_id BIGINT DEFAULT NULL;
    
    -- Get the latest version for this study
    SELECT version_number, id INTO v_latest_version, v_previous_version_id
    FROM study_versions 
    WHERE study_id = p_study_id 
    ORDER BY created_date DESC 
    LIMIT 1;
    
    -- Calculate next version number
    IF v_latest_version IS NOT NULL THEN
        -- Parse current version (assuming format like 'v1.2')
        SET v_major_num = CAST(SUBSTRING(v_latest_version, 2, LOCATE('.', v_latest_version) - 2) AS UNSIGNED);
        SET v_minor_num = CAST(SUBSTRING(v_latest_version, LOCATE('.', v_latest_version) + 1) AS UNSIGNED);
        
        -- Increment based on amendment type
        IF p_amendment_type IN ('MAJOR', 'SAFETY') THEN
            SET v_major_num = v_major_num + 1;
            SET v_minor_num = 0;
        ELSE
            SET v_minor_num = v_minor_num + 1;
        END IF;
    END IF;
    
    SET v_new_version = CONCAT('v', v_major_num, '.', v_minor_num);
    
    -- Insert new version
    INSERT INTO study_versions (
        study_id, version_number, amendment_type, amendment_reason,
        description, created_by, effective_date, notify_stakeholders,
        requires_regulatory_approval, previous_version_id
    ) VALUES (
        p_study_id, v_new_version, p_amendment_type, p_amendment_reason,
        p_description, p_created_by, p_effective_date, p_notify_stakeholders,
        p_requires_regulatory, v_previous_version_id
    );
    
    SET p_version_id = LAST_INSERT_ID();
    SET p_version_number = v_new_version;
END//

-- Procedure: Activate a study version (mark others as superseded)
CREATE OR REPLACE PROCEDURE ActivateStudyVersion(
    IN p_version_id BIGINT
)
BEGIN
    DECLARE v_study_id BIGINT;
    
    -- Get the study ID for this version
    SELECT study_id INTO v_study_id
    FROM study_versions
    WHERE id = p_version_id;
    
    -- Mark all other active versions for this study as superseded
    UPDATE study_versions 
    SET status = 'SUPERSEDED'
    WHERE study_id = v_study_id 
      AND status = 'ACTIVE' 
      AND id != p_version_id;
    
    -- Activate the specified version
    UPDATE study_versions 
    SET status = 'ACTIVE',
        effective_date = COALESCE(effective_date, CURDATE())
    WHERE id = p_version_id;
END//

DELIMITER ;

-- =====================================================
-- Triggers for audit and data integrity
-- =====================================================

-- Trigger: Automatically set amendment number for new amendments
DELIMITER //
CREATE OR REPLACE TRIGGER trg_amendment_number_auto_increment
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

-- Trigger: Update study amendment count when amendments are added/removed
DELIMITER //
CREATE OR REPLACE TRIGGER trg_update_study_amendment_count_insert
AFTER INSERT ON study_versions
FOR EACH ROW
BEGIN
    UPDATE studies 
    SET amendments = (
        SELECT COUNT(*) 
        FROM study_versions sv 
        WHERE sv.study_id = NEW.study_id
    )
    WHERE id = NEW.study_id;
END//

CREATE OR REPLACE TRIGGER trg_update_study_amendment_count_delete
AFTER DELETE ON study_versions
FOR EACH ROW
BEGIN
    UPDATE studies 
    SET amendments = (
        SELECT COUNT(*) 
        FROM study_versions sv 
        WHERE sv.study_id = OLD.study_id
    )
    WHERE id = OLD.study_id;
END//
DELIMITER ;

-- =====================================================
-- Indexes for optimization
-- =====================================================

-- Additional composite indexes for common query patterns
CREATE INDEX idx_study_versions_study_status ON study_versions (study_id, status);
CREATE INDEX idx_study_versions_created_by_date ON study_versions (created_by, created_date);
CREATE INDEX idx_study_amendments_version_status ON study_amendments (study_version_id, status);
CREATE INDEX idx_study_amendments_type_status ON study_amendments (amendment_type, status);