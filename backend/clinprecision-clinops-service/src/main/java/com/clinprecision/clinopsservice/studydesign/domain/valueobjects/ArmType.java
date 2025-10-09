package com.clinprecision.clinopsservice.studydesign.domain.valueobjects;

/**
 * Study Arm Type - Value Object
 * 
 * Represents the type of study arm in a clinical trial.
 * Based on common clinical trial arm classifications.
 */
public enum ArmType {
    
    /**
     * Active treatment arm receiving the investigational product
     */
    TREATMENT("Active Treatment", "Receives investigational treatment"),
    
    /**
     * Control arm receiving placebo
     */
    PLACEBO("Placebo", "Receives placebo/sham treatment"),
    
    /**
     * Control arm receiving standard of care
     */
    ACTIVE_COMPARATOR("Active Comparator", "Receives active comparator/standard of care"),
    
    /**
     * No intervention control group
     */
    NO_INTERVENTION("No Intervention", "No treatment administered"),
    
    /**
     * Experimental arm with different dose/regimen
     */
    EXPERIMENTAL("Experimental", "Receives experimental intervention"),
    
    /**
     * Other arm type not fitting standard categories
     */
    OTHER("Other", "Other arm type");
    
    private final String displayName;
    private final String description;
    
    ArmType(String displayName, String description) {
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
     * Check if this arm type requires active intervention
     */
    public boolean requiresIntervention() {
        return this == TREATMENT || 
               this == ACTIVE_COMPARATOR || 
               this == EXPERIMENTAL;
    }
    
    /**
     * Check if this is a control arm
     */
    public boolean isControl() {
        return this == PLACEBO || 
               this == NO_INTERVENTION;
    }
    
    /**
     * Get from legacy StudyArmType enum
     */
    public static ArmType fromLegacy(String legacyType) {
        if (legacyType == null) {
            return TREATMENT;
        }
        
        return switch (legacyType.toUpperCase()) {
            case "TREATMENT" -> TREATMENT;
            case "PLACEBO", "CONTROL" -> PLACEBO;
            case "ACTIVE_COMPARATOR", "COMPARATOR" -> ACTIVE_COMPARATOR;
            case "NO_INTERVENTION" -> NO_INTERVENTION;
            case "EXPERIMENTAL" -> EXPERIMENTAL;
            default -> OTHER;
        };
    }
}
