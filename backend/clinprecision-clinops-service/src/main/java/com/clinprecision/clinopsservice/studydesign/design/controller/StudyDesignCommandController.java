package com.clinprecision.clinopsservice.studydesign.design.controller;

import com.clinprecision.clinopsservice.studydesign.design.arm.dto.AddStudyArmRequest;
import com.clinprecision.clinopsservice.studydesign.design.arm.dto.UpdateStudyArmRequest;
import com.clinprecision.clinopsservice.studydesign.design.dto.*;
import com.clinprecision.clinopsservice.studydesign.design.service.StudyDesignCommandService;
import com.clinprecision.clinopsservice.studydesign.design.service.StudyDesignQueryService;
import com.clinprecision.clinopsservice.studydesign.design.service.StudyDesignAutoInitializationService;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.dto.DefineVisitDefinitionRequest;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.dto.UpdateVisitDefinitionRequest;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.dto.VisitDefinitionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    private final StudyDesignQueryService queryService;
    private final StudyDesignAutoInitializationService autoInitService;

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
            @RequestBody DefineVisitDefinitionRequest request) {
        log.info("REST: Define visit '{}' in design: {}", request.getName(), studyDesignId);
        
        return commandService.defineVisit(studyDesignId, request)
            .thenApply(result -> ResponseEntity.status(HttpStatus.CREATED).<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to define visit", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Auto-initialize and define visit (Bridge Pattern)
     * Accepts study ID (legacy or UUID) and automatically ensures StudyDesignAggregate exists
     * 
     * @param studyId Study identifier (legacy ID or UUID)
     * @param request Visit definition request
     * @return 201 Created with visit UUID
     */
    @PostMapping("/studies/{studyId}/visits")
    public CompletableFuture<ResponseEntity<Map<String, UUID>>> defineVisitForStudy(
            @PathVariable String studyId,
            @RequestBody DefineVisitDefinitionRequest request) {
        log.info("REST: Auto-define visit '{}' for study: {}", request.getName(), studyId);
        
        return autoInitService.ensureStudyDesignExists(studyId)
            .thenCompose(studyDesignId -> {
                log.debug("Using StudyDesignId: {} for study: {}", studyDesignId, studyId);
                return commandService.defineVisit(studyDesignId, request);
            })
            .thenApply(visitId -> {
                Map<String, UUID> response = Map.of("visitId", visitId);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            })
            .exceptionally(ex -> {
                log.error("Failed to auto-define visit for study: {}", studyId, ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Get all visits for a study with auto-initialization (Bridge endpoint)
     * GET /api/clinops/study-design/studies/{studyId}/visits
     */
    @GetMapping("/studies/{studyId}/visits")
    public CompletableFuture<ResponseEntity<List<VisitDefinitionResponse>>> getVisitsForStudy(
            @PathVariable String studyId) {
        log.info("REST: Auto-get visits for study: {}", studyId);
        
        return autoInitService.ensureStudyDesignExists(studyId)
            .thenCompose(studyDesignId -> {
                log.debug("Using StudyDesignId: {} for study: {}", studyDesignId, studyId);
                List<VisitDefinitionResponse> visits = queryService.getVisits(studyDesignId);
                return CompletableFuture.completedFuture(visits);
            })
            .thenApply(visits -> ResponseEntity.ok(visits))
            .exceptionally(ex -> {
                log.error("Failed to auto-get visits for study: {}", studyId, ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Auto-initialize and add study arm (Bridge Pattern)
     * Accepts study ID (legacy or UUID) and automatically ensures StudyDesignAggregate exists
     * 
     * @param studyId Study identifier (legacy ID or UUID)
     * @param request Arm definition request
     * @return 201 Created with arm UUID
     */
    @PostMapping("/studies/{studyId}/arms")
    public CompletableFuture<ResponseEntity<Map<String, UUID>>> addArmForStudy(
            @PathVariable String studyId,
            @RequestBody AddStudyArmRequest request) {
        log.info("REST: Auto-add arm '{}' for study: {}", request.getName(), studyId);
        
        return autoInitService.ensureStudyDesignExists(studyId)
            .thenCompose(studyDesignId -> {
                log.debug("Using StudyDesignId: {} for study: {}", studyDesignId, studyId);
                return commandService.addStudyArm(studyDesignId, request);
            })
            .thenApply(armId -> {
                Map<String, UUID> response = Map.of("armId", armId);
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            })
            .exceptionally(ex -> {
                log.error("Failed to auto-add arm for study: {}", studyId, ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Update a visit with auto-initialization (Bridge endpoint)
     * PUT /api/clinops/study-design/studies/{studyId}/visits/{visitId}
     */
    @PutMapping("/studies/{studyId}/visits/{visitId}")
    public CompletableFuture<ResponseEntity<Void>> updateVisitForStudy(
            @PathVariable String studyId,
            @PathVariable UUID visitId,
            @RequestBody UpdateVisitDefinitionRequest request) {
        log.info("REST: Auto-update visit {} for study: {}", visitId, studyId);
        
        return autoInitService.ensureStudyDesignExists(studyId)
            .thenCompose(studyDesignId -> {
                log.debug("Using StudyDesignId: {} for study: {}", studyDesignId, studyId);
                return commandService.updateVisit(studyDesignId, visitId, request);
            })
            .thenApply(result -> ResponseEntity.ok().<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to auto-update visit for study: {}", studyId, ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Delete a visit with auto-initialization (Bridge endpoint)
     * DELETE /api/clinops/study-design/studies/{studyId}/visits/{visitId}
     */
    @DeleteMapping("/studies/{studyId}/visits/{visitId}")
    public CompletableFuture<ResponseEntity<Void>> removeVisitForStudy(
            @PathVariable String studyId,
            @PathVariable UUID visitId) {
        log.info("REST: Auto-remove visit {} for study: {}", visitId, studyId);
        
        return autoInitService.ensureStudyDesignExists(studyId)
            .thenCompose(studyDesignId -> {
                log.debug("Using StudyDesignId: {} for study: {}", studyDesignId, studyId);
                return commandService.removeVisit(studyDesignId, visitId, "Removed via API", 1L);
            })
            .thenApply(result -> ResponseEntity.ok().<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to auto-remove visit for study: {}", studyId, ex);
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
            @RequestBody UpdateVisitDefinitionRequest request) {
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

    // ===================== DESIGN PROGRESS COMMANDS =====================

    /**
     * Initialize design progress for a study
     * 
     * Command: InitializeDesignProgressCommand
     * Event: DesignProgressInitializedEvent
     * 
     * @param studyDesignId Study design aggregate UUID
     * @return 201 Created
     */
    @PostMapping("/{studyDesignId}/design-progress/initialize")
    public CompletableFuture<ResponseEntity<Void>> initializeDesignProgress(@PathVariable UUID studyDesignId) {
        log.info("REST: Initializing design progress for study design: {}", studyDesignId);
        
        // TODO: Implement design progress initialization command
        // return commandService.initializeDesignProgress(studyDesignId)
        //     .thenApply(result -> ResponseEntity.status(HttpStatus.CREATED).<Void>build())
        //     .exceptionally(ex -> {
        //         log.error("Failed to initialize design progress", ex);
        //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        //     });
        
        log.warn("Design progress initialization not yet implemented");
        return CompletableFuture.completedFuture(ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build());
    }

    /**
     * Update design progress for a study
     * 
     * Command: UpdateDesignProgressCommand
     * Event: DesignProgressUpdatedEvent
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param request Design progress update request
     * @return 200 OK
     */
    @PutMapping("/{studyDesignId}/design-progress")
    public CompletableFuture<ResponseEntity<Void>> updateDesignProgress(
            @PathVariable UUID studyDesignId,
            @RequestBody Map<String, Object> request) {
        
        log.info("REST: Updating design progress for study design: {}", studyDesignId);
        
        // TODO: Implement design progress update command
        // return commandService.updateDesignProgress(studyDesignId, request)
        //     .thenApply(result -> ResponseEntity.ok().<Void>build())
        //     .exceptionally(ex -> {
        //         log.error("Failed to update design progress", ex);
        //         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        //     });
        
        log.warn("Design progress update not yet implemented");
        return CompletableFuture.completedFuture(ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build());
    }
}
