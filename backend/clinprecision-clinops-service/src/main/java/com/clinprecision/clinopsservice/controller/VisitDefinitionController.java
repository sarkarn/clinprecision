package com.clinprecision.clinopsservice.controller;



import com.clinprecision.common.dto.clinops.VisitDefinitionDto;
import com.clinprecision.common.entity.clinops.VisitDefinitionEntity;
import com.clinprecision.clinopsservice.service.VisitDefinitionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Visit Definition operations
 * Provides endpoints for managing visit schedules in clinical studies
 */
@RestController
@RequestMapping("/api/studies/{studyId}/visits")
@RequiredArgsConstructor
@Slf4j
public class VisitDefinitionController {

    private final VisitDefinitionService visitDefinitionService;

    /**
     * Get all visits for a study
     * GET /api/studies/{studyId}/visits
     */
    @GetMapping
    public ResponseEntity<List<VisitDefinitionDto>> getVisitsByStudyId(@PathVariable Long studyId) {
        log.debug("GET /api/studies/{}/visits", studyId);
        List<VisitDefinitionDto> visits = visitDefinitionService.getVisitsByStudyId(studyId);
        return ResponseEntity.ok(visits);
    }

    /**
     * Get visits for a specific study arm
     * GET /api/studies/{studyId}/visits?armId={armId}
     */
    @GetMapping(params = "armId")
    public ResponseEntity<List<VisitDefinitionDto>> getVisitsByStudyIdAndArm(
            @PathVariable Long studyId,
            @RequestParam Long armId) {
        log.debug("GET /api/studies/{}/visits?armId={}", studyId, armId);
        List<VisitDefinitionDto> visits = visitDefinitionService.getVisitsByStudyIdAndArm(studyId, armId);
        return ResponseEntity.ok(visits);
    }

    /**
     * Get visits by type for a study
     * GET /api/studies/{studyId}/visits/type/{visitType}
     */
    @GetMapping("/type/{visitType}")
    public ResponseEntity<List<VisitDefinitionDto>> getVisitsByType(
            @PathVariable Long studyId,
            @PathVariable VisitDefinitionEntity.VisitType visitType) {
        log.debug("GET /api/studies/{}/visits/type/{}", studyId, visitType);
        List<VisitDefinitionDto> visits = visitDefinitionService.getVisitsByType(studyId, visitType);
        return ResponseEntity.ok(visits);
    }

    /**
     * Get a specific visit by ID
     * GET /api/studies/{studyId}/visits/{visitId}
     */
    @GetMapping("/{visitId}")
    public ResponseEntity<VisitDefinitionDto> getVisitById(
            @PathVariable Long studyId,
            @PathVariable Long visitId) {
        log.debug("GET /api/studies/{}/visits/{}", studyId, visitId);
        VisitDefinitionDto visit = visitDefinitionService.getVisitById(visitId);
        
        // Validate that visit belongs to the study
        if (!visit.getStudyId().equals(studyId)) {
            return ResponseEntity.notFound().build();
        }
        
        return ResponseEntity.ok(visit);
    }

    /**
     * Create a new visit
     * POST /api/studies/{studyId}/visits
     */
    @PostMapping
    public ResponseEntity<VisitDefinitionDto> createVisit(
            @PathVariable Long studyId,
            @Valid @RequestBody VisitDefinitionDto visitDto) {
        log.info("POST /api/studies/{}/visits", studyId);
        
        // Ensure the study ID matches the path parameter
        visitDto.setStudyId(studyId);
        
        VisitDefinitionDto createdVisit = visitDefinitionService.createVisit(visitDto);
        return new ResponseEntity<>(createdVisit, HttpStatus.CREATED);
    }

    /**
     * Update an existing visit
     * PUT /api/studies/{studyId}/visits/{visitId}
     */
    @PutMapping("/{visitId}")
    public ResponseEntity<VisitDefinitionDto> updateVisit(
            @PathVariable Long studyId,
            @PathVariable Long visitId,
            @Valid @RequestBody VisitDefinitionDto visitDto) {
        log.info("PUT /api/studies/{}/visits/{}", studyId, visitId);
        
        // Ensure the study ID matches the path parameter
        visitDto.setStudyId(studyId);
        
        VisitDefinitionDto updatedVisit = visitDefinitionService.updateVisit(visitId, visitDto);
        return ResponseEntity.ok(updatedVisit);
    }

    /**
     * Delete a visit
     * DELETE /api/studies/{studyId}/visits/{visitId}
     */
    @DeleteMapping("/{visitId}")
    public ResponseEntity<Void> deleteVisit(
            @PathVariable Long studyId,
            @PathVariable Long visitId) {
        log.info("DELETE /api/studies/{}/visits/{}", studyId, visitId);
        
        // Verify visit belongs to study before deletion
        VisitDefinitionDto visit = visitDefinitionService.getVisitById(visitId);
        if (!visit.getStudyId().equals(studyId)) {
            return ResponseEntity.notFound().build();
        }
        
        visitDefinitionService.deleteVisit(visitId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Reorder visits within a study
     * PUT /api/studies/{studyId}/visits/reorder
     */
    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderVisits(
            @PathVariable Long studyId,
            @RequestBody List<Long> visitIds) {
        log.info("PUT /api/studies/{}/visits/reorder", studyId);
        
        visitDefinitionService.reorderVisits(studyId, visitIds);
        return ResponseEntity.ok().build();
    }

    /**
     * Order visits within a study (alternative endpoint for frontend compatibility)
     * PUT /api/studies/{studyId}/visits/order
     */
    @PutMapping("/order")
    public ResponseEntity<Void> orderVisits(
            @PathVariable Long studyId,
            @RequestBody Map<String, List<Long>> request) {
        log.info("PUT /api/studies/{}/visits/order", studyId);
        
        List<Long> visitOrder = request.get("visitOrder");
        if (visitOrder != null) {
            visitDefinitionService.reorderVisits(studyId, visitOrder);
        }
        return ResponseEntity.ok().build();
    }

    /**
     * Exception handler for illegal arguments
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException e) {
        log.error("Invalid argument: {}", e.getMessage());
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    /**
     * Exception handler for entity not found
     */
    @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
    public ResponseEntity<String> handleEntityNotFound(jakarta.persistence.EntityNotFoundException e) {
        log.error("Entity not found: {}", e.getMessage());
        return ResponseEntity.notFound().build();
    }
}
