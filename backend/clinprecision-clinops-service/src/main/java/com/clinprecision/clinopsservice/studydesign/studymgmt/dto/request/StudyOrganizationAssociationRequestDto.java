package com.clinprecision.clinopsservice.studydesign.studymgmt.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO representing an organization association within a study create/update payload.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyOrganizationAssociationRequestDto {

    private Long organizationId;
    private String role;
    private Boolean isPrimary;
}
