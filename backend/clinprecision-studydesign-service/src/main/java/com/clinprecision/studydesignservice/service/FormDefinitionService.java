package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.dto.FormDefinitionCreateRequestDto;
import com.clinprecision.studydesignservice.dto.FormDefinitionDto;
import com.clinprecision.studydesignservice.entity.FormDefinitionEntity;
import com.clinprecision.studydesignservice.exception.EntityNotFoundException;
import com.clinprecision.studydesignservice.exception.DuplicateEntityException;
import com.clinprecision.studydesignservice.exception.EntityLockedException;
import com.clinprecision.studydesignservice.mapper.FormDefinitionMapper;
import com.clinprecision.studydesignservice.repository.FormDefinitionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for Form Definition operations
 * Handles business logic for form definition management with updated schema
 */
@Service
public class FormDefinitionService {
    
    private static final Logger logger = LoggerFactory.getLogger(FormDefinitionService.class);
    
    private final FormDefinitionRepository formDefinitionRepository;
    private final FormDefinitionMapper formDefinitionMapper;
    private final FormTemplateService formTemplateService;
    
    @Autowired
    public FormDefinitionService(FormDefinitionRepository formDefinitionRepository,
                                FormDefinitionMapper formDefinitionMapper,
                                FormTemplateService formTemplateService) {
        this.formDefinitionRepository = formDefinitionRepository;
        this.formDefinitionMapper = formDefinitionMapper;
        this.formTemplateService = formTemplateService;
    }
    
    /**
     * Create a new form definition
     */
    @Transactional
    public FormDefinitionDto createFormDefinition(FormDefinitionCreateRequestDto requestDto) {
        logger.info("FormDefinitionService.createFormDefinition() called");
        logger.info("Creating form for studyId={}, name='{}', formType='{}'", 
                   requestDto.getStudyId(), requestDto.getName(), requestDto.getFormType());
        
        try {
            // Check if form name already exists within the study
            logger.debug("Checking if form name already exists in study...");
            if (formDefinitionRepository.existsByStudyIdAndName(requestDto.getStudyId(), requestDto.getName())) {
                logger.warn("Form with name '{}' already exists in study ID: {}", requestDto.getName(), requestDto.getStudyId());
                throw new DuplicateEntityException("Form with name '" + requestDto.getName() + 
                                                 "' already exists in study ID: " + requestDto.getStudyId());
            }
            
            // Convert DTO to entity
            logger.debug("Converting DTO to entity...");
            FormDefinitionEntity entity = formDefinitionMapper.toEntity(requestDto);
            logger.debug("Entity created: id={}, studyId={}, name='{}'", entity.getId(), entity.getStudyId(), entity.getName());
            
            // If based on a template, increment template usage count
            if (entity.getTemplateId() != null) {
                logger.debug("Form is based on template ID: {}, incrementing usage count", entity.getTemplateId());
                formTemplateService.incrementTemplateUsage(entity.getTemplateId());
            }
            
            // Save entity
            logger.debug("Saving form definition entity to database...");
            FormDefinitionEntity savedEntity = formDefinitionRepository.save(entity);
            logger.info("Form definition saved with ID: {}", savedEntity.getId());
            
            // Convert back to DTO and return
            logger.debug("Converting saved entity back to DTO...");
            FormDefinitionDto result = formDefinitionMapper.toDto(savedEntity);
            logger.info("Form definition creation completed successfully. Returning form with ID: {}", result.getId());
            
            return result;
            
        } catch (Exception e) {
            logger.error("Error in FormDefinitionService.createFormDefinition(): {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Get all form definitions for a study
     */
    public List<FormDefinitionDto> getFormDefinitionsByStudyId(Long studyId) {
        return formDefinitionRepository.findByStudyIdWithTemplate(studyId)
                .stream()
                .map(formDefinitionMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get form definitions by study ID and status
     */
    public List<FormDefinitionDto> getFormDefinitionsByStudyIdAndStatus(Long studyId, FormDefinitionEntity.FormStatus status) {
        return formDefinitionRepository.findByStudyIdAndStatus(studyId, status)
                .stream()
                .map(formDefinitionMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get form definition by ID
     */
    public FormDefinitionDto getFormDefinitionById(Long id) {
        FormDefinitionEntity entity = formDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form definition not found with ID: " + id));
        
        return formDefinitionMapper.toDto(entity);
    }
    
    /**
     * Get form definitions using a specific template
     */
    public List<FormDefinitionDto> getFormDefinitionsByTemplateId(Long templateId) {
        return formDefinitionRepository.findByTemplateId(templateId)
                .stream()
                .map(formDefinitionMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Search form definitions by name within a study
     */
    public List<FormDefinitionDto> searchFormDefinitionsByName(Long studyId, String name) {
        return formDefinitionRepository.findByStudyIdAndNameContainingIgnoreCase(studyId, name)
                .stream()
                .map(formDefinitionMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Search form definitions by tags within a study
     */
    public List<FormDefinitionDto> searchFormDefinitionsByTag(Long studyId, String tag) {
        return formDefinitionRepository.findByStudyIdAndTagsContaining(studyId, tag)
                .stream()
                .map(formDefinitionMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get form definitions by form type within a study
     */
    public List<FormDefinitionDto> getFormDefinitionsByFormType(Long studyId, String formType) {
        return formDefinitionRepository.findByStudyIdAndFormType(studyId, formType)
                .stream()
                .map(formDefinitionMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Update form definition
     */
    @Transactional
    public FormDefinitionDto updateFormDefinition(Long id, FormDefinitionCreateRequestDto requestDto) {
        FormDefinitionEntity existingEntity = formDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form definition not found with ID: " + id));
        
        // Check if form is locked
        if (existingEntity.getIsLocked()) {
            throw new EntityLockedException("Form definition is locked and cannot be updated");
        }
        
        // Check if name conflicts with another form in the same study (if name changed)
        if (!existingEntity.getName().equals(requestDto.getName()) &&
            formDefinitionRepository.existsByStudyIdAndName(requestDto.getStudyId(), requestDto.getName())) {
            throw new DuplicateEntityException("Form with name '" + requestDto.getName() + 
                                             "' already exists in study ID: " + requestDto.getStudyId());
        }
        
        // Update entity fields
        formDefinitionMapper.updateEntityFromDto(requestDto, existingEntity);
        
        // Save updated entity
        FormDefinitionEntity savedEntity = formDefinitionRepository.save(existingEntity);
        
        return formDefinitionMapper.toDto(savedEntity);
    }
    
    /**
     * Delete form definition
     */
    @Transactional
    public void deleteFormDefinition(Long id) {
        FormDefinitionEntity entity = formDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form definition not found with ID: " + id));
        
        // Check if form is locked
        if (entity.getIsLocked()) {
            throw new EntityLockedException("Form definition is locked and cannot be deleted");
        }
        
        formDefinitionRepository.deleteById(id);
    }
    
    /**
     * Lock form definition
     */
    @Transactional
    public FormDefinitionDto lockFormDefinition(Long id) {
        FormDefinitionEntity entity = formDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form definition not found with ID: " + id));
        
        entity.setIsLocked(true);
        FormDefinitionEntity savedEntity = formDefinitionRepository.save(entity);
        
        return formDefinitionMapper.toDto(savedEntity);
    }
    
    /**
     * Unlock form definition
     */
    @Transactional
    public FormDefinitionDto unlockFormDefinition(Long id) {
        FormDefinitionEntity entity = formDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form definition not found with ID: " + id));
        
        entity.setIsLocked(false);
        FormDefinitionEntity savedEntity = formDefinitionRepository.save(entity);
        
        return formDefinitionMapper.toDto(savedEntity);
    }
    
    /**
     * Approve form definition
     */
    @Transactional
    public FormDefinitionDto approveFormDefinition(Long id) {
        FormDefinitionEntity entity = formDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form definition not found with ID: " + id));
        
        entity.setStatus(FormDefinitionEntity.FormStatus.APPROVED);
        FormDefinitionEntity savedEntity = formDefinitionRepository.save(entity);
        
        return formDefinitionMapper.toDto(savedEntity);
    }
    
    /**
     * Retire form definition
     */
    @Transactional
    public FormDefinitionDto retireFormDefinition(Long id) {
        FormDefinitionEntity entity = formDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form definition not found with ID: " + id));
        
        entity.setStatus(FormDefinitionEntity.FormStatus.RETIRED);
        FormDefinitionEntity savedEntity = formDefinitionRepository.save(entity);
        
        return formDefinitionMapper.toDto(savedEntity);
    }
    
    /**
     * Create form definition from template
     */
    @Transactional
    public FormDefinitionDto createFormDefinitionFromTemplate(Long studyId, Long templateId, String formName) {
        // Get the template
        var template = formTemplateService.getFormTemplateById(templateId);
        
        // Check if form name already exists within the study
        if (formDefinitionRepository.existsByStudyIdAndName(studyId, formName)) {
            throw new DuplicateEntityException("Form with name '" + formName + 
                                             "' already exists in study ID: " + studyId);
        }
        
        // Create form definition from template
        FormDefinitionCreateRequestDto requestDto = new FormDefinitionCreateRequestDto();
        requestDto.setStudyId(studyId);
        requestDto.setName(formName);
        requestDto.setDescription(template.getDescription());
        requestDto.setFormType(template.getCategory());
        requestDto.setTemplateId(templateId);
        requestDto.setTemplateVersion(template.getVersion());
        requestDto.setTags(template.getTags());
        requestDto.setFields(template.getFields());
        requestDto.setStructure(template.getStructure()); // Add structure from template
        
        return createFormDefinition(requestDto);
    }
    
    /**
     * Get form definitions that need template updates
     */
    public List<FormDefinitionDto> getFormDefinitionsWithOutdatedTemplates() {
        return formDefinitionRepository.findFormDefinitionsWithOutdatedTemplates()
                .stream()
                .map(formDefinitionMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get statistics
     */
    public long getFormDefinitionCountByStudy(Long studyId) {
        return formDefinitionRepository.countByStudyId(studyId);
    }
    
    public long getFormDefinitionCountByStatus(Long studyId, FormDefinitionEntity.FormStatus status) {
        return formDefinitionRepository.countByStudyIdAndStatus(studyId, status);
    }
    
    public long getTemplateUsageCount(Long templateId) {
        return formDefinitionRepository.countByTemplateId(templateId);
    }
}