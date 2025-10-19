package com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects;

import java.util.Arrays;
import java.util.List;

/**
 * VersionStatus Value Object - Rich domain model with behavior
 * 
 * Represents the lifecycle status of a protocol version.
 * Contains business rules about valid status transitions.
 * 
 * Following DDD principles: Value Objects are immutable and contain behavior.
 */
public enum VersionStatus {
    DRAFT("Draft", "In development", 1),
    UNDER_REVIEW("Under Review", "Under internal review", 2),
    AMENDMENT_REVIEW("Amendment Review", "Protocol amendment under review", 3),
    SUBMITTED("Submitted", "Submitted to regulatory authority", 4),
    APPROVED("Approved", "Approved by regulatory authority", 5),
    ACTIVE("Active", "Currently active version", 6),
    SUPERSEDED("Superseded", "Replaced by newer version", 7),
    WITHDRAWN("Withdrawn", "Withdrawn/cancelled", 8);

    private final String label;
    private final String description;
    private final int sortOrder;

    VersionStatus(String label, String description, int sortOrder) {
        this.label = label;
        this.description = description;
        this.sortOrder = sortOrder;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    public int getSortOrder() {
        return sortOrder;
    }

    public int getStatusId() {
        return sortOrder;
    }

    /**
     * Business Rule: Determine if transition to another status is allowed
     * 
     * This replaces database trigger logic for status validation.
     */
    public boolean canTransitionTo(VersionStatus newStatus) {
        if (this == newStatus) {
            return false; // No transition to same status
        }

        return switch (this) {
            case DRAFT -> newStatus == UNDER_REVIEW || 
                         newStatus == SUBMITTED ||
                         newStatus == WITHDRAWN;
            
            case UNDER_REVIEW -> newStatus == DRAFT ||
                                newStatus == AMENDMENT_REVIEW ||
                                newStatus == SUBMITTED ||
                                newStatus == APPROVED ||
                                newStatus == WITHDRAWN;
            
            case AMENDMENT_REVIEW -> newStatus == UNDER_REVIEW ||
                                    newStatus == APPROVED ||
                                    newStatus == WITHDRAWN;
            
            case SUBMITTED -> newStatus == APPROVED ||
                             newStatus == UNDER_REVIEW ||
                             newStatus == WITHDRAWN;
            
            case APPROVED -> newStatus == ACTIVE ||
                            newStatus == WITHDRAWN;
            
            case ACTIVE -> newStatus == SUPERSEDED ||
                          newStatus == WITHDRAWN;
            
            case SUPERSEDED, WITHDRAWN -> false; // Terminal states
        };
    }

    /**
     * Get valid next statuses from current status
     */
    public List<VersionStatus> getValidNextStatuses() {
        return Arrays.stream(values())
            .filter(this::canTransitionTo)
            .toList();
    }

    /**
     * Check if status is terminal (no further transitions)
     */
    public boolean isTerminal() {
        return this == SUPERSEDED || this == WITHDRAWN;
    }

    /**
     * Check if version is in review state
     */
    public boolean isInReview() {
        return this == UNDER_REVIEW || this == AMENDMENT_REVIEW;
    }

    /**
     * Check if version is editable
     */
    public boolean isEditable() {
        return this == DRAFT || this == UNDER_REVIEW;
    }

    /**
     * Check if version can be submitted
     */
    public boolean canBeSubmitted() {
        return this == DRAFT || this == UNDER_REVIEW;
    }

    /**
     * Check if version is pre-approval
     */
    public boolean isPreApproval() {
        return this == DRAFT || this == UNDER_REVIEW || 
               this == AMENDMENT_REVIEW || this == SUBMITTED;
    }

    /**
     * Check if version is post-approval
     */
    public boolean isPostApproval() {
        return this == APPROVED || this == ACTIVE || this == SUPERSEDED;
    }
}



