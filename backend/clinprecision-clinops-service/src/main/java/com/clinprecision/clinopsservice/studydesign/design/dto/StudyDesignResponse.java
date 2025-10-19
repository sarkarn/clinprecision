package com.clinprecision.clinopsservice.studydesign.design.dto;

import com.clinprecision.clinopsservice.studydesign.design.arm.dto.StudyArmResponse;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.dto.VisitDefinitionResponse;
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
