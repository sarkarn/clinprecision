package com.clinprecision.siteservice.ui.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for assigning a user to a clinical trial site
 */
public class AssignUserToSiteDto {
    
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotNull(message = "Role ID is required")
    private Long roleId;
    
    @NotBlank(message = "Reason for assignment is required for audit compliance")
    private String reason;

    // Constructors
    public AssignUserToSiteDto() {}

    public AssignUserToSiteDto(Long userId, Long roleId, String reason) {
        this.userId = userId;
        this.roleId = roleId;
        this.reason = reason;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
