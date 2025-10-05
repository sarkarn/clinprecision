package com.clinprecision.clinopsservice.document.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

/**
 * Event: Study Document Approved
 * 
 * Triggered when document transitions from DRAFT to CURRENT
 * Makes document immutable and available for regulatory use
 */
@Value
@Builder
public class StudyDocumentApprovedEvent {
    
    UUID documentId;
    Long approvedBy;
    Instant approvedAt;
    String approvalComments;
    String electronicSignature;
    String approvalRole;
    String ipAddress;
    String userAgent;
}



