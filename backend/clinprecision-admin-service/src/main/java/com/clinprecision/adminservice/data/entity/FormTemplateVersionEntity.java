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

/**
 * Entity representing a version of a form template.
 * Maps to the form_template_versions table in the database.
 */
@Entity
@Table(name = "form_template_versions")
@Getter
@Setter
@NoArgsConstructor
public class FormTemplateVersionEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private FormTemplateEntity template;
    
    @Column(name = "version", nullable = false, length = 20)
    private String version;
    
    @Column(name = "version_date")
    private Instant versionDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserEntity createdBy;
    
    @Column(name = "version_notes", columnDefinition = "TEXT")
    private String versionNotes;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "fields_snapshot", nullable = false, columnDefinition = "JSON")
    private JsonNode fieldsSnapshot;
    
    @PrePersist
    protected void onCreate() {
        if (versionDate == null) {
            versionDate = Instant.now();
        }
    }
}