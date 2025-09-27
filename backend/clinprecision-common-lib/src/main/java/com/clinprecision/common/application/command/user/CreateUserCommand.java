package com.clinprecision.common.application.command.user;

import com.clinprecision.common.application.command.BaseCommand;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

/**
 * Command for creating a new user
 * Follows Command Pattern and CQRS principles
 */
@Getter
@Builder
@ToString
public class CreateUserCommand extends BaseCommand {
    
    @NotBlank(message = "First name is required")
    private final String firstName;
    
    private final String middleName; // Optional
    
    @NotBlank(message = "Last name is required")
    private final String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private final String email;
    
    private final String title; // Optional
    private final String profession; // Optional
    private final String phone; // Optional
    private final String mobilePhone; // Optional
    
    // Address fields
    private final String addressLine1;
    private final String addressLine2;
    private final String city;
    private final String state;
    private final String postalCode;
    private final String country;
    
    @NotNull(message = "Organization ID is required")
    private final Long organizationId;
    
    @NotNull(message = "Created by user ID is required")
    private final Long createdBy;
    
    private final String notes; // Optional
    
    // User type and role assignments
    private final java.util.Set<Long> userTypeIds;
    private final java.util.Set<Long> roleIds;
    
    /**
     * Validation method - business rules specific to user creation
     */
    @Override
    public void validate() {
        super.validate();
        
        // Additional business validation
        if (email != null && email.trim().length() < 5) {
            throw new IllegalArgumentException("Email must be at least 5 characters long");
        }
        
        if (firstName != null && firstName.trim().length() < 2) {
            throw new IllegalArgumentException("First name must be at least 2 characters long");
        }
        
        if (lastName != null && lastName.trim().length() < 2) {
            throw new IllegalArgumentException("Last name must be at least 2 characters long");
        }
        
        // Phone validation if provided
        if (phone != null && !phone.trim().isEmpty() && phone.length() < 10) {
            throw new IllegalArgumentException("Phone number must be at least 10 characters long");
        }
    }
    
    /**
     * Business logic: Get full name
     */
    public String getFullName() {
        StringBuilder fullName = new StringBuilder(firstName);
        if (middleName != null && !middleName.trim().isEmpty()) {
            fullName.append(" ").append(middleName);
        }
        fullName.append(" ").append(lastName);
        return fullName.toString();
    }
    
    /**
     * Business logic: Check if address is provided
     */
    public boolean hasAddress() {
        return addressLine1 != null && !addressLine1.trim().isEmpty() &&
               city != null && !city.trim().isEmpty() &&
               country != null && !country.trim().isEmpty();
    }
    
    /**
     * Business logic: Check if contact information is complete
     */
    public boolean hasCompleteContactInfo() {
        return (phone != null && !phone.trim().isEmpty()) ||
               (mobilePhone != null && !mobilePhone.trim().isEmpty());
    }
}