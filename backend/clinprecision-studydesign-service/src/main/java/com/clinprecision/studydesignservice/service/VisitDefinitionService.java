package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.dto.VisitDefinitionDto;
import com.clinprecision.studydesignservice.entity.StudyArmEntity;
import com.clinprecision.studydesignservice.entity.StudyEntity;
import com.clinprecision.studydesignservice.entity.VisitDefinitionEntity;
import com.clinprecision.studydesignservice.exception.ResourceNotFoundException;
import com.clinprecision.studydesignservice.mapper.VisitDefinitionMapper;
import com.clinprecision.studydesignservice.repository.StudyArmRepository;
import com.clinprecision.studydesignservice.repository.StudyRepository;
import com.clinprecision.studydesignservice.repository.VisitDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing visit definitions
 */
@Service
@RequiredArgsConstructor
public class VisitDefinitionService {
    
    private final VisitDefinitionRepository visitDefinitionRepository;
    private final StudyRepository studyRepository;
    private final StudyArmRepository studyArmRepository;
    private final LockingService lockingService;
    private final VisitDefinitionMapper visitDefinitionMapper;
    
    /**
     * Get all visit definitions
     * 
     * @return List of all visit definitions
     */
    public List<VisitDefinitionDto> getAllVisitDefinitions() {
        return visitDefinitionRepository.findAll().stream()
                .map(visitDefinitionMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get visit definitions by study ID
     * 
     * @param studyId Study ID
     * @return List of visit definitions for the given study
     */
    public List<VisitDefinitionDto> getVisitDefinitionsByStudy(Long studyId) {
        return visitDefinitionRepository.findByStudyId(studyId).stream()
                .map(visitDefinitionMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get visit definitions by study arm ID
     * 
     * @param armId Study arm ID
     * @return List of visit definitions for the given study arm
     */
    public List<VisitDefinitionDto> getVisitDefinitionsByArm(Long armId) {
        return visitDefinitionRepository.findByArmId(armId).stream()
                .map(visitDefinitionMapper::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get visit definition by ID
     * 
     * @param id Visit definition ID
     * @return Visit definition DTO
     */
    public VisitDefinitionDto getVisitDefinitionById(Long id) {
        VisitDefinitionEntity visitDefinition = visitDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit definition not found with id: " + id));
        
        return visitDefinitionMapper.toDto(visitDefinition);
    }
    
    /**
     * Create a new visit definition
     * 
     * @param visitDefinitionDto Visit definition DTO
     * @param userId User ID of the creator
     * @return Created visit definition DTO
     */
    @Transactional
    public VisitDefinitionDto createVisitDefinition(VisitDefinitionDto visitDefinitionDto, Long userId) {
        // Validate study exists
        StudyEntity study = studyRepository.findById(visitDefinitionDto.getStudyId())
                .orElseThrow(() -> new ResourceNotFoundException("Study not found with id: " + visitDefinitionDto.getStudyId()));
        
        // Check if study is locked
        if (lockingService != null) {
            lockingService.ensureStudyNotLocked(study.getId());
        }
        
        // Validate arm exists if provided
        if (visitDefinitionDto.getArmId() != null) {
            StudyArmEntity arm = studyArmRepository.findById(visitDefinitionDto.getArmId())
                    .orElseThrow(() -> new ResourceNotFoundException("Study arm not found with id: " + visitDefinitionDto.getArmId()));
            
            // Ensure arm belongs to the study
            if (!arm.getStudy().getId().equals(study.getId())) {
                throw new IllegalArgumentException("Study arm does not belong to the specified study");
            }
        }
        
        VisitDefinitionEntity visitDefinition = visitDefinitionMapper.toEntity(visitDefinitionDto);
        visitDefinition.setCreatedBy(userId);
        visitDefinition.setCreatedAt(LocalDateTime.now());
        visitDefinition.setUpdatedAt(LocalDateTime.now());
        visitDefinition.setActive(true);
        
        VisitDefinitionEntity savedVisitDefinition = visitDefinitionRepository.save(visitDefinition);
        return visitDefinitionMapper.toDto(savedVisitDefinition);
    }
    
    /**
     * Update an existing visit definition
     * 
     * @param id Visit definition ID
     * @param visitDefinitionDto Visit definition DTO
     * @param userId User ID of the updater
     * @return Updated visit definition DTO
     */
    @Transactional
    public VisitDefinitionDto updateVisitDefinition(Long id, VisitDefinitionDto visitDefinitionDto, Long userId) {
        VisitDefinitionEntity visitDefinition = visitDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit definition not found with id: " + id));
        
        // Check if study is locked
        if (lockingService != null && visitDefinition.getStudy() != null) {
            lockingService.ensureStudyNotLocked(visitDefinition.getStudy().getId());
        }
        
        // Validate arm exists if provided
        if (visitDefinitionDto.getArmId() != null) {
            StudyArmEntity arm = studyArmRepository.findById(visitDefinitionDto.getArmId())
                    .orElseThrow(() -> new ResourceNotFoundException("Study arm not found with id: " + visitDefinitionDto.getArmId()));
            
            // Ensure arm belongs to the study
            if (!arm.getStudy().getId().equals(visitDefinitionDto.getStudyId())) {
                throw new IllegalArgumentException("Study arm does not belong to the specified study");
            }
        }
        
        visitDefinitionMapper.updateEntityFromDto(visitDefinitionDto, visitDefinition);
        visitDefinition.setUpdatedAt(LocalDateTime.now());
        
        VisitDefinitionEntity savedVisitDefinition = visitDefinitionRepository.save(visitDefinition);
        return visitDefinitionMapper.toDto(savedVisitDefinition);
    }
    
    /**
     * Delete a visit definition
     * 
     * @param id Visit definition ID
     */
    @Transactional
    public void deleteVisitDefinition(Long id) {
        VisitDefinitionEntity visitDefinition = visitDefinitionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit definition not found with id: " + id));
        
        // Check if study is locked
        if (lockingService != null && visitDefinition.getStudy() != null) {
            lockingService.ensureStudyNotLocked(visitDefinition.getStudy().getId());
        }
        
        // Soft delete (deactivate) instead of hard delete
        visitDefinition.setActive(false);
        visitDefinition.setUpdatedAt(LocalDateTime.now());
        visitDefinitionRepository.save(visitDefinition);
    }
}
