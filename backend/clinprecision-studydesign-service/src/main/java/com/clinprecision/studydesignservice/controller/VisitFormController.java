package com.clinprecision.studydesignservice.controller;

import com.clinprecision.studydesignservice.dto.VisitFormDto;
import com.clinprecision.studydesignservice.service.VisitFormService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Visit-Form Association operations
 * Provides endpoints for managing form bindings to visits
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class VisitFormController {

    private final VisitFormService visitFormService;

    // ========== Visit-Form Association Management ==========

    /**
     * Get all forms associated with a visit
     * GET /api/visits/{visitId}/forms
     */
    @GetMapping("/visits/{visitId}/forms")
    public ResponseEntity<List<VisitFormDto>> getFormsByVisitId(@PathVariable Long visitId) {
        log.debug("GET /api/visits/{}/forms", visitId);
        List<VisitFormDto> visitForms = visitFormService.getFormsByVisitId(visitId);
        return ResponseEntity.ok(visitForms);
    }

    /**
     * Get required forms for a visit
     * GET /api/visits/{visitId}/forms/required
     */
    @GetMapping("/visits/{visitId}/forms/required")
    public ResponseEntity<List<VisitFormDto>> getRequiredFormsByVisitId(@PathVariable Long visitId) {
        log.debug("GET /api/visits/{}/forms/required", visitId);
        List<VisitFormDto> requiredForms = visitFormService.getRequiredFormsByVisitId(visitId);
        return ResponseEntity.ok(requiredForms);
    }

    /**
     * Get optional forms for a visit
     * GET /api/visits/{visitId}/forms/optional
     */
    @GetMapping("/visits/{visitId}/forms/optional")
    public ResponseEntity<List<VisitFormDto>> getOptionalFormsByVisitId(@PathVariable Long visitId) {
        log.debug("GET /api/visits/{}/forms/optional", visitId);
        List<VisitFormDto> optionalForms = visitFormService.getOptionalFormsByVisitId(visitId);
        return ResponseEntity.ok(optionalForms);
    }

    /**
     * Get all visits that use a specific form
     * GET /api/forms/{formId}/visits
     */
    @GetMapping("/forms/{formId}/visits")
    public ResponseEntity<List<VisitFormDto>> getVisitsByFormId(@PathVariable Long formId) {
        log.debug("GET /api/forms/{}/visits", formId);
        List<VisitFormDto> visitForms = visitFormService.getVisitsByFormId(formId);
        return ResponseEntity.ok(visitForms);
    }

    // ========== Study-level Matrix Operations ==========

    /**
     * Get visit-form matrix for a study (all associations)
     * GET /api/studies/{studyId}/visit-forms
     */
    @GetMapping("/studies/{studyId}/visit-forms")
    public ResponseEntity<List<VisitFormDto>> getVisitFormMatrixByStudyId(@PathVariable Long studyId) {
        log.debug("GET /api/studies/{}/visit-forms", studyId);
        List<VisitFormDto> matrix = visitFormService.getVisitFormMatrixByStudyId(studyId);
        return ResponseEntity.ok(matrix);
    }

    /**
     * Get form bindings for a study (alias for visit-form matrix)
     * GET /api/studies/{studyId}/form-bindings
     */
    @GetMapping("/studies/{studyId}/form-bindings")
    public ResponseEntity<List<VisitFormDto>> getFormBindingsByStudyId(@PathVariable Long studyId) {
        log.debug("GET /api/studies/{}/form-bindings", studyId);
        // Reuse the same service method as visit-forms endpoint
        List<VisitFormDto> matrix = visitFormService.getVisitFormMatrixByStudyId(studyId);
        return ResponseEntity.ok(matrix);
    }

    /**
     * Get conditional forms for a study
     * GET /api/studies/{studyId}/visit-forms/conditional
     */
    @GetMapping("/studies/{studyId}/visit-forms/conditional")
    public ResponseEntity<List<VisitFormDto>> getConditionalFormsByStudyId(@PathVariable Long studyId) {
        log.debug("GET /api/studies/{}/visit-forms/conditional", studyId);
        List<VisitFormDto> conditionalForms = visitFormService.getConditionalFormsByStudyId(studyId);
        return ResponseEntity.ok(conditionalForms);
    }

    // ========== Individual Association Management ==========

    /**
     * Create a new visit-form association
     * POST /api/visit-forms
     */
    @PostMapping("/visit-forms")
    public ResponseEntity<VisitFormDto> createVisitFormAssociation(@Valid @RequestBody VisitFormDto visitFormDto) {
        log.info("POST /api/visit-forms - visit: {}, form: {}", 
                visitFormDto.getVisitDefinitionId(), visitFormDto.getFormDefinitionId());
        
        VisitFormDto createdAssociation = visitFormService.createVisitFormAssociation(visitFormDto);
        return new ResponseEntity<>(createdAssociation, HttpStatus.CREATED);
    }

    /**
     * Update an existing visit-form association
     * PUT /api/visit-forms/{associationId}
     */
    @PutMapping("/visit-forms/{associationId}")
    public ResponseEntity<VisitFormDto> updateVisitFormAssociation(
            @PathVariable Long associationId,
            @Valid @RequestBody VisitFormDto visitFormDto) {
        log.info("PUT /api/visit-forms/{}", associationId);
        
        VisitFormDto updatedAssociation = visitFormService.updateVisitFormAssociation(associationId, visitFormDto);
        return ResponseEntity.ok(updatedAssociation);
    }

    /**
     * Delete a visit-form association by ID
     * DELETE /api/visit-forms/{associationId}
     */
    @DeleteMapping("/visit-forms/{associationId}")
    public ResponseEntity<Void> deleteVisitFormAssociation(@PathVariable Long associationId) {
        log.info("DELETE /api/visit-forms/{}", associationId);
        
        visitFormService.deleteVisitFormAssociation(associationId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Delete a visit-form association by visit and form IDs
     * DELETE /api/visits/{visitId}/forms/{formId}
     */
    @DeleteMapping("/visits/{visitId}/forms/{formId}")
    public ResponseEntity<Void> deleteVisitFormAssociation(
            @PathVariable Long visitId,
            @PathVariable Long formId) {
        log.info("DELETE /api/visits/{}/forms/{}", visitId, formId);
        
        visitFormService.deleteVisitFormAssociation(visitId, formId);
        return ResponseEntity.noContent().build();
    }

    // ========== Form Binding Management (Frontend Compatibility) ==========

    /**
     * Create a new form binding for a visit
     * POST /api/studies/{studyId}/visits/{visitId}/forms/{formId}
     */
    @PostMapping("/studies/{studyId}/visits/{visitId}/forms/{formId}")
    public ResponseEntity<VisitFormDto> createFormBinding(
            @PathVariable Long studyId,
            @PathVariable Long visitId,
            @PathVariable Long formId,
            @RequestBody VisitFormDto bindingData) {
        log.info("POST /api/studies/{}/visits/{}/forms/{}", studyId, visitId, formId);
        
        // Set the IDs from path variables
        bindingData.setVisitDefinitionId(visitId);
        bindingData.setFormDefinitionId(formId);
        
        VisitFormDto createdBinding = visitFormService.createVisitFormAssociation(bindingData);
        return new ResponseEntity<>(createdBinding, HttpStatus.CREATED);
    }

    /**
     * Remove a form binding from a visit
     * DELETE /api/studies/{studyId}/visits/{visitId}/forms/{formId}
     */
    @DeleteMapping("/studies/{studyId}/visits/{visitId}/forms/{formId}")
    public ResponseEntity<Void> removeFormBinding(
            @PathVariable Long studyId,
            @PathVariable Long visitId,
            @PathVariable Long formId) {
        log.info("DELETE /api/studies/{}/visits/{}/forms/{}", studyId, visitId, formId);
        
        visitFormService.deleteVisitFormAssociation(visitId, formId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update a form binding by ID
     * PUT /api/form-bindings/{bindingId}
     */
    @PutMapping("/form-bindings/{bindingId}")
    public ResponseEntity<VisitFormDto> updateFormBinding(
            @PathVariable Long bindingId,
            @RequestBody VisitFormDto updates) {
        log.info("PUT /api/form-bindings/{}", bindingId);
        
        VisitFormDto updatedBinding = visitFormService.updateVisitFormAssociation(bindingId, updates);
        return ResponseEntity.ok(updatedBinding);
    }

    /**
     * Delete a form binding by ID
     * DELETE /api/form-bindings/{bindingId}
     */
    @DeleteMapping("/form-bindings/{bindingId}")
    public ResponseEntity<Void> deleteFormBinding(@PathVariable Long bindingId) {
        log.info("DELETE /api/form-bindings/{}", bindingId);
        
        visitFormService.deleteVisitFormAssociation(bindingId);
        return ResponseEntity.noContent().build();
    }

    // ========== Form Reordering ==========

    /**
     * Reorder forms within a visit
     * PUT /api/visits/{visitId}/forms/reorder
     */
    @PutMapping("/visits/{visitId}/forms/reorder")
    public ResponseEntity<Void> reorderFormsInVisit(
            @PathVariable Long visitId,
            @RequestBody List<Long> formIds) {
        log.info("PUT /api/visits/{}/forms/reorder", visitId);
        
        visitFormService.reorderFormsInVisit(visitId, formIds);
        return ResponseEntity.ok().build();
    }

    // ========== Bulk Operations ==========

    /**
     * Bulk create visit-form associations
     * POST /api/visit-forms/bulk
     */
    @PostMapping("/visit-forms/bulk")
    public ResponseEntity<List<VisitFormDto>> createBulkVisitFormAssociations(
            @Valid @RequestBody List<VisitFormDto> visitFormDtos) {
        log.info("POST /api/visit-forms/bulk - creating {} associations", visitFormDtos.size());
        
        List<VisitFormDto> createdAssociations = visitFormDtos.stream()
                .map(visitFormService::createVisitFormAssociation)
                .toList();
        
        return new ResponseEntity<>(createdAssociations, HttpStatus.CREATED);
    }

    // ========== Exception Handling ==========

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