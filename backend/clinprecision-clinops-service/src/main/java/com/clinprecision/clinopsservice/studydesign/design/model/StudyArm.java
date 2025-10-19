package com.clinprecision.clinopsservice.studydesign.domain.model;

import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.ArmType;
import lombok.Value;

import java.util.UUID;

/**
 * StudyArm - Domain Model (not JPA entity)
 * 
 * Rich domain object representing a study arm with behavior.
 * This is part of the aggregate's internal state, not persisted directly.
 */
@Value
public class StudyArm {
    
    UUID armId;
    String name;
    String description;
    ArmType type;
    int sequenceNumber;
    int plannedSubjects;
    
    private StudyArm(UUID armId, String name, String description, ArmType type, 
                     int sequenceNumber, int plannedSubjects) {
        // Validation
        if (armId == null) {
            throw new IllegalArgumentException("Arm ID cannot be null");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Arm name is required");
        }
        if (name.length() > 255) {
            throw new IllegalArgumentException("Arm name cannot exceed 255 characters");
        }
        if (type == null) {
            throw new IllegalArgumentException("Arm type is required");
        }
        if (sequenceNumber < 1) {
            throw new IllegalArgumentException("Sequence number must be positive");
        }
        if (plannedSubjects < 0) {
            throw new IllegalArgumentException("Planned subjects cannot be negative");
        }
        
        this.armId = armId;
        this.name = name.trim();
        this.description = description != null ? description.trim() : null;
        this.type = type;
        this.sequenceNumber = sequenceNumber;
        this.plannedSubjects = plannedSubjects;
    }
    
    /**
     * Create new study arm
     */
    public static StudyArm create(String name, String description, ArmType type, 
                                  int sequenceNumber, int plannedSubjects) {
        return new StudyArm(UUID.randomUUID(), name, description, type, 
                           sequenceNumber, plannedSubjects);
    }
    
    /**
     * Reconstruct study arm from events (with known ID)
     */
    public static StudyArm reconstruct(UUID armId, String name, String description, 
                                      ArmType type, int sequenceNumber, int plannedSubjects) {
        return new StudyArm(armId, name, description, type, sequenceNumber, plannedSubjects);
    }
    
    /**
     * Update arm details
     */
    public StudyArm withUpdatedDetails(String name, String description, int plannedSubjects) {
        return new StudyArm(this.armId, name, description, this.type, 
                           this.sequenceNumber, plannedSubjects);
    }
    
    /**
     * Change sequence number
     */
    public StudyArm withSequenceNumber(int newSequence) {
        return new StudyArm(this.armId, this.name, this.description, this.type, 
                           newSequence, this.plannedSubjects);
    }
    
    /**
     * Business rule: Check if arm has subjects planned
     */
    public boolean hasPlannedSubjects() {
        return plannedSubjects > 0;
    }
    
    /**
     * Business rule: Check if arm requires intervention
     */
    public boolean requiresIntervention() {
        return type.requiresIntervention();
    }
    
    /**
     * Business rule: Check if arm is control
     */
    public boolean isControl() {
        return type.isControl();
    }
}
