package com.clinprecision.clinopsservice.studydesign.domain.valueobjects;

import java.util.Objects;
import java.util.UUID;

/**
 * StudyIdentifier Value Object
 * 
 * Represents the unique identifier for a study aggregate.
 * Following DDD principles: Value Objects are immutable and define equality by value.
 */
public class StudyIdentifier {
    
    private final UUID value;

    private StudyIdentifier(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("Study identifier cannot be null");
        }
        this.value = value;
    }

    /**
     * Create new unique study identifier
     */
    public static StudyIdentifier newIdentifier() {
        return new StudyIdentifier(UUID.randomUUID());
    }

    /**
     * Create from existing UUID
     */
    public static StudyIdentifier fromUuid(UUID uuid) {
        return new StudyIdentifier(uuid);
    }

    /**
     * Create from string representation
     */
    public static StudyIdentifier fromString(String uuidString) {
        if (uuidString == null || uuidString.trim().isEmpty()) {
            throw new IllegalArgumentException("Study identifier string cannot be null or empty");
        }
        try {
            return new StudyIdentifier(UUID.fromString(uuidString));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid study identifier format: " + uuidString, e);
        }
    }

    public UUID getValue() {
        return value;
    }

    public String asString() {
        return value.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StudyIdentifier that = (StudyIdentifier) o;
        return Objects.equals(value, that.value);
    }

    @Override
    public int hashCode() {
        return Objects.hash(value);
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
