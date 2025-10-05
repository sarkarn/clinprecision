package com.clinprecision.common.entity.clinops;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity for Visit-Form Associations
 * Maps to visit_forms table in the database
 */
@Entity
@Table(name = "visit_forms", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"visit_definition_id", "form_definition_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitFormEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "aggregate_uuid", nullable = true, columnDefinition = "BINARY(16)")
    private java.util.UUID aggregateUuid; // Links to StudyDesignAggregate
    
    @Column(name = "assignment_uuid", nullable = true, unique = true, columnDefinition = "BINARY(16)")
    private java.util.UUID assignmentUuid; // UUID from event sourcing
    
    @Column(name = "visit_uuid", nullable = true, columnDefinition = "BINARY(16)")
    private java.util.UUID visitUuid; // Visit UUID reference
    
    @Column(name = "form_uuid", nullable = true, columnDefinition = "BINARY(16)")
    private java.util.UUID formUuid; // Form UUID reference

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_definition_id", nullable = false)
    private VisitDefinitionEntity visitDefinition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_definition_id", nullable = false)
    private FormDefinitionEntity formDefinition;

    @Column(name = "is_required", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    @Builder.Default
    private Boolean isRequired = true;

    @Column(name = "is_conditional", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    @Builder.Default
    private Boolean isConditional = false;

    @Column(name = "conditional_logic", columnDefinition = "TEXT")
    private String conditionalLogic; // JSON or expression for conditional forms

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 1; // Order for display in UI

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions; // Specific instructions for this form in this visit
    
    // Soft delete fields
    @Column(name = "is_deleted", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    @Builder.Default
    private Boolean isDeleted = false;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @Column(name = "deleted_by", length = 100)
    private String deletedBy;
    
    @Column(name = "deletion_reason", columnDefinition = "TEXT")
    private String deletionReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "update_reason", length = 255)
    private String updateReason;

    // JPA lifecycle methods
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}