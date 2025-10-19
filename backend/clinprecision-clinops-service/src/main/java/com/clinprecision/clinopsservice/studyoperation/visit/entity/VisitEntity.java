package com.clinprecision.clinopsservice.studyoperation.visit.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Visit Entity - Read model for unscheduled visits
 * 
 * This entity represents the denormalized view of visit data
 * built from VisitCreatedEvent projections.
 * 
 * Part of CQRS pattern:
 * - Write side: VisitAggregate (event sourced)
 * - Read side: VisitEntity (optimized for queries)
 */
@Entity
@Table(name = "visit")
public class VisitEntity {

    @Id
    @Column(name = "visit_id", columnDefinition = "BINARY(16)")
    private UUID visitId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "study_id", nullable = false)
    private Long studyId;

    @Column(name = "site_id", nullable = false)
    private Long siteId;

    @Column(name = "visit_type", nullable = false, length = 50)
    private String visitType; // SCREENING, ENROLLMENT, DISCONTINUATION, ADVERSE_EVENT

    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // SCHEDULED, COMPLETED, CANCELLED

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Default constructor for JPA
    public VisitEntity() {
    }

    // Getters and Setters
    public UUID getVisitId() {
        return visitId;
    }

    public void setVisitId(UUID visitId) {
        this.visitId = visitId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getStudyId() {
        return studyId;
    }

    public void setStudyId(Long studyId) {
        this.studyId = studyId;
    }

    public Long getSiteId() {
        return siteId;
    }

    public void setSiteId(Long siteId) {
        this.siteId = siteId;
    }

    public String getVisitType() {
        return visitType;
    }

    public void setVisitType(String visitType) {
        this.visitType = visitType;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
