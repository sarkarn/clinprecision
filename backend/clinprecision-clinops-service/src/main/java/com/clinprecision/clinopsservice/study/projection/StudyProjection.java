package com.clinprecision.clinopsservice.study.projection;

import com.clinprecision.clinopsservice.study.event.*;
import com.clinprecision.common.entity.clinops.StudyEntity;
import com.clinprecision.common.entity.clinops.StudyStatusEntity;
import com.clinprecision.clinopsservice.repository.StudyRepository;
import com.clinprecision.clinopsservice.repository.StudyStatusRepository;
import com.clinprecision.clinopsservice.repository.RegulatoryStatusRepository;
import com.clinprecision.clinopsservice.repository.StudyPhaseRepository;
import org.axonframework.eventhandling.EventHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Study Projection - Event Listener
 * Updates the read model (StudyEntity) when domain events occur
 * 
 * Pattern: CQRS Read Model
 * - Listens to domain events from event store
 * - Updates denormalized read model for query optimization
 * - Handles eventual consistency
 * 
 * Note: All @EventHandler methods are automatically invoked by Axon Framework
 * when events are persisted to the event store
 */
@Component
public class StudyProjection {
    
    private static final Logger logger = LoggerFactory.getLogger(StudyProjection.class);
    
    private final StudyRepository studyRepository;
    private final StudyStatusRepository studyStatusRepository;
    private final RegulatoryStatusRepository regulatoryStatusRepository;
    private final StudyPhaseRepository studyPhaseRepository;
    
    public StudyProjection(StudyRepository studyRepository,
                          StudyStatusRepository studyStatusRepository,
                          RegulatoryStatusRepository regulatoryStatusRepository,
                          StudyPhaseRepository studyPhaseRepository) {
        this.studyRepository = studyRepository;
        this.studyStatusRepository = studyStatusRepository;
        this.regulatoryStatusRepository = regulatoryStatusRepository;
        this.studyPhaseRepository = studyPhaseRepository;
    }
    
    /**
     * Handle StudyCreatedEvent
     * Creates new StudyEntity in read model database
     */
    @EventHandler
    @Transactional
    public void on(StudyCreatedEvent event) {
        logger.info("Projecting StudyCreatedEvent for aggregate: {}", event.getStudyAggregateUuid());
        
        try {
            StudyEntity entity = new StudyEntity();
            
            // Set aggregate UUID (DDD identifier)
            entity.setAggregateUuid(event.getStudyAggregateUuid());
            
            // Set core fields
            entity.setName(event.getName());
            entity.setDescription(event.getDescription());
            entity.setSponsor(event.getSponsor());
            entity.setProtocolNumber(event.getProtocolNumber());
            entity.setIndication(event.getIndication());
            entity.setStudyType(event.getStudyType() != null ? event.getStudyType() : "INTERVENTIONAL");
            
            // Set personnel
            entity.setPrincipalInvestigator(event.getPrincipalInvestigator());
            entity.setStudyCoordinator(event.getStudyCoordinator());
            
            // Set study details
            entity.setTherapeuticArea(event.getTherapeuticArea());
            entity.setPlannedSubjects(event.getPlannedSubjects() != null ? event.getPlannedSubjects() : 0);
            entity.setTargetEnrollment(event.getTargetEnrollment() != null ? event.getTargetEnrollment() : 0);
            entity.setPrimaryObjective(event.getPrimaryObjective());
            entity.setPrimaryEndpoint(event.getPrimaryEndpoint());
            
            // Set timeline
            entity.setStartDate(event.getStartDate());
            entity.setEndDate(event.getEndDate());
            entity.setEstimatedCompletion(event.getEstimatedCompletion());
            
            // Set versioning
            entity.setVersion(event.getVersion() != null ? event.getVersion() : "1.0");
            entity.setIsLatestVersion(event.getIsLatestVersion() != null ? event.getIsLatestVersion() : true);
            entity.setIsLocked(event.getIsLocked() != null ? event.getIsLocked() : false);
            
            // Set default values for other fields
            entity.setSites(0);
            entity.setEnrolledSubjects(0);
            entity.setAmendments(0);
            entity.setActiveSites(0);
            entity.setScreenedSubjects(0);
            entity.setRandomizedSubjects(0);
            entity.setCompletedSubjects(0);
            entity.setWithdrawnSubjects(0);
            
            // Set lookup table relationships
            if (event.getStudyStatusId() != null) {
                studyStatusRepository.findById(event.getStudyStatusId())
                    .ifPresent(entity::setStudyStatus);
            } else {
                // Default to PLANNING status
                studyStatusRepository.findByCode(event.getInitialStatus().getCode())
                    .ifPresent(entity::setStudyStatus);
            }
            
            if (event.getRegulatoryStatusId() != null) {
                regulatoryStatusRepository.findById(event.getRegulatoryStatusId())
                    .ifPresent(entity::setRegulatoryStatus);
            }
            
            if (event.getStudyPhaseId() != null) {
                studyPhaseRepository.findById(event.getStudyPhaseId())
                    .ifPresent(entity::setStudyPhase);
            }
            
            // Set audit fields
            entity.setCreatedBy(event.getUserId() != null ? event.getUserId().getMostSignificantBits() : 1L);
            entity.setCreatedAt(LocalDateTime.now());
            entity.setUpdatedAt(LocalDateTime.now());
            
            // Save to database
            StudyEntity saved = studyRepository.save(entity);
            
            logger.info("Study projection created successfully: {} (DB ID: {}, UUID: {})", 
                saved.getName(), saved.getId(), saved.getAggregateUuid());
                
        } catch (Exception e) {
            logger.error("Error projecting StudyCreatedEvent for aggregate: {}", 
                event.getStudyAggregateUuid(), e);
            throw e; // Re-throw to ensure event processing retry
        }
    }
    
    /**
     * Handle StudyUpdatedEvent
     * Updates existing StudyEntity with changed fields
     */
    @EventHandler
    @Transactional
    public void on(StudyUpdatedEvent event) {
        logger.info("Projecting StudyUpdatedEvent for aggregate: {}", event.getStudyAggregateUuid());
        
        try {
            StudyEntity entity = studyRepository.findByAggregateUuid(event.getStudyAggregateUuid())
                .orElseThrow(() -> new IllegalStateException(
                    "Study not found for UUID: " + event.getStudyAggregateUuid()));
            
            // Update only non-null fields (partial update)
            if (event.getName() != null) {
                entity.setName(event.getName());
            }
            if (event.getDescription() != null) {
                entity.setDescription(event.getDescription());
            }
            if (event.getSponsor() != null) {
                entity.setSponsor(event.getSponsor());
            }
            if (event.getProtocolNumber() != null) {
                entity.setProtocolNumber(event.getProtocolNumber());
            }
            if (event.getIndication() != null) {
                entity.setIndication(event.getIndication());
            }
            if (event.getStudyType() != null) {
                entity.setStudyType(event.getStudyType());
            }
            if (event.getPrincipalInvestigator() != null) {
                entity.setPrincipalInvestigator(event.getPrincipalInvestigator());
            }
            if (event.getStudyCoordinator() != null) {
                entity.setStudyCoordinator(event.getStudyCoordinator());
            }
            if (event.getTherapeuticArea() != null) {
                entity.setTherapeuticArea(event.getTherapeuticArea());
            }
            if (event.getPlannedSubjects() != null) {
                entity.setPlannedSubjects(event.getPlannedSubjects());
            }
            if (event.getTargetEnrollment() != null) {
                entity.setTargetEnrollment(event.getTargetEnrollment());
            }
            if (event.getPrimaryObjective() != null) {
                entity.setPrimaryObjective(event.getPrimaryObjective());
            }
            if (event.getPrimaryEndpoint() != null) {
                entity.setPrimaryEndpoint(event.getPrimaryEndpoint());
            }
            if (event.getStartDate() != null) {
                entity.setStartDate(event.getStartDate());
            }
            if (event.getEndDate() != null) {
                entity.setEndDate(event.getEndDate());
            }
            if (event.getEstimatedCompletion() != null) {
                entity.setEstimatedCompletion(event.getEstimatedCompletion());
            }
            
            // Update lookup table relationships
            if (event.getStudyPhaseId() != null) {
                studyPhaseRepository.findById(event.getStudyPhaseId())
                    .ifPresent(entity::setStudyPhase);
            }
            if (event.getRegulatoryStatusId() != null) {
                regulatoryStatusRepository.findById(event.getRegulatoryStatusId())
                    .ifPresent(entity::setRegulatoryStatus);
            }
            
            // Update audit
            entity.setModifiedBy(event.getUserId() != null ? event.getUserId().getMostSignificantBits() : 1L);
            entity.setUpdatedAt(LocalDateTime.now());
            
            studyRepository.save(entity);
            
            logger.info("Study projection updated successfully: {}", entity.getName());
            
        } catch (Exception e) {
            logger.error("Error projecting StudyUpdatedEvent for aggregate: {}", 
                event.getStudyAggregateUuid(), e);
            throw e;
        }
    }
    
    /**
     * Handle StudyStatusChangedEvent
     * Updates study status in read model
     */
    @EventHandler
    @Transactional
    public void on(StudyStatusChangedEvent event) {
        logger.info("Projecting StudyStatusChangedEvent for aggregate: {} ({} -> {})", 
            event.getStudyAggregateUuid(), event.getOldStatus(), event.getNewStatus());
        
        try {
            StudyEntity entity = studyRepository.findByAggregateUuid(event.getStudyAggregateUuid())
                .orElseThrow(() -> new IllegalStateException(
                    "Study not found for UUID: " + event.getStudyAggregateUuid()));
            
            // Update status by looking up status entity
            StudyStatusEntity newStatus = studyStatusRepository.findByCode(event.getNewStatus().getCode())
                .orElseThrow(() -> new IllegalStateException(
                    "Status not found for code: " + event.getNewStatus().getCode()));
            
            entity.setStudyStatus(newStatus);
            entity.setUpdatedAt(LocalDateTime.now());
            
            studyRepository.save(entity);
            
            logger.info("Study status projected successfully: {} -> {}", 
                event.getOldStatus(), event.getNewStatus());
            
        } catch (Exception e) {
            logger.error("Error projecting StudyStatusChangedEvent for aggregate: {}", 
                event.getStudyAggregateUuid(), e);
            throw e;
        }
    }
    
    /**
     * Handle StudySuspendedEvent
     * Sets study status to SUSPENDED
     */
    @EventHandler
    @Transactional
    public void on(StudySuspendedEvent event) {
        logger.info("Projecting StudySuspendedEvent for aggregate: {}", event.getStudyAggregateUuid());
        
        try {
            StudyEntity entity = studyRepository.findByAggregateUuid(event.getStudyAggregateUuid())
                .orElseThrow(() -> new IllegalStateException(
                    "Study not found for UUID: " + event.getStudyAggregateUuid()));
            
            studyStatusRepository.findByCode("SUSPENDED")
                .ifPresent(entity::setStudyStatus);
            
            entity.setUpdatedAt(LocalDateTime.now());
            studyRepository.save(entity);
            
            logger.info("Study suspended projection updated successfully");
            
        } catch (Exception e) {
            logger.error("Error projecting StudySuspendedEvent for aggregate: {}", 
                event.getStudyAggregateUuid(), e);
            throw e;
        }
    }
    
