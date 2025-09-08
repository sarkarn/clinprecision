package com.clinprecision.userservice.ui.model;

import com.clinprecision.userservice.data.UserTypeEntity;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for UserType.
 */
@Data
public class UserTypeDto {
    private Long id;
    private String name;
    private String description;
    private String code;
    private UserTypeEntity.UserCategory category;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor, getters, setters are handled by Lombok
}
