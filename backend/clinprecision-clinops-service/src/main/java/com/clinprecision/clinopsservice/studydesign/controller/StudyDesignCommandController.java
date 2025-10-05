package com.clinprecision.clinopsservice.studydesign.controller;

import com.clinprecision.clinopsservice.studydesign.dto.*;
import com.clinprecision.clinopsservice.studydesign.service.StudyDesignCommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * REST Controller for StudyDesign write operations (commands)
 * Handles all mutations to the study design aggregate
 */
@RestController
@RequestMapping("/api/clinops/study-design")
@RequiredArgsConstructor
@Slf4j
public class StudyDesignCommandController {

    private final StudyDesignCommandService commandService;

    /**
     * Initialize a new study design
     * POST /api/clinops/study-design
     */
    @PostMapping
    public CompletableFuture<ResponseEntity<Map<String, UUID>>> initializeStudyDesign(
            @RequestBody InitializeStudyDesignRequest request) {
        log.info("REST: Initialize study design for study: {}", request.getStudyAggregateUuid());
        
        return commandService.initializeStudyDesign(request)
            .thenApply(studyDesignId -> ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of("studyDesignId", studyDesignId)))
            .exceptionally(ex -> {
                log.error("Failed to initialize study design", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    // ===================== STUDY ARM COMMANDS =====================

    /**
     * Add a study arm
     * POST /api/clinops/study-design/{studyDesignId}/arms
     */
    @PostMapping("/{studyDesignId}/arms")
    public CompletableFuture<ResponseEntity<Void>> addStudyArm(
            @PathVariable UUID studyDesignId,
            @RequestBody AddStudyArmRequest request) {
        log.info("REST: Add study arm '{}' to design: {}", request.getName(), studyDesignId);
        
        return commandService.addStudyArm(studyDesignId, request)
            .thenApply(result -> ResponseEntity.status(HttpStatus.CREATED).<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to add study arm", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Update a study arm
     * PUT /api/clinops/study-design/{studyDesignId}/arms/{armId}
     */
    @PutMapping("/{studyDesignId}/arms/{armId}")
    public CompletableFuture<ResponseEntity<Void>> updateStudyArm(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID armId,
            @RequestBody UpdateStudyArmRequest request) {
        log.info("REST: Update study arm {} in design: {}", armId, studyDesignId);
        
        return commandService.updateStudyArm(studyDesignId, armId, request)
            .thenApply(result -> ResponseEntity.ok().<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to update study arm", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Remove a study arm
     * DELETE /api/clinops/study-design/{studyDesignId}/arms/{armId}
     */
    @DeleteMapping("/{studyDesignId}/arms/{armId}")
    public CompletableFuture<ResponseEntity<Void>> removeStudyArm(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID armId,
            @RequestParam String reason,
            @RequestParam Long removedBy) {
        log.info("REST: Remove study arm {} from design: {}", armId, studyDesignId);
        
        return commandService.removeStudyArm(studyDesignId, armId, reason, removedBy)
            .thenApply(result -> ResponseEntity.noContent().<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to remove study arm", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    // ===================== VISIT COMMANDS =====================

    /**
     * Define a visit
     * POST /api/clinops/study-design/{studyDesignId}/visits
     */
    @PostMapping("/{studyDesignId}/visits")
    public CompletableFuture<ResponseEntity<Void>> defineVisit(
            @PathVariable UUID studyDesignId,
            @RequestBody DefineVisitRequest request) {
        log.info("REST: Define visit '{}' in design: {}", request.getName(), studyDesignId);
        
        return commandService.defineVisit(studyDesignId, request)
            .thenApply(result -> ResponseEntity.status(HttpStatus.CREATED).<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to define visit", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Update a visit
     * PUT /api/clinops/study-design/{studyDesignId}/visits/{visitId}
     */
    @PutMapping("/{studyDesignId}/visits/{visitId}")
    public CompletableFuture<ResponseEntity<Void>> updateVisit(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID visitId,
            @RequestBody UpdateVisitRequest request) {
        log.info("REST: Update visit {} in design: {}", visitId, studyDesignId);
        
        return commandService.updateVisit(studyDesignId, visitId, request)
            .thenApply(result -> ResponseEntity.ok().<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to update visit", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Remove a visit
     * DELETE /api/clinops/study-design/{studyDesignId}/visits/{visitId}
     */
    @DeleteMapping("/{studyDesignId}/visits/{visitId}")
    public CompletableFuture<ResponseEntity<Void>> removeVisit(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID visitId,
            @RequestParam String reason,
            @RequestParam Long removedBy) {
        log.info("REST: Remove visit {} from design: {}", visitId, studyDesignId);
        
        return commandService.removeVisit(studyDesignId, visitId, reason, removedBy)
            .thenApply(result -> ResponseEntity.noContent().<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to remove visit", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    // ===================== FORM ASSIGNMENT COMMANDS =====================

    /**
     * Assign a form to a visit
     * POST /api/clinops/study-design/{studyDesignId}/form-assignments
     */
    @PostMapping("/{studyDesignId}/form-assignments")
    public CompletableFuture<ResponseEntity<Void>> assignFormToVisit(
            @PathVariable UUID studyDesignId,
            @RequestBody AssignFormToVisitRequest request) {
        log.info("REST: Assign form {} to visit {} in design: {}", 
            request.getFormId(), request.getVisitId(), studyDesignId);
        
        return commandService.assignFormToVisit(studyDesignId, request)
            .thenApply(result -> ResponseEntity.status(HttpStatus.CREATED).<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to assign form to visit", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Update a form assignment
     * PUT /api/clinops/study-design/{studyDesignId}/form-assignments/{assignmentId}
     */
    @PutMapping("/{studyDesignId}/form-assignments/{assignmentId}")
    public CompletableFuture<ResponseEntity<Void>> updateFormAssignment(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID assignmentId,
            @RequestBody UpdateFormAssignmentRequest request) {
        log.info("REST: Update form assignment {} in design: {}", assignmentId, studyDesignId);
        
        return commandService.updateFormAssignment(studyDesignId, assignmentId, request)
            .thenApply(result -> ResponseEntity.ok().<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to update form assignment", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Remove a form assignment
     * DELETE /api/clinops/study-design/{studyDesignId}/form-assignments/{assignmentId}
     */
    @DeleteMapping("/{studyDesignId}/form-assignments/{assignmentId}")
    public CompletableFuture<ResponseEntity<Void>> removeFormAssignment(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID assignmentId,
            @RequestParam String reason,
            @RequestParam Long removedBy) {
        log.info("REST: Remove form assignment {} from design: {}", assignmentId, studyDesignId);
        
        return commandService.removeFormAssignment(studyDesignId, assignmentId, reason, removedBy)
            .thenApply(result -> ResponseEntity.noContent().<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to remove form assignment", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }
}
