package com.clinprecision.studydesignservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import java.util.List;

/**
 * DTO for StudyArm update requests
 * Contains validation rules for updating existing study arms
 */
public class StudyArmUpdateRequestDto {
    
    private String name;
    private String description;
    
    @Pattern(regexp = "TREATMENT|PLACEBO|CONTROL|ACTIVE_COMPARATOR", 
             message = "Type must be one of: TREATMENT, PLACEBO, CONTROL, ACTIVE_COMPARATOR")
    private String type;
    
    @Min(value = 1, message = "Sequence number must be at least 1")
    private Integer sequence;
    
    @Min(value = 0, message = "Planned subjects cannot be negative")
    private Integer plannedSubjects;
    
    private List<StudyInterventionUpdateRequestDto> interventions;
    
    // Constructors
    public StudyArmUpdateRequestDto() {}
    
    public StudyArmUpdateRequestDto(String name, String description, String type, 
                                   Integer sequence, Integer plannedSubjects) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.sequence = sequence;
        this.plannedSubjects = plannedSubjects;
    }
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public Integer getSequence() { return sequence; }
    public void setSequence(Integer sequence) { this.sequence = sequence; }
    
    public Integer getPlannedSubjects() { return plannedSubjects; }
    public void setPlannedSubjects(Integer plannedSubjects) { this.plannedSubjects = plannedSubjects; }
    
    public List<StudyInterventionUpdateRequestDto> getInterventions() { return interventions; }
    public void setInterventions(List<StudyInterventionUpdateRequestDto> interventions) { this.interventions = interventions; }
    
    // Helper method to check if any field is provided
    public boolean hasUpdates() {
        return name != null || description != null || type != null || 
               sequence != null || plannedSubjects != null || interventions != null;
    }
    
    @Override
    public String toString() {
        return "StudyArmUpdateRequestDto{" +
                "name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", sequence=" + sequence +
                ", plannedSubjects=" + plannedSubjects +
                ", interventionsCount=" + (interventions != null ? interventions.size() : 0) +
                '}';
    }
}