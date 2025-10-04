package com.clinprecision.clinopsservice.entity;

/**
 * Enumeration for study status values
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
    
    /**
     * Convert enum to database string value (lowercase)
     */
    public String toDbValue() {
        return this.name().toLowerCase();
    }
}
