package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.dto;

import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationSeverity;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationStatus;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for creating a new protocol deviation
 * Used in POST /api/v1/deviations endpoint
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDeviationRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Study ID is required")
    private Long studyId;

    private Long studySiteId;

    private Long visitInstanceId;

    @NotNull(message = "Deviation type is required")
    private DeviationType deviationType;

    @NotNull(message = "Severity is required")
    private DeviationSeverity severity;

    @NotNull(message = "Title is required")
    private String title;

    private String description;

    private String protocolSection;

    private String expectedProcedure;

    private String actualProcedure;

    private LocalDate deviationDate;

    private String rootCause;

    private String immediateAction;

    private String correctiveAction;

    private String preventiveAction;

    @NotNull(message = "Detected by user ID is required")
    private Long detectedBy;
}
