package com.clinprecision.clinopsservice.service;


import com.clinprecision.common.dto.VisitFormDto;
import com.clinprecision.common.entity.clinops.FormDefinitionEntity;
import com.clinprecision.common.entity.clinops.VisitDefinitionEntity;
import com.clinprecision.clinopsservice.repository.VisitFormRepository;
import com.clinprecision.clinopsservice.repository.VisitDefinitionRepository;
import com.clinprecision.clinopsservice.repository.FormDefinitionRepository;
import com.clinprecision.common.entity.clinops.VisitFormEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing visit-form associations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VisitFormService {

    private final VisitFormRepository visitFormRepository;
    private final VisitDefinitionRepository visitDefinitionRepository;
    private final FormDefinitionRepository formDefinitionRepository;

    /**
     * Get all forms associated with a visit
     */
    @Transactional(readOnly = true)
    public List<VisitFormDto> getFormsByVisitId(Long visitId) {
        log.debug("Fetching forms for visit ID: {}", visitId);
        
        List<VisitFormEntity> visitForms = visitFormRepository
                .findByVisitDefinitionIdOrderByDisplayOrderAsc(visitId);
        
        return visitForms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all visits that use a specific form
     */
    @Transactional(readOnly = true)
    public List<VisitFormDto> getVisitsByFormId(Long formId) {
        log.debug("Fetching visits for form ID: {}", formId);
        
        List<VisitFormEntity> visitForms = visitFormRepository
                .findByFormDefinitionIdOrderByVisitDefinition_SequenceNumberAsc(formId);
        
        return visitForms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get visit-form matrix for a study (all associations)
     */
    @Transactional(readOnly = true)
    public List<VisitFormDto> getVisitFormMatrixByStudyId(Long studyId) {
        log.debug("Fetching visit-form matrix for study ID: {}", studyId);
        
        List<VisitFormEntity> visitForms = visitFormRepository
                .findVisitFormMatrixByStudyId(studyId);
        
        return visitForms.stream()
                .map(this::convertToDtoWithDetails)
                .collect(Collectors.toList());
    }

    /**
     * Create a new visit-form association
     */
    public VisitFormDto createVisitFormAssociation(VisitFormDto visitFormDto) {
        log.info("Creating visit-form association: visit {} - form {}", 
                visitFormDto.getVisitDefinitionId(), visitFormDto.getFormDefinitionId());
        
        // Check if association already exists
        if (visitFormRepository.existsByVisitDefinitionIdAndFormDefinitionId(
                visitFormDto.getVisitDefinitionId(), visitFormDto.getFormDefinitionId())) {
            throw new IllegalArgumentException("Form is already associated with this visit");
        }
        
        // Validate that visit and form exist
        VisitDefinitionEntity visit = visitDefinitionRepository.findById(visitFormDto.getVisitDefinitionId())
                .orElseThrow(() -> new EntityNotFoundException("Visit not found with ID: " + visitFormDto.getVisitDefinitionId()));
        
        FormDefinitionEntity form = formDefinitionRepository.findById(visitFormDto.getFormDefinitionId())
                .orElseThrow(() -> new EntityNotFoundException("Form not found with ID: " + visitFormDto.getFormDefinitionId()));
        
        // Auto-assign display order if not provided
        if (visitFormDto.getDisplayOrder() == null || visitFormDto.getDisplayOrder() <= 0) {
            Integer maxOrder = visitFormRepository.getMaxDisplayOrderByVisitId(visitFormDto.getVisitDefinitionId());
            visitFormDto.setDisplayOrder(maxOrder + 1);
        }
        
        VisitFormEntity entity = convertToEntity(visitFormDto);
        entity.setVisitDefinition(visit);
        entity.setFormDefinition(form);
        
        VisitFormEntity savedEntity = visitFormRepository.save(entity);
        
        log.info("Created visit-form association with ID: {}", savedEntity.getId());
        return convertToDto(savedEntity);
    }

    /**
     * Update an existing visit-form association
     */
    public VisitFormDto updateVisitFormAssociation(Long associationId, VisitFormDto visitFormDto) {
        log.info("Updating visit-form association with ID: {}", associationId);
        
        VisitFormEntity existingAssociation = visitFormRepository.findById(associationId)
                .orElseThrow(() -> new EntityNotFoundException("Visit-form association not found with ID: " + associationId));
        
        // Update fields
        existingAssociation.setIsRequired(visitFormDto.getIsRequired());
        existingAssociation.setIsConditional(visitFormDto.getIsConditional());
        existingAssociation.setConditionalLogic(visitFormDto.getConditionalLogic());
        existingAssociation.setDisplayOrder(visitFormDto.getDisplayOrder());
        existingAssociation.setInstructions(visitFormDto.getInstructions());
        
        VisitFormEntity savedEntity = visitFormRepository.save(existingAssociation);
        
        log.info("Updated visit-form association with ID: {}", savedEntity.getId());
        return convertToDto(savedEntity);
    }

    /**
     * Delete a visit-form association
     */
    public void deleteVisitFormAssociation(Long associationId) {
        log.info("Deleting visit-form association with ID: {}", associationId);
        
        VisitFormEntity association = visitFormRepository.findById(associationId)
                .orElseThrow(() -> new EntityNotFoundException("Visit-form association not found with ID: " + associationId));
        
        visitFormRepository.delete(association);
        log.info("Deleted visit-form association with ID: {}", associationId);
    }

    /**
     * Delete association by visit and form IDs
     */
    public void deleteVisitFormAssociation(Long visitId, Long formId) {
        log.info("Deleting visit-form association: visit {} - form {}", visitId, formId);
        
        VisitFormEntity association = visitFormRepository.findByVisitDefinitionIdAndFormDefinitionId(visitId, formId)
                .orElseThrow(() -> new EntityNotFoundException("Visit-form association not found for visit " + visitId + " and form " + formId));
        
        visitFormRepository.delete(association);
        log.info("Deleted visit-form association: visit {} - form {}", visitId, formId);
    }

    /**
     * Reorder forms within a visit
     */
    public void reorderFormsInVisit(Long visitId, List<Long> formIds) {
        log.info("Reordering {} forms in visit ID: {}", formIds.size(), visitId);
        
        for (int i = 0; i < formIds.size(); i++) {
            Long formId = formIds.get(i);
            VisitFormEntity association = visitFormRepository.findByVisitDefinitionIdAndFormDefinitionId(visitId, formId)
                    .orElseThrow(() -> new EntityNotFoundException("Visit-form association not found for visit " + visitId + " and form " + formId));
            
            association.setDisplayOrder(i + 1);
            visitFormRepository.save(association);
        }
        
        log.info("Successfully reordered forms in visit ID: {}", visitId);
    }

    /**
     * Get required forms for a visit
     */
    @Transactional(readOnly = true)
    public List<VisitFormDto> getRequiredFormsByVisitId(Long visitId) {
        log.debug("Fetching required forms for visit ID: {}", visitId);
        
        List<VisitFormEntity> visitForms = visitFormRepository
                .findByVisitDefinitionIdAndIsRequiredTrueOrderByDisplayOrderAsc(visitId);
        
        return visitForms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get optional forms for a visit
     */
    @Transactional(readOnly = true)
    public List<VisitFormDto> getOptionalFormsByVisitId(Long visitId) {
        log.debug("Fetching optional forms for visit ID: {}", visitId);
        
        List<VisitFormEntity> visitForms = visitFormRepository
                .findByVisitDefinitionIdAndIsRequiredFalseOrderByDisplayOrderAsc(visitId);
        
        return visitForms.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get conditional forms for a study
     */
    @Transactional(readOnly = true)
    public List<VisitFormDto> getConditionalFormsByStudyId(Long studyId) {
        log.debug("Fetching conditional forms for study ID: {}", studyId);
        
        List<VisitFormEntity> visitForms = visitFormRepository
                .findConditionalFormsByStudyId(studyId);
        
        return visitForms.stream()
                .map(this::convertToDtoWithDetails)
                .collect(Collectors.toList());
    }

    /**
     * Convert entity to DTO
     */
    private VisitFormDto convertToDto(VisitFormEntity entity) {
        return VisitFormDto.builder()
                .id(entity.getId())
                .visitDefinitionId(entity.getVisitDefinition().getId())
                .formDefinitionId(entity.getFormDefinition().getId())
                .isRequired(entity.getIsRequired())
                .isConditional(entity.getIsConditional())
                .conditionalLogic(entity.getConditionalLogic())
                .displayOrder(entity.getDisplayOrder())
                .instructions(entity.getInstructions())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Convert entity to DTO with form and visit details
     */
    private VisitFormDto convertToDtoWithDetails(VisitFormEntity entity) {
        VisitFormDto dto = convertToDto(entity);
        
        // Add form details
        dto.setFormName(entity.getFormDefinition().getName());
        dto.setFormDescription(entity.getFormDefinition().getDescription());
        dto.setFormVersion(entity.getFormDefinition().getVersion());
        
        // Add visit details
        dto.setVisitName(entity.getVisitDefinition().getName());
        dto.setVisitTimepoint(entity.getVisitDefinition().getTimepoint());
        
        return dto;
    }

    /**
     * Convert DTO to entity
     */
    private VisitFormEntity convertToEntity(VisitFormDto dto) {
        return VisitFormEntity.builder()
                .isRequired(dto.getIsRequired())
                .isConditional(dto.getIsConditional())
                .conditionalLogic(dto.getConditionalLogic())
                .displayOrder(dto.getDisplayOrder())
                .instructions(dto.getInstructions())
                .build();
    }
}
