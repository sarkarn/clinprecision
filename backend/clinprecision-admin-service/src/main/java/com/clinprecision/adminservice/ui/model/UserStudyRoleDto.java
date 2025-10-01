package com.clinprecision.adminservice.ui.model;


import com.clinprecision.common.entity.UserStudyRoleEntity;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for UserStudyRole.
 */
@Data
public class UserStudyRoleDto {
    private Long id;
    private Long userId; // Reference to user ID only to avoid circular references
    private Long studyId;
    private String roleCode;
    private String roleName;
    private String description;
    private UserStudyRoleEntity.RoleStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor, getters, setters are handled by Lombok
}
