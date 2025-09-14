package com.clinprecision.adminservice.ui.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for form template statistics response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FormTemplateStatsDto {
    
    private Long totalTemplates;
    private Long draftTemplates;
    private Long publishedTemplates;
    private Long archivedTemplates;
    private Long totalUsageCount;
}