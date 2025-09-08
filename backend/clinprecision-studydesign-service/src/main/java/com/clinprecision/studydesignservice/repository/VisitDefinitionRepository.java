package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.VisitDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for accessing visit definition data.
 */
@Repository
public interface VisitDefinitionRepository extends JpaRepository<VisitDefinitionEntity, String> {
    
    /**
     * Find all visit definitions for a specific study.
     * 
     * @param studyId The ID of the study
     * @return List of visit definitions
     */
    List<VisitDefinitionEntity> findByStudyId(String studyId);
    
    /**
     * Find all active visit definitions for a specific study.
     * 
     * @param studyId The ID of the study
     * @param isActive Whether the visit is active
     * @return List of active visit definitions
     */
    List<VisitDefinitionEntity> findByStudyIdAndIsActive(String studyId, boolean isActive);
    
    /**
     * Find visit definition by visit number within a study.
     * 
     * @param studyId The ID of the study
     * @param visitNumber The visit number
     * @return The matching visit definition
     */
    VisitDefinitionEntity findByStudyIdAndVisitNumber(String studyId, Integer visitNumber);
}
