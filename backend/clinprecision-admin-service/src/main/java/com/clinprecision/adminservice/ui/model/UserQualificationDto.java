package com.clinprecision.adminservice.ui.model;

import com.clinprecision.common.entity.UserQualificationEntity;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for UserQualification.
 */
@Data
public class UserQualificationDto {
    private Long id;
    private Long userId; // Reference to user ID only to avoid circular references
    private String qualificationType;
    private String qualificationName;
    private String issuingOrganization;
    private String identifier;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String documentUrl;
    private UserQualificationEntity.VerificationStatus verificationStatus;
    private String verifiedBy;
    private LocalDateTime verificationDate;
    private String verificationNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor, getters, setters are handled by Lombok
}
