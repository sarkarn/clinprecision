package com.clinprecision.clinopsservice.document.command;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to record document download activity
 * 
 * Regulatory Compliance:
 * - All document access is tracked for 21 CFR Part 11
 * - Records who, when, from where
 */
@Value
@Builder
public class DownloadStudyDocumentCommand {
    
    @TargetAggregateIdentifier
    UUID documentId;
    
    String downloadedBy;
    String ipAddress;
    String userAgent;
    String reason;
}



