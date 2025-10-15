package com.clinprecision.clinopsservice.visit.projector;

import com.clinprecision.clinopsservice.visit.domain.events.VisitCreatedEvent;
import com.clinprecision.clinopsservice.visit.entity.StudyVisitInstanceEntity;
import com.clinprecision.clinopsservice.visit.repository.StudyVisitInstanceRepository;
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
 * - Query side: This projector builds read model (study_visit_instances table)
 * 
 * USAGE CONTEXT:
 * This projector processes VisitCreatedEvent to:
 * - Create unscheduled visit instances in study_visit_instances table
 * - Enable unified view of scheduled + unscheduled visits
 * - Support form collection workflow (visitId available for forms)
 * 
 * ARCHITECTURE (October 2025):
 * Status Change → Visit Creation → Event Emitted → This Projector → Read Model Updated
 * 
 * TABLE STRATEGY:
 * - Scheduled visits: Created during patient enrollment (visit_id references visit_definitions)
 * - Unscheduled visits: Created via events (visit_id = NULL, aggregate_uuid stores event UUID)
 * 
 * Future Events (to be added):
 * - VisitCompletedEvent (when visit status changes to COMPLETED)
 * - VisitCancelledEvent (when visit is cancelled)
 * - VisitRescheduledEvent (when visit date changes)
 */
@Component
public class VisitProjector {
    
    private static final Logger logger = LoggerFactory.getLogger(VisitProjector.class);
    
    private final StudyVisitInstanceRepository studyVisitInstanceRepository;
    
    public VisitProjector(StudyVisitInstanceRepository studyVisitInstanceRepository) {
        this.studyVisitInstanceRepository = studyVisitInstanceRepository;
    }
    
    /**
     * Event handler for VisitCreatedEvent
     * Creates unscheduled visit record in study_visit_instances table
     * 
     * @param event VisitCreatedEvent containing visit details
     */
    @EventHandler
    public void on(VisitCreatedEvent event) {
        logger.info("Projecting VisitCreatedEvent for visitId: {}, patientId: {}, visitType: {}", 
                   event.getVisitId(), event.getPatientId(), event.getVisitType());
        
        try {
            // Check for idempotency - avoid duplicate projections
            var existingVisit = studyVisitInstanceRepository.findByAggregateUuid(event.getVisitId().toString());
            if (existingVisit.isPresent()) {
                logger.info("Visit instance already exists (idempotent replay): visitId={}", event.getVisitId());
                return;
            }

            // Create unscheduled visit instance from event
            StudyVisitInstanceEntity visit = StudyVisitInstanceEntity.builder()
                .studyId(event.getStudyId())
                .visitId(null) // NULL for unscheduled visits (no visit definition)
                .subjectId(event.getPatientId())
                .siteId(event.getSiteId())
                .visitDate(event.getVisitDate())
                .visitStatus(event.getStatus())
                .aggregateUuid(event.getVisitId().toString()) // Store event UUID
                .notes(event.getNotes())
                .createdBy(event.getCreatedBy()) // User ID who created the visit
                .build();
            
            // Save to read model
            studyVisitInstanceRepository.save(visit);
            
            logger.info("Unscheduled visit instance created successfully: visitId={}, subjectId={}, visitType={}", 
                       event.getVisitId(), event.getPatientId(), event.getVisitType());
            
        } catch (Exception e) {
            logger.error("Error projecting VisitCreatedEvent for visitId: {}", event.getVisitId(), e);
            throw new RuntimeException("Failed to project VisitCreatedEvent", e);
        }
    }
}
