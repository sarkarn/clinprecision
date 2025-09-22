package com.clinprecision.adminservice.service;

import com.clinprecision.adminservice.repository.FormTemplateRepository;
import com.clinprecision.common.dto.FormTemplateCreateRequestDto;
import com.clinprecision.common.dto.FormTemplateDto;
import com.clinprecision.common.entity.FormTemplateEntity;
import com.clinprecision.common.exception.EntityNotFoundException;
import com.clinprecision.common.exception.DuplicateEntityException;
import com.clinprecision.common.mapper.FormTemplateMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for Form Template operations
 * Handles business logic for form template management
 */
@Service
public class FormTemplateService {
    
    private final FormTemplateRepository formTemplateRepository;
    private final FormTemplateMapper formTemplateMapper;
    
    @Autowired
    public FormTemplateService(FormTemplateRepository formTemplateRepository, 
                              FormTemplateMapper formTemplateMapper) {
        this.formTemplateRepository = formTemplateRepository;
        this.formTemplateMapper = formTemplateMapper;
    }
    
    /**
     * Create a new form template
     */
    @Transactional
    public FormTemplateDto createFormTemplate(FormTemplateCreateRequestDto requestDto) {
        // Check if template ID already exists
        if (formTemplateRepository.existsByTemplateId(requestDto.getTemplateId())) {
            throw new DuplicateEntityException("Form template with ID '" + requestDto.getTemplateId() + "' already exists");
        }
        
        // Convert DTO to entity
        FormTemplateEntity entity = formTemplateMapper.toEntity(requestDto);
        
        // Save entity
        FormTemplateEntity savedEntity = formTemplateRepository.save(entity);
        
        // Convert back to DTO and return
        return formTemplateMapper.toDto(savedEntity);
    }
    
    /**
     * Get all form templates
     */
    public List<FormTemplateDto> getAllFormTemplates() {
        return formTemplateRepository.findAll()
                .stream()
                .map(formTemplateMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get published form templates ordered by usage count
     */
    public List<FormTemplateDto> getPublishedFormTemplates() {
        return formTemplateRepository.findByStatusOrderByUsageCountDesc(FormTemplateEntity.TemplateStatus.PUBLISHED)
                .stream()
                .map(formTemplateMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get form templates by category
     */
    public List<FormTemplateDto> getFormTemplatesByCategory(String category) {
        return formTemplateRepository.findByCategoryAndIsLatestVersionTrue(category)
                .stream()
                .map(formTemplateMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get form template by ID
     */
    public FormTemplateDto getFormTemplateById(Long id) {
        FormTemplateEntity entity = formTemplateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form template not found with ID: " + id));
        
        return formTemplateMapper.toDto(entity);
    }
    

    /**
     * Search form templates by name
     */
    public List<FormTemplateDto> searchFormTemplatesByName(String name) {
        return formTemplateRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(formTemplateMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Search form templates by tags
     */
    public List<FormTemplateDto> searchFormTemplatesByTag(String tag) {
        return formTemplateRepository.findByTagsContaining(tag)
                .stream()
                .map(formTemplateMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Update form template
     */
    @Transactional
    public FormTemplateDto updateFormTemplate(Long id, FormTemplateCreateRequestDto requestDto) {
        FormTemplateEntity existingEntity = formTemplateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form template not found with ID: " + id));
        
        // Check if template ID conflicts with another template (if changed)
        if (!existingEntity.getTemplateId().equals(requestDto.getTemplateId()) &&
            formTemplateRepository.existsByTemplateId(requestDto.getTemplateId())) {
            throw new DuplicateEntityException("Form template with ID '" + requestDto.getTemplateId() + "' already exists");
        }
        
        // Update entity fields
        formTemplateMapper.updateEntityFromDto(requestDto, existingEntity);
        
        // Save updated entity
        FormTemplateEntity savedEntity = formTemplateRepository.save(existingEntity);
        
        return formTemplateMapper.toDto(savedEntity);
    }
    
    /**
     * Delete form template
     */
    @Transactional
    public void deleteFormTemplate(Long id) {
        if (!formTemplateRepository.existsById(id)) {
            throw new EntityNotFoundException("Form template not found with ID: " + id);
        }
        
        formTemplateRepository.deleteById(id);
    }
    
    /**
     * Publish form template (change status to published)
     */
    @Transactional
    public FormTemplateDto publishFormTemplate(Long id) {
        FormTemplateEntity entity = formTemplateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form template not found with ID: " + id));
        
        entity.setStatus(FormTemplateEntity.TemplateStatus.PUBLISHED);
        FormTemplateEntity savedEntity = formTemplateRepository.save(entity);
        
        return formTemplateMapper.toDto(savedEntity);
    }
    
    /**
     * Archive form template
     */
    @Transactional
    public FormTemplateDto archiveFormTemplate(Long id) {
        FormTemplateEntity entity = formTemplateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form template not found with ID: " + id));
        
        entity.setStatus(FormTemplateEntity.TemplateStatus.ARCHIVED);
        FormTemplateEntity savedEntity = formTemplateRepository.save(entity);
        
        return formTemplateMapper.toDto(savedEntity);
    }
    
    /**
     * Increment usage count for a template (called when template is used)
     */
    @Transactional
    public void incrementTemplateUsage(Long templateId) {
        FormTemplateEntity entity = formTemplateRepository.findById(templateId)
                .orElseThrow(() -> new EntityNotFoundException("Form template not found with ID: " + templateId));
        
        entity.incrementUsageCount();
        formTemplateRepository.save(entity);
    }
    
    /**
     * Get template statistics
     */
    public long getTemplateCountByCategory(String category) {
        return formTemplateRepository.countByCategory(category);
    }
    
    /**
     * Get published template count
     */
    public long getPublishedTemplateCount() {
        return formTemplateRepository.countByStatus(FormTemplateEntity.TemplateStatus.PUBLISHED);
    }
}