package com.clinprecision.clinopsservice.studyoperation.visit.projector;

import com.clinprecision.clinopsservice.studydesign.build.entity.StudyDatabaseBuildStatus;
import com.clinprecision.clinopsservice.studydesign.build.repository.StudyDatabaseBuildRepository;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.entity.VisitDefinitionEntity;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.repository.VisitDefinitionRepository;
import com.clinprecision.clinopsservice.studyoperation.visit.domain.events.VisitCreatedEvent;
import com.clinprecision.clinopsservice.studyoperation.visit.entity.StudyVisitInstanceEntity;
import com.clinprecision.clinopsservice.studyoperation.visit.repository.StudyVisitInstanceRepository;
import org.axonframework.eventhandling.EventHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Optional;

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
 * TABLE STRATEGY (UPDATED Oct 18, 2025 - Option 1):
 * - Scheduled visits: Created during patient enrollment (visit_id references visit_definitions)
 * - Unscheduled visits: Created via events (visit_id ALSO references visit_definitions)
 *   → Unscheduled visit definitions are created during study build from configuration
 *   → Maintains foreign key integrity and enables form bindings for all visit types
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
    private final VisitDefinitionRepository visitDefinitionRepository;
    
    public VisitProjector(StudyVisitInstanceRepository studyVisitInstanceRepository,
                         StudyDatabaseBuildRepository studyDatabaseBuildRepository,
                         VisitDefinitionRepository visitDefinitionRepository) {
        this.studyVisitInstanceRepository = studyVisitInstanceRepository;
        this.studyDatabaseBuildRepository = studyDatabaseBuildRepository;
        this.visitDefinitionRepository = visitDefinitionRepository;
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

            // CRITICAL FIX (Oct 18, 2025 - Option 1): Lookup visit_id for unscheduled visits
            // Instead of setting visitId=null, lookup the unscheduled visit definition by visit type
            Long visitDefinitionId = lookupUnscheduledVisitDefinitionId(
                event.getStudyId(), 
                event.getVisitType()
            );
            
            if (visitDefinitionId == null) {
                throw new IllegalStateException(
                    String.format("Unscheduled visit definition not found: studyId=%d, visitType=%s. " +
                                 "Ensure study build has completed and created unscheduled visit definitions.",
                                 event.getStudyId(), event.getVisitType())
                );
            }

            // Create unscheduled visit instance from event
            StudyVisitInstanceEntity visit = StudyVisitInstanceEntity.builder()
                .studyId(event.getStudyId())
                .visitId(visitDefinitionId) // ← FIXED: Lookup visit_id instead of NULL
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
    
    /**
     * Lookup unscheduled visit definition ID by study and visit type
     * 
     * OPTION 1 IMPLEMENTATION (Oct 18, 2025):
     * Maps frontend visit type strings to database visit codes and looks up visit_id.
     * This ensures visit_id is never NULL, maintaining foreign key integrity.
     * 
     * @param studyId Study ID
     * @param visitType Visit type string from frontend (e.g., "DISCONTINUATION", "ADVERSE_EVENT")
     * @return Visit definition ID (Long) or null if not found
     */
    private Long lookupUnscheduledVisitDefinitionId(Long studyId, String visitType) {
        // Map frontend visit type to database visit code
        String visitCode = mapVisitTypeToCode(visitType);
        
        logger.debug("Looking up unscheduled visit definition: studyId={}, visitType={}, visitCode={}", 
                    studyId, visitType, visitCode);
        
        Optional<VisitDefinitionEntity> visitDef = visitDefinitionRepository
            .findByStudyIdAndVisitCodeAndIsUnscheduled(studyId, visitCode);
        
        if (visitDef.isPresent()) {
            logger.info("Found unscheduled visit definition: studyId={}, visitCode={}, visitDefId={}", 
                       studyId, visitCode, visitDef.get().getId());
            return visitDef.get().getId();
        } else {
            logger.error("Unscheduled visit definition NOT FOUND: studyId={}, visitType={}, visitCode={}. " +
                        "This means study build did not create unscheduled visit definitions correctly.",
                        studyId, visitType, visitCode);
            return null;
        }
    }
    
    /**
     * Event handler for VisitStatusChangedEvent
     * Updates visit status in study_visit_instances table
     * 
     * @param event VisitStatusChangedEvent containing status change details
     */
    @EventHandler
    public void on(com.clinprecision.clinopsservice.studyoperation.visit.domain.events.VisitStatusChangedEvent event) {
        logger.info("Projecting VisitStatusChangedEvent for aggregateUuid: {}, oldStatus: {}, newStatus: {}", 
                   event.getAggregateUuid(), event.getOldStatus(), event.getNewStatus());
        
        try {
            // Find visit by aggregate UUID
            var visitOpt = studyVisitInstanceRepository.findByAggregateUuid(event.getAggregateUuid());
            
            if (visitOpt.isEmpty()) {
                logger.error("Visit not found for aggregateUuid: {}. Cannot update status.", event.getAggregateUuid());
                return;
            }
            
            StudyVisitInstanceEntity visit = visitOpt.get();
            
            // Update status
            visit.setVisitStatus(event.getNewStatus());
            // Note: updatedBy is tracked in event store, updatedAt is auto-set by @PreUpdate
            
            // Update notes if provided
            if (event.getNotes() != null && !event.getNotes().trim().isEmpty()) {
                String existingNotes = visit.getNotes() != null ? visit.getNotes() : "";
                String updatedNotes = existingNotes.isEmpty() 
                    ? event.getNotes() 
                    : existingNotes + "\n[Status Change by user " + event.getUpdatedBy() + "] " + event.getNotes();
                visit.setNotes(updatedNotes);
            }
            
            // Save updated visit (updatedAt will be auto-set by @PreUpdate)
            studyVisitInstanceRepository.save(visit);
            
            logger.info("Visit status updated successfully: id={}, aggregateUuid={}, newStatus={}", 
                       visit.getId(), event.getAggregateUuid(), event.getNewStatus());
            
        } catch (Exception e) {
            logger.error("Error projecting VisitStatusChangedEvent for aggregateUuid: {}", 
                        event.getAggregateUuid(), e);
            throw new RuntimeException("Failed to project VisitStatusChangedEvent", e);
        }
    }

    /**
     * Map frontend visit type strings to database visit codes
     * 
     * Frontend uses descriptive names like "DISCONTINUATION"
     * Database uses standardized codes like "EARLY_TERM"
     * 
     * @param visitType Frontend visit type string
     * @return Database visit code
     */
    private String mapVisitTypeToCode(String visitType) {
        if (visitType == null) {
            return "UNSCHED_SAFETY"; // Default fallback
        }
        
        // Map frontend types to database codes
        return switch (visitType.toUpperCase()) {
            case "DISCONTINUATION", "EARLY_TERMINATION" -> "EARLY_TERM";
            case "ADVERSE_EVENT", "AE" -> "AE_VISIT";
            case "SAFETY", "UNSCHEDULED_SAFETY" -> "UNSCHED_SAFETY";
            case "PROTOCOL_DEVIATION", "DEVIATION" -> "PROTO_DEV";
            case "FOLLOW_UP", "UNSCHEDULED_FOLLOWUP" -> "UNSCHED_FU";
            default -> {
                logger.warn("Unknown visit type '{}', using UNSCHED_SAFETY as fallback", visitType);
                yield "UNSCHED_SAFETY";
            }
        };
    }
}
