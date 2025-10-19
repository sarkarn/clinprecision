package com.clinprecision.clinopsservice.studydesign.design.controller;

import com.clinprecision.clinopsservice.studydesign.design.dto.FormAssignmentResponse;
import com.clinprecision.clinopsservice.studydesign.design.arm.dto.StudyArmResponse;
import com.clinprecision.clinopsservice.studydesign.design.dto.StudyDesignResponse;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.dto.VisitDefinitionResponse;
import com.clinprecision.clinopsservice.studydesign.design.service.StudyDesignQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for StudyDesign read operations (queries)
 * Handles all queries against the study design read model
 */
@RestController
@RequestMapping("/api/clinops/study-design")
@RequiredArgsConstructor
@Slf4j
public class StudyDesignQueryController {

    private final StudyDesignQueryService queryService;

    /**
     * Get complete study design
     * GET /api/clinops/study-design/{studyDesignId}
     */
    @GetMapping("/{studyDesignId}")
    public ResponseEntity<StudyDesignResponse> getStudyDesign(@PathVariable UUID studyDesignId) {
        log.info("REST: Get complete study design: {}", studyDesignId);
        
        StudyDesignResponse response = queryService.getStudyDesign(studyDesignId);
        return ResponseEntity.ok(response);
    }

    // ===================== STUDY ARM QUERIES =====================

    /**
     * Get all study arms
     * GET /api/clinops/study-design/{studyDesignId}/arms
     */
    @GetMapping("/{studyDesignId}/arms")
    public ResponseEntity<List<StudyArmResponse>> getStudyArms(@PathVariable UUID studyDesignId) {
        log.info("REST: Get study arms for design: {}", studyDesignId);
        
        List<StudyArmResponse> arms = queryService.getStudyArms(studyDesignId);
        return ResponseEntity.ok(arms);
    }

    /**
     * Get specific study arm
     * GET /api/clinops/study-design/{studyDesignId}/arms/{armId}
     */
    @GetMapping("/{studyDesignId}/arms/{armId}")
    public ResponseEntity<StudyArmResponse> getStudyArm(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID armId) {
        log.info("REST: Get study arm {} from design: {}", armId, studyDesignId);
        
        StudyArmResponse arm = queryService.getStudyArm(studyDesignId, armId);
        return ResponseEntity.ok(arm);
    }

    // ===================== VISIT QUERIES =====================

    /**
     * Get all visits
     * GET /api/clinops/study-design/{studyDesignId}/visits
     */
    @GetMapping("/{studyDesignId}/visits")
    public ResponseEntity<List<VisitDefinitionResponse>> getVisits(
            @PathVariable UUID studyDesignId,
            @RequestParam(required = false) String visitType,
            @RequestParam(required = false) UUID armId) {
        log.info("REST: Get visits for design: {} (type={}, armId={})", studyDesignId, visitType, armId);
        
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
     * GET /api/clinops/study-design/{studyDesignId}/visits/general
     */
    @GetMapping("/{studyDesignId}/visits/general")
    public ResponseEntity<List<VisitDefinitionResponse>> getGeneralVisits(@PathVariable UUID studyDesignId) {
        log.info("REST: Get general visits for design: {}", studyDesignId);
        
        List<VisitDefinitionResponse> visits = queryService.getGeneralVisits(studyDesignId);
        return ResponseEntity.ok(visits);
    }

    /**
     * Get specific visit
     * GET /api/clinops/study-design/{studyDesignId}/visits/{visitId}
     */
    @GetMapping("/{studyDesignId}/visits/{visitId}")
    public ResponseEntity<VisitDefinitionResponse> getVisit(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID visitId) {
        log.info("REST: Get visit {} from design: {}", visitId, studyDesignId);
        
        VisitDefinitionResponse visit = queryService.getVisit(studyDesignId, visitId);
        return ResponseEntity.ok(visit);
    }

    // ===================== FORM ASSIGNMENT QUERIES =====================

    /**
     * Get all form assignments
     * GET /api/clinops/study-design/{studyDesignId}/form-assignments
     */
    @GetMapping("/{studyDesignId}/form-assignments")
    public ResponseEntity<List<FormAssignmentResponse>> getFormAssignments(
            @PathVariable UUID studyDesignId,
            @RequestParam(required = false) UUID visitId,
            @RequestParam(required = false) Boolean requiredOnly) {
        log.info("REST: Get form assignments for design: {} (visitId={}, requiredOnly={})", 
            studyDesignId, visitId, requiredOnly);
        
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
     * GET /api/clinops/study-design/{studyDesignId}/form-assignments/{assignmentId}
     */
    @GetMapping("/{studyDesignId}/form-assignments/{assignmentId}")
    public ResponseEntity<FormAssignmentResponse> getFormAssignment(
            @PathVariable UUID studyDesignId,
            @PathVariable UUID assignmentId) {
        log.info("REST: Get form assignment {} from design: {}", assignmentId, studyDesignId);
        
        FormAssignmentResponse assignment = queryService.getFormAssignment(studyDesignId, assignmentId);
        return ResponseEntity.ok(assignment);
    }
}
