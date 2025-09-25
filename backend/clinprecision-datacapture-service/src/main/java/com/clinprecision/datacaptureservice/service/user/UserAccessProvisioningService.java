package com.clinprecision.datacaptureservice.service.user;

import com.clinprecision.common.dto.UserAccessRequest;
import com.clinprecision.common.dto.UserAccessResult;
import com.clinprecision.datacaptureservice.service.ConfigurationServiceClient;
import com.clinprecision.datacaptureservice.service.user.UserServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * User Access Provisioning Service
 * 
 * Handles user role assignment and access provisioning for clinical studies.
 * Part of Phase 1.1: Study Database Build workflow.
 * 
 * Key responsibilities:
 * - User role assignment based on study requirements
 * - Site-specific access provisioning
 * - Permission validation and enforcement
 * - Access audit trail maintenance
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserAccessProvisioningService {
    
    private final ConfigurationServiceClient configurationService;
    private final UserServiceClient userService;
    
    /**
     * Provision user access for a study
     * 
     * @param request User access provisioning request
     * @param authorization Authorization header for service calls
     * @return UserAccessResult with provisioning status
     */
    @Transactional
    public UserAccessResult provisionUserAccess(UserAccessRequest request, String authorization) {
        log.info("Starting user access provisioning for study: {}", request.getStudyId());
        
        try {
            // Phase 1: Validate study configuration
            validateStudyConfiguration(request.getStudyId(), authorization);
            
            // Phase 2: Get user role mappings from configuration service
            var roleConfiguration = configurationService.getStudyRoleConfiguration(request.getStudyId(), authorization);
            
            // Phase 3: Create user accounts and assign roles
            assignUserRoles(request, roleConfiguration, authorization);
            
            // Phase 4: Setup site-specific permissions
            setupSitePermissions(request, authorization);
            
            // Phase 5: Validate access setup
            validateAccessSetup(request, authorization);
            
            log.info("User access provisioning completed for study: {}", request.getStudyId());
            
            return UserAccessResult.builder()
                    .studyId(request.getStudyId())
                    .provisioningStatus("COMPLETED")
                    .provisioningTime(LocalDateTime.now())
                    .message("User access provisioned successfully")
                    .usersProvisioned(request.getUserRoleAssignments().size())
                    .build();
                    
        } catch (Exception e) {
            log.error("User access provisioning failed for study {}: {}", request.getStudyId(), e.getMessage(), e);
            
            return UserAccessResult.builder()
                    .studyId(request.getStudyId())
                    .provisioningStatus("FAILED")
                    .provisioningTime(LocalDateTime.now())
                    .message("User access provisioning failed: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Update user access permissions
     * 
     * @param studyId Study identifier
     * @param userId User identifier
     * @param newRoles New roles to assign
     * @param authorization Authorization header for service calls
     * @return UserAccessResult with update status
     */
    @Transactional
    public UserAccessResult updateUserAccess(Long studyId, Long userId, List<String> newRoles, String authorization) {
        log.info("Updating user access for user {} in study {}", userId, studyId);
        
        try {
            // Update user roles through user service
            userService.updateUserRoles(userId, studyId, newRoles, authorization);
            
            // Log access change for audit trail
            logAccessChange(studyId, userId, newRoles);
            
            return UserAccessResult.builder()
                    .studyId(studyId)
                    .provisioningStatus("UPDATED")
                    .provisioningTime(LocalDateTime.now())
                    .message("User access updated successfully")
                    .build();
                    
        } catch (Exception e) {
            log.error("User access update failed for user {} in study {}: {}", userId, studyId, e.getMessage(), e);
            
            return UserAccessResult.builder()
                    .studyId(studyId)
                    .provisioningStatus("FAILED")
                    .provisioningTime(LocalDateTime.now())
                    .message("User access update failed: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Revoke user access for a study
     * 
     * @param studyId Study identifier
     * @param userId User identifier
     * @param authorization Authorization header for service calls
     * @return UserAccessResult with revocation status
     */
    @Transactional
    public UserAccessResult revokeUserAccess(Long studyId, Long userId, String authorization) {
        log.info("Revoking user access for user {} in study {}", userId, studyId);
        
        try {
            // Revoke all study-specific roles
            userService.revokeStudyAccess(userId, studyId, authorization);
            
            // Log access revocation
            logAccessRevocation(studyId, userId);
            
            return UserAccessResult.builder()
                    .studyId(studyId)
                    .provisioningStatus("REVOKED")
                    .provisioningTime(LocalDateTime.now())
                    .message("User access revoked successfully")
                    .build();
                    
        } catch (Exception e) {
            log.error("User access revocation failed for user {} in study {}: {}", userId, studyId, e.getMessage(), e);
            
            return UserAccessResult.builder()
                    .studyId(studyId)
                    .provisioningStatus("FAILED")
                    .provisioningTime(LocalDateTime.now())
                    .message("User access revocation failed: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Validate user access setup for a study
     * 
     * @param studyId Study identifier
     * @param authorization Authorization header for service calls
     * @return Validation result
     */
    public boolean validateStudyUserAccess(Long studyId, String authorization) {
        log.info("Validating user access setup for study: {}", studyId);
        
        try {
            // Check if required roles are assigned
            var requiredRolesResponse = configurationService.getRequiredRoles(studyId, authorization);
            var assignedUsersResponse = userService.getStudyUsers(studyId, authorization);
            
            // Extract actual data from ResponseEntity
            @SuppressWarnings("unchecked")
            List<String> requiredRoles = (List<String>) requiredRolesResponse.getBody();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> assignedUsers = (List<Map<String, Object>>) assignedUsersResponse.getBody();
            
            // Validate that each required role has at least one user assigned
            if (requiredRoles != null && assignedUsers != null) {
                for (String role : requiredRoles) {
                    boolean roleAssigned = assignedUsers.stream()
                            .anyMatch(user -> {
                                @SuppressWarnings("unchecked")
                                List<String> userRoles = (List<String>) user.get("roles");
                                return userRoles != null && userRoles.contains(role);
                            });
                    
                    if (!roleAssigned) {
                        log.warn("Required role '{}' not assigned to any user in study {}", role, studyId);
                        return false;
                    }
                }
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("User access validation failed for study {}: {}", studyId, e.getMessage(), e);
            return false;
        }
    }
    
    // Private helper methods
    private void validateStudyConfiguration(Long studyId, String authorization) {
        // Validate that study exists and is properly configured
        var response = configurationService.isStudyConfigured(studyId, authorization);
        Boolean isConfigured = response.getBody();
        if (isConfigured == null || !isConfigured) {
            throw new IllegalStateException("Study " + studyId + " is not properly configured");
        }
    }
    
    private void assignUserRoles(UserAccessRequest request, Object roleConfiguration, String authorization) {
        // Assign roles to users based on configuration
        for (var assignment : request.getUserRoleAssignments()) {
            userService.assignRoles(assignment.getUserId(), request.getStudyId(), assignment.getRoles(), authorization);
            log.info("Assigned roles {} to user {} for study {}", 
                    assignment.getRoles(), assignment.getUserId(), request.getStudyId());
        }
    }
    
    private void setupSitePermissions(UserAccessRequest request, String authorization) {
        // Setup site-specific permissions
        for (var sitePermission : request.getSitePermissions()) {
            userService.setupSitePermissions(sitePermission.getSiteId(), 
                    sitePermission.getUserId(), sitePermission.getPermissions(), authorization);
        }
    }
    
    private void validateAccessSetup(UserAccessRequest request, String authorization) {
        // Validate that all required access has been properly setup
        if (!validateStudyUserAccess(request.getStudyId(), authorization)) {
            throw new IllegalStateException("User access validation failed for study " + request.getStudyId());
        }
    }
    
    private void logAccessChange(Long studyId, Long userId, List<String> newRoles) {
        // Log access changes for audit trail
        log.info("Access change logged: Study={}, User={}, NewRoles={}", studyId, userId, newRoles);
    }
    
    private void logAccessRevocation(Long studyId, Long userId) {
        // Log access revocation for audit trail
        log.info("Access revocation logged: Study={}, User={}", studyId, userId);
    }
}