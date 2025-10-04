package com.clinprecision.common.entity.clinops;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * FormDefinition Entity - Maps to form_definitions table
 * Represents study-specific forms that can be based on form templates
 */
@Entity
@Table(name = "form_definitions")
public class FormDefinitionEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "study_id", nullable = false)
    private Long studyId;
    
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "form_type", length = 100)
    private String formType;
    
    @Column(name = "version", length = 20)
    private String version = "1.0";
    
    @Column(name = "is_latest_version")
    private Boolean isLatestVersion = true;
    
    @Column(name = "parent_version_id", length = 36)
    private String parentVersionId;
    
    @Column(name = "version_notes", columnDefinition = "TEXT")
    private String versionNotes;
    
    @Column(name = "is_locked")
    private Boolean isLocked = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private FormStatus status = FormStatus.DRAFT;
    
    // Updated: template_id is now BIGINT and references form_templates table
    @Column(name = "template_id")
    private Long templateId;
    
    @Column(name = "template_version", length = 36)
    private String templateVersion;
    
    // New: tags column added as TEXT
    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;
    
    @Column(name = "fields", columnDefinition = "JSON", nullable = false)
    private String fields;
    
    @Column(name = "structure", columnDefinition = "JSON")
    private String structure;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Many-to-One relationship with StudyEntity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", referencedColumnName = "id", insertable = false, updatable = false)
    @JsonBackReference
    private StudyEntity study;
    
    // Many-to-One relationship with FormTemplateEntity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", referencedColumnName = "id", insertable = false, updatable = false)
    private FormTemplateEntity formTemplate;
    
    // Enum for form status
    public enum FormStatus {
        DRAFT,
        APPROVED,
        RETIRED
    }
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (version == null) {
            version = "1.0";
        }
        if (isLatestVersion == null) {
            isLatestVersion = true;
        }
        if (isLocked == null) {
            isLocked = false;
        }
        if (status == null) {
            status = FormStatus.DRAFT;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Default constructor
    public FormDefinitionEntity() {}
    
    // Constructor with required fields
    public FormDefinitionEntity(Long studyId, String name, String fields) {
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
    
    public FormStatus getStatus() {
        return status;
    }
    
    public void setStatus(FormStatus status) {
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
    
    public StudyEntity getStudy() {
        return study;
    }
    
    public void setStudy(StudyEntity study) {
        this.study = study;
    }
    
    public FormTemplateEntity getFormTemplate() {
        return formTemplate;
    }
    
    public void setFormTemplate(FormTemplateEntity formTemplate) {
        this.formTemplate = formTemplate;
    }
}