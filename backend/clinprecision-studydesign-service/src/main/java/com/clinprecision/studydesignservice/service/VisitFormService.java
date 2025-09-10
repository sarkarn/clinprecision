package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.dto.VisitFormDto;
import com.clinprecision.studydesignservice.entity.FormEntity;
import com.clinprecision.studydesignservice.entity.FormVersionEntity;
import com.clinprecision.studydesignservice.entity.VisitDefinitionEntity;
import com.clinprecision.studydesignservice.entity.VisitFormEntity;
import com.clinprecision.studydesignservice.exception.ResourceNotFoundException;
import com.clinprecision.studydesignservice.mapper.VisitFormMapper;
import com.clinprecision.studydesignservice.repository.FormRepository;
import com.clinprecision.studydesignservice.repository.FormVersionRepository;
import com.clinprecision.studydesignservice.repository.VisitDefinitionRepository;
import com.clinprecision.studydesignservice.repository.VisitFormRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing visit form associations
 */
@Service
@RequiredArgsConstructor
public class VisitFormService {
    
    private final VisitFormRepository visitFormRepository;
    private final VisitDefinitionRepository visitDefinitionRepository;
    private final FormRepository formRepository;
    private final FormVersionRepository formVersionRepository;
    private final LockingService lockingService;
    private final VisitFormMapper visitFormMapper;
    
    /**
     * Get all visit form associations for a visit definition
     * 
     * @param visitDefinitionId Visit definition ID
     * @return List of visit form DTOs
     */
    public List<VisitFormDto> getVisitForms(Long visitDefinitionId) {
        VisitDefinitionEntity visitDefinition = visitDefinitionRepository.findById(visitDefinitionId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit definition not found with id: " + visitDefinitionId));
        
        return visitFormRepository.findByVisitDefinitionId(visitDefinitionId).stream()
                .map(visitFormMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a visit form association by ID
     * 
     * @param id Visit form ID
     * @return Visit form DTO
     */
    public VisitFormDto getVisitFormById(Long id) {
        VisitFormEntity visitForm = visitFormRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit form not found with id: " + id));
        
        return visitFormMapper.toDto(visitForm);
    }
    
    /**
     * Create a new visit form association
     * 
     * @param visitFormDto Visit form DTO
     * @param userId User ID of the creator
     * @return Created visit form DTO
     */
    @Transactional
    public VisitFormDto createVisitForm(VisitFormDto visitFormDto, Long userId) {
        // Validate visit definition exists
        VisitDefinitionEntity visitDefinition = visitDefinitionRepository.findById(visitFormDto.getVisitDefinitionId())
                .orElseThrow(() -> new ResourceNotFoundException("Visit definition not found with id: " + visitFormDto.getVisitDefinitionId()));
        
        // Validate form exists
        FormEntity form = formRepository.findById(visitFormDto.getFormId())
                .orElseThrow(() -> new ResourceNotFoundException("Form not found with id: " + visitFormDto.getFormId()));
        
        // Check if visit definition is locked
        if (lockingService != null && visitDefinition.getStudy() != null) {
            lockingService.ensureStudyNotLocked(visitDefinition.getStudy().getId());
        }
        
        VisitFormEntity visitForm = visitFormMapper.toEntity(visitFormDto);
        visitForm.setCreatedBy(userId);
        visitForm.setCreatedAt(LocalDateTime.now());
        visitForm.setUpdatedAt(LocalDateTime.now());
        visitForm.setActive(true);
        
        // Set the active form version if specified
        if (visitFormDto.getActiveFormVersion() != null && visitFormDto.getActiveFormVersion().getId() != null) {
            FormVersionEntity formVersion = formVersionRepository.findById(visitFormDto.getActiveFormVersion().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Form version not found with id: " + visitFormDto.getActiveFormVersion().getId()));
            
            visitForm.setActiveFormVersion(formVersion);
        }
        
        VisitFormEntity savedVisitForm = visitFormRepository.save(visitForm);
        return visitFormMapper.toDto(savedVisitForm);
    }
    
    /**
     * Update a visit form association
     * 
     * @param id Visit form ID
     * @param visitFormDto Visit form DTO
     * @param userId User ID of the updater
     * @return Updated visit form DTO
     */
    @Transactional
    public VisitFormDto updateVisitForm(Long id, VisitFormDto visitFormDto, Long userId) {
        VisitFormEntity visitForm = visitFormRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit form not found with id: " + id));
        
        // Check if visit definition is locked
        if (lockingService != null && visitForm.getVisitDefinition() != null && visitForm.getVisitDefinition().getStudy() != null) {
            lockingService.ensureStudyNotLocked(visitForm.getVisitDefinition().getStudy().getId());
        }
        
        visitFormMapper.updateEntityFromDto(visitFormDto, visitForm);
        visitForm.setUpdatedAt(LocalDateTime.now());
        
        // Update the active form version if specified
        if (visitFormDto.getActiveFormVersion() != null && visitFormDto.getActiveFormVersion().getId() != null) {
            FormVersionEntity formVersion = formVersionRepository.findById(visitFormDto.getActiveFormVersion().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Form version not found with id: " + visitFormDto.getActiveFormVersion().getId()));
            
            visitForm.setActiveFormVersion(formVersion);
        }
        
        VisitFormEntity savedVisitForm = visitFormRepository.save(visitForm);
        return visitFormMapper.toDto(savedVisitForm);
    }
    
    /**
     * Delete a visit form association
     * 
     * @param id Visit form ID
     */
    @Transactional
    public void deleteVisitForm(Long id) {
        VisitFormEntity visitForm = visitFormRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit form not found with id: " + id));
        
        // Check if visit definition is locked
        if (lockingService != null && visitForm.getVisitDefinition() != null && visitForm.getVisitDefinition().getStudy() != null) {
            lockingService.ensureStudyNotLocked(visitForm.getVisitDefinition().getStudy().getId());
        }
        
        // Soft delete (deactivate) instead of hard delete
        visitForm.setActive(false);
        visitForm.setUpdatedAt(LocalDateTime.now());
        visitFormRepository.save(visitForm);
    }
    
    /**
     * Set the active form version for a visit form
     * 
     * @param visitFormId Visit form ID
     * @param formVersionId Form version ID
     * @param userId User ID of the updater
     * @return Updated visit form DTO
     */
    @Transactional
    public VisitFormDto setActiveFormVersion(Long visitFormId, Long formVersionId, Long userId) {
        VisitFormEntity visitForm = visitFormRepository.findById(visitFormId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit form not found with id: " + visitFormId));
        
        // Check if visit definition is locked
        if (lockingService != null && visitForm.getVisitDefinition() != null && visitForm.getVisitDefinition().getStudy() != null) {
            lockingService.ensureStudyNotLocked(visitForm.getVisitDefinition().getStudy().getId());
        }
        
        FormVersionEntity formVersion = formVersionRepository.findById(formVersionId)
                .orElseThrow(() -> new ResourceNotFoundException("Form version not found with id: " + formVersionId));
        
        // Verify that the form version belongs to the correct form
        if (!formVersion.getForm().getId().equals(visitForm.getForm().getId())) {
            throw new IllegalArgumentException("Form version does not belong to the form associated with this visit form");
        }
        
        visitForm.setActiveFormVersion(formVersion);
        visitForm.setUpdatedAt(LocalDateTime.now());
        
        VisitFormEntity savedVisitForm = visitFormRepository.save(visitForm);
        return visitFormMapper.toDto(savedVisitForm);
    }
}
