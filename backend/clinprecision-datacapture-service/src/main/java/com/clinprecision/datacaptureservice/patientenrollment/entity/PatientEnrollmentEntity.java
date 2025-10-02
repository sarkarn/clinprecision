package com.clinprecision.datacaptureservice.patientenrollment.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Patient Enrollment Entity - Read model for patient enrollments in studies
 * Follows established ClinPrecision patterns with aggregate_uuid mapping
 */
@Entity
@Table(name = "patient_enrollments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientEnrollmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "aggregate_uuid", unique = true)
    private String aggregateUuid;

    @Column(name = "enrollment_number", nullable = false)
    private String enrollmentNumber;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "patient_aggregate_uuid", nullable = false)
    private String patientAggregateUuid;

    @Column(name = "study_id", nullable = false)
    private Long studyId;

    @Column(name = "study_site_id", nullable = false)
    private Long studySiteId;

    @Column(name = "site_aggregate_uuid", nullable = false)
    private String siteAggregateUuid;

    @Column(name = "screening_number", nullable = false)
    private String screeningNumber;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "enrollment_status")
    @Builder.Default
    private EnrollmentStatus enrollmentStatus = EnrollmentStatus.ENROLLED;

    @Column(name = "eligibility_confirmed")
    @Builder.Default
    private Boolean eligibilityConfirmed = false;

    @Column(name = "eligibility_confirmed_by")
    private String eligibilityConfirmedBy;

    @Column(name = "eligibility_confirmed_at")
    private LocalDateTime eligibilityConfirmedAt;

    @Column(name = "ineligibility_reason", columnDefinition = "TEXT")
    private String ineligibilityReason;

    @Column(name = "enrolled_by", nullable = false)
    private String enrolledBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Convenience methods
    public boolean isEligible() {
        return Boolean.TRUE.equals(eligibilityConfirmed) && enrollmentStatus == EnrollmentStatus.ELIGIBLE;
    }

    public boolean isIneligible() {
        return Boolean.FALSE.equals(eligibilityConfirmed) && enrollmentStatus == EnrollmentStatus.INELIGIBLE;
    }

    public boolean hasIneligibilityReason() {
        return ineligibilityReason != null && !ineligibilityReason.trim().isEmpty();
    }
}