package com.clinprecision.common.dto.clinops;


import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for StudyArm response
 * Matches the expected frontend response structure from mock data
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyArmResponseDto {
    
    private Long id;
    private String name;
    private String description;
    private String type; // TREATMENT, PLACEBO, CONTROL, ACTIVE_COMPARATOR
    private Integer sequence;
    private Integer plannedSubjects;
    private Long studyId;
    private List<StudyInterventionResponseDto> interventions;
    
    // Audit fields (optional for response)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    
    // Constructors
    public StudyArmResponseDto() {}
    
    public StudyArmResponseDto(Long id, String name, String description, String type, 
                              Integer sequence, Integer plannedSubjects, Long studyId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.sequence = sequence;
        this.plannedSubjects = plannedSubjects;
        this.studyId = studyId;
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
    
    public Integer getSequence() { return sequence; }
    public void setSequence(Integer sequence) { this.sequence = sequence; }
    
    public Integer getPlannedSubjects() { return plannedSubjects; }
    public void setPlannedSubjects(Integer plannedSubjects) { this.plannedSubjects = plannedSubjects; }
    
    public Long getStudyId() { return studyId; }
    public void setStudyId(Long studyId) { this.studyId = studyId; }
    
    public List<StudyInterventionResponseDto> getInterventions() { return interventions; }
    public void setInterventions(List<StudyInterventionResponseDto> interventions) { this.interventions = interventions; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
    
    // Builder pattern
    public static class Builder {
        private StudyArmResponseDto dto = new StudyArmResponseDto();
        
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
        
        public Builder sequence(Integer sequence) {
            dto.sequence = sequence;
            return this;
        }
        
        public Builder plannedSubjects(Integer plannedSubjects) {
            dto.plannedSubjects = plannedSubjects;
            return this;
        }
        
        public Builder studyId(Long studyId) {
            dto.studyId = studyId;
            return this;
        }
        
        public Builder interventions(List<StudyInterventionResponseDto> interventions) {
            dto.interventions = interventions;
            return this;
        }
        
        public Builder createdAt(LocalDateTime createdAt) {
            dto.createdAt = createdAt;
            return this;
        }
        
        public Builder updatedAt(LocalDateTime updatedAt) {
            dto.updatedAt = updatedAt;
            return this;
        }
        
        public Builder createdBy(String createdBy) {
            dto.createdBy = createdBy;
            return this;
        }
        
        public Builder updatedBy(String updatedBy) {
            dto.updatedBy = updatedBy;
            return this;
        }
        
        public StudyArmResponseDto build() {
            return dto;
        }
    }
    
    @Override
    public String toString() {
        return "StudyArmResponseDto{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", sequence=" + sequence +
                ", plannedSubjects=" + plannedSubjects +
                ", studyId=" + studyId +
                ", interventionsCount=" + (interventions != null ? interventions.size() : 0) +
                '}';
    }
}