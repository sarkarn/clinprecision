package com.clinprecision.clinopsservice.visit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing configurable unscheduled visit types.
 * These configurations are system-wide and copied to visit_definitions during study build.
 */
@Entity
@Table(name = "unscheduled_visit_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnscheduledVisitConfigEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique code identifying the visit type (e.g., EARLY_TERM, AE_VISIT)
     */
    @Column(name = "visit_code", nullable = false, unique = true, length = 50)
    private String visitCode;

    /**
     * Display name for the visit type (e.g., "Early Termination Visit")
     */
    @Column(name = "visit_name", nullable = false, length = 100)
    private String visitName;

    /**
     * Detailed description of the visit purpose
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Sort order for display (9000+ recommended for unscheduled visits)
     */
    @Column(name = "visit_order")
    private Integer visitOrder;

    /**
     * Whether this visit type is currently enabled
     */
    @Column(name = "is_enabled")
    private Boolean isEnabled;

    /**
     * Audit fields
     */
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isEnabled == null) {
            isEnabled = true;
        }
        if (visitOrder == null) {
            visitOrder = 9000;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
