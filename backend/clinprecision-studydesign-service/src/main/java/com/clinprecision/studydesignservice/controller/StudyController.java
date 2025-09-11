package com.clinprecision.studydesignservice.controller;

import com.clinprecision.studydesignservice.dto.StudyCreateRequestDto;
import com.clinprecision.studydesignservice.dto.StudyResponseDto;
import com.clinprecision.studydesignservice.dto.StudyUpdateRequestDto;
import com.clinprecision.studydesignservice.service.StudyService;
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
    
    public StudyController(StudyService studyService) {
        this.studyService = studyService;
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
    public ResponseEntity<List<StudyResponseDto>> getAllStudies() {
        logger.info("GET /api/studies - Fetching all studies");
        
        List<StudyResponseDto> response = studyService.getAllStudies();
        
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
}
