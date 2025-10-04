package com.clinprecision.clinopsservice.studydatabase.entity;

/**
 * Study Database Build Status Enumeration
 * Represents the lifecycle states of a study database build process
 * 
 * Aligned with StudyDatabaseBuildAggregate status enum for consistency
 */
public enum StudyDatabaseBuildStatus {
    IN_PROGRESS,    // Build is currently running
    COMPLETED,      // Build completed successfully
    FAILED,         // Build failed with errors
    CANCELLED       // Build was cancelled by user
}
