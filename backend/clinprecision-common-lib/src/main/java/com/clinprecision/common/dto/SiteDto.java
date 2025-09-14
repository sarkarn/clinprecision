package com.clinprecision.common.dto;



import lombok.Data;
import com.clinprecision.common.entity.SiteEntity;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for Site.
 */
@Data
public class SiteDto {
    private Long id;
    private String name;
    private String siteNumber;
    private OrganizationDto organization;
    private UserDto principalInvestigator;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String phone;
    private String email;
    private SiteEntity.SiteStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    
    
    // Constructor, getters, setters are handled by Lombok
}
