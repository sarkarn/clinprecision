package com.clinprecision.clinopsservice.study.service;

import com.clinprecision.clinopsservice.entity.StudyArmEntity;
import com.clinprecision.clinopsservice.entity.StudyEntity;
import com.clinprecision.clinopsservice.entity.StudyInterventionEntity;
import com.clinprecision.clinopsservice.entity.StudyRandomizationStrategyEntity;
import com.clinprecision.clinopsservice.repository.StudyArmRepository;
import com.clinprecision.clinopsservice.repository.StudyRepository;
import com.clinprecision.clinopsservice.repository.StudyInterventionRepository;
import com.clinprecision.clinopsservice.repository.StudyRandomizationStrategyRepository;
import com.clinprecision.clinopsservice.study.dto.response.StudyArmResponseDto;
import com.clinprecision.clinopsservice.study.dto.response.StudyListResponseDto;
import com.clinprecision.clinopsservice.study.dto.response.StudyResponseDto;
import com.clinprecision.clinopsservice.study.dto.InterventionDto;
import com.clinprecision.clinopsservice.study.dto.RandomizationStrategyDto;
import com.clinprecision.clinopsservice.study.mapper.StudyResponseMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
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
    private final StudyArmRepository studyArmRepository;
    private final StudyInterventionRepository interventionRepository;
    private final StudyRandomizationStrategyRepository randomizationStrategyRepository;
    private final StudyResponseMapper responseMapper;
    @PersistenceContext
    private EntityManager entityManager;
    
    /**
     * Get study entity by aggregate UUID (for internal service use)
     * Used by validation services to access read model
     * 
     * @param studyUuid Aggregate UUID of the study
     * @return StudyEntity from read model
     * @throws StudyNotFoundException if study not found
     */
    public StudyEntity getStudyEntityByUuid(UUID studyUuid) {
        log.debug("Querying study entity by UUID: {}", studyUuid);

        if (entityManager != null) {
            entityManager.clear();
        }
        
        StudyEntity entity = studyRepository.findByAggregateUuid(studyUuid)
                .orElseThrow(() -> {
                    log.error("Study not found with UUID: {}", studyUuid);
                    return new StudyNotFoundException("Study not found with UUID: " + studyUuid);
                });
        
        log.debug("Found study entity: {} (ID: {})", entity.getName(), entity.getId());
        return entity;
    }

    /**
     * Attempt to find a study entity by aggregate UUID without throwing
     *
     * @param studyUuid Aggregate UUID
     * @return Optional StudyEntity
     */
    public Optional<StudyEntity> findStudyEntityByUuid(UUID studyUuid) {
        if (studyUuid == null) {
            return Optional.empty();
        }

        log.debug("Attempting to find study entity by UUID: {}", studyUuid);

        if (entityManager != null) {
            entityManager.clear();
        }

        return studyRepository.findByAggregateUuid(studyUuid)
                .map(entity -> {
                    log.debug("Found study entity by UUID {} (ID: {})", studyUuid, entity.getId());
                    return entity;
                });
    }
    
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
        
        StudyEntity entity = getStudyEntityByUuid(studyUuid);
        
        log.debug("Mapping study to DTO: {} (ID: {})", entity.getName(), entity.getId());
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
     * Attempt to find a study entity by legacy ID without throwing
     *
     * @param id Legacy numeric identifier
     * @return Optional StudyEntity
     */
    public Optional<StudyEntity> findStudyEntityById(Long id) {
        if (id == null) {
            return Optional.empty();
        }

        log.debug("Attempting to find study entity by legacy ID: {}", id);

        return studyRepository.findById(id)
                .map(entity -> {
                    log.debug("Found study entity by legacy ID {} (UUID: {})", id, entity.getAggregateUuid());
                    return entity;
                });
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
    
    /**
     * Get study arms by study UUID
     * 
     * @param studyUuid Aggregate UUID of the study
     * @return List of StudyArmResponseDto
     */
    public List<StudyArmResponseDto> getStudyArmsByUuid(UUID studyUuid) {
        log.debug("Querying study arms by study UUID: {}", studyUuid);
        
        // First get the study to get its numeric ID
        StudyEntity study = getStudyEntityByUuid(studyUuid);
        
        // Then query arms by numeric ID
        return getStudyArmsByStudyId(study.getId());
    }
    
    /**
     * Get study arms by legacy study ID
     * 
     * @param studyId Legacy study ID
     * @return List of StudyArmResponseDto
     */
    public List<StudyArmResponseDto> getStudyArmsByStudyId(Long studyId) {
        log.debug("Querying study arms by study ID: {}", studyId);
        
        List<StudyArmEntity> armEntities = studyArmRepository.findByStudyIdOrderBySequenceAsc(studyId);
        
        log.debug("Found {} study arms for study ID {}", armEntities.size(), studyId);
        
        return armEntities.stream()
                .map(this::toArmResponseDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Map StudyArmEntity to StudyArmResponseDto
     * Simple mapping function (can be moved to mapper class later)
     */
    public StudyArmResponseDto toArmResponseDto(StudyArmEntity entity) {
        // Get interventions for this arm
        List<StudyInterventionEntity> interventionEntities = interventionRepository.findByStudyArmId(entity.getId());
        List<InterventionDto> interventions = interventionEntities.stream()
            .map(this::toInterventionDto)
            .collect(Collectors.toList());
        
        // Get randomization strategy for this arm
        RandomizationStrategyDto randomizationStrategy = randomizationStrategyRepository
            .findByStudyArmIdAndIsDeletedFalse(entity.getId())
            .map(this::toRandomizationStrategyDto)
            .orElse(null);
            
        return StudyArmResponseDto.builder()
                .id(entity.getId())
                .armUuid(entity.getArmUuid())
                .aggregateUuid(entity.getAggregateUuid())
                .name(entity.getName())
                .description(entity.getDescription())
                .type(entity.getType() != null ? entity.getType().name() : null)
                .sequence(entity.getSequence())
                .plannedSubjects(entity.getPlannedSubjects())
                .studyId(entity.getStudyId())
                .interventions(interventions)
                .randomizationStrategy(randomizationStrategy)
                .isDeleted(entity.getIsDeleted())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
    
    /**
     * Map StudyInterventionEntity to InterventionDto
     */
    private InterventionDto toInterventionDto(StudyInterventionEntity entity) {
        return InterventionDto.builder()
                .id(entity.getId() != null ? entity.getId().toString() : null)
                .name(entity.getName())
                .description(entity.getDescription())
                .type(entity.getType() != null ? entity.getType().name() : null)
                .dosage(entity.getDosage())
                .frequency(entity.getFrequency())
                .route(entity.getRoute())
                .build();
    }
    
    /**
     * Map StudyRandomizationStrategyEntity to RandomizationStrategyDto
     */
    private RandomizationStrategyDto toRandomizationStrategyDto(StudyRandomizationStrategyEntity entity) {
        return RandomizationStrategyDto.builder()
                .type(entity.getType())
                .ratio(entity.getRatio())
                .blockSize(entity.getBlockSize())
                .stratificationFactors(entity.getStratificationFactors())
                .notes(entity.getNotes())
                .build();
    }
    
    /**
     * Get StudyArmRepository (for internal service use)
     * Exposed for StudyCommandService to perform CRUD operations
     * TODO: Remove when DDD command handling is implemented
     */
    public StudyArmRepository getStudyArmRepository() {
        return studyArmRepository;
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



