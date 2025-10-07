package com.clinprecision.clinopsservice.studydesign.projection;

import com.clinprecision.clinopsservice.study.event.StudyCreatedEvent;
import com.clinprecision.clinopsservice.studydesign.service.StudyDesignAutoInitializationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    private final StudyDesignAutoInitializationService autoInitializationService;

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
        
        autoInitializationService.ensureStudyDesignExistsByUuid(event.getStudyAggregateUuid())
            .thenAccept(existingId -> log.debug("StudyDesign initialization ensured for study: {} (design id: {})",
                event.getStudyAggregateUuid(), existingId))
            .exceptionally(ex -> {
                log.error("Failed to auto-initialize StudyDesign for study: {}", event.getStudyAggregateUuid(), ex);
                return null;
            });
    }
}
