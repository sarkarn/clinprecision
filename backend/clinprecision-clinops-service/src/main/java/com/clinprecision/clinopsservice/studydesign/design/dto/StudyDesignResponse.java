package com.clinprecision.clinopsservice.studydesign.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for complete study design
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyDesignResponse {
    
    private List<StudyArmResponse> arms;
    private List<VisitDefinitionResponse> visits;
    private List<FormAssignmentResponse> formAssignments;
}
