package com.clinprecision.clinopsservice.studydesign.design.model;

/**
 * Visit Type - Value Object
 * 
 * Represents the type/category of study visit.
 * Follows clinical trial visit classification standards.
 */
public enum VisitType {
    
    /**
     * Screening visit before enrollment
     */
    SCREENING("Screening", "Pre-enrollment screening visit"),
    
    /**
     * Baseline visit at enrollment
     */
    BASELINE("Baseline", "Enrollment/baseline visit"),
    
    /**
     * Regular treatment visit
     */
    TREATMENT("Treatment", "On-treatment visit"),
    
    /**
     * Follow-up visit after treatment
     */
    FOLLOW_UP("Follow-up", "Post-treatment follow-up"),
    
    /**
     * Unscheduled or ad-hoc visit
     */
    UNSCHEDULED("Unscheduled", "Unscheduled/ad-hoc visit"),
    
    /**
     * Early termination visit
     */
    EARLY_TERMINATION("Early Termination", "Early study termination visit"),
    
    /**
     * End of study visit
     */
    END_OF_STUDY("End of Study", "Final study visit");
    
    private final String displayName;
    private final String description;
    
    VisitType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Check if visit is mandatory
     */
    public boolean isMandatory() {
        return this == SCREENING || 
               this == BASELINE || 
               this == END_OF_STUDY;
    }
    
    /**
     * Check if visit is scheduled
     */
    public boolean isScheduled() {
        return this != UNSCHEDULED && 
               this != EARLY_TERMINATION;
    }
    
    /**
     * Get from legacy string value
     */
    public static VisitType fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return TREATMENT;
        }
        
        String normalized = value.toUpperCase()
            .replace(" ", "_")
            .replace("-", "_");
        
        try {
            return VisitType.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            return TREATMENT;
        }
    }
}
