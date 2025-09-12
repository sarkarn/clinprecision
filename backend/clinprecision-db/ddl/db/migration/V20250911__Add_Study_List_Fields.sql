-- Migration to add fields for enhanced study list view
-- Author: System
-- Date: 2025-09-11

-- Add new columns to studies table for better list view support
ALTER TABLE studies 
ADD COLUMN indication VARCHAR(500),
ADD COLUMN study_type VARCHAR(50) DEFAULT 'INTERVENTIONAL',
ADD COLUMN principal_investigator VARCHAR(255),
ADD COLUMN sites INTEGER DEFAULT 0,
ADD COLUMN planned_subjects INTEGER DEFAULT 0,
ADD COLUMN enrolled_subjects INTEGER DEFAULT 0,
ADD COLUMN target_enrollment INTEGER DEFAULT 0,
ADD COLUMN primary_objective TEXT,
ADD COLUMN amendments INTEGER DEFAULT 0,
ADD COLUMN modified_by BIGINT;

-- Update existing records with default values where appropriate
UPDATE studies 
SET study_type = 'INTERVENTIONAL' WHERE study_type IS NULL;

UPDATE studies 
SET sites = 0 WHERE sites IS NULL;

UPDATE studies 
SET planned_subjects = 0 WHERE planned_subjects IS NULL;

UPDATE studies 
SET enrolled_subjects = 0 WHERE enrolled_subjects IS NULL;

UPDATE studies 
SET target_enrollment = 0 WHERE target_enrollment IS NULL;

UPDATE studies 
SET amendments = 0 WHERE amendments IS NULL;

-- Add indexes for better query performance on list views
CREATE INDEX idx_studies_status ON studies(status);
CREATE INDEX idx_studies_phase ON studies(phase);
CREATE INDEX idx_studies_sponsor ON studies(sponsor);
CREATE INDEX idx_studies_indication ON studies(indication);
CREATE INDEX idx_studies_created_at ON studies(created_at);
CREATE INDEX idx_studies_updated_at ON studies(updated_at);

-- Add comments for documentation
COMMENT ON COLUMN studies.indication IS 'Medical indication or condition being studied';
COMMENT ON COLUMN studies.study_type IS 'Type of study: INTERVENTIONAL, OBSERVATIONAL, etc.';
COMMENT ON COLUMN studies.principal_investigator IS 'Name of the principal investigator';
COMMENT ON COLUMN studies.sites IS 'Number of study sites';
COMMENT ON COLUMN studies.planned_subjects IS 'Number of planned subjects for enrollment';
COMMENT ON COLUMN studies.enrolled_subjects IS 'Number of currently enrolled subjects';
COMMENT ON COLUMN studies.target_enrollment IS 'Target enrollment number';
COMMENT ON COLUMN studies.primary_objective IS 'Primary objective of the study';
COMMENT ON COLUMN studies.amendments IS 'Number of amendments made to the study';
COMMENT ON COLUMN studies.modified_by IS 'User who last modified the study';