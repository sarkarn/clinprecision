package com.clinprecision.adminservice.service;

import com.clinprecision.adminservice.data.entity.FormTemplateEntity.FormTemplateStatus;
import com.clinprecision.adminservice.ui.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for form template management
 */
public interface FormTemplateService {
    
    /**
     * Get all form templates
     */
    List<FormTemplateDto> getAllFormTemplates();
    
    /**
     * Get form templates with pagination
     */
    Page<FormTemplateDto> getAllFormTemplates(Pageable pageable);
    
    /**
     * Get form template by ID
     */
    Optional<FormTemplateDto> getFormTemplateById(Long id);
    
    /**
     * Get form template by template ID
     */
    Optional<FormTemplateDto> getFormTemplateByTemplateId(String templateId);
    
    /**
     * Get form templates by status
     */
    List<FormTemplateDto> getFormTemplatesByStatus(String status);
    
    /**
     * Get form templates by category
     */
    List<FormTemplateDto> getFormTemplatesByCategory(String category);
    
    /**
     * Search form templates by name
     */
    List<FormTemplateDto> searchFormTemplatesByName(String name);
    
    /**
     * Search form templates by tags
     */
    List<FormTemplateDto> searchFormTemplatesByTag(String tag);
    
    /**
     * Create a new form template
     */
    FormTemplateDto createFormTemplate(CreateFormTemplateDto createDto, Long createdBy);
    
    /**
     * Update an existing form template
     */
    FormTemplateDto updateFormTemplate(Long id, UpdateFormTemplateDto updateDto, Long updatedBy);
    
    /**
     * Delete a form template
     */
    void deleteFormTemplate(Long id);
    
    /**
     * Activate a form template
     */
    FormTemplateDto activateFormTemplate(Long id, Long updatedBy);
    
    /**
     * Deactivate a form template
     */
    FormTemplateDto deactivateFormTemplate(Long id, Long updatedBy);
    
    /**
     * Archive a form template
     */
    FormTemplateDto archiveFormTemplate(Long id, Long updatedBy);
    
    /**
     * Create a new version of a form template
     */
    FormTemplateDto createNewVersion(Long id, String versionNotes, Long createdBy);
    
    /**
     * Get usage count for a form template
     */
    Integer getTemplateUsageCount(Long id);
    
    /**
     * Get available categories
     */
    List<String> getAvailableCategories();
    
    /**
     * Get form template statistics
     */
    FormTemplateStatsDto getTemplateStatistics();
}