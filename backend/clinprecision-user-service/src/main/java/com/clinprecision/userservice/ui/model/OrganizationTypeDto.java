package com.clinprecision.userservice.ui.model;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for OrganizationType.
 */
@Data
public class OrganizationTypeDto {
    private Long id;
    private String name;
    private String description;
    private String code;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor, getters, setters are handled by Lombok
}
