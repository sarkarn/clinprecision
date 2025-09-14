package com.clinprecision.adminservice.data.entity;

import com.clinprecision.common.entity.UserEntity;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;

/**
 * Entity representing a form template in the system.
 * Maps to the form_templates table in the database.
 */
@Entity
@Table(name = "form_templates")
@Getter
@Setter
@NoArgsConstructor
public class FormTemplateEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "template_id", nullable = false, unique = true, length = 50)
    private String templateId;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "category", length = 100)
    private String category;
    
    @Column(name = "version", length = 20)
    private String version = "1.0";
    
    @Column(name = "is_latest_version")
    private Boolean isLatestVersion = true;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private FormTemplateStatus status = FormTemplateStatus.draft;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "fields", nullable = false, columnDefinition = "JSON")
    private JsonNode fields;
    
    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;
    
    @Column(name = "usage_count")
    private Integer usageCount = 0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserEntity createdBy;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
    @Column(name = "updated_at")
    private Instant updatedAt;
    
    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FormTemplateVersionEntity> versions;
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
    
    /**
     * Enum for form template status
     */
    public enum FormTemplateStatus {
        draft, published, archived
    }
}