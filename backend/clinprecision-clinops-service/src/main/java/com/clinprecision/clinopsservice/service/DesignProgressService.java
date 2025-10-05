package com.clinprecision.clinopsservice.service;



import com.clinprecision.clinopsservice.repository.DesignProgressRepository;
import com.clinprecision.clinopsservice.repository.StudyRepository;
import com.clinprecision.clinopsservice.dto.DesignProgressDto;
import com.clinprecision.clinopsservice.dto.DesignProgressResponseDto;
import com.clinprecision.clinopsservice.dto.DesignProgressUpdateRequestDto;
import com.clinprecision.clinopsservice.entity.DesignProgressEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing study design progress
 * Handles business logic for tracking design phase completion
 */
@Service
@Transactional
public class DesignProgressService {
    
    private static final Logger logger = LoggerFactory.getLogger(DesignProgressService.class);
    
    private final DesignProgressRepository designProgressRepository;
    private final StudyRepository studyRepository;
    
    // Define the standard design phases in order
    private static final List<String> DESIGN_PHASES = Arrays.asList(
        "basic-info", "arms", "visits", "forms", "review", "publish", "revisions"
    );
    
    public DesignProgressService(DesignProgressRepository designProgressRepository,
                               StudyRepository studyRepository) {
        this.designProgressRepository = designProgressRepository;
        this.studyRepository = studyRepository;
    }
    
    /**
     * Get design progress for a study
     * @param studyId The study ID
     * @return Design progress response DTO
     */
    @Transactional(readOnly = true)
    public DesignProgressResponseDto getDesignProgress(Long studyId) {
        logger.info("Getting design progress for study: {}", studyId);
        
        // Verify study exists
        if (!studyRepository.existsById(studyId)) {
            throw new IllegalArgumentException("Study not found with ID: " + studyId);
        }
        
        // Get existing progress records
        List<DesignProgressEntity> progressEntities = designProgressRepository.findByStudyIdOrderByPhaseAsc(studyId);
        
        // Convert to map for easy lookup
        Map<String, DesignProgressEntity> existingProgress = progressEntities.stream()
            .collect(Collectors.toMap(DesignProgressEntity::getPhase, entity -> entity));
        
        // Create progress map with all phases (initialize missing ones)
        Map<String, DesignProgressDto> progressMap = new LinkedHashMap<>();
        
        for (String phase : DESIGN_PHASES) {
            DesignProgressEntity entity = existingProgress.get(phase);
            DesignProgressDto dto;
            
            if (entity != null) {
                // Convert existing entity to DTO
                dto = convertToDto(entity);
            } else {
                // Create default progress for missing phases
                dto = createDefaultProgress(phase);
                // Save the default progress to database
                saveDefaultProgress(studyId, phase);
            }
            
            progressMap.put(phase, dto);
        }
        
        // Calculate overall completion
        Integer overallCompletion = calculateOverallCompletion(progressMap);
        
        DesignProgressResponseDto response = new DesignProgressResponseDto(studyId, progressMap, overallCompletion);
        
        logger.info("Retrieved design progress for study {} with overall completion: {}%", 
                   studyId, overallCompletion);
        
        return response;
    }
    
    /**
     * Update design progress for a study
     * @param studyId The study ID
     * @param updateRequest The update request DTO
     * @return Updated design progress response DTO
     */
    public DesignProgressResponseDto updateDesignProgress(Long studyId, 
                                                        DesignProgressUpdateRequestDto updateRequest) {
        logger.info("Updating design progress for study: {}", studyId);
        
        // Verify study exists
        if (!studyRepository.existsById(studyId)) {
            throw new IllegalArgumentException("Study not found with ID: " + studyId);
        }
        
        Map<String, DesignProgressDto> progressData = updateRequest.getProgressData();
        
        // Validate phases
        validatePhases(progressData.keySet());
        
        // Update each phase
        for (Map.Entry<String, DesignProgressDto> entry : progressData.entrySet()) {
            String phase = entry.getKey();
            DesignProgressDto progressDto = entry.getValue();
            
            updatePhaseProgress(studyId, phase, progressDto);
        }
        
        logger.info("Updated design progress for study {} with {} phases", studyId, progressData.size());
        
        // Return updated progress
        return getDesignProgress(studyId);
    }
    
    /**
     * Initialize design progress for a new study
     * @param studyId The study ID
     * @return Initial design progress response DTO
     */
    public DesignProgressResponseDto initializeDesignProgress(Long studyId) {
        logger.info("Initializing design progress for study: {}", studyId);
        
        // Verify study exists
        if (!studyRepository.existsById(studyId)) {
            throw new IllegalArgumentException("Study not found with ID: " + studyId);
        }
        
        // Create initial progress for all phases
        for (String phase : DESIGN_PHASES) {
            if (!designProgressRepository.findByStudyIdAndPhase(studyId, phase).isPresent()) {
                saveDefaultProgress(studyId, phase);
            }
        }
        
        // Mark basic-info as completed (since study creation is complete)
        updatePhaseProgress(studyId, "basic-info", new DesignProgressDto("basic-info", true, 100));
        
        logger.info("Initialized design progress for study: {}", studyId);
        
        return getDesignProgress(studyId);
    }
    
