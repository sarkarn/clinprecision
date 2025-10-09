package com.clinprecision.clinopsservice.studydesign.domain.valueobjects;

import java.util.Objects;

/**
 * ProtocolNumber Value Object
 * 
 * Represents a clinical study protocol number with validation rules.
 * Following DDD principles: Value Objects encapsulate business rules.
 */
public class ProtocolNumber {
    
    private final String value;

    private ProtocolNumber(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Protocol number cannot be null or empty");
        }
        
        // Business rule: Protocol number format validation
        String normalized = value.trim();
        if (normalized.length() > 50) {
            throw new IllegalArgumentException("Protocol number cannot exceed 50 characters");
        }
        
        this.value = normalized;
    }

    /**
     * Create protocol number from string
     */
    public static ProtocolNumber of(String value) {
        return new ProtocolNumber(value);
    }

    public String getValue() {
        return value;
    }

    /**
     * Check if this protocol number matches a pattern (e.g., "STUDY-2024-001")
     */
    public boolean matchesPattern(String pattern) {
        return value.matches(pattern);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ProtocolNumber that = (ProtocolNumber) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return value;
    }
}
