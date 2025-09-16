package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.DesignProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for DesignProgressEntity
 * Provides data access methods for study design progress tracking
 */
@Repository
public interface DesignProgressRepository extends JpaRepository<DesignProgressEntity, Long> {
    
    /**
     * Find all design progress records for a specific study
     * @param studyId The study ID
     * @return List of design progress entities for the study
     */
    List<DesignProgressEntity> findByStudyIdOrderByPhaseAsc(Long studyId);
    
    /**
     * Find a specific design progress record by study ID and phase
     * @param studyId The study ID
     * @param phase The design phase
     * @return Optional design progress entity
     */
    Optional<DesignProgressEntity> findByStudyIdAndPhase(Long studyId, String phase);
    
    /**
     * Find all completed phases for a study
     * @param studyId The study ID
     * @return List of completed design progress entities
     */
    List<DesignProgressEntity> findByStudyIdAndCompletedTrueOrderByPhaseAsc(Long studyId);
    
    /**
     * Find all incomplete phases for a study
     * @param studyId The study ID
     * @return List of incomplete design progress entities
     */
    List<DesignProgressEntity> findByStudyIdAndCompletedFalseOrderByPhaseAsc(Long studyId);
    
    /**
     * Calculate overall completion percentage for a study
     * @param studyId The study ID
     * @return Average completion percentage across all phases
     */
    @Query("SELECT AVG(dp.percentage) FROM DesignProgressEntity dp WHERE dp.studyId = :studyId")
    Double calculateOverallCompletionPercentage(@Param("studyId") Long studyId);
    
    /**
     * Count completed phases for a study
     * @param studyId The study ID
     * @return Number of completed phases
     */
    Long countByStudyIdAndCompletedTrue(Long studyId);
    
    /**
     * Count total phases for a study
     * @param studyId The study ID
     * @return Total number of phases
     */
    Long countByStudyId(Long studyId);
    
    /**
     * Check if a study exists in design progress tracking
     * @param studyId The study ID
     * @return True if study has design progress records
     */
    boolean existsByStudyId(Long studyId);
    
    /**
     * Delete all design progress records for a study
     * @param studyId The study ID
     */
    void deleteByStudyId(Long studyId);
    
    /**
     * Find studies with specific completion status
     * @param completed The completion status
     * @return List of study IDs with the specified completion status
     */
    @Query("SELECT DISTINCT dp.studyId FROM DesignProgressEntity dp WHERE dp.completed = :completed")
    List<Long> findStudyIdsByCompletionStatus(@Param("completed") Boolean completed);
    
    /**
     * Get phase completion summary for a study
     * @param studyId The study ID
     * @return Custom result with phase completion statistics
     */
    @Query("SELECT dp.phase, dp.completed, dp.percentage, dp.updatedAt " +
           "FROM DesignProgressEntity dp WHERE dp.studyId = :studyId ORDER BY dp.phase")
    List<Object[]> getPhaseCompletionSummary(@Param("studyId") Long studyId);
}