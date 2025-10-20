package com.clinprecision.clinopsservice.studydesign.protocolmgmt.dto;

import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.AmendmentType;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Request DTO for creating a new protocol version
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateVersionRequest {

    private UUID studyAggregateUuid;

    @JsonAlias({"studyId", "legacyStudyId"})
    private Long legacyStudyId;

    @NotBlank(message = "Version number is required")
    @Size(max = 20, message = "Version number cannot exceed 20 characters")
    private String versionNumber;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    private AmendmentType amendmentType;

    @Size(max = 2000, message = "Changes summary cannot exceed 2000 characters")
    private String changesSummary;

    @Size(max = 2000, message = "Impact assessment cannot exceed 2000 characters")
    private String impactAssessment;

    private Boolean requiresRegulatoryApproval;

    private LocalDate submissionDate;

    private String protocolChanges;

    private String icfChanges;

    @NotNull(message = "Creator user ID is required")
    private Long createdBy;

    @AssertTrue(message = "Either study UUID or legacy study ID must be provided")
    public boolean isStudyIdentifierProvided() {
        return studyAggregateUuid != null || legacyStudyId != null;
    }
}



