package com.clinprecision.userservice.dto;

import com.clinprecision.userservice.data.OrganizationContactEntity;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for OrganizationContact entities.
 */
public class OrganizationContactDTO {
    
    private Long id;
    private Long organizationId;
    private String firstName;
    private String lastName;
    private String title;
    private String email;
    private String phone;
    private String mobile;
    private String position;
    private String department;
    private String contactType;
    private Boolean isPrimary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Default constructor
    public OrganizationContactDTO() {
    }
    
    // Constructor from entity
    public OrganizationContactDTO(OrganizationContactEntity entity) {
        this.id = entity.getId();
        if (entity.getOrganization() != null) {
            this.organizationId = entity.getOrganization().getId();
        }
        this.firstName = entity.getFirstName();
        this.lastName = entity.getLastName();
        this.title = entity.getTitle();
        this.email = entity.getEmail();
        this.phone = entity.getPhone();
        this.mobile = entity.getMobile();
        this.position = entity.getPosition();
        this.department = entity.getDepartment();
        this.contactType = entity.getContactType() != null ? entity.getContactType().name() : null;
        this.isPrimary = entity.getIsPrimary();
        this.createdAt = entity.getCreatedAt();
        this.updatedAt = entity.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getContactType() {
        return contactType;
    }

    public void setContactType(String contactType) {
        this.contactType = contactType;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
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
}
