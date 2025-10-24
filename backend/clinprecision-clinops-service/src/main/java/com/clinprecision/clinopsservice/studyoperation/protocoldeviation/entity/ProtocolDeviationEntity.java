package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.entity;

import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationSeverity;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationStatus;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Protocol Deviation Entity - Read model for protocol deviations
 * Maps to protocol_deviations table
 * 
 * Tracks regulatory-required documentation of any deviations from
 * the approved clinical trial protocol, including root cause analysis
 * and corrective/preventive actions (CAPA).
 */
@Entity
@Table(name = "protocol_deviations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProtocolDeviationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "study_id", nullable = false)
    private Long studyId;

    @Column(name = "study_site_id")
    private Long studySiteId;

    @Column(name = "visit_instance_id")
    private Long visitInstanceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "deviation_type", nullable = false, length = 50)
    private DeviationType deviationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 20)
    private DeviationSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(name = "deviation_status", nullable = false, length = 20)
    private DeviationStatus deviationStatus;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "protocol_section", length = 100)
    private String protocolSection;

    @Column(name = "expected_procedure", columnDefinition = "TEXT")
    private String expectedProcedure;

    @Column(name = "actual_procedure", columnDefinition = "TEXT")
    private String actualProcedure;

    @Column(name = "deviation_date")
    private LocalDate deviationDate;

    @Column(name = "detected_date")
    private LocalDate detectionDate;

    @Column(name = "root_cause", columnDefinition = "TEXT")
    private String rootCause;

    @Column(name = "immediate_action", columnDefinition = "TEXT")
    private String immediateAction;

    @Column(name = "corrective_action", columnDefinition = "TEXT")
    private String correctiveAction;

    @Column(name = "preventive_action", columnDefinition = "TEXT")
    private String preventiveAction;

    @Column(name = "requires_reporting")
    private Boolean requiresReporting = false;

    @Column(name = "reported_to_irb")
    private Boolean reportedToIrb = false;

    @Column(name = "irb_report_date")
    private LocalDate irbReportDate;

    @Column(name = "reported_to_sponsor")
    private Boolean reportedToSponsor = false;

    @Column(name = "sponsor_report_date")
    private LocalDate sponsorReportDate;

    @Column(name = "detected_by", nullable = false)
    private Long detectedBy;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "resolved_by")
    private Long resolvedBy;

    @Column(name = "resolved_date")
    private LocalDate resolvedDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        
        if (this.deviationStatus == null) {
            this.deviationStatus = DeviationStatus.OPEN;
        }
        
        if (this.requiresReporting == null) {
            this.requiresReporting = false;
        }
        
        if (this.reportedToIrb == null) {
            this.reportedToIrb = false;
        }
        
        if (this.reportedToSponsor == null) {
            this.reportedToSponsor = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Helper methods
    
    /**
     * Check if deviation is open or under review
     */
    public boolean isActive() {
        return deviationStatus == DeviationStatus.OPEN || 
               deviationStatus == DeviationStatus.UNDER_REVIEW;
    }

    /**
     * Check if deviation is resolved
     */
    public boolean isResolved() {
        return deviationStatus == DeviationStatus.RESOLVED || 
               deviationStatus == DeviationStatus.CLOSED;
    }

    /**
     * Check if deviation requires regulatory reporting
     */
    public boolean needsRegulatoryReporting() {
        return Boolean.TRUE.equals(requiresReporting) && 
               (severity == DeviationSeverity.MAJOR || severity == DeviationSeverity.CRITICAL);
    }

    /**
     * Check if all required reports are submitted
     */
    public boolean isFullyReported() {
        if (!Boolean.TRUE.equals(requiresReporting)) {
            return true; // Doesn't need reporting
        }
        return Boolean.TRUE.equals(reportedToIrb) && 
               Boolean.TRUE.equals(reportedToSponsor);
    }
}
