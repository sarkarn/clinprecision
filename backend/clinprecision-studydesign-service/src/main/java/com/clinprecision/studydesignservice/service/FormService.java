package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.dto.FormDto;
import com.clinprecision.studydesignservice.dto.FormVersionDto;
import com.clinprecision.studydesignservice.entity.FormEntity;
import com.clinprecision.studydesignservice.entity.FormVersionEntity;
import com.clinprecision.studydesignservice.entity.StudyEntity;
import com.clinprecision.studydesignservice.exception.EntityLockedException;
import com.clinprecision.studydesignservice.exception.ResourceNotFoundException;
import com.clinprecision.studydesignservice.mapper.FormMapper;
import com.clinprecision.studydesignservice.mapper.FormVersionMapper;
import com.clinprecision.studydesignservice.repository.FormRepository;
import com.clinprecision.studydesignservice.repository.FormVersionRepository;
import com.clinprecision.studydesignservice.repository.StudyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing forms and form versions
 */
@Service
@RequiredArgsConstructor
public class FormService {

    private final FormRepository formRepository;
    private final FormVersionRepository formVersionRepository;
    private final StudyRepository studyRepository;
    private final LockingService lockingService;
    private final FormMapper formMapper;
    private final FormVersionMapper formVersionMapper;

    /**
     * Get all forms
     * 
     * @return List of all forms
     */
    public List<FormDto> getAllForms() {
        return formRepository.findAll().stream()
                .map(formMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get forms by study ID
     * 
     * @param studyId Study ID
     * @return List of forms for the given study
     */
    public List<FormDto> getFormsByStudy(Long studyId) {
        return formRepository.findByStudyId(studyId).stream()
                .map(formMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get form by ID
     * 
     * @param id Form ID
     * @return Form DTO
     */
    public FormDto getFormById(Long id) {
        FormEntity form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + id));
        return formMapper.toDto(form);
    }

    /**
     * Create a new form
     * 
     * @param formDto Form DTO
     * @param userId User ID of the creator
     * @return Created form DTO
     */
    @Transactional
    public FormDto createForm(FormDto formDto, Long userId) {
        // Validate study exists
        if (formDto.getStudyId() != null) {
            studyRepository.findById(formDto.getStudyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Study not found with id: " + formDto.getStudyId()));
        }
        
        FormEntity form = formMapper.toEntity(formDto);
        form.setCreatedBy(userId);
        form.setCreatedAt(LocalDateTime.now());
        form.setUpdatedAt(LocalDateTime.now());
        form.setActive(true);
        
        // Default to draft status if not provided
        if (form.getStatus() == null) {
            form.setStatus("DRAFT");
        }
        
        FormEntity savedForm = formRepository.save(form);
        return formMapper.toDto(savedForm);
    }

    /**
     * Update an existing form
     * 
     * @param id Form ID
     * @param formDto Form DTO
     * @param userId User ID of the updater
     * @return Updated form DTO
     */
    @Transactional
    public FormDto updateForm(Long id, FormDto formDto, Long userId) {
        // Check if form is locked
        if (lockingService != null) {
            lockingService.ensureFormNotLocked(id.toString());
            
            // Also check if parent study is locked
            if (formDto.getStudyId() != null) {
                lockingService.ensureStudyNotLocked(formDto.getStudyId().toString());
            }
        }
        
        FormEntity form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + id));
        
        formMapper.updateEntityFromDto(formDto, form);
        form.setUpdatedAt(LocalDateTime.now());
        
        FormEntity savedForm = formRepository.save(form);
        return formMapper.toDto(savedForm);
    }

    /**
     * Delete a form
     * 
     * @param id Form ID
     */
    @Transactional
    public void deleteForm(Long id) {
        FormEntity form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + id));
        
        // Check if form is locked
        if (lockingService != null) {
            lockingService.ensureFormNotLocked(id.toString());
            
            // Also check if parent study is locked
            if (form.getStudy() != null) {
                lockingService.ensureStudyNotLocked(form.getStudy().getId().toString());
            }
        }
        
        // Soft delete (deactivate) instead of hard delete
        form.setActive(false);
        form.setUpdatedAt(LocalDateTime.now());
        formRepository.save(form);
    }

    /**
     * Publish a form (change status to PUBLISHED)
     * 
     * @param id Form ID
     * @param userId User ID of the publisher
     * @return Published form DTO
     */
    @Transactional
    public FormDto publishForm(Long id, Long userId) {
        FormEntity form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + id));
        
        // Check if form is locked
        if (lockingService != null) {
            lockingService.ensureFormNotLocked(id.toString());
            
            // Also check if parent study is locked
            if (form.getStudy() != null) {
                lockingService.ensureStudyNotLocked(form.getStudy().getId().toString());
            }
        }
        
        form.setStatus("PUBLISHED");
        form.setUpdatedAt(LocalDateTime.now());
        
        FormEntity savedForm = formRepository.save(form);
        return formMapper.toDto(savedForm);
    }

    /**
     * Get all versions of a form
     * 
     * @param formId Form ID
     * @return List of form versions
     */
    public List<FormVersionDto> getFormVersions(Long formId) {
        FormEntity form = formRepository.findById(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + formId));
        
        return form.getVersions().stream()
                .map(formVersionMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific version of a form
     * 
     * @param formId Form ID
     * @param versionId Version ID
     * @return Form version DTO
     */
    public FormVersionDto getFormVersion(Long formId, Long versionId) {
        FormVersionEntity version = formVersionRepository.findByIdAndFormId(versionId, formId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Form version not found with id: " + versionId + " for form: " + formId));
        
        return formVersionMapper.toDto(version);
    }

    /**
     * Create a new version of a form
     * 
     * @param formId Form ID
     * @param versionDto Form version DTO
     * @param userId User ID of the creator
     * @return Created form version DTO
     */
    @Transactional
    public FormVersionDto createFormVersion(Long formId, FormVersionDto versionDto, Long userId) {
        FormEntity form = formRepository.findById(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + formId));
        
        // Check if form is locked
        if (lockingService != null) {
            lockingService.ensureFormNotLocked(formId.toString());
            
            // Also check if parent study is locked
            if (form.getStudy() != null) {
                lockingService.ensureStudyNotLocked(form.getStudy().getId().toString());
            }
        }
        
        FormVersionEntity version = formVersionMapper.toEntity(versionDto);
        version.setForm(form);
        version.setCreatedBy(userId);
        version.setCreatedAt(LocalDateTime.now());
        version.setUpdatedAt(LocalDateTime.now());
        version.setActive(true);
        
        // Default to draft status if not provided
        if (version.getStatus() == null) {
            version.setStatus("DRAFT");
        }
        
        FormVersionEntity savedVersion = formVersionRepository.save(version);
        return formVersionMapper.toDto(savedVersion);
    }

    /**
     * Update a form version
     * 
     * @param formId Form ID
     * @param versionId Version ID
     * @param versionDto Form version DTO
     * @param userId User ID of the updater
     * @return Updated form version DTO
     */
    @Transactional
    public FormVersionDto updateFormVersion(Long formId, Long versionId, FormVersionDto versionDto, Long userId) {
        FormVersionEntity version = formVersionRepository.findByIdAndFormId(versionId, formId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Form version not found with id: " + versionId + " for form: " + formId));
        
        // Check if form is locked
        if (lockingService != null) {
            lockingService.ensureFormNotLocked(formId.toString());
            
            // Also check if parent study is locked
            if (version.getForm().getStudy() != null) {
                lockingService.ensureStudyNotLocked(version.getForm().getStudy().getId().toString());
            }
        }
        
        formVersionMapper.updateEntityFromDto(versionDto, version);
        version.setUpdatedAt(LocalDateTime.now());
        
        FormVersionEntity savedVersion = formVersionRepository.save(version);
        return formVersionMapper.toDto(savedVersion);
    }

    /**
     * Publish a form version
     * 
     * @param formId Form ID
     * @param versionId Version ID
     * @param userId User ID of the publisher
     * @return Published form version DTO
     */
    @Transactional
    public FormVersionDto publishFormVersion(Long formId, Long versionId, Long userId) {
        FormVersionEntity version = formVersionRepository.findByIdAndFormId(versionId, formId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Form version not found with id: " + versionId + " for form: " + formId));
        
        // Check if form is locked
        if (lockingService != null) {
            lockingService.ensureFormNotLocked(formId.toString());
            
            // Also check if parent study is locked
            if (version.getForm().getStudy() != null) {
                lockingService.ensureStudyNotLocked(version.getForm().getStudy().getId().toString());
            }
        }
        
        version.setPublished(true);
        version.setStatus("PUBLISHED");
        version.setUpdatedAt(LocalDateTime.now());
        
        FormVersionEntity savedVersion = formVersionRepository.save(version);
        return formVersionMapper.toDto(savedVersion);
    }
}
