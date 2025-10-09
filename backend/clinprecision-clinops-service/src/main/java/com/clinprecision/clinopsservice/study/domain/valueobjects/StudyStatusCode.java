package com.clinprecision.clinopsservice.study.domain.valueobjects;

/**
 * Study Status Code - Value Object
 * Represents the possible states of a study in its lifecycle
 * 
 * Status Transition Rules:
 * - DRAFT → PLANNING, CANCELLED
 * - PLANNING → PROTOCOL_REVIEW, CANCELLED
 * - PROTOCOL_REVIEW → REGULATORY_SUBMISSION, PLANNING, WITHDRAWN
 * - REGULATORY_SUBMISSION → APPROVED, PROTOCOL_REVIEW, WITHDRAWN
 * - APPROVED → ACTIVE, WITHDRAWN
 * - ACTIVE → ENROLLMENT_COMPLETE, SUSPENDED, TERMINATED
 * - ENROLLMENT_COMPLETE → DATA_COLLECTION_COMPLETE, SUSPENDED, TERMINATED
 * - DATA_COLLECTION_COMPLETE → DATA_ANALYSIS, TERMINATED
 * - DATA_ANALYSIS → COMPLETED, TERMINATED
 * - SUSPENDED → ACTIVE, TERMINATED
 * - COMPLETED, TERMINATED, WITHDRAWN, CANCELLED → (Terminal states, no transitions)
 */
public enum StudyStatusCode {
    
    DRAFT("DRAFT", "Study is in initial planning phase and can be freely modified"),
    PLANNING("PLANNING", "Study design is being finalized, protocol development in progress"),
    PROTOCOL_REVIEW("PROTOCOL_REVIEW", "Protocol is under internal review and approval"),
    REGULATORY_SUBMISSION("REGULATORY_SUBMISSION", "Study has been submitted to regulatory authorities"),
    APPROVED("APPROVED", "Study has received all necessary approvals and is ready to start"),
    ACTIVE("ACTIVE", "Study is actively enrolling participants and collecting data"),
    ENROLLMENT_COMPLETE("ENROLLMENT_COMPLETE", "Patient enrollment is complete, study ongoing"),
    DATA_COLLECTION_COMPLETE("DATA_COLLECTION_COMPLETE", "All data collection activities are finished"),
    DATA_ANALYSIS("DATA_ANALYSIS", "Study data is being analyzed and reports prepared"),
    COMPLETED("COMPLETED", "Study has been successfully completed with all deliverables"),
    TERMINATED("TERMINATED", "Study was terminated before completion"),
    SUSPENDED("SUSPENDED", "Study is temporarily halted but may resume"),
    WITHDRAWN("WITHDRAWN", "Study was withdrawn before starting"),
    CANCELLED("CANCELLED", "Study was cancelled during planning phase");
    
    private final String code;
    private final String description;
    
    StudyStatusCode(String code, String description) {
        this.code = code;
        this.description = description;
    }
    
    public String getCode() {
        return code;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Convert string code to enum
     * @param code Status code string
     * @return StudyStatusCode enum
     * @throws IllegalArgumentException if code is invalid
     */
    public static StudyStatusCode fromString(String code) {
        if (code == null) {
            throw new IllegalArgumentException("Status code cannot be null");
        }
        
        for (StudyStatusCode status : StudyStatusCode.values()) {
            if (status.code.equalsIgnoreCase(code)) {
                return status;
            }
        }
        
        throw new IllegalArgumentException("Unknown status code: " + code);
    }
    
    /**
     * Check if transition to new status is valid
     * Implements state machine rules for study lifecycle
     * 
     * @param newStatus Target status
     * @return true if transition is valid, false otherwise
     */
    public boolean canTransitionTo(StudyStatusCode newStatus) {
        if (newStatus == null) {
            return false;
        }
        
        // Same status is always valid (no-op)
        if (this == newStatus) {
            return true;
        }
        
        switch (this) {
            case DRAFT:
                return newStatus == PLANNING || newStatus == CANCELLED;
                
            case PLANNING:
                return newStatus == PROTOCOL_REVIEW || newStatus == CANCELLED;
                
            case PROTOCOL_REVIEW:
                return newStatus == REGULATORY_SUBMISSION 
                    || newStatus == PLANNING 
                    || newStatus == WITHDRAWN;
                
            case REGULATORY_SUBMISSION:
                return newStatus == APPROVED 
                    || newStatus == PROTOCOL_REVIEW 
                    || newStatus == WITHDRAWN;
                
            case APPROVED:
                return newStatus == ACTIVE || newStatus == WITHDRAWN;
                
            case ACTIVE:
                return newStatus == ENROLLMENT_COMPLETE 
                    || newStatus == SUSPENDED 
                    || newStatus == TERMINATED;
                
            case ENROLLMENT_COMPLETE:
                return newStatus == DATA_COLLECTION_COMPLETE 
                    || newStatus == SUSPENDED 
                    || newStatus == TERMINATED;
                
            case DATA_COLLECTION_COMPLETE:
                return newStatus == DATA_ANALYSIS || newStatus == TERMINATED;
                
            case DATA_ANALYSIS:
                return newStatus == COMPLETED || newStatus == TERMINATED;
                
            case SUSPENDED:
                return newStatus == ACTIVE || newStatus == TERMINATED;
                
            case COMPLETED:
            case TERMINATED:
            case WITHDRAWN:
            case CANCELLED:
                // Terminal states - no further transitions allowed
                return false;
                
            default:
                return false;
        }
    }
    
    /**
     * Check if this status is a terminal state
     * @return true if terminal (no further transitions allowed)
     */
    public boolean isTerminal() {
        return this == COMPLETED 
            || this == TERMINATED 
            || this == WITHDRAWN 
            || this == CANCELLED;
    }
    
    /**
     * Check if this status allows study modifications
     * @return true if study can be edited in this status
     */
    public boolean allowsModifications() {
        return this == DRAFT 
            || this == PLANNING 
            || this == PROTOCOL_REVIEW;
    }
    
    /**
     * Check if this status requires protocol version
     * @return true if at least one protocol version must exist
     */
    public boolean requiresProtocolVersion() {
        return this == PROTOCOL_REVIEW 
            || this == REGULATORY_SUBMISSION
            || this == APPROVED 
            || this == ACTIVE 
            || this == ENROLLMENT_COMPLETE
            || this == DATA_COLLECTION_COMPLETE
            || this == DATA_ANALYSIS
            || this == SUSPENDED 
            || this == COMPLETED;
    }
    
    @Override
    public String toString() {
        return code;
    }
}



