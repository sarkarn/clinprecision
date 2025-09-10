package com.clinprecision.studydesignservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for FormEntity
 * Represents a clinical research form template
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FormDto {
    
    private Long id;
    private String name;
    private String description;
    private String formType;
    private Long studyId;
    private String status;
    private boolean isActive;
    private boolean isTemplate;
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    
    // Include a list of form versions
    private List<FormVersionDto> versions;
    
    // Include the currently active form version
    private FormVersionDto activeVersion;
}
