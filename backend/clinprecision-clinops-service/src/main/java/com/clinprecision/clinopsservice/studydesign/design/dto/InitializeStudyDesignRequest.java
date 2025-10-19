package com.clinprecision.clinopsservice.studydesign.design.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for initializing a study design
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InitializeStudyDesignRequest {
    
    private UUID studyAggregateUuid;
    private UUID studyDesignId;
    private String studyName;
    private Long legacyStudyId;
    private Long createdBy;
}
