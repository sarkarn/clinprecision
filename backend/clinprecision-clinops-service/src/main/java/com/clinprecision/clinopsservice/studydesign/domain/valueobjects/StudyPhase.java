package com.clinprecision.clinopsservice.studydesign.domain.valueobjects;

/**
 * StudyPhase Value Object
 * 
 * Represents the clinical trial phase (Phase I, II, III, IV, etc.)
 * Following DDD principles: Value Objects with domain behavior.
 */
public enum StudyPhase {
    PHASE_0("Phase 0", "Exploratory study", 0),
    PHASE_I("Phase I", "Safety and dosage", 1),
    PHASE_II("Phase II", "Efficacy and side effects", 2),
    PHASE_III("Phase III", "Efficacy and monitoring", 3),
    PHASE_IV("Phase IV", "Post-marketing surveillance", 4),
    PHASE_I_II("Phase I/II", "Combined Phase I and II", 12),
    PHASE_II_III("Phase II/III", "Combined Phase II and III", 23),
    NOT_APPLICABLE("N/A", "Not a clinical trial", 99);

    private final String displayName;
    private final String description;
    private final int sortOrder;

    StudyPhase(String displayName, String description, int sortOrder) {
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
     * Business rule: Check if this phase requires regulatory approval
     */
    public boolean requiresRegulatoryApproval() {
        return this != NOT_APPLICABLE;
    }

    /**
     * Business rule: Check if this is an early phase study
     */
    public boolean isEarlyPhase() {
        return this == PHASE_0 || this == PHASE_I || this == PHASE_I_II;
    }

    /**
     * Business rule: Check if this is a late phase study
     */
    public boolean isLatePhase() {
        return this == PHASE_III || this == PHASE_IV || this == PHASE_II_III;
    }

    /**
     * Map from legacy database ID
     */
    public static StudyPhase fromLegacyId(Integer phaseId) {
        if (phaseId == null) {
            return NOT_APPLICABLE;
        }
        
        return switch (phaseId) {
            case 0 -> PHASE_0;
            case 1 -> PHASE_I;
            case 2 -> PHASE_II;
            case 3 -> PHASE_III;
            case 4 -> PHASE_IV;
            case 12 -> PHASE_I_II;
            case 23 -> PHASE_II_III;
            default -> NOT_APPLICABLE;
        };
    }

    /**
     * Get phase ID for database mapping
     */
    public int toPhaseId() {
        return this.sortOrder;
    }
}
