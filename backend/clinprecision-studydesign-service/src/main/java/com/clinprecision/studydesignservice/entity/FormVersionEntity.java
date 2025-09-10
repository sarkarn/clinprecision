package com.clinprecision.studydesignservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing a specific version of a form.
 * Each form can have multiple versions to track changes over time.
 */
@Data
@Entity
@Table(name = "form_versions")
@NoArgsConstructor
@AllArgsConstructor
public class FormVersionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private FormEntity form;

    @Column(name = "version_number", nullable = false)
    private String versionNumber;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "form_schema", columnDefinition = "text")
    private String formSchema;
    
    @Column(name = "is_active")
    private boolean isActive = true;
    
    @Column(name = "is_published")
    private boolean isPublished = false;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
