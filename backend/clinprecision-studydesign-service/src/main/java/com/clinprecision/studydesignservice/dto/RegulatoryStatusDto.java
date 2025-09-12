package com.clinprecision.studydesignservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * DTO for regulatory status lookup table
 * Used for API responses and frontend dropdowns
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RegulatoryStatusDto {
    
    private Long id;
    private String code;
    private String name;
    private String description;
    private Integer displayOrder;
    private Boolean isActive;
    private Boolean requiresDocumentation;
    private Boolean allowsEnrollment;
    private String regulatoryCategory;
    
    // Default constructor
    public RegulatoryStatusDto() {}
    
    // Constructor with commonly used fields
    public RegulatoryStatusDto(Long id, String code, String name, String description) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Integer getDisplayOrder() {
        return displayOrder;
    }
    
    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Boolean getRequiresDocumentation() {
        return requiresDocumentation;
    }
    
    public void setRequiresDocumentation(Boolean requiresDocumentation) {
        this.requiresDocumentation = requiresDocumentation;
    }
    
    public Boolean getAllowsEnrollment() {
        return allowsEnrollment;
    }
    
    public void setAllowsEnrollment(Boolean allowsEnrollment) {
        this.allowsEnrollment = allowsEnrollment;
    }
    
    public String getRegulatoryCategory() {
        return regulatoryCategory;
    }
    
    public void setRegulatoryCategory(String regulatoryCategory) {
        this.regulatoryCategory = regulatoryCategory;
    }
    
    @Override
    public String toString() {
        return "RegulatoryStatusDto{" +
                "id=" + id +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", regulatoryCategory='" + regulatoryCategory + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}