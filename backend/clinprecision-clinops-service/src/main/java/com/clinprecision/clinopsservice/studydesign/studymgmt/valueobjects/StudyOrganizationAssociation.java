package com.clinprecision.clinopsservice.studydesign.studymgmt.valueobjects;

import lombok.Builder;
import lombok.Value;

/**
 * Domain value object representing an association between a study and an organization.
 */
@Value
@Builder
public class StudyOrganizationAssociation {

    Long organizationId;
    String role;
    Boolean isPrimary;
}