    /**
     * Handle StudyResumedEvent
     * Sets study status back to ACTIVE
     */
    @EventHandler
    @Transactional
    public void on(StudyResumedEvent event) {
        logger.info("Projecting StudyResumedEvent for aggregate: {}", event.getStudyAggregateUuid());
        
        try {
            StudyEntity entity = studyRepository.findByAggregateUuid(event.getStudyAggregateUuid())
                .orElseThrow(() -> new IllegalStateException(
                    "Study not found for UUID: " + event.getStudyAggregateUuid()));
            
            studyStatusRepository.findByCode("ACTIVE")
                .ifPresent(entity::setStudyStatus);
            
            entity.setUpdatedAt(LocalDateTime.now());
            studyRepository.save(entity);
            
            logger.info("Study resumed projection updated successfully");
            
        } catch (Exception e) {
            logger.error("Error projecting StudyResumedEvent for aggregate: {}", 
                event.getStudyAggregateUuid(), e);
            throw e;
        }
    }
    
    /**
     * Handle StudyCompletedEvent
     * Sets study status to COMPLETED and locks the study
     */
    @EventHandler
    @Transactional
    public void on(StudyCompletedEvent event) {
        logger.info("Projecting StudyCompletedEvent for aggregate: {}", event.getStudyAggregateUuid());
        
        try {
            StudyEntity entity = studyRepository.findByAggregateUuid(event.getStudyAggregateUuid())
                .orElseThrow(() -> new IllegalStateException(
                    "Study not found for UUID: " + event.getStudyAggregateUuid()));
            
            studyStatusRepository.findByCode("COMPLETED")
                .ifPresent(entity::setStudyStatus);
            
            entity.setIsLocked(true); // Lock the study
            if (event.getCompletionDate() != null) {
                entity.setEndDate(event.getCompletionDate());
            }
            entity.setUpdatedAt(LocalDateTime.now());
            
            studyRepository.save(entity);
            
            logger.info("Study completed projection updated successfully");
            
        } catch (Exception e) {
            logger.error("Error projecting StudyCompletedEvent for aggregate: {}", 
                event.getStudyAggregateUuid(), e);
            throw e;
        }
    }
    
    /**
     * Handle StudyTerminatedEvent
     * Sets study status to TERMINATED and locks the study
     */
    @EventHandler
    @Transactional
    public void on(StudyTerminatedEvent event) {
        logger.info("Projecting StudyTerminatedEvent for aggregate: {}", event.getStudyAggregateUuid());
        
        try {
            StudyEntity entity = studyRepository.findByAggregateUuid(event.getStudyAggregateUuid())
                .orElseThrow(() -> new IllegalStateException(
                    "Study not found for UUID: " + event.getStudyAggregateUuid()));
            
            studyStatusRepository.findByCode("TERMINATED")
                .ifPresent(entity::setStudyStatus);
            
            entity.setIsLocked(true); // Lock the study
            entity.setUpdatedAt(LocalDateTime.now());
            
            studyRepository.save(entity);
            
            logger.info("Study terminated projection updated successfully");
            
        } catch (Exception e) {
            logger.error("Error projecting StudyTerminatedEvent for aggregate: {}", 
                event.getStudyAggregateUuid(), e);
            throw e;
        }
    }
    
    /**
     * Handle StudyWithdrawnEvent
     * Sets study status to WITHDRAWN and locks the study
     */
    @EventHandler
    @Transactional
    public void on(StudyWithdrawnEvent event) {
        logger.info("Projecting StudyWithdrawnEvent for aggregate: {}", event.getStudyAggregateUuid());
        
        try {
            StudyEntity entity = studyRepository.findByAggregateUuid(event.getStudyAggregateUuid())
                .orElseThrow(() -> new IllegalStateException(
                    "Study not found for UUID: " + event.getStudyAggregateUuid()));
            
            studyStatusRepository.findByCode("WITHDRAWN")
                .ifPresent(entity::setStudyStatus);
            
            entity.setIsLocked(true); // Lock the study
            entity.setUpdatedAt(LocalDateTime.now());
            
            studyRepository.save(entity);
            
            logger.info("Study withdrawn projection updated successfully");
            
        } catch (Exception e) {
            logger.error("Error projecting StudyWithdrawnEvent for aggregate: {}", 
                event.getStudyAggregateUuid(), e);
            throw e;
        }
    }
}
