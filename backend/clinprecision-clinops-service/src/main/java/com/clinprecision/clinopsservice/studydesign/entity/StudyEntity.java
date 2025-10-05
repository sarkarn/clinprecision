package com.clinprecision.clinopsservice.studydesign.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Study Entity - Read model for clinical studies
 * 
 * This is the query-side entity for the Study aggregate.
 * Following CQRS pattern: separate read model from write model (aggregate).
 * 
 * Key Design Decisions:
 * - aggregate_uuid: Links to event-sourced aggregate (UUID)
 * - id: Traditional database primary key (Long)
 * - Denormalized for query performance
 * - Updated by StudyProjection when events occur
 */
@Entity
@Table(name = "studies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Aggregate UUID - Links to event-sourced aggregate
     * This is the bridge between event store and read model
     */
    @Column(name = "aggregate_uuid", unique = true, nullable = false, length = 36)
    private UUID aggregateUuid;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "sponsor", nullable = false, length = 255)
    private String sponsor;

    @Column(name = "protocol_number", nullable = false, length = 50)
    private String protocolNumber;

    @Column(name = "phase", length = 50)
    private String phase;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "status_id", nullable = false)
    private Integer statusId;

    @Column(name = "indication", length = 500)
    private String indication;

    @Column(name = "study_type", length = 100)
    private String studyType;

    @Column(name = "principal_investigator", length = 255)
    private String principalInvestigator;

    @Column(name = "planned_subjects")
    private Integer plannedSubjects;

    @Column(name = "planned_sites")
    private Integer plannedSites;

    @Column(name = "planned_start_date")
    private LocalDate plannedStartDate;

    @Column(name = "planned_end_date")
    private LocalDate plannedEndDate;

    @Column(name = "actual_start_date")
    private LocalDate actualStartDate;

    @Column(name = "actual_end_date")
    private LocalDate actualEndDate;

    @Column(name = "closed", nullable = false)
    @Builder.Default
    private Boolean closed = false;

    @Column(name = "closure_reason", length = 100)
    private String closureReason;

    @Column(name = "closure_notes", columnDefinition = "TEXT")
    private String closureNotes;

    @Column(name = "closed_by")
    private Long closedBy;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Set aggregate UUID from UUID
     */
    public void setAggregateUuid(UUID uuid) {
        this.aggregateUuid = uuid;
    }

    /**
     * Get aggregate UUID as string (for compatibility)
     */
    public String getAggregateUuidAsString() {
        return aggregateUuid != null ? aggregateUuid.toString() : null;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (closed == null) {
            closed = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
