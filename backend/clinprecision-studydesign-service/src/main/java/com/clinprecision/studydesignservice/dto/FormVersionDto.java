package com.clinprecision.studydesignservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for FormVersionEntity
 * Represents a specific version of a form with its schema and metadata
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FormVersionDto {
    
    private Long id;
    private Long formId;
    private String versionNumber;
    private String formSchema;
    private String name;
    private String description;
    private boolean isActive;
    private boolean isPublished;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
}
