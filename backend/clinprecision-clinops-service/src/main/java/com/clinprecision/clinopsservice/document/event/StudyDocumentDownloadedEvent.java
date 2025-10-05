package com.clinprecision.clinopsservice.document.event;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

/**
 * Event: Study Document Downloaded
 * 
 * Triggered when a document is accessed/downloaded
 * Regulatory compliance: 21 CFR Part 11 requires access tracking
 */
@Value
@Builder
public class StudyDocumentDownloadedEvent {
    
    UUID documentId;
    String downloadedBy;
    Instant downloadedAt;
    String ipAddress;
    String userAgent;
    String reason;
}



