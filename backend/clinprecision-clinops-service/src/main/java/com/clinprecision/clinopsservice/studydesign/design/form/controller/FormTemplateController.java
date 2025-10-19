package com.clinprecision.clinopsservice.studydesign.design.form.controller;
import com.clinprecision.clinopsservice.studydesign.design.form.service.FormTemplateService;


import com.clinprecision.clinopsservice.studydesign.design.form.dto.FormTemplateCreateRequestDto;
import com.clinprecision.clinopsservice.studydesign.design.form.dto.FormTemplateDto;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Form Template operations
 * Provides endpoints for form template management
 */
@RestController
@RequestMapping("/api/form-templates")
public class FormTemplateController {
    
    private final FormTemplateService formTemplateService;
    
    @Autowired
    public FormTemplateController(FormTemplateService formTemplateService) {
        this.formTemplateService = formTemplateService;
    }
    
    /**
     * Create a new form template
     * POST /api/form-templates
     */
    @PostMapping
    public ResponseEntity<FormTemplateDto> createFormTemplate(@Valid @RequestBody FormTemplateCreateRequestDto requestDto) {
        FormTemplateDto createdTemplate = formTemplateService.createFormTemplate(requestDto);
        return new ResponseEntity<>(createdTemplate, HttpStatus.CREATED);
    }
    
    /**
     * Get all form templates
     * GET /api/form-templates
     */
    @GetMapping
    public ResponseEntity<List<FormTemplateDto>> getAllFormTemplates() {
        List<FormTemplateDto> templates = formTemplateService.getAllFormTemplates();
        return ResponseEntity.ok(templates);
    }
    
    /**
     * Get published form templates
     * GET /api/form-templates/published
     */
    @GetMapping("/published")
    public ResponseEntity<List<FormTemplateDto>> getPublishedFormTemplates() {
        List<FormTemplateDto> templates = formTemplateService.getPublishedFormTemplates();
        return ResponseEntity.ok(templates);
    }
    
    /**
     * Get form templates by category
     * GET /api/form-templates/category/{category}
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<FormTemplateDto>> getFormTemplatesByCategory(@PathVariable String category) {
        List<FormTemplateDto> templates = formTemplateService.getFormTemplatesByCategory(category);
        return ResponseEntity.ok(templates);
    }
    
    /**
     * Get form template by ID
     * GET /api/form-templates/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<FormTemplateDto> getFormTemplateById(@PathVariable Long id) {
        FormTemplateDto template = formTemplateService.getFormTemplateById(id);
        return ResponseEntity.ok(template);
    }

    /**
     * Get form template by template ID
     * GET /api/form-templates/template/{templateId}
     */
    @PostMapping("/template/{templateId}")
    public void  incrementTemplateUsage(@PathVariable Long templateId) {
        formTemplateService.incrementTemplateUsage(templateId);
    }
    
    /**
     * Search form templates by name
     * GET /api/form-templates/search/name?q={name}
     */
    @GetMapping("/search/name")
    public ResponseEntity<List<FormTemplateDto>> searchFormTemplatesByName(@RequestParam("q") String name) {
        List<FormTemplateDto> templates = formTemplateService.searchFormTemplatesByName(name);
        return ResponseEntity.ok(templates);
    }
    
    /**
     * Search form templates by tags
     * GET /api/form-templates/search/tags?q={tag}
     */
    @GetMapping("/search/tags")
    public ResponseEntity<List<FormTemplateDto>> searchFormTemplatesByTag(@RequestParam("q") String tag) {
        List<FormTemplateDto> templates = formTemplateService.searchFormTemplatesByTag(tag);
        return ResponseEntity.ok(templates);
    }
    
    /**
     * Update form template
     * PUT /api/form-templates/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<FormTemplateDto> updateFormTemplate(
            @PathVariable Long id,
            @Valid @RequestBody FormTemplateCreateRequestDto requestDto) {
        FormTemplateDto updatedTemplate = formTemplateService.updateFormTemplate(id, requestDto);
        return ResponseEntity.ok(updatedTemplate);
    }
    
    /**
     * Delete form template
     * DELETE /api/form-templates/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormTemplate(@PathVariable Long id) {
        formTemplateService.deleteFormTemplate(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Publish form template
     * PATCH /api/form-templates/{id}/publish
     */
    @PatchMapping("/{id}/publish")
    public ResponseEntity<FormTemplateDto> publishFormTemplate(@PathVariable Long id) {
        FormTemplateDto publishedTemplate = formTemplateService.publishFormTemplate(id);
        return ResponseEntity.ok(publishedTemplate);
    }
    
    /**
     * Archive form template
     * PATCH /api/form-templates/{id}/archive
     */
    @PatchMapping("/{id}/archive")
    public ResponseEntity<FormTemplateDto> archiveFormTemplate(@PathVariable Long id) {
        FormTemplateDto archivedTemplate = formTemplateService.archiveFormTemplate(id);
        return ResponseEntity.ok(archivedTemplate);
    }
    
    /**
     * Get template statistics by category
     * GET /api/form-templates/stats/category/{category}/count
     */
    @GetMapping("/stats/category/{category}/count")
    public ResponseEntity<Long> getTemplateCountByCategory(@PathVariable String category) {
        long count = formTemplateService.getTemplateCountByCategory(category);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Get published template count
     * GET /api/form-templates/stats/published/count
     */
    @GetMapping("/stats/published/count")
    public ResponseEntity<Long> getPublishedTemplateCount() {
        long count = formTemplateService.getPublishedTemplateCount();
        return ResponseEntity.ok(count);
    }
}



