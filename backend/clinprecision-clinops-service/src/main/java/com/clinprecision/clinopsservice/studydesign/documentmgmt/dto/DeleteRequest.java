package com.clinprecision.clinopsservice.studydesign.documentmgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for deleting a document
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeleteRequest {
    
    @NotBlank(message = "Deleted by user ID is required")
    private Long deletedBy;
    
    private String deletionReason;
    
    private String ipAddress;
    private String userAgent;
}



