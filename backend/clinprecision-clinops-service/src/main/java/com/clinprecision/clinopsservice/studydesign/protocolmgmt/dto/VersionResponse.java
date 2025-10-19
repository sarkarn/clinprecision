package com.clinprecision.clinopsservice.studydesign.protocolmgmt.dto;

import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.AmendmentType;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for protocol version queries
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VersionResponse {

    private Long id;
    private UUID aggregateUuid;
    private UUID studyAggregateUuid;
    private String versionNumber;
    private VersionStatus status;
    private AmendmentType amendmentType;
    private String description;
    private String changesSummary;
    private String impactAssessment;
    private Boolean requiresRegulatoryApproval;
    private LocalDate submissionDate;
    private LocalDate approvalDate;
    private LocalDate effectiveDate;
    private String notes;
    private String protocolChanges;
    private String icfChanges;
    private Long approvedBy;
    private String approvalComments;
    private UUID previousActiveVersionUuid;
    private String withdrawalReason;
    private Long withdrawnBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}



