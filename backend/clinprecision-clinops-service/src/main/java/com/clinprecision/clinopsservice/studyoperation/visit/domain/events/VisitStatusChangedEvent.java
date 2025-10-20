package com.clinprecision.clinopsservice.studyoperation.visit.domain.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event indicating visit status has changed
 * 
 * <p>Emitted when visit transitions between statuses.</p>
 * 
 * <p><b>Status Transitions:</b></p>
 * <ul>
 *   <li>SCHEDULED → IN_PROGRESS: CRC clicks "Start Visit"</li>
 *   <li>IN_PROGRESS → COMPLETED: All required forms completed</li>
 *   <li>SCHEDULED → MISSED: Visit window passed</li>
 *   <li>SCHEDULED → CANCELLED: Visit no longer needed</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VisitStatusChangedEvent {
    
    private String aggregateUuid; // Visit aggregate UUID
    
    private String oldStatus; // Previous status
    
    private String newStatus; // New status
    
    private Long updatedBy; // User ID who initiated the change
    
    private String notes; // Optional reason/notes
    
    private Long timestamp; // Event timestamp
}
