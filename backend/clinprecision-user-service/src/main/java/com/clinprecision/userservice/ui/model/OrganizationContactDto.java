package com.clinprecision.userservice.ui.model;

import com.clinprecision.userservice.data.OrganizationContactEntity;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for OrganizationContact.
 */
@Data
public class OrganizationContactDto {
    private Long id;
    private Long organizationId; // Reference to organization ID only to avoid circular references
    private String firstName;
    private String lastName;
    private String title;
    private String email;
    private String phone;
    private String mobile;
    private String position;
    private String department;
    private OrganizationContactEntity.ContactType contactType;
    private Boolean isPrimary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor, getters, setters are handled by Lombok
}
