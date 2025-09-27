package com.clinprecision.common.dto;

import com.clinprecision.common.entity.UserStudyRoleEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for UserStudyRole.
 * Used for transferring user study role data between microservices.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStudyRoleDto {
    
    private Long id;
    private Long userId; // Reference to user ID only to avoid circular references
    private Long studyId; // Foreign key to study table
    private String roleCode;
    private String roleName;
    private String description;
    private UserStudyRoleEntity.RoleStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional fields that might be needed for business logic
    private Integer rolePriority;
    private String studyName;
    private String studyCode;
    
    /**
     * Creates a simplified DTO for cases where only basic role info is needed
     */
    public static UserStudyRoleDto createBasic(Long userId, String roleCode, String roleName) {
        return UserStudyRoleDto.builder()
                .userId(userId)
                .roleCode(roleCode)
                .roleName(roleName)
                .status(UserStudyRoleEntity.RoleStatus.ACTIVE)
                .build();
    }
    
    /**
     * Checks if this role is currently active
     */
    public boolean isActive() {
        return UserStudyRoleEntity.RoleStatus.ACTIVE.equals(status);
    }
    
    /**
     * Checks if this role is within the active date range
     */
    public boolean isWithinDateRange() {
        LocalDateTime now = LocalDateTime.now();
        boolean afterStart = startDate == null || now.isAfter(startDate);
        boolean beforeEnd = endDate == null || now.isBefore(endDate);
        return afterStart && beforeEnd;
    }
    
    /**
     * Gets the full role display name including study context if available
     */
    public String getFullRoleDisplayName() {
        if (studyName != null && !studyName.trim().isEmpty()) {
            return roleName + " (" + studyName + ")";
        }
        return roleName;
    }
}