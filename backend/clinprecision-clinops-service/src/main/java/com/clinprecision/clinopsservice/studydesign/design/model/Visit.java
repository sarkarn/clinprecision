package com.clinprecision.clinopsservice.studydesign.domain.model;

import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.VisitType;
import com.clinprecision.clinopsservice.studydesign.domain.valueobjects.VisitWindow;
import lombok.Value;

import java.util.UUID;

/**
 * Visit - Domain Model (not JPA entity)
 * 
 * Rich domain object representing a study visit with behavior.
 * Part of the aggregate's internal state.
 */
@Value
public class Visit {
    
    UUID visitId;
    String name;
    String description;
    int timepoint;           // Days from baseline (negative for screening)
    VisitWindow window;
    VisitType visitType;
    boolean isRequired;
    int sequenceNumber;
    UUID armId;              // null if visit applies to all arms
    
    private Visit(UUID visitId, String name, String description, int timepoint, 
                 VisitWindow window, VisitType visitType, boolean isRequired, 
                 int sequenceNumber, UUID armId) {
        // Validation
        if (visitId == null) {
            throw new IllegalArgumentException("Visit ID cannot be null");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Visit name is required");
        }
        if (name.length() > 255) {
            throw new IllegalArgumentException("Visit name cannot exceed 255 characters");
        }
        if (window == null) {
            throw new IllegalArgumentException("Visit window is required");
        }
        if (visitType == null) {
            throw new IllegalArgumentException("Visit type is required");
        }
        if (sequenceNumber < 1) {
            throw new IllegalArgumentException("Sequence number must be positive");
        }
        
        this.visitId = visitId;
        this.name = name.trim();
        this.description = description != null ? description.trim() : null;
        this.timepoint = timepoint;
        this.window = window;
        this.visitType = visitType;
        this.isRequired = isRequired;
        this.sequenceNumber = sequenceNumber;
        this.armId = armId;
    }
    
    /**
     * Create new visit
     */
    public static Visit create(String name, String description, int timepoint, 
                              VisitWindow window, VisitType visitType, boolean isRequired, 
                              int sequenceNumber, UUID armId) {
        return new Visit(UUID.randomUUID(), name, description, timepoint, window, 
                        visitType, isRequired, sequenceNumber, armId);
    }
    
    /**
     * Reconstruct visit from events
     */
    public static Visit reconstruct(UUID visitId, String name, String description, 
                                   int timepoint, VisitWindow window, VisitType visitType, 
                                   boolean isRequired, int sequenceNumber, UUID armId) {
        return new Visit(visitId, name, description, timepoint, window, visitType, 
                        isRequired, sequenceNumber, armId);
    }
    
    /**
     * Update visit details
     */
    public Visit withUpdatedDetails(String name, String description, int timepoint, 
                                    VisitWindow window, VisitType visitType, boolean isRequired) {
        return new Visit(this.visitId, name, description, timepoint, window, 
                        visitType != null ? visitType : this.visitType, isRequired, this.sequenceNumber, this.armId);
    }
    
    /**
     * Change sequence number
     */
    public Visit withSequenceNumber(int newSequence) {
        return new Visit(this.visitId, this.name, this.description, this.timepoint, 
                        this.window, this.visitType, this.isRequired, newSequence, this.armId);
    }
    
    /**
     * Business rule: Check if visit is for specific arm
     */
    public boolean isArmSpecific() {
        return armId != null;
    }
    
    /**
     * Business rule: Check if visit applies to all arms
     */
    public boolean appliesToAllArms() {
        return armId == null;
    }
    
    /**
     * Business rule: Check if visit is in screening period
     */
    public boolean isScreening() {
        return timepoint < 0;
    }
    
    /**
     * Business rule: Check if visit is baseline
     */
    public boolean isBaseline() {
        return timepoint == 0;
    }
    
    /**
     * Business rule: Check if visit is post-baseline
     */
    public boolean isPostBaseline() {
        return timepoint > 0;
    }
    
    /**
     * Business rule: Check if visit has flexible window
     */
    public boolean hasFlexibleWindow() {
        return window.isFlexible();
    }
    
    /**
     * Business rule: Check if visit is mandatory
     */
    public boolean isMandatory() {
        return isRequired || visitType.isMandatory();
    }
    
    /**
     * Business rule: Check if visit is scheduled
     */
    public boolean isScheduled() {
        return visitType.isScheduled();
    }
    
    /**
     * Get earliest acceptable visit day
     */
    public int getEarliestDay() {
        return timepoint - window.getWindowBefore();
    }
    
    /**
     * Get latest acceptable visit day
     */
    public int getLatestDay() {
        return timepoint + window.getWindowAfter();
    }
    
    /**
     * Check if given day falls within visit window
     */
    public boolean isDayInWindow(int day) {
        return day >= getEarliestDay() && day <= getLatestDay();
    }
}