    /**
     * Mark a phase as completed
     * @param studyId The study ID
     * @param phase The phase to mark as completed
     * @param percentage The completion percentage (optional, defaults to 100)
     */
    public void markPhaseCompleted(Long studyId, String phase, Integer percentage) {
        logger.info("Marking phase {} as completed for study: {}", phase, studyId);
        
        DesignProgressDto progressDto = new DesignProgressDto(phase, true, percentage != null ? percentage : 100);
        updatePhaseProgress(studyId, phase, progressDto);
    }
    
    /**
     * Update progress for a specific phase
     * @param studyId The study ID
     * @param phase The phase to update
     * @param progressDto The progress data
     */
    private void updatePhaseProgress(Long studyId, String phase, DesignProgressDto progressDto) {
        Optional<DesignProgressEntity> existingEntity = designProgressRepository.findByStudyIdAndPhase(studyId, phase);
        
        DesignProgressEntity entity;
        if (existingEntity.isPresent()) {
            entity = existingEntity.get();
            entity.setCompleted(progressDto.getCompleted());
            entity.setPercentage(progressDto.getPercentage());
            entity.setNotes(progressDto.getNotes());
            entity.setUpdatedAt(LocalDateTime.now());
        } else {
            entity = new DesignProgressEntity(studyId, phase, progressDto.getCompleted(), progressDto.getPercentage());
            entity.setNotes(progressDto.getNotes());
        }
        
        designProgressRepository.save(entity);
        
        logger.debug("Updated progress for study {} phase {}: completed={}, percentage={}", 
                    studyId, phase, progressDto.getCompleted(), progressDto.getPercentage());
    }
    
    /**
     * Save default progress for a phase
     * @param studyId The study ID
     * @param phase The phase
     */
    private void saveDefaultProgress(Long studyId, String phase) {
        DesignProgressEntity entity = new DesignProgressEntity(studyId, phase);
        designProgressRepository.save(entity);
    }
    
    /**
     * Create default progress DTO for a phase
     * @param phase The phase
     * @return Default progress DTO
     */
    private DesignProgressDto createDefaultProgress(String phase) {
        return new DesignProgressDto(phase, false, 0, null, null);
    }
    
    /**
     * Convert entity to DTO
     * @param entity The entity
     * @return The DTO
     */
    private DesignProgressDto convertToDto(DesignProgressEntity entity) {
        return new DesignProgressDto(
            entity.getPhase(),
            entity.getCompleted(),
            entity.getPercentage(),
            entity.getUpdatedAt(),
            entity.getNotes()
        );
    }
    
    /**
     * Calculate overall completion percentage
     * @param progressMap The progress map
     * @return Overall completion percentage
     */
    private Integer calculateOverallCompletion(Map<String, DesignProgressDto> progressMap) {
        if (progressMap.isEmpty()) {
            return 0;
        }
        
        int totalPercentage = progressMap.values().stream()
            .mapToInt(progress -> progress.getPercentage() != null ? progress.getPercentage() : 0)
            .sum();
        
        return Math.round((float) totalPercentage / progressMap.size());
    }
    
    /**
     * Validate phase names
     * @param phases The phase names to validate
     */
    private void validatePhases(Set<String> phases) {
        for (String phase : phases) {
            if (!DESIGN_PHASES.contains(phase)) {
                throw new IllegalArgumentException("Invalid design phase: " + phase + 
                    ". Valid phases are: " + String.join(", ", DESIGN_PHASES));
            }
        }
    }
    
    /**
     * Delete all design progress for a study
     * @param studyId The study ID
     */
    public void deleteDesignProgress(Long studyId) {
        logger.info("Deleting design progress for study: {}", studyId);
        designProgressRepository.deleteByStudyId(studyId);
        logger.info("Deleted design progress for study: {}", studyId);
    }
    
    /**
     * Get completion statistics for a study
     * @param studyId The study ID
     * @return Map with completion statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCompletionStatistics(Long studyId) {
        Long completedPhases = designProgressRepository.countByStudyIdAndCompletedTrue(studyId);
        Long totalPhases = designProgressRepository.countByStudyId(studyId);
        Double overallPercentage = designProgressRepository.calculateOverallCompletionPercentage(studyId);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("completedPhases", completedPhases);
        statistics.put("totalPhases", totalPhases);
        statistics.put("overallPercentage", overallPercentage != null ? overallPercentage.intValue() : 0);
        statistics.put("completionRatio", totalPhases > 0 ? (double) completedPhases / totalPhases * 100 : 0);
        
        return statistics;
    }
}



