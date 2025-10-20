package com.clinprecision.clinopsservice.studydesign.studymgmt.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO representing a study-to-organization association.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyOrganizationAssociationResponseDto {

    private Long organizationId;
    private String role;
    private Boolean isPrimary;
}
