package com.clinprecision.clinopsservice.studyoperation.patientenrollment.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Patient Status History Entity - Complete audit trail of patient status changes
 * 
 * <p>This entity captures all status transitions for regulatory compliance (FDA 21 CFR Part 11).
 * Each record represents a single status change event with complete context:
 * who made the change, when it occurred, why it was made, and what changed.</p>
 * 
 * <p>Status Flow: REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED/WITHDRAWN</p>
 * 
 * <p>Key Features:</p>
 * <ul>
 *   <li>Immutable audit trail (no updates, only inserts)</li>
 *   <li>Event sourcing integration via event_id for idempotency</li>
 *   <li>Links to both aggregate (event store) and read model (patients table)</li>
 *   <li>Optional enrollment context for multi-enrollment scenarios</li>
 * </ul>
 * 
 * @see PatientEntity
 * @see PatientEnrollmentEntity
 * @see PatientStatus
 */
@Entity
@Table(
    name = "patient_status_history",
    indexes = {
        @Index(name = "idx_patient_status_history_patient_id", columnList = "patient_id"),
        @Index(name = "idx_patient_status_history_aggregate_uuid", columnList = "aggregate_uuid"),
        @Index(name = "idx_patient_status_history_event_id", columnList = "event_id"),
        @Index(name = "idx_patient_status_history_changed_at", columnList = "changed_at"),
        @Index(name = "idx_patient_status_history_new_status", columnList = "new_status"),
        @Index(name = "idx_patient_status_history_changed_by", columnList = "changed_by"),
        @Index(name = "idx_patient_status_history_enrollment_id", columnList = "enrollment_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientStatusHistoryEntity {

    /**
     * Primary key - auto-generated
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Foreign key to patients table (read model)
     * Links this history record to the patient's current state
     */
    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    /**
     * Patient aggregate UUID from event store
     * Used by Axon Framework for event sourcing correlation
     */
    @Column(name = "aggregate_uuid", nullable = false)
    private String aggregateUuid;

    /**
     * Unique event identifier from domain_event_entry table
     * Ensures idempotency - prevents duplicate records on event replay
     */
    @Column(name = "event_id", nullable = false, unique = true)
    private String eventId;

    /**
     * Previous patient status before this change
     * Valid values: REGISTERED, SCREENING, ENROLLED, ACTIVE, COMPLETED, WITHDRAWN
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", nullable = false, length = 50)
    private PatientStatus previousStatus;

    /**
     * New patient status after this change
     * Valid values: REGISTERED, SCREENING, ENROLLED, ACTIVE, COMPLETED, WITHDRAWN
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 50)
    private PatientStatus newStatus;

    /**
     * Required reason for the status change
     * Examples:
     * - "Screening visit scheduled for March 15, 2025"
     * - "Passed all eligibility criteria"
     * - "First treatment visit completed"
     * - "Patient voluntary withdrawal"
     */
    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    /**
     * User who performed the status change
     * Typically email or username of coordinator/investigator
     */
    @Column(name = "changed_by", nullable = false, length = 100)
    private String changedBy;

    /**
     * Timestamp when the status change occurred
     * Important: This is from the event, not when the record was persisted
     */
    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    /**
     * Optional additional notes about the status change
     * Can include contextual information like:
     * - "Patient called to confirm appointment"
     * - "PI approved enrollment"
     * - "AE reported during visit"
     */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /**
     * Optional foreign key to patient_enrollments table
     * Used when status change is specific to a particular enrollment
     * Null for global patient status changes
     */
    @Column(name = "enrollment_id")
    private Long enrollmentId;

    /**
     * Record creation timestamp (when persisted to database)
     * Different from changed_at which is from the event
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Lifecycle callback - set creation timestamp
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ==================== Relationships ====================

    /**
     * Many-to-one relationship with PatientEntity
     * Lazy loading to avoid N+1 queries
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private PatientEntity patient;

    /**
     * Many-to-one relationship with PatientEnrollmentEntity
     * Optional - only present for enrollment-specific status changes
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", insertable = false, updatable = false)
    private PatientEnrollmentEntity enrollment;

    // ==================== Convenience Methods ====================

    /**
     * Check if this is a status improvement (progressing through lifecycle)
     * @return true if new status is further along in the lifecycle
     */
    public boolean isStatusProgression() {
        if (previousStatus == null || newStatus == null) return false;
        
        // Progression order: REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED
        int previousOrder = getStatusOrder(previousStatus);
        int newOrder = getStatusOrder(newStatus);
        
        return newOrder > previousOrder && newStatus != PatientStatus.WITHDRAWN;
    }

    /**
     * Check if this is a withdrawal
     * @return true if new status is WITHDRAWN
     */
    public boolean isWithdrawal() {
        return newStatus == PatientStatus.WITHDRAWN;
    }

    /**
     * Check if this is a terminal status change (COMPLETED or WITHDRAWN)
     * @return true if patient reached a terminal status
     */
    public boolean isTerminalStatusChange() {
        return newStatus != null && newStatus.isTerminal();
    }

    /**
     * Check if reason is provided and not empty
     * @return true if reason has meaningful content
     */
    public boolean hasReason() {
        return reason != null && !reason.trim().isEmpty();
    }

    /**
     * Check if notes are provided
     * @return true if notes exist and are not empty
     */
    public boolean hasNotes() {
        return notes != null && !notes.trim().isEmpty();
    }

    /**
     * Check if this change is enrollment-specific
     * @return true if enrollment_id is set
     */
    public boolean isEnrollmentSpecific() {
        return enrollmentId != null;
    }

    /**
     * Get formatted status change description
     * @return human-readable status change description
     */
    public String getStatusChangeDescription() {
        StringBuilder sb = new StringBuilder();
        sb.append(previousStatus.getDisplayName())
          .append(" → ")
          .append(newStatus.getDisplayName());
        
        if (hasReason()) {
            sb.append(": ").append(reason);
        }
        
        return sb.toString();
    }

    /**
     * Calculate how long after the previous change this change occurred
     * @param previousChange the previous status change record
     * @return duration in days, or 0 if previousChange is null
     */
    public long getDaysSincePreviousChange(PatientStatusHistoryEntity previousChange) {
        if (previousChange == null || previousChange.getChangedAt() == null || this.changedAt == null) {
            return 0;
        }
        
        return java.time.temporal.ChronoUnit.DAYS.between(
            previousChange.getChangedAt().toLocalDate(),
            this.changedAt.toLocalDate()
        );
    }

    // ==================== Helper Methods ====================

    /**
     * Get numeric order for status (for progression calculation)
     * @param status the patient status
     * @return numeric order (higher = further in lifecycle)
     */
    private int getStatusOrder(PatientStatus status) {
        switch (status) {
            case REGISTERED: return 1;
            case SCREENING: return 2;
            case ENROLLED: return 3;
            case ACTIVE: return 4;
            case COMPLETED: return 5;
            case WITHDRAWN: return 0; // Special case - not a progression
            default: return 0;
        }
    }

    // ==================== Builder Customization ====================

    /**
     * Custom builder method to create from event data
     * Convenience method for projectors creating history from events
     */
    public static class PatientStatusHistoryEntityBuilder {
        
        /**
         * Build from PatientStatusChangedEvent data
         * Assumes all required fields are set via builder
         */
        public PatientStatusHistoryEntity buildFromEvent(
            Long patientId,
            String aggregateUuid,
            String eventId,
            PatientStatus previousStatus,
            PatientStatus newStatus,
            String reason,
            String changedBy,
            LocalDateTime changedAt
        ) {
            return PatientStatusHistoryEntity.builder()
                .patientId(patientId)
                .aggregateUuid(aggregateUuid)
                .eventId(eventId)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .reason(reason)
                .changedBy(changedBy)
                .changedAt(changedAt)
                .build();
        }
    }

    // ==================== Object Methods ====================

    @Override
    public String toString() {
        return "PatientStatusHistoryEntity{" +
                "id=" + id +
                ", patientId=" + patientId +
                ", aggregateUuid='" + aggregateUuid + '\'' +
                ", eventId='" + eventId + '\'' +
                ", previousStatus=" + previousStatus +
                ", newStatus=" + newStatus +
                ", changedBy='" + changedBy + '\'' +
                ", changedAt=" + changedAt +
                ", enrollmentId=" + enrollmentId +
                '}';
    }
}
