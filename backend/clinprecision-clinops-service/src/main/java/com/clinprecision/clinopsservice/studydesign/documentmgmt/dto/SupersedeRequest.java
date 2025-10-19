package com.clinprecision.clinopsservice.studydesign.documentmgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Request DTO for superseding a document
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupersedeRequest {
    
    @NotNull(message = "New document ID is required")
    private UUID newDocumentId;  // The document that replaces the current one
    
    @NotBlank(message = "Superseded by user ID is required")
    private Long supersededBy;
    
    private String supersessionReason;
    
    private String ipAddress;
    private String userAgent;
}



