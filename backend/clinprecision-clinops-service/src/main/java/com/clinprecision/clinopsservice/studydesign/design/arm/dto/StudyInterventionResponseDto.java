package com.clinprecision.clinopsservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * DTO for Intervention response
 * Matches the expected frontend intervention structure from mock data
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyInterventionResponseDto {
    
    private Long id;
    private String name;
    private String description;
    private String type; // DRUG, DEVICE, PROCEDURE, BEHAVIORAL, OTHER
    private String dosage;
    private String frequency;
    private String route;
    
    // Constructors
    public StudyInterventionResponseDto() {}
    
    public StudyInterventionResponseDto(Long id, String name, String description, String type,
                                        String dosage, String frequency, String route) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.dosage = dosage;
        this.frequency = frequency;
        this.route = route;
    }
    
    // Static builder method
    public static Builder builder() {
        return new Builder();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
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
    
    // Builder pattern
    public static class Builder {
        private StudyInterventionResponseDto dto = new StudyInterventionResponseDto();
        
        public Builder id(Long id) {
            dto.id = id;
            return this;
        }
        
        public Builder name(String name) {
            dto.name = name;
            return this;
        }
        
        public Builder description(String description) {
            dto.description = description;
            return this;
        }
        
        public Builder type(String type) {
            dto.type = type;
            return this;
        }
        
        public Builder dosage(String dosage) {
            dto.dosage = dosage;
            return this;
        }
        
        public Builder frequency(String frequency) {
            dto.frequency = frequency;
            return this;
        }
        
        public Builder route(String route) {
            dto.route = route;
            return this;
        }
        
        public StudyInterventionResponseDto build() {
            return dto;
        }
    }
    
    @Override
    public String toString() {
        return "InterventionResponseDto{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", dosage='" + dosage + '\'' +
                ", frequency='" + frequency + '\'' +
                ", route='" + route + '\'' +
                '}';
    }
}


