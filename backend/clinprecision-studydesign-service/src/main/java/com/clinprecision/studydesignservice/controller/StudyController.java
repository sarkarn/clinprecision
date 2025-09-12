package com.clinprecision.studydesignservice.controller;

import com.clinprecision.studydesignservice.dto.StudyCreateRequestDto;
import com.clinprecision.studydesignservice.dto.StudyResponseDto;
import com.clinprecision.studydesignservice.dto.StudyUpdateRequestDto;
import com.clinprecision.studydesignservice.dto.StudyStatusDto;
import com.clinprecision.studydesignservice.dto.RegulatoryStatusDto;
import com.clinprecision.studydesignservice.dto.StudyPhaseDto;
import com.clinprecision.studydesignservice.service.StudyService;
import com.clinprecision.studydesignservice.service.StudyStatusService;
import com.clinprecision.studydesignservice.service.RegulatoryStatusService;
import com.clinprecision.studydesignservice.service.StudyPhaseService;
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
    
    public StudyController(StudyService studyService, 
                          StudyStatusService studyStatusService,
                          RegulatoryStatusService regulatoryStatusService,
                          StudyPhaseService studyPhaseService) {
        this.studyService = studyService;
        this.studyStatusService = studyStatusService;
        this.regulatoryStatusService = regulatoryStatusService;
        this.studyPhaseService = studyPhaseService;
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
}
