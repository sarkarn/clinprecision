package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.FormVersionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for FormVersionEntity
 */
@Repository
public interface FormVersionRepository extends JpaRepository<FormVersionEntity, Long> {
    
    /**
     * Find form versions by form ID
     * 
     * @param formId Form ID
     * @return List of form versions for the given form
     */
    List<FormVersionEntity> findByFormId(Long formId);
    
    /**
     * Find a specific form version by ID and form ID
     * 
     * @param id Form version ID
     * @param formId Form ID
     * @return Optional containing the form version if found
     */
    Optional<FormVersionEntity> findByIdAndFormId(Long id, Long formId);
    
    /**
     * Find active form versions by form ID
     * 
     * @param formId Form ID
     * @return List of active form versions for the given form
     */
    List<FormVersionEntity> findByFormIdAndIsActiveTrue(Long formId);
    
    /**
     * Find published form versions by form ID
     * 
     * @param formId Form ID
     * @return List of published form versions for the given form
     */
    List<FormVersionEntity> findByFormIdAndIsPublishedTrue(Long formId);
}
