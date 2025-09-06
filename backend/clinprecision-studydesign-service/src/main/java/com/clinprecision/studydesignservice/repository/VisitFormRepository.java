package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.VisitFormEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for accessing visit-form mapping data.
 */
@Repository
public interface VisitFormRepository extends JpaRepository<VisitFormEntity, String> {
    
    /**
     * Find all forms associated with a specific visit.
     * 
     * @param visitDefinitionId The ID of the visit definition
     * @return List of visit-form mappings
     */
    List<VisitFormEntity> findByVisitDefinitionId(String visitDefinitionId);
    
    /**
     * Find all active forms associated with a specific visit.
     * 
     * @param visitDefinitionId The ID of the visit definition
     * @param isActive Whether the mapping is active
     * @return List of active visit-form mappings
     */
    List<VisitFormEntity> findByVisitDefinitionIdAndIsActive(String visitDefinitionId, boolean isActive);
    
    /**
     * Find all visit-form mappings for a specific form.
     * 
     * @param formDefinitionId The ID of the form definition
     * @return List of visit-form mappings
     */
    List<VisitFormEntity> findByFormDefinitionId(String formDefinitionId);
    
    /**
     * Find all visit-form mappings for a list of visits.
     * 
     * @param visitDefinitionIds List of visit definition IDs
     * @return List of visit-form mappings
     */
    List<VisitFormEntity> findByVisitDefinitionIdIn(List<String> visitDefinitionIds);
    
    /**
     * Find all visit-form mappings for a specific visit and form.
     * 
     * @param visitDefinitionId The ID of the visit definition
     * @param formDefinitionId The ID of the form definition
     * @return List of visit-form mappings
     */
    List<VisitFormEntity> findByVisitDefinitionIdAndFormDefinitionId(String visitDefinitionId, String formDefinitionId);
    
    /**
     * Delete all mappings for a specific visit.
     * 
     * @param visitDefinitionId The ID of the visit definition
     */
    void deleteByVisitDefinitionId(String visitDefinitionId);
    
    /**
     * Delete all mappings for a specific form.
     * 
     * @param formDefinitionId The ID of the form definition
     */
    void deleteByFormDefinitionId(String formDefinitionId);
}
