// ...existing code...
// ...existing code...

// ...existing code...
package com.clinprecision.studydesignservice.controller;


import com.clinprecision.common.dto.studydesign.*;
import com.clinprecision.studydesignservice.service.StudyService;
import com.clinprecision.studydesignservice.service.StudyStatusService;
import com.clinprecision.studydesignservice.service.RegulatoryStatusService;
import com.clinprecision.studydesignservice.service.StudyPhaseService;
import com.clinprecision.studydesignservice.service.StudyDashboardService;
import com.clinprecision.studydesignservice.service.DesignProgressService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for study operations
 * Handles HTTP requests for study management
 */
@RestController
@RequestMapping("/api/studies")
@Validated
public class StudyController {
    
    private static final Logger logger = LoggerFactory.getLogger(StudyController.class);
    
    private final StudyService studyService;
    private final StudyStatusService studyStatusService;
    private final RegulatoryStatusService regulatoryStatusService;
    private final StudyPhaseService studyPhaseService;
    private final StudyDashboardService studyDashboardService;
    private final DesignProgressService designProgressService;
    
    public StudyController(StudyService studyService, 
                          StudyStatusService studyStatusService,
                          RegulatoryStatusService regulatoryStatusService,
                          StudyPhaseService studyPhaseService,
                          StudyDashboardService studyDashboardService,
                          DesignProgressService designProgressService) {
        this.studyService = studyService;
        this.studyStatusService = studyStatusService;
        this.regulatoryStatusService = regulatoryStatusService;
        this.studyPhaseService = studyPhaseService;
        this.studyDashboardService = studyDashboardService;
        this.designProgressService = designProgressService;
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
     */
    @GetMapping("/lookup/statuses")
    public ResponseEntity<List<StudyStatusDto>> getStudyStatuses() {
        logger.info("GET /api/studies/lookup/statuses - Fetching study statuses");
        
        List<StudyStatusDto> response = studyStatusService.getAllActiveStatuses();
        
        logger.info("Fetched {} study statuses", response.size());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all regulatory statuses
     * GET /api/studies/lookup/regulatory-statuses
     */
    @GetMapping("/lookup/regulatory-statuses")
    public ResponseEntity<List<RegulatoryStatusDto>> getRegulatoryStatuses() {
        logger.info("GET /api/studies/lookup/regulatory-statuses - Fetching regulatory statuses");
        
        List<RegulatoryStatusDto> response = regulatoryStatusService.getAllActiveStatuses();
        
        logger.info("Fetched {} regulatory statuses", response.size());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all study phases
     * GET /api/studies/lookup/phases
     */
    @GetMapping("/lookup/phases")
    public ResponseEntity<List<StudyPhaseDto>> getStudyPhases() {
        logger.info("GET /api/studies/lookup/phases - Fetching study phases");
        
        List<StudyPhaseDto> response = studyPhaseService.getAllActivePhases();
        
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
        try {
            StudyResponseDto response = studyService.publishStudy(id);
            logger.info("Study {} published successfully", id);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            logger.error("Error publishing study {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Unexpected error publishing study {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
