package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.VisitDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for accessing visit definition data.
 */
@Repository
public interface VisitDefinitionRepository extends JpaRepository<VisitDefinitionEntity, Long> {
    
    /**
     * Find all visit definitions for a specific study.
     * 
     * @param studyId The ID of the study
     * @return List of visit definitions
     */
    List<VisitDefinitionEntity> findByStudyId(Long studyId);
    
    /**
     * Find all active visit definitions for a specific study.
     * 
     * @param studyId The ID of the study
     * @return List of active visit definitions
     */
    List<VisitDefinitionEntity> findByStudyIdAndIsActiveTrue(Long studyId);
    
    /**
     * Find visit definition by visit number within a study.
     * 
     * @param studyId The ID of the study
     * @param visitNumber The visit number
     * @return The matching visit definition
     */
    VisitDefinitionEntity findByStudyIdAndVisitNumber(Long studyId, Integer visitNumber);
    
    /**
     * Find all visit definitions for a specific study arm.
     * 
     * @param armId The ID of the study arm
     * @return List of visit definitions
     */
    List<VisitDefinitionEntity> findByArmId(Long armId);
    
    /**
     * Find all active visit definitions for a specific study arm.
     * 
     * @param armId The ID of the study arm
     * @return List of active visit definitions
     */
    List<VisitDefinitionEntity> findByArmIdAndIsActiveTrue(Long armId);
}
