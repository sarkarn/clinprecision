package com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects;

/**
 * AmendmentType Value Object
 * 
 * Represents the type of protocol amendment following FDA guidelines.
 * Following DDD principles: Value Objects encapsulate business rules.
 */
public enum AmendmentType {
    INITIAL("Initial Version", "Original protocol version"),
    MAJOR("Major Amendment", "Protocol changes affecting safety/efficacy"),
    MINOR("Minor Amendment", "Administrative changes"),
    SAFETY("Safety Amendment", "Safety-related changes"),
    ADMINISTRATIVE("Administrative Amendment", "Non-substantial changes");

    private final String label;
    private final String description;

    AmendmentType(String label, String description) {
        this.label = label;
        this.description = description;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    /**
     * Business Rule: Major, Safety, and Initial versions require regulatory approval
     */
    public boolean requiresRegulatoryApproval() {
        return this == INITIAL || this == MAJOR || this == SAFETY;
    }

    /**
     * Business Rule: Determine if re-consent required based on amendment type
     * Initial version doesn't require re-consent (it's the first consent)
     */
    public boolean requiresReConsent() {
        return this == MAJOR || this == SAFETY;
    }

    /**
     * Business Rule: Priority level for processing
     */
    public int getPriorityLevel() {
        return switch (this) {
            case SAFETY -> 1; // Highest priority
            case INITIAL -> 2; // Initial version is high priority
            case MAJOR -> 3;
            case MINOR -> 4;
            case ADMINISTRATIVE -> 5; // Lowest priority
        };
    }
    
    /**
     * Business Rule: Check if this is the initial version
     */
    public boolean isInitialVersion() {
        return this == INITIAL;
    }
}



