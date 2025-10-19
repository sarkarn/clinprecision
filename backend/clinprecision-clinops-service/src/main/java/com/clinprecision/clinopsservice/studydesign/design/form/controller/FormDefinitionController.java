package com.clinprecision.clinopsservice.controller;



import com.clinprecision.clinopsservice.service.FormDefinitionService;
import com.clinprecision.clinopsservice.dto.FormDefinitionCreateRequestDto;
import com.clinprecision.clinopsservice.dto.FormDefinitionDto;
import com.clinprecision.clinopsservice.entity.FormDefinitionEntity;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Form Definition operations
 * Provides endpoints for form definition management with updated schema support
 */
@RestController
@RequestMapping("/api/form-definitions")
public class FormDefinitionController {
    
    private static final Logger logger = LoggerFactory.getLogger(FormDefinitionController.class);
    
    private final FormDefinitionService formDefinitionService;
    
    @Autowired
    public FormDefinitionController(FormDefinitionService formDefinitionService) {
        this.formDefinitionService = formDefinitionService;
    }
    
    /**
     * Create a new form definition
     * POST /api/form-definitions
     */
    @PostMapping
    public ResponseEntity<FormDefinitionDto> createFormDefinition(@Valid @RequestBody FormDefinitionCreateRequestDto requestDto) {
        logger.info("POST /api/form-definitions - Creating form definition");
        logger.info("Request data: studyId={}, name='{}', formType='{}', status='{}'", 
                   requestDto.getStudyId(), requestDto.getName(), requestDto.getFormType(), requestDto.getStatus());
        logger.debug("Full request data: {}", requestDto);
        
        try {
            FormDefinitionDto createdForm = formDefinitionService.createFormDefinition(requestDto);
            logger.info("Form definition created successfully with ID: {}", createdForm.getId());
            return new ResponseEntity<>(createdForm, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error creating form definition: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Get all form definitions for a study
     * GET /api/form-definitions/study/{studyId}
     */
    @GetMapping("/study/{studyId}")
    public ResponseEntity<List<FormDefinitionDto>> getFormDefinitionsByStudyId(@PathVariable Long studyId) {
        List<FormDefinitionDto> forms = formDefinitionService.getFormDefinitionsByStudyId(studyId);
        return ResponseEntity.ok(forms);
    }
    
    /**
     * Get form definitions by study ID and status
     * GET /api/form-definitions/study/{studyId}/status/{status}
     */
    @GetMapping("/study/{studyId}/status/{status}")
    public ResponseEntity<List<FormDefinitionDto>> getFormDefinitionsByStudyIdAndStatus(
            @PathVariable Long studyId,
            @PathVariable FormDefinitionEntity.FormStatus status) {
        List<FormDefinitionDto> forms = formDefinitionService.getFormDefinitionsByStudyIdAndStatus(studyId, status);
        return ResponseEntity.ok(forms);
    }
    
    /**
     * Get form definition by ID
     * GET /api/form-definitions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<FormDefinitionDto> getFormDefinitionById(@PathVariable Long id) {
        FormDefinitionDto form = formDefinitionService.getFormDefinitionById(id);
        return ResponseEntity.ok(form);
    }
    
    /**
     * Get form definitions using a specific template
     * GET /api/form-definitions/template/{templateId}
     */
    @GetMapping("/template/{templateId}")
    public ResponseEntity<List<FormDefinitionDto>> getFormDefinitionsByTemplateId(@PathVariable Long templateId) {
        List<FormDefinitionDto> forms = formDefinitionService.getFormDefinitionsByTemplateId(templateId);
        return ResponseEntity.ok(forms);
    }
    
    /**
     * Search form definitions by name within a study
     * GET /api/form-definitions/study/{studyId}/search/name?q={name}
     */
    @GetMapping("/study/{studyId}/search/name")
    public ResponseEntity<List<FormDefinitionDto>> searchFormDefinitionsByName(
            @PathVariable Long studyId,
            @RequestParam("q") String name) {
        List<FormDefinitionDto> forms = formDefinitionService.searchFormDefinitionsByName(studyId, name);
        return ResponseEntity.ok(forms);
    }
    
    /**
     * Search form definitions by tags within a study
     * GET /api/form-definitions/study/{studyId}/search/tags?q={tag}
     */
    @GetMapping("/study/{studyId}/search/tags")
    public ResponseEntity<List<FormDefinitionDto>> searchFormDefinitionsByTag(
            @PathVariable Long studyId,
            @RequestParam("q") String tag) {
        List<FormDefinitionDto> forms = formDefinitionService.searchFormDefinitionsByTag(studyId, tag);
        return ResponseEntity.ok(forms);
    }
    
    /**
     * Get form definitions by form type within a study
     * GET /api/form-definitions/study/{studyId}/type/{formType}
     */
    @GetMapping("/study/{studyId}/type/{formType}")
    public ResponseEntity<List<FormDefinitionDto>> getFormDefinitionsByFormType(
            @PathVariable Long studyId,
            @PathVariable String formType) {
        List<FormDefinitionDto> forms = formDefinitionService.getFormDefinitionsByFormType(studyId, formType);
        return ResponseEntity.ok(forms);
    }
    
    /**
     * Update form definition
     * PUT /api/form-definitions/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<FormDefinitionDto> updateFormDefinition(
            @PathVariable Long id,
            @Valid @RequestBody FormDefinitionCreateRequestDto requestDto) {
        FormDefinitionDto updatedForm = formDefinitionService.updateFormDefinition(id, requestDto);
        return ResponseEntity.ok(updatedForm);
    }
    
    /**
     * Delete form definition
     * DELETE /api/form-definitions/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormDefinition(@PathVariable Long id) {
        formDefinitionService.deleteFormDefinition(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Lock form definition
     * PATCH /api/form-definitions/{id}/lock
     */
    @PatchMapping("/{id}/lock")
    public ResponseEntity<FormDefinitionDto> lockFormDefinition(@PathVariable Long id) {
        FormDefinitionDto lockedForm = formDefinitionService.lockFormDefinition(id);
        return ResponseEntity.ok(lockedForm);
    }
    
    /**
     * Unlock form definition
     * PATCH /api/form-definitions/{id}/unlock
     */
    @PatchMapping("/{id}/unlock")
    public ResponseEntity<FormDefinitionDto> unlockFormDefinition(@PathVariable Long id) {
        FormDefinitionDto unlockedForm = formDefinitionService.unlockFormDefinition(id);
        return ResponseEntity.ok(unlockedForm);
    }
    
    /**
     * Approve form definition
     * PATCH /api/form-definitions/{id}/approve
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<FormDefinitionDto> approveFormDefinition(@PathVariable Long id) {
        FormDefinitionDto approvedForm = formDefinitionService.approveFormDefinition(id);
        return ResponseEntity.ok(approvedForm);
    }
    
    /**
     * Retire form definition
     * PATCH /api/form-definitions/{id}/retire
     */
    @PatchMapping("/{id}/retire")
    public ResponseEntity<FormDefinitionDto> retireFormDefinition(@PathVariable Long id) {
        FormDefinitionDto retiredForm = formDefinitionService.retireFormDefinition(id);
        return ResponseEntity.ok(retiredForm);
    }
    
    /**
     * Create form definition from template
     * POST /api/form-definitions/from-template
     */
    @PostMapping("/from-template")
    public ResponseEntity<FormDefinitionDto> createFormDefinitionFromTemplate(
            @RequestParam Long studyId,
            @RequestParam Long templateId,
            @RequestParam String formName) {
        FormDefinitionDto createdForm = formDefinitionService.createFormDefinitionFromTemplate(studyId, templateId, formName);
        return new ResponseEntity<>(createdForm, HttpStatus.CREATED);
    }
    
    /**
     * Get form definitions that need template updates
     * GET /api/form-definitions/outdated-templates
     */
    @GetMapping("/outdated-templates")
    public ResponseEntity<List<FormDefinitionDto>> getFormDefinitionsWithOutdatedTemplates() {
        List<FormDefinitionDto> forms = formDefinitionService.getFormDefinitionsWithOutdatedTemplates();
        return ResponseEntity.ok(forms);
    }
    
    /**
     * Get form definition count by study
     * GET /api/form-definitions/study/{studyId}/count
     */
    @GetMapping("/study/{studyId}/count")
    public ResponseEntity<Long> getFormDefinitionCountByStudy(@PathVariable Long studyId) {
        long count = formDefinitionService.getFormDefinitionCountByStudy(studyId);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Get form definition count by status within a study
     * GET /api/form-definitions/study/{studyId}/status/{status}/count
     */
    @GetMapping("/study/{studyId}/status/{status}/count")
    public ResponseEntity<Long> getFormDefinitionCountByStatus(
            @PathVariable Long studyId,
            @PathVariable FormDefinitionEntity.FormStatus status) {
        long count = formDefinitionService.getFormDefinitionCountByStatus(studyId, status);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Get template usage count
     * GET /api/form-definitions/template/{templateId}/usage-count
     */
    @GetMapping("/template/{templateId}/usage-count")
    public ResponseEntity<Long> getTemplateUsageCount(@PathVariable Long templateId) {
        long count = formDefinitionService.getTemplateUsageCount(templateId);
        return ResponseEntity.ok(count);
    }
}



