-- ============================================================================
-- Fix Patient Status History Trigger
-- Version: 1.15.1 (Hotfix)
-- Date: October 12, 2025
-- Purpose: Fix trigger to allow NULL previous_status for initial registration
-- Issue: Trigger was failing with "Variable 'MESSAGE_TEXT' can't be set to the value of 'NULL'"
-- ============================================================================

-- Drop the existing trigger
DROP TRIGGER IF EXISTS trg_validate_status_transition;

-- Recreate with fix for NULL previous_status
DELIMITER //

CREATE TRIGGER trg_validate_status_transition
BEFORE INSERT ON patient_status_history
FOR EACH ROW
BEGIN
    DECLARE valid_transition BOOLEAN DEFAULT FALSE;
    DECLARE error_msg VARCHAR(500);
    
    -- Valid transitions:
    -- NULL (initial) → REGISTERED (initial patient registration)
    -- REGISTERED → SCREENING, WITHDRAWN
    -- SCREENING → ENROLLED, WITHDRAWN
    -- ENROLLED → ACTIVE, WITHDRAWN
    -- ACTIVE → COMPLETED, WITHDRAWN
    -- COMPLETED → (none - terminal)
    -- WITHDRAWN → (none - terminal)
    
    -- Check if transition is valid
    IF (NEW.previous_status IS NULL AND NEW.new_status = 'REGISTERED') THEN
        -- Initial registration (no previous status)
        SET valid_transition = TRUE;
    ELSEIF (NEW.previous_status = 'REGISTERED' AND NEW.new_status IN ('SCREENING', 'WITHDRAWN')) THEN
        SET valid_transition = TRUE;
    ELSEIF (NEW.previous_status = 'SCREENING' AND NEW.new_status IN ('ENROLLED', 'WITHDRAWN')) THEN
        SET valid_transition = TRUE;
    ELSEIF (NEW.previous_status = 'ENROLLED' AND NEW.new_status IN ('ACTIVE', 'WITHDRAWN')) THEN
        SET valid_transition = TRUE;
    ELSEIF (NEW.previous_status = 'ACTIVE' AND NEW.new_status IN ('COMPLETED', 'WITHDRAWN')) THEN
        SET valid_transition = TRUE;
    ELSEIF (NEW.previous_status IS NOT NULL AND NEW.new_status = 'WITHDRAWN') THEN
        -- Can always withdraw from any non-terminal status (but not from NULL)
        SET valid_transition = TRUE;
    END IF;
    
    -- Raise error if invalid transition
    IF NOT valid_transition THEN
        SET error_msg = CONCAT(
            'Invalid status transition: ', 
            COALESCE(NEW.previous_status, 'NULL'), 
            ' -> ', 
            NEW.new_status,
            '. Valid transitions: NULL->REGISTERED (initial), REGISTERED->SCREENING, SCREENING->ENROLLED, ENROLLED->ACTIVE, ACTIVE->COMPLETED, ANY->WITHDRAWN'
        );
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = error_msg;
    END IF;
    
    -- Validate reason is not empty
    IF NEW.reason IS NULL OR TRIM(NEW.reason) = '' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reason is required for status change';
    END IF;
END //

DELIMITER ;

-- Also update the column definition to allow NULL
ALTER TABLE patient_status_history 
MODIFY COLUMN previous_status VARCHAR(50) NULL COMMENT 'Previous patient status (NULL for initial registration)';

-- ============================================================================
-- Verification
-- ============================================================================

-- Show the trigger
SHOW TRIGGERS LIKE 'patient_status_history';

-- Show the column definition
SHOW COLUMNS FROM patient_status_history LIKE 'previous_status';

-- ============================================================================
-- Migration Complete
-- Fix applied: Trigger now handles NULL previous_status for initial registration
-- ============================================================================
