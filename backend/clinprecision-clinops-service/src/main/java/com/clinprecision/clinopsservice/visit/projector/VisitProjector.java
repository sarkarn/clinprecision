package com.clinprecision.clinopsservice.visit.projector;

import com.clinprecision.clinopsservice.studydatabase.entity.StudyDatabaseBuildStatus;
import com.clinprecision.clinopsservice.studydatabase.repository.StudyDatabaseBuildRepository;
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
    private final StudyDatabaseBuildRepository studyDatabaseBuildRepository;
    
    public VisitProjector(StudyVisitInstanceRepository studyVisitInstanceRepository,
                         StudyDatabaseBuildRepository studyDatabaseBuildRepository) {
        this.studyVisitInstanceRepository = studyVisitInstanceRepository;
        this.studyDatabaseBuildRepository = studyDatabaseBuildRepository;
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

            // CRITICAL FIX (Oct 17, 2025): Get active build_id for study
            // This is required for visit forms to be associated with correct protocol version
            Long buildId = getActiveBuildIdForStudy(event.getStudyId());
            
            if (buildId == null) {
                logger.warn("No COMPLETED build found for study {}. Visit will be created without build_id. " +
                           "Forms may not be available until study build completes.", event.getStudyId());
            }

            // Create unscheduled visit instance from event
            StudyVisitInstanceEntity visit = StudyVisitInstanceEntity.builder()
                .studyId(event.getStudyId())
                .visitId(null) // NULL for unscheduled visits (no visit definition)
                .subjectId(event.getPatientId())
                .siteId(event.getSiteId())
                .visitDate(event.getVisitDate())
                .visitStatus(event.getStatus())
                .buildId(buildId) // ← CRITICAL FIX: Set build_id for protocol version tracking
                .aggregateUuid(event.getVisitId().toString()) // Store event UUID
                .notes(event.getNotes())
                .createdBy(event.getCreatedBy()) // User ID who created the visit
                .build();
            
            // Save to read model
            studyVisitInstanceRepository.save(visit);
            
            logger.info("Unscheduled visit instance created successfully: visitId={}, subjectId={}, visitType={}, buildId={}", 
                       event.getVisitId(), event.getPatientId(), event.getVisitType(), buildId);
            
        } catch (Exception e) {
            logger.error("Error projecting VisitCreatedEvent for visitId: {}", event.getVisitId(), e);
            throw new RuntimeException("Failed to project VisitCreatedEvent", e);
        }
    }
    
    /**
     * Get the active (most recent COMPLETED) build ID for a study
     * This is used to associate visits with the correct protocol version
     * 
     * @param studyId Study ID
     * @return Build ID (Long) of the most recent COMPLETED build, or null if no completed builds exist
     */
    private Long getActiveBuildIdForStudy(Long studyId) {
        logger.debug("Fetching active build ID for study: {}", studyId);
        
        return studyDatabaseBuildRepository
            .findTopByStudyIdAndBuildStatusOrderByBuildEndTimeDesc(studyId, StudyDatabaseBuildStatus.COMPLETED)
            .map(build -> {
                logger.info("Found active build for study {}: buildId={}, buildRequestId={}", 
                           studyId, build.getId(), build.getBuildRequestId());
                return build.getId();
            })
            .orElse(null);
    }
}
