-- Visit Definitions Tables Migration for MySQL
-- This script creates the necessary database tables to support visit scheduling functionality
-- Execute this against your MySQL database

-- Use your database (replace with your actual database name)
-- USE clinprecisiondb;

-- Create visit_definitions table
CREATE TABLE IF NOT EXISTS visit_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    arm_id BIGINT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    visit_type VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    sequence_number INT NOT NULL,
    timepoint INT,
    timepoint_unit VARCHAR(20) DEFAULT 'DAYS',
    visit_window_before INT DEFAULT 0,
    visit_window_after INT DEFAULT 0,
    is_common_visit BOOLEAN DEFAULT FALSE,
    is_required BOOLEAN DEFAULT TRUE,
    is_repeating BOOLEAN DEFAULT FALSE,
    max_repeats INT,
    interval_between_repeats INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
    
    -- Foreign key constraint to studies table
    CONSTRAINT fk_visit_definitions_study_id FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    
    -- Foreign key constraint to study_arms table (optional)
    CONSTRAINT fk_visit_definitions_arm_id FOREIGN KEY (arm_id) REFERENCES study_arms(id) ON DELETE CASCADE,
    
    -- Unique constraint on study_id and sequence_number
    CONSTRAINT uk_visit_definitions_study_sequence UNIQUE (study_id, sequence_number),
    
    -- Check constraints for data integrity
    CONSTRAINT chk_visit_definitions_visit_type CHECK (visit_type IN ('SCREENING', 'BASELINE', 'TREATMENT', 'FOLLOW_UP', 'UNSCHEDULED', 'END_OF_STUDY')),
    CONSTRAINT chk_visit_definitions_timepoint_unit CHECK (timepoint_unit IN ('DAYS', 'WEEKS', 'MONTHS')),
    CONSTRAINT chk_visit_definitions_sequence CHECK (sequence_number > 0),
    CONSTRAINT chk_visit_definitions_window_before CHECK (visit_window_before >= 0),
    CONSTRAINT chk_visit_definitions_window_after CHECK (visit_window_after >= 0),
    CONSTRAINT chk_visit_definitions_max_repeats CHECK (max_repeats IS NULL OR max_repeats > 0),
    CONSTRAINT chk_visit_definitions_interval_repeats CHECK (interval_between_repeats IS NULL OR interval_between_repeats > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create visit_forms table (for visit-form associations)
CREATE TABLE IF NOT EXISTS visit_forms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    visit_definition_id BIGINT NOT NULL,
    form_definition_id BIGINT NOT NULL,
    form_sequence INT NOT NULL DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    completion_window_hours INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system',
    
    -- Foreign key constraint to visit_definitions table
    CONSTRAINT fk_visit_forms_visit_definition_id FOREIGN KEY (visit_definition_id) REFERENCES visit_definitions(id) ON DELETE CASCADE,
    
    -- Unique constraint on visit_definition_id and form_definition_id
    CONSTRAINT uk_visit_forms_visit_form UNIQUE (visit_definition_id, form_definition_id),
    
    -- Check constraints
    CONSTRAINT chk_visit_forms_sequence CHECK (form_sequence > 0),
    CONSTRAINT chk_visit_forms_completion_window CHECK (completion_window_hours IS NULL OR completion_window_hours > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for performance optimization
CREATE INDEX idx_visit_definitions_study_id ON visit_definitions(study_id);
CREATE INDEX idx_visit_definitions_arm_id ON visit_definitions(arm_id);
CREATE INDEX idx_visit_definitions_sequence ON visit_definitions(study_id, sequence_number);
CREATE INDEX idx_visit_definitions_timepoint ON visit_definitions(study_id, timepoint);
CREATE INDEX idx_visit_definitions_type ON visit_definitions(visit_type);
CREATE INDEX idx_visit_forms_visit_definition_id ON visit_forms(visit_definition_id);
CREATE INDEX idx_visit_forms_form_definition_id ON visit_forms(form_definition_id);

-- Insert sample data for testing
-- Visit definitions for study IDs 1, 2, and 3
INSERT IGNORE INTO visit_definitions (name, description, visit_type, sequence_number, timepoint, timepoint_unit, visit_window_before, visit_window_after, is_common_visit, is_required, study_id, created_by, updated_by) VALUES 
-- Study ID 1 visits
('Screening', 'Initial screening visit to determine eligibility', 'SCREENING', 1, -14, 'DAYS', 7, 3, TRUE, TRUE, 1, 'system', 'system'),
('Baseline', 'Baseline assessments and randomization', 'BASELINE', 2, 0, 'DAYS', 1, 1, TRUE, TRUE, 1, 'system', 'system'),
('Week 4', 'Follow-up visit at 4 weeks', 'TREATMENT', 3, 28, 'DAYS', 3, 3, TRUE, TRUE, 1, 'system', 'system'),
('Week 8', 'Follow-up visit at 8 weeks', 'TREATMENT', 4, 56, 'DAYS', 3, 3, TRUE, TRUE, 1, 'system', 'system'),
('End of Study', 'Final study visit', 'END_OF_STUDY', 5, 84, 'DAYS', 7, 7, TRUE, TRUE, 1, 'system', 'system'),

-- Study ID 2 visits
('Screening', 'Initial screening visit to determine eligibility', 'SCREENING', 1, -14, 'DAYS', 7, 3, TRUE, TRUE, 2, 'system', 'system'),
('Baseline', 'Baseline assessments and randomization', 'BASELINE', 2, 0, 'DAYS', 1, 1, TRUE, TRUE, 2, 'system', 'system'),
('Week 4', 'Follow-up visit at 4 weeks', 'TREATMENT', 3, 28, 'DAYS', 3, 3, TRUE, TRUE, 2, 'system', 'system'),
('Week 8', 'Follow-up visit at 8 weeks', 'TREATMENT', 4, 56, 'DAYS', 3, 3, TRUE, TRUE, 2, 'system', 'system'),
('End of Study', 'Final study visit', 'END_OF_STUDY', 5, 84, 'DAYS', 7, 7, TRUE, TRUE, 2, 'system', 'system'),

-- Study ID 3 visits (this is what your frontend is looking for)
('Screening', 'Initial screening visit to determine eligibility', 'SCREENING', 1, -14, 'DAYS', 7, 3, TRUE, TRUE, 3, 'system', 'system'),
('Baseline', 'Baseline assessments and randomization', 'BASELINE', 2, 0, 'DAYS', 1, 1, TRUE, TRUE, 3, 'system', 'system'),
('Week 2', 'Early follow-up visit at 2 weeks', 'TREATMENT', 3, 14, 'DAYS', 2, 2, TRUE, TRUE, 3, 'system', 'system'),
('Week 4', 'Follow-up visit at 4 weeks', 'TREATMENT', 4, 28, 'DAYS', 3, 3, TRUE, TRUE, 3, 'system', 'system'),
('Week 8', 'Follow-up visit at 8 weeks', 'TREATMENT', 5, 56, 'DAYS', 3, 3, TRUE, TRUE, 3, 'system', 'system'),
('Week 12', 'Late follow-up visit at 12 weeks', 'TREATMENT', 6, 84, 'DAYS', 5, 5, TRUE, TRUE, 3, 'system', 'system'),
('End of Study', 'Final study visit and wrap-up', 'END_OF_STUDY', 7, 98, 'DAYS', 7, 7, TRUE, TRUE, 3, 'system', 'system');

-- Verification queries (uncomment to run)
/*
SELECT 'Visit Definitions' as table_name, COUNT(*) as record_count FROM visit_definitions WHERE study_id = 3;
SELECT 'Visit Forms' as table_name, COUNT(*) as record_count FROM visit_forms;

SELECT 
    vd.id, 
    vd.name, 
    vd.visit_type, 
    vd.sequence_number, 
    vd.timepoint,
    vd.timepoint_unit,
    vd.visit_window_before,
    vd.visit_window_after,
    vd.is_common_visit,
    vd.is_required
FROM visit_definitions vd
WHERE vd.study_id = 3
ORDER BY vd.sequence_number;
*/

-- End of migration script