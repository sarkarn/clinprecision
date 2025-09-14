package com.clinprecision.adminservice.ui.controllers;

import com.clinprecision.adminservice.service.FormTemplateService;
import com.clinprecision.adminservice.ui.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Form Template management
 */
@RestController
@RequestMapping("/form-templates")
@RequiredArgsConstructor
@Slf4j
public class FormTemplateController {
    
    private final FormTemplateService formTemplateService;
    
    /**
     * GET /admin-ws/form-templates - Get all form templates
     */
    @GetMapping
    public ResponseEntity<List<FormTemplateDto>> getAllFormTemplates() {
        log.debug("GET /admin-ws/form-templates - Fetching all form templates");
        List<FormTemplateDto> templates = formTemplateService.getAllFormTemplates();
        return ResponseEntity.ok(templates);
    }
    
    /**
     * GET /admin-ws/form-templates/category/{category} - Get form templates by category
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<FormTemplateDto>> getFormTemplatesByCategory(@PathVariable String category) {
        log.debug("GET /admin-ws/form-templates/category/{} - Fetching form templates by category", category);
        List<FormTemplateDto> templates = formTemplateService.getFormTemplatesByCategory(category);
        return ResponseEntity.ok(templates);
    }
    
    /**
     * GET /admin-ws/form-templates/status/{status} - Get form templates by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<FormTemplateDto>> getFormTemplatesByStatus(@PathVariable String status) {
        log.debug("GET /admin-ws/form-templates/status/{} - Fetching form templates by status", status);
        try {
            List<FormTemplateDto> templates = formTemplateService.getFormTemplatesByStatus(status);
            return ResponseEntity.ok(templates);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid status provided: {}", status);
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * GET /admin-ws/form-templates/search/name - Search form templates by name
     */
    @GetMapping("/search/name")
    public ResponseEntity<List<FormTemplateDto>> searchFormTemplatesByName(@RequestParam("q") String name) {
        log.debug("GET /admin-ws/form-templates/search/name?q={} - Searching form templates by name", name);
        List<FormTemplateDto> templates = formTemplateService.searchFormTemplatesByName(name);
        return ResponseEntity.ok(templates);
    }
    
    /**
     * GET /admin-ws/form-templates/search/tags - Search form templates by tags
     */
    @GetMapping("/search/tags")
    public ResponseEntity<List<FormTemplateDto>> searchFormTemplatesByTag(@RequestParam("q") String tag) {
        log.debug("GET /admin-ws/form-templates/search/tags?q={} - Searching form templates by tag", tag);
        List<FormTemplateDto> templates = formTemplateService.searchFormTemplatesByTag(tag);
        return ResponseEntity.ok(templates);
    }
    
    /**
     * GET /admin-ws/form-templates/{id} - Get a specific form template by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<FormTemplateDto> getFormTemplateById(@PathVariable Long id) {
        log.debug("GET /admin-ws/form-templates/{} - Fetching form template by ID", id);
        return formTemplateService.getFormTemplateById(id)
                .map(template -> ResponseEntity.ok(template))
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * POST /admin-ws/form-templates - Create a new form template
     */
    @PostMapping
    public ResponseEntity<FormTemplateDto> createFormTemplate(
            @Valid @RequestBody CreateFormTemplateDto createDto,
            Authentication authentication) {
        log.debug("POST /admin-ws/form-templates - Creating new form template: {}", createDto.getName());
        
        try {
            Long createdBy = getCurrentUserId(authentication);
            FormTemplateDto createdTemplate = formTemplateService.createFormTemplate(createDto, createdBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTemplate);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to create form template: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * PUT /admin-ws/form-templates/{id} - Update an existing form template
     */
    @PutMapping("/{id}")
    public ResponseEntity<FormTemplateDto> updateFormTemplate(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFormTemplateDto updateDto,
            Authentication authentication) {
        log.debug("PUT /admin-ws/form-templates/{} - Updating form template", id);
        
        try {
            Long updatedBy = getCurrentUserId(authentication);
            FormTemplateDto updatedTemplate = formTemplateService.updateFormTemplate(id, updateDto, updatedBy);
            return ResponseEntity.ok(updatedTemplate);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to update form template {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * DELETE /admin-ws/form-templates/{id} - Delete a form template
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormTemplate(@PathVariable Long id) {
        log.debug("DELETE /admin-ws/form-templates/{} - Deleting form template", id);
        
        try {
            formTemplateService.deleteFormTemplate(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.warn("Failed to delete form template {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * PATCH /admin-ws/form-templates/{id}/activate - Activate a form template
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<FormTemplateDto> activateFormTemplate(
            @PathVariable Long id,
            Authentication authentication) {
        log.debug("PATCH /admin-ws/form-templates/{}/activate - Activating form template", id);
        
        try {
            Long updatedBy = getCurrentUserId(authentication);
            FormTemplateDto activatedTemplate = formTemplateService.activateFormTemplate(id, updatedBy);
            return ResponseEntity.ok(activatedTemplate);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to activate form template {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * PATCH /admin-ws/form-templates/{id}/deactivate - Deactivate a form template
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<FormTemplateDto> deactivateFormTemplate(
            @PathVariable Long id,
            Authentication authentication) {
        log.debug("PATCH /admin-ws/form-templates/{}/deactivate - Deactivating form template", id);
        
        try {
            Long updatedBy = getCurrentUserId(authentication);
            FormTemplateDto deactivatedTemplate = formTemplateService.deactivateFormTemplate(id, updatedBy);
            return ResponseEntity.ok(deactivatedTemplate);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to deactivate form template {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * PATCH /admin-ws/form-templates/{id}/archive - Archive a form template
     */
    @PatchMapping("/{id}/archive")
    public ResponseEntity<FormTemplateDto> archiveFormTemplate(
            @PathVariable Long id,
            Authentication authentication) {
        log.debug("PATCH /admin-ws/form-templates/{}/archive - Archiving form template", id);
        
        try {
            Long updatedBy = getCurrentUserId(authentication);
            FormTemplateDto archivedTemplate = formTemplateService.archiveFormTemplate(id, updatedBy);
            return ResponseEntity.ok(archivedTemplate);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to archive form template {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * POST /admin-ws/form-templates/{id}/new-version - Create new version of form template
     */
    @PostMapping("/{id}/new-version")
    public ResponseEntity<FormTemplateDto> createNewVersion(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        log.debug("POST /admin-ws/form-templates/{}/new-version - Creating new version", id);
        
        try {
            String versionNotes = request.get("versionNotes");
            Long createdBy = getCurrentUserId(authentication);
            FormTemplateDto newVersionTemplate = formTemplateService.createNewVersion(id, versionNotes, createdBy);
            return ResponseEntity.ok(newVersionTemplate);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to create new version for template {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * GET /admin-ws/form-templates/{id}/usage-count - Get usage count for a form template
     */
    @GetMapping("/{id}/usage-count")
    public ResponseEntity<Map<String, Integer>> getTemplateUsageCount(@PathVariable Long id) {
        log.debug("GET /admin-ws/form-templates/{}/usage-count - Getting usage count", id);
        
        try {
            Integer usageCount = formTemplateService.getTemplateUsageCount(id);
            return ResponseEntity.ok(Map.of("usageCount", usageCount));
        } catch (IllegalArgumentException e) {
            log.warn("Failed to get usage count for template {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * GET /admin-ws/form-templates/categories - Get available categories for form templates
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAvailableCategories() {
        log.debug("GET /admin-ws/form-templates/categories - Fetching available categories");
        List<String> categories = formTemplateService.getAvailableCategories();
        return ResponseEntity.ok(categories);
    }
    
    /**
     * GET /admin-ws/form-templates/statistics - Get template statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<FormTemplateStatsDto> getTemplateStatistics() {
        log.debug("GET /admin-ws/form-templates/statistics - Fetching template statistics");
        FormTemplateStatsDto statistics = formTemplateService.getTemplateStatistics();
        return ResponseEntity.ok(statistics);
    }
    
    // Helper method to get current user ID from authentication
    private Long getCurrentUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof String) {
            try {
                return Long.parseLong((String) authentication.getPrincipal());
            } catch (NumberFormatException e) {
                log.warn("Unable to parse user ID from authentication principal");
            }
        }
        return null;
    }
}