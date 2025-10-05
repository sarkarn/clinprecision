package com.clinprecision.clinopsservice.protocolversion.domain.valueobjects;

/**
 * AmendmentType Value Object
 * 
 * Represents the type of protocol amendment following FDA guidelines.
 * Following DDD principles: Value Objects encapsulate business rules.
 */
public enum AmendmentType {
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
     * Business Rule: Major and Safety amendments require regulatory approval
     */
    public boolean requiresRegulatoryApproval() {
        return this == MAJOR || this == SAFETY;
    }

    /**
     * Business Rule: Determine if re-consent required based on amendment type
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
            case MAJOR -> 2;
            case MINOR -> 3;
            case ADMINISTRATIVE -> 4; // Lowest priority
        };
    }
}



