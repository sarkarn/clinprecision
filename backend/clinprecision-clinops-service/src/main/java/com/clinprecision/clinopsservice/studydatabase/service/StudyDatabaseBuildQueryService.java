package com.clinprecision.clinopsservice.studydatabase.service;

import com.clinprecision.clinopsservice.studydatabase.dto.StudyDatabaseBuildDto;
import com.clinprecision.clinopsservice.studydatabase.entity.StudyDatabaseBuildEntity;
import com.clinprecision.clinopsservice.studydatabase.entity.StudyDatabaseBuildStatus;
import com.clinprecision.clinopsservice.studydatabase.repository.StudyDatabaseBuildRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Study Database Build Query Service
 * 
 * Handles read operations using repository (CQRS read model).
 * Follows established ClinPrecision patterns for query processing.
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class StudyDatabaseBuildQueryService {

    private final StudyDatabaseBuildRepository buildRepository;

    /**
     * Get build by database ID
     */
    public StudyDatabaseBuildDto getBuildById(Long id) {
        log.info("Fetching build by ID: {}", id);
        
        StudyDatabaseBuildEntity entity = buildRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Build not found: " + id));
        
        return mapToDto(entity);
    }

    /**
     * Get build by aggregate UUID
     */
    public StudyDatabaseBuildDto getBuildByUuid(String aggregateUuid) {
        log.info("Fetching build by UUID: {}", aggregateUuid);
        
        StudyDatabaseBuildEntity entity = buildRepository.findByAggregateUuid(aggregateUuid)
                .orElseThrow(() -> new IllegalArgumentException("Build not found: " + aggregateUuid));
        
        return mapToDto(entity);
    }

    /**
     * Get build by build request ID
     */
    public StudyDatabaseBuildDto getBuildByRequestId(String buildRequestId) {
        log.info("Fetching build by request ID: {}", buildRequestId);
        
        StudyDatabaseBuildEntity entity = buildRepository.findByBuildRequestId(buildRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Build not found: " + buildRequestId));
        
        return mapToDto(entity);
    }

    /**
     * Get all builds for a study
     */
    public List<StudyDatabaseBuildDto> getBuildsByStudyId(Long studyId) {
        log.info("Fetching builds for study: {}", studyId);
        
        List<StudyDatabaseBuildEntity> entities = buildRepository.findByStudyIdOrderByBuildStartTimeDesc(studyId);
        
        return entities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get latest build for a study
     */
    public StudyDatabaseBuildDto getLatestBuildForStudy(Long studyId) {
        log.info("Fetching latest build for study: {}", studyId);
        
        StudyDatabaseBuildEntity entity = buildRepository.findTopByStudyIdOrderByBuildStartTimeDesc(studyId)
                .orElseThrow(() -> new IllegalArgumentException("No builds found for study: " + studyId));
        
        return mapToDto(entity);
    }

    /**
     * Get builds by status
     */
    public List<StudyDatabaseBuildDto> getBuildsByStatus(String status) {
        log.info("Fetching builds with status: {}", status);
        
        StudyDatabaseBuildStatus buildStatus = StudyDatabaseBuildStatus.valueOf(status);
        List<StudyDatabaseBuildEntity> entities = buildRepository.findByBuildStatus(buildStatus);
        
        return entities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get builds by study and status
     */
    public List<StudyDatabaseBuildDto> getBuildsByStudyIdAndStatus(Long studyId, String status) {
        log.info("Fetching builds for study {} with status {}", studyId, status);
        
        StudyDatabaseBuildStatus buildStatus = StudyDatabaseBuildStatus.valueOf(status);
        List<StudyDatabaseBuildEntity> entities = buildRepository.findByStudyIdAndBuildStatus(studyId, buildStatus);
        
        return entities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all in-progress builds
     */
    public List<StudyDatabaseBuildDto> getInProgressBuilds() {
        log.info("Fetching all in-progress builds");
        
        List<StudyDatabaseBuildEntity> entities = buildRepository.findByBuildStatusOrderByBuildStartTimeDesc(
            StudyDatabaseBuildStatus.IN_PROGRESS
        );
        
        return entities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all failed builds
     */
    public List<StudyDatabaseBuildDto> getFailedBuilds() {
        log.info("Fetching all failed builds");
        
        List<StudyDatabaseBuildEntity> entities = buildRepository.findByBuildStatus(
            StudyDatabaseBuildStatus.FAILED
        );
        
        return entities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get builds with validation warnings
     */
    public List<StudyDatabaseBuildDto> getBuildsWithValidationWarnings() {
        log.info("Fetching builds with validation warnings");
        
        List<StudyDatabaseBuildEntity> entities = buildRepository.findBuildsWithValidationWarnings();
        
        return entities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get recent builds (last N days)
     */
    public List<StudyDatabaseBuildDto> getRecentBuilds(int days) {
        log.info("Fetching builds from last {} days", days);
        
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<StudyDatabaseBuildEntity> entities = buildRepository.findRecentBuilds(since);
        
        return entities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get builds by user
     */
    public List<StudyDatabaseBuildDto> getBuildsByUserId(Long userId) {
        log.info("Fetching builds requested by user: {}", userId);
        
        List<StudyDatabaseBuildEntity> entities = buildRepository.findByRequestedBy(userId);
        
        return entities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get cancelled builds
     */
    public List<StudyDatabaseBuildDto> getCancelledBuilds() {
        log.info("Fetching cancelled builds");
        
        List<StudyDatabaseBuildEntity> entities = buildRepository.findByCancelledByIsNotNullOrderByCancelledAtDesc();
        
        return entities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get build count for study
     */
    public long getBuildCountForStudy(Long studyId) {
        log.info("Counting builds for study: {}", studyId);
        return buildRepository.countByStudyId(studyId);
    }

    /**
     * Get build count by study and status
     */
    public long getBuildCountByStudyIdAndStatus(Long studyId, String status) {
        log.info("Counting builds for study {} with status {}", studyId, status);
        
        StudyDatabaseBuildStatus buildStatus = StudyDatabaseBuildStatus.valueOf(status);
        return buildRepository.countByStudyIdAndBuildStatus(studyId, buildStatus);
    }

    /**
     * Check if study has active build
     */
    public boolean hasActiveBuild(Long studyId) {
        log.info("Checking if study {} has active build", studyId);
        
        return buildRepository.existsByStudyIdAndBuildStatus(
            studyId, 
            StudyDatabaseBuildStatus.IN_PROGRESS
        );
    }

    /**
     * Check if build request ID exists
     */
    public boolean buildRequestIdExists(String buildRequestId) {
        log.info("Checking if build request ID exists: {}", buildRequestId);
        return buildRepository.existsByBuildRequestId(buildRequestId);
    }

    /**
     * Map entity to DTO
     */
    private StudyDatabaseBuildDto mapToDto(StudyDatabaseBuildEntity entity) {
        return StudyDatabaseBuildDto.builder()
                .id(entity.getId())
                .aggregateUuid(entity.getAggregateUuid())
                .buildRequestId(entity.getBuildRequestId())
                .studyId(entity.getStudyId())
                .studyName(entity.getStudyName())
                .studyProtocol(entity.getStudyProtocol())
                .buildStatus(entity.getBuildStatus().name())
                .buildStartTime(entity.getBuildStartTime())
                .buildEndTime(entity.getBuildEndTime())
                .buildDurationSeconds(entity.getBuildDurationSeconds())
                .requestedBy(entity.getRequestedBy())
                .cancelledBy(entity.getCancelledBy())
                .validatedBy(entity.getValidatedBy())
                .tablesCreated(entity.getTablesCreated())
                .indexesCreated(entity.getIndexesCreated())
                .triggersCreated(entity.getTriggersCreated())
                .formsConfigured(entity.getFormsConfigured())
                .validationRulesCreated(entity.getValidationRulesCreated())
                .validationStatus(entity.getValidationStatus())
                .validatedAt(entity.getValidatedAt())
                .cancellationReason(entity.getCancellationReason())
                .errorDetails(entity.getErrorDetails())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .inProgress(entity.isInProgress())
                .completed(entity.isCompleted())
                .failed(entity.isFailed())
                .cancelled(entity.isCancelled())
                .build();
    }
}



