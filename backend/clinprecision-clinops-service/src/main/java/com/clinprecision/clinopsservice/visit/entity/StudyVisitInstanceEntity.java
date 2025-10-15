package com.clinprecision.clinopsservice.visit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity for study_visit_instances table
 * Represents scheduled visits based on visit definitions
 */
@Entity
@Table(name = "study_visit_instances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyVisitInstanceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "study_id", nullable = false)
    private Long studyId;

    @Column(name = "visit_id", nullable = false)
    private Long visitId; // FK to visit_definitions

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(name = "site_id")
    private Long siteId;

    @Column(name = "visit_date")
    private LocalDate visitDate;

    @Column(name = "actual_visit_date")
    private LocalDate actualVisitDate;

    @Column(name = "visit_status", length = 50)
    private String visitStatus; // SCHEDULED, COMPLETED, MISSED, CANCELLED

    @Column(name = "window_status", length = 50)
    private String windowStatus; // ON_TIME, EARLY, LATE, OUT_OF_WINDOW

    @Column(name = "completion_percentage")
    private Double completionPercentage;

    @Column(name = "aggregate_uuid", length = 36)
    private String aggregateUuid; // UUID for event sourcing (unscheduled visits)

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_by")
    private Long createdBy; // User ID who created the visit

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
