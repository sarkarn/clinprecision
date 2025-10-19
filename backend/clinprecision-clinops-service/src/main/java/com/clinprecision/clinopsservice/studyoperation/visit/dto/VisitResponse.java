package com.clinprecision.clinopsservice.visit.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for visit operations
 */
public class VisitResponse {

    private UUID visitId;
    private Long patientId;
    private Long studyId;
    private Long siteId;
    private String visitType;
    private LocalDate visitDate;
    private String status;
    private String createdBy;
    private LocalDateTime createdAt;
    private String notes;

    // Default constructor
    public VisitResponse() {
    }

    // Constructor with all fields
    public VisitResponse(UUID visitId, Long patientId, Long studyId, Long siteId,
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
