package com.clinprecision.clinopsservice.document.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for updating document metadata
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetadataUpdateRequest {
    
    private String newDocumentName;
    private String newDescription;
    private String newVersion;
    
    @NotBlank(message = "Updated by username is required")
    private String updatedBy;
    
    private String updateReason;
    
    private String ipAddress;
    private String userAgent;
}



