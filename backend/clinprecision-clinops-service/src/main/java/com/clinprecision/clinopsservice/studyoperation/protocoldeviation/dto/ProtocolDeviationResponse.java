package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.dto;

import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationSeverity;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationStatus;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for protocol deviation responses
 * Maps from ProtocolDeviationEntity to API response format
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProtocolDeviationResponse {

    private Long id;
    private Long patientId;
    private Long studyId;
    private Long studySiteId;
    private Long visitInstanceId;
    private String deviationNumber;
    private DeviationType deviationType;
    private DeviationSeverity severity;
    private DeviationStatus deviationStatus;
    private String title;
    private String description;
    private String protocolSection;
    private String expectedProcedure;
    private String actualProcedure;
    private LocalDate deviationDate;
    private LocalDate detectionDate;
    private String rootCause;
    private String immediateAction;
    private String correctiveAction;
    private String preventiveAction;
    private Boolean requiresReporting;
    private Boolean reportedToIrb;
    private LocalDate irbReportDate;
    private Boolean reportedToSponsor;
    private LocalDate sponsorReportDate;
    private Long detectedBy;
    private Long reviewedBy;
    private Long resolvedBy;
    private LocalDate resolvedDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
