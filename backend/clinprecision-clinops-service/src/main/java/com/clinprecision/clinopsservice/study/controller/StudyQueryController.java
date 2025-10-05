package com.clinprecision.clinopsservice.study.controller;

import com.clinprecision.clinopsservice.study.dto.response.StudyListResponseDto;
import com.clinprecision.clinopsservice.study.dto.response.StudyResponseDto;
import com.clinprecision.clinopsservice.study.service.StudyQueryService;
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
     * Get study by aggregate UUID
     * 
     * Query: Find study by UUID in read model
     * 
     * @param uuid Study aggregate UUID
     * @return 200 OK with study details
     * @throws StudyNotFoundException if study not found
     */
    @GetMapping("/{uuid}")
    public ResponseEntity<StudyResponseDto> getStudyByUuid(@PathVariable UUID uuid) {
        log.info("REST: Fetching study by UUID: {}", uuid);
        
        StudyResponseDto study = studyQueryService.getStudyByUuid(uuid);
        
        log.info("REST: Study fetched successfully: {}", study.getName());
        return ResponseEntity.ok(study);
    }

    /**
     * Get study overview data for dashboard
     * 
     * Query: Find study with aggregated metrics
     * 
     * @param uuid Study aggregate UUID
     * @return 200 OK with study overview
     */
    @GetMapping("/{uuid}/overview")
    public ResponseEntity<StudyResponseDto> getStudyOverview(@PathVariable UUID uuid) {
        log.info("REST: Fetching study overview: {}", uuid);
        
        StudyResponseDto study = studyQueryService.getStudyByUuid(uuid);
        
        log.info("REST: Study overview fetched successfully: {}", study.getName());
        return ResponseEntity.ok(study);
    }

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
     * Get design progress for a study
     * 
     * Query: Get design progress from read model
     * 
     * @param uuid Study aggregate UUID
     * @return 200 OK with design progress
     * 
     * NOTE: This method is temporarily disabled until getDesignProgress is implemented in StudyQueryService
     */
    @GetMapping("/{uuid}/design-progress")
    public ResponseEntity<DesignProgressResponseDto> getDesignProgress(@PathVariable UUID uuid) {
        log.info("REST: Fetching design progress for study: {}", uuid);
        
        try {
            // TODO: Implement getDesignProgress in StudyQueryService
            // DesignProgressResponseDto progress = studyQueryService.getDesignProgress(uuid);
            
            log.warn("REST: Design progress not yet implemented - returning 501 Not Implemented");
            return ResponseEntity.status(501).build();
            
        } catch (IllegalArgumentException e) {
            log.error("REST: Study not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            log.error("REST: Error fetching design progress for study: {}", uuid, e);
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
