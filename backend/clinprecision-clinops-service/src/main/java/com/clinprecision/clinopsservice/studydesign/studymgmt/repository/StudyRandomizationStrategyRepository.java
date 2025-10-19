package com.clinprecision.clinopsservice.studydesign.studymgmt.repository;

import com.clinprecision.clinopsservice.studydesign.studymgmt.entity.StudyRandomizationStrategyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for StudyRandomizationStrategyEntity
 * Handles CRUD operations for study randomization strategies
 */
@Repository
public interface StudyRandomizationStrategyRepository extends JpaRepository<StudyRandomizationStrategyEntity, Long> {
    
    /**
     * Find randomization strategy for a specific study arm
     * @param studyArmId The study arm ID
     * @return Optional randomization strategy for the arm
     */
    Optional<StudyRandomizationStrategyEntity> findByStudyArmIdAndIsDeletedFalse(Long studyArmId);
    
    /**
     * Find randomization strategies for multiple study arms
     * @param studyArmIds List of study arm IDs
     * @return List of randomization strategies for the arms
     */
    List<StudyRandomizationStrategyEntity> findByStudyArmIdInAndIsDeletedFalse(List<Long> studyArmIds);
    
    /**
     * Find randomization strategy by ID and study arm ID for security
     * @param id Strategy ID
     * @param studyArmId Study arm ID
     * @return Optional randomization strategy
     */
    Optional<StudyRandomizationStrategyEntity> findByIdAndStudyArmId(Long id, Long studyArmId);
    
    /**
     * Delete randomization strategy for a study arm (soft delete)
     * @param studyArmId The study arm ID
     */
    @Query("UPDATE StudyRandomizationStrategyEntity r SET r.isDeleted = true WHERE r.studyArmId = :studyArmId")
    void softDeleteByStudyArmId(@Param("studyArmId") Long studyArmId);
    
    /**
     * Hard delete randomization strategy for a study arm
     * @param studyArmId The study arm ID
     */
    void deleteByStudyArmId(Long studyArmId);
    
    /**
     * Check if randomization strategy exists for study arm
     * @param studyArmId The study arm ID
     * @return True if strategy exists
     */
    boolean existsByStudyArmIdAndIsDeletedFalse(Long studyArmId);
    
    /**
     * Find randomization strategies by type
     * @param type The randomization type
     * @return List of strategies with the specified type
     */
    List<StudyRandomizationStrategyEntity> findByTypeAndIsDeletedFalse(String type);
}