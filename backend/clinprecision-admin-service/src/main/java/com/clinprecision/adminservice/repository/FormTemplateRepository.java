package com.clinprecision.adminservice.repository;

import com.clinprecision.adminservice.data.entity.FormTemplateEntity;
import com.clinprecision.adminservice.data.entity.FormTemplateEntity.FormTemplateStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for FormTemplateEntity
 */
@Repository
public interface FormTemplateRepository extends JpaRepository<FormTemplateEntity, Long> {
    
    /**
     * Find a template by its unique template ID
     */
    Optional<FormTemplateEntity> findByTemplateId(String templateId);
    
    /**
     * Find templates by status
     */
    List<FormTemplateEntity> findByStatus(FormTemplateStatus status);
    
    /**
     * Find templates by status with pagination
     */
    Page<FormTemplateEntity> findByStatus(FormTemplateStatus status, Pageable pageable);
    
    /**
     * Find templates by category
     */
    List<FormTemplateEntity> findByCategory(String category);
    
    /**
     * Find templates by category with pagination
     */
    Page<FormTemplateEntity> findByCategory(String category, Pageable pageable);
    
    /**
     * Search templates by name containing keyword (case insensitive)
     */
    @Query("SELECT t FROM FormTemplateEntity t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<FormTemplateEntity> findByNameContainingIgnoreCase(@Param("name") String name);
    
    /**
     * Search templates by tags containing keyword (case insensitive)
     */
    @Query("SELECT t FROM FormTemplateEntity t WHERE LOWER(t.tags) LIKE LOWER(CONCAT('%', :tag, '%'))")
    List<FormTemplateEntity> findByTagsContainingIgnoreCase(@Param("tag") String tag);
    
    /**
     * Get templates ordered by usage count descending
     */
    List<FormTemplateEntity> findAllByOrderByUsageCountDesc();
    
    /**
     * Get distinct categories
     */
    @Query("SELECT DISTINCT t.category FROM FormTemplateEntity t WHERE t.category IS NOT NULL ORDER BY t.category")
    List<String> findDistinctCategories();
    
    /**
     * Get template statistics
     */
    @Query("SELECT COUNT(t) FROM FormTemplateEntity t WHERE t.status = :status")
    Long countByStatus(@Param("status") FormTemplateStatus status);
    
    /**
     * Get total usage count
     */
    @Query("SELECT COALESCE(SUM(t.usageCount), 0) FROM FormTemplateEntity t")
    Long getTotalUsageCount();
    
    /**
     * Check if template ID exists
     */
    boolean existsByTemplateId(String templateId);
    
    /**
     * Find templates with pagination and sorting
     */
    Page<FormTemplateEntity> findAll(Pageable pageable);
}