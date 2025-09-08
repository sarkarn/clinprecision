package com.clinprecision.studydesignservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing the association between a visit and a form.
 * This mapping allows forms to be assigned to specific visits in a study.
 */
@Data
@Entity
@Table(name = "visit_forms")
@NoArgsConstructor
@AllArgsConstructor
public class VisitFormEntity {

    @Id
    @Column(name = "id")
    private String id = UUID.randomUUID().toString();

    @Column(name = "visit_definition_id", nullable = false)
    private String visitDefinitionId;

    @Column(name = "form_definition_id", nullable = false)
    private String formDefinitionId;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "is_required")
    private boolean isRequired = true;

    @Column(name = "conditional_display")
    private String conditionalDisplay;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "json")
    private String metadata;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "is_active")
    private boolean isActive = true;
}
