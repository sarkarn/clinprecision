package com.clinprecision.clinopsservice.protocolversion.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating version details
 * Only editable fields can be updated
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateVersionRequest {

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @Size(max = 2000, message = "Changes summary cannot exceed 2000 characters")
    private String changesSummary;

    @Size(max = 2000, message = "Impact assessment cannot exceed 2000 characters")
    private String impactAssessment;

    private String notes;

    private String protocolChanges;

    private String icfChanges;

    private Long updatedBy;
}
