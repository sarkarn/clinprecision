package com.clinprecision.common.client;

import com.clinprecision.common.dto.admin.CodeListDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Fallback implementation for CodeListClient
 * Provides default behavior when admin service is unavailable
 */
@Component
public class CodeListClientFallback implements CodeListClient {
    
    private static final Logger logger = LoggerFactory.getLogger(CodeListClientFallback.class);
    
    @Override
    public ResponseEntity<List<CodeListDto>> getSimpleCodeList(String category) {
        logger.warn("CodeListClient fallback triggered for category: {}", category);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(getDefaultCodesForCategory(category));
    }
    
    @Override
    public ResponseEntity<CodeListDto> getCodeListByCode(String category, String code) {
        logger.warn("CodeListClient fallback triggered for category: {}, code: {}", category, code);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
    }
    
    @Override
    public ResponseEntity<Map<String, Boolean>> validateCode(String category, String code) {
        logger.warn("CodeListClient fallback triggered for validation: {}/{}", category, code);
        // Default to valid for fallback to prevent blocking operations
        return ResponseEntity.ok(Map.of("valid", true));
    }
    
    @Override
    public ResponseEntity<List<String>> getCategories() {
        logger.warn("CodeListClient fallback triggered for categories");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Collections.emptyList());
    }
    
    @Override
    public ResponseEntity<Map<String, Object>> healthCheck() {
        logger.warn("CodeListClient fallback triggered for health check");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                    "status", "DOWN",
                    "message", "Admin service unavailable",
                    "fallback", true,
                    "timestamp", System.currentTimeMillis()
                ));
    }
    
    @Override
    public ResponseEntity<List<CodeListDto>> getChildCodeLists(Long parentId) {
        logger.warn("CodeListClient fallback triggered for parent: {}", parentId);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Collections.emptyList());
    }
    
    /**
     * Provide basic fallback codes for critical categories to prevent complete failure
     */
    private List<CodeListDto> getDefaultCodesForCategory(String category) {
        switch (category.toUpperCase()) {
            case "USER_STATUS":
                return List.of(
                    createFallbackDto("USER_STATUS", "ACTIVE", "Active", 1),
                    createFallbackDto("USER_STATUS", "INACTIVE", "Inactive", 2)
                );
            case "STUDY_STATUS":
                return List.of(
                    createFallbackDto("STUDY_STATUS", "DRAFT", "Draft", 1),
                    createFallbackDto("STUDY_STATUS", "ACTIVE", "Active", 2),
                    createFallbackDto("STUDY_STATUS", "COMPLETED", "Completed", 3)
                );
            case "AMENDMENT_TYPE":
                return List.of(
                    createFallbackDto("AMENDMENT_TYPE", "INITIAL", "Initial", 1),
                    createFallbackDto("AMENDMENT_TYPE", "MAJOR", "Major", 2),
                    createFallbackDto("AMENDMENT_TYPE", "MINOR", "Minor", 3),
                    createFallbackDto("AMENDMENT_TYPE", "SAFETY", "Safety", 4)
                );
            default:
                return Collections.emptyList();
        }
    }
    
    private CodeListDto createFallbackDto(String category, String code, String displayName, int sortOrder) {
        CodeListDto dto = new CodeListDto();
        dto.setCategory(category);
        dto.setCode(code);
        dto.setDisplayName(displayName);
        dto.setSortOrder(sortOrder);
        dto.setIsActive(true);
        dto.setSystemCode(true); // Mark as system fallback
        return dto;
    }
}