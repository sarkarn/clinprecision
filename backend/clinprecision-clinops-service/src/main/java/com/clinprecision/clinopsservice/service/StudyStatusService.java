package com.clinprecision.clinopsservice.service;



import com.clinprecision.clinopsservice.repository.StudyStatusRepository;
import com.clinprecision.common.dto.clinops.StudyStatusDto;
import com.clinprecision.common.entity.clinops.StudyStatusEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for study status lookup operations
 * Provides methods to access study status reference data
 */
@Service
@Transactional(readOnly = true)
public class StudyStatusService {
    
    private static final Logger logger = LoggerFactory.getLogger(StudyStatusService.class);
    
    private final StudyStatusRepository studyStatusRepository;
    
    public StudyStatusService(StudyStatusRepository studyStatusRepository) {
        this.studyStatusRepository = studyStatusRepository;
    }
    
    /**
     * Get all active study statuses for dropdown lists
     */
    public List<StudyStatusDto> getAllActiveStatuses() {
        logger.debug("Fetching all active study statuses");
        
        List<StudyStatusEntity> entities = studyStatusRepository.findAllActiveOrderByDisplayOrder();
        List<StudyStatusDto> dtos = entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        
        logger.debug("Found {} active study statuses", dtos.size());
        return dtos;
    }
    
    /**
     * Get study status by ID
     */
    public Optional<StudyStatusDto> getById(Long id) {
        logger.debug("Fetching study status by ID: {}", id);
        return studyStatusRepository.findById(id)
                .map(this::toDto);
    }
    
    /**
     * Get study status by code (case insensitive)
     */
    public Optional<StudyStatusDto> getByCode(String code) {
        logger.debug("Fetching study status by code: {}", code);
        return studyStatusRepository.findByCodeIgnoreCase(code)
                .map(this::toDto);
    }
    
    /**
     * Get study statuses that allow modification
     */
    public List<StudyStatusDto> getStatusesAllowingModification() {
        logger.debug("Fetching study statuses that allow modification");
        
        List<StudyStatusEntity> entities = studyStatusRepository.findAllowsModification();
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get final/terminal statuses
     */
    public List<StudyStatusDto> getFinalStatuses() {
        logger.debug("Fetching final study statuses");
        
        List<StudyStatusEntity> entities = studyStatusRepository.findFinalStatuses();
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get default draft status for new studies
     */
    public Optional<StudyStatusEntity> getDefaultDraftStatus() {
        logger.debug("Fetching default draft status");
        return studyStatusRepository.findDraftStatus();
    }
    
    /**
     * Find status entity by ID (for internal service use)
     */
    public Optional<StudyStatusEntity> findEntityById(Long id) {
        return studyStatusRepository.findById(id);
    }
    
    /**
     * Find status entity by code (for internal service use)
     */
    public Optional<StudyStatusEntity> findEntityByCode(String code) {
        return studyStatusRepository.findByCodeIgnoreCase(code);
    }
    
    /**
     * Convert entity to DTO
     */
    private StudyStatusDto toDto(StudyStatusEntity entity) {
        StudyStatusDto dto = new StudyStatusDto();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setDisplayOrder(entity.getDisplayOrder());
        dto.setIsActive(entity.getIsActive());
        dto.setAllowsModification(entity.getAllowsModification());
        dto.setIsFinalStatus(entity.getIsFinalStatus());
        return dto;
    }
}
