package com.clinprecision.clinopsservice.studydesign.documentmgmt.dto;

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
    
    @NotBlank(message = "Approved by user ID is required")
    private Long approvedBy;
    
    private String approvalComments;
    
    private String electronicSignature;  // Required for critical documents
    
    @NotBlank(message = "Approval role is required")
    private String approvalRole;  // e.g., "Principal Investigator", "Medical Monitor"
    
    private String ipAddress;
    private String userAgent;
}



