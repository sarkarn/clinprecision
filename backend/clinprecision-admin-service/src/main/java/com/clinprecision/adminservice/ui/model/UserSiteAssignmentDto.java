package com.clinprecision.adminservice.ui.model;

import com.clinprecision.common.entity.UserSiteAssignmentEntity;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for UserSiteAssignment.
 */
@Data
public class UserSiteAssignmentDto {
    private Long id;
    private Long userId; // Reference to user ID only to avoid circular references
    private Long siteId; // Reference to site ID only to avoid circular references
    private String roleCode;
    private String roleName;
    private String studyId;
    private UserSiteAssignmentEntity.AssignmentStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor, getters, setters are handled by Lombok
}
