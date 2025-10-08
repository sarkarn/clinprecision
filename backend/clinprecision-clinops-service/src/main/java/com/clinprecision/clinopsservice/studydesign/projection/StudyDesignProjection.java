package com.clinprecision.clinopsservice.studydesign.projection;

import com.clinprecision.clinopsservice.studydesign.domain.events.*;
import com.clinprecision.clinopsservice.entity.StudyArmEntity;
import com.clinprecision.clinopsservice.entity.StudyEntity;
import com.clinprecision.clinopsservice.entity.VisitDefinitionEntity;
import com.clinprecision.clinopsservice.entity.VisitFormEntity;
import com.clinprecision.clinopsservice.studydesign.repository.StudyArmReadRepository;
import com.clinprecision.clinopsservice.studydesign.repository.StudyReadRepository;
import com.clinprecision.clinopsservice.studydesign.repository.VisitDefinitionReadRepository;
import com.clinprecision.clinopsservice.studydesign.repository.VisitFormReadRepository;
import com.clinprecision.clinopsservice.studydesign.util.StudyDesignIdentifiers;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Projection handler for StudyDesign events
 * Updates read models (JPA entities) based on events
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StudyDesignProjection {

    private final StudyArmReadRepository armRepository;
    private final VisitDefinitionReadRepository visitRepository;
    private final VisitFormReadRepository visitFormRepository;
    private final StudyReadRepository studyRepository;

    // ===================== STUDY ARM PROJECTIONS =====================

    @EventHandler
    @Transactional
    public void on(StudyArmAddedEvent event) {
        log.info("Projecting StudyArmAddedEvent for arm: {}", event.getArmId());
        
        StudyArmEntity entity = new StudyArmEntity();
        entity.setAggregateUuid(event.getStudyDesignId());
        entity.setArmUuid(event.getArmId());
        entity.setName(event.getName());
        entity.setDescription(event.getDescription());
        entity.setType(com.clinprecision.clinopsservice.entity.StudyArmType.valueOf(event.getType().name()));
        entity.setSequence(event.getSequenceNumber());
        entity.setPlannedSubjects(event.getPlannedSubjects());
        entity.setCreatedAt(event.getOccurredAt());
        entity.setCreatedBy(event.getAddedBy().toString());
        
        armRepository.save(entity);
        log.debug("Study arm entity saved: {}", event.getArmId());
    }

    @EventHandler
    @Transactional
    public void on(StudyArmUpdatedEvent event) {
        log.info("Projecting StudyArmUpdatedEvent for arm: {}", event.getArmId());
        
        armRepository.findByAggregateUuidAndArmUuid(event.getStudyDesignId(), event.getArmId())
            .ifPresent(entity -> {
                entity.setName(event.getName());
                entity.setDescription(event.getDescription());
                entity.setPlannedSubjects(event.getPlannedSubjects());
                entity.setUpdatedAt(event.getOccurredAt());
                entity.setUpdatedBy(event.getUpdatedBy().toString());
                armRepository.save(entity);
                log.debug("Study arm entity updated: {}", event.getArmId());
            });
    }

    @EventHandler
    @Transactional
    public void on(StudyArmRemovedEvent event) {
        log.info("Projecting StudyArmRemovedEvent for arm: {}", event.getArmId());
        
        armRepository.findByAggregateUuidAndArmUuid(event.getStudyDesignId(), event.getArmId())
            .ifPresent(entity -> {
                entity.setIsDeleted(true);
//                entity.setDeletedAt(event.getOccurredAt());
//                entity.setDeletedBy(event.getRemovedBy().toString());
//                entity.setDeletionReason(event.getReason());
                armRepository.save(entity);
                log.debug("Study arm entity marked deleted: {}", event.getArmId());
            });
    }

    // ===================== VISIT PROJECTIONS =====================

    @EventHandler
    @Transactional
    public void on(VisitDefinedEvent event) {
        log.info("Projecting VisitDefinedEvent for visit: {}", event.getVisitId());
        
        VisitDefinitionEntity entity = new VisitDefinitionEntity();
        entity.setAggregateUuid(event.getStudyDesignId());
        entity.setVisitUuid(event.getVisitId());
        entity.setName(event.getName());
        entity.setDescription(event.getDescription());
        entity.setTimepoint(event.getTimepoint());
        entity.setWindowBefore(event.getWindowBefore());
        entity.setWindowAfter(event.getWindowAfter());
        entity.setVisitType(VisitDefinitionEntity.VisitType.valueOf(event.getVisitType().name()));
        entity.setIsRequired(event.getIsRequired());
        entity.setSequenceNumber(event.getSequenceNumber());
        entity.setArmUuid(event.getArmId());

        Long studyId = null;
        if (event.getStudyAggregateId() != null) {
            studyId = studyRepository.findByAggregateUuid(event.getStudyAggregateId())
                .map(StudyEntity::getId)
                .orElse(null);
        }

        if (studyId == null) {
            studyId = studyRepository.findByAggregateUuid(event.getStudyDesignId())
                .map(StudyEntity::getId)
                .orElse(null);
        }

        if (studyId == null) {
            studyId = studyRepository.findAll().stream()
                .filter(study -> {
                    UUID aggregateUuid = study.getAggregateUuid();
                    return aggregateUuid != null
                        && StudyDesignIdentifiers.deriveFromStudyUuid(aggregateUuid)
                            .equals(event.getStudyDesignId());
                })
                .map(StudyEntity::getId)
                .findFirst()
                .orElse(null);
        }

        if (studyId == null) {
            log.warn("Unable to resolve study ID for aggregate {}. Skipping VisitDefinedEvent projection to avoid orphan record.", event.getStudyDesignId());
            return;
        }
        entity.setStudyId(studyId);
        entity.setCreatedAt(event.getOccurredAt());
        entity.setCreatedBy(event.getDefinedBy() != null ? event.getDefinedBy().toString() : "SYSTEM");
        
        visitRepository.save(entity);
        log.debug("Visit entity saved: {}", event.getVisitId());
    }

    @EventHandler
    @Transactional
    public void on(VisitUpdatedEvent event) {
        log.info("Projecting VisitUpdatedEvent for visit: {}", event.getVisitId());
        
        visitRepository.findByAggregateUuidAndVisitUuid(event.getStudyDesignId(), event.getVisitId())
            .ifPresent(entity -> {
                entity.setName(event.getName());
                entity.setDescription(event.getDescription());
                entity.setTimepoint(event.getTimepoint());
                entity.setWindowBefore(event.getWindowBefore());
                entity.setWindowAfter(event.getWindowAfter());
                entity.setIsRequired(event.getIsRequired());
                entity.setUpdatedAt(event.getOccurredAt());
                entity.setUpdatedBy(event.getUpdatedBy().toString());
                visitRepository.save(entity);
                log.debug("Visit entity updated: {}", event.getVisitId());
            });
    }

    @EventHandler
    @Transactional
    public void on(VisitRemovedEvent event) {
        log.info("Projecting VisitRemovedEvent for visit: {}", event.getVisitId());
        
        visitRepository.findByAggregateUuidAndVisitUuid(event.getStudyDesignId(), event.getVisitId())
            .ifPresent(entity -> {
                entity.setIsDeleted(true);
                entity.setDeletedAt(event.getOccurredAt());
                entity.setDeletedBy(event.getRemovedBy().toString());
                entity.setDeletionReason(event.getReason());
                visitRepository.save(entity);
                log.debug("Visit entity marked deleted: {}", event.getVisitId());
            });
    }

    // ===================== FORM ASSIGNMENT PROJECTIONS =====================

    @EventHandler
    @Transactional
    public void on(FormAssignedToVisitEvent event) {
        log.info("Projecting FormAssignedToVisitEvent - Assignment: {}", event.getAssignmentId());
        
        VisitFormEntity entity = new VisitFormEntity();
        entity.setAggregateUuid(event.getStudyDesignId());
        entity.setAssignmentUuid(event.getAssignmentId());
        entity.setVisitUuid(event.getVisitId());
        entity.setFormUuid(event.getFormId());
        entity.setIsRequired(event.getIsRequired());
        entity.setIsConditional(event.getIsConditional());
        entity.setConditionalLogic(event.getConditionalLogic());
        entity.setDisplayOrder(event.getDisplayOrder());
        entity.setInstructions(event.getInstructions());
        entity.setCreatedAt(event.getOccurredAt());
        entity.setCreatedBy(event.getAssignedBy());
        
        visitFormRepository.save(entity);
        log.debug("Form assignment entity saved: {}", event.getAssignmentId());
    }

    @EventHandler
    @Transactional
    public void on(FormAssignmentUpdatedEvent event) {
        log.info("Projecting FormAssignmentUpdatedEvent - Assignment: {}", event.getAssignmentId());
        
        visitFormRepository.findByAggregateUuidAndAssignmentUuid(event.getStudyDesignId(), event.getAssignmentId())
            .ifPresent(entity -> {
                entity.setIsRequired(event.getIsRequired());
                entity.setIsConditional(event.getIsConditional());
                entity.setConditionalLogic(event.getConditionalLogic());
                entity.setInstructions(event.getInstructions());
                entity.setUpdatedAt(event.getOccurredAt());
                entity.setUpdatedBy(event.getUpdatedBy());
                visitFormRepository.save(entity);
                log.debug("Form assignment entity updated: {}", event.getAssignmentId());
            });
    }

    @EventHandler
    @Transactional
    public void on(FormAssignmentRemovedEvent event) {
        log.info("Projecting FormAssignmentRemovedEvent - Assignment: {}", event.getAssignmentId());
        
        visitFormRepository.findByAggregateUuidAndAssignmentUuid(event.getStudyDesignId(), event.getAssignmentId())
            .ifPresent(entity -> {
                entity.setIsDeleted(true);
                entity.setDeletedAt(event.getOccurredAt());
                entity.setDeletedBy(event.getRemovedBy().toString());
                entity.setDeletionReason(event.getReason());
                visitFormRepository.save(entity);
                log.debug("Form assignment entity marked deleted: {}", event.getAssignmentId());
            });
    }
}
