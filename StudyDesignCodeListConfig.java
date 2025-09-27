package com.clinprecision.studydesignservice.config;

import com.clinprecision.common.annotation.EnableCodeListClient;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration to enable CodeList client in Study Design Service
 * 
 * This configuration automatically provides:
 * - CodeListClient (Feign client to admin service)  
 * - CodeListClientService (with caching and fallback)
 * - Spring Cache configuration for code lists
 * 
 * Usage in services:
 * @Autowired
 * private CodeListClientService codeListService;
 * 
 * List<CodeListDto> studyStatuses = codeListService.getCodeList("STUDY_STATUS");
 * boolean isValid = codeListService.isValidCode("AMENDMENT_TYPE", "MAJOR");
 */
@Configuration
@EnableCodeListClient
public class StudyDesignCodeListConfig {
    
    // Additional study-specific configuration can go here if needed
    
}