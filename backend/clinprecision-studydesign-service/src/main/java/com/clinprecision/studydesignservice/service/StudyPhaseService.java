package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.dto.StudyPhaseDto;
import com.clinprecision.studydesignservice.entity.StudyPhaseEntity;
import com.clinprecision.studydesignservice.repository.StudyPhaseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for study phase lookup operations
 * Provides methods to access study phase reference data
 */
@Service
@Transactional(readOnly = true)
public class StudyPhaseService {
    
    private static final Logger logger = LoggerFactory.getLogger(StudyPhaseService.class);
    
    private final StudyPhaseRepository studyPhaseRepository;
    
    public StudyPhaseService(StudyPhaseRepository studyPhaseRepository) {
        this.studyPhaseRepository = studyPhaseRepository;
    }
    
    /**
     * Get all active study phases for dropdown lists
     */
    public List<StudyPhaseDto> getAllActivePhases() {
        logger.debug("Fetching all active study phases");
        
        List<StudyPhaseEntity> entities = studyPhaseRepository.findAllActiveOrderByDisplayOrder();
        List<StudyPhaseDto> dtos = entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        
        logger.debug("Found {} active study phases", dtos.size());
        return dtos;
    }
    
    /**
     * Get study phase by ID
     */
    public Optional<StudyPhaseDto> getById(Long id) {
        logger.debug("Fetching study phase by ID: {}", id);
        return studyPhaseRepository.findById(id)
                .map(this::toDto);
    }
    
    /**
     * Get study phase by code (case insensitive)
     */
    public Optional<StudyPhaseDto> getByCode(String code) {
        logger.debug("Fetching study phase by code: {}", code);
        return studyPhaseRepository.findByCodeIgnoreCase(code)
                .map(this::toDto);
    }
    
    /**
     * Get study phases by category
     */
    public List<StudyPhaseDto> getByCategory(StudyPhaseEntity.PhaseCategory category) {
        logger.debug("Fetching study phases by category: {}", category);
        
        List<StudyPhaseEntity> entities = studyPhaseRepository.findByCategoryOrderByDisplayOrder(category);
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get early phase studies (Phase 0, I, I/II)
     */
    public List<StudyPhaseDto> getEarlyPhases() {
        logger.debug("Fetching early phase studies");
        
        List<StudyPhaseEntity> entities = studyPhaseRepository.findEarlyPhases();
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get efficacy phases (Phase II, IIa, IIb, II/III)
     */
    public List<StudyPhaseDto> getEfficacyPhases() {
        logger.debug("Fetching efficacy phase studies");
        
        List<StudyPhaseEntity> entities = studyPhaseRepository.findEfficacyPhases();
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get registration phases (Phase III, IIIa, IIIb)
     */
    public List<StudyPhaseDto> getRegistrationPhases() {
        logger.debug("Fetching registration phase studies");
        
        List<StudyPhaseEntity> entities = studyPhaseRepository.findRegistrationPhases();
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get phases that require IND
     */
    public List<StudyPhaseDto> getPhasesRequiringInd() {
        logger.debug("Fetching phases that require IND");
        
        List<StudyPhaseEntity> entities = studyPhaseRepository.findRequiresInd();
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get phases that require IDE
     */
    public List<StudyPhaseDto> getPhasesRequiringIde() {
        logger.debug("Fetching phases that require IDE");
        
        List<StudyPhaseEntity> entities = studyPhaseRepository.findRequiresIde();
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Find phase entity by ID (for internal service use)
     */
    public Optional<StudyPhaseEntity> findEntityById(Long id) {
        return studyPhaseRepository.findById(id);
    }
    
    /**
     * Find phase entity by code (for internal service use)
     */
    public Optional<StudyPhaseEntity> findEntityByCode(String code) {
        return studyPhaseRepository.findByCodeIgnoreCase(code);
    }
    
    /**
     * Convert entity to DTO
     */
    private StudyPhaseDto toDto(StudyPhaseEntity entity) {
        StudyPhaseDto dto = new StudyPhaseDto();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setDisplayOrder(entity.getDisplayOrder());
        dto.setIsActive(entity.getIsActive());
        dto.setTypicalDurationMonths(entity.getTypicalDurationMonths());
        dto.setTypicalPatientCountMin(entity.getTypicalPatientCountMin());
        dto.setTypicalPatientCountMax(entity.getTypicalPatientCountMax());
        dto.setPhaseCategory(entity.getPhaseCategory() != null ? 
                entity.getPhaseCategory().name() : null);
        dto.setRequiresIde(entity.getRequiresIde());
        dto.setRequiresInd(entity.getRequiresInd());
        return dto;
    }
}