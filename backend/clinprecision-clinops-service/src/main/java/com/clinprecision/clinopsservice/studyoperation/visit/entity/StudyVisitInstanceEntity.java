package com.clinprecision.clinopsservice.studyoperation.visit.entity;

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
    private Long studySiteId;

    @Column(name = "visit_date")
    private LocalDate visitDate;

    @Column(name = "actual_visit_date")
    private LocalDate actualVisitDate;

    @Column(name = "visit_status", length = 50)
    @Convert(converter = VisitStatusConverter.class)
    private VisitStatus visitStatus; // SCHEDULED, IN_PROGRESS, COMPLETED, MISSED, CANCELLED, RESCHEDULED

    @Column(name = "window_status", length = 50)
    private String windowStatus; // ON_TIME, EARLY, LATE, OUT_OF_WINDOW

    @Column(name = "completion_percentage")
    private Double completionPercentage;

    // Visit window compliance tracking (Gap #4)
    @Column(name = "visit_window_start")
    private LocalDate visitWindowStart; // Earliest acceptable visit date

    @Column(name = "visit_window_end")
    private LocalDate visitWindowEnd; // Latest acceptable visit date

    @Column(name = "window_days_before")
    private Integer windowDaysBefore; // Days before target allowed (from protocol)

    @Column(name = "window_days_after")
    private Integer windowDaysAfter; // Days after target allowed (from protocol)

    @Column(name = "compliance_status", length = 50)
    private String complianceStatus; // SCHEDULED, WINDOW_OPEN, ON_TIME, OVERDUE, MISSED, etc.

    @Column(name = "aggregate_uuid", length = 36)
    private String aggregateUuid; // UUID for event sourcing (unscheduled visits)

    @Column(name = "build_id")
    private Long buildId; // FK to study_database_builds - tracks which build version was used

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
