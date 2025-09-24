package com.clinprecision.datacaptureservice.security;

import org.springframework.stereotype.Component;

/**
 * Security Context Provider
 * 
 * Provides security context and authentication tokens for service calls.
 * In a production environment, this would integrate with proper security framework.
 */
@Component
public class SecurityContextProvider {
    
    private static final String SYSTEM_TOKEN = "Bearer system-workflow-token";
    
    /**
     * Get system authorization token for internal service calls
     * 
     * @return Authorization token
     */
    public String getSystemAuthToken() {
        return SYSTEM_TOKEN;
    }
    
    /**
     * Get user authorization token (placeholder for future implementation)
     * 
     * @return Authorization token
     */
    public String getUserAuthToken() {
        // In production, this would get the actual user token from security context
        return SYSTEM_TOKEN;
    }
}