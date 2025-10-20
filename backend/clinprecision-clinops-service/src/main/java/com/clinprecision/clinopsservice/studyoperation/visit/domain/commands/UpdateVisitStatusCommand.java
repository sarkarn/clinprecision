package com.clinprecision.clinopsservice.studyoperation.visit.domain.commands;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

/**
 * Command to update visit status
 * 
 * <p>Used when a visit transitions between statuses:</p>
 * <ul>
 *   <li>SCHEDULED → IN_PROGRESS (when CRC clicks "Start Visit")</li>
 *   <li>IN_PROGRESS → COMPLETED (when all required forms completed)</li>
 *   <li>SCHEDULED → MISSED (when visit window passed without completion)</li>
 *   <li>SCHEDULED → CANCELLED (when visit no longer needed)</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateVisitStatusCommand {
    
    @TargetAggregateIdentifier
    private String aggregateUuid; // Visit aggregate UUID
    
    private String newStatus; // SCHEDULED, IN_PROGRESS, COMPLETED, MISSED, CANCELLED
    
    private Long updatedBy; // User ID who initiated the status change
    
    private String notes; // Optional reason/notes for status change
}
