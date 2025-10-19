package com.clinprecision.clinopsservice.studydesign.design.form.repository;



import com.clinprecision.clinopsservice.studydesign.design.form.entity.FormDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for FormDefinitionEntity
 * Provides database operations for form definitions
 */
@Repository
public interface FormDefinitionRepository extends JpaRepository<FormDefinitionEntity, Long> {
    
    /**
     * Find all form definitions for a specific study
     */
    List<FormDefinitionEntity> findByStudyId(Long studyId);
    
    /**
     * Find all form definitions for a study ordered by name
     */
    List<FormDefinitionEntity> findByStudyIdOrderByNameAsc(Long studyId);
    
    /**
     * Find form definitions by study ID and status
     */
    List<FormDefinitionEntity> findByStudyIdAndStatus(Long studyId, FormDefinitionEntity.FormStatus status);
    
    /**
     * Find form definitions based on a template
     */
    List<FormDefinitionEntity> findByTemplateId(Long templateId);
    
    /**
     * Find form definition by study ID and name
     */
    Optional<FormDefinitionEntity> findByStudyIdAndName(Long studyId, String name);
    
    /**
     * Find latest version form definitions for a study
     */
    List<FormDefinitionEntity> findByStudyIdAndIsLatestVersionTrue(Long studyId);
    
    /**
     * Find form definitions by form type
     */
    List<FormDefinitionEntity> findByStudyIdAndFormType(Long studyId, String formType);
    
    /**
     * Find unlocked form definitions for a study
     */
    List<FormDefinitionEntity> findByStudyIdAndIsLockedFalse(Long studyId);
    
    /**
     * Find form definitions by tags (search within tags field)
     */
    @Query("SELECT f FROM FormDefinitionEntity f WHERE f.studyId = :studyId AND f.tags LIKE %:tag%")
    List<FormDefinitionEntity> findByStudyIdAndTagsContaining(@Param("studyId") Long studyId, @Param("tag") String tag);
    
    /**
     * Find form definitions by name containing (case-insensitive search) within a study
     */
    @Query("SELECT f FROM FormDefinitionEntity f WHERE f.studyId = :studyId AND LOWER(f.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<FormDefinitionEntity> findByStudyIdAndNameContainingIgnoreCase(@Param("studyId") Long studyId, @Param("name") String name);
    
    /**
     * Check if form name exists within a study
     */
    boolean existsByStudyIdAndName(Long studyId, String name);
    
    /**
     * Count form definitions for a study
     */
    long countByStudyId(Long studyId);
    
    /**
     * Count form definitions by status for a study
     */
    long countByStudyIdAndStatus(Long studyId, FormDefinitionEntity.FormStatus status);
    
    /**
     * Count form definitions using a specific template
     */
    long countByTemplateId(Long templateId);
    
    /**
     * Find form definitions created by specific user
     */
    List<FormDefinitionEntity> findByCreatedByOrderByCreatedAtDesc(Long createdBy);
    
    /**
     * Find form definitions for a study with template information
     */
    @Query("SELECT f FROM FormDefinitionEntity f LEFT JOIN FETCH f.formTemplate WHERE f.studyId = :studyId ORDER BY f.name")
    List<FormDefinitionEntity> findByStudyIdWithTemplate(@Param("studyId") Long studyId);
    
    /**
     * Find form definitions by multiple study IDs (for bulk operations)
     */
    List<FormDefinitionEntity> findByStudyIdIn(List<Long> studyIds);
    
    /**
     * Find form definitions that need template updates (where template has newer version)
     */
    @Query("SELECT f FROM FormDefinitionEntity f JOIN FormTemplateEntity t ON f.templateId = t.id " +
           "WHERE f.templateVersion != t.version AND t.isLatestVersion = true")
    List<FormDefinitionEntity> findFormDefinitionsWithOutdatedTemplates();
}



