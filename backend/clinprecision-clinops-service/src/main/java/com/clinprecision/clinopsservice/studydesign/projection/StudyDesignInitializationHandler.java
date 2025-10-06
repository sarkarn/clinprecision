package com.clinprecision.clinopsservice.studydesign.projection;

import com.clinprecision.clinopsservice.study.event.StudyCreatedEvent;
import com.clinprecision.clinopsservice.studydesign.domain.commands.InitializeStudyDesignCommand;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Component;

/**
 * Handles automatic StudyDesign initialization when a Study is created
 * 
 * This ensures that every Study has a corresponding StudyDesignAggregate
 * in the event store, allowing study design operations (arms, visits, forms)
 * to work immediately after study creation.
 * 
 * Pattern: Saga-like coordination between aggregates
 * - Listens to StudyCreatedEvent
 * - Automatically dispatches InitializeStudyDesignCommand
 * - Uses the same studyAggregateUuid for correlation
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StudyDesignInitializationHandler {

    private final CommandGateway commandGateway;

    /**
     * Automatically initialize StudyDesignAggregate when a Study is created
     * 
     * This handler ensures that study design operations are available
     * immediately after study creation without requiring separate initialization.
     * 
     * @param event The StudyCreatedEvent from the StudyAggregate
     */
    @EventHandler
    public void on(StudyCreatedEvent event) {
        log.info("Auto-initializing StudyDesign for study: {} (UUID: {})", 
            event.getName(), event.getStudyAggregateUuid());
        
        try {
            // Create command to initialize the StudyDesignAggregate
            // Note: StudyCreatedEvent.userId is UUID, but InitializeStudyDesignCommand.createdBy expects Long
            // For now, use a default value (1L for admin, or 0L for system)
            // TODO: Add proper user ID mapping when user management is implemented
            Long createdByUserId = 1L; // Default to admin user
            
            InitializeStudyDesignCommand command = InitializeStudyDesignCommand.builder()
                .studyDesignId(event.getStudyAggregateUuid()) // Use same UUID as study
                .studyAggregateUuid(event.getStudyAggregateUuid())
                .studyName(event.getName())
                .createdBy(createdByUserId)
                .build();
            
            // Dispatch command asynchronously (fire-and-forget pattern)
            commandGateway.send(command)
                .exceptionally(ex -> {
                    log.error("Failed to auto-initialize StudyDesign for study: {}", 
                        event.getStudyAggregateUuid(), ex);
                    // Don't re-throw - study creation should succeed even if design init fails
                    // Admin can manually initialize later if needed
                    return null;
                });
            
            log.debug("StudyDesign initialization command sent for study: {}", 
                event.getStudyAggregateUuid());
            
        } catch (Exception ex) {
            log.error("Error dispatching StudyDesign initialization command for study: {}", 
                event.getStudyAggregateUuid(), ex);
            // Don't re-throw - allow study creation to complete
        }
    }
}
