package com.clinprecision.clinopsservice.studydesign.design.controller;

import com.clinprecision.clinopsservice.common.util.DeprecationHeaderUtil;
import com.clinprecision.clinopsservice.studydesign.design.api.StudyDesignApiConstants;
import com.clinprecision.clinopsservice.studydesign.design.dto.FormAssignmentResponse;
import com.clinprecision.clinopsservice.studydesign.design.arm.dto.StudyArmResponse;
import com.clinprecision.clinopsservice.studydesign.design.dto.StudyDesignResponse;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.dto.VisitDefinitionResponse;
import com.clinprecision.clinopsservice.studydesign.design.service.StudyDesignQueryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for StudyDesign read operations (queries)
 * 
 * <p><b>URL Migration (October 2025 - April 2026):</b></p>
 * <ul>
 *   <li>NEW (Primary): {@code /api/v1/study-design/designs/*} - DDD-aligned, domain-focused paths</li>
 *   <li>OLD (Deprecated): {@code /api/clinops/study-design/*} - Legacy technical paths</li>
 * </ul>
 * 
 * <p>Handles all queries against the study design read model including study arms, visits, and form assignments.</p>
 * 
 * <p><b>Deprecation Timeline:</b> October 19, 2025 - April 19, 2026 (6 months)</p>
 * 
 * @see StudyDesignApiConstants
 * @see DeprecationHeaderUtil
 * @since October 2025 - Module 1.3 Phase 1
 */
@RestController
@RequestMapping({
    StudyDesignApiConstants.DESIGNS_PATH,                  // NEW: /api/v1/study-design/designs
    StudyDesignApiConstants.LEGACY_CLINOPS_STUDY_DESIGN    // OLD: /api/clinops/study-design (deprecated)
})
@RequiredArgsConstructor
@Slf4j
public class StudyDesignQueryController {

    private final StudyDesignQueryService queryService;

    /**
     * Get complete study design
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code GET /api/v1/study-design/designs/{studyDesignId}}</li>
     *   <li>OLD: {@code GET /api/clinops/study-design/{studyDesignId}} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return Study design response
     */
    @GetMapping("/{studyDesignId}")
    public ResponseEntity<StudyDesignResponse> getStudyDesign(
            @PathVariable UUID studyDesignId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Get complete study design: {}", studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.BY_ID,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        StudyDesignResponse response = queryService.getStudyDesign(studyDesignId);
        return ResponseEntity.ok(response);
    }

    // ===================== STUDY ARM QUERIES =====================

    /**
     * Get all study arms
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code GET /api/v1/study-design/designs/{studyDesignId}/arms}</li>
     *   <li>OLD: {@code GET /api/clinops/study-design/{studyDesignId}/arms} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return List of study arms
     */
    @GetMapping("/{studyDesignId}/arms")
    public ResponseEntity<List<StudyArmResponse>> getStudyArms(
            @PathVariable UUID studyDesignId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Get study arms for design: {}", studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.ARMS,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        List<StudyArmResponse> arms = queryService.getStudyArms(studyDesignId);
        return ResponseEntity.ok(arms);
    }

    /**
     * Get specific study arm
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code GET /api/v1/study-design/designs/{studyDesignId}/arms/{armId}}</li>
     *   <li>OLD: {@code GET /api/clinops/study-design/{studyDesignId}/arms/{armId}} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param armId Study arm UUID
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return Study arm response
     */
    @GetMapping("/{studyDesignId}/arms/{armId}")
    public ResponseEntity<StudyArmResponse> getStudyArm(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID armId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Get study arm {} from design: {}", armId, studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.ARM_BY_ID,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        StudyArmResponse arm = queryService.getStudyArm(studyDesignId, armId);
        return ResponseEntity.ok(arm);
    }

    // ===================== VISIT QUERIES =====================

    /**
     * Get all visits
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code GET /api/v1/study-design/designs/{studyDesignId}/visits}</li>
     *   <li>OLD: {@code GET /api/clinops/study-design/{studyDesignId}/visits} (deprecated)</li>
     * </ul>
     * 
     * <p>Supports optional filtering by visit type or arm ID via query parameters.</p>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param visitType Optional filter by visit type
     * @param armId Optional filter by arm ID
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return List of visit definitions
     */
    @GetMapping("/{studyDesignId}/visits")
    public ResponseEntity<List<VisitDefinitionResponse>> getVisits(
            @PathVariable UUID studyDesignId,
            @RequestParam(required = false) String visitType,
            @RequestParam(required = false) UUID armId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Get visits for design: {} (type={}, armId={})", studyDesignId, visitType, armId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.VISITS,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        List<VisitDefinitionResponse> visits;
        
        if (visitType != null) {
            visits = queryService.getVisitsByType(studyDesignId, visitType);
        } else if (armId != null) {
            visits = queryService.getArmSpecificVisits(studyDesignId, armId);
        } else {
            visits = queryService.getVisits(studyDesignId);
        }
        
        return ResponseEntity.ok(visits);
    }

    /**
     * Get general (non-arm-specific) visits
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code GET /api/v1/study-design/designs/{studyDesignId}/visits/general}</li>
     *   <li>OLD: {@code GET /api/clinops/study-design/{studyDesignId}/visits/general} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return List of general visit definitions
     */
    @GetMapping("/{studyDesignId}/visits/general")
    public ResponseEntity<List<VisitDefinitionResponse>> getGeneralVisits(
            @PathVariable UUID studyDesignId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Get general visits for design: {}", studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.GENERAL_VISITS,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        List<VisitDefinitionResponse> visits = queryService.getGeneralVisits(studyDesignId);
        return ResponseEntity.ok(visits);
    }

    /**
     * Get specific visit
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code GET /api/v1/study-design/designs/{studyDesignId}/visits/{visitId}}</li>
     *   <li>OLD: {@code GET /api/clinops/study-design/{studyDesignId}/visits/{visitId}} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param visitId Visit UUID
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return Visit definition response
     */
    @GetMapping("/{studyDesignId}/visits/{visitId}")
    public ResponseEntity<VisitDefinitionResponse> getVisit(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID visitId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Get visit {} from design: {}", visitId, studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.VISIT_BY_ID,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        VisitDefinitionResponse visit = queryService.getVisit(studyDesignId, visitId);
        return ResponseEntity.ok(visit);
    }

    // ===================== FORM ASSIGNMENT QUERIES =====================

    /**
     * Get all form assignments
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code GET /api/v1/study-design/designs/{studyDesignId}/form-assignments}</li>
     *   <li>OLD: {@code GET /api/clinops/study-design/{studyDesignId}/form-assignments} (deprecated)</li>
     * </ul>
     * 
     * <p>Supports optional filtering by visit ID or required-only assignments via query parameters.</p>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param visitId Optional filter by visit ID
     * @param requiredOnly Optional filter for required forms only
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return List of form assignments
     */
    @GetMapping("/{studyDesignId}/form-assignments")
    public ResponseEntity<List<FormAssignmentResponse>> getFormAssignments(
            @PathVariable UUID studyDesignId,
            @RequestParam(required = false) UUID visitId,
            @RequestParam(required = false) Boolean requiredOnly,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Get form assignments for design: {} (visitId={}, requiredOnly={})", 
            studyDesignId, visitId, requiredOnly);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.FORM_ASSIGNMENTS,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        List<FormAssignmentResponse> assignments;
        
        if (visitId != null && Boolean.TRUE.equals(requiredOnly)) {
            assignments = queryService.getRequiredForms(studyDesignId, visitId);
        } else if (visitId != null) {
            assignments = queryService.getFormAssignmentsByVisit(studyDesignId, visitId);
        } else {
            assignments = queryService.getFormAssignments(studyDesignId);
        }
        
        return ResponseEntity.ok(assignments);
    }

    /**
     * Get specific form assignment
     * 
     * <p><b>Endpoints:</b></p>
     * <ul>
     *   <li>NEW: {@code GET /api/v1/study-design/designs/{studyDesignId}/form-assignments/{assignmentId}}</li>
     *   <li>OLD: {@code GET /api/clinops/study-design/{studyDesignId}/form-assignments/{assignmentId}} (deprecated)</li>
     * </ul>
     * 
     * @param studyDesignId Study design aggregate UUID
     * @param assignmentId Form assignment UUID
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return Form assignment response
     */
    @GetMapping("/{studyDesignId}/form-assignments/{assignmentId}")
    public ResponseEntity<FormAssignmentResponse> getFormAssignment(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID assignmentId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Get form assignment {} from design: {}", assignmentId, studyDesignId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.DESIGNS_PATH + StudyDesignApiConstants.FORM_ASSIGNMENT_BY_ID,
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        FormAssignmentResponse assignment = queryService.getFormAssignment(studyDesignId, assignmentId);
        return ResponseEntity.ok(assignment);
    }
}
