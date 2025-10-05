package com.clinprecision.clinopsservice.dto;


import com.clinprecision.clinopsservice.entity.FormDefinitionEntity;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * DTO for Form Definition responses
 * Used for API responses when returning form definition data
 */
public class FormDefinitionDto {
    
    private Long id;
    private Long studyId;
    private String name;
    private String description;
    private String formType;
    private String version;
    private Boolean isLatestVersion;
    private String parentVersionId;
    private String versionNotes;
    private Boolean isLocked;
    private FormDefinitionEntity.FormStatus status;
    
    // Updated: template_id is now BIGINT
    private Long templateId;
    private String templateVersion;
    
    // New: tags field as TEXT
    private String tags;
    
    private String fields;
    private String structure;
    private Long createdBy;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // Template information (for convenience)
    private String templateName;
    private String templateCategory;
    
    // Default constructor
    public FormDefinitionDto() {}
    
    // Constructor with required fields
    public FormDefinitionDto(Long id, Long studyId, String name, String fields) {
        this.id = id;
        this.studyId = studyId;
        this.name = name;
        this.fields = fields;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getStudyId() {
        return studyId;
    }
    
    public void setStudyId(Long studyId) {
        this.studyId = studyId;
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
    
    public String getFormType() {
        return formType;
    }
    
    public void setFormType(String formType) {
        this.formType = formType;
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
    
    public String getParentVersionId() {
        return parentVersionId;
    }
    
    public void setParentVersionId(String parentVersionId) {
        this.parentVersionId = parentVersionId;
    }
    
    public String getVersionNotes() {
        return versionNotes;
    }
    
    public void setVersionNotes(String versionNotes) {
        this.versionNotes = versionNotes;
    }
    
    public Boolean getIsLocked() {
        return isLocked;
    }
    
    public void setIsLocked(Boolean isLocked) {
        this.isLocked = isLocked;
    }
    
    public FormDefinitionEntity.FormStatus getStatus() {
        return status;
    }
    
    public void setStatus(FormDefinitionEntity.FormStatus status) {
        this.status = status;
    }
    
    public Long getTemplateId() {
        return templateId;
    }
    
    public void setTemplateId(Long templateId) {
        this.templateId = templateId;
    }
    
    public String getTemplateVersion() {
        return templateVersion;
    }
    
    public void setTemplateVersion(String templateVersion) {
        this.templateVersion = templateVersion;
    }
    
    public String getTags() {
        return tags;
    }
    
    public void setTags(String tags) {
        this.tags = tags;
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
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getTemplateName() {
        return templateName;
    }
    
    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }
    
    public String getTemplateCategory() {
        return templateCategory;
    }
    
    public void setTemplateCategory(String templateCategory) {
        this.templateCategory = templateCategory;
    }
}


