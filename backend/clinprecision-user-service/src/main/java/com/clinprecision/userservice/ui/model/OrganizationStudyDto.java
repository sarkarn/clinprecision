package com.clinprecision.userservice.ui.model;

import com.clinprecision.userservice.data.OrganizationStudyEntity;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for OrganizationStudy.
 */
@Data
public class OrganizationStudyDto {
    private Long id;
    private Long organizationId; // Reference to organization ID only to avoid circular references
    private String studyId;
    private String roleCode;
    private String roleName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private OrganizationStudyEntity.OrganizationStudyStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor, getters, setters are handled by Lombok
}
