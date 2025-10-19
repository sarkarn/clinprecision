package com.clinprecision.clinopsservice.common.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.UUID;

/**
 * Security Service for extracting user information
 * 
 * Supports multiple authentication methods:
 * 1. Spring Security Context (if JWT/OAuth configured)
 * 2. HTTP Headers from API Gateway (X-User-Id, X-User-Name)
 * 3. Fallback to "system" user for development
 */
@Service
@Slf4j
public class SecurityService {
    
    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_USER_NAME = "X-User-Name";
    private static final String HEADER_USER_EMAIL = "X-User-Email";
    
    /**
     * Get current user ID
     * Priority: Security Context > HTTP Header > Fallback
     */
    public UUID getCurrentUserId() {
        // 1. Try to get from Spring Security Context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !"anonymousUser".equals(authentication.getPrincipal())) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof String) {
                try {
                    return UUID.fromString((String) principal);
                } catch (IllegalArgumentException e) {
                    log.debug("Principal is not a UUID: {}", principal);
                }
            }
        }
        
        // 2. Try to get from HTTP headers (API Gateway passes user info)
        HttpServletRequest request = getCurrentRequest();
        if (request != null) {
            String userIdHeader = request.getHeader(HEADER_USER_ID);
            if (userIdHeader != null && !userIdHeader.isEmpty()) {
                try {
                    return UUID.fromString(userIdHeader);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid UUID in {} header: {}", HEADER_USER_ID, userIdHeader);
                }
            }
        }
        
        // 3. Fallback for development (generate consistent UUID for "system")
        log.debug("No authenticated user found, using system user");
        return UUID.fromString("00000000-0000-0000-0000-000000000000");
    }
    
    /**
     * Get current username
     * Priority: Security Context > HTTP Header > Fallback
     */
    public String getCurrentUserName() {
        // 1. Try to get from Spring Security Context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String name = authentication.getName();
            if (name != null && !name.equals("anonymousUser")) {
                return name;
            }
        }
        
        // 2. Try to get from HTTP headers
        HttpServletRequest request = getCurrentRequest();
        if (request != null) {
            String userNameHeader = request.getHeader(HEADER_USER_NAME);
            if (userNameHeader != null && !userNameHeader.isEmpty()) {
                return userNameHeader;
            }
            
            // Also check email header as fallback
            String userEmailHeader = request.getHeader(HEADER_USER_EMAIL);
            if (userEmailHeader != null && !userEmailHeader.isEmpty()) {
                return userEmailHeader;
            }
        }
        
        // 3. Fallback for development
        return "system";
    }
    
    /**
     * Get current HTTP request from Spring context
     */
    private HttpServletRequest getCurrentRequest() {
        try {
            ServletRequestAttributes attributes = 
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            log.debug("Could not get current HTTP request: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Check if there is an authenticated user (not system/anonymous)
     */
    public boolean hasAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && 
               authentication.isAuthenticated() && 
               !"anonymousUser".equals(authentication.getPrincipal());
    }
}
