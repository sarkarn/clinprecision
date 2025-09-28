package com.clinprecision.adminservice.ui.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for creating a new clinical trial site
 * Used in CQRS command processing
 */
public class CreateSiteDto {
    
    @NotBlank(message = "Site name is required")
    private String name;
    
    @NotBlank(message = "Site number is required")
    private String siteNumber;
    
    @NotNull(message = "Organization ID is required")
    private Long organizationId;
    
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String phone;
    private String email;
    
    @NotBlank(message = "Reason for site creation is required for audit")
    private String reason;

    // Constructors
    public CreateSiteDto() {}

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSiteNumber() { return siteNumber; }
    public void setSiteNumber(String siteNumber) { this.siteNumber = siteNumber; }

    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }

    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }

    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getPostalCode() { return postalCode; }
    public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}