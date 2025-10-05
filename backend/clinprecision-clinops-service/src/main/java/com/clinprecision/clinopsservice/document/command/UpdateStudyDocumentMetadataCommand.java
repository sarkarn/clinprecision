package com.clinprecision.clinopsservice.document.command;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to update document metadata (DRAFT only)
 * 
 * Business Rules:
 * - Only DRAFT documents can be updated
 * - Cannot change document type or file after approval
 * - Updates tracked in audit trail
 */
@Value
@Builder
public class UpdateStudyDocumentMetadataCommand {
    
    @TargetAggregateIdentifier
    UUID documentId;
    
    String newDocumentName;
    String newDescription;
    String newVersion;
    String updatedBy;
    String updateReason;
    String ipAddress;
    String userAgent;
}



