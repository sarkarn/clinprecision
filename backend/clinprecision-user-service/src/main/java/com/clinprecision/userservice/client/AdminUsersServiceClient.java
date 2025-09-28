package com.clinprecision.userservice.client;

import com.clinprecision.common.dto.AuthUserDto;
import com.clinprecision.common.dto.UserDto;
import com.clinprecision.common.dto.UserStudyRoleDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Optional;

/**
 * Feign client for accessing Admin Service user management functionality
 */
@FeignClient(name = "admin-ws", fallback = AdminUsersServiceClientFallback.class)
public interface AdminUsersServiceClient {

    /**
     * Get user details by email from Admin Service
     */
    @GetMapping("/users/by-email/{email}")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws")
    ResponseEntity<UserDto> getUserDetailsByEmail(@PathVariable String email);

    /**
     * Get user role by user ID from Admin Service
     */
    @GetMapping("/users/{userId}/role")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws")
    ResponseEntity<String> getUserRole(@PathVariable Long userId);

    /**
     * Get user details for Spring Security authentication
     * This method will be used for loadUserByUsername
     */
    @GetMapping("/users/auth/{email}")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws")
    ResponseEntity<AuthUserDto> loadUserByUsername(@PathVariable String email);

    /**
     * Get highest priority active user study role
     * Uses the existing UserStudyRoleController endpoint
     */
    @GetMapping("/api/user-study-roles/users/{userId}/highest-priority")
    @Retry(name="admin-ws")
    @CircuitBreaker(name="admin-ws")
    ResponseEntity<Optional<UserStudyRoleDto>> findHighestPriorityActiveRoleByUserId(@PathVariable Long userId);
}