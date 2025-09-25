package com.clinprecision.datacaptureservice.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.Map;

/**
 * Study Design Configuration Service Client
 * 
 * Feign client for accessing study-design-ws microservice configuration endpoints.
 * Handles study configuration, role definitions, and training requirements.
 * 
 * Domain: Study Design & Configuration Management
 */
@FeignClient(name = "study-design-ws", path = "/api/v1/studydesign/configuration")
public interface ConfigurationServiceClient {
    
    Logger log = LoggerFactory.getLogger(ConfigurationServiceClient.class);
    
    /**
     * Get study configuration from study-design-ws
     */
    @GetMapping("/studies/{studyId}")
    @Retry(name="study-design-ws")
    @CircuitBreaker(name="study-design-ws", fallbackMethod="getStudyConfigurationFallback")
    ResponseEntity<Map<String, Object>> getStudyConfiguration(
            @PathVariable Long studyId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Map<String, Object>> getStudyConfigurationFallback(
            Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for getStudyConfiguration: studyId={}, exception={}", 
                studyId, exception.getMessage());
        return ResponseEntity.ok(Map.of("configured", false));
    }
    
    /**
     * Get study role configuration from study-design-ws
     */
    @GetMapping("/studies/{studyId}/roles")
    @Retry(name="study-design-ws")
    @CircuitBreaker(name="study-design-ws", fallbackMethod="getStudyRoleConfigurationFallback")
    ResponseEntity<Map<String, Object>> getStudyRoleConfiguration(
            @PathVariable Long studyId, 
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Map<String, Object>> getStudyRoleConfigurationFallback(
            Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for getStudyRoleConfiguration: studyId={}, exception={}", 
                studyId, exception.getMessage());
        return ResponseEntity.ok(Map.of("roles", List.of("PRINCIPAL_INVESTIGATOR", "STUDY_COORDINATOR")));
    }
    
    /**
     * Get training requirements for study from study-design-ws
     */
    @GetMapping("/studies/{studyId}/training-requirements")
    @Retry(name="study-design-ws")
    @CircuitBreaker(name="study-design-ws", fallbackMethod="getTrainingRequirementsFallback")
    ResponseEntity<Map<String, Object>> getTrainingRequirements(
            @PathVariable Long studyId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Map<String, Object>> getTrainingRequirementsFallback(
            Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for getTrainingRequirements: studyId={}, exception={}", 
                studyId, exception.getMessage());
        return ResponseEntity.ok(Map.of("requirements", List.of("GCP_TRAINING", "PROTOCOL_TRAINING")));
    }
    
    /**
     * Check if study is properly configured in study-design-ws
     */
    @GetMapping("/studies/{studyId}/configured")
    @Retry(name="study-design-ws")
    @CircuitBreaker(name="study-design-ws", fallbackMethod="isStudyConfiguredFallback")
    ResponseEntity<Boolean> isStudyConfigured(
            @PathVariable Long studyId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Boolean> isStudyConfiguredFallback(
            Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for isStudyConfigured: studyId={}, exception={}", 
                studyId, exception.getMessage());
        return ResponseEntity.ok(false);
    }
    
    /**
     * Get required roles for study from study-design-ws
     */
    @GetMapping("/studies/{studyId}/required-roles")
    @Retry(name="study-design-ws")
    @CircuitBreaker(name="study-design-ws", fallbackMethod="getRequiredRolesFallback")
    ResponseEntity<List<String>> getRequiredRoles(
            @PathVariable Long studyId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<List<String>> getRequiredRolesFallback(
            Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for getRequiredRoles: studyId={}, exception={}", 
                studyId, exception.getMessage());
        return ResponseEntity.ok(List.of("PRINCIPAL_INVESTIGATOR", "STUDY_COORDINATOR", "DATA_MANAGER"));
    }
}