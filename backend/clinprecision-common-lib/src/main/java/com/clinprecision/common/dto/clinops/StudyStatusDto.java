package com.clinprecision.common.dto.clinops;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * DTO for study status lookup table
 * Used for API responses and frontend dropdowns
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudyStatusDto {
    
    private Long id;
    private String code;
    private String name;
    private String description;
    private Integer displayOrder;
    private Boolean isActive;
    private Boolean allowsModification;
    private Boolean isFinalStatus;
    
    // Default constructor
    public StudyStatusDto() {}
    
    // Constructor with commonly used fields
    public StudyStatusDto(Long id, String code, String name, String description) {
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
    
    public Boolean getAllowsModification() {
        return allowsModification;
    }
    
    public void setAllowsModification(Boolean allowsModification) {
        this.allowsModification = allowsModification;
    }
    
    public Boolean getIsFinalStatus() {
        return isFinalStatus;
    }
    
    public void setIsFinalStatus(Boolean isFinalStatus) {
        this.isFinalStatus = isFinalStatus;
    }
    
    @Override
    public String toString() {
        return "StudyStatusDto{" +
                "id=" + id +
                ", code='" + code + '\'' +
                ", name='" + name + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}