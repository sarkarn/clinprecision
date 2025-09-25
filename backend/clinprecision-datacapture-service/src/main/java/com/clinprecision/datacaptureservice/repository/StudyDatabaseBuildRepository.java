package com.clinprecision.datacaptureservice.repository;

import com.clinprecision.datacaptureservice.entity.study.StudyDatabaseBuildEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Study Database Build operations
 * 
 * Provides data access methods for database build tracking including:
 * - Build status queries
 * - Historical build information
 * - Performance metrics
 * - Error tracking
 */
@Repository
public interface StudyDatabaseBuildRepository extends JpaRepository<StudyDatabaseBuildEntity, Long> {
    
    /**
     * Find database build by request ID
     */
    Optional<StudyDatabaseBuildEntity> findByBuildRequestId(String buildRequestId);
    
    /**
     * Find all builds for a specific study
     */
    List<StudyDatabaseBuildEntity> findByStudyIdOrderByBuildStartTimeDesc(Long studyId);
    
    /**
     * Find the latest build for a study
     */
    Optional<StudyDatabaseBuildEntity> findFirstByStudyIdOrderByBuildStartTimeDesc(Long studyId);
    
    /**
     * Find builds by status
     */
    List<StudyDatabaseBuildEntity> findByBuildStatusOrderByBuildStartTimeDesc(String buildStatus);
    
    /**
     * Find builds within a date range
     */
    @Query("SELECT b FROM StudyDatabaseBuildEntity b WHERE b.buildStartTime BETWEEN :startDate AND :endDate ORDER BY b.buildStartTime DESC")
    List<StudyDatabaseBuildEntity> findBuildsBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                                          @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find builds by user
     */
    List<StudyDatabaseBuildEntity> findByRequestedByOrderByBuildStartTimeDesc(Long userId);
    
    /**
     * Count builds by status
     */
    long countByBuildStatus(String buildStatus);
    
    /**
     * Find failed builds for troubleshooting
     */
    @Query("SELECT b FROM StudyDatabaseBuildEntity b WHERE b.buildStatus = 'FAILED' AND b.buildStartTime >= :since ORDER BY b.buildStartTime DESC")
    List<StudyDatabaseBuildEntity> findRecentFailedBuilds(@Param("since") LocalDateTime since);
    
    /**
     * Get build statistics
     */
    @Query("SELECT b.buildStatus, COUNT(b), AVG(TIMESTAMPDIFF(MINUTE, b.buildStartTime, b.buildEndTime)) " +
           "FROM StudyDatabaseBuildEntity b " +
           "WHERE b.buildStartTime >= :since " +
           "GROUP BY b.buildStatus")
    List<Object[]> getBuildStatistics(@Param("since") LocalDateTime since);
}