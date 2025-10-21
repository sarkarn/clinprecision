package com.clinprecision.clinopsservice.studyoperation.visit.dto;

import com.clinprecision.clinopsservice.studyoperation.visit.entity.VisitEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for visit data transfer
 * Used for converting between entity and API responses
 */
public class VisitDto {

    private Long id;           // Long ID from study_visit_instances.id (primary key)
    private UUID visitId;      // UUID (generated or from aggregateUuid for backward compatibility)
    private Long patientId;
    private Long studyId;
    private Long siteId;
    private String visitType;
    private String visitName; // Name from visit_definitions (e.g., "Screening", "Week 4 Visit")
    private LocalDate visitDate;
    private String status;
    private String createdBy;
    private LocalDateTime createdAt;
    private String notes;
    
    // Form completion tracking
    private Integer totalForms;           // Total number of forms for this visit
    private Integer completedForms;       // Number of forms with status=SUBMITTED
    private Double completionPercentage;  // Calculated: (completedForms / totalForms) * 100

    // Default constructor
    public VisitDto() {
    }

    // Static factory method to create DTO from Entity
    public static VisitDto fromEntity(VisitEntity entity) {
        VisitDto dto = new VisitDto();
        dto.setVisitId(entity.getVisitId());
        dto.setPatientId(entity.getPatientId());
        dto.setStudyId(entity.getStudyId());
        dto.setSiteId(entity.getSiteId());
        dto.setVisitType(entity.getVisitType());
        dto.setVisitDate(entity.getVisitDate());
        dto.setStatus(entity.getStatus());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setNotes(entity.getNotes());
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getVisitName() {
        return visitName;
    }

    public void setVisitName(String visitName) {
        this.visitName = visitName;
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
    
    public Integer getTotalForms() {
        return totalForms;
    }

    public void setTotalForms(Integer totalForms) {
        this.totalForms = totalForms;
    }

    public Integer getCompletedForms() {
        return completedForms;
    }

    public void setCompletedForms(Integer completedForms) {
        this.completedForms = completedForms;
    }

    public Double getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(Double completionPercentage) {
        this.completionPercentage = completionPercentage;
    }
}
