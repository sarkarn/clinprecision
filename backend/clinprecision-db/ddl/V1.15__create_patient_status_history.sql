-- ============================================================================
-- Patient Status History Table Migration
-- Version: 1.15
-- Date: October 12, 2025
-- Purpose: Track complete patient status transition history for audit trail
-- Related: Week 2 - Subject Status Management Implementation
-- ============================================================================

-- Patient Status History table
-- Tracks all status changes for complete audit trail (FDA 21 CFR Part 11 compliance)
CREATE TABLE IF NOT EXISTS patient_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Patient References
    patient_id BIGINT NOT NULL COMMENT 'FK to patients table (read model)',
    aggregate_uuid VARCHAR(255) NOT NULL COMMENT 'Patient aggregate UUID for event sourcing',
    
    -- Event Tracking
    event_id VARCHAR(255) NOT NULL UNIQUE COMMENT 'Unique UUID of PatientStatusChangedEvent from event store. Used for idempotency to prevent duplicate records on event replay.',
    
    -- Status Transition
    previous_status VARCHAR(50) NOT NULL COMMENT 'Previous patient status',
    new_status VARCHAR(50) NOT NULL COMMENT 'New patient status after transition',
    
    -- Change Context
    reason TEXT NOT NULL COMMENT 'Required reason for status change',
    changed_by VARCHAR(100) NOT NULL COMMENT 'User who performed the status change',
    changed_at TIMESTAMP NOT NULL COMMENT 'Timestamp when status changed',
    notes TEXT COMMENT 'Optional additional notes about the status change',
    
    -- Optional: Study/Enrollment Context
    enrollment_id BIGINT NULL COMMENT 'Optional FK to patient_enrollments if status change is enrollment-specific',
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES patient_enrollments(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_patient_status_history_patient_id (patient_id),
    INDEX idx_patient_status_history_aggregate_uuid (aggregate_uuid),
    INDEX idx_patient_status_history_event_id (event_id),
    INDEX idx_patient_status_history_changed_at (changed_at DESC),
    INDEX idx_patient_status_history_new_status (new_status),
    INDEX idx_patient_status_history_changed_by (changed_by),
    INDEX idx_patient_status_history_enrollment_id (enrollment_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Complete audit trail of patient status changes for regulatory compliance. Tracks all status transitions with who, when, why, and what changed. Required for FDA 21 CFR Part 11 compliance. Status flow: REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED/WITHDRAWN';

-- ============================================================================
-- View: Latest Patient Status
-- Purpose: Quick lookup of current status for each patient
-- ============================================================================

CREATE OR REPLACE VIEW v_patient_current_status AS
SELECT 
    psh.patient_id,
    psh.aggregate_uuid,
    psh.new_status AS current_status,
    psh.previous_status,
    psh.reason,
    psh.changed_by,
    psh.changed_at,
    psh.notes,
    DATEDIFF(NOW(), psh.changed_at) AS days_in_current_status
FROM patient_status_history psh
INNER JOIN (
    SELECT patient_id, MAX(changed_at) AS max_changed_at
    FROM patient_status_history
    GROUP BY patient_id
) latest ON psh.patient_id = latest.patient_id 
    AND psh.changed_at = latest.max_changed_at;

-- ============================================================================
-- View: Status Transition Summary
-- Purpose: Analyze status transition patterns across all patients
-- ============================================================================

CREATE OR REPLACE VIEW v_status_transition_summary AS
SELECT 
    previous_status,
    new_status,
    COUNT(*) AS transition_count,
    COUNT(DISTINCT patient_id) AS unique_patients,
    MIN(changed_at) AS first_transition_date,
    MAX(changed_at) AS last_transition_date
FROM patient_status_history
GROUP BY previous_status, new_status
ORDER BY transition_count DESC, previous_status, new_status;

-- ============================================================================
-- Function: Get Status History for Patient
-- Purpose: Retrieve chronological status history
-- ============================================================================

DELIMITER //

CREATE FUNCTION IF NOT EXISTS fn_get_patient_status_count(
    p_patient_id BIGINT
) RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE status_count INT;
    
    SELECT COUNT(*) INTO status_count
    FROM patient_status_history
    WHERE patient_id = p_patient_id;
    
    RETURN status_count;
END //

DELIMITER ;

-- ============================================================================
-- Trigger: Validate Status Transition
-- Purpose: Ensure only valid status transitions are recorded
-- ============================================================================

DELIMITER //

CREATE TRIGGER trg_validate_status_transition
BEFORE INSERT ON patient_status_history
FOR EACH ROW
BEGIN
    DECLARE valid_transition BOOLEAN DEFAULT FALSE;
    
    -- Valid transitions:
    -- REGISTERED → SCREENING, WITHDRAWN
    -- SCREENING → ENROLLED, WITHDRAWN
    -- ENROLLED → ACTIVE, WITHDRAWN
    -- ACTIVE → COMPLETED, WITHDRAWN
    -- COMPLETED → (none - terminal)
    -- WITHDRAWN → (none - terminal)
    
    -- Check if transition is valid
    IF (NEW.previous_status = 'REGISTERED' AND NEW.new_status IN ('SCREENING', 'WITHDRAWN')) THEN
        SET valid_transition = TRUE;
    ELSEIF (NEW.previous_status = 'SCREENING' AND NEW.new_status IN ('ENROLLED', 'WITHDRAWN')) THEN
        SET valid_transition = TRUE;
    ELSEIF (NEW.previous_status = 'ENROLLED' AND NEW.new_status IN ('ACTIVE', 'WITHDRAWN')) THEN
        SET valid_transition = TRUE;
    ELSEIF (NEW.previous_status = 'ACTIVE' AND NEW.new_status IN ('COMPLETED', 'WITHDRAWN')) THEN
        SET valid_transition = TRUE;
    ELSEIF (NEW.new_status = 'WITHDRAWN') THEN
        -- Can always withdraw from any non-terminal status
        SET valid_transition = TRUE;
    END IF;
    
    -- Raise error if invalid transition
    IF NOT valid_transition THEN
        SET @error_msg = CONCAT(
            'Invalid status transition: ', 
            NEW.previous_status, 
            ' -> ', 
            NEW.new_status,
            '. Valid transitions: REGISTERED->SCREENING, SCREENING->ENROLLED, ENROLLED->ACTIVE, ACTIVE->COMPLETED, ANY->WITHDRAWN'
        );
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @error_msg;
    END IF;
    
    -- Validate reason is not empty
    IF NEW.reason IS NULL OR TRIM(NEW.reason) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reason is required for status change';
    END IF;
END //

DELIMITER ;

-- ============================================================================
-- Sample Data (for development/testing only - remove in production)
-- ============================================================================

-- NOTE: This is sample data for testing purposes only
-- Remove this section before deploying to production

-- Example: Patient status history for patient 1
/*
INSERT INTO patient_status_history 
(patient_id, aggregate_uuid, event_id, previous_status, new_status, reason, changed_by, changed_at)
VALUES
(1, 'uuid-patient-1', 'uuid-event-1', 'REGISTERED', 'SCREENING', 
 'Screening visit scheduled for March 15, 2025', 'coordinator@example.com', NOW()),
 
(1, 'uuid-patient-1', 'uuid-event-2', 'SCREENING', 'ENROLLED',
 'Passed all eligibility criteria', 'coordinator@example.com', DATE_ADD(NOW(), INTERVAL 7 DAY)),
 
(1, 'uuid-patient-1', 'uuid-event-3', 'ENROLLED', 'ACTIVE',
 'First treatment visit completed', 'dr.smith@example.com', DATE_ADD(NOW(), INTERVAL 14 DAY));
*/

-- ============================================================================
-- Migration Complete
