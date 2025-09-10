package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.FormEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for FormEntity
 */
@Repository
public interface FormRepository extends JpaRepository<FormEntity, Long> {
    
    /**
     * Find forms by study ID
     * 
     * @param studyId Study ID
     * @return List of forms for the given study
     */
    List<FormEntity> findByStudyId(Long studyId);
    
    /**
     * Find active forms by study ID
     * 
     * @param studyId Study ID
     * @return List of active forms for the given study
     */
    List<FormEntity> findByStudyIdAndIsActiveTrue(Long studyId);
}
