package com.clinprecision.clinopsservice.studyoperation.visit.entity;

/**
 * Visit Status enumeration
 * Tracks the status of visit instances in clinical trials
 * 
 * Valid status transitions:
 * - SCHEDULED → IN_PROGRESS → COMPLETED
 * - SCHEDULED → MISSED (if visit window closes without completion)
 * - SCHEDULED → CANCELLED (if visit is cancelled before occurring)
 * - Any status → RESCHEDULED (if visit needs to be rescheduled)
 * 
 * This is the single source of truth for visit status values.
 * Used by both aggregate and entity layers.
 * 
 * @author ClinPrecision Development Team
 * @version 1.0
 * @since October 2025
 */
public enum VisitStatus {
    SCHEDULED("Scheduled", "Visit is scheduled and awaiting patient arrival"),
    IN_PROGRESS("In Progress", "Visit is currently in progress"),
    COMPLETED("Completed", "Visit has been completed and all data captured"),
    MISSED("Missed", "Visit was not completed within protocol window"),
    CANCELLED("Cancelled", "Visit has been cancelled"),
    RESCHEDULED("Rescheduled", "Visit has been rescheduled to a different date");
    
    private final String displayName;
    private final String description;
    
    VisitStatus(String displayName, String description) {
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
     * Supports both enum names and display names
     * 
     * @param status Status string
     * @return VisitStatus enum or null if invalid
     */
    public static VisitStatus fromString(String status) {
        if (status == null) return null;
        
        // Try direct enum match first (case-insensitive)
        try {
            return VisitStatus.valueOf(status.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            // Try matching by display name
            String normalized = status.trim();
            for (VisitStatus vs : VisitStatus.values()) {
                if (vs.getDisplayName().equalsIgnoreCase(normalized)) {
                    return vs;
                }
            }
            return null;
        }
    }
    
    /**
     * Check if this is a terminal status (no further transitions expected)
     * @return true if terminal status
     */
    public boolean isTerminal() {
        return this == COMPLETED || this == MISSED || this == CANCELLED;
    }
    
    /**
     * Check if visit is in an active state (can be modified)
     * @return true if visit is scheduled or in progress
     */
    public boolean isActive() {
        return this == SCHEDULED || this == IN_PROGRESS || this == RESCHEDULED;
    }
    
    /**
     * Check if visit requires data entry
     * @return true if visit is in progress or completed
     */
    public boolean requiresDataEntry() {
        return this == IN_PROGRESS || this == COMPLETED;
    }
    
    /**
     * Check if status transition is valid
     * 
     * @param newStatus Target status
     * @return true if transition is allowed
     */
    public boolean canTransitionTo(VisitStatus newStatus) {
        if (newStatus == null) return false;
        if (this == newStatus) return true; // Same status is allowed (idempotent)
        
        return switch (this) {
            case SCHEDULED -> newStatus == IN_PROGRESS || 
                            newStatus == COMPLETED || 
                            newStatus == MISSED || 
                            newStatus == CANCELLED ||
                            newStatus == RESCHEDULED;
            case IN_PROGRESS -> newStatus == COMPLETED || 
                              newStatus == CANCELLED;
            case RESCHEDULED -> newStatus == SCHEDULED ||
                              newStatus == IN_PROGRESS ||
                              newStatus == COMPLETED ||
                              newStatus == CANCELLED;
            case COMPLETED, MISSED, CANCELLED -> false; // Terminal states
        };
    }
    
    /**
     * Get all valid transition targets from current status
     * 
     * @return Array of valid next statuses
     */
    public VisitStatus[] getValidTransitions() {
        return switch (this) {
            case SCHEDULED -> new VisitStatus[]{IN_PROGRESS, COMPLETED, MISSED, CANCELLED, RESCHEDULED};
            case IN_PROGRESS -> new VisitStatus[]{COMPLETED, CANCELLED};
            case RESCHEDULED -> new VisitStatus[]{SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED};
            case COMPLETED, MISSED, CANCELLED -> new VisitStatus[]{}; // No transitions from terminal states
        };
    }
}
