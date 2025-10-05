package com.clinprecision.clinopsservice.document.command;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to approve a document (DRAFT → CURRENT)
 * 
 * Business Rules:
 * - Document must be in DRAFT status
 * - User must have approval authority
 * - E-signature required for critical documents
 * - Approval makes document immutable
 */
@Value
@Builder
public class ApproveStudyDocumentCommand {
    
    @TargetAggregateIdentifier
    UUID documentId;
    
    String approvedBy;
    String approvalComments;
    String electronicSignature;  // For 21 CFR Part 11 compliance
    String approvalRole;         // Role of approver (e.g., "PI", "IRB_CHAIR")
    String ipAddress;
    String userAgent;
}



