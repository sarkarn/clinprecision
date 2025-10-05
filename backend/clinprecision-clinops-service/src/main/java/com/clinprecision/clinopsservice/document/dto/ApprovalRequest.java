package com.clinprecision.clinopsservice.document.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for approving a document
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequest {
    
    @NotBlank(message = "Approved by username is required")
    private String approvedBy;
    
    private String approvalComments;
    
    private String electronicSignature;  // Required for critical documents
    
    @NotBlank(message = "Approval role is required")
    private String approvalRole;  // e.g., "Principal Investigator", "Medical Monitor"
    
    private String ipAddress;
    private String userAgent;
}



