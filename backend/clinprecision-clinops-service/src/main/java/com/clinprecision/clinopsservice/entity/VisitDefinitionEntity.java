package com.clinprecision.clinopsservice.entity;


import com.clinprecision.clinopsservice.mapper.VisitTypeConverter;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Entity for Visit Definitions
 * Maps to visit_definitions table in the database
 */
@Entity
@Table(name = "visit_definitions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitDefinitionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "aggregate_uuid", nullable = true, length = 36)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID aggregateUuid; // Links to StudyDesignAggregate
    
    @Column(name = "visit_uuid", nullable = true, unique = true, length = 36)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID visitUuid; // UUID from event sourcing
    
    @Column(name = "arm_uuid", nullable = true, length = 36)
    @JdbcTypeCode(SqlTypes.CHAR)
    private UUID armUuid; // Optional arm-specific visits (UUID)

    @Column(name = "study_id", nullable = false)
    private Long studyId;

    @Column(name = "arm_id")
    private Long armId; // Optional arm-specific visits (legacy Long)

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "timepoint", nullable = false)
    private Integer timepoint; // Days from baseline (negative for screening)

    @Column(name = "window_before", nullable = false, columnDefinition = "INT DEFAULT 0")
    @Builder.Default
    private Integer windowBefore = 0; // Visit window in days

    @Column(name = "window_after", nullable = false, columnDefinition = "INT DEFAULT 0")
    @Builder.Default
    private Integer windowAfter = 0;

    @Column(name = "visit_type", nullable = false)
    @Convert(converter = VisitTypeConverter.class)
    @Builder.Default
    private VisitType visitType = VisitType.TREATMENT;

    @Column(name = "is_required", nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    @Builder.Default
    private Boolean isRequired = true;

    @Column(name = "sequence_number")
    private Integer sequenceNumber;
    
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
    
    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    // Relationship with visit forms
    @OneToMany(mappedBy = "visitDefinition", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VisitFormEntity> visitForms;

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

    /**
     * Visit Type enumeration with case-insensitive conversion
     */
    public enum VisitType {
        SCREENING,
        BASELINE,
        TREATMENT,
        FOLLOW_UP,
        UNSCHEDULED;

        /**
         * Convert from string value (case-insensitive)
         */
        @JsonCreator
        public static VisitType fromString(String value) {
            if (value == null || value.trim().isEmpty()) {
                return TREATMENT; // default value
            }
            try {
                // Handle both underscore and space variations
                String normalized = value.toUpperCase()
                    .replace(" ", "_")
                    .replace("-", "_");
                return VisitType.valueOf(normalized);
            } catch (IllegalArgumentException e) {
                // If no match found, return default
                return TREATMENT;
            }
        }

        /**
         * Convert to string value (lowercase for database compatibility)
         */
        @JsonValue
        public String toValue() {
            return this.name().toLowerCase();
        }
    }
}


