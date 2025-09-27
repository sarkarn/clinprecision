package com.clinprecision.userservice.service;

import com.clinprecision.common.dto.UserStudyRoleDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Optional;

@FeignClient(name = "admin-ws", path = "/users/study", contextId = "userStudyRoleServiceClient")
public interface UserStudyRoleServiceClient {

    @GetMapping("/{userId}")
    @Retry(name="admin-ws-study-roles")
    @CircuitBreaker(name="admin-ws-study-roles", fallbackMethod="findHighestPriorityActiveRoleByUserIdFallback")
    ResponseEntity<Optional<UserStudyRoleDto>> findHighestPriorityActiveRoleByUserId(@PathVariable Long userId);

    /**
     * Fallback method when admin service is not available
     * Returns empty optional to indicate no role found
     */
    default ResponseEntity<Optional<UserStudyRoleDto>> findHighestPriorityActiveRoleByUserIdFallback(Long userId, Throwable exception) {
        System.out.println("UserStudyRoleServiceClient fallback triggered for userId: " + userId);
        System.out.println("Exception class: " + exception.getClass().getName());
        System.out.println("Exception message: " + exception.getMessage());
        
        // Return empty optional instead of Optional.of(null) which is an anti-pattern
        return ResponseEntity.ok().body(Optional.empty());
    }
}
