package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.VisitFormEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for accessing visit-form mapping data.
 */
@Repository
public interface VisitFormRepository extends JpaRepository<VisitFormEntity, Long> {
    
    /**
     * Find all forms associated with a specific visit.
     * 
     * @param visitDefinitionId The ID of the visit definition
     * @return List of visit-form mappings
     */
    List<VisitFormEntity> findByVisitDefinitionId(Long visitDefinitionId);
    
    /**
     * Find all active forms associated with a specific visit.
     * 
     * @param visitDefinitionId The ID of the visit definition
     * @return List of active visit-form mappings
     */
    List<VisitFormEntity> findByVisitDefinitionIdAndIsActiveTrue(Long visitDefinitionId);
    
    /**
     * Find all visit-form mappings for a specific form.
     * 
     * @param formId The ID of the form 
     * @return List of visit-form mappings
     */
    List<VisitFormEntity> findByFormId(Long formId);
    
    /**
     * Find all visit-form mappings for a list of visits.
     * 
     * @param visitDefinitionIds List of visit definition IDs
     * @return List of visit-form mappings
     */
    List<VisitFormEntity> findByVisitDefinitionIdIn(List<Long> visitDefinitionIds);
    
    /**
     * Find all visit-form mappings for a specific visit and form.
     * 
     * @param visitDefinitionId The ID of the visit definition
     * @param formId The ID of the form
     * @return List of visit-form mappings
     */
    List<VisitFormEntity> findByVisitDefinitionIdAndFormId(Long visitDefinitionId, Long formId);
    
    /**
     * Delete all mappings for a specific visit.
     * 
     * @param visitDefinitionId The ID of the visit definition
     */
    void deleteByVisitDefinitionId(Long visitDefinitionId);
    
    /**
     * Delete all mappings for a specific form.
     * 
     * @param formId The ID of the form
     */
    void deleteByFormId(Long formId);
}
