package com.clinprecision.studydesignservice.service;

import com.clinprecision.common.dto.FormTemplateDto;
import com.clinprecision.common.util.SecurityUtil;
import com.clinprecision.studydesignservice.client.AdminServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service wrapper for CodeListClient
 * Provides caching, error handling, and data transformation
 * 
 * Phase 3 Enhancement: Comprehensive caching strategy for optimal performance
 * 
 * This service replaces individual reference data services like:
 * - RegulatoryStatusService
 * - StudyPhaseService  
 * - StudyStatusService
 * 
 * By centralizing all reference data access through the Admin Service
 */
@Service
public class AdminServiceProxy {

    private static final Logger logger = LoggerFactory.getLogger(AdminServiceProxy.class);

    private final AdminServiceClient adminServiceClient;

    public AdminServiceProxy(AdminServiceClient adminServiceClient) {
        this.adminServiceClient = adminServiceClient;
    }

    /**
     * Get all active regulatory statuses
     * Replaces: RegulatoryStatusService.getAllActiveStatuses()
     * 
     * Phase 3 Enhancement: Extended cache TTL for reference data
     */
    @Cacheable(value = "codelists", key = "'regulatory_status_all'", 
               cacheManager = "cacheManager")
    public List<Map<String, Object>> getAllRegulatoryStatuses() {
        logger.debug("Fetching all regulatory statuses from Admin Service");
        
        try {
            List<Map<String, Object>> statuses = adminServiceClient.getCodeListByCategory("REGULATORY_STATUS");
            logger.debug("Retrieved {} regulatory statuses", statuses.size());
            return statuses;
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
     */
    @Cacheable(value = "codelists", key = "'study_phase_all'", 
               cacheManager = "cacheManager")
    public List<Map<String, Object>> getAllStudyPhases() {
        logger.debug("Fetching all study phases from Admin Service");
        
        try {
            List<Map<String, Object>> phases = adminServiceClient.getCodeListByCategory("STUDY_PHASE");
            logger.debug("Retrieved {} study phases", phases.size());
            return phases;
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
     */
    @Cacheable(value = "codelists", key = "'study_status_all'", 
               cacheManager = "cacheManager")
    public List<Map<String, Object>> getAllStudyStatuses() {
        logger.debug("Fetching all study statuses from Admin Service");
        
        try {
            List<Map<String, Object>> statuses = adminServiceClient.getCodeListByCategory("STUDY_STATUS");
            logger.debug("Retrieved {} study statuses", statuses.size());
            return statuses;
        } catch (Exception e) {
            logger.error("Error fetching study statuses", e);
            throw new RuntimeException("Failed to fetch study statuses", e);
        }
    }

    /**
     * Get amendment types for study amendments
     * 
     * Phase 3 Enhancement: Category-based caching
     */
    @Cacheable(value = "codelists", key = "'amendment_type_all'", 
               cacheManager = "cacheManager")
    public List<Map<String, Object>> getAllAmendmentTypes() {
        logger.debug("Fetching all amendment types from Admin Service");
        
        try {
            List<Map<String, Object>> types = adminServiceClient.getCodeListByCategory("AMENDMENT_TYPE");
            logger.debug("Retrieved {} amendment types", types.size());
            return types;
        } catch (Exception e) {
            logger.error("Error fetching amendment types", e);
            throw new RuntimeException("Failed to fetch amendment types", e);
        }
    }

    /**
     * Get visit types for visit definitions
     * 
     * Phase 3 Enhancement: Multi-level caching strategy
     */
    @Cacheable(value = "codelists", key = "'visit_type_all'", 
               cacheManager = "cacheManager")
    public List<Map<String, Object>> getAllVisitTypes() {
        logger.debug("Fetching all visit types from Admin Service");
        
        try {
            List<Map<String, Object>> types = adminServiceClient.getCodeListByCategory("VISIT_TYPE");
            logger.debug("Retrieved {} visit types", types.size());
            return types;
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
     */
    @Cacheable(value = "codelists", key = "'#category + '_' + #code'", 
               cacheManager = "cacheManager")
    public Optional<Map<String, Object>> getByCode(String category, String code) {
        logger.debug("Fetching {} with code: {}", category, code);
        
        try {
            Map<String, Object> item = adminServiceClient.getCodeListByCategoryAndCode(category, code);
            return Optional.ofNullable(item);
        } catch (Exception e) {
            logger.error("Error fetching {} with code {}", category, code, e);
            return Optional.empty();
        }
    }

    /**
     * Get regulatory statuses that allow enrollment
     * Uses metadata filtering
     */
    @Cacheable(value = "codelists", key = "'regulatory_status_allows_enrollment'")
    public List<Map<String, Object>> getRegulatoryStatusesAllowingEnrollment() {
        logger.debug("Fetching regulatory statuses allowing enrollment");
        
        try {
            Map<String, String> filters = Map.of("allowsEnrollment", "true");
            return adminServiceClient.getFilteredCodeListByCategory("REGULATORY_STATUS", filters);
        } catch (Exception e) {
            logger.error("Error fetching enrollment-allowing regulatory statuses", e);
            throw new RuntimeException("Failed to fetch enrollment-allowing regulatory statuses", e);
        }
    }

    /**
     * Get study phases that require IND/IDE
     */
    @Cacheable(value = "codelists", key = "'study_phase_requires_ind'")
    public List<Map<String, Object>> getStudyPhasesRequiringInd() {
        logger.debug("Fetching study phases requiring IND");
        
        try {
            Map<String, String> filters = Map.of("requiresInd", "true");
            return adminServiceClient.getFilteredCodeListByCategory("STUDY_PHASE", filters);
        } catch (Exception e) {
            logger.error("Error fetching IND-requiring study phases", e);
            throw new RuntimeException("Failed to fetch IND-requiring study phases", e);
        }
    }

    /**
     * Get available categories
     */
    public List<String> getAvailableCategories() {
        logger.debug("Fetching available code list categories");
        
        try {
            return adminServiceClient.getCodeListCategories();
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
     */

    /**
     * Clear all CodeList caches
     * Used when reference data is updated in Admin Service
     */
    @CacheEvict(value = "codelists", allEntries = true)
    public void clearAllCache() {
        logger.info("🗑️ Cleared all CodeList caches - fresh data will be loaded on next request");
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

    public ResponseEntity<FormTemplateDto> getFormTemplateById(Long id) {
        return adminServiceClient.getFormTemplateById(id, SecurityUtil.getAuthorizationHeader());
    }


    public void incrementTemplateUsage(Long templateId) {
        adminServiceClient.incrementTemplateUsage(templateId, SecurityUtil.getAuthorizationHeader());
    }
}