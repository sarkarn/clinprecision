package com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects;

import java.util.Arrays;
import java.util.List;

/**
 * StudyStatus Value Object - Rich domain model with behavior
 * 
 * This enum represents the lifecycle status of a clinical study.
 * Unlike the database entity, this contains business rules about
 * valid status transitions.
 * 
 * Following DDD principles: Value Objects are immutable and contain behavior.
 */
public enum StudyStatus {
    PLANNING("Planning", "Study is in planning phase", 1),
    REGULATORY_SUBMISSION("Regulatory Submission", "Study submitted to regulatory authorities", 2),
    IRB_REVIEW("IRB Review", "Study under IRB/Ethics Committee review", 3),
    APPROVED("Approved", "Study approved by regulatory authorities", 4),
    ACTIVE("Active", "Study is actively enrolling and treating patients", 5),
    SUSPENDED("Suspended", "Study temporarily suspended", 6),
    COMPLETED("Completed", "Study has completed enrollment and follow-up", 7),
    TERMINATED("Terminated", "Study terminated early", 8),
    WITHDRAWN("Withdrawn", "Study withdrawn before approval", 9);

    private final String displayName;
    private final String description;
    private final int sortOrder;

    StudyStatus(String displayName, String description, int sortOrder) {
        this.displayName = displayName;
        this.description = description;
        this.sortOrder = sortOrder;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    /**
     * Business Rule: Determine if transition to another status is allowed
     * 
     * This encapsulates the business logic that was previously split between
     * Java services and database triggers.
     */
    public boolean canTransitionTo(StudyStatus newStatus) {
        if (this == newStatus) {
            return false; // No transition to same status
        }

        return switch (this) {
            case PLANNING -> newStatus == REGULATORY_SUBMISSION || 
                           newStatus == IRB_REVIEW ||
                           newStatus == WITHDRAWN;
            
            case REGULATORY_SUBMISSION -> newStatus == PLANNING || 
                                         newStatus == APPROVED ||
                                         newStatus == WITHDRAWN;
            
            case IRB_REVIEW -> newStatus == PLANNING || 
                             newStatus == APPROVED ||
                             newStatus == WITHDRAWN;
            
            case APPROVED -> newStatus == ACTIVE ||
                           newStatus == WITHDRAWN;
            
            case ACTIVE -> newStatus == SUSPENDED ||
                         newStatus == COMPLETED ||
                         newStatus == TERMINATED;
            
            case SUSPENDED -> newStatus == ACTIVE ||
                            newStatus == TERMINATED;
            
            case COMPLETED, TERMINATED, WITHDRAWN -> false; // Terminal states
        };
    }

    /**
     * Get list of valid next statuses from current status
     */
    public List<StudyStatus> getValidNextStatuses() {
        return Arrays.stream(StudyStatus.values())
            .filter(this::canTransitionTo)
            .toList();
    }

    /**
     * Check if this is a terminal status (no further transitions allowed)
     */
    public boolean isTerminal() {
        return this == COMPLETED || this == TERMINATED || this == WITHDRAWN;
    }

    /**
     * Check if study is in an active/operational state
     */
    public boolean isOperational() {
        return this == ACTIVE || this == SUSPENDED;
    }

    /**
     * Check if study is in pre-approval phase
     */
    public boolean isPreApproval() {
        return this == PLANNING || this == REGULATORY_SUBMISSION || this == IRB_REVIEW;
    }

    /**
     * Map from legacy integer status ID (from database) to enum
     */
    public static StudyStatus fromLegacyId(Integer statusId) {
        if (statusId == null) {
            return PLANNING; // Default
        }
        
        return switch (statusId) {
            case 1 -> PLANNING;
            case 2 -> REGULATORY_SUBMISSION;
            case 3 -> IRB_REVIEW;
            case 4 -> APPROVED;
            case 5 -> ACTIVE;
            case 6 -> SUSPENDED;
            case 7 -> COMPLETED;
            case 8 -> TERMINATED;
            case 9 -> WITHDRAWN;
            default -> PLANNING;
        };
    }

    /**
     * Get status ID for database mapping
     */
    public int toStatusId() {
        return this.sortOrder;
    }
    
    /**
     * Get status ID (alias for toStatusId for consistency)
     */
    public int getStatusId() {
        return this.sortOrder;
    }
}
