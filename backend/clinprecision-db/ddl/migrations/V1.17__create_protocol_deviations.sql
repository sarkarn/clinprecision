-- Migration: Create Protocol Deviation Tracking System
-- Date: 2025-10-23
-- Purpose: Track and document protocol deviations for regulatory compliance

-- Protocol Deviations table
CREATE TABLE IF NOT EXISTS protocol_deviations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    
    -- Core References
    patient_id BIGINT NOT NULL COMMENT 'Patient who experienced the deviation',
    study_id BIGINT NOT NULL COMMENT 'Study in which deviation occurred',
    study_site_id BIGINT NULL COMMENT 'Study site where deviation occurred (site_studies table)',
    visit_instance_id BIGINT NULL COMMENT 'Visit instance associated with deviation (if applicable)',
    
    -- Deviation Classification
    deviation_type ENUM(
        'VISIT_WINDOW',           -- Visit outside protocol window
        'INCLUSION_EXCLUSION',    -- Eligibility criteria violation
        'PROCEDURE',              -- Protocol procedure not followed
        'DOSING',                 -- Incorrect dosing or timing
        'CONSENT',                -- Consent process deviation
        'FORM_COMPLETION',        -- Required form not completed
        'SPECIMEN_HANDLING',      -- Lab/specimen protocol violation
        'RANDOMIZATION',          -- Randomization process deviation
        'OTHER'                   -- Other protocol violations
    ) NOT NULL COMMENT 'Category of protocol deviation',
    
    severity ENUM(
        'MINOR',    -- No impact on subject safety or data integrity
        'MAJOR',    -- Potential impact on safety/data, requires reporting
        'CRITICAL'  -- Serious impact on safety/data, immediate action required
    ) NOT NULL COMMENT 'Severity level of deviation',
    
    -- Deviation Details
    deviation_date DATE NOT NULL COMMENT 'Date when deviation occurred',
    detected_date DATE NOT NULL COMMENT 'Date when deviation was detected',
    title VARCHAR(255) NOT NULL COMMENT 'Brief deviation title',
    description TEXT NOT NULL COMMENT 'Detailed description of what happened',
    
    -- Protocol Reference
    protocol_section VARCHAR(255) NULL COMMENT 'Section of protocol that was deviated from',
    expected_procedure TEXT NULL COMMENT 'What should have happened per protocol',
    actual_procedure TEXT NULL COMMENT 'What actually happened',
    
    -- Root Cause & Impact
    root_cause TEXT NULL COMMENT 'Identified root cause of deviation',
    impact_assessment TEXT NULL COMMENT 'Assessment of impact on subject safety and data integrity',
    
    -- Corrective Actions
    immediate_action TEXT NULL COMMENT 'Immediate action taken when detected',
    corrective_action TEXT NULL COMMENT 'Corrective action to prevent recurrence',
    preventive_action TEXT NULL COMMENT 'Preventive measures implemented',
    
    -- Resolution
    deviation_status ENUM(
        'OPEN',        -- Newly identified, under investigation
        'UNDER_REVIEW', -- Being reviewed by study team
        'RESOLVED',    -- Corrective actions completed
        'CLOSED'       -- Fully documented and closed
    ) DEFAULT 'OPEN' COMMENT 'Current status of deviation handling',
    
    resolved_date DATE NULL COMMENT 'Date when deviation was resolved',
    closed_date DATE NULL COMMENT 'Date when deviation was officially closed',
    
    -- Regulatory Reporting
    requires_reporting BOOLEAN DEFAULT FALSE COMMENT 'Whether deviation must be reported to sponsor/IRB',
    reported_to_sponsor BOOLEAN DEFAULT FALSE COMMENT 'Whether reported to sponsor',
    sponsor_report_date DATE NULL COMMENT 'Date reported to sponsor',
    reported_to_irb BOOLEAN DEFAULT FALSE COMMENT 'Whether reported to IRB/EC',
    irb_report_date DATE NULL COMMENT 'Date reported to IRB',
    
    -- Audit Trail
    detected_by BIGINT NOT NULL COMMENT 'User ID who detected the deviation',
    reviewed_by BIGINT NULL COMMENT 'User ID who reviewed the deviation',
    resolved_by BIGINT NULL COMMENT 'User ID who resolved the deviation',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (study_site_id) REFERENCES site_studies(id) ON DELETE SET NULL,
    FOREIGN KEY (visit_instance_id) REFERENCES study_visit_instances(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_protocol_deviations_patient (patient_id),
    INDEX idx_protocol_deviations_study (study_id),
    INDEX idx_protocol_deviations_study_site (study_site_id),
    INDEX idx_protocol_deviations_visit (visit_instance_id),
    INDEX idx_protocol_deviations_type (deviation_type),
    INDEX idx_protocol_deviations_severity (severity),
    INDEX idx_protocol_deviations_status (deviation_status),
    INDEX idx_protocol_deviations_date (deviation_date),
    INDEX idx_protocol_deviations_detected (detected_date),
    INDEX idx_protocol_deviations_reporting (requires_reporting, reported_to_sponsor, reported_to_irb)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 
COMMENT='Tracks protocol deviations for regulatory compliance and quality management. Captures deviations, root causes, corrective actions, and regulatory reporting status.';

-- Deviation Comments/Notes table (for ongoing discussion/documentation)
CREATE TABLE IF NOT EXISTS protocol_deviation_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    deviation_id BIGINT NOT NULL,
    comment_type ENUM('NOTE', 'INVESTIGATION', 'ACTION', 'REVIEW', 'APPROVAL') NOT NULL,
    comment_text TEXT NOT NULL,
    commented_by BIGINT NOT NULL COMMENT 'User ID who made the comment',
    commented_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (deviation_id) REFERENCES protocol_deviations(id) ON DELETE CASCADE,
    
    INDEX idx_deviation_comments_deviation (deviation_id),
    INDEX idx_deviation_comments_date (commented_at DESC)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
COMMENT='Comments and discussion thread for protocol deviations';
