package com.clinprecision.adminservice.ui.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for creating a new form template
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateFormTemplateDto {
    
    @NotBlank(message = "Template ID is required")
    private String templateId;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    private String category;
    
    private String version = "1.0";
    
    private String status = "draft";
    
    @NotNull(message = "Fields are required")
    private JsonNode fields;
    
    private String tags;
}