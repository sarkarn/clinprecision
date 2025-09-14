package com.clinprecision.adminservice.service.impl;

import com.clinprecision.adminservice.data.entity.FormTemplateEntity;
import com.clinprecision.adminservice.data.entity.FormTemplateEntity.FormTemplateStatus;
import com.clinprecision.adminservice.data.entity.FormTemplateVersionEntity;
import com.clinprecision.adminservice.repository.FormTemplateRepository;
import com.clinprecision.adminservice.repository.FormTemplateVersionRepository;
import com.clinprecision.adminservice.service.FormTemplateService;
import com.clinprecision.adminservice.ui.model.*;
import com.clinprecision.common.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implementation of FormTemplateService
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FormTemplateServiceImpl implements FormTemplateService {
    
    private final FormTemplateRepository formTemplateRepository;
    private final FormTemplateVersionRepository formTemplateVersionRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<FormTemplateDto> getAllFormTemplates() {
        log.debug("Fetching all form templates");
        return formTemplateRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<FormTemplateDto> getAllFormTemplates(Pageable pageable) {
        log.debug("Fetching all form templates with pagination: {}", pageable);
        return formTemplateRepository.findAll(pageable)
                .map(this::convertToDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<FormTemplateDto> getFormTemplateById(Long id) {
        log.debug("Fetching form template by ID: {}", id);
        return formTemplateRepository.findById(id)
                .map(this::convertToDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<FormTemplateDto> getFormTemplateByTemplateId(String templateId) {
        log.debug("Fetching form template by template ID: {}", templateId);
        return formTemplateRepository.findByTemplateId(templateId)
                .map(this::convertToDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FormTemplateDto> getFormTemplatesByStatus(String status) {
        log.debug("Fetching form templates by status: {}", status);
        FormTemplateStatus templateStatus = FormTemplateStatus.valueOf(status.toLowerCase());
        return formTemplateRepository.findByStatus(templateStatus).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FormTemplateDto> getFormTemplatesByCategory(String category) {
        log.debug("Fetching form templates by category: {}", category);
        return formTemplateRepository.findByCategory(category).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FormTemplateDto> searchFormTemplatesByName(String name) {
        log.debug("Searching form templates by name: {}", name);
        return formTemplateRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<FormTemplateDto> searchFormTemplatesByTag(String tag) {
        log.debug("Searching form templates by tag: {}", tag);
        return formTemplateRepository.findByTagsContainingIgnoreCase(tag).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public FormTemplateDto createFormTemplate(CreateFormTemplateDto createDto, Long createdBy) {
        log.debug("Creating new form template: {}", createDto.getName());
        
        // Check if template ID already exists
        if (formTemplateRepository.existsByTemplateId(createDto.getTemplateId())) {
            throw new IllegalArgumentException("Template ID already exists: " + createDto.getTemplateId());
        }
        
        FormTemplateEntity entity = new FormTemplateEntity();
        entity.setTemplateId(createDto.getTemplateId());
        entity.setName(createDto.getName());
        entity.setDescription(createDto.getDescription());
        entity.setCategory(createDto.getCategory());
        entity.setVersion(createDto.getVersion());
        entity.setStatus(FormTemplateStatus.valueOf(createDto.getStatus().toLowerCase()));
        entity.setFields(createDto.getFields());
        entity.setTags(createDto.getTags());
        
        if (createdBy != null) {
            UserEntity user = new UserEntity();
            user.setId(createdBy);
            entity.setCreatedBy(user);
        }
        
        FormTemplateEntity savedEntity = formTemplateRepository.save(entity);
        
        // Create initial version
        createVersionSnapshot(savedEntity, createDto.getVersion(), "Initial version", createdBy);
        
        log.info("Created form template with ID: {} and template ID: {}", savedEntity.getId(), savedEntity.getTemplateId());
        return convertToDto(savedEntity);
    }
    
    @Override
    public FormTemplateDto updateFormTemplate(Long id, UpdateFormTemplateDto updateDto, Long updatedBy) {
        log.debug("Updating form template with ID: {}", id);
        
        FormTemplateEntity entity = formTemplateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Form template not found with ID: " + id));
        
        entity.setName(updateDto.getName());
        entity.setDescription(updateDto.getDescription());
        entity.setCategory(updateDto.getCategory());
        entity.setFields(updateDto.getFields());
        entity.setTags(updateDto.getTags());
        
        FormTemplateEntity savedEntity = formTemplateRepository.save(entity);
        
        log.info("Updated form template with ID: {}", savedEntity.getId());
        return convertToDto(savedEntity);
    }
    
    @Override
    public void deleteFormTemplate(Long id) {
        log.debug("Deleting form template with ID: {}", id);
        
        if (!formTemplateRepository.existsById(id)) {
            throw new IllegalArgumentException("Form template not found with ID: " + id);
        }
        
        formTemplateRepository.deleteById(id);
        log.info("Deleted form template with ID: {}", id);
    }
    
    @Override
    public FormTemplateDto activateFormTemplate(Long id, Long updatedBy) {
        log.debug("Activating form template with ID: {}", id);
        return updateTemplateStatus(id, FormTemplateStatus.published);
    }
    
    @Override
    public FormTemplateDto deactivateFormTemplate(Long id, Long updatedBy) {
        log.debug("Deactivating form template with ID: {}", id);
        return updateTemplateStatus(id, FormTemplateStatus.draft);
    }
    
    @Override
    public FormTemplateDto archiveFormTemplate(Long id, Long updatedBy) {
        log.debug("Archiving form template with ID: {}", id);
        return updateTemplateStatus(id, FormTemplateStatus.archived);
    }
    
    @Override
    public FormTemplateDto createNewVersion(Long id, String versionNotes, Long createdBy) {
        log.debug("Creating new version for form template with ID: {}", id);
        
        FormTemplateEntity entity = formTemplateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Form template not found with ID: " + id));
        
        // Generate new version number (simple increment for now)
        String currentVersion = entity.getVersion();
        String newVersion = generateNextVersion(currentVersion);
        
        entity.setVersion(newVersion);
        FormTemplateEntity savedEntity = formTemplateRepository.save(entity);
        
        // Create version snapshot
        createVersionSnapshot(savedEntity, newVersion, versionNotes, createdBy);
        
        log.info("Created new version {} for form template with ID: {}", newVersion, savedEntity.getId());
        return convertToDto(savedEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Integer getTemplateUsageCount(Long id) {
        log.debug("Getting usage count for form template with ID: {}", id);
        
        FormTemplateEntity entity = formTemplateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Form template not found with ID: " + id));
        
        return entity.getUsageCount();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<String> getAvailableCategories() {
        log.debug("Fetching available categories");
        return formTemplateRepository.findDistinctCategories();
    }
    
    @Override
    @Transactional(readOnly = true)
    public FormTemplateStatsDto getTemplateStatistics() {
        log.debug("Fetching form template statistics");
        
        Long totalTemplates = formTemplateRepository.count();
        Long draftTemplates = formTemplateRepository.countByStatus(FormTemplateStatus.draft);
        Long publishedTemplates = formTemplateRepository.countByStatus(FormTemplateStatus.published);
        Long archivedTemplates = formTemplateRepository.countByStatus(FormTemplateStatus.archived);
        Long totalUsageCount = formTemplateRepository.getTotalUsageCount();
        
        return new FormTemplateStatsDto(totalTemplates, draftTemplates, publishedTemplates, archivedTemplates, totalUsageCount);
    }
    
    // Helper methods
    
    private FormTemplateDto convertToDto(FormTemplateEntity entity) {
        FormTemplateDto dto = new FormTemplateDto();
        dto.setId(entity.getId());
        dto.setTemplateId(entity.getTemplateId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setCategory(entity.getCategory());
        dto.setVersion(entity.getVersion());
        dto.setIsLatestVersion(entity.getIsLatestVersion());
        dto.setStatus(entity.getStatus().name());
        dto.setFields(entity.getFields());
        dto.setTags(entity.getTags());
        dto.setUsageCount(entity.getUsageCount());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        if (entity.getCreatedBy() != null) {
            dto.setCreatedBy(entity.getCreatedBy().getId());
            dto.setCreatedByName(entity.getCreatedBy().getFirstName() + " " + entity.getCreatedBy().getLastName());
        }
        
        return dto;
    }
    
    private FormTemplateDto updateTemplateStatus(Long id, FormTemplateStatus status) {
        FormTemplateEntity entity = formTemplateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Form template not found with ID: " + id));
        
        entity.setStatus(status);
        FormTemplateEntity savedEntity = formTemplateRepository.save(entity);
        
        log.info("Updated status of form template with ID: {} to {}", savedEntity.getId(), status);
        return convertToDto(savedEntity);
    }
    
    private void createVersionSnapshot(FormTemplateEntity template, String version, String versionNotes, Long createdBy) {
        FormTemplateVersionEntity versionEntity = new FormTemplateVersionEntity();
        versionEntity.setTemplate(template);
        versionEntity.setVersion(version);
        versionEntity.setVersionNotes(versionNotes);
        versionEntity.setFieldsSnapshot(template.getFields());
        
        if (createdBy != null) {
            UserEntity user = new UserEntity();
            user.setId(createdBy);
            versionEntity.setCreatedBy(user);
        }
        
        formTemplateVersionRepository.save(versionEntity);
    }
    
    private String generateNextVersion(String currentVersion) {
        try {
            String[] parts = currentVersion.split("\\.");
            if (parts.length >= 2) {
                int major = Integer.parseInt(parts[0]);
                int minor = Integer.parseInt(parts[1]);
                return major + "." + (minor + 1);
            } else {
                return "1.1";
            }
        } catch (NumberFormatException e) {
            return "1.1";
        }
    }
}