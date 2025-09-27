package com.clinprecision.userservice.client;

import com.clinprecision.common.dto.AuthUserDto;
import com.clinprecision.common.dto.UserDto;
import com.clinprecision.common.dto.UserStudyRoleDto;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Fallback implementation for AdminUsersServiceClient
 * Provides graceful degradation when Admin Service is unavailable
 */
@Component
public class AdminUsersServiceClientFallback implements AdminUsersServiceClient {

    @Override
    public ResponseEntity<UserDto> getUserDetailsByEmail(String email) {
        System.err.println("AdminUsersServiceClient fallback: getUserDetailsByEmail for email: " + email);
        
        // Return a minimal user DTO to prevent complete failure
        UserDto fallbackUser = new UserDto();
        fallbackUser.setEmail(email);
        fallbackUser.setFirstName("Unknown");
        fallbackUser.setLastName("User");
        
        return ResponseEntity.ok(fallbackUser);
    }

    @Override
    public ResponseEntity<String> getUserRole(Long userId) {
        System.err.println("AdminUsersServiceClient fallback: getUserRole for userId: " + userId);
        
        // Return default role when service is unavailable
        return ResponseEntity.ok("SITE_USER");
    }

    @Override
    public ResponseEntity<AuthUserDto> loadUserByUsername(String email) {
        System.err.println("AdminUsersServiceClient fallback: loadUserByUsername for email: " + email);
        
        // This will cause authentication to fail gracefully
        return ResponseEntity.notFound().build();
    }

    @Override
    public ResponseEntity<Optional<UserStudyRoleDto>> findHighestPriorityActiveRoleByUserId(Long userId) {
        System.err.println("AdminUsersServiceClient fallback: findHighestPriorityActiveRoleByUserId for userId: " + userId);
        
        // Return empty optional when service is unavailable
        return ResponseEntity.ok().body(Optional.empty());
    }
}