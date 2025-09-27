package com.clinprecision.common.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for CodeList client functionality
 * 
 * To enable in your microservice, add:
 * @Import(CodeListClientConfig.class)
 * 
 * Or use the annotation:
 * @EnableCodeListClient
 */
@Configuration
@EnableFeignClients(basePackages = "com.clinprecision.common.client")
public class CodeListClientConfig {
    
    /**
     * Default cache manager for code lists
     * Uses in-memory concurrent map cache (simple but effective)
     */
    @Bean("codeListCacheManager")
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager(
            "microservice-codelists",
            "codelist-validation"
        );
        cacheManager.setAllowNullValues(false);
        return cacheManager;
    }
}