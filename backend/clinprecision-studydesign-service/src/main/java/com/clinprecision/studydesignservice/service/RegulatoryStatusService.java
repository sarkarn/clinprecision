package com.clinprecision.studydesignservice.service;


import com.clinprecision.common.dto.studydesign.RegulatoryStatusDto;
import com.clinprecision.common.entity.studydesign.RegulatoryStatusEntity;
import com.clinprecision.studydesignservice.repository.RegulatoryStatusRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for regulatory status lookup operations
 * Provides methods to access regulatory status reference data
 */
@Service
@Transactional(readOnly = true)
public class RegulatoryStatusService {
    
    private static final Logger logger = LoggerFactory.getLogger(RegulatoryStatusService.class);
    
    private final RegulatoryStatusRepository regulatoryStatusRepository;
    
    public RegulatoryStatusService(RegulatoryStatusRepository regulatoryStatusRepository) {
        this.regulatoryStatusRepository = regulatoryStatusRepository;
    }
    
    /**
     * Get all active regulatory statuses for dropdown lists
     */
    public List<RegulatoryStatusDto> getAllActiveStatuses() {
        logger.debug("Fetching all active regulatory statuses");
        
        List<RegulatoryStatusEntity> entities = regulatoryStatusRepository.findAllActiveOrderByDisplayOrder();
        List<RegulatoryStatusDto> dtos = entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        
        logger.debug("Found {} active regulatory statuses", dtos.size());
        return dtos;
    }
    
    /**
     * Get regulatory status by ID
     */
    public Optional<RegulatoryStatusDto> getById(Long id) {
        logger.debug("Fetching regulatory status by ID: {}", id);
        return regulatoryStatusRepository.findById(id)
                .map(this::toDto);
    }
    
    /**
     * Get regulatory status by code (case insensitive)
     */
    public Optional<RegulatoryStatusDto> getByCode(String code) {
        logger.debug("Fetching regulatory status by code: {}", code);
        return regulatoryStatusRepository.findByCodeIgnoreCase(code)
                .map(this::toDto);
    }
    
    /**
     * Get regulatory statuses by category
     */
    public List<RegulatoryStatusDto> getByCategory(RegulatoryStatusEntity.RegulatoryCategory category) {
        logger.debug("Fetching regulatory statuses by category: {}", category);
        
        List<RegulatoryStatusEntity> entities = regulatoryStatusRepository.findByCategoryOrderByDisplayOrder(category);
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get regulatory statuses that allow enrollment
     */
    public List<RegulatoryStatusDto> getStatusesAllowingEnrollment() {
        logger.debug("Fetching regulatory statuses that allow enrollment");
        
        List<RegulatoryStatusEntity> entities = regulatoryStatusRepository.findAllowsEnrollment();
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get approved regulatory statuses
     */
    public List<RegulatoryStatusDto> getApprovedStatuses() {
        logger.debug("Fetching approved regulatory statuses");
        
        List<RegulatoryStatusEntity> entities = regulatoryStatusRepository.findApprovedStatuses();
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get default "Not Applicable" status for new studies
     */
    public Optional<RegulatoryStatusEntity> getDefaultNotApplicableStatus() {
        logger.debug("Fetching default not applicable status");
        return regulatoryStatusRepository.findNotApplicableStatus();
    }
    
    /**
     * Find status entity by ID (for internal service use)
     */
    public Optional<RegulatoryStatusEntity> findEntityById(Long id) {
        return regulatoryStatusRepository.findById(id);
    }
    
    /**
     * Find status entity by code (for internal service use)
     */
    public Optional<RegulatoryStatusEntity> findEntityByCode(String code) {
        return regulatoryStatusRepository.findByCodeIgnoreCase(code);
    }
    
    /**
     * Convert entity to DTO
     */
    private RegulatoryStatusDto toDto(RegulatoryStatusEntity entity) {
        RegulatoryStatusDto dto = new RegulatoryStatusDto();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setDisplayOrder(entity.getDisplayOrder());
        dto.setIsActive(entity.getIsActive());
        dto.setRequiresDocumentation(entity.getRequiresDocumentation());
        dto.setAllowsEnrollment(entity.getAllowsEnrollment());
        dto.setRegulatoryCategory(entity.getRegulatoryCategory() != null ? 
                entity.getRegulatoryCategory().name() : null);
        return dto;
    }
}