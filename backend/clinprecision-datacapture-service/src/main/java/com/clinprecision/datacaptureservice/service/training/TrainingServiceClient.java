package com.clinprecision.datacaptureservice.service.training;

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
 * Admin Training Service Client
 * 
 * Feign client for accessing admin-ws microservice training endpoints.
 * Handles training management, certification, and compliance tracking.
 * 
 * Domain: Operational Management & Administration
 */
@FeignClient(name = "admin-ws", path = "/api/v1/admin/training")
public interface TrainingServiceClient {
    
    Logger log = LoggerFactory.getLogger(TrainingServiceClient.class);
    
    /**
     * Assess personnel qualifications
     */
    @PostMapping("/users/{userId}/studies/{studyId}/assess-qualifications")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="assessQualificationsFallback")
    ResponseEntity<Map<String, Object>> assessQualifications(
            @PathVariable Long userId,
            @PathVariable Long studyId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Map<String, Object>> assessQualificationsFallback(
            Long userId, Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for assessQualifications: userId={}, studyId={}, exception={}", 
                userId, studyId, exception.getMessage());
        return ResponseEntity.ok(Map.of("status", "UNKNOWN"));
    }
    
    /**
     * Create personalized training plan
     */
    @PostMapping("/users/{userId}/studies/{studyId}/personalized-plan")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="createPersonalizedPlanFallback")
    ResponseEntity<Void> createPersonalizedPlan(
            @PathVariable Long userId,
            @PathVariable Long studyId,
            @RequestBody List<String> roles,
            @RequestParam Map<String, Object> trainingRequirements,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> createPersonalizedPlanFallback(
            Long userId, Long studyId, List<String> roles, Map<String, Object> trainingRequirements, 
            String authorization, Throwable exception) {
        log.warn("Fallback triggered for createPersonalizedPlan: userId={}, studyId={}, exception={}", 
                userId, studyId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Schedule training sessions
     */
    @PostMapping("/studies/{studyId}/sites/{siteId}/schedule-sessions")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="scheduleTrainingSessionsFallback")
    ResponseEntity<Void> scheduleTrainingSessions(
            @PathVariable Long studyId,
            @PathVariable Long siteId,
            @RequestBody List<Map<String, Object>> personnel,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> scheduleTrainingSessionsFallback(
            Long studyId, Long siteId, List<Map<String, Object>> personnel, String authorization, Throwable exception) {
        log.warn("Fallback triggered for scheduleTrainingSessions: studyId={}, siteId={}, exception={}", 
                studyId, siteId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Setup progress tracking
     */
    @PostMapping("/studies/{studyId}/sites/{siteId}/setup-progress-tracking")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="setupProgressTrackingFallback")
    ResponseEntity<Void> setupProgressTracking(
            @PathVariable Long studyId,
            @PathVariable Long siteId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> setupProgressTrackingFallback(
            Long studyId, Long siteId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for setupProgressTracking: studyId={}, siteId={}, exception={}", 
                studyId, siteId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Check training compliance
     */
    @GetMapping("/studies/{studyId}/sites/{siteId}/compliance")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="checkTrainingComplianceFallback")
    ResponseEntity<Map<String, Object>> checkTrainingCompliance(
            @PathVariable Long studyId,
            @PathVariable Long siteId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Map<String, Object>> checkTrainingComplianceFallback(
            Long studyId, Long siteId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for checkTrainingCompliance: studyId={}, siteId={}, exception={}", 
                studyId, siteId, exception.getMessage());
        return ResponseEntity.ok(Map.of("compliance", "UNKNOWN"));
    }
    
    /**
     * Get training progress
     */
    @GetMapping("/studies/{studyId}/sites/{siteId}/users/{userId}/progress")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="getTrainingProgressFallback")
    ResponseEntity<Map<String, Object>> getTrainingProgress(
            @PathVariable Long studyId,
            @PathVariable Long siteId,
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Map<String, Object>> getTrainingProgressFallback(
            Long studyId, Long siteId, Long userId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for getTrainingProgress: studyId={}, siteId={}, userId={}, exception={}", 
                studyId, siteId, userId, exception.getMessage());
        return ResponseEntity.ok(Map.of("progress", "UNKNOWN"));
    }
    
    /**
     * Start training session
     */
    @PostMapping("/sessions/{sessionId}/start")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="startSessionFallback")
    ResponseEntity<Void> startSession(
            @PathVariable String sessionId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> startSessionFallback(
            String sessionId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for startSession: sessionId={}, exception={}", 
                sessionId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Evaluate certification results
     */
    @GetMapping("/users/{userId}/studies/{studyId}/certification-evaluation")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="evaluateCertificationResultsFallback")
    ResponseEntity<Boolean> evaluateCertificationResults(
            @PathVariable Long userId,
            @PathVariable Long studyId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Boolean> evaluateCertificationResultsFallback(
            Long userId, Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for evaluateCertificationResults: userId={}, studyId={}, exception={}", 
                userId, studyId, exception.getMessage());
        return ResponseEntity.ok(false);
    }
    
    /**
     * Issue certificate
     */
    @PostMapping("/users/{userId}/studies/{studyId}/issue-certificate")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="issueCertificateFallback")
    ResponseEntity<String> issueCertificate(
            @PathVariable Long userId,
            @PathVariable Long studyId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<String> issueCertificateFallback(
            Long userId, Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for issueCertificate: userId={}, studyId={}, exception={}", 
                userId, studyId, exception.getMessage());
        return ResponseEntity.ok("CERT-" + System.currentTimeMillis());
    }
    
    /**
     * Get expired certifications
     */
    @GetMapping("/studies/{studyId}/sites/{siteId}/expired-certifications")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="getExpiredCertificationsFallback")
    ResponseEntity<List<String>> getExpiredCertifications(
            @PathVariable Long studyId,
            @PathVariable Long siteId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<List<String>> getExpiredCertificationsFallback(
            Long studyId, Long siteId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for getExpiredCertifications: studyId={}, siteId={}, exception={}", 
                studyId, siteId, exception.getMessage());
        return ResponseEntity.ok(List.of());
    }
    
    /**
     * Renew certification
     */
    @PostMapping("/certifications/{certificationId}/renew")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws", fallbackMethod="renewCertificationFallback")
    ResponseEntity<Void> renewCertification(
            @PathVariable String certificationId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> renewCertificationFallback(
            String certificationId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for renewCertification: certificationId={}, exception={}", 
                certificationId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
}