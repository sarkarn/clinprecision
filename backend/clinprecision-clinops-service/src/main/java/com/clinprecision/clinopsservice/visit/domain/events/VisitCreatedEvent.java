package com.clinprecision.clinopsservice.visit.domain.events;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event emitted when a new visit is created
 * 
 * This event triggers:
 * - Visit record creation in read model (visit table)
 * - Audit log entry for compliance tracking
 * - Potential form collection workflow (screening forms, enrollment forms, etc.)
 */
public class VisitCreatedEvent {

    private final UUID visitId;
    private final Long patientId;
    private final Long studyId;
    private final Long siteId;
    private final String visitType;
    private final LocalDate visitDate;
    private final String status;
    private final String createdBy;
    private final LocalDateTime createdAt;
    private final String notes;

    public VisitCreatedEvent(UUID visitId, Long patientId, Long studyId, Long siteId,
                           String visitType, LocalDate visitDate, String status,
                           String createdBy, LocalDateTime createdAt, String notes) {
        this.visitId = visitId;
        this.patientId = patientId;
        this.studyId = studyId;
        this.siteId = siteId;
        this.visitType = visitType;
        this.visitDate = visitDate;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.notes = notes;
    }

    // Getters
    public UUID getVisitId() {
        return visitId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public Long getStudyId() {
        return studyId;
    }

    public Long getSiteId() {
        return siteId;
    }

    public String getVisitType() {
        return visitType;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public String getStatus() {
        return status;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getNotes() {
        return notes;
    }
}
