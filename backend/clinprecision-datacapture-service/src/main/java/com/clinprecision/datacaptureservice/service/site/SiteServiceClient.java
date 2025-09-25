package com.clinprecision.datacaptureservice.service.site;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin Site Service Client
 * 
 * Feign client for accessing admin-ws microservice site management endpoints.
 * Handles site management, customization, and activation operations.
 * 
 * Domain: Operational Management & Administration
 */
@FeignClient(name = "admin-ws", path = "/api/v1/admin/sites")
public interface SiteServiceClient {
    
    Logger log = LoggerFactory.getLogger(SiteServiceClient.class);
    
    /**
     * Check if site exists
     */
    @GetMapping("/{siteId}/exists")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="siteExistsFallback")
    ResponseEntity<Boolean> siteExists(
            @PathVariable Long siteId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Boolean> siteExistsFallback(
            Long siteId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for siteExists: siteId={}, exception={}", 
                siteId, exception.getMessage());
        return ResponseEntity.ok(false);
    }
    
    /**
     * Apply branding customizations
     */
    @PostMapping("/{siteId}/branding")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="applyBrandingFallback")
    ResponseEntity<Void> applyBranding(
            @PathVariable Long siteId,
            @RequestBody Map<String, Object> brandingConfiguration,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> applyBrandingFallback(
            Long siteId, Map<String, Object> brandingConfiguration, String authorization, Throwable exception) {
        log.warn("Fallback triggered for applyBranding: siteId={}, exception={}", 
                siteId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Configure forms for site
     */
    @PostMapping("/{siteId}/forms")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="configureFormsFallback")
    ResponseEntity<Void> configureForms(
            @PathVariable Long siteId,
            @RequestBody List<Map<String, Object>> formConfigurations,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> configureFormsFallback(
            Long siteId, List<Map<String, Object>> formConfigurations, String authorization, Throwable exception) {
        log.warn("Fallback triggered for configureForms: siteId={}, exception={}", 
                siteId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Setup validation rules for site
     */
    @PostMapping("/{siteId}/validation-rules")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="setupValidationRulesFallback")
    ResponseEntity<Void> setupValidationRules(
            @PathVariable Long siteId,
            @RequestBody List<Map<String, Object>> validationRules,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> setupValidationRulesFallback(
            Long siteId, List<Map<String, Object>> validationRules, String authorization, Throwable exception) {
        log.warn("Fallback triggered for setupValidationRules: siteId={}, exception={}", 
                siteId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Configure workflows for site
     */
    @PostMapping("/{siteId}/workflows")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="configureWorkflowsFallback")
    ResponseEntity<Void> configureWorkflows(
            @PathVariable Long siteId,
            @RequestBody Map<String, Object> workflowConfigurations,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> configureWorkflowsFallback(
            Long siteId, Map<String, Object> workflowConfigurations, String authorization, Throwable exception) {
        log.warn("Fallback triggered for configureWorkflows: siteId={}, exception={}", 
                siteId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Get site activation status
     */
    @GetMapping("/{siteId}/studies/{studyId}/status")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="getSiteActivationStatusFallback")
    ResponseEntity<String> getSiteActivationStatus(
            @PathVariable Long siteId,
            @PathVariable Long studyId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<String> getSiteActivationStatusFallback(
            Long siteId, Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for getSiteActivationStatus: siteId={}, studyId={}, exception={}", 
                siteId, studyId, exception.getMessage());
        return ResponseEntity.ok("UNKNOWN");
    }
    
    /**
     * Assess site readiness
     */
    @GetMapping("/{siteId}/studies/{studyId}/readiness")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="assessSiteReadinessFallback")
    ResponseEntity<Map<String, Object>> assessSiteReadiness(
            @PathVariable Long siteId,
            @PathVariable Long studyId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Map<String, Object>> assessSiteReadinessFallback(
            Long siteId, Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for assessSiteReadiness: siteId={}, studyId={}, exception={}", 
                siteId, studyId, exception.getMessage());
        return ResponseEntity.ok(Map.of("readiness", "UNKNOWN"));
    }
    
    /**
     * Activate site
     */
    @PostMapping("/{siteId}/studies/{studyId}/activate")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="activateSiteFallback")
    ResponseEntity<Void> activateSite(
            @PathVariable Long siteId,
            @PathVariable Long studyId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> activateSiteFallback(
            Long siteId, Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for activateSite: siteId={}, studyId={}, exception={}", 
                siteId, studyId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Deactivate site
     */
    @PostMapping("/{siteId}/studies/{studyId}/deactivate")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="deactivateSiteFallback")
    ResponseEntity<Void> deactivateSite(
            @PathVariable Long siteId,
            @PathVariable Long studyId,
            @RequestParam String reason,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> deactivateSiteFallback(
            Long siteId, Long studyId, String reason, String authorization, Throwable exception) {
        log.warn("Fallback triggered for deactivateSite: siteId={}, studyId={}, exception={}", 
                siteId, studyId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Enable data collection for site
     */
    @PostMapping("/{siteId}/data-collection/enable")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="enableDataCollectionFallback")
    ResponseEntity<Void> enableDataCollection(
            @PathVariable Long siteId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> enableDataCollectionFallback(
            Long siteId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for enableDataCollection: siteId={}, exception={}", 
                siteId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Disable data collection for site
     */
    @PostMapping("/{siteId}/data-collection/disable")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="disableDataCollectionFallback")
    ResponseEntity<Void> disableDataCollection(
            @PathVariable Long siteId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> disableDataCollectionFallback(
            Long siteId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for disableDataCollection: siteId={}, exception={}", 
                siteId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Send notifications
     */
    @PostMapping("/{siteId}/notifications")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="sendNotificationsFallback")
    ResponseEntity<Void> sendNotifications(
            @PathVariable Long siteId,
            @RequestParam String type,
            @RequestParam String message,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> sendNotificationsFallback(
            Long siteId, String type, String message, String authorization, Throwable exception) {
        log.warn("Fallback triggered for sendNotifications: siteId={}, type={}, exception={}", 
                siteId, type, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
}