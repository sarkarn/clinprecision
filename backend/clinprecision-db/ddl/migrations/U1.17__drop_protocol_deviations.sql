-- Reverse Migration: Drop Protocol Deviation Tracking System
-- Purpose: Rollback V1.17__create_protocol_deviations.sql

DROP TABLE IF EXISTS protocol_deviation_comments;
DROP TABLE IF EXISTS protocol_deviations;
