package com.clinprecision.adminservice.repository;

import com.clinprecision.adminservice.data.entity.FormTemplateVersionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for FormTemplateVersionEntity
 */
@Repository
public interface FormTemplateVersionRepository extends JpaRepository<FormTemplateVersionEntity, Long> {
    
    /**
     * Find versions by template ID ordered by version date descending
     */
    List<FormTemplateVersionEntity> findByTemplateIdOrderByVersionDateDesc(Long templateId);
    
    /**
     * Find a specific version of a template
     */
    Optional<FormTemplateVersionEntity> findByTemplateIdAndVersion(Long templateId, String version);
    
    /**
     * Get latest version number for a template
     */
    @Query("SELECT MAX(v.version) FROM FormTemplateVersionEntity v WHERE v.template.id = :templateId")
    Optional<String> findLatestVersionByTemplateId(@Param("templateId") Long templateId);
    
    /**
     * Count versions for a template
     */
    Long countByTemplateId(Long templateId);
    
    /**
     * Check if version exists for a template
     */
    boolean existsByTemplateIdAndVersion(Long templateId, String version);
}