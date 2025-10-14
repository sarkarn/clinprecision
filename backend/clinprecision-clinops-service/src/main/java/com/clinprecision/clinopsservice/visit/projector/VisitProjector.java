package com.clinprecision.clinopsservice.visit.projector;

import com.clinprecision.clinopsservice.visit.domain.events.VisitCreatedEvent;
import com.clinprecision.clinopsservice.visit.entity.VisitEntity;
import com.clinprecision.clinopsservice.visit.repository.VisitRepository;
import org.axonframework.eventhandling.EventHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Visit Projector - Event handler for visit domain events
 * 
 * PURPOSE:
 * Transforms domain events into read model projections for efficient querying.
 * Part of CQRS pattern:
 * - Command side: VisitAggregate emits events
 * - Query side: This projector builds read model (visit table)
 * 
 * USAGE CONTEXT:
 * This projector processes VisitCreatedEvent to:
 * - Create denormalized read model for visit queries
 * - Enable efficient lookups (patient visits, study visits, etc.)
 * - Support form collection workflow (visitId available for forms)
 * 
 * ARCHITECTURE (October 2025):
 * Status Change → Visit Creation → Event Emitted → This Projector → Read Model Updated
 * 
 * Future Events (to be added):
 * - VisitCompletedEvent (when visit status changes to COMPLETED)
 * - VisitCancelledEvent (when visit is cancelled)
 * - VisitRescheduledEvent (when visit date changes)
 */
@Component
public class VisitProjector {
    
    private static final Logger logger = LoggerFactory.getLogger(VisitProjector.class);
    
    private final VisitRepository visitRepository;
    
    public VisitProjector(VisitRepository visitRepository) {
        this.visitRepository = visitRepository;
    }
    
    /**
     * Event handler for VisitCreatedEvent
     * Creates visit record in read model (visit table)
     * 
     * @param event VisitCreatedEvent containing visit details
     */
    @EventHandler
    public void on(VisitCreatedEvent event) {
        logger.info("Projecting VisitCreatedEvent for visitId: {}, patientId: {}, visitType: {}", 
                   event.getVisitId(), event.getPatientId(), event.getVisitType());
        
        try {
            // Create visit entity from event
            VisitEntity visit = new VisitEntity();
            visit.setVisitId(event.getVisitId());
            visit.setPatientId(event.getPatientId());
            visit.setStudyId(event.getStudyId());
            visit.setSiteId(event.getSiteId());
            visit.setVisitType(event.getVisitType());
            visit.setVisitDate(event.getVisitDate());
            visit.setStatus(event.getStatus());
            visit.setCreatedBy(event.getCreatedBy());
            visit.setCreatedAt(event.getCreatedAt());
            visit.setNotes(event.getNotes());
            
            // Save to read model
            visitRepository.save(visit);
            
            logger.info("Visit read model created successfully for visitId: {}", event.getVisitId());
            
        } catch (Exception e) {
            logger.error("Error projecting VisitCreatedEvent for visitId: {}", event.getVisitId(), e);
            throw new RuntimeException("Failed to project VisitCreatedEvent", e);
        }
    }
}
