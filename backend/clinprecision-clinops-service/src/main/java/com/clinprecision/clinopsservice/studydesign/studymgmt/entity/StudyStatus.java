package com.clinprecision.clinopsservice.studydesign.studymgmt.entity;

/**
 * Enumeration for study status values
 * All values stored as UPPERCASE for consistency across the system
 */
public enum StudyStatus {
    DRAFT,
    ACTIVE,
    APPROVED,
    COMPLETED,
    TERMINATED;
    
    /**
     * Convert database string value to enum (case insensitive)
     */
    public static StudyStatus fromString(String value) {
        if (value == null) return null;
        return StudyStatus.valueOf(value.toUpperCase());
    }
}



