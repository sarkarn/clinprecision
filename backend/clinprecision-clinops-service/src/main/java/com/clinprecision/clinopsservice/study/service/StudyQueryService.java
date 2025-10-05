package com.clinprecision.clinopsservice.study.service;

import com.clinprecision.clinopsservice.study.dto.response.StudyListResponseDto;
import com.clinprecision.clinopsservice.study.dto.response.StudyResponseDto;
import com.clinprecision.clinopsservice.study.mapper.StudyResponseMapper;
import com.clinprecision.clinopsservice.repository.StudyRepository;
import com.clinprecision.common.entity.clinops.StudyEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Study Query Service - Handles DDD Read Operations
 * 
 * This service orchestrates read operations for the Study projection using CQRS pattern.
 * It queries the read model (StudyEntity) and converts to response DTOs.
 * 
 * Architecture:
 * - Queries are executed against read model (StudyRepository)
 * - Entities are mapped to DTOs by StudyResponseMapper
 * - Read model is eventually consistent with write model
 * 
 * Thread Safety: Service methods are read-only and thread-safe
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StudyQueryService {
    
    private final StudyRepository studyRepository;
    private final StudyResponseMapper responseMapper;
    
    /**
     * Get study by aggregate UUID (DDD identifier)
     * This is the primary query method for DDD architecture
     * 
     * @param studyUuid Aggregate UUID of the study
     * @return StudyResponseDto with full study details
     * @throws StudyNotFoundException if study not found
     */
    public StudyResponseDto getStudyByUuid(UUID studyUuid) {
        log.debug("Querying study by UUID: {}", studyUuid);
        
        StudyEntity entity = studyRepository.findByAggregateUuid(studyUuid)
                .orElseThrow(() -> {
                    log.error("Study not found with UUID: {}", studyUuid);
                    return new StudyNotFoundException("Study not found with UUID: " + studyUuid);
                });
        
        log.debug("Found study: {} (ID: {})", entity.getName(), entity.getId());
        return responseMapper.toResponseDto(entity);
    }
    
    /**
     * Get study by legacy ID (backward compatibility)
     * Bridge method to support existing APIs during migration
     * 
     * @param id Legacy database ID
     * @return StudyResponseDto with full study details
     * @throws StudyNotFoundException if study not found
     */
    public StudyResponseDto getStudyById(Long id) {
        log.debug("Querying study by legacy ID: {}", id);
        
        StudyEntity entity = studyRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Study not found with ID: {}", id);
                    return new StudyNotFoundException("Study not found with ID: " + id);
                });
        
        log.debug("Found study: {} (UUID: {})", entity.getName(), entity.getAggregateUuid());
        return responseMapper.toResponseDto(entity);
    }
    
    /**
     * Get all studies
     * Returns summary view for list display
     * 
     * @return List of StudyListResponseDto
     */
    public List<StudyListResponseDto> getAllStudies() {
        log.debug("Querying all studies");
        
        List<StudyEntity> entities = studyRepository.findAll();
        
        log.debug("Found {} studies", entities.size());
        
        return entities.stream()
                .map(responseMapper::toListDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get studies by organization ID
     * 
     * @param organizationId Organization ID to filter by
     * @return List of StudyListResponseDto
     */
    public List<StudyListResponseDto> getStudiesByOrganization(Long organizationId) {
        log.debug("Querying studies for organization: {}", organizationId);
        
        // TODO: Add findByOrganizationId method to repository
        // List<StudyEntity> entities = studyRepository.findByOrganizationId(organizationId);
        
        // Temporary: Return all studies
        List<StudyEntity> entities = studyRepository.findAll();
        
        log.debug("Found {} studies for organization {}", entities.size(), organizationId);
        
        return entities.stream()
                .map(responseMapper::toListDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Check if study exists by UUID
     * Useful for validation before executing commands
     * 
     * @param studyUuid Aggregate UUID of the study
     * @return true if study exists, false otherwise
     */
    public boolean existsByUuid(UUID studyUuid) {
        boolean exists = studyRepository.findByAggregateUuid(studyUuid).isPresent();
        log.debug("Study existence check for UUID {}: {}", studyUuid, exists);
        return exists;
    }
    
    /**
     * Check if study exists by legacy ID
     * Bridge method for backward compatibility
     * 
     * @param id Legacy database ID
     * @return true if study exists, false otherwise
     */
    public boolean existsById(Long id) {
        boolean exists = studyRepository.existsById(id);
        log.debug("Study existence check for ID {}: {}", id, exists);
        return exists;
    }
    
    /**
     * Get study count
     * 
     * @return Total number of studies
     */
    public long getStudyCount() {
        long count = studyRepository.count();
        log.debug("Total study count: {}", count);
        return count;
    }
}

/**
 * Custom exception for study not found scenarios
 */
class StudyNotFoundException extends RuntimeException {
    public StudyNotFoundException(String message) {
        super(message);
    }
}
