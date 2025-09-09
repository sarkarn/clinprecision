package com.clinprecision.studydesignservice.model;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class OrganizationStudy {
    private Long id;
    private Long organizationId;
    private Long studyId;
    private Role role;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum Role {
        sponsor, cro, site, vendor, laboratory
    }
}
