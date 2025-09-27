package com.clinprecision.common.entity.admin;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import org.hibernate.annotations.Type;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Code List Entity - Central repository for all application code lists
 */
@Entity
@Table(name = "code_lists")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CodeListEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "category", nullable = false, length = 100)
    private String category;
    
    @Column(name = "code", nullable = false, length = 100)
    private String code;
    
    @Column(name = "display_name", nullable = false, length = 200)
    private String displayName;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "sort_order")
    private Integer sortOrder = 0;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "system_code")
    private Boolean systemCode = false;
    
    @Column(name = "parent_code_id")
    private Long parentCodeId;
    
    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;
    
    @Column(name = "valid_from")
    private LocalDate validFrom;
    
    @Column(name = "valid_to")
    private LocalDate validTo;
    
    @Column(name = "created_by", nullable = false)
    private Long createdBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_by")
    private Long updatedBy;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "version_number")
    private Integer versionNumber = 1;
    
    // Lifecycle callbacks
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
        if (systemCode == null) {
            systemCode = false;
        }
        if (sortOrder == null) {
            sortOrder = 0;
        }
        if (versionNumber == null) {
            versionNumber = 1;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (versionNumber != null) {
            versionNumber++;
        }
    }
    
    // Default constructor
    public CodeListEntity() {}
    
    // Constructor with required fields
    public CodeListEntity(String category, String code, String displayName, Long createdBy) {
        this.category = category;
        this.code = code;
        this.displayName = displayName;
        this.createdBy = createdBy;
    }
    
    // Utility methods for metadata handling
    public JsonNode getMetadataAsJson() {
        if (metadata == null || metadata.trim().isEmpty()) {
            return null;
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readTree(metadata);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
    
    public void setMetadataFromObject(Object metadataObject) {
        if (metadataObject == null) {
            this.metadata = null;
            return;
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            this.metadata = mapper.writeValueAsString(metadataObject);
        } catch (JsonProcessingException e) {
            this.metadata = null;
        }
    }
    
    public String getMetadataValue(String path) {
        JsonNode jsonNode = getMetadataAsJson();
        if (jsonNode == null) {
            return null;
        }
        JsonNode valueNode = jsonNode.at(path);
        return valueNode.isMissingNode() ? null : valueNode.asText();
    }
    
    // Helper methods
    public boolean isCurrentlyValid() {
        LocalDate now = LocalDate.now();
        boolean fromValid = (validFrom == null || !now.isBefore(validFrom));
        boolean toValid = (validTo == null || !now.isAfter(validTo));
        return isActive && fromValid && toValid;
    }
    
    public boolean isSystemManaged() {
        return Boolean.TRUE.equals(systemCode);
    }
    
    public boolean isUserConfigurable() {
        return !Boolean.TRUE.equals(systemCode);
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
    
    public String getMetadata() {
        return metadata;
    }
    
    public void setMetadata(String metadata) {
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
    
    @Override
    public String toString() {
        return "CodeListEntity{" +
                "id=" + id +
                ", category='" + category + '\'' +
                ", code='" + code + '\'' +
                ", displayName='" + displayName + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}