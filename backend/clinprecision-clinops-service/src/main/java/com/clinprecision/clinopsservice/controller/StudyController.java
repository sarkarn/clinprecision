// ...existing code...
// ...existing code...

// ...existing code...
package com.clinprecision.clinopsservice.controller;



import com.clinprecision.clinopsservice.service.StudyService;
import com.clinprecision.clinopsservice.service.AdminServiceProxy;
import com.clinprecision.clinopsservice.service.StudyDashboardService;
import com.clinprecision.clinopsservice.service.DesignProgressService;
import com.clinprecision.clinopsservice.study.service.StudyCommandService;
import com.clinprecision.clinopsservice.study.service.StudyQueryService;
import com.clinprecision.common.dto.clinops.*;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for study operations
 * Handles HTTP requests for study management
 * 
 * DDD Migration Phase 2:
 * - Added DDD/CQRS endpoints using StudyCommandService and StudyQueryService
 * - Legacy endpoints maintained for backward compatibility
 * - New endpoints use UUID-based routing
 */
@RestController
@RequestMapping("/api/studies")
@Validated
public class StudyController {
    
    private static final Logger logger = LoggerFactory.getLogger(StudyController.class);
    
    private final StudyService studyService;
    private final AdminServiceProxy adminServiceProxy;
    private final StudyDashboardService studyDashboardService;
    private final DesignProgressService designProgressService;
    
    // DDD Services (Phase 2)
    private final StudyCommandService studyCommandService;
    private final StudyQueryService studyQueryService;
    
    public StudyController(StudyService studyService, 
                          AdminServiceProxy adminServiceProxy,
                          StudyDashboardService studyDashboardService,
                          DesignProgressService designProgressService,
                          StudyCommandService studyCommandService,
                          StudyQueryService studyQueryService) {
        this.studyService = studyService;
        this.adminServiceProxy = adminServiceProxy;
        this.studyDashboardService = studyDashboardService;
        this.designProgressService = designProgressService;
        this.studyCommandService = studyCommandService;
        this.studyQueryService = studyQueryService;
    }
    
    /**
     * Create a new study
     * POST /api/studies
     */
    @PostMapping
    public ResponseEntity<StudyResponseDto> createStudy(@Valid @RequestBody StudyCreateRequestDto request) {
        logger.info("POST /api/studies - Creating new study: {}", request.getName());
        
        StudyResponseDto response = studyService.createStudy(request);
        
        logger.info("Study created successfully with ID: {}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get study by ID
     * GET /api/studies/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<StudyResponseDto> getStudyById(@PathVariable Long id) {
        logger.info("GET /api/studies/{} - Fetching study", id);
        
        StudyResponseDto response = studyService.getStudyById(id);
        
        logger.info("Study fetched successfully: {}", response.getName());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get study overview data for dashboard
     * GET /api/studies/{id}/overview
     */
    @GetMapping("/{id}/overview")
    public ResponseEntity<StudyResponseDto> getStudyOverview(@PathVariable Long id) {
        logger.info("GET /api/studies/{}/overview - Fetching study overview", id);
        
        StudyResponseDto response = studyService.getStudyOverview(id);
        
        logger.info("Study overview fetched successfully: {}", response.getName());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all studies
     * GET /api/studies
     */
    @GetMapping
    public ResponseEntity<List<StudyResponseDto>> getAllStudies(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "phase", required = false) String phase,
            @RequestParam(value = "sponsor", required = false) String sponsor) {
        logger.info("GET /api/studies - Fetching all studies with filters: status={}, phase={}, sponsor={}", 
                   status, phase, sponsor);
        
        List<StudyResponseDto> response;
        
        // If any filters are provided, use filtered search
        if (status != null || phase != null || sponsor != null) {
            response = studyService.getAllStudiesWithFilters(status, phase, sponsor);
        } else {
            response = studyService.getAllStudies();
        }
        
        logger.info("Fetched {} studies", response.size());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update an existing study
     * PUT /api/studies/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<StudyResponseDto> updateStudy(@PathVariable Long id, 
                                                       @Valid @RequestBody StudyUpdateRequestDto request) {
        logger.info("PUT /api/studies/{} - Updating study", id);
        
        StudyResponseDto response = studyService.updateStudy(id, request);
        
        logger.info("Study updated successfully: {}", response.getName());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update study details (specific endpoint for StudyEditPage.jsx)
     * POST /api/studies/{id}/details
     */
    @PostMapping("/{id}/details")
    public ResponseEntity<StudyResponseDto> updateStudyDetails(@PathVariable Long id, 
                                                              @Valid @RequestBody StudyUpdateRequestDto request) {
        logger.info("POST /api/studies/{}/details - Updating study details", id);
        
        StudyResponseDto response = studyService.updateStudyDetails(id, request);
        
        logger.info("Study details updated successfully: {}", response.getName());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all study statuses
     * GET /api/studies/lookup/statuses
     * Phase 4 Migration: Now uses AdminServiceProxy instead of legacy StudyStatusService
     */
    @GetMapping("/lookup/statuses")
    public ResponseEntity<List<Map<String, Object>>> getStudyStatuses() {
        logger.info("GET /api/studies/lookup/statuses - Fetching study statuses");
        
        List<Map<String, Object>> response = adminServiceProxy.getAllStudyStatuses();
        
        logger.info("Fetched {} study statuses", response.size());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all regulatory statuses
     * GET /api/studies/lookup/regulatory-statuses
     * Phase 4 Migration: Now uses AdminServiceProxy instead of legacy RegulatoryStatusService
     */
    @GetMapping("/lookup/regulatory-statuses")
    public ResponseEntity<List<Map<String, Object>>> getRegulatoryStatuses() {
        logger.info("GET /api/studies/lookup/regulatory-statuses - Fetching regulatory statuses");
        
        List<Map<String, Object>> response = adminServiceProxy.getAllRegulatoryStatuses();
        
        logger.info("Fetched {} regulatory statuses", response.size());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all study phases
     * GET /api/studies/lookup/phases
     * Phase 4 Migration: Now uses AdminServiceProxy instead of legacy StudyPhaseService
     */
    @GetMapping("/lookup/phases")
    public ResponseEntity<List<Map<String, Object>>> getStudyPhases() {
        logger.info("GET /api/studies/lookup/phases - Fetching study phases");
        
        List<Map<String, Object>> response = adminServiceProxy.getAllStudyPhases();
        
        logger.info("Fetched {} study phases", response.size());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get dashboard metrics
     * GET /api/studies/dashboard/metrics
     */
    @GetMapping("/dashboard/metrics")
    public ResponseEntity<StudyDashboardMetricsDto> getDashboardMetrics() {
        logger.info("GET /api/studies/dashboard/metrics - Fetching dashboard metrics");
        
        try {
            StudyDashboardMetricsDto metrics = studyDashboardService.getDashboardMetrics();
            
            logger.info("Dashboard metrics fetched successfully - Active: {}, Draft: {}, Completed: {}, Amendments: {}", 
                       metrics.getActiveStudies(), metrics.getDraftProtocols(), 
                       metrics.getCompletedStudies(), metrics.getTotalAmendments());
            
            return ResponseEntity.ok(metrics);
            
        } catch (Exception e) {
            logger.error("Error fetching dashboard metrics", e);
            
            // Return empty metrics in case of error
            StudyDashboardMetricsDto fallbackMetrics = new StudyDashboardMetricsDto(0L, 0L, 0L, 0L);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(fallbackMetrics);
        }
    }

    /**
     * Get design progress for a study
     * GET /api/studies/{id}/design-progress
     */
    @GetMapping("/{id}/design-progress")
    public ResponseEntity<DesignProgressResponseDto> getDesignProgress(@PathVariable Long id) {
        logger.info("GET /api/studies/{}/design-progress - Fetching design progress", id);
        
        try {
            DesignProgressResponseDto response = designProgressService.getDesignProgress(id);
            
            logger.info("Design progress fetched successfully for study {} with overall completion: {}%", 
                       id, response.getOverallCompletion());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.error("Study not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            logger.error("Error fetching design progress for study {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update design progress for a study
     * PUT /api/studies/{id}/design-progress
     */
    @PutMapping("/{id}/design-progress")
    public ResponseEntity<DesignProgressResponseDto> updateDesignProgress(
            @PathVariable Long id, 
            @Valid @RequestBody DesignProgressUpdateRequestDto request) {
        logger.info("PUT /api/studies/{}/design-progress - Updating design progress", id);
        
        try {
            DesignProgressResponseDto response = designProgressService.updateDesignProgress(id, request);
            
            logger.info("Design progress updated successfully for study {} with overall completion: {}%", 
                       id, response.getOverallCompletion());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
            
        } catch (Exception e) {
            logger.error("Error updating design progress for study {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Initialize design progress for a study
     * POST /api/studies/{id}/design-progress/initialize
     */
    @PostMapping("/{id}/design-progress/initialize")
    public ResponseEntity<DesignProgressResponseDto> initializeDesignProgress(@PathVariable Long id) {
        logger.info("POST /api/studies/{}/design-progress/initialize - Initializing design progress", id);
        
        try {
            DesignProgressResponseDto response = designProgressService.initializeDesignProgress(id);
            
            logger.info("Design progress initialized successfully for study {}", id);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            logger.error("Study not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            logger.error("Error initializing design progress for study {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Publish a study (set status to ACTIVE)
     * PATCH /api/studies/{id}/publish
     */
    @PatchMapping("/{id}/publish")
    public ResponseEntity<StudyResponseDto> publishStudy(@PathVariable Long id) {
        logger.info("PATCH /api/studies/{}/publish - Publishing study", id);
        StudyResponseDto response = studyService.publishStudy(id);
        logger.info("Study {} published successfully", id);
        return ResponseEntity.ok(response);
    }

    /**
     * Change study status
     * PATCH /api/studies/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<StudyResponseDto> changeStudyStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String newStatus = request.get("newStatus");
        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("newStatus is required");
        }
        
        logger.info("PATCH /api/studies/{}/status - Changing status to {}", id, newStatus);
        StudyResponseDto response = studyService.changeStudyStatus(id, newStatus);
        logger.info("Study {} status changed to {} successfully", id, newStatus);
        return ResponseEntity.ok(response);
    }
    
    // ==================== DDD/CQRS ENDPOINTS (Phase 2) ====================
    
    /**
     * Create a new study using DDD/CQRS pattern
     * POST /api/studies/ddd
     * 
     * @param request Study creation request
     * @return Created study with UUID
     */
    @PostMapping("/ddd")
    public ResponseEntity<com.clinprecision.clinopsservice.study.dto.response.StudyResponseDto> createStudyDDD(
            @Valid @RequestBody com.clinprecision.clinopsservice.study.dto.request.StudyCreateRequestDto request) {
        logger.info("POST /api/studies/ddd - Creating new study via DDD: {}", request.getName());
        
        UUID studyUuid = studyCommandService.createStudy(request);
        com.clinprecision.clinopsservice.study.dto.response.StudyResponseDto response = studyQueryService.getStudyByUuid(studyUuid);
        
        logger.info("Study created successfully with UUID: {}", studyUuid);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Get study by UUID (DDD identifier)
     * GET /api/studies/uuid/{uuid}
     * 
     * @param uuid Study aggregate UUID
     * @return Study details
     */
    @GetMapping("/uuid/{uuid}")
    public ResponseEntity<com.clinprecision.clinopsservice.study.dto.response.StudyResponseDto> getStudyByUuid(
            @PathVariable UUID uuid) {
        logger.info("GET /api/studies/uuid/{} - Fetching study by UUID", uuid);
        
        com.clinprecision.clinopsservice.study.dto.response.StudyResponseDto response = studyQueryService.getStudyByUuid(uuid);
        
        logger.info("Study fetched successfully: {}", response.getName());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all studies using DDD read model
     * GET /api/studies/ddd
     * 
     * @return List of studies
     */
    @GetMapping("/ddd")
    public ResponseEntity<List<com.clinprecision.clinopsservice.study.dto.response.StudyListResponseDto>> getAllStudiesDDD() {
        logger.info("GET /api/studies/ddd - Fetching all studies via DDD");
        
        List<com.clinprecision.clinopsservice.study.dto.response.StudyListResponseDto> response = studyQueryService.getAllStudies();
        
        logger.info("Fetched {} studies via DDD", response.size());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Update study using DDD/CQRS pattern
     * PUT /api/studies/uuid/{uuid}
     * 
     * @param uuid Study aggregate UUID
     * @param request Update request (partial update)
     * @return Updated study
     */
    @PutMapping("/uuid/{uuid}")
    public ResponseEntity<com.clinprecision.clinopsservice.study.dto.response.StudyResponseDto> updateStudyDDD(
            @PathVariable UUID uuid,
            @Valid @RequestBody com.clinprecision.clinopsservice.study.dto.request.StudyUpdateRequestDto request) {
        logger.info("PUT /api/studies/uuid/{} - Updating study via DDD", uuid);
        
        studyCommandService.updateStudy(uuid, request);
        com.clinprecision.clinopsservice.study.dto.response.StudyResponseDto response = studyQueryService.getStudyByUuid(uuid);
        
        logger.info("Study updated successfully: {}", response.getName());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Suspend study
     * POST /api/studies/uuid/{uuid}/suspend
     * 
     * @param uuid Study aggregate UUID
     * @param request Suspension request with reason
     * @return Void
     */
    @PostMapping("/uuid/{uuid}/suspend")
    public ResponseEntity<Void> suspendStudy(
            @PathVariable UUID uuid,
            @Valid @RequestBody com.clinprecision.clinopsservice.study.dto.request.SuspendStudyRequestDto request) {
        logger.info("POST /api/studies/uuid/{}/suspend - Suspending study", uuid);
        
        studyCommandService.suspendStudy(uuid, request);
        
        logger.info("Study suspended successfully: {}", uuid);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Terminate study
     * POST /api/studies/uuid/{uuid}/terminate
     * 
     * @param uuid Study aggregate UUID
     * @param request Termination request with reason
     * @return Void
     */
    @PostMapping("/uuid/{uuid}/terminate")
    public ResponseEntity<Void> terminateStudy(
            @PathVariable UUID uuid,
            @Valid @RequestBody com.clinprecision.clinopsservice.study.dto.request.TerminateStudyRequestDto request) {
        logger.info("POST /api/studies/uuid/{}/terminate - Terminating study", uuid);
        
        studyCommandService.terminateStudy(uuid, request);
        
        logger.warn("Study terminated (terminal state): {}", uuid);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Withdraw study
     * POST /api/studies/uuid/{uuid}/withdraw
     * 
     * @param uuid Study aggregate UUID
     * @param request Withdrawal request with reason
     * @return Void
     */
    @PostMapping("/uuid/{uuid}/withdraw")
    public ResponseEntity<Void> withdrawStudy(
            @PathVariable UUID uuid,
            @Valid @RequestBody com.clinprecision.clinopsservice.study.dto.request.WithdrawStudyRequestDto request) {
        logger.info("POST /api/studies/uuid/{}/withdraw - Withdrawing study", uuid);
        
        studyCommandService.withdrawStudy(uuid, request);
        
        logger.warn("Study withdrawn (terminal state): {}", uuid);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Complete study
     * POST /api/studies/uuid/{uuid}/complete
     * 
     * @param uuid Study aggregate UUID
     * @return Void
     */
    @PostMapping("/uuid/{uuid}/complete")
    public ResponseEntity<Void> completeStudy(@PathVariable UUID uuid) {
        logger.info("POST /api/studies/uuid/{}/complete - Completing study", uuid);
        
        studyCommandService.completeStudy(uuid);
        
        logger.info("Study completed successfully: {}", uuid);
        return ResponseEntity.noContent().build();
    }
}
