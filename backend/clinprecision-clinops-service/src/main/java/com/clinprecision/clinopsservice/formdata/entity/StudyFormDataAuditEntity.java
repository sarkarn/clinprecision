package com.clinprecision.clinopsservice.formdata.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * StudyFormDataAudit Entity - Audit trail for form data changes
 * 
 * Table: study_form_data_audit
 * Purpose: Complete history of all changes to form data
 * 
 * GCP/FDA 21 CFR Part 11 Compliance:
 * - Maintains complete audit trail of all form modifications
 * - Captures who made the change, when, and what changed
 * - Stores both old and new values for comparison
 * - Immutable records (no updates or deletes)
 * 
 * Audit Actions:
 * - INSERT: New form submission
 * - UPDATE: Modification to existing form
 * - DELETE: Form deletion (rare, usually forms are retained)
 * - LOCK: Form locked as part of database lock
 * - UNLOCK: Form unlocked (emergency use only, requires justification)
 * 
 * Relationship with Event Store:
 * - Event Store: Source of truth (immutable events)
 * - This Table: Denormalized audit view for reporting
 * - Both should contain same information, different formats
 * 
 * Query Use Cases:
 * - "Show me all changes to subject 1001's screening form"
 * - "Who modified this form last Tuesday?"
 * - "What was the value of field X before it was changed?"
 * - "Audit report for regulatory inspection"
 */
@Entity
@Table(name = "study_form_data_audit")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyFormDataAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id")
    private Long auditId;

    /**
     * Study context
     */
    @Column(name = "study_id", nullable = false)
    private Long studyId;

    /**
     * Record being audited
     * Foreign key to study_form_data.id
     */
    @Column(name = "record_id", nullable = false)
    private Long recordId;

    /**
     * UUID from event sourcing
     * Links to FormDataAggregate identifier
     */
    @Column(name = "aggregate_uuid")
    private String aggregateUuid;

    /**
     * Study database build reference
     * Foreign key to study_database_builds table
     * Tracks which protocol version was ACTIVE when change was made
     * 
     * CRITICAL for FDA 21 CFR Part 11 compliance:
     * - Audit trail must include protocol version context
     * - Required to reconstruct data at any historical point
     * - Proves which validation rules applied at time of change
     * - Enables protocol deviation detection
     * 
     * Backfill strategy:
     * - Primary: Copy from study_form_data.build_id (for UPDATE/DELETE)
     * - Fallback: Get build active at changed_at timestamp (temporal query)
     * 
     * Example use case:
     * - Patient data changed on 2025-03-15
     * - Question during FDA inspection: "Which validation rules applied?"
     * - Answer: Build 1 (age limit 18-65) or Build 2 (age limit 18-85)?
     * - This field provides the answer
     */
    @Column(name = "build_id")
    private Long buildId;

    /**
     * Audit action type
     * - INSERT: New form submission
     * - UPDATE: Form modification
     * - DELETE: Form deletion (rare)
     * - LOCK: Database lock applied
     * - UNLOCK: Database lock removed (emergency only)
     * - VERIFY: Source data verification performed
     * - RESOLVE_QUERY: Query resolution
     */
    @Column(name = "action", nullable = false)
    private String action;

    /**
     * Old data before change (NULL for INSERT)
     * Stores complete form_data JSON before modification
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "old_data", columnDefinition = "json")
    private Map<String, Object> oldData;

    /**
     * New data after change (NULL for DELETE)
     * Stores complete form_data JSON after modification
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "new_data", columnDefinition = "json")
    private Map<String, Object> newData;

    /**
     * Who made the change
     * Foreign key to users table
     */
    @Column(name = "changed_by", nullable = false)
    private Long changedBy;

    /**
     * When the change occurred
     * Timestamp is critical for audit trail
     */
    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    /**
     * Optional: Reason for change
     * Required for:
     * - Updates to SUBMITTED forms (must justify)
     * - Database unlock (emergency use)
     * - Manual corrections
     */
    @Column(name = "change_reason")
    private String reason;

    /**
     * Optional: IP address of user making change
     * Additional security audit trail
     */
    @Column(name = "ip_address")
    private String ipAddress;

    /**
     * Optional: Event ID from event store
     * Links audit record to specific domain event
     * Useful for event replay and correlation
     */
    @Column(name = "event_id")
    private String eventId;

    /**
     * JPA lifecycle callback
     * Ensure timestamp is set
     */
    @PrePersist
    protected void onCreate() {
        if (this.changedAt == null) {
            this.changedAt = LocalDateTime.now();
        }
    }

    /**
     * Business logic helpers
     */
    public boolean isInsert() {
        return "INSERT".equals(action);
    }

    public boolean isUpdate() {
        return "UPDATE".equals(action);
    }

    public boolean isDelete() {
        return "DELETE".equals(action);
    }

    public boolean isLock() {
        return "LOCK".equals(action);
    }

    public boolean isUnlock() {
        return "UNLOCK".equals(action);
    }

    /**
     * Get fields that were changed
     * Compares oldData and newData to find differences
     */
    public Map<String, Object> getChangedFields() {
        if (oldData == null || newData == null) {
            return newData != null ? newData : oldData;
        }

        // Find fields that changed
        Map<String, Object> changes = new java.util.HashMap<>();
        for (String key : newData.keySet()) {
            Object oldValue = oldData.get(key);
            Object newValue = newData.get(key);
            
            if (oldValue == null && newValue != null) {
                changes.put(key, newValue);
            } else if (oldValue != null && !oldValue.equals(newValue)) {
                changes.put(key, newValue);
            }
        }
        
        return changes;
    }

    /**
     * Count how many fields changed
     */
    public int getChangeCount() {
        return getChangedFields().size();
    }

    /**
     * Check if this is a significant change
     * (more than X fields changed)
     */
    public boolean isSignificantChange(int threshold) {
        return getChangeCount() >= threshold;
    }

    /**
     * Check if reason is provided
     * Required for certain audit actions
     */
    public boolean hasReason() {
        return reason != null && !reason.trim().isEmpty();
    }

    /**
     * Summary for logging
     */
    public String getSummary() {
        return String.format(
            "StudyFormDataAudit{auditId=%d, studyId=%d, recordId=%d, action=%s, " +
            "changedBy=%d, changedAt=%s, changeCount=%d}",
            auditId, studyId, recordId, action, changedBy, changedAt, getChangeCount()
        );
    }
}
