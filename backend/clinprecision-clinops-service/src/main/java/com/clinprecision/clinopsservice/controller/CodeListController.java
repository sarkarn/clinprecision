package com.clinprecision.clinopsservice.controller;

import com.clinprecision.clinopsservice.service.CodeListService;
import com.clinprecision.clinopsservice.dto.CodeListDto;
import com.clinprecision.clinopsservice.dto.CreateCodeListRequest;
import com.clinprecision.clinopsservice.dto.UpdateCodeListRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for Code List management
 * Provides endpoints for both admin UI and other microservices
 */
@RestController
@RequestMapping("/api/admin/codelists")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CodeListController {
    
    private static final Logger logger = LoggerFactory.getLogger(CodeListController.class);
    
    @Autowired
    private CodeListService codeListService;
    
    // ============================================================================
    // ENDPOINTS FOR OTHER MICROSERVICES (Simple, fast responses)
    // ============================================================================
    
    /**
     * Simple API for microservices - Get code values by category
     * Returns simplified structure for fast lookups
     */
    @GetMapping("/simple/{category}")
    public ResponseEntity<List<CodeListDto>> getSimpleCodeList(
            @PathVariable String category) {
        try {
            List<CodeListDto> codeList = codeListService.getSimpleCodeListsByCategory(category);
            return ResponseEntity.ok(codeList);
        } catch (Exception e) {
            logger.error("Error retrieving simple code list for category: {}", category, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get specific code list entry by category and code
     */
    @GetMapping("/{category}/{code}")
    public ResponseEntity<CodeListDto> getCodeListByCode(
            @PathVariable String category,
            @PathVariable String code) {
        try {
            Optional<CodeListDto> codeListDto = codeListService.getCodeListByCategoryAndCode(category, code);
            return codeListDto.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error retrieving code list for category: {}, code: {}", category, code, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Validate code existence
     */
    @GetMapping("/validate/{category}/{code}")
    public ResponseEntity<Map<String, Boolean>> validateCode(
            @PathVariable String category,
            @PathVariable String code) {
        try {
            boolean exists = codeListService.isValidCode(category, code);
            return ResponseEntity.ok(Map.of("valid", exists));
        } catch (Exception e) {
            logger.error("Error validating code for category: {}, code: {}", category, code, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        try {
            List<String> categories = codeListService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            logger.error("Error retrieving categories", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ============================================================================
    // ENDPOINTS FOR ADMIN UI (Full CRUD operations)  
    // ============================================================================

    /**
     * Admin API - Get full code lists by category
     * Returns complete structure with metadata for admin UI
     */
    @GetMapping("/{category}")
    public ResponseEntity<List<CodeListDto>> getCodeListsByCategory(
            @PathVariable String category) {
        try {
            List<CodeListDto> codeLists = codeListService.getCodeListsByCategory(category);
            return ResponseEntity.ok(codeLists);
        } catch (Exception e) {
            logger.error("Error retrieving code lists for category: {}", category, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get code list by ID
     */
    @GetMapping("/id/{id}")
    public ResponseEntity<CodeListDto> getCodeListById(@PathVariable Long id) {
        try {
            CodeListDto codeListDto = codeListService.getCodeListById(id);
            return ResponseEntity.ok(codeListDto);
        } catch (Exception e) {
            logger.error("Error retrieving code list by ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create new code list entry
     */
    @PostMapping
    public ResponseEntity<?> createCodeList(@Valid @RequestBody CreateCodeListRequest request) {
        try {
            CodeListDto created = codeListService.createCodeList(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Code already exists in this category"));
        } catch (Exception e) {
            logger.error("Error creating code list", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Update code list entry
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCodeList(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCodeListRequest request) {
        try {
            CodeListDto updated = codeListService.updateCodeList(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error updating code list with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * Soft delete code list entry
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCodeList(
            @PathVariable Long id,
            @RequestParam @NotNull Long deletedBy) {
        try {
            codeListService.deleteCodeList(id, deletedBy);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting code list with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Hard delete code list entry (admin only)
     */
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDeleteCodeList(
            @PathVariable Long id,
            @RequestParam @NotNull Long deletedBy) {
        try {
            codeListService.hardDeleteCodeList(id, deletedBy);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error hard deleting code list with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ============================================================================
    // SEARCH AND UTILITY ENDPOINTS
    // ============================================================================

    /**
     * Search code lists
     */
    @GetMapping("/search")
    public ResponseEntity<List<CodeListDto>> searchCodeLists(
            @RequestParam String searchText) {
        try {
            List<CodeListDto> results = codeListService.searchCodeLists(searchText);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Error searching code lists with text: {}", searchText, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get child code lists (hierarchical)
     */
    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<CodeListDto>> getChildCodeLists(@PathVariable Long parentId) {
        try {
            List<CodeListDto> children = codeListService.getChildCodeLists(parentId);
            return ResponseEntity.ok(children);
        } catch (Exception e) {
            logger.error("Error retrieving child code lists for parent ID: {}", parentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get expiring code lists
     */
    @GetMapping("/expiring")
    public ResponseEntity<List<CodeListDto>> getExpiringCodeLists(
            @RequestParam(defaultValue = "30") int days) {
        try {
            List<CodeListDto> expiring = codeListService.getExpiringCodeLists(days);
            return ResponseEntity.ok(expiring);
        } catch (Exception e) {
            logger.error("Error retrieving expiring code lists for {} days", days, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update sort order for code lists in a category
     */
    @PutMapping("/{category}/sort-order")
    public ResponseEntity<Void> updateSortOrder(
            @PathVariable String category,
            @RequestBody List<Long> orderedIds,
            @RequestParam @NotNull Long updatedBy) {
        try {
            codeListService.updateSortOrder(category, orderedIds, updatedBy);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error updating sort order for category: {}", category, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ============================================================================
    // CACHE MANAGEMENT
    // ============================================================================

    /**
     * Clear all code list caches
     */
    @PostMapping("/cache/clear")
    public ResponseEntity<Map<String, String>> clearCaches() {
        try {
            codeListService.clearAllCodeListCaches();
            return ResponseEntity.ok(Map.of("message", "All code list caches cleared successfully"));
        } catch (Exception e) {
            logger.error("Error clearing caches", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to clear caches"));
        }
    }

    // ============================================================================
    // HEALTH CHECK FOR MICROSERVICES
    // ============================================================================

    /**
     * Health check endpoint for microservices
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        try {
            List<String> categories = codeListService.getAllCategories();
            return ResponseEntity.ok(Map.of(
                "status", "UP",
                "categoriesCount", categories.size(),
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            logger.error("Health check failed", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of(
                        "status", "DOWN", 
                        "error", e.getMessage(),
                        "timestamp", System.currentTimeMillis()
                    ));
        }
    }
}



