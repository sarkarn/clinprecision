package com.clinprecision.clinopsservice.document.command;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to supersede a document with a new version
 * 
 * Business Rules:
 * - Current document must be in CURRENT status
 * - New document must exist and be approved
 * - Creates audit trail linking old → new version
 * - Original document becomes SUPERSEDED
 */
@Value
@Builder
public class SupersedeStudyDocumentCommand {
    
    @TargetAggregateIdentifier
    UUID documentId;  // Document being superseded
    
    UUID newDocumentId;  // New version replacing this one
    String supersededBy;
    String supersessionReason;
    String ipAddress;
    String userAgent;
}



