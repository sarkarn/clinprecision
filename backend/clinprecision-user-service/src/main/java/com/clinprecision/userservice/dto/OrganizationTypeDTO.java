package com.clinprecision.userservice.dto;

import com.clinprecision.userservice.data.OrganizationTypeEntity;

/**
 * Data Transfer Object for OrganizationType entities.
 */
public class OrganizationTypeDTO {
    
    private Long id;
    private String name;
    private String code;
    private String description;
    private int organizationCount;
    
    // Default constructor
    public OrganizationTypeDTO() {
    }
    
    // Constructor from entity
    public OrganizationTypeDTO(OrganizationTypeEntity entity) {
        this.id = entity.getId();
        this.name = entity.getName();
        this.code = entity.getCode();
        this.description = entity.getDescription();
        this.organizationCount = entity.getOrganizations() != null ? entity.getOrganizations().size() : 0;
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

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getOrganizationCount() {
        return organizationCount;
    }

    public void setOrganizationCount(int organizationCount) {
        this.organizationCount = organizationCount;
    }
}
