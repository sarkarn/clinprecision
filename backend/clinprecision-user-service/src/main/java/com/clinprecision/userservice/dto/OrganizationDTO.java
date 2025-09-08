package com.clinprecision.userservice.dto;

import com.clinprecision.userservice.data.OrganizationEntity;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for Organization entities.
 */
public class OrganizationDTO {
    
    private Long id;
    private String name;
    private Long organizationTypeId;
    private String organizationTypeName;
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
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int contactCount;
    private int userCount;
    private int siteCount;
    
    // Default constructor
    public OrganizationDTO() {
    }
    
    // Constructor from entity
    public OrganizationDTO(OrganizationEntity entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        if (entity.getOrganizationType() != null) {
            this.organizationTypeId = entity.getOrganizationType().getId();
            this.organizationTypeName = entity.getOrganizationType().getName();
        }
        this.externalId = entity.getExternalId();
        this.addressLine1 = entity.getAddressLine1();
        this.addressLine2 = entity.getAddressLine2();
        this.city = entity.getCity();
        this.state = entity.getState();
        this.postalCode = entity.getPostalCode();
        this.country = entity.getCountry();
        this.phone = entity.getPhone();
        this.email = entity.getEmail();
        this.website = entity.getWebsite();
        this.status = entity.getStatus() != null ? entity.getStatus().name() : null;
        this.createdAt = entity.getCreatedAt();
        this.updatedAt = entity.getUpdatedAt();
        this.contactCount = entity.getContacts() != null ? entity.getContacts().size() : 0;
        this.userCount = entity.getUsers() != null ? entity.getUsers().size() : 0;
        this.siteCount = entity.getSites() != null ? entity.getSites().size() : 0;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getOrganizationTypeId() {
        return organizationTypeId;
    }

    public void setOrganizationTypeId(Long organizationTypeId) {
        this.organizationTypeId = organizationTypeId;
    }

    public String getOrganizationTypeName() {
        return organizationTypeName;
    }

    public void setOrganizationTypeName(String organizationTypeName) {
        this.organizationTypeName = organizationTypeName;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public int getContactCount() {
        return contactCount;
    }

    public void setContactCount(int contactCount) {
        this.contactCount = contactCount;
    }

    public int getUserCount() {
        return userCount;
    }

    public void setUserCount(int userCount) {
        this.userCount = userCount;
    }

    public int getSiteCount() {
        return siteCount;
    }

    public void setSiteCount(int siteCount) {
        this.siteCount = siteCount;
    }
}
