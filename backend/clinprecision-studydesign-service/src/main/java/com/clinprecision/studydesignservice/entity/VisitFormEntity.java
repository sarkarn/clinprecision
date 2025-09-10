package com.clinprecision.studydesignservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Entity representing the association between a visit definition and a form.
 * This defines which forms are used in each visit.
 */
@Data
@Entity
@Table(name = "visit_forms")
@NoArgsConstructor
@AllArgsConstructor
public class VisitFormEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_definition_id", nullable = false)
    private VisitDefinitionEntity visitDefinition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private FormEntity form;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "active_form_version_id")
    private FormVersionEntity activeFormVersion;
    
    @Column(name = "display_name")
    private String displayName;
    
    @Column(name = "display_order")
    private Integer displayOrder;
    
    @Column(name = "is_required")
    private boolean isRequired = true;
    
    @Column(name = "is_repeatable")
    private boolean isRepeatable = false;
    
    @Column(name = "max_occurrences")
    private Integer maxOccurrences;
    
    @Column(name = "conditional_logic")
    private String conditionalLogic;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "json")
    private String metadata;

    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "is_active")
    private boolean isActive = true;
}
