package com.clinprecision.studydesignservice.service;


import com.clinprecision.common.dto.studydesign.VisitDefinitionDto;
import com.clinprecision.common.entity.studydesign.VisitDefinitionEntity;
import com.clinprecision.studydesignservice.repository.VisitDefinitionRepository;
import com.clinprecision.studydesignservice.repository.VisitFormRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing visit definitions in clinical studies
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VisitDefinitionService {

    private final VisitDefinitionRepository visitDefinitionRepository;
    private final VisitFormRepository visitFormRepository;

    /**
     * Get all visits for a study
     */
    @Transactional(readOnly = true)
    public List<VisitDefinitionDto> getVisitsByStudyId(Long studyId) {
        log.debug("Fetching visits for study ID: {}", studyId);
        
        List<VisitDefinitionEntity> visits = visitDefinitionRepository
                .findByStudyIdOrderBySequenceNumberAsc(studyId);
        
        return visits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get visits for a specific study arm
     */
    @Transactional(readOnly = true)
    public List<VisitDefinitionDto> getVisitsByStudyIdAndArm(Long studyId, Long armId) {
        log.debug("Fetching visits for study ID: {} and arm ID: {}", studyId, armId);
        
        List<VisitDefinitionEntity> visits = armId != null 
                ? visitDefinitionRepository.findByStudyIdAndArmIdOrderBySequenceNumberAsc(studyId, armId)
                : visitDefinitionRepository.findByStudyIdAndArmIdIsNullOrderBySequenceNumberAsc(studyId);
        
        return visits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific visit by ID
     */
    @Transactional(readOnly = true)
    public VisitDefinitionDto getVisitById(Long visitId) {
        log.debug("Fetching visit with ID: {}", visitId);
        
        VisitDefinitionEntity visit = visitDefinitionRepository.findById(visitId)
                .orElseThrow(() -> new EntityNotFoundException("Visit not found with ID: " + visitId));
        
        return convertToDto(visit);
    }

    /**
     * Create a new visit
     */
    public VisitDefinitionDto createVisit(VisitDefinitionDto visitDto) {
        log.info("Creating new visit: {} for study: {}", visitDto.getName(), visitDto.getStudyId());
        
        // Validate unique name within study
        if (visitDefinitionRepository.existsByStudyIdAndNameIgnoreCase(
                visitDto.getStudyId(), visitDto.getName())) {
            throw new IllegalArgumentException("Visit name '" + visitDto.getName() + 
                    "' already exists in this study");
        }
        
        // Auto-assign sequence number if not provided
        if (visitDto.getSequenceNumber() == null) {
            Integer maxSequence = visitDefinitionRepository.getMaxSequenceNumberByStudyId(visitDto.getStudyId());
            visitDto.setSequenceNumber(maxSequence + 1);
        }
        
        VisitDefinitionEntity entity = convertToEntity(visitDto);
        VisitDefinitionEntity savedEntity = visitDefinitionRepository.save(entity);
        
        log.info("Created visit with ID: {}", savedEntity.getId());
        return convertToDto(savedEntity);
    }

    /**
     * Update an existing visit
     */
    public VisitDefinitionDto updateVisit(Long visitId, VisitDefinitionDto visitDto) {
        log.info("Updating visit with ID: {}", visitId);
        
        VisitDefinitionEntity existingVisit = visitDefinitionRepository.findById(visitId)
                .orElseThrow(() -> new EntityNotFoundException("Visit not found with ID: " + visitId));
        
        // Validate unique name within study (excluding current visit)
        if (!existingVisit.getName().equalsIgnoreCase(visitDto.getName()) &&
            visitDefinitionRepository.existsByStudyIdAndNameIgnoreCaseExcludingId(
                    visitDto.getStudyId(), visitDto.getName(), visitId)) {
            throw new IllegalArgumentException("Visit name '" + visitDto.getName() + 
                    "' already exists in this study");
        }
        
        // Update fields
        existingVisit.setName(visitDto.getName());
        existingVisit.setDescription(visitDto.getDescription());
        existingVisit.setTimepoint(visitDto.getTimepoint());
        existingVisit.setWindowBefore(visitDto.getWindowBefore());
        existingVisit.setWindowAfter(visitDto.getWindowAfter());
        existingVisit.setVisitType(visitDto.getVisitType());
        existingVisit.setIsRequired(visitDto.getIsRequired());
        existingVisit.setArmId(visitDto.getArmId());
        
        if (visitDto.getSequenceNumber() != null) {
            existingVisit.setSequenceNumber(visitDto.getSequenceNumber());
        }
        
        VisitDefinitionEntity savedEntity = visitDefinitionRepository.save(existingVisit);
        
        log.info("Updated visit with ID: {}", savedEntity.getId());
        return convertToDto(savedEntity);
    }

    /**
     * Delete a visit
     */
    public void deleteVisit(Long visitId) {
        log.info("Deleting visit with ID: {}", visitId);
        
        VisitDefinitionEntity visit = visitDefinitionRepository.findById(visitId)
                .orElseThrow(() -> new EntityNotFoundException("Visit not found with ID: " + visitId));
        
        // Check if visit has associated forms
        long formCount = visitFormRepository.countByVisitDefinitionId(visitId);
        if (formCount > 0) {
            log.warn("Deleting visit with {} associated forms", formCount);
            // Forms will be cascade deleted due to relationship configuration
        }
        
        visitDefinitionRepository.delete(visit);
        log.info("Deleted visit with ID: {}", visitId);
    }

    /**
     * Get visits by type for a study
     */
    @Transactional(readOnly = true)
    public List<VisitDefinitionDto> getVisitsByType(Long studyId, VisitDefinitionEntity.VisitType visitType) {
        log.debug("Fetching visits of type {} for study ID: {}", visitType, studyId);
        
        List<VisitDefinitionEntity> visits = visitDefinitionRepository
                .findByStudyIdAndVisitTypeOrderByTimepointAsc(studyId, visitType);
        
        return visits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Reorder visits within a study
     */
    public void reorderVisits(Long studyId, List<Long> visitIds) {
        log.info("Reordering {} visits for study ID: {}", visitIds.size(), studyId);
        
        for (int i = 0; i < visitIds.size(); i++) {
            Long visitId = visitIds.get(i);
            VisitDefinitionEntity visit = visitDefinitionRepository.findById(visitId)
                    .orElseThrow(() -> new EntityNotFoundException("Visit not found with ID: " + visitId));
            
            if (!visit.getStudyId().equals(studyId)) {
                throw new IllegalArgumentException("Visit " + visitId + " does not belong to study " + studyId);
            }
            
            visit.setSequenceNumber(i + 1);
            visitDefinitionRepository.save(visit);
        }
        
        log.info("Successfully reordered visits for study ID: {}", studyId);
    }

    /**
     * Convert entity to DTO
     */
    private VisitDefinitionDto convertToDto(VisitDefinitionEntity entity) {
        return VisitDefinitionDto.builder()
                .id(entity.getId())
                .studyId(entity.getStudyId())
                .armId(entity.getArmId())
                .name(entity.getName())
                .description(entity.getDescription())
                .timepoint(entity.getTimepoint())
                .windowBefore(entity.getWindowBefore())
                .windowAfter(entity.getWindowAfter())
                .visitType(entity.getVisitType())
                .isRequired(entity.getIsRequired())
                .sequenceNumber(entity.getSequenceNumber())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Convert DTO to entity
     */
    private VisitDefinitionEntity convertToEntity(VisitDefinitionDto dto) {
        return VisitDefinitionEntity.builder()
                .studyId(dto.getStudyId())
                .armId(dto.getArmId())
                .name(dto.getName())
                .description(dto.getDescription())
                .timepoint(dto.getTimepoint())
                .windowBefore(dto.getWindowBefore())
                .windowAfter(dto.getWindowAfter())
                .visitType(dto.getVisitType())
                .isRequired(dto.getIsRequired())
                .sequenceNumber(dto.getSequenceNumber())
                .build();
    }
}