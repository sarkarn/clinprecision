package com.clinprecision.clinopsservice.studydesign.design.arm.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * DTO for StudyArm creation requests
 * Contains validation rules for creating new study arms
 */
public class StudyArmCreateRequestDto {
    
    @NotBlank(message = "Study arm name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Study arm type is required")
    @Pattern(regexp = "TREATMENT|PLACEBO|CONTROL|ACTIVE_COMPARATOR", 
             message = "Type must be one of: TREATMENT, PLACEBO, CONTROL, ACTIVE_COMPARATOR")
    private String type;
    
    @NotNull(message = "Sequence number is required")
    @Min(value = 1, message = "Sequence number must be at least 1")
    private Integer sequence;
    
    @Min(value = 0, message = "Planned subjects cannot be negative")
    private Integer plannedSubjects = 0;
    
    // Constructors
    public StudyArmCreateRequestDto() {}
    
    public StudyArmCreateRequestDto(String name, String description, String type, 
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
    
    @Override
    public String toString() {
        return "StudyArmCreateRequestDto{" +
                "name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", sequence=" + sequence +
                ", plannedSubjects=" + plannedSubjects +
                '}';
    }
}


