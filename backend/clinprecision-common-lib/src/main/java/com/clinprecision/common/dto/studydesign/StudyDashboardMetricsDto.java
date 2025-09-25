package com.clinprecision.common.dto.studydesign;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for study dashboard metrics
 * Contains aggregated statistics for the study design dashboard
 * Created: September 13, 2025
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyDashboardMetricsDto {
    
    private Long activeStudies;
    private Long draftProtocols;
    private Long completedStudies;
    private Long totalAmendments;
    private Map<String, Long> studiesByStatus;
    private Map<String, Long> studiesByPhase;
    private LocalDateTime lastUpdated;
    
    // Default constructor
    public StudyDashboardMetricsDto() {
        this.lastUpdated = LocalDateTime.now();
    }
    
    // Constructor with main metrics
    public StudyDashboardMetricsDto(Long activeStudies, Long draftProtocols, Long completedStudies, Long totalAmendments) {
        this.activeStudies = activeStudies;
        this.draftProtocols = draftProtocols;
        this.completedStudies = completedStudies;
        this.totalAmendments = totalAmendments;
        this.lastUpdated = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getActiveStudies() {
        return activeStudies;
    }
    
    public void setActiveStudies(Long activeStudies) {
        this.activeStudies = activeStudies;
    }
    
    public Long getDraftProtocols() {
        return draftProtocols;
    }
    
    public void setDraftProtocols(Long draftProtocols) {
        this.draftProtocols = draftProtocols;
    }
    
    public Long getCompletedStudies() {
        return completedStudies;
    }
    
    public void setCompletedStudies(Long completedStudies) {
        this.completedStudies = completedStudies;
    }
    
    public Long getTotalAmendments() {
        return totalAmendments;
    }
    
    public void setTotalAmendments(Long totalAmendments) {
        this.totalAmendments = totalAmendments;
    }
    
    public Map<String, Long> getStudiesByStatus() {
        return studiesByStatus;
    }
    
    public void setStudiesByStatus(Map<String, Long> studiesByStatus) {
        this.studiesByStatus = studiesByStatus;
    }
    
    public Map<String, Long> getStudiesByPhase() {
        return studiesByPhase;
    }
    
    public void setStudiesByPhase(Map<String, Long> studiesByPhase) {
        this.studiesByPhase = studiesByPhase;
    }
    
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    @Override
    public String toString() {
        return "StudyDashboardMetricsDto{" +
                "activeStudies=" + activeStudies +
                ", draftProtocols=" + draftProtocols +
                ", completedStudies=" + completedStudies +
                ", totalAmendments=" + totalAmendments +
                ", studiesByStatus=" + studiesByStatus +
                ", studiesByPhase=" + studiesByPhase +
                ", lastUpdated=" + lastUpdated +
                '}';
    }
}