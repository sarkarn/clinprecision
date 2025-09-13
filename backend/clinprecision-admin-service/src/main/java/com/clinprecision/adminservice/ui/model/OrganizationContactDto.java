package com.clinprecision.adminservice.ui.model;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for OrganizationContact.
 */
@Data
public class OrganizationContactDto {
    private Long id;
    private Long organizationId;
    private String contactName;
    private String title;
    private String department;
    private String email;
    private String phone;
    private Boolean isPrimary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor, getters, setters are handled by Lombok
}
