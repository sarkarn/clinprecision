package com.clinprecision.clinopsservice.document.command;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to archive a document
 * 
 * Business Rules:
 * - Document can be archived from any status
 * - Archival is permanent (terminal state)
 * - Document retained per regulatory requirements
 * - Cannot be reactivated after archival
 */
@Value
@Builder
public class ArchiveStudyDocumentCommand {
    
    @TargetAggregateIdentifier
    UUID documentId;
    
    String archivedBy;
    String archivalReason;
    String retentionPolicy;  // e.g., "7 years post-study completion"
    String ipAddress;
    String userAgent;
}



