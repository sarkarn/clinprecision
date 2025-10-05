-- =====================================================
-- Migration: Add aggregate_uuid to study_versions table
-- Version: V002
-- Date: 2025-10-05
-- Description: Adds aggregate_uuid column for DDD/Event Sourcing integration
-- =====================================================

-- Add aggregate_uuid column to study_versions table
ALTER TABLE study_versions
    ADD COLUMN aggregate_uuid VARCHAR(36) NULL COMMENT 'UUID linking to event-sourced aggregate';

-- Create unique index on aggregate_uuid for fast lookups
CREATE INDEX idx_study_versions_aggregate_uuid ON study_versions(aggregate_uuid);

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this after migration to verify:
-- SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'study_versions' AND COLUMN_NAME = 'aggregate_uuid';
