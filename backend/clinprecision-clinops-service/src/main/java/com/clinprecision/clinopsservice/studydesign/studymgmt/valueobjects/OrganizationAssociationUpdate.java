package com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Legacy value object retained to deserialize historic events recorded before renaming
 * to {@link StudyOrganizationAssociation}.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationAssociationUpdate {

    private Long organizationId;
    private String role;
    private Boolean isPrimary;
}
