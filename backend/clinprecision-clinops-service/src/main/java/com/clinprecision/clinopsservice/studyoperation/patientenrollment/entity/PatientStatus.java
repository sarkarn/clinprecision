package com.clinprecision.clinopsservice.patientenrollment.entity;

/**
 * Patient Status enumeration  
 * Tracks the overall status of a patient in the system
 * 
 * Valid status transitions:
 * - REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED
 * - Any status → WITHDRAWN (patient can withdraw at any time)
 * 
 * This is the single source of truth for patient status values.
 * Used by both aggregate and entity layers.
 */
public enum PatientStatus {
    REGISTERED("Registered", "Patient has been registered in the system"),
    SCREENING("Screening", "Patient is being screened for eligibility"),
    ENROLLED("Enrolled", "Patient is enrolled in one or more studies"),
    ACTIVE("Active", "Patient is actively participating in treatment"),
    COMPLETED("Completed", "Patient has completed study participation"),
    WITHDRAWN("Withdrawn", "Patient has withdrawn from participation");
    
    private final String displayName;
    private final String description;
    
    PatientStatus(String displayName, String description) {
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
     * Get status from string (case-insensitive)
     * @param status Status string
     * @return PatientStatus enum or null if invalid
     */
    public static PatientStatus fromString(String status) {
        if (status == null) return null;
        try {
            return PatientStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
    
    /**
     * Check if this is a terminal status (no further transitions)
     * @return true if terminal status
     */
    public boolean isTerminal() {
        return this == COMPLETED || this == WITHDRAWN;
    }
    
    /**
     * Check if patient is actively in a study
     * @return true if enrolled or active
     */
    public boolean isActive() {
        return this == ENROLLED || this == ACTIVE;
    }
}



