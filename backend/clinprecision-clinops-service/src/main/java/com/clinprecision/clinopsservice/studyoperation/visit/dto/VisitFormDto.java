package com.clinprecision.clinopsservice.visit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for form information associated with a visit
 * Returns form metadata along with completion status
 * 
 * Used by GET /api/v1/visits/{visitInstanceId}/forms endpoint
 * Resolves Gap #2: Visit-Form Association
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitFormDto {

    /**
     * Form definition ID (from form_definitions table)
     */
    private Long formId;
    
    /**
     * Form name for display (e.g., "Demographics", "Vital Signs")
     */
    private String formName;
    
    /**
     * Form type/category (e.g., "DEMOGRAPHICS", "VITAL_SIGNS", "ADVERSE_EVENT")
     */
    private String formType;
    
    /**
     * Description of the form
     */
    private String description;
    
    /**
     * Whether this form is required for visit completion
     */
    private Boolean isRequired;
    
    /**
     * Display order within the visit (1, 2, 3, etc.)
     */
    private Integer displayOrder;
    
    /**
     * Form completion status: "not_started", "in_progress", "complete"
     */
    private String completionStatus;
    
    /**
     * Last time this form was updated for this visit
     */
    private LocalDateTime lastUpdated;
    
    /**
     * User ID who last updated the form
     */
    private Long updatedBy;
    
    /**
     * Instructions for completing this form at this visit
     */
    private String instructions;
    
    /**
     * Number of fields in the form
     */
    private Integer fieldCount;
    
    /**
     * Number of completed fields (if form is in progress)
     */
    private Integer completedFieldCount;
}
