package com.clinprecision.clinopsservice.studydesign.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for visit definition
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitDefinitionResponse {
    
    private UUID visitId;
    private String name;
    private String description;
    private Integer timepoint;
    private Integer windowBefore;
    private Integer windowAfter;
    private String visitType;
    private Boolean isRequired;
    private Integer sequenceNumber;
    private UUID armId;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
