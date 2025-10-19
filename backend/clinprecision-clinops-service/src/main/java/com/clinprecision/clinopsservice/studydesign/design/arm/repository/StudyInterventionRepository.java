package com.clinprecision.clinopsservice.repository;



import com.clinprecision.clinopsservice.entity.StudyInterventionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for StudyInterventionEntity
 * Provides data access methods for study interventions
 */
@Repository
public interface StudyInterventionRepository extends JpaRepository<StudyInterventionEntity, Long> {
    
    /**
     * Find all interventions for a specific study arm
     */
    List<StudyInterventionEntity> findByStudyArmId(Long studyArmId);
    
    /**
     * Find intervention by ID and study arm ID for security
     */
    Optional<StudyInterventionEntity> findByIdAndStudyArmId(Long id, Long studyArmId);
    
    /**
     * Delete all interventions for a study arm
     */
    void deleteByStudyArmId(Long studyArmId);
    
    /**
     * Count interventions for a study arm
     */
    long countByStudyArmId(Long studyArmId);
    
    /**
     * Find interventions by study arm and type
     */
    @Query("SELECT i FROM StudyInterventionEntity i WHERE i.studyArmId = :studyArmId AND i.type = :type")
    List<StudyInterventionEntity> findByStudyArmIdAndType(@Param("studyArmId") Long studyArmId, 
                                                          @Param("type") String type);
    
    /**
     * Check if intervention exists for study arm
     */
    boolean existsByStudyArmId(Long studyArmId);
}



