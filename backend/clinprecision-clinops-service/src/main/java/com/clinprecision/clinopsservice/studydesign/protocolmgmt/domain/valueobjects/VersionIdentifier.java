package com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects;

import java.util.Objects;
import java.util.UUID;

/**
 * VersionIdentifier Value Object
 * 
 * Unique identifier for protocol version aggregates.
 * Following DDD principles: Value Objects are immutable.
 */
public class VersionIdentifier {
    
    private final UUID value;

    private VersionIdentifier(UUID value) {
        if (value == null) {
            throw new IllegalArgumentException("Version identifier cannot be null");
        }
        this.value = value;
    }

    /**
     * Create new version identifier
     */
    public static VersionIdentifier newIdentifier() {
        return new VersionIdentifier(UUID.randomUUID());
    }

    /**
     * Create version identifier from UUID
     */
    public static VersionIdentifier fromUuid(UUID uuid) {
        return new VersionIdentifier(uuid);
    }

    /**
     * Create version identifier from string
     */
    public static VersionIdentifier fromString(String uuidString) {
        try {
            return new VersionIdentifier(UUID.fromString(uuidString));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid version identifier format: " + uuidString);
        }
    }

    public UUID getValue() {
        return value;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        VersionIdentifier that = (VersionIdentifier) o;
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



