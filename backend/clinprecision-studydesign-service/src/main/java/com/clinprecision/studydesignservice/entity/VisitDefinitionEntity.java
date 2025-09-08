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
 * Entity representing a study visit definition.
 * Visits are structured events within a study protocol where subjects are assessed
 * and data is collected via CRFs.
 */
@Data
@Entity
@Table(name = "visit_definitions")
@NoArgsConstructor
@AllArgsConstructor
public class VisitDefinitionEntity {

    @Id
    @Column(name = "id")
    private String id = UUID.randomUUID().toString();

    @Column(name = "study_id", nullable = false)
    private String studyId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "visit_number")
    private Integer visitNumber;

    @Column(name = "description")
    private String description;

    @Column(name = "visit_type")
    @Enumerated(EnumType.STRING)
    private VisitType visitType = VisitType.SCHEDULED;

    @Column(name = "window_before_days")
    private Integer windowBeforeDays;

    @Column(name = "window_after_days")
    private Integer windowAfterDays;

    @Column(name = "day_offset")
    private Integer dayOffset;

    @Column(name = "conditional_logic")
    private String conditionalLogic;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "json")
    private String metadata;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "is_active")
    private boolean isActive = true;

    public enum VisitType {
        SCHEDULED,     // Regular visit based on study timeline
        UNSCHEDULED,   // Ad-hoc visit
        SCREENING,     // Initial screening visit
        BASELINE,      // Baseline/enrollment visit
        FOLLOW_UP,     // Follow-up visit
        CLOSE_OUT      // End of study visit
    }
}
