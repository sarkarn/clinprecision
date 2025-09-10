package com.clinprecision.studydesignservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity representing a clinical research form template.
 * Forms are the building blocks for data collection within a study.
 */
@Data
@Entity
@Table(name = "form_definitions")
@NoArgsConstructor
@AllArgsConstructor
public class FormEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id")
    private StudyEntity study;

    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "form_type")
    private String formType;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "is_active")
    private boolean isActive = true;
    
    @Column(name = "is_template")
    private boolean isTemplate = false;
    
    @Column(name = "is_locked")
    private boolean isLocked = false;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "json")
    private String metadata;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FormVersionEntity> versions;
    
    @OneToMany(mappedBy = "form")
    private List<VisitFormEntity> visitForms;
}
