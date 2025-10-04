package com.clinprecision.common.dto.clinops;


import com.clinprecision.common.entity.clinops.FormTemplateEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating new Form Templates
 * Used for API requests when creating form templates
 */
public class FormTemplateCreateRequestDto {
    
    @NotBlank(message = "Template ID is required")
    @Size(max = 50, message = "Template ID must not exceed 50 characters")
    private String templateId;
    
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;
    
    @Size(max = 20, message = "Version must not exceed 20 characters")
    private String version = "1.0";
    
    private Boolean isLatestVersion = true;
    
    private FormTemplateEntity.TemplateStatus status = FormTemplateEntity.TemplateStatus.DRAFT;
    
    @NotNull(message = "Fields JSON is required")
    private String fields;
    
    private String structure;
    
    private String tags;
    
    private Long createdBy;
    
    // Default constructor
    public FormTemplateCreateRequestDto() {}
    
    // Getters and Setters
    public String getTemplateId() {
        return templateId;
    }
    
    public void setTemplateId(String templateId) {
        this.templateId = templateId;
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
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getVersion() {
        return version;
    }
    
    public void setVersion(String version) {
        this.version = version;
    }
    
    public Boolean getIsLatestVersion() {
        return isLatestVersion;
    }
    
    public void setIsLatestVersion(Boolean isLatestVersion) {
        this.isLatestVersion = isLatestVersion;
    }
    
    public FormTemplateEntity.TemplateStatus getStatus() {
        return status;
    }
    
    public void setStatus(FormTemplateEntity.TemplateStatus status) {
        this.status = status;
    }
    
    public String getFields() {
        return fields;
    }
    
    public void setFields(String fields) {
        this.fields = fields;
    }
    
    public String getStructure() {
        return structure;
    }
    
    public void setStructure(String structure) {
        this.structure = structure;
    }
    
    public String getTags() {
        return tags;
    }
    
    public void setTags(String tags) {
        this.tags = tags;
    }
    
    public Long getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }
}