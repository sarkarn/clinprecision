package com.clinprecision.clinopsservice.protocolversion.domain.valueobjects;

import java.util.Objects;
import java.util.regex.Pattern;

/**
 * VersionNumber Value Object
 * 
 * Represents a protocol version number with validation rules.
 * Following DDD principles: Value Objects encapsulate business rules.
 */
public class VersionNumber {
    
    private final String value;
    private static final Pattern VERSION_PATTERN = Pattern.compile("^v?\\d+(\\.\\d+)*$");

    private VersionNumber(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Version number cannot be null or empty");
        }
        
        String normalized = value.trim();
        
        // Business rule: Version number format validation
        if (normalized.length() > 20) {
            throw new IllegalArgumentException("Version number cannot exceed 20 characters");
        }
        
        // Business rule: Must follow semantic versioning pattern (e.g., "1.0", "v2.1", "1.0.0")
        if (!VERSION_PATTERN.matcher(normalized).matches()) {
            throw new IllegalArgumentException(
                "Version number must follow semantic versioning pattern (e.g., '1.0', 'v2.1', '1.0.0')");
        }
        
        this.value = normalized;
    }

    /**
     * Create version number from string
     */
    public static VersionNumber of(String value) {
        return new VersionNumber(value);
    }

    /**
     * Create initial version number
     */
    public static VersionNumber initial() {
        return new VersionNumber("1.0");
    }

    public String getValue() {
        return value;
    }

    /**
     * Compare version numbers
     */
    public int compareTo(VersionNumber other) {
        // Simple lexicographic comparison for now
        // TODO: Implement proper semantic versioning comparison if needed
        return this.value.compareTo(other.value);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        VersionNumber that = (VersionNumber) o;
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
