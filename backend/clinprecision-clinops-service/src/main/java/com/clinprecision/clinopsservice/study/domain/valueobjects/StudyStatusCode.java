package com.clinprecision.clinopsservice.study.domain.valueobjects;

/**
 * Study Status Code - Value Object
 * Represents the possible states of a study in its lifecycle
 * 
 * Status Transition Rules:
 * - PLANNING → PROTOCOL_DEVELOPMENT, WITHDRAWN
 * - PROTOCOL_DEVELOPMENT → UNDER_REVIEW, WITHDRAWN
 * - UNDER_REVIEW → APPROVED, PROTOCOL_DEVELOPMENT, WITHDRAWN
 * - APPROVED → ACTIVE, WITHDRAWN
 * - ACTIVE → SUSPENDED, COMPLETED, TERMINATED
 * - SUSPENDED → ACTIVE, TERMINATED
 * - COMPLETED, TERMINATED, WITHDRAWN → (Terminal states, no transitions)
 */
public enum StudyStatusCode {
    
    PLANNING("PLANNING", "Study is in planning phase"),
    PROTOCOL_DEVELOPMENT("PROTOCOL_DEVELOPMENT", "Protocol is being developed"),
    UNDER_REVIEW("UNDER_REVIEW", "Protocol is under review"),
    APPROVED("APPROVED", "Protocol has been approved"),
    ACTIVE("ACTIVE", "Study is actively recruiting/running"),
    SUSPENDED("SUSPENDED", "Study is temporarily suspended"),
    COMPLETED("COMPLETED", "Study has been completed"),
    TERMINATED("TERMINATED", "Study has been terminated"),
    WITHDRAWN("WITHDRAWN", "Study has been withdrawn");
    
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
            case PLANNING:
                return newStatus == PROTOCOL_DEVELOPMENT || newStatus == WITHDRAWN;
                
            case PROTOCOL_DEVELOPMENT:
                return newStatus == UNDER_REVIEW || newStatus == WITHDRAWN;
                
            case UNDER_REVIEW:
                return newStatus == APPROVED 
                    || newStatus == PROTOCOL_DEVELOPMENT 
                    || newStatus == WITHDRAWN;
                
            case APPROVED:
                return newStatus == ACTIVE || newStatus == WITHDRAWN;
                
            case ACTIVE:
                return newStatus == SUSPENDED 
                    || newStatus == COMPLETED 
                    || newStatus == TERMINATED;
                
            case SUSPENDED:
                return newStatus == ACTIVE || newStatus == TERMINATED;
                
            case COMPLETED:
            case TERMINATED:
            case WITHDRAWN:
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
        return this == COMPLETED || this == TERMINATED || this == WITHDRAWN;
    }
    
    /**
     * Check if this status allows study modifications
     * @return true if study can be edited in this status
     */
    public boolean allowsModifications() {
        return this == PLANNING 
            || this == PROTOCOL_DEVELOPMENT 
            || this == UNDER_REVIEW;
    }
    
    /**
     * Check if this status requires protocol version
     * @return true if at least one protocol version must exist
     */
    public boolean requiresProtocolVersion() {
        return this == UNDER_REVIEW 
            || this == APPROVED 
            || this == ACTIVE 
            || this == SUSPENDED 
            || this == COMPLETED;
    }
    
    @Override
    public String toString() {
        return code;
    }
}
