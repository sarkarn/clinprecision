package com.clinprecision.clinopsservice.studydesign.domain.valueobjects;

import lombok.Value;

import java.util.UUID;

/**
 * StudyDesign Identifier - Value Object
 * 
 * Represents the unique identifier for a Study Design aggregate.
 * This is the aggregate root ID for study design (arms, visits, forms).
 */
@Value
public class StudyDesignIdentifier {
    
    UUID id;
    
    private StudyDesignIdentifier(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("StudyDesign ID cannot be null");
        }
        this.id = id;
    }
    
    /**
     * Create a new unique identifier
     */
    public static StudyDesignIdentifier newIdentifier() {
        return new StudyDesignIdentifier(UUID.randomUUID());
    }
    
    /**
     * Create identifier from existing UUID
     */
    public static StudyDesignIdentifier fromUuid(UUID id) {
        return new StudyDesignIdentifier(id);
    }
    
    /**
     * Create identifier from string
     */
    public static StudyDesignIdentifier fromString(String id) {
        try {
            return new StudyDesignIdentifier(UUID.fromString(id));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid StudyDesign ID format: " + id, e);
        }
    }
    
    @Override
    public String toString() {
        return id.toString();
    }
}
