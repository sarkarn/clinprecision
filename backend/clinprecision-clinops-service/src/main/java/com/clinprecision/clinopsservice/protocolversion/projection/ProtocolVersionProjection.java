package com.clinprecision.clinopsservice.protocolversion.projection;

import com.clinprecision.clinopsservice.protocolversion.domain.events.*;
import com.clinprecision.clinopsservice.protocolversion.entity.ProtocolVersionEntity;
import com.clinprecision.clinopsservice.protocolversion.repository.ProtocolVersionReadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Protocol Version Projection - Maintains the read model
 * 
 * Listens to domain events and updates the ProtocolVersionEntity (read model).
 * This provides eventual consistency between the write model (aggregate) 
 * and read model (JPA entity).
 * 
 * CQRS Pattern:
 * - Write Model: ProtocolVersionAggregate (command handling, business logic)
 * - Read Model: ProtocolVersionEntity (optimized for queries)
 * - Projection: Keeps them in sync via events
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ProtocolVersionProjection {

    private final ProtocolVersionReadRepository repository;

    @EventHandler
    @Transactional
    public void on(ProtocolVersionCreatedEvent event) {
        log.info("Projecting ProtocolVersionCreatedEvent: {}", event.getVersionNumber());
        
        try {
            ProtocolVersionEntity entity = new ProtocolVersionEntity();
            entity.setAggregateUuid(event.getVersionId());
            entity.setStudyAggregateUuid(event.getStudyAggregateUuid());
            entity.setVersionNumber(event.getVersionNumber().getValue());
            entity.setStatus(event.getInitialStatus());
            entity.setAmendmentType(event.getAmendmentType());
            entity.setDescription(event.getDescription());
            entity.setChangesSummary(event.getChangesSummary());
            entity.setImpactAssessment(event.getImpactAssessment());
            entity.setRequiresRegulatoryApproval(event.getRequiresRegulatoryApproval());
            entity.setCreatedAt(event.getOccurredAt());
            entity.setUpdatedAt(event.getOccurredAt());
            
            repository.save(entity);
            
            log.info("Created read model for version: {}", event.getVersionNumber());
        } catch (Exception e) {
            log.error("Error projecting ProtocolVersionCreatedEvent", e);
            throw e;
        }
    }

    @EventHandler
    @Transactional
    public void on(VersionStatusChangedEvent event) {
        log.info("Projecting VersionStatusChangedEvent: {} -> {}", 
            event.getOldStatus(), event.getNewStatus());
        
        try {
            ProtocolVersionEntity entity = repository.findByAggregateUuid(event.getVersionId())
                .orElseThrow(() -> new IllegalStateException(
                    "Version not found for UUID: " + event.getVersionId()));
            
            entity.setStatus(event.getNewStatus());
            entity.setUpdatedAt(event.getOccurredAt());
            
            repository.save(entity);
            
            log.info("Updated version status in read model: {} -> {}", 
                event.getOldStatus(), event.getNewStatus());
        } catch (Exception e) {
            log.error("Error projecting VersionStatusChangedEvent", e);
            throw e;
        }
    }

    @EventHandler
    @Transactional
    public void on(VersionApprovedEvent event) {
        log.info("Projecting VersionApprovedEvent for version: {}", event.getVersionId());
        
        try {
            ProtocolVersionEntity entity = repository.findByAggregateUuid(event.getVersionId())
                .orElseThrow(() -> new IllegalStateException(
                    "Version not found for UUID: " + event.getVersionId()));
            
            entity.setApprovedBy(event.getApprovedBy());
            entity.setApprovalDate(event.getApprovedDate().toLocalDate());
            entity.setEffectiveDate(event.getEffectiveDate());
            entity.setApprovalComments(event.getApprovalComments());
            entity.setUpdatedAt(event.getOccurredAt());
            
            repository.save(entity);
            
            log.info("Updated approval details in read model");
        } catch (Exception e) {
            log.error("Error projecting VersionApprovedEvent", e);
            throw e;
        }
    }

    @EventHandler
    @Transactional
    public void on(VersionActivatedEvent event) {
        log.info("Projecting VersionActivatedEvent for version: {}", event.getVersionId());
        
        try {
            // Update the newly activated version
            ProtocolVersionEntity entity = repository.findByAggregateUuid(event.getVersionId())
                .orElseThrow(() -> new IllegalStateException(
                    "Version not found for UUID: " + event.getVersionId()));
            
            entity.setPreviousActiveVersionUuid(event.getPreviousActiveVersionUuid());
            entity.setUpdatedAt(event.getOccurredAt());
            
            repository.save(entity);
            
            log.info("Updated activation details in read model");
        } catch (Exception e) {
            log.error("Error projecting VersionActivatedEvent", e);
            throw e;
        }
    }

    @EventHandler
    @Transactional
    public void on(VersionDetailsUpdatedEvent event) {
        log.info("Projecting VersionDetailsUpdatedEvent for version: {}", event.getVersionId());
        
        try {
            ProtocolVersionEntity entity = repository.findByAggregateUuid(event.getVersionId())
                .orElseThrow(() -> new IllegalStateException(
                    "Version not found for UUID: " + event.getVersionId()));
            
            // Update only provided fields (null means no change)
            if (event.getDescription() != null) {
                entity.setDescription(event.getDescription());
            }
            if (event.getChangesSummary() != null) {
                entity.setChangesSummary(event.getChangesSummary());
            }
            if (event.getImpactAssessment() != null) {
                entity.setImpactAssessment(event.getImpactAssessment());
            }
            if (event.getAdditionalNotes() != null) {
                entity.setNotes(event.getAdditionalNotes());
            }
            if (event.getProtocolChanges() != null) {
                entity.setProtocolChanges(event.getProtocolChanges());
            }
            if (event.getIcfChanges() != null) {
                entity.setIcfChanges(event.getIcfChanges());
            }
            
            entity.setUpdatedAt(event.getOccurredAt());
            
            repository.save(entity);
            
            log.info("Updated version details in read model");
        } catch (Exception e) {
            log.error("Error projecting VersionDetailsUpdatedEvent", e);
            throw e;
        }
    }

    @EventHandler
    @Transactional
    public void on(VersionWithdrawnEvent event) {
        log.info("Projecting VersionWithdrawnEvent for version: {}", event.getVersionId());
        
        try {
            ProtocolVersionEntity entity = repository.findByAggregateUuid(event.getVersionId())
                .orElseThrow(() -> new IllegalStateException(
                    "Version not found for UUID: " + event.getVersionId()));
            
            entity.setWithdrawalReason(event.getWithdrawalReason());
            entity.setWithdrawnBy(event.getWithdrawnBy());
            entity.setUpdatedAt(event.getOccurredAt());
            
            repository.save(entity);
            
            log.info("Updated withdrawal details in read model");
        } catch (Exception e) {
            log.error("Error projecting VersionWithdrawnEvent", e);
            throw e;
        }
    }
}



