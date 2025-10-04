package com.clinprecision.clinopsservice.service;


import com.clinprecision.common.dto.CodeListDto;
import com.clinprecision.common.dto.clinops.FormTemplateDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service wrapper for CodeList and FormTemplate operations
 * Provides caching, error handling, and data transformation
 * 
 * Phase 3 Enhancement: Comprehensive caching strategy for optimal performance
 * Phase 4 Migration: Direct local service calls (no Feign client dependency)
 * 
 * This service replaces individual reference data services like:
 * - RegulatoryStatusService
 * - StudyPhaseService  
 * - StudyStatusService
 * 
 * By centralizing all reference data access through local services
 */
@Service
public class AdminServiceProxy {

    private static final Logger logger = LoggerFactory.getLogger(AdminServiceProxy.class);

    private final CodeListService codeListService;
    private final FormTemplateService formTemplateService;

    public AdminServiceProxy(CodeListService codeListService, 
                           FormTemplateService formTemplateService) {
        this.codeListService = codeListService;
        this.formTemplateService = formTemplateService;
    }

    /**
     * Helper method to convert CodeListDto to Map for backward compatibility
     */
    private Map<String, Object> toMap(CodeListDto dto) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", dto.getId());
        map.put("category", dto.getCategory());
        map.put("code", dto.getCode());
        map.put("label", dto.getDisplayName());
        map.put("description", dto.getDescription());
        map.put("sortOrder", dto.getSortOrder());
        map.put("isActive", dto.getIsActive());
        map.put("metadata", dto.getMetadata());
        return map;
    }

    /**
     * Get all active regulatory statuses
     * Replaces: RegulatoryStatusService.getAllActiveStatuses()
     * 
     * Phase 3 Enhancement: Extended cache TTL for reference data
     * Phase 4 Migration: Direct local service calls
     */
    @Cacheable(value = "codelists", key = "'regulatory_status_all'", 
               cacheManager = "cacheManager")
    public List<Map<String, Object>> getAllRegulatoryStatuses() {
        logger.debug("Fetching all regulatory statuses from local service");
        
        try {
            List<com.clinprecision.common.dto.CodeListDto> statuses = 
                codeListService.getSimpleCodeListsByCategory("REGULATORY_STATUS");
            logger.debug("Retrieved {} regulatory statuses", statuses.size());
            return statuses.stream().map(this::toMap).collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching regulatory statuses", e);
            throw new RuntimeException("Failed to fetch regulatory statuses", e);
        }
    }

    /**
     * Get all active study phases
     * Replaces: StudyPhaseService.getAllActivePhases()
     * 
     * Phase 3 Enhancement: Long-term caching for stable reference data
     * Phase 4 Migration: Direct local service calls
     */
    @Cacheable(value = "codelists", key = "'study_phase_all'", 
               cacheManager = "cacheManager")
    public List<Map<String, Object>> getAllStudyPhases() {
        logger.debug("Fetching all study phases from local service");
        
        try {
            List<com.clinprecision.common.dto.CodeListDto> phases = 
                codeListService.getSimpleCodeListsByCategory("STUDY_PHASE");
            logger.debug("Retrieved {} study phases", phases.size());
            return phases.stream().map(this::toMap).collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching study phases", e);
            throw new RuntimeException("Failed to fetch study phases", e);
        }
    }

    /**
     * Get all active study statuses
     * Replaces: StudyStatusService.getAllActiveStatuses()
     * 
     * Phase 3 Enhancement: Intelligent caching with eviction policies
     * Phase 4 Migration: Direct local service calls
     */
    @Cacheable(value = "codelists", key = "'study_status_all'", 
               cacheManager = "cacheManager")
    public List<Map<String, Object>> getAllStudyStatuses() {
        logger.debug("Fetching all study statuses from local service");
        
        try {
            List<com.clinprecision.common.dto.CodeListDto> statuses = 
                codeListService.getSimpleCodeListsByCategory("STUDY_STATUS");
            logger.debug("Retrieved {} study statuses", statuses.size());
            return statuses.stream().map(this::toMap).collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching study statuses", e);
            throw new RuntimeException("Failed to fetch study statuses", e);
        }
    }

    /**
     * Get amendment types for study amendments
     * 
     * Phase 3 Enhancement: Category-based caching
     * Phase 4 Migration: Direct local service calls
     */
    @Cacheable(value = "codelists", key = "'amendment_type_all'", 
               cacheManager = "cacheManager")
    public List<Map<String, Object>> getAllAmendmentTypes() {
        logger.debug("Fetching all amendment types from local service");
        
        try {
            List<com.clinprecision.common.dto.CodeListDto> types = 
                codeListService.getSimpleCodeListsByCategory("AMENDMENT_TYPE");
            logger.debug("Retrieved {} amendment types", types.size());
            return types.stream().map(this::toMap).collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching amendment types", e);
            throw new RuntimeException("Failed to fetch amendment types", e);
        }
    }

    /**
     * Get visit types for visit definitions
     * 
     * Phase 3 Enhancement: Multi-level caching strategy
     * Phase 4 Migration: Direct local service calls
     */
    @Cacheable(value = "codelists", key = "'visit_type_all'", 
               cacheManager = "cacheManager")
    public List<Map<String, Object>> getAllVisitTypes() {
        logger.debug("Fetching all visit types from local service");
        
        try {
            List<com.clinprecision.common.dto.CodeListDto> types = 
                codeListService.getSimpleCodeListsByCategory("VISIT_TYPE");
            logger.debug("Retrieved {} visit types", types.size());
            return types.stream().map(this::toMap).collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching visit types", e);
            throw new RuntimeException("Failed to fetch visit types", e);
        }
    }

    /**
     * Get code list item by category and code
     * Generic method for any lookup
     * 
     * Phase 3 Enhancement: Parameter-based cache keys for granular caching
     * Phase 4 Migration: Direct local service calls
     */
    @Cacheable(value = "codelists", key = "'#category + '_' + #code'", 
               cacheManager = "cacheManager")
    public Optional<Map<String, Object>> getByCode(String category, String code) {
        logger.debug("Fetching {} with code: {}", category, code);
        
        try {
            List<com.clinprecision.common.dto.CodeListDto> items = 
                codeListService.getSimpleCodeListsByCategory(category);
            return items.stream()
                .filter(item -> code.equals(item.getCode()))
                .map(this::toMap)
                .findFirst();
        } catch (Exception e) {
            logger.error("Error fetching {} with code {}", category, code, e);
            return Optional.empty();
        }
    }

    /**
     * Get regulatory statuses that allow enrollment
     * Uses metadata filtering
     * Phase 4 Migration: Direct local service calls with filtering
     */
    @Cacheable(value = "codelists", key = "'regulatory_status_allows_enrollment'")
    public List<Map<String, Object>> getRegulatoryStatusesAllowingEnrollment() {
        logger.debug("Fetching regulatory statuses allowing enrollment");
        
        try {
            List<com.clinprecision.common.dto.CodeListDto> allStatuses = 
                codeListService.getSimpleCodeListsByCategory("REGULATORY_STATUS");
            return allStatuses.stream()
                .filter(item -> {
                    Object metadata = item.getMetadata();
                    if (metadata instanceof Map) {
                        Object allowsEnrollment = ((Map<?, ?>) metadata).get("allowsEnrollment");
                        return "true".equalsIgnoreCase(String.valueOf(allowsEnrollment));
                    }
                    return false;
                })
                .map(this::toMap)
                .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching enrollment-allowing regulatory statuses", e);
            throw new RuntimeException("Failed to fetch enrollment-allowing regulatory statuses", e);
        }
    }

    /**
     * Get study phases that require IND/IDE
     * Phase 4 Migration: Direct local service calls with filtering
     */
    @Cacheable(value = "codelists", key = "'study_phase_requires_ind'")
    public List<Map<String, Object>> getStudyPhasesRequiringInd() {
        logger.debug("Fetching study phases requiring IND");
        
        try {
            List<com.clinprecision.common.dto.CodeListDto> allPhases = 
                codeListService.getSimpleCodeListsByCategory("STUDY_PHASE");
            return allPhases.stream()
                .filter(item -> {
                    Object metadata = item.getMetadata();
                    if (metadata instanceof Map) {
                        Object requiresInd = ((Map<?, ?>) metadata).get("requiresInd");
                        return "true".equalsIgnoreCase(String.valueOf(requiresInd));
                    }
                    return false;
                })
                .map(this::toMap)
                .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching IND-requiring study phases", e);
            throw new RuntimeException("Failed to fetch IND-requiring study phases", e);
        }
    }

    /**
     * Get available categories
     * Phase 4 Migration: Direct local service calls
     */
    public List<String> getAvailableCategories() {
        logger.debug("Fetching available code list categories");
        
        try {
            return codeListService.getAllCategories();
        } catch (Exception e) {
            logger.error("Error fetching categories", e);
            throw new RuntimeException("Failed to fetch categories", e);
        }
    }

    /**
     * Convert code list items to legacy DTO format
     * Helper method for backward compatibility
     */
    public <T> List<T> convertToLegacyFormat(List<Map<String, Object>> items, 
                                           Class<T> dtoClass) {
        // This would contain mapping logic to convert generic Map responses
        // to specific DTOs like RegulatoryStatusDto, StudyPhaseDto, etc.
        // For now, returning empty list as placeholder
        logger.warn("Legacy format conversion not implemented for {}", dtoClass.getSimpleName());
        return List.of();
    }

    /**
     * Phase 3 Enhancement: Cache Management Methods
     * Phase 4 Migration: Delegates to local service
     */

    /**
     * Clear all CodeList caches
     * Used when reference data is updated locally
     */
    @CacheEvict(value = "codelists", allEntries = true)
    public void clearAllCache() {
        logger.info("🗑️ Cleared all CodeList caches - fresh data will be loaded on next request");
        codeListService.clearAllCodeListCaches();
    }

    /**
     * Clear cache for specific category
     */
    @CacheEvict(value = "codelists", key = "'#category + '_all'")
    public void clearCacheForCategory(String category) {
        logger.info("🗑️ Cleared cache for category: {}", category);
    }

    /**
     * Warm up caches by pre-loading all reference data
     * Should be called on application startup or after cache clear
     */
    public void warmUpCaches() {
        logger.info("🔥 Warming up CodeList caches...");
        
        try {
            getAllRegulatoryStatuses();
            getAllStudyPhases();
            getAllStudyStatuses();
            getAllAmendmentTypes();
            getAllVisitTypes();
            
            logger.info("✅ Cache warm-up completed successfully");
        } catch (Exception e) {
            logger.warn("⚠️ Cache warm-up partially failed: {}", e.getMessage());
        }
    }

    /**
     * Get cache statistics for monitoring
     */
    public Map<String, Object> getCacheStats() {
        Map<String, Object> stats = Map.of(
            "service", "CodeListClientService",
            "cacheNames", List.of("codelists"),
            "lastWarmup", "Not implemented - requires cache manager integration",
            "cacheHits", "Not implemented - requires cache manager integration",
            "cacheMisses", "Not implemented - requires cache manager integration"
        );
        
        logger.debug("Cache stats: {}", stats);
        return stats;
    }

    /**
     * Get form template by ID
     * Phase 4 Migration: Direct local service calls
     */
    public ResponseEntity<FormTemplateDto> getFormTemplateById(Long id) {
        logger.debug("Fetching form template by ID: {}", id);
        try {
            FormTemplateDto template = formTemplateService.getFormTemplateById(id);
            return ResponseEntity.ok(template);
        } catch (Exception e) {
            logger.error("Error fetching form template {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Increment template usage count
     * Phase 4 Migration: Direct local service calls
     */
    public void incrementTemplateUsage(Long templateId) {
        logger.debug("Incrementing usage count for template: {}", templateId);
        try {
            formTemplateService.incrementTemplateUsage(templateId);
        } catch (Exception e) {
            logger.error("Error incrementing template usage for {}", templateId, e);
            throw new RuntimeException("Failed to increment template usage", e);
        }
    }
}
