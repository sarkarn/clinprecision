package com.clinprecision.common.dto.studydesign;

import com.clinprecision.common.entity.studydesign.FormDefinitionEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating new Form Definitions
 * Used for API requests when creating form definitions for studies
 */
public class FormDefinitionCreateRequestDto {
    
    @NotNull(message = "Study ID is required")
    private Long studyId;
    
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;
    
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;
    
    @Size(max = 100, message = "Form type must not exceed 100 characters")
    private String formType;
    
    @Size(max = 20, message = "Version must not exceed 20 characters")
    private String version = "1.0";
    
    private Boolean isLatestVersion = true;
    
    @Size(max = 36, message = "Parent version ID must not exceed 36 characters")
    private String parentVersionId;
    
    private String versionNotes;
    
    private Boolean isLocked = false;
    
    private FormDefinitionEntity.FormStatus status = FormDefinitionEntity.FormStatus.DRAFT;
    
    // Updated: template_id is now BIGINT (Long)
    private Long templateId;
    
    @Size(max = 36, message = "Template version must not exceed 36 characters")
    private String templateVersion;
    
    // New: tags field
    private String tags;
    
    @NotNull(message = "Fields JSON is required")
    private String fields;
    
    private String structure;
    
    private Long createdBy;
    
    // Default constructor
    public FormDefinitionCreateRequestDto() {}
    
    // Getters and Setters
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
}