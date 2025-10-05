package com.clinprecision.clinopsservice.document.valueobject;

/**
 * Document Status - Value Object representing document lifecycle states
 * 
 * Business Rules:
 * 1. DRAFT → CURRENT (via approval)
 * 2. CURRENT → SUPERSEDED (when new version approved)
 * 3. Any state → ARCHIVED (permanent archival)
 * 4. SUPERSEDED and ARCHIVED are terminal states
 * 
 * Regulatory Compliance:
 * - All status transitions are audited via events
 * - Status changes require authorization
 * - CURRENT documents must have approval signature
 */
public enum DocumentStatus {
    
    /**
     * DRAFT - Document uploaded but not yet approved
     * - Can be edited/deleted
     * - Not available for regulatory use
     * - Requires approval to become CURRENT
     */
    DRAFT("Draft", false, false),
    
    /**
     * CURRENT - Approved and active document
     * - Cannot be edited (immutable)
     * - Used in clinical operations
     * - Can be superseded by new version
     * - Requires e-signature for critical documents
     */
    CURRENT("Current", true, true),
    
    /**
     * SUPERSEDED - Replaced by newer version
     * - Cannot be edited
     * - Kept for historical/audit purposes
     * - Terminal state for this version
     */
    SUPERSEDED("Superseded", false, true),
    
    /**
     * ARCHIVED - Permanently archived
     * - Cannot be edited or reactivated
     * - Retained per regulatory requirements
     * - Terminal state
     */
    ARCHIVED("Archived", false, true);
    
    private final String displayName;
    private final boolean isActive;
    private final boolean isImmutable;
    
    DocumentStatus(String displayName, boolean isActive, boolean isImmutable) {
        this.displayName = displayName;
        this.isActive = isActive;
        this.isImmutable = isImmutable;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public boolean isImmutable() {
        return isImmutable;
    }
    
    public boolean isDraft() {
        return this == DRAFT;
    }
    
    public boolean isCurrent() {
        return this == CURRENT;
    }
    
    public boolean isSuperseded() {
        return this == SUPERSEDED;
    }
    
    public boolean isArchived() {
        return this == ARCHIVED;
    }
    
    /**
     * Check if transition to new status is allowed
     * 
     * @param newStatus Target status
     * @return true if transition is valid
     */
    public boolean canTransitionTo(DocumentStatus newStatus) {
        if (this == newStatus) {
            return false; // No-op transition
        }
        
        switch (this) {
            case DRAFT:
                // DRAFT can become CURRENT or ARCHIVED
                return newStatus == CURRENT || newStatus == ARCHIVED;
                
            case CURRENT:
                // CURRENT can become SUPERSEDED or ARCHIVED
                return newStatus == SUPERSEDED || newStatus == ARCHIVED;
                
            case SUPERSEDED:
                // SUPERSEDED can only be ARCHIVED
                return newStatus == ARCHIVED;
                
            case ARCHIVED:
                // ARCHIVED is terminal - no transitions allowed
                return false;
                
            default:
                return false;
        }
    }
    
    /**
     * Validate transition or throw exception
     * 
     * @param newStatus Target status
     * @throws IllegalStateException if transition not allowed
     */
    public void validateTransition(DocumentStatus newStatus) {
        if (!canTransitionTo(newStatus)) {
            throw new IllegalStateException(
                String.format("Cannot transition document status from %s to %s", 
                    this.displayName, newStatus.getDisplayName())
            );
        }
    }
}



