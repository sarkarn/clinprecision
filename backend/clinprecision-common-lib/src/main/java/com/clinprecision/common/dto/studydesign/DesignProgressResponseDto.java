package com.clinprecision.common.dto.studydesign;

import java.util.Map;

/**
 * Design Progress Response DTO
 * Returns the current design progress for all phases of a study
 */
public class DesignProgressResponseDto {
    
    private Long studyId;
    private Map<String, DesignProgressDto> progressData;
    private Integer overallCompletion;
    
    // Default constructor
    public DesignProgressResponseDto() {}
    
    // Constructor
    public DesignProgressResponseDto(Long studyId, Map<String, DesignProgressDto> progressData) {
        this.studyId = studyId;
        this.progressData = progressData;
        this.overallCompletion = calculateOverallCompletion();
    }
    
    // Constructor with overall completion
    public DesignProgressResponseDto(Long studyId, Map<String, DesignProgressDto> progressData, 
                                   Integer overallCompletion) {
        this.studyId = studyId;
        this.progressData = progressData;
        this.overallCompletion = overallCompletion;
    }
    
    /**
     * Calculate overall completion percentage based on individual phase progress
     */
    private Integer calculateOverallCompletion() {
        if (progressData == null || progressData.isEmpty()) {
            return 0;
        }
        
        int totalPercentage = progressData.values().stream()
                .mapToInt(progress -> progress.getPercentage() != null ? progress.getPercentage() : 0)
                .sum();
        
        return Math.round((float) totalPercentage / progressData.size());
    }
    
    // Getters and Setters
    public Long getStudyId() {
        return studyId;
    }
    
    public void setStudyId(Long studyId) {
        this.studyId = studyId;
    }
    
    public Map<String, DesignProgressDto> getProgressData() {
        return progressData;
    }
    
    public void setProgressData(Map<String, DesignProgressDto> progressData) {
        this.progressData = progressData;
        this.overallCompletion = calculateOverallCompletion();
    }
    
    public Integer getOverallCompletion() {
        return overallCompletion;
    }
    
    public void setOverallCompletion(Integer overallCompletion) {
        this.overallCompletion = overallCompletion;
    }
    
    @Override
    public String toString() {
        return "DesignProgressResponseDto{" +
                "studyId=" + studyId +
                ", progressData=" + progressData +
                ", overallCompletion=" + overallCompletion +
                '}';
    }
}