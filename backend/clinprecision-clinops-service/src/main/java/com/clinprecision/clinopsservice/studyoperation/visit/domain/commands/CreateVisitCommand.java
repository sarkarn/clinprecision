package com.clinprecision.clinopsservice.studyoperation.visit.domain.commands;

import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Command to create a new unscheduled visit
 * 
 * Unscheduled visits are created for:
 * - Screening assessments (after REGISTERED → SCREENING status change)
 * - Enrollment visits (after SCREENING → ENROLLED status change)
 * - Discontinuation visits (when patient withdraws)
 * - Adverse event visits (unplanned safety assessments)
 */
public class CreateVisitCommand {

    @TargetAggregateIdentifier
    private final UUID visitId;
    
    private final Long patientId;
    private final Long studyId;
    private final Long siteId;
    private final String visitType; // SCREENING, ENROLLMENT, DISCONTINUATION, ADVERSE_EVENT
    private final LocalDate visitDate;
    private final String status; // SCHEDULED, COMPLETED, CANCELLED
    private final Long createdBy; // User ID who is creating the visit
    private final LocalDateTime createdAt;
    private final String notes;

    public CreateVisitCommand(UUID visitId, Long patientId, Long studyId, Long siteId, 
                            String visitType, LocalDate visitDate, String status, 
                            Long createdBy, String notes) {
        this.visitId = visitId;
        this.patientId = patientId;
        this.studyId = studyId;
        this.siteId = siteId;
        this.visitType = visitType;
        this.visitDate = visitDate;
        this.status = status;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
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

    public Long getCreatedBy() {
        return createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getNotes() {
        return notes;
    }
}
