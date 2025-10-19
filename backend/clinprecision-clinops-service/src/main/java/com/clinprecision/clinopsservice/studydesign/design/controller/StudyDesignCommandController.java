package com.clinprecision.clinopsservice.studydesign.design.controller;

import com.clinprecision.clinopsservice.common.util.DeprecationHeaderUtil;
import com.clinprecision.clinopsservice.studydesign.design.api.StudyDesignApiConstants;
import com.clinprecision.clinopsservice.studydesign.design.arm.dto.AddStudyArmRequest;
import com.clinprecision.clinopsservice.studydesign.design.arm.dto.UpdateStudyArmRequest;
import com.clinprecision.clinopsservice.studydesign.design.dto.*;
import com.clinprecision.clinopsservice.studydesign.design.service.StudyDesignCommandService;
import com.clinprecision.clinopsservice.studydesign.design.service.StudyDesignQueryService;
import com.clinprecision.clinopsservice.studydesign.design.service.StudyDesignAutoInitializationService;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.dto.DefineVisitDefinitionRequest;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.dto.UpdateVisitDefinitionRequest;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.dto.VisitDefinitionResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
 * Handles all mutations to the study design aggregate (arms, visits, form assignments, design progress)
 * 
 * <p><b>URL Migration (DDD Alignment):</b></p>
 * <ul>
 *   <li>OLD: {@code /api/clinops/study-design/*}</li>
 *   <li>NEW: {@code /api/v1/study-design/designs/*}</li>
 * </ul>
 * 
 * <p><b>Deprecation Timeline:</b></p>
 * <ul>
 *   <li>Deprecated: October 19, 2025</li>
 *   <li>Sunset Date: April 19, 2026</li>
 *   <li>Removal: After April 19, 2026</li>
 * </ul>
 * 
 * <p><b>Bridge Endpoints:</b> Support auto-initialization pattern via {@code /studies/{studyId}/*}</p>
 * 
 * @see StudyDesignApiConstants
 * @see DeprecationHeaderUtil
 * @since October 2025 - Module 1.3 Study Design Management
 */
@RestController
@RequestMapping({
    StudyDesignApiConstants.DESIGNS_PATH,                  // NEW: /api/v1/study-design/designs
    StudyDesignApiConstants.LEGACY_CLINOPS_STUDY_DESIGN    // OLD: /api/clinops/study-design (deprecated)
})
@RequiredArgsConstructor
@Slf4j
public class StudyDesignCommandController {

    private final StudyDesignCommandService commandService;
    private final StudyDesignQueryService queryService;
    private final StudyDesignAutoInitializationService autoInitService;

    /**
     * Initialize a new study design
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code POST /api/v1/study-design/designs}</li>
     *   <li>OLD: {@code POST /api/clinops/study-design} (deprecated)</li>
     * </ul>
     * 
     * @param request Initialization request with study aggregate UUID
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return CompletableFuture with created study design ID
     */
    @PostMapping
    public CompletableFuture<ResponseEntity<Map<String, UUID>>> initializeStudyDesign(
            @RequestBody InitializeStudyDesignRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Initialize study design for study: {}", request.getStudyAggregateUuid());
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
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
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code POST /api/v1/study-design/designs/{studyDesignId}/arms}</li>
     *   <li>OLD: {@code POST /api/clinops/study-design/{studyDesignId}/arms} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param request Add arm request
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return CompletableFuture with 201 Created
     */
    @PostMapping("/{studyDesignId}/arms")
    public CompletableFuture<ResponseEntity<Void>> addStudyArm(
            @PathVariable UUID studyDesignId,
            @RequestBody AddStudyArmRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Add study arm '{}' to design: {}", request.getName(), studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.ARMS,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        return commandService.addStudyArm(studyDesignId, request)
            .thenApply(result -> ResponseEntity.status(HttpStatus.CREATED).<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to add study arm", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Update a study arm
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code PUT /api/v1/study-design/designs/{studyDesignId}/arms/{armId}}</li>
     *   <li>OLD: {@code PUT /api/clinops/study-design/{studyDesignId}/arms/{armId}} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param armId Arm UUID
     * @param request Update arm request
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return CompletableFuture with 200 OK
     */
    @PutMapping("/{studyDesignId}/arms/{armId}")
    public CompletableFuture<ResponseEntity<Void>> updateStudyArm(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID armId,
            @RequestBody UpdateStudyArmRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Update study arm {} in design: {}", armId, studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.ARM_BY_ID,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        return commandService.updateStudyArm(studyDesignId, armId, request)
            .thenApply(result -> ResponseEntity.ok().<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to update study arm", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Remove a study arm
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code DELETE /api/v1/study-design/designs/{studyDesignId}/arms/{armId}}</li>
     *   <li>OLD: {@code DELETE /api/clinops/study-design/{studyDesignId}/arms/{armId}} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param armId Arm UUID
     * @param reason Reason for removal
     * @param removedBy User ID who removed the arm
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return CompletableFuture with 204 No Content
     */
    @DeleteMapping("/{studyDesignId}/arms/{armId}")
    public CompletableFuture<ResponseEntity<Void>> removeStudyArm(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID armId,
            @RequestParam String reason,
            @RequestParam Long removedBy,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Remove study arm {} from design: {}", armId, studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.ARM_BY_ID,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
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
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code POST /api/v1/study-design/designs/{studyDesignId}/visits}</li>
     *   <li>OLD: {@code POST /api/clinops/study-design/{studyDesignId}/visits} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param request Define visit request
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return CompletableFuture with 201 Created
     */
    @PostMapping("/{studyDesignId}/visits")
    public CompletableFuture<ResponseEntity<Void>> defineVisit(
            @PathVariable UUID studyDesignId,
            @RequestBody DefineVisitDefinitionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Define visit '{}' in design: {}", request.getName(), studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.VISITS,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
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
     * <p><b>Endpoints (Bridge Pattern):</b></p>
     * <ul>
     *   <li>NEW: {@code POST /api/v1/study-design/studies/{studyId}/visits}</li>
     *   <li>OLD: {@code POST /api/clinops/study-design/studies/{studyId}/visits} (deprecated)</li>
     * </ul>
     * 
     * @param studyId Study identifier (legacy ID or UUID)
     * @param request Visit definition request
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return 201 Created with visit UUID
     */
    @PostMapping("/studies/{studyId}/visits")
    public CompletableFuture<ResponseEntity<Map<String, UUID>>> defineVisitForStudy(
            @PathVariable String studyId,
            @RequestBody DefineVisitDefinitionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Auto-define visit '{}' for study: {}", request.getName(), studyId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.STUDIES_PATH + "/studies/{studyId}/visits",
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
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
     * 
     * <p><b>Endpoints (Bridge Pattern):</b></p>
     * <ul>
     *   <li>NEW: {@code GET /api/v1/study-design/studies/{studyId}/visits}</li>
     *   <li>OLD: {@code GET /api/clinops/study-design/studies/{studyId}/visits} (deprecated)</li>
     * </ul>
     * 
     * @param studyId Study identifier (legacy ID or UUID)
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return CompletableFuture with visit list
     */
    @GetMapping("/studies/{studyId}/visits")
    public CompletableFuture<ResponseEntity<List<VisitDefinitionResponse>>> getVisitsForStudy(
            @PathVariable String studyId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Auto-get visits for study: {}", studyId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.STUDIES_PATH + "/studies/{studyId}/visits",
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
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
     * <p><b>Endpoints (Bridge Pattern):</b></p>
     * <ul>
     *   <li>NEW: {@code POST /api/v1/study-design/studies/{studyId}/arms}</li>
     *   <li>OLD: {@code POST /api/clinops/study-design/studies/{studyId}/arms} (deprecated)</li>
     * </ul>
     * 
     * @param studyId Study identifier (legacy ID or UUID)
     * @param request Arm definition request
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return 201 Created with arm UUID
     */
    @PostMapping("/studies/{studyId}/arms")
    public CompletableFuture<ResponseEntity<Map<String, UUID>>> addArmForStudy(
            @PathVariable String studyId,
            @RequestBody AddStudyArmRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Auto-add arm '{}' for study: {}", request.getName(), studyId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.STUDIES_PATH + "/studies/{studyId}/arms",
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
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
     * 
     * <p><b>Endpoints (Bridge Pattern):</b></p>
     * <ul>
     *   <li>NEW: {@code PUT /api/v1/study-design/studies/{studyId}/visits/{visitId}}</li>
     *   <li>OLD: {@code PUT /api/clinops/study-design/studies/{studyId}/visits/{visitId}} (deprecated)</li>
     * </ul>
     * 
     * @param studyId Study identifier (legacy ID or UUID)
     * @param visitId Visit UUID
     * @param request Update visit request
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return CompletableFuture with 200 OK
     */
    @PutMapping("/studies/{studyId}/visits/{visitId}")
    public CompletableFuture<ResponseEntity<Void>> updateVisitForStudy(
            @PathVariable String studyId,
            @PathVariable UUID visitId,
            @RequestBody UpdateVisitDefinitionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Auto-update visit {} for study: {}", visitId, studyId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.STUDIES_PATH + "/studies/{studyId}/visits/{visitId}",
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
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
     * 
     * <p><b>Endpoints (Bridge Pattern):</b></p>
     * <ul>
     *   <li>NEW: {@code DELETE /api/v1/study-design/studies/{studyId}/visits/{visitId}}</li>
     *   <li>OLD: {@code DELETE /api/clinops/study-design/studies/{studyId}/visits/{visitId}} (deprecated)</li>
     * </ul>
     * 
     * @param studyId Study identifier (legacy ID or UUID)
     * @param visitId Visit UUID
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return CompletableFuture with 200 OK
     */
    @DeleteMapping("/studies/{studyId}/visits/{visitId}")
    public CompletableFuture<ResponseEntity<Void>> removeVisitForStudy(
            @PathVariable String studyId,
            @PathVariable UUID visitId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Auto-remove visit {} for study: {}", visitId, studyId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.STUDIES_PATH + "/studies/{studyId}/visits/{visitId}",
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
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
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code PUT /api/v1/study-design/designs/{studyDesignId}/visits/{visitId}}</li>
     *   <li>OLD: {@code PUT /api/clinops/study-design/{studyDesignId}/visits/{visitId}} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param visitId Visit UUID
     * @param request Update visit request
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return CompletableFuture with 200 OK
     */
    @PutMapping("/{studyDesignId}/visits/{visitId}")
    public CompletableFuture<ResponseEntity<Void>> updateVisit(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID visitId,
            @RequestBody UpdateVisitDefinitionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Update visit {} in design: {}", visitId, studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.VISIT_BY_ID,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        return commandService.updateVisit(studyDesignId, visitId, request)
            .thenApply(result -> ResponseEntity.ok().<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to update visit", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Remove a visit
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code DELETE /api/v1/study-design/designs/{studyDesignId}/visits/{visitId}}</li>
     *   <li>OLD: {@code DELETE /api/clinops/study-design/{studyDesignId}/visits/{visitId}} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param visitId Visit UUID
     * @param reason Reason for removal
     * @param removedBy User ID who removed the visit
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return CompletableFuture with 204 No Content
     */
    @DeleteMapping("/{studyDesignId}/visits/{visitId}")
    public CompletableFuture<ResponseEntity<Void>> removeVisit(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID visitId,
            @RequestParam String reason,
            @RequestParam Long removedBy,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Remove visit {} from design: {}", visitId, studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.VISIT_BY_ID,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
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
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code POST /api/v1/study-design/designs/{studyDesignId}/form-assignments}</li>
     *   <li>OLD: {@code POST /api/clinops/study-design/{studyDesignId}/form-assignments} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param request Assign form to visit request
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return CompletableFuture with 201 Created
     */
    @PostMapping("/{studyDesignId}/form-assignments")
    public CompletableFuture<ResponseEntity<Void>> assignFormToVisit(
            @PathVariable UUID studyDesignId,
            @RequestBody AssignFormToVisitRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Assign form {} to visit {} in design: {}", 
            request.getFormId(), request.getVisitId(), studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.FORM_ASSIGNMENTS,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        return commandService.assignFormToVisit(studyDesignId, request)
            .thenApply(result -> ResponseEntity.status(HttpStatus.CREATED).<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to assign form to visit", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Update a form assignment
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code PUT /api/v1/study-design/designs/{studyDesignId}/form-assignments/{assignmentId}}</li>
     *   <li>OLD: {@code PUT /api/clinops/study-design/{studyDesignId}/form-assignments/{assignmentId}} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param assignmentId Assignment UUID
     * @param request Update form assignment request
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return CompletableFuture with 200 OK
     */
    @PutMapping("/{studyDesignId}/form-assignments/{assignmentId}")
    public CompletableFuture<ResponseEntity<Void>> updateFormAssignment(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID assignmentId,
            @RequestBody UpdateFormAssignmentRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Update form assignment {} in design: {}", assignmentId, studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.FORM_ASSIGNMENT_BY_ID,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        return commandService.updateFormAssignment(studyDesignId, assignmentId, request)
            .thenApply(result -> ResponseEntity.ok().<Void>build())
            .exceptionally(ex -> {
                log.error("Failed to update form assignment", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }

    /**
     * Remove a form assignment
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code DELETE /api/v1/study-design/designs/{studyDesignId}/form-assignments/{assignmentId}}</li>
     *   <li>OLD: {@code DELETE /api/clinops/study-design/{studyDesignId}/form-assignments/{assignmentId}} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param assignmentId Assignment UUID
     * @param reason Reason for removal
     * @param removedBy User ID who removed the assignment
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return CompletableFuture with 204 No Content
     */
    @DeleteMapping("/{studyDesignId}/form-assignments/{assignmentId}")
    public CompletableFuture<ResponseEntity<Void>> removeFormAssignment(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID assignmentId,
            @RequestParam String reason,
            @RequestParam Long removedBy,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Remove form assignment {} from design: {}", assignmentId, studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.FORM_ASSIGNMENT_BY_ID,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
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
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code POST /api/v1/study-design/designs/{studyDesignId}/design-progress/initialize}</li>
     *   <li>OLD: {@code POST /api/clinops/study-design/{studyDesignId}/design-progress/initialize} (deprecated)</li>
     * </ul>
     * 
     * <p><b>Command:</b> InitializeDesignProgressCommand</p>
     * <p><b>Event:</b> DesignProgressInitializedEvent</p>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return 201 Created
     */
    @PostMapping("/{studyDesignId}/design-progress/initialize")
    public CompletableFuture<ResponseEntity<Void>> initializeDesignProgress(
            @PathVariable UUID studyDesignId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Initializing design progress for study design: {}", studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.DESIGN_PROGRESS_INIT,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
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
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code PUT /api/v1/study-design/designs/{studyDesignId}/design-progress}</li>
     *   <li>OLD: {@code PUT /api/clinops/study-design/{studyDesignId}/design-progress} (deprecated)</li>
     * </ul>
     * 
     * <p><b>Command:</b> UpdateDesignProgressCommand</p>
     * <p><b>Event:</b> DesignProgressUpdatedEvent</p>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param request Design progress update request
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return 200 OK
     */
    @PutMapping("/{studyDesignId}/design-progress")
    public CompletableFuture<ResponseEntity<Void>> updateDesignProgress(
            @PathVariable UUID studyDesignId,
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Updating design progress for study design: {}", studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.DESIGN_PROGRESS,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
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
