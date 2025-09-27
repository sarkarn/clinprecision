package com.clinprecision.common.client;

import com.clinprecision.common.dto.admin.CodeListDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

/**
 * Feign Client for CodeList operations from Admin Service
 * Used by other microservices to consume code list data
 * 
 * Benefits of using Feign:
 * - Declarative REST client (just define interface)
 * - Automatic service discovery integration
 * - Built-in load balancing and circuit breaker support
 * - Automatic JSON serialization/deserialization
 * - Easy fallback handling
 */
@FeignClient(
    name = "clinprecision-admin-service",
    path = "/api/admin/codelists",
    fallback = CodeListClientFallback.class
)
public interface CodeListClient {
    
    /**
     * Get simplified code list for dropdown/validation purposes
     * This is the most commonly used endpoint by microservices
     */
    @GetMapping("/simple/{category}")
    ResponseEntity<List<CodeListDto>> getSimpleCodeList(@PathVariable("category") String category);
    
    /**
     * Get specific code list entry by category and code
     * Useful for validation and business rule checks
     */
    @GetMapping("/{category}/{code}")
    ResponseEntity<CodeListDto> getCodeListByCode(@PathVariable("category") String category, 
                                                  @PathVariable("code") String code);
    
    /**
     * Validate if a code exists and is currently valid
     * Returns true/false for quick validation checks
     */
    @GetMapping("/validate/{category}/{code}")
    ResponseEntity<Map<String, Boolean>> validateCode(@PathVariable("category") String category, 
                                                       @PathVariable("code") String code);
    
    /**
     * Get all available categories
     * Useful for dynamic form generation or configuration
     */
    @GetMapping("/categories")
    ResponseEntity<List<String>> getCategories();
    
    /**
     * Health check - verify admin service connectivity
     * Used for service mesh health monitoring
     */
    @GetMapping("/health")
    ResponseEntity<Map<String, Object>> healthCheck();
    
    /**
     * Get child code lists for hierarchical data
     * Used for dependent dropdowns (e.g., Country -> State -> City)
     */
    @GetMapping("/{parentId}/children")
    ResponseEntity<List<CodeListDto>> getChildCodeLists(@PathVariable("parentId") Long parentId);
}