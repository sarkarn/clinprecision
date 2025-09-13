package com.clinprecision.common.dto;


import lombok.Data;
import com.clinprecision.common.entity.UserEntity;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Data Transfer Object for User.
 */
@Data
public class UserDto {
    private Long id;
    private String userId;
    private String firstName;
    private String middleName;
    private String lastName;
    private String email;
    private String title;
    private OrganizationDto organization;
    private Long organizationId; // For assignment
    private String profession;
    private String phone;
    private String mobilePhone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private UserEntity.UserStatus status;
    private LocalDateTime lastLoginAt;
    private boolean passwordResetRequired;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<UserTypeDto> userTypes = new HashSet<>();
    private Set<Long> roleIds = new HashSet<>(); // For role assignment
    private String password;
    private String encryptedPassword;

    public UserDto() {
        this.userTypes = new HashSet<>();
        this.roleIds = new HashSet<>();
    }

    // Other constructors, if needed

    // Clear and add pattern for userTypes to avoid issues with modifying collections
    public void setUserTypes(Set<UserTypeDto> userTypes) {
        this.userTypes = new HashSet<>();
        if (userTypes != null) {
            this.userTypes.addAll(userTypes);
        }
    }

    public void setRoleIds(Set<Long> roleIds) {
        this.roleIds = new HashSet<>();
        if (roleIds != null) {
            this.roleIds.addAll(roleIds);
        }
    }
}
