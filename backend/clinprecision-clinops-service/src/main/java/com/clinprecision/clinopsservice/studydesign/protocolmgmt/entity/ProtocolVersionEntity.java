package com.clinprecision.clinopsservice.protocolversion.entity;

import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.AmendmentType;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Protocol Version Entity - Read Model for CQRS
 * 
 * This entity represents the read-optimized view of protocol versions.
 * It is updated by ProtocolVersionProjection based on domain events.
 * 
 * IMPORTANT: aggregate_uuid is the link to the event-sourced aggregate.
 * The 'id' field is the traditional database primary key for JPA relationships.
 */
@Entity
@Table(name = "study_versions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProtocolVersionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * CRITICAL: Link to event-sourced aggregate
     * This UUID matches the @AggregateIdentifier in ProtocolVersionAggregate
     */
    @Column(name = "aggregate_uuid", unique = true, nullable = true)
    private UUID aggregateUuid;

    /**
     * Link to parent Study aggregate (UUID-based, DDD approach)
     */
    @Column(name = "study_aggregate_uuid", nullable = false)
    private UUID studyAggregateUuid;

    /**
     * LEGACY: Link to parent Study entity (Long-based ID)
     * TODO: Remove after Study module migrated to DDD
     * @deprecated Use studyAggregateUuid instead
     */
    @Deprecated
    @Column(name = "study_id", nullable = true)
    private Long studyId;

    @Column(name = "version_number", nullable = false, length = 20)
    private String versionNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private VersionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "amendment_type", length = 50)
    private AmendmentType amendmentType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "changes_summary", columnDefinition = "TEXT")
    private String changesSummary;

    @Column(name = "impact_assessment", columnDefinition = "TEXT")
    private String impactAssessment;

    @Column(name = "requires_regulatory_approval")
    private Boolean requiresRegulatoryApproval;

    @Column(name = "submission_date")
    private LocalDate submissionDate;

    @Column(name = "approval_date")
    private LocalDate approvalDate;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "protocol_changes", columnDefinition = "TEXT")
    private String protocolChanges;

    @Column(name = "icf_changes", columnDefinition = "TEXT")
    private String icfChanges;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Column(name = "approval_comments", columnDefinition = "TEXT")
    private String approvalComments;

    @Column(name = "previous_active_version_uuid")
    private UUID previousActiveVersionUuid;

    @Column(name = "withdrawal_reason", columnDefinition = "TEXT")
    private String withdrawalReason;

    @Column(name = "withdrawn_by")
    private Long withdrawnBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}



