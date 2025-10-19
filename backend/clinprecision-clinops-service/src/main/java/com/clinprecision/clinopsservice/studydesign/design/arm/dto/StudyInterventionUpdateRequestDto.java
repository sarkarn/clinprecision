package com.clinprecision.clinopsservice.studydesign.design.arm.dto;

import jakarta.validation.constraints.Pattern;

/**
 * DTO for Intervention update requests
 * Contains validation rules for updating interventions within study arms
 */
public class StudyInterventionUpdateRequestDto {
    
    private String id; // Can be temporary ID for new interventions (e.g., "INT-123456789")
    private String name;
    private String description;
    
    @Pattern(regexp = "DRUG|DEVICE|PROCEDURE|BEHAVIORAL|OTHER", 
             message = "Type must be one of: DRUG, DEVICE, PROCEDURE, BEHAVIORAL, OTHER")
    private String type;
    
    private String dosage;
    private String frequency;
    private String route;
    
    // Constructors
    public StudyInterventionUpdateRequestDto() {}
    
    public StudyInterventionUpdateRequestDto(String id, String name, String description, String type,
                                            String dosage, String frequency, String route) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.dosage = dosage;
        this.frequency = frequency;
        this.route = route;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    
    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }
    
    // Helper methods
    public boolean isNewIntervention() {
        return id == null || id.startsWith("INT-");
    }
    
    public boolean hasUpdates() {
        return name != null || description != null || type != null || 
               dosage != null || frequency != null || route != null;
    }
    
    @Override
    public String toString() {
        return "StudyInterventionUpdateRequestDto{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", dosage='" + dosage + '\'' +
                ", frequency='" + frequency + '\'' +
                ", route='" + route + '\'' +
                '}';
    }
}


