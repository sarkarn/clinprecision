package com.clinprecision.clinopsservice.document.command;

import lombok.Builder;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

/**
 * Command to delete a DRAFT document
 * 
 * Business Rules:
 * - Only DRAFT documents can be deleted
 * - CURRENT, SUPERSEDED, ARCHIVED documents cannot be deleted
 * - Deletion is soft delete (marked as deleted in event store)
 * - Regulatory documents require justification
 */
@Value
@Builder
public class DeleteStudyDocumentCommand {
    
    @TargetAggregateIdentifier
    UUID documentId;
    
    String deletedBy;
    String deletionReason;
    String ipAddress;
    String userAgent;
}
