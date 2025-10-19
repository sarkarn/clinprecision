package com.clinprecision.clinopsservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating an existing form template
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpdateFormTemplateDto {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    private String category;
    
    @NotNull(message = "Fields are required")
    private JsonNode fields;
    
    private String tags;
}



