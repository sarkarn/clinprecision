package com.clinprecision.common.dto.clinops;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Map;

/**
 * DTO for creating new code list entries
 */
public class CreateCodeListRequest {
    
    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;
    
    @NotBlank(message = "Code is required")
    @Size(max = 100, message = "Code must not exceed 100 characters")
    private String code;
    
    @NotBlank(message = "Display name is required")
    @Size(max = 200, message = "Display name must not exceed 200 characters")
    private String displayName;
    
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    private Integer sortOrder;
    
    private Boolean isActive = true;
    
    private Boolean systemCode = false;
    
    private Long parentCodeId;
    
    private Map<String, Object> metadata;
    
    private LocalDate validFrom;
    
    private LocalDate validTo;
    
    @NotNull(message = "Created by user ID is required")
    private Long createdBy;
    
    // Default constructor
    public CreateCodeListRequest() {}
    
    // Constructor with required fields
    public CreateCodeListRequest(String category, String code, String displayName, Long createdBy) {
        this.category = category;
        this.code = code;
        this.displayName = displayName;
        this.createdBy = createdBy;
    }
    
    // Getters and Setters
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Integer getSortOrder() {
        return sortOrder;
    }
    
    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public Boolean getSystemCode() {
        return systemCode;
    }
    
    public void setSystemCode(Boolean systemCode) {
        this.systemCode = systemCode;
    }
    
    public Long getParentCodeId() {
        return parentCodeId;
    }
    
    public void setParentCodeId(Long parentCodeId) {
        this.parentCodeId = parentCodeId;
    }
    
    public Map<String, Object> getMetadata() {
        return metadata;
    }
    
    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }
    
    public LocalDate getValidFrom() {
        return validFrom;
    }
    
    public void setValidFrom(LocalDate validFrom) {
        this.validFrom = validFrom;
    }
    
    public LocalDate getValidTo() {
        return validTo;
    }
    
    public void setValidTo(LocalDate validTo) {
        this.validTo = validTo;
    }
    
    public Long getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
}