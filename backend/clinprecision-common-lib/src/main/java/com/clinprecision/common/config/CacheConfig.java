package com.clinprecision.common.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.lang.NonNull;

import java.lang.reflect.Method;
import java.util.Arrays;

/**
 * Spring Cache Configuration - Phase 3 Performance Enhancement
 * 
 * Comprehensive caching strategy for all microservices
 * Optimizes performance for reference data and frequently accessed business data
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Primary Cache Manager for all microservices
     * Uses ConcurrentMapCacheManager for simplicity and performance
     */
    @Bean
    @Primary
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        
        // Pre-configure cache names for all microservices
        cacheManager.setCacheNames(Arrays.asList(
            // CodeList caches (Admin Service) - matching exact names used in @Cacheable
            "codeLists",              // Used by CodeListService.getCodeListsByCategory()
            "simpleCodeLists",        // Used by CodeListService.getSimpleCodeListsByCategory()  
            "codeListCategories",     // Used by CodeListService.getAllCategories()
            "codelists",
            "codelist-categories", 
            "codelist-by-category",
            "codelist-filtered",
            
            // Study Design Service caches  
            "studies",
            "study-phases",
            "study-statuses",
            "regulatory-statuses",
            "study-lookup-data",
            "study-amendments",
            "study-validation",
            
            // User Service caches
            "users",
            "user-profiles", 
            "user-roles",
            "user-permissions",
            
            // Data Capture Service caches
            "form-definitions",
            "form-templates",
            "visit-definitions",
            "data-capture-config",
            
            // Common/Shared caches
            "system-config",
            "audit-logs",
            "lookup-data"
        ));
        
        // Allow cache creation at runtime
        cacheManager.setAllowNullValues(false);
        
        return cacheManager;
    }

    /**
     * Custom Key Generator for complex cache keys
     * Handles multi-parameter methods and object-based caching
     */
    @Bean("customKeyGenerator")
    public KeyGenerator keyGenerator() {
        return new CustomKeyGenerator();
    }
    
    /**
     * Custom Key Generator Implementation
     */
    public static class CustomKeyGenerator implements KeyGenerator {
        
        @Override
        @NonNull
        public Object generate(@NonNull Object target, @NonNull Method method, @NonNull Object... params) {
            StringBuilder key = new StringBuilder();
            
            // Include class name for uniqueness across services
            key.append(target.getClass().getSimpleName()).append(":");
            key.append(method.getName());
            
            // Add parameters to key
            if (params.length > 0) {
                key.append(":");
                for (Object param : params) {
                    if (param != null) {
                        key.append(param.toString()).append("_");
                    } else {
                        key.append("null_");
                    }
                }
                // Remove trailing underscore
                if (key.charAt(key.length() - 1) == '_') {
                    key.deleteCharAt(key.length() - 1);
                }
            }
            
            return key.toString();
        }
    }
}