package com.clinprecision.common.dto.clinops;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * Design Progress DTO
 * Represents the progress of a specific design phase for a study
 */
public class DesignProgressDto {
    
    @NotBlank(message = "Phase is required")
    private String phase;
    
    @NotNull(message = "Completion status is required")
    private Boolean completed;
    
    @Min(value = 0, message = "Percentage must be between 0 and 100")
    @Max(value = 100, message = "Percentage must be between 0 and 100")
    private Integer percentage;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastUpdated;
    
    private String notes;
    
    // Default constructor
    public DesignProgressDto() {}
    
    // Constructor with required fields
    public DesignProgressDto(String phase, Boolean completed, Integer percentage) {
        this.phase = phase;
        this.completed = completed;
        this.percentage = percentage;
        this.lastUpdated = LocalDateTime.now();
    }
    
    // Full constructor
    public DesignProgressDto(String phase, Boolean completed, Integer percentage, 
                           LocalDateTime lastUpdated, String notes) {
        this.phase = phase;
        this.completed = completed;
        this.percentage = percentage;
        this.lastUpdated = lastUpdated;
        this.notes = notes;
    }
    
    // Getters and Setters
    public String getPhase() {
        return phase;
    }
    
    public void setPhase(String phase) {
        this.phase = phase;
    }
    
    public Boolean getCompleted() {
        return completed;
    }
    
    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
    
    public Integer getPercentage() {
        return percentage;
    }
    
    public void setPercentage(Integer percentage) {
        this.percentage = percentage;
    }
    
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    @Override
    public String toString() {
        return "DesignProgressDto{" +
                "phase='" + phase + '\'' +
                ", completed=" + completed +
                ", percentage=" + percentage +
                ", lastUpdated=" + lastUpdated +
                ", notes='" + notes + '\'' +
                '}';
    }
}