package com.clinprecision.studydesignservice.client;

import com.clinprecision.common.dto.FormTemplateDto;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Collections;

/**
 * Unified fallback implementation for AdminServiceClient
 * Provides degraded functionality when Admin Service is unavailable
 */
@Component
public class AdminServiceClientFallback implements AdminServiceClient {

    // ========== CodeList Fallbacks ==========

    @Override
    public List<Map<String, Object>> getCodeListByCategory(String category) {
        System.err.println("AdminServiceClient fallback: getCodeListByCategory for category: " + category);
        return Collections.emptyList();
    }

    @Override
    public Map<String, Object> getCodeListByCategoryAndCode(String category, String code) {
        System.err.println("AdminServiceClient fallback: getCodeListByCategoryAndCode for category: " + 
                          category + ", code: " + code);
        return Collections.emptyMap();
    }

    @Override
    public List<Map<String, Object>> getFilteredCodeListByCategory(String category, Map<String, String> filters) {
        System.err.println("AdminServiceClient fallback: getFilteredCodeListByCategory for category: " + category);
        return Collections.emptyList();
    }

    @Override
    public List<String> getCodeListCategories() {
        System.err.println("AdminServiceClient fallback: getCodeListCategories");
        return Collections.emptyList();
    }

    // ========== Form Template Fallbacks ==========

    @Override
    public ResponseEntity<FormTemplateDto> getFormTemplateById(Long id, String authorization) {
        System.err.println("AdminServiceClient fallback: getFormTemplateById for ID: " + id);
        
        FormTemplateDto fallbackDto = new FormTemplateDto();
        fallbackDto.setId(id);
        fallbackDto.setName("Service Unavailable");
        fallbackDto.setDescription("Form template service temporarily unavailable");
        
        return ResponseEntity.ok(fallbackDto);
    }

    @Override
    public void incrementTemplateUsage(Long templateId, String authorization) {
        System.err.println("AdminServiceClient fallback: incrementTemplateUsage for template ID: " + templateId);
        // Silently fail for usage tracking
    }
}