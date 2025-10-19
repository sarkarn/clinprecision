package com.clinprecision.clinopsservice.document.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for archiving a document
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchiveRequest {
    
    @NotBlank(message = "Archived by user ID is required")
    private Long archivedBy;
    
    private String archivalReason;
    
    private String retentionPolicy;  // e.g., "7 years", "10 years"
    
    private String ipAddress;
    private String userAgent;
}



