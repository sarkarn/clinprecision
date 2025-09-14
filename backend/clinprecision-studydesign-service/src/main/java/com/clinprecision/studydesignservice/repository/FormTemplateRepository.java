package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.FormTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for FormTemplateEntity
 * Provides database operations for form templates
 */
@Repository
public interface FormTemplateRepository extends JpaRepository<FormTemplateEntity, Long> {
    
    /**
     * Find form template by template ID
     */
    Optional<FormTemplateEntity> findByTemplateId(String templateId);
    
    /**
     * Find form templates by category
     */
    List<FormTemplateEntity> findByCategory(String category);
    
    /**
     * Find form templates by status
     */
    List<FormTemplateEntity> findByStatus(FormTemplateEntity.TemplateStatus status);
    
    /**
     * Find published templates (commonly used ones)
     */
    List<FormTemplateEntity> findByStatusOrderByUsageCountDesc(FormTemplateEntity.TemplateStatus status);
    
    /**
     * Find latest version templates by category
     */
    List<FormTemplateEntity> findByCategoryAndIsLatestVersionTrue(String category);
    
    /**
     * Find templates by name containing (case-insensitive search)
     */
    @Query("SELECT f FROM FormTemplateEntity f WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<FormTemplateEntity> findByNameContainingIgnoreCase(@Param("name") String name);
    
    /**
     * Find templates by tags (search within tags field)
     */
    @Query("SELECT f FROM FormTemplateEntity f WHERE f.tags LIKE %:tag%")
    List<FormTemplateEntity> findByTagsContaining(@Param("tag") String tag);
    
    /**
     * Find all published templates with latest version
     */
    List<FormTemplateEntity> findByStatusAndIsLatestVersionTrueOrderByCategoryAscNameAsc(
        FormTemplateEntity.TemplateStatus status);
    
    /**
     * Check if template ID exists
     */
    boolean existsByTemplateId(String templateId);
    
    /**
     * Find templates created by specific user
     */
    List<FormTemplateEntity> findByCreatedByOrderByCreatedAtDesc(Long createdBy);
    
    /**
     * Count templates by category
     */
    long countByCategory(String category);
    
    /**
     * Count published templates
     */
    long countByStatus(FormTemplateEntity.TemplateStatus status);
}