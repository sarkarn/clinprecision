package com.clinprecision.adminservice.ui.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * DTO for form template data transfer
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FormTemplateDto {
    
    private Long id;
    private String templateId;
    private String name;
    private String description;
    private String category;
    private String version;
    private Boolean isLatestVersion;
    private String status;
    private JsonNode fields;
    private String tags;
    private Integer usageCount;
    private Long createdBy;
    private String createdByName;
    private Instant createdAt;
    private Instant updatedAt;
    private List<FormTemplateVersionDto> versions;
}