package com.clinprecision.studydesignservice.service;


import com.clinprecision.common.dto.studydesign.StudyDashboardMetricsDto;
import com.clinprecision.studydesignservice.repository.StudyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for calculating and managing study dashboard metrics
 * Aggregates data from various sources to provide comprehensive dashboard statistics
 * Created: September 13, 2025
 */
@Service
@Transactional(readOnly = true)
public class StudyDashboardService {
    
    private static final Logger logger = LoggerFactory.getLogger(StudyDashboardService.class);
    
    private final StudyRepository studyRepository;
    
    public StudyDashboardService(StudyRepository studyRepository) {
        this.studyRepository = studyRepository;
    }
    
    /**
     * Get comprehensive dashboard metrics
     * @return StudyDashboardMetricsDto containing all dashboard statistics
     */
    public StudyDashboardMetricsDto getDashboardMetrics() {
        logger.info("Calculating dashboard metrics...");
        
        try {
            // Get individual counts
            Long activeStudies = studyRepository.countActiveStudies();
            Long draftProtocols = studyRepository.countDraftStudies();
            Long completedStudies = studyRepository.countCompletedStudies();
            Long totalAmendments = studyRepository.getTotalAmendments();
            
            // Handle null values from database queries
            activeStudies = activeStudies != null ? activeStudies : 0L;
            draftProtocols = draftProtocols != null ? draftProtocols : 0L;
            completedStudies = completedStudies != null ? completedStudies : 0L;
            totalAmendments = totalAmendments != null ? totalAmendments : 0L;
            
            logger.debug("Individual metrics - Active: {}, Draft: {}, Completed: {}, Amendments: {}", 
                        activeStudies, draftProtocols, completedStudies, totalAmendments);
            
            // Create main metrics DTO
            StudyDashboardMetricsDto metrics = new StudyDashboardMetricsDto(
                activeStudies, draftProtocols, completedStudies, totalAmendments
            );
            
            // Get detailed breakdowns
            Map<String, Long> studiesByStatus = getStudiesByStatus();
            Map<String, Long> studiesByPhase = getStudiesByPhase();
            
            metrics.setStudiesByStatus(studiesByStatus);
            metrics.setStudiesByPhase(studiesByPhase);
            
            logger.info("Dashboard metrics calculated successfully - Active: {}, Draft: {}, Completed: {}, Total Amendments: {}", 
                       activeStudies, draftProtocols, completedStudies, totalAmendments);
            
            return metrics;
            
        } catch (Exception e) {
            logger.error("Error calculating dashboard metrics", e);
            
            // Return default metrics in case of error
            StudyDashboardMetricsDto fallbackMetrics = new StudyDashboardMetricsDto(0L, 0L, 0L, 0L);
            fallbackMetrics.setStudiesByStatus(new HashMap<>());
            fallbackMetrics.setStudiesByPhase(new HashMap<>());
            
            return fallbackMetrics;
        }
    }
    
    /**
     * Get studies grouped by status
     * @return Map of status name to count
     */
    private Map<String, Long> getStudiesByStatus() {
        try {
            List<Object[]> statusCounts = studyRepository.countStudiesByStatus();
            Map<String, Long> studiesByStatus = new HashMap<>();
            
            for (Object[] row : statusCounts) {
                String statusName = (String) row[0];
                Long count = (Long) row[1];
                studiesByStatus.put(statusName, count);
            }
            
            logger.debug("Studies by status: {}", studiesByStatus);
            return studiesByStatus;
            
        } catch (Exception e) {
            logger.error("Error getting studies by status", e);
            return new HashMap<>();
        }
    }
    
    /**
     * Get studies grouped by phase
     * @return Map of phase name to count
     */
    private Map<String, Long> getStudiesByPhase() {
        try {
            List<Object[]> phaseCounts = studyRepository.countStudiesByPhaseName();
            Map<String, Long> studiesByPhase = new HashMap<>();
            
            for (Object[] row : phaseCounts) {
                String phaseName = (String) row[0];
                Long count = (Long) row[1];
                studiesByPhase.put(phaseName, count);
            }
            
            logger.debug("Studies by phase: {}", studiesByPhase);
            return studiesByPhase;
            
        } catch (Exception e) {
            logger.error("Error getting studies by phase", e);
            return new HashMap<>();
        }
    }
    
    /**
     * Get specific metric count by status code
     * @param statusCode The status code to count
     * @return Count of studies with the specified status
     */
    public Long getStudyCountByStatus(String statusCode) {
        try {
            Long count = studyRepository.countStudiesByStatusCode(statusCode);
            return count != null ? count : 0L;
        } catch (Exception e) {
            logger.error("Error getting study count for status: {}", statusCode, e);
            return 0L;
        }
    }
    
    /**
     * Check if metrics are available (database is accessible)
     * @return true if metrics can be calculated, false otherwise
     */
    public boolean areMetricsAvailable() {
        try {
            studyRepository.count();
            return true;
        } catch (Exception e) {
            logger.warn("Metrics not available - database access error", e);
            return false;
        }
    }
}