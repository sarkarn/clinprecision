package com.clinprecision.common.service;

import com.clinprecision.common.client.CodeListClient;
import com.clinprecision.common.dto.CodeListDto;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service for consuming CodeList data from Admin Service
 * Provides caching, error handling, and business logic for other microservices
 */
@Service
public class CodeListClientService {
    
    private static final Logger logger = LoggerFactory.getLogger(CodeListClientService.class);
    
    @Autowired
    private CodeListClient codeListClient;
    
    @Value("${codelist.cache.ttl:3600}")
    private long cacheTimeToLiveSeconds;
    
    @Value("${codelist.cache.enabled:true}")
    private boolean cacheEnabled;
    
    @Value("${codelist.fallback.enabled:true}")
    private boolean fallbackEnabled;
    
    /**
     * Get code list by category with caching
     * Primary method used by other microservices
     */
    @Cacheable(value = "microservice-codelists", key = "#category", unless = "#result == null or #result.isEmpty()")
    public List<CodeListDto> getCodeList(String category) {
        logger.debug("Fetching code list for category: {}", category);
        
        // Fetch from admin service
        try {
            ResponseEntity<List<CodeListDto>> response = codeListClient.getSimpleCodeList(category);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<CodeListDto> codeList = response.getBody();
                if (codeList != null) {
                    logger.debug("Retrieved {} items for category: {}", codeList.size(), category);
                    return codeList;
                }
            } else if (response.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE && fallbackEnabled) {
                logger.warn("Admin service unavailable, using fallback for category: {}", category);
                return response.getBody() != null ? response.getBody() : Collections.emptyList();
            }
            
        } catch (FeignException e) {
            logger.error("Feign exception when fetching code list for category: {}", category, e);
            if (fallbackEnabled) {
                return getEmergencyFallback(category);
            }
        } catch (Exception e) {
            logger.error("Unexpected error fetching code list for category: {}", category, e);
            if (fallbackEnabled) {
                return getEmergencyFallback(category);
            }
        }
        
        return Collections.emptyList();
    }
    
    /**
     * Validate if a code exists and is currently valid
     */
    public boolean isValidCode(String category, String code) {
        logger.debug("Validating code: {} in category: {}", code, category);
        
        try {
            ResponseEntity<Map<String, Boolean>> response = 
                codeListClient.validateCode(category, code);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Boolean> result = response.getBody();
                return result != null && Boolean.TRUE.equals(result.get("valid"));
            }
            
        } catch (FeignException e) {
            logger.warn("Feign exception during code validation for {}:{} - {}", category, code, e.getMessage());
            if (fallbackEnabled) {
                // Fall back to local validation
                return validateCodeLocally(category, code);
            }
        } catch (Exception e) {
            logger.error("Unexpected error validating code {}:{}", category, code, e);
            if (fallbackEnabled) {
                return validateCodeLocally(category, code);
            }
        }
        
        return false;
    }
    
    /**
     * Find specific code entry by category and code
     */
    public Optional<CodeListDto> findByCode(String category, String code) {
        List<CodeListDto> codeList = getCodeList(category);
        return codeList.stream()
                .filter(item -> item.getCode().equals(code))
                .findFirst();
    }
    
    /**
     * Get display name for a code
     */
    public String getDisplayName(String category, String code) {
        return findByCode(category, code)
                .map(CodeListDto::getDisplayName)
                .orElse(code); // Fallback to code itself
    }
    
    /**
     * Get all available categories
     */
    public List<String> getAvailableCategories() {
        try {
            ResponseEntity<List<String>> response = codeListClient.getCategories();
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            }
        } catch (Exception e) {
            logger.error("Error fetching categories", e);
        }
        return Collections.emptyList();
    }
    
    /**
     * Check if admin service is healthy
     */
    public boolean isAdminServiceHealthy() {
        try {
            ResponseEntity<Map<String, Object>> response = codeListClient.healthCheck();
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if (body != null) {
                    Object status = body.get("status");
                    return "UP".equals(status);
                }
            }
        } catch (Exception e) {
            logger.debug("Admin service health check failed", e);
        }
        return false;
    }
    
    /**
     * Clear local cache for a specific category
     * Uses Spring Cache eviction
     */
    public void clearCacheForCategory(String category) {
        // Spring Cache eviction will be handled by @CacheEvict annotations
        // This method is a placeholder for future cache management logic
        logger.info("Cache clear requested for category: {} (handled by Spring Cache)", category);
    }
    
    /**
     * Clear all code list caches
     * Uses Spring Cache eviction
     */
    public void clearAllCodeListCaches() {
        // Spring Cache eviction will be handled by @CacheEvict annotations
        // This method is a placeholder for future cache management logic
        logger.info("All cache clear requested (handled by Spring Cache)");
    }
    
    /**
     * Emergency fallback when all other methods fail
     */
    private List<CodeListDto> getEmergencyFallback(String category) {
        logger.warn("Using emergency fallback for category: {}", category);
        
        // Return minimal essential codes to prevent complete failure
        switch (category.toUpperCase()) {
            case "USER_STATUS":
                return List.of(
                    createEmergencyDto("USER_STATUS", "ACTIVE", "Active"),
                    createEmergencyDto("USER_STATUS", "INACTIVE", "Inactive")
                );
            case "STUDY_STATUS":
                return List.of(
                    createEmergencyDto("STUDY_STATUS", "DRAFT", "Draft"),
                    createEmergencyDto("STUDY_STATUS", "ACTIVE", "Active")
                );
            default:
                return Collections.emptyList();
        }
    }
    
    /**
     * Local validation when service is unavailable
     */
    private boolean validateCodeLocally(String category, String code) {
        List<CodeListDto> fallbackCodes = getEmergencyFallback(category);
        return fallbackCodes.stream()
                .anyMatch(dto -> dto.getCode().equals(code));
    }
    
    private CodeListDto createEmergencyDto(String category, String code, String displayName) {
        CodeListDto dto = new CodeListDto();
        dto.setCategory(category);
        dto.setCode(code);
        dto.setDisplayName(displayName);
        dto.setIsActive(true);
        dto.setSystemCode(true);
        return dto;
    }
    
    /**
     * Get configuration info for debugging
     */
    public Map<String, Object> getConfiguration() {
        Map<String, Object> config = new HashMap<>();
        config.put("cacheEnabled", cacheEnabled);
        config.put("cacheTimeToLiveSeconds", cacheTimeToLiveSeconds);
        config.put("fallbackEnabled", fallbackEnabled);
        config.put("adminServiceHealthy", isAdminServiceHealthy());
        config.put("cacheType", "Spring Cache");
        return config;
    }
}