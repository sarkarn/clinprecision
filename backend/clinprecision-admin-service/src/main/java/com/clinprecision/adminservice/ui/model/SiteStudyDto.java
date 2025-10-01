package com.clinprecision.adminservice.ui.model;


import com.clinprecision.common.entity.SiteStudyEntity;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for SiteStudy.
 */
@Data
public class SiteStudyDto {
    private Long id;
    private Long siteId; // Reference to site ID only to avoid circular references
    private Long studyId;
    private String siteStudyId;
    private SiteStudyEntity.SiteStudyStatus status;
    private LocalDateTime activationDate;
    private LocalDateTime deactivationDate;
    private Integer subjectEnrollmentCap;
    private Integer subjectEnrollmentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor, getters, setters are handled by Lombok
}
