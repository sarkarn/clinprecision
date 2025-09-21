package com.clinprecision.studydesignservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * Design Progress Update Request DTO
 * Used for updating design progress for a study
 */
public class DesignProgressUpdateRequestDto {
    
    @NotNull(message = "Progress data is required")
    @NotEmpty(message = "Progress data cannot be empty")
    @Valid
    private Map<String, DesignProgressDto> progressData;
    
    // Default constructor
    public DesignProgressUpdateRequestDto() {}
    
    // Constructor
    public DesignProgressUpdateRequestDto(Map<String, DesignProgressDto> progressData) {
        this.progressData = progressData;
    }
    
    // Getters and Setters
    public Map<String, DesignProgressDto> getProgressData() {
        return progressData;
    }
    
    public void setProgressData(Map<String, DesignProgressDto> progressData) {
        this.progressData = progressData;
    }
    
    @Override
    public String toString() {
        return "DesignProgressUpdateRequestDto{" +
                "progressData=" + progressData +
                '}';
    }
}