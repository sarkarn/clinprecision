package com.clinprecision.studydesignservice.client;

import com.clinprecision.common.dto.FormTemplateDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

/**
 * Unified Feign Client for Admin Service
 * Provides access to both CodeList and FormTemplate functionality
 * 
 * This consolidates access to Admin Service endpoints:
 * - CodeLists: Reference data (dropdowns, code lists) 
 * - FormTemplates: Form template management
 */
@FeignClient(
    name = "admin-ws",
    fallback = AdminServiceClientFallback.class
)
public interface AdminServiceClient {

    // ========== CodeList Operations ==========
    
    /**
     * Get all active code lists by category
     * Used for dropdown populations
     * 
     * @param category The category (e.g., "REGULATORY_STATUS", "STUDY_PHASE", "AMENDMENT_TYPE")
     * @return List of active code list items
     */
    @GetMapping("/api/admin/codelists/{category}")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws")
    List<Map<String, Object>> getCodeListByCategory(@PathVariable String category);

    /**
     * Get specific code list item by category and code
     * 
     * @param category The category
     * @param code The specific code
     * @return Code list item details
     */
    @GetMapping("/api/admin/codelists/{category}/{code}")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws")
    Map<String, Object> getCodeListByCategoryAndCode(
        @PathVariable String category, 
        @PathVariable String code
    );

    /**
     * Get code lists with custom filters
     * Supports metadata-based filtering
     * Note: Admin Service doesn't have filtered endpoint yet, so this falls back to regular category call
     * 
     * @param category The category
     * @param filters Additional filter parameters (currently ignored)
     * @return Filtered code list items
     */
    @GetMapping("/api/admin/codelists/{category}")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws")
    List<Map<String, Object>> getFilteredCodeListByCategory(
        @PathVariable String category,
        @RequestParam Map<String, String> filters
    );

    /**
     * Get all categories available in the system
     * Useful for dynamic UI generation
     * 
     * @return List of available categories
     */
    @GetMapping("/api/admin/codelists/categories")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws")
    List<String> getCodeListCategories();

    // ========== Form Template Operations ==========

    /**
     * Get form template by ID
     * 
     * @param id The template ID
     * @param authorization Authorization header
     * @return Form template details
     */
    @GetMapping("/api/form-templates/{id}")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="getFormTemplateByIdFallback")
    ResponseEntity<FormTemplateDto> getFormTemplateById(
        @PathVariable Long id, 
        @RequestHeader("Authorization") String authorization
    );

    /**
     * Increment template usage count
     * 
     * @param templateId The template ID
     * @param authorization Authorization header
     */
    @PostMapping("/api/form-templates/template/{templateId}")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="incrementTemplateUsageFallback")
    void incrementTemplateUsage(
        @PathVariable Long templateId, 
        @RequestHeader("Authorization") String authorization
    );

    // ========== Fallback Methods ==========

    default ResponseEntity<FormTemplateDto> getFormTemplateByIdFallback(
        Long id, String authorization, Throwable exception) {
        System.err.println("AdminServiceClient fallback: getFormTemplateById for ID: " + id);
        System.err.println("Exception: " + exception.getMessage());
        
        FormTemplateDto fallbackDto = new FormTemplateDto();
        fallbackDto.setId(id);
        fallbackDto.setName("Service Unavailable");
        fallbackDto.setDescription("Form template service temporarily unavailable");
        
        return ResponseEntity.ok(fallbackDto);
    }

    default void incrementTemplateUsageFallback(
        Long templateId, String authorization, Throwable exception) {
        System.err.println("AdminServiceClient fallback: incrementTemplateUsage for template ID: " + templateId);
        System.err.println("Exception: " + exception.getMessage());
        // Silently fail for usage tracking
    }
}