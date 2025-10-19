package com.clinprecision.clinopsservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Code List DTO for API responses
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CodeListDto {
    
    private Long id;
    private String category;
    private String code;
    private String displayName;
    private String description;
    private Integer sortOrder;
    private Boolean isActive;
    private Boolean systemCode;
    private Long parentCodeId;
    private Map<String, Object> metadata;
    private LocalDate validFrom;
    private LocalDate validTo;
    private Long createdBy;
    private LocalDateTime createdAt;
    private Long updatedBy;
    private LocalDateTime updatedAt;
    private Integer versionNumber;
    
    // For hierarchical relationships
    private CodeListDto parentCode;
    
    // Additional computed fields
    private Boolean isCurrentlyValid;
    private Boolean canEdit;
    private Boolean canDelete;
    
    // Default constructor
    public CodeListDto() {}
    
    // Constructor with essential fields
    public CodeListDto(String category, String code, String displayName) {
        this.category = category;
        this.code = code;
        this.displayName = displayName;
    }
    
    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private CodeListDto dto = new CodeListDto();
        
        public Builder id(Long id) {
            dto.id = id;
            return this;
        }
        
        public Builder category(String category) {
            dto.category = category;
            return this;
        }
        
        public Builder code(String code) {
            dto.code = code;
            return this;
        }
        
        public Builder displayName(String displayName) {
            dto.displayName = displayName;
            return this;
        }
        
        public Builder description(String description) {
            dto.description = description;
            return this;
        }
        
        public Builder sortOrder(Integer sortOrder) {
            dto.sortOrder = sortOrder;
            return this;
        }
        
        public Builder isActive(Boolean isActive) {
            dto.isActive = isActive;
            return this;
        }
        
        public Builder systemCode(Boolean systemCode) {
            dto.systemCode = systemCode;
            return this;
        }
        
        public Builder metadata(Map<String, Object> metadata) {
            dto.metadata = metadata;
            return this;
        }
        
        public Builder validFrom(LocalDate validFrom) {
            dto.validFrom = validFrom;
            return this;
        }
        
        public Builder validTo(LocalDate validTo) {
            dto.validTo = validTo;
            return this;
        }
        
        public CodeListDto build() {
            return dto;
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public Long getUpdatedBy() {
        return updatedBy;
    }
    
    public void setUpdatedBy(Long updatedBy) {
        this.updatedBy = updatedBy;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Integer getVersionNumber() {
        return versionNumber;
    }
    
    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
    }
    
    public CodeListDto getParentCode() {
        return parentCode;
    }
    
    public void setParentCode(CodeListDto parentCode) {
        this.parentCode = parentCode;
    }
    
    public Boolean getIsCurrentlyValid() {
        return isCurrentlyValid;
    }
    
    public void setIsCurrentlyValid(Boolean isCurrentlyValid) {
        this.isCurrentlyValid = isCurrentlyValid;
    }
    
    public Boolean getCanEdit() {
        return canEdit;
    }
    
    public void setCanEdit(Boolean canEdit) {
        this.canEdit = canEdit;
    }
    
    public Boolean getCanDelete() {
        return canDelete;
    }
    
    public void setCanDelete(Boolean canDelete) {
        this.canDelete = canDelete;
    }
}



