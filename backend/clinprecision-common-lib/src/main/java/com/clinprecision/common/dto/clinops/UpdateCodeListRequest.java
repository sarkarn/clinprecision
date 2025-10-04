package com.clinprecision.common.dto.clinops;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.Map;

/**
 * DTO for updating existing code list entries
 */
public class UpdateCodeListRequest {
    
    @Size(max = 200, message = "Display name must not exceed 200 characters")
    private String displayName;
    
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    private Integer sortOrder;
    
    private Boolean isActive;
    
    private Map<String, Object> metadata;
    
    private LocalDate validFrom;
    
    private LocalDate validTo;
    
    @NotNull(message = "Updated by user ID is required")
    private Long updatedBy;
    
    // Version for optimistic locking
    private Integer versionNumber;
    
    // Default constructor
    public UpdateCodeListRequest() {}
    
    // Getters and Setters
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
    
    public Long getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }
    
    public Integer getVersionNumber() {
        return versionNumber;
    }
    
    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
    }
}