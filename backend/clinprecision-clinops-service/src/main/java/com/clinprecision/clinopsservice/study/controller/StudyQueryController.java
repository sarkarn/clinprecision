package com.clinprecision.clinopsservice.study.controller;

import com.clinprecision.clinopsservice.study.dto.response.StudyArmResponseDto;
import com.clinprecision.clinopsservice.study.dto.response.StudyListResponseDto;
import com.clinprecision.clinopsservice.study.dto.response.StudyResponseDto;
import com.clinprecision.clinopsservice.study.service.StudyQueryService;
import com.clinprecision.clinopsservice.service.DesignProgressService;
import com.clinprecision.clinopsservice.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Study Query Controller - DDD/CQRS Read Operations
 * 
 * REST API for study read operations (query side).
 * Following CQRS pattern: Queries read from read model for performance.
 * 
 * Base Path: /api/studies
 * 
 * Query Endpoints:
 * - GET /api/studies                           - List all studies
 * - GET /api/studies/{uuid}                    - Get study by UUID
 * - GET /api/studies/{uuid}/overview           - Get study overview
 * - GET /api/studies/search                    - Search studies with filters
 * - GET /api/studies/lookup/statuses           - Get all study statuses
 * - GET /api/studies/lookup/regulatory-statuses - Get all regulatory statuses
 * - GET /api/studies/lookup/phases             - Get all study phases
 * - GET /api/studies/dashboard/metrics         - Get dashboard metrics
 * - GET /api/studies/{uuid}/design-progress    - Get design progress
 * - GET /api/studies/{uuid}/status/transitions - Get valid status transitions
 * 
 * Architecture:
 * - Queries read from projection (StudyEntity)
 * - Delegates to StudyQueryService
 * - Returns DTOs to frontend
 * - Read-only operations, eventually consistent
 * 
 * @author DDD Migration Team
 * @version 1.0
 * @since V004 Migration
 */
@RestController
@RequestMapping("/api/studies")
@RequiredArgsConstructor
@Validated
@Slf4j
public class StudyQueryController {

    private final StudyQueryService studyQueryService;
    private final DesignProgressService designProgressService;

    /**
     * Get all studies with optional filters
     * 
     * Query: Find all studies in read model
     * 
     * @param status Filter by study status (optional)
     * @param phase Filter by study phase (optional)
     * @param sponsor Filter by sponsor organization (optional)
     * @return 200 OK with list of studies
     */
    @GetMapping
    public ResponseEntity<List<StudyListResponseDto>> getAllStudies(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "phase", required = false) String phase,
            @RequestParam(value = "sponsor", required = false) String sponsor) {
        
        log.info("REST: Fetching all studies with filters - status: {}, phase: {}, sponsor: {}", 
                 status, phase, sponsor);
        
        // TODO: Implement filtering in StudyQueryService
        // For now, just return all studies
        List<StudyListResponseDto> studies = studyQueryService.getAllStudies();
        
        log.info("REST: Fetched {} studies", studies.size());
        return ResponseEntity.ok(studies);
    }

    /**
     * Get study by UUID or legacy database ID (Bridge Pattern)
     * 
     * This endpoint intelligently accepts either:
     * - UUID format: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
     * - Legacy numeric ID: "1", "123"
     * 
     * Query: Find study by UUID or ID in read model
     * 
     * @param id Study identifier (UUID or numeric ID)
     * @return 200 OK with study details
     * @throws StudyNotFoundException if study not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<StudyResponseDto> getStudyByUuidOrId(@PathVariable String id) {
        log.info("REST: Fetching study by identifier: {}", id);
        
        StudyResponseDto study;
        
        // Try to parse as UUID first, if fails then treat as legacy numeric ID
        try {
            UUID uuid = UUID.fromString(id);
            log.debug("REST: Identifier is UUID format, using UUID query");
            study = studyQueryService.getStudyByUuid(uuid);
        } catch (IllegalArgumentException e) {
            // Not a UUID, try parsing as Long (legacy ID)
            log.debug("REST: Identifier is not UUID, trying legacy ID format");
            try {
                Long legacyId = Long.parseLong(id);
                log.info("REST: Using legacy ID {} (Bridge Pattern for backward compatibility)", legacyId);
                study = studyQueryService.getStudyById(legacyId);
            } catch (NumberFormatException nfe) {
                log.error("REST: Invalid identifier format (not UUID or numeric): {}", id);
                return ResponseEntity.badRequest().build();
            }
        }
        
        log.info("REST: Study fetched successfully: {}", study.getName());
        return ResponseEntity.ok(study);
    }

    /**
     * Get study overview data for dashboard (supports UUID or legacy ID)
     * 
     * Query: Find study with aggregated metrics
     * 
     * @param id Study identifier (UUID or numeric ID)
     * @return 200 OK with study overview
     */
    @GetMapping("/{id}/overview")
    public ResponseEntity<StudyResponseDto> getStudyOverview(@PathVariable String id) {
        log.info("REST: Fetching study overview: {}", id);
        
        StudyResponseDto study;
        
        // Support both UUID and legacy numeric ID
        try {
            UUID uuid = UUID.fromString(id);
            study = studyQueryService.getStudyByUuid(uuid);
        } catch (IllegalArgumentException e) {
            Long legacyId = Long.parseLong(id);
            log.info("REST: Using legacy ID {} for overview (Bridge Pattern)", legacyId);
            study = studyQueryService.getStudyById(legacyId);
        }
        
        log.info("REST: Study overview fetched successfully: {}", study.getName());
        return ResponseEntity.ok(study);
    }

    /**
     * Get study arms (supports UUID or legacy ID)
     * 
     * Query: Get all arms for a study
     * 
     * @param id Study identifier (UUID or numeric ID)
     * @return 200 OK with list of study arms
     */
    @GetMapping("/{id}/arms")
    public ResponseEntity<List<StudyArmResponseDto>> getStudyArms(@PathVariable String id) {
        log.info("REST: Fetching study arms for study: {}", id);
        
        try {
            List<StudyArmResponseDto> arms;
            
            // Support both UUID and legacy numeric ID
            try {
                UUID uuid = UUID.fromString(id);
                log.debug("REST: Using UUID format for arms query");
                arms = studyQueryService.getStudyArmsByUuid(uuid);
            } catch (IllegalArgumentException e) {
                Long legacyId = Long.parseLong(id);
                log.info("REST: Using legacy ID {} for arms query (Bridge Pattern)", legacyId);
                arms = studyQueryService.getStudyArmsByStudyId(legacyId);
            }
            
            log.info("REST: Fetched {} study arms", arms.size());
            return ResponseEntity.ok(arms);
            
        } catch (NumberFormatException nfe) {
            log.error("REST: Invalid identifier format (not UUID or numeric): {}", id);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("REST: Error fetching study arms for study: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * NOTE: Visit endpoints removed - frontend now uses DDD paths
     * Visits are accessed via: GET /api/clinops/study-design/{studyDesignUuid}/visits
     * This is the correct architectural approach as visits are part of study design.
     */

    /**
     * Search studies with advanced filters
     * 
     * Query: Search studies in read model
     * 
     * @param query Search query string
     * @param status Filter by status
     * @param phase Filter by phase
     * @return 200 OK with matching studies
     */
    @GetMapping("/search")
    public ResponseEntity<List<StudyListResponseDto>> searchStudies(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "phase", required = false) String phase) {
        
        log.info("REST: Searching studies - query: {}, status: {}, phase: {}", query, status, phase);
        
        // TODO: Implement search in StudyQueryService
        // For now, just return all studies
        List<StudyListResponseDto> studies = studyQueryService.getAllStudies();
        
        log.info("REST: Found {} matching studies", studies.size());
        return ResponseEntity.ok(studies);
    }

    /**
     * Get all study statuses for dropdown
     * 
     * Query: Lookup reference data
     * 
     * @return 200 OK with list of study statuses
     */
    @GetMapping("/lookup/statuses")
    public ResponseEntity<List<StudyStatusDto>> getStudyStatuses() {
        log.info("REST: Fetching study statuses");
        
        // TODO: Implement reference data query service
        // For now, return basic values using proper constructor
        List<StudyStatusDto> statuses = List.of(
            new StudyStatusDto(1L, "PLANNING", "Planning", "Study is in planning phase"),
            new StudyStatusDto(2L, "ACTIVE", "Active", "Study is active and enrolling"),
            new StudyStatusDto(3L, "SUSPENDED", "Suspended", "Study is temporarily suspended"),
            new StudyStatusDto(4L, "COMPLETED", "Completed", "Study is completed"),
            new StudyStatusDto(5L, "TERMINATED", "Terminated", "Study is terminated")
        );
        
        log.info("REST: Fetched {} study statuses", statuses.size());
        return ResponseEntity.ok(statuses);
    }

    /**
     * Get all regulatory statuses for dropdown
     * 
     * Query: Lookup reference data
     * 
     * @return 200 OK with list of regulatory statuses
     */
    @GetMapping("/lookup/regulatory-statuses")
    public ResponseEntity<List<RegulatoryStatusDto>> getRegulatoryStatuses() {
        log.info("REST: Fetching regulatory statuses");
        
        // TODO: Implement reference data query service
        // For now, return basic values using proper constructor
        List<RegulatoryStatusDto> statuses = List.of(
            new RegulatoryStatusDto(1L, "DRAFT", "Draft", "Draft protocol"),
            new RegulatoryStatusDto(2L, "SUBMITTED", "Submitted", "Submitted to regulatory authority"),
            new RegulatoryStatusDto(3L, "APPROVED", "Approved", "Approved by regulatory authority"),
            new RegulatoryStatusDto(4L, "REJECTED", "Rejected", "Rejected by regulatory authority")
        );
        
        log.info("REST: Fetched {} regulatory statuses", statuses.size());
        return ResponseEntity.ok(statuses);
    }

    /**
     * Get all study phases for dropdown
     * 
     * Query: Lookup reference data
     * 
     * @return 200 OK with list of study phases
     */
    @GetMapping("/lookup/phases")
    public ResponseEntity<List<StudyPhaseDto>> getStudyPhases() {
        log.info("REST: Fetching study phases");
        
        // TODO: Implement reference data query service
        // For now, return basic values using proper constructor
        List<StudyPhaseDto> phases = List.of(
            new StudyPhaseDto(1L, "PHASE_I", "Phase I", "Phase I clinical trial"),
            new StudyPhaseDto(2L, "PHASE_II", "Phase II", "Phase II clinical trial"),
            new StudyPhaseDto(3L, "PHASE_III", "Phase III", "Phase III clinical trial"),
            new StudyPhaseDto(4L, "PHASE_IV", "Phase IV", "Phase IV clinical trial")
        );
        
        log.info("REST: Fetched {} study phases", phases.size());
        return ResponseEntity.ok(phases);
    }

    /**
     * Get dashboard metrics
     * 
     * Query: Aggregate metrics from read model
     * 
     * @return 200 OK with dashboard metrics
     * 
     * NOTE: This method is temporarily disabled until getDashboardMetrics is implemented in StudyQueryService
     */
    @GetMapping("/dashboard/metrics")
    public ResponseEntity<StudyDashboardMetricsDto> getDashboardMetrics() {
        log.info("REST: Fetching dashboard metrics");
        
        try {
            // TODO: Implement getDashboardMetrics in StudyQueryService
            // StudyDashboardMetricsDto metrics = studyQueryService.getDashboardMetrics();
            
            // Temporary: Return basic metrics
            long totalStudies = studyQueryService.getStudyCount();
            StudyDashboardMetricsDto metrics = new StudyDashboardMetricsDto(totalStudies, 0L, 0L, 0L);
            
            log.info("REST: Dashboard metrics fetched - Total: {}", totalStudies);
            
            return ResponseEntity.ok(metrics);
            
        } catch (Exception e) {
            log.error("REST: Error fetching dashboard metrics", e);
            
            // Return empty metrics in case of error
            StudyDashboardMetricsDto fallbackMetrics = new StudyDashboardMetricsDto(0L, 0L, 0L, 0L);
            return ResponseEntity.ok(fallbackMetrics);
        }
    }

    /**
     * Get design progress for a study (supports UUID or legacy ID)
     * 
     * Query: Get design progress from read model
     * 
     * @param id Study identifier (UUID or numeric ID)
     * @return 200 OK with design progress
     * 
     * NOTE: This method is temporarily disabled until getDesignProgress is implemented in StudyQueryService
     */
    @GetMapping("/{id}/design-progress")
    public ResponseEntity<DesignProgressResponseDto> getDesignProgress(@PathVariable String id) {
        log.info("REST: Fetching design progress for study: {}", id);
        
        try {
            // First resolve the identifier to get the study
            UUID studyUuid;
            Long studyIdForResponse;
            
            try {
                studyUuid = UUID.fromString(id);
                log.debug("REST: Using UUID format for design progress");
                // Would need to get numeric ID from UUID when implementing
                studyIdForResponse = null;
            } catch (IllegalArgumentException e) {
                Long legacyId = Long.parseLong(id);
                log.info("REST: Using legacy ID {} for design progress (Bridge Pattern)", legacyId);
                studyIdForResponse = legacyId;
            }
            
            // Get design progress from DesignProgressService
            log.info("REST: Fetching design progress from service for study ID: {}", studyIdForResponse);
            DesignProgressResponseDto progress = designProgressService.getDesignProgress(studyIdForResponse);
            
            log.info("REST: Design progress fetched successfully - {} phases tracked", 
                    progress.getProgressData() != null ? progress.getProgressData().size() : 0);
            
            return ResponseEntity.ok(progress);
            
        } catch (IllegalArgumentException e) {
            log.error("REST: Study not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            log.error("REST: Error fetching design progress for study: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get valid status transitions for a study
     * 
     * Query: Get allowed status transitions based on current state
     * 
     * @param uuid Study aggregate UUID
     * @return 200 OK with list of valid transitions
     * 
     * NOTE: This method is temporarily disabled until getValidStatusTransitions is implemented in StudyQueryService
     */
    @GetMapping("/{uuid}/status/transitions")
    public ResponseEntity<List<String>> getValidStatusTransitions(@PathVariable UUID uuid) {
        log.info("REST: Fetching valid status transitions for study: {}", uuid);
        
        try {
            // TODO: Implement getValidStatusTransitions in StudyQueryService
            // List<String> transitions = studyQueryService.getValidStatusTransitions(uuid);
            
            // Temporary: Return basic transitions
            List<String> transitions = List.of("ACTIVE", "SUSPENDED", "COMPLETED", "TERMINATED");
            
            log.info("REST: Found {} valid status transitions", transitions.size());
            return ResponseEntity.ok(transitions);
            
        } catch (Exception e) {
            log.error("REST: Error fetching status transitions for study: {}", uuid, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Check if study allows modifications
     * 
     * Query: Check if current status allows modifications
     * 
     * @param uuid Study aggregate UUID
     * @return 200 OK with modification permission
     * 
     * NOTE: This method is temporarily disabled until allowsModification is implemented in StudyQueryService
     */
    @GetMapping("/{uuid}/modification-allowed")
    public ResponseEntity<Boolean> isModificationAllowed(@PathVariable UUID uuid) {
        log.info("REST: Checking modification permission for study: {}", uuid);
        
        try {
            // TODO: Implement allowsModification in StudyQueryService
            // boolean allowed = studyQueryService.allowsModification(uuid);
            
            // Temporary: Always return true
            boolean allowed = true;
            
            log.info("REST: Study {} modification allowed: {}", uuid, allowed);
            return ResponseEntity.ok(allowed);
            
        } catch (Exception e) {
            log.error("REST: Error checking modification permission for study: {}", uuid, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Check if study exists by UUID
     * 
     * Query: Check existence in read model
     * 
     * @param uuid Study aggregate UUID
     * @return 200 OK with boolean
     */
    @GetMapping("/{uuid}/exists")
    public ResponseEntity<Boolean> existsByUuid(@PathVariable UUID uuid) {
        log.debug("REST: Checking if study exists: {}", uuid);
        
        boolean exists = studyQueryService.existsByUuid(uuid);
        
        return ResponseEntity.ok(exists);
    }
}
