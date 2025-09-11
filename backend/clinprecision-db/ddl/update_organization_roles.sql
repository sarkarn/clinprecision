-- Add new organization roles to support frontend requirements
-- This script updates the organization_studies table to include new roles

USE clinprecisiondb;

-- Update the ENUM column to include new roles
ALTER TABLE organization_studies 
MODIFY COLUMN role ENUM('sponsor', 'cro', 'site', 'vendor', 'laboratory', 'regulatory', 'statistics', 'safety') 
NOT NULL COMMENT 'Role of the organization in the study';

-- Verify the change
DESCRIBE organization_studies;
