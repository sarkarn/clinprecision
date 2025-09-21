package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.dto.*;
import com.clinprecision.studydesignservice.entity.StudyArmEntity;
import com.clinprecision.studydesignservice.entity.StudyArmType;
import com.clinprecision.studydesignservice.entity.StudyInterventionEntity;
import com.clinprecision.studydesignservice.entity.InterventionType;
import com.clinprecision.studydesignservice.repository.StudyArmRepository;
import com.clinprecision.studydesignservice.repository.StudyInterventionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for StudyArm operations
 * Contains business logic for study arm management
 */
@Service
@Transactional
public class StudyArmService {
    
    private static final Logger log = LoggerFactory.getLogger(StudyArmService.class);
    
    private final StudyArmRepository studyArmRepository;
    private final StudyInterventionRepository interventionRepository;
    
    public StudyArmService(StudyArmRepository studyArmRepository, 
                          StudyInterventionRepository interventionRepository) {
        this.studyArmRepository = studyArmRepository;
        this.interventionRepository = interventionRepository;
    }
    
    /**
     * Get all study arms for a specific study
     */
    @Transactional(readOnly = true)
    public List<StudyArmResponseDto> getStudyArmsByStudyId(Long studyId) {
        log.debug("Fetching study arms for study ID: {}", studyId);
        
        List<StudyArmEntity> studyArms = studyArmRepository.findByStudyIdOrderBySequenceAsc(studyId);
        
        log.debug("Found {} study arms for study ID: {}", studyArms.size(), studyId);
        
        return studyArms.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a specific study arm by ID
     */
    @Transactional(readOnly = true)
    public StudyArmResponseDto getStudyArmById(Long studyArmId) {
        log.debug("Fetching study arm by ID: {}", studyArmId);
        
        StudyArmEntity studyArm = studyArmRepository.findById(studyArmId)
                .orElseThrow(() -> new RuntimeException("Study arm not found with ID: " + studyArmId));
        
        return convertToResponseDto(studyArm);
    }
    
    /**
     * Get a study arm by ID for a specific study (security check)
     */
    @Transactional(readOnly = true)
    public StudyArmResponseDto getStudyArmByIdAndStudyId(Long studyArmId, Long studyId) {
        log.debug("Fetching study arm by ID: {} for study ID: {}", studyArmId, studyId);
        
        StudyArmEntity studyArm = studyArmRepository.findByIdAndStudyId(studyArmId, studyId)
                .orElseThrow(() -> new RuntimeException("Study arm not found with ID: " + studyArmId + " for study: " + studyId));
        
        return convertToResponseDto(studyArm);
    }
    
    /**
     * Create a new study arm
     */
    public StudyArmResponseDto createStudyArm(Long studyId, StudyArmCreateRequestDto request) {
        log.debug("Creating study arm for study ID: {} with data: {}", studyId, request);
        
        // Validate sequence uniqueness
        if (studyArmRepository.existsByStudyIdAndSequence(studyId, request.getSequence())) {
            throw new RuntimeException("Study arm with sequence " + request.getSequence() + " already exists for study " + studyId);
        }
        
        // Create entity
        StudyArmEntity studyArm = new StudyArmEntity();
        studyArm.setName(request.getName());
        studyArm.setDescription(request.getDescription());
        studyArm.setType(parseStudyArmType(request.getType()));
        studyArm.setSequence(request.getSequence());
        studyArm.setPlannedSubjects(request.getPlannedSubjects());
        studyArm.setStudyId(studyId);
        studyArm.setCreatedBy("system"); // TODO: Get from authentication context
        studyArm.setUpdatedBy("system");
        
        StudyArmEntity savedStudyArm = studyArmRepository.save(studyArm);
        
        log.info("Created study arm with ID: {} for study ID: {}", savedStudyArm.getId(), studyId);
        
        return convertToResponseDto(savedStudyArm);
    }
    
    /**
     * Update an existing study arm
     */
    public StudyArmResponseDto updateStudyArm(Long studyArmId, StudyArmUpdateRequestDto request) {
        log.debug("Updating study arm ID: {} with data: {}", studyArmId, request);
        
        StudyArmEntity studyArm = studyArmRepository.findById(studyArmId)
                .orElseThrow(() -> new RuntimeException("Study arm not found with ID: " + studyArmId));
        
        // Update fields if provided
        if (request.getName() != null) {
            studyArm.setName(request.getName());
        }
        if (request.getDescription() != null) {
            studyArm.setDescription(request.getDescription());
        }
        if (request.getType() != null) {
            studyArm.setType(parseStudyArmType(request.getType()));
        }
        if (request.getSequence() != null) {
            // Check for sequence conflicts
            if (!request.getSequence().equals(studyArm.getSequence()) &&
                studyArmRepository.existsByStudyIdAndSequence(studyArm.getStudyId(), request.getSequence())) {
                throw new RuntimeException("Study arm with sequence " + request.getSequence() + " already exists");
            }
            studyArm.setSequence(request.getSequence());
        }
        if (request.getPlannedSubjects() != null) {
            studyArm.setPlannedSubjects(request.getPlannedSubjects());
        }
        
        // Handle interventions if provided
        if (request.getInterventions() != null) {
            log.debug("Processing {} interventions for study arm ID: {}", request.getInterventions().size(), studyArmId);
            for (StudyInterventionUpdateRequestDto intervention : request.getInterventions()) {
                log.debug("Intervention: ID={}, Name={}, Type={}", intervention.getId(), intervention.getName(), intervention.getType());
            }
            updateStudyArmInterventions(studyArm, request.getInterventions());
        }
        
        studyArm.setUpdatedBy("system"); // TODO: Get from authentication context
        
        StudyArmEntity updatedStudyArm = studyArmRepository.save(studyArm);
        
        log.info("Updated study arm ID: {}", studyArmId);
        
        return convertToResponseDto(updatedStudyArm);
    }
    
    /**
     * Delete a study arm
     */
    public void deleteStudyArm(Long studyArmId) {
        log.debug("Deleting study arm ID: {}", studyArmId);
        
        if (!studyArmRepository.existsById(studyArmId)) {
            throw new RuntimeException("Study arm not found with ID: " + studyArmId);
        }
        
        studyArmRepository.deleteById(studyArmId);
        
        log.info("Deleted study arm ID: {}", studyArmId);
    }
    
    /**
     * Get study arm statistics for a study
     */
    @Transactional(readOnly = true)
    public StudyArmStatsDto getStudyArmStats(Long studyId) {
        log.debug("Fetching study arm stats for study ID: {}", studyId);
        
        long totalArms = studyArmRepository.countByStudyId(studyId);
        long totalPlannedSubjects = studyArmRepository.getTotalPlannedSubjectsByStudyId(studyId);
        
        return new StudyArmStatsDto(totalArms, totalPlannedSubjects);
    }
    
    /**
     * Reorder study arm sequences (utility method)
     */
    public List<StudyArmResponseDto> reorderStudyArmSequences(Long studyId) {
        log.debug("Reordering study arm sequences for study ID: {}", studyId);
        
        List<StudyArmEntity> studyArms = studyArmRepository.findByStudyIdOrderBySequenceAsc(studyId);
        
        // Reassign sequences starting from 1
        for (int i = 0; i < studyArms.size(); i++) {
            StudyArmEntity arm = studyArms.get(i);
            arm.setSequence(i + 1);
            arm.setUpdatedBy("system");
        }
        
        List<StudyArmEntity> reorderedArms = studyArmRepository.saveAll(studyArms);
        
        log.info("Reordered {} study arms for study ID: {}", reorderedArms.size(), studyId);
        
        return reorderedArms.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }
    
    // Private helper methods
    
    private StudyArmResponseDto convertToResponseDto(StudyArmEntity entity) {
        if (entity == null) return null;
        
        List<StudyInterventionResponseDto> interventions = entity.getInterventions().stream()
                .map(this::convertInterventionToDto)
                .collect(Collectors.toList());
        
        return StudyArmResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .type(entity.getType().name())
                .sequence(entity.getSequence())
                .plannedSubjects(entity.getPlannedSubjects())
                .studyId(entity.getStudyId())
                .interventions(interventions)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
    
    private StudyInterventionResponseDto convertInterventionToDto(StudyInterventionEntity entity) {
        if (entity == null) return null;
        
        return StudyInterventionResponseDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .type(entity.getType().name())
                .dosage(entity.getDosage())
                .frequency(entity.getFrequency())
                .route(entity.getRoute())
                .build();
    }
    
    private StudyArmType parseStudyArmType(String type) {
        try {
            return StudyArmType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid study arm type: " + type);
        }
    }
    
    /**
     * Update interventions for a study arm
     */
    private void updateStudyArmInterventions(StudyArmEntity studyArm, List<StudyInterventionUpdateRequestDto> interventionUpdates) {
        log.debug("Updating {} interventions for study arm ID: {}", interventionUpdates.size(), studyArm.getId());
        
        // Clear existing interventions
        studyArm.getInterventions().clear();
        
        // Add/update interventions
        for (StudyInterventionUpdateRequestDto interventionDto : interventionUpdates) {
            StudyInterventionEntity intervention = null;
            
            // Try to find existing intervention if ID looks like a database ID
            if (interventionDto.getId() != null && !interventionDto.isNewIntervention()) {
                try {
                    Long interventionId = Long.parseLong(interventionDto.getId());
                    intervention = interventionRepository.findByIdAndStudyArmId(interventionId, studyArm.getId())
                            .orElse(null);
                    
                    if (intervention != null) {
                        log.debug("Updating existing intervention ID: {}", interventionId);
                        updateInterventionFromDto(intervention, interventionDto);
                    } else {
                        log.debug("Intervention ID {} not found, treating as new intervention", interventionId);
                    }
                } catch (NumberFormatException e) {
                    log.debug("Invalid intervention ID format: {}, treating as new intervention", interventionDto.getId());
                }
            }
            
            // If no existing intervention found, create new one
            if (intervention == null) {
                log.debug("Creating new intervention for study arm ID: {}", studyArm.getId());
                intervention = createInterventionFromDto(interventionDto, studyArm.getId());
            }
            
            studyArm.addIntervention(intervention);
        }
        
        log.debug("Updated interventions for study arm ID: {}", studyArm.getId());
    }
    
    /**
     * Create new intervention entity from DTO
     */
    private StudyInterventionEntity createInterventionFromDto(StudyInterventionUpdateRequestDto dto, Long studyArmId) {
        StudyInterventionEntity intervention = new StudyInterventionEntity();
        intervention.setName(dto.getName() != null ? dto.getName() : "");
        intervention.setDescription(dto.getDescription());
        intervention.setType(parseInterventionType(dto.getType() != null ? dto.getType() : "DRUG"));
        intervention.setDosage(dto.getDosage());
        intervention.setFrequency(dto.getFrequency());
        intervention.setRoute(dto.getRoute());
        intervention.setStudyArmId(studyArmId);
        return intervention;
    }
    
    /**
     * Update existing intervention entity from DTO
     */
    private void updateInterventionFromDto(StudyInterventionEntity intervention, StudyInterventionUpdateRequestDto dto) {
        if (dto.getName() != null) {
            intervention.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            intervention.setDescription(dto.getDescription());
        }
        if (dto.getType() != null) {
            intervention.setType(parseInterventionType(dto.getType()));
        }
        if (dto.getDosage() != null) {
            intervention.setDosage(dto.getDosage());
        }
        if (dto.getFrequency() != null) {
            intervention.setFrequency(dto.getFrequency());
        }
        if (dto.getRoute() != null) {
            intervention.setRoute(dto.getRoute());
        }
    }
    
    /**
     * Parse intervention type from string
     */
    private InterventionType parseInterventionType(String type) {
        try {
            return InterventionType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid intervention type: " + type);
        }
    }
    
    // Inner class for stats
    public static class StudyArmStatsDto {
        private final long totalArms;
        private final long totalPlannedSubjects;
        
        public StudyArmStatsDto(long totalArms, long totalPlannedSubjects) {
            this.totalArms = totalArms;
            this.totalPlannedSubjects = totalPlannedSubjects;
        }
        
        public long getTotalArms() { return totalArms; }
        public long getTotalPlannedSubjects() { return totalPlannedSubjects; }
    }
}