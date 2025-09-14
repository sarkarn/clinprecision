package com.clinprecision.common.dto;


import com.clinprecision.common.entity.OrganizationEntity;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Organization.
 */
@Data
public class OrganizationDto {
    private Long id;
    private String name;
    private String externalId;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String phone;
    private String email;
    private String website;
    private OrganizationEntity.OrganizationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor, getters, setters are handled by Lombok
}
