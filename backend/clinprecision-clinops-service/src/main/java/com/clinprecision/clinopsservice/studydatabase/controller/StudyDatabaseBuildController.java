package com.clinprecision.clinopsservice.studydatabase.controller;

import com.clinprecision.clinopsservice.studydatabase.dto.*;
import com.clinprecision.clinopsservice.studydatabase.service.StudyDatabaseBuildCommandService;
import com.clinprecision.clinopsservice.studydatabase.service.StudyDatabaseBuildQueryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API Controller for Study Database Build functionality
 * 
 * Follows established ClinPrecision patterns:
 * - Uses Long IDs in external API endpoints
 * - Separates command and query operations (CQRS)
 * - Returns standardized response formats
 * - Implements proper error handling
 */
@RestController
@RequestMapping("/api/v1/study-database-builds")
@RequiredArgsConstructor
@Slf4j
public class StudyDatabaseBuildController {

    private final StudyDatabaseBuildCommandService commandService;
    private final StudyDatabaseBuildQueryService queryService;

    // ==================== COMMAND ENDPOINTS (Write Operations) ====================

    /**
     * Build a study database
     * 
     * POST /api/v1/study-database-builds
     * 
     * @param requestDto Build request details
     * @return Created build with database ID and aggregate UUID
     */
    @PostMapping
    public ResponseEntity<StudyDatabaseBuildDto> buildStudyDatabase(
            @Valid @RequestBody BuildStudyDatabaseRequestDto requestDto) {
        
        log.info("API Request: Build study database for study {} ({})", 
                 requestDto.getStudyName(), requestDto.getStudyId());
        
        try {
            StudyDatabaseBuildDto result = commandService.buildStudyDatabase(requestDto);
            
            log.info("API Response: Study database build initiated with ID {} and request ID {}", 
                     result.getId(), result.getBuildRequestId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
            
        } catch (IllegalStateException e) {
            log.warn("Study database build validation failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error building study database: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to build study database", e);
        }
    }

    /**
     * Validate a study database build
     * 
     * POST /api/v1/study-database-builds/{buildRequestId}/validate
     * 
     * @param buildRequestId Build request ID
     * @param requestDto Validation options
     * @return Updated build with validation results
     */
    @PostMapping("/{buildRequestId}/validate")
    public ResponseEntity<StudyDatabaseBuildDto> validateStudyDatabase(
            @PathVariable String buildRequestId,
            @Valid @RequestBody ValidateStudyDatabaseRequestDto requestDto) {
        
        log.info("API Request: Validate study database build {}", buildRequestId);
        
        try {
            requestDto.setBuildRequestId(buildRequestId);
            StudyDatabaseBuildDto result = commandService.validateStudyDatabase(requestDto);
            
            log.info("API Response: Study database validation completed for build {}", buildRequestId);
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            log.warn("Validation request failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error validating study database: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to validate study database", e);
        }
    }

    /**
     * Cancel a study database build
     * 
     * POST /api/v1/study-database-builds/{buildRequestId}/cancel
     * 
     * @param buildRequestId Build request ID
     * @param requestDto Cancellation details
     * @return Updated build with cancellation info
     */
    @PostMapping("/{buildRequestId}/cancel")
    public ResponseEntity<StudyDatabaseBuildDto> cancelStudyDatabaseBuild(
            @PathVariable String buildRequestId,
            @Valid @RequestBody CancelStudyDatabaseBuildRequestDto requestDto) {
        
        log.info("API Request: Cancel study database build {}", buildRequestId);
        
        try {
            // TODO: Get actual user from security context
            Long currentUserId = 1L; // Placeholder
            
            requestDto.setBuildRequestId(buildRequestId);
            StudyDatabaseBuildDto result = commandService.cancelStudyDatabaseBuild(requestDto, currentUserId);
            
            log.info("API Response: Study database build cancelled {}", buildRequestId);
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            log.warn("Cancellation request failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error cancelling study database build: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to cancel study database build", e);
        }
    }

    /**
     * Complete a study database build
     * 
     * POST /api/v1/study-database-builds/{buildRequestId}/complete
     * 
     * @param buildRequestId Build request ID
     * @param requestDto Completion details
     * @return Updated build with completion info
     */
    @PostMapping("/{buildRequestId}/complete")
    public ResponseEntity<StudyDatabaseBuildDto> completeStudyDatabaseBuild(
            @PathVariable String buildRequestId,
            @Valid @RequestBody CompleteStudyDatabaseBuildRequestDto requestDto) {
        
        log.info("API Request: Complete study database build {}", buildRequestId);
        
        try {
            // TODO: Get actual user from security context
            Long currentUserId = 1L; // Placeholder
            
            requestDto.setBuildRequestId(buildRequestId);
            StudyDatabaseBuildDto result = commandService.completeStudyDatabaseBuild(requestDto, currentUserId);
            
            log.info("API Response: Study database build completed {}", buildRequestId);
            return ResponseEntity.ok(result);
            
        } catch (IllegalArgumentException e) {
            log.warn("Completion request failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error completing study database build: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to complete study database build", e);
        }
    }

    // ==================== QUERY ENDPOINTS (Read Operations) ====================

    /**
     * Get build by database ID
     * 
     * GET /api/v1/study-database-builds/{id}
     * 
     * @param id Database ID
     * @return Build details
     */
    @GetMapping("/{id}")
    public ResponseEntity<StudyDatabaseBuildDto> getBuildById(@PathVariable Long id) {
        log.info("API Request: Get build by ID {}", id);
        
        try {
            StudyDatabaseBuildDto result = queryService.getBuildById(id);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("Build not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get build by build request ID
     * 
     * GET /api/v1/study-database-builds/request/{buildRequestId}
     * 
     * @param buildRequestId Build request ID
     * @return Build details
     */
    @GetMapping("/request/{buildRequestId}")
    public ResponseEntity<StudyDatabaseBuildDto> getBuildByRequestId(@PathVariable String buildRequestId) {
        log.info("API Request: Get build by request ID {}", buildRequestId);
        
        try {
            StudyDatabaseBuildDto result = queryService.getBuildByRequestId(buildRequestId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("Build not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get build by aggregate UUID
     * 
     * GET /api/v1/study-database-builds/uuid/{aggregateUuid}
     * 
     * @param aggregateUuid Aggregate UUID
     * @return Build details
     */
    @GetMapping("/uuid/{aggregateUuid}")
    public ResponseEntity<StudyDatabaseBuildDto> getBuildByUuid(@PathVariable String aggregateUuid) {
        log.info("API Request: Get build by UUID {}", aggregateUuid);
        
        try {
            StudyDatabaseBuildDto result = queryService.getBuildByUuid(aggregateUuid);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("Build not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get all builds for a study
     * 
     * GET /api/v1/study-database-builds/study/{studyId}
     * 
     * @param studyId Study ID
     * @return List of builds
     */
    @GetMapping("/study/{studyId}")
    public ResponseEntity<List<StudyDatabaseBuildDto>> getBuildsByStudyId(@PathVariable Long studyId) {
        log.info("API Request: Get builds for study {}", studyId);
        
        List<StudyDatabaseBuildDto> results = queryService.getBuildsByStudyId(studyId);
        return ResponseEntity.ok(results);
    }

    /**
     * Get latest build for a study
     * 
     * GET /api/v1/study-database-builds/study/{studyId}/latest
     * 
     * @param studyId Study ID
     * @return Latest build
     */
    @GetMapping("/study/{studyId}/latest")
    public ResponseEntity<StudyDatabaseBuildDto> getLatestBuildForStudy(@PathVariable Long studyId) {
        log.info("API Request: Get latest build for study {}", studyId);
        
        try {
            StudyDatabaseBuildDto result = queryService.getLatestBuildForStudy(studyId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            log.warn("No builds found for study: {}", studyId);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get builds by status
     * 
     * GET /api/v1/study-database-builds/status/{status}
     * 
     * @param status Build status (IN_PROGRESS, COMPLETED, FAILED, CANCELLED)
     * @return List of builds
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<StudyDatabaseBuildDto>> getBuildsByStatus(@PathVariable String status) {
        log.info("API Request: Get builds with status {}", status);
        
        try {
            List<StudyDatabaseBuildDto> results = queryService.getBuildsByStatus(status.toUpperCase());
            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status: {}", status);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get builds by study and status
     * 
     * GET /api/v1/study-database-builds/study/{studyId}/status/{status}
     * 
     * @param studyId Study ID
     * @param status Build status
     * @return List of builds
     */
    @GetMapping("/study/{studyId}/status/{status}")
    public ResponseEntity<List<StudyDatabaseBuildDto>> getBuildsByStudyIdAndStatus(
            @PathVariable Long studyId,
            @PathVariable String status) {
        log.info("API Request: Get builds for study {} with status {}", studyId, status);
        
        try {
            List<StudyDatabaseBuildDto> results = queryService.getBuildsByStudyIdAndStatus(
                studyId, 
                status.toUpperCase()
            );
            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status: {}", status);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all in-progress builds
     * 
     * GET /api/v1/study-database-builds/in-progress
     * 
     * @return List of in-progress builds
     */
    @GetMapping("/in-progress")
    public ResponseEntity<List<StudyDatabaseBuildDto>> getInProgressBuilds() {
        log.info("API Request: Get all in-progress builds");
        
        List<StudyDatabaseBuildDto> results = queryService.getInProgressBuilds();
        return ResponseEntity.ok(results);
    }

    /**
     * Get all failed builds
     * 
     * GET /api/v1/study-database-builds/failed
     * 
     * @return List of failed builds
     */
    @GetMapping("/failed")
    public ResponseEntity<List<StudyDatabaseBuildDto>> getFailedBuilds() {
        log.info("API Request: Get all failed builds");
        
        List<StudyDatabaseBuildDto> results = queryService.getFailedBuilds();
        return ResponseEntity.ok(results);
    }

    /**
     * Get builds with validation warnings
     * 
     * GET /api/v1/study-database-builds/validation-warnings
     * 
     * @return List of builds with validation warnings
     */
    @GetMapping("/validation-warnings")
    public ResponseEntity<List<StudyDatabaseBuildDto>> getBuildsWithValidationWarnings() {
        log.info("API Request: Get builds with validation warnings");
        
        List<StudyDatabaseBuildDto> results = queryService.getBuildsWithValidationWarnings();
        return ResponseEntity.ok(results);
    }

    /**
     * Get recent builds
     * 
     * GET /api/v1/study-database-builds/recent?days=7
     * 
     * @param days Number of days (default: 7)
     * @return List of recent builds
     */
    @GetMapping("/recent")
    public ResponseEntity<List<StudyDatabaseBuildDto>> getRecentBuilds(
            @RequestParam(defaultValue = "7") int days) {
        log.info("API Request: Get builds from last {} days", days);
        
        List<StudyDatabaseBuildDto> results = queryService.getRecentBuilds(days);
        return ResponseEntity.ok(results);
    }

    /**
     * Get builds by user
     * 
     * GET /api/v1/study-database-builds/user/{userId}
     * 
     * @param userId User ID
     * @return List of builds requested by user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StudyDatabaseBuildDto>> getBuildsByUserId(@PathVariable Long userId) {
        log.info("API Request: Get builds for user {}", userId);
        
        List<StudyDatabaseBuildDto> results = queryService.getBuildsByUserId(userId);
        return ResponseEntity.ok(results);
    }

    /**
     * Get cancelled builds
     * 
     * GET /api/v1/study-database-builds/cancelled
     * 
     * @return List of cancelled builds
     */
    @GetMapping("/cancelled")
    public ResponseEntity<List<StudyDatabaseBuildDto>> getCancelledBuilds() {
        log.info("API Request: Get cancelled builds");
        
        List<StudyDatabaseBuildDto> results = queryService.getCancelledBuilds();
        return ResponseEntity.ok(results);
    }

    /**
     * Get build count for study
     * 
     * GET /api/v1/study-database-builds/study/{studyId}/count
     * 
     * @param studyId Study ID
     * @return Build count
     */
    @GetMapping("/study/{studyId}/count")
    public ResponseEntity<Map<String, Long>> getBuildCountForStudy(@PathVariable Long studyId) {
        log.info("API Request: Get build count for study {}", studyId);
        
        long count = queryService.getBuildCountForStudy(studyId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Check if study has active build
     * 
     * GET /api/v1/study-database-builds/study/{studyId}/has-active
     * 
     * @param studyId Study ID
     * @return Active build status
     */
    @GetMapping("/study/{studyId}/has-active")
    public ResponseEntity<Map<String, Boolean>> hasActiveBuild(@PathVariable Long studyId) {
        log.info("API Request: Check if study {} has active build", studyId);
        
        boolean hasActive = queryService.hasActiveBuild(studyId);
        return ResponseEntity.ok(Map.of("hasActiveBuild", hasActive));
    }

    /**
     * Health check endpoint
     * 
     * GET /api/v1/study-database-builds/health
     * 
     * @return Health status
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "Study Database Build Service",
            "version", "1.0.0"
        ));
    }
}



