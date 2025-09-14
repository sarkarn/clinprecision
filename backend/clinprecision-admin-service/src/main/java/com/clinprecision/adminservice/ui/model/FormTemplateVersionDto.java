package com.clinprecision.adminservice.ui.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for form template version data transfer
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FormTemplateVersionDto {
    
    private Long id;
    private Long templateId;
    private String version;
    private Instant versionDate;
    private Long createdBy;
    private String createdByName;
    private String versionNotes;
    private JsonNode fieldsSnapshot;
}