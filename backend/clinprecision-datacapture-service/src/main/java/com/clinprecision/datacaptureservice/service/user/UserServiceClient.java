package com.clinprecision.datacaptureservice.service.user;

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
 * User Management Service Client
 * 
 * Feign client for accessing users-ws microservice endpoints.
 * Handles user management, role assignments, and permissions.
 * 
 * Domain: Identity & Access Management
 */
@FeignClient(name = "users-ws", path = "/api/v1/users")
public interface UserServiceClient {
    
    Logger log = LoggerFactory.getLogger(UserServiceClient.class);
    
    /**
     * Assign roles to user for specific study
     */
    @PostMapping("/{userId}/studies/{studyId}/roles")
    @Retry(name="users-ws")
    @CircuitBreaker(name="users-ws", fallbackMethod="assignUserRolesFallback")
    ResponseEntity<Void> assignUserRoles(
            @PathVariable Long userId,
            @PathVariable Long studyId,
            @RequestBody List<String> roles,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> assignUserRolesFallback(
            Long userId, Long studyId, List<String> roles, String authorization, Throwable exception) {
        log.warn("Fallback triggered for assignUserRoles: userId={}, studyId={}, exception={}", 
                userId, studyId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Get user permissions for specific study
     */
    @GetMapping("/{userId}/studies/{studyId}/permissions")
    @Retry(name="users-ws")
    @CircuitBreaker(name="users-ws", fallbackMethod="getUserPermissionsFallback")
    ResponseEntity<List<String>> getUserPermissions(
            @PathVariable Long userId,
            @PathVariable Long studyId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<List<String>> getUserPermissionsFallback(
            Long userId, Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for getUserPermissions: userId={}, studyId={}, exception={}", 
                userId, studyId, exception.getMessage());
        return ResponseEntity.ok(List.of());
    }
    
    /**
     * Validate user access to study
     */
    @GetMapping("/{userId}/studies/{studyId}/validate-access")
    @Retry(name="users-ws")
    @CircuitBreaker(name="users-ws", fallbackMethod="validateUserAccessFallback")
    ResponseEntity<Boolean> validateUserAccess(
            @PathVariable Long userId,
            @PathVariable Long studyId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Boolean> validateUserAccessFallback(
            Long userId, Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for validateUserAccess: userId={}, studyId={}, exception={}", 
                userId, studyId, exception.getMessage());
        return ResponseEntity.ok(false);
    }
    
    /**
     * Get user details
     */
    @GetMapping("/{userId}")
    @Retry(name="users-ws")
    @CircuitBreaker(name="users-ws", fallbackMethod="getUserDetailsFallback")
    ResponseEntity<Map<String, Object>> getUserDetails(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Map<String, Object>> getUserDetailsFallback(
            Long userId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for getUserDetails: userId={}, exception={}", 
                userId, exception.getMessage());
        return ResponseEntity.ok(Map.of("id", userId, "status", "UNKNOWN"));
    }
    
    /**
     * Get users associated with a study
     */
    @GetMapping("/studies/{studyId}")
    @Retry(name="users-ws")
    @CircuitBreaker(name="users-ws", fallbackMethod="getStudyUsersFallback")
    ResponseEntity<List<Map<String, Object>>> getStudyUsers(
            @PathVariable Long studyId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<List<Map<String, Object>>> getStudyUsersFallback(
            Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for getStudyUsers: studyId={}, exception={}", 
                studyId, exception.getMessage());
        return ResponseEntity.ok(List.of());
    }
    
    /**
     * Update user roles for specific study
     */
    @PutMapping("/{userId}/studies/{studyId}/roles")
    @Retry(name="users-ws")
    @CircuitBreaker(name="users-ws", fallbackMethod="updateUserRolesFallback")
    ResponseEntity<Void> updateUserRoles(
            @PathVariable Long userId,
            @PathVariable Long studyId,
            @RequestBody List<String> roles,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> updateUserRolesFallback(
            Long userId, Long studyId, List<String> roles, String authorization, Throwable exception) {
        log.warn("Fallback triggered for updateUserRoles: userId={}, studyId={}, exception={}", 
                userId, studyId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Revoke study access for user
     */
    @DeleteMapping("/{userId}/studies/{studyId}/access")
    @Retry(name="users-ws")
    @CircuitBreaker(name="users-ws", fallbackMethod="revokeStudyAccessFallback")
    ResponseEntity<Void> revokeStudyAccess(
            @PathVariable Long userId,
            @PathVariable Long studyId,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> revokeStudyAccessFallback(
            Long userId, Long studyId, String authorization, Throwable exception) {
        log.warn("Fallback triggered for revokeStudyAccess: userId={}, studyId={}, exception={}", 
                userId, studyId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Assign roles to user (general method)
     */
    @PostMapping("/{userId}/roles")
    @Retry(name="users-ws")
    @CircuitBreaker(name="users-ws", fallbackMethod="assignRolesFallback")
    ResponseEntity<Void> assignRoles(
            @PathVariable Long userId,
            @PathVariable Long studyId,
            @RequestBody List<String> roles,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> assignRolesFallback(
            Long userId, Long studyId, List<String> roles, String authorization, Throwable exception) {
        log.warn("Fallback triggered for assignRoles: userId={}, studyId={}, exception={}", 
                userId, studyId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
    
    /**
     * Setup site permissions for user
     */
    @PostMapping("/{userId}/studies/{studyId}/site-permissions")
    @Retry(name="users-ws")
    @CircuitBreaker(name="users-ws", fallbackMethod="setupSitePermissionsFallback")
    ResponseEntity<Void> setupSitePermissions(
            @PathVariable Long userId,
            @PathVariable Long studyId,
            @RequestBody List<String> permissions,
            @RequestHeader("Authorization") String authorization
    );
    
    default ResponseEntity<Void> setupSitePermissionsFallback(
            Long userId, Long studyId, List<String> permissions, String authorization, Throwable exception) {
        log.warn("Fallback triggered for setupSitePermissions: userId={}, studyId={}, exception={}", 
                userId, studyId, exception.getMessage());
        return ResponseEntity.accepted().build();
    }
}