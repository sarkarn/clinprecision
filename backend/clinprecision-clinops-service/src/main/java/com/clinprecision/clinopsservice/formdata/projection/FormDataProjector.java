package com.clinprecision.clinopsservice.formdata.projection;

import com.clinprecision.clinopsservice.formdata.domain.events.FormDataSubmittedEvent;
import com.clinprecision.clinopsservice.formdata.entity.StudyFormDataEntity;
import com.clinprecision.clinopsservice.formdata.entity.StudyFormDataAuditEntity;
import com.clinprecision.clinopsservice.formdata.repository.StudyFormDataRepository;
import com.clinprecision.clinopsservice.formdata.repository.StudyFormDataAuditRepository;

import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;

/**
 * FormData Projector - Event sourcing projection handler for visit-based form data
 * 
 * PURPOSE:
 * This projector is the event handler that transforms domain events into read models
 * for querying and reporting. It's a critical component of the CQRS pattern used
 * in this event-sourced clinical trial system.
 * 
 * USAGE CONTEXT:
 * - Processes FormDataSubmittedEvent from FormDataAggregate
 * - Builds denormalized read models for efficient querying
 * - Creates immutable audit trail for regulatory compliance
 * 
 * NOT TIED TO:
 * - Status changes (processes events from any source)
 * - Specific workflows (generic form data processor)
 * 
 * Handles event sourcing projections to build read models:
 * - study_form_data table (current state of form submissions)
 * - study_form_data_audit table (complete change history)
 * 
 * Event Flow:
 * 1. FormDataAggregate emits FormDataSubmittedEvent
 * 2. This projector handles the event
 * 3. Updates study_form_data (read model)
 * 4. Creates audit record in study_form_data_audit
 * 
 * Idempotency:
 * - Checks if aggregate UUID already exists before creating
 * - Ensures event is only processed once
 * - Critical for event replay scenarios
 * 
 * Transaction Management:
 * - @Transactional ensures atomicity
 * - If audit fails, form data insert also rolls back
 * - Maintains data consistency
 * 
 * GCP/FDA 21 CFR Part 11 Compliance:
 * - Every form submission creates immutable audit trail
 * - Captures who, what, when for regulatory compliance
 * - Original event preserved in event store
 * - Audit record in database for reporting
 * 
 * Future Integration (Week 3-4):
 * - Will process events from UnscheduledVisitService
 * - Visit context will be preserved in read model
 * - Audit trail will link: Visit → Form → Data
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FormDataProjector {

    private final StudyFormDataRepository formDataRepository;
    private final StudyFormDataAuditRepository auditRepository;

    /**
     * Handle FormDataSubmittedEvent - Create form submission record
     * 
     * This method is called when a FormDataSubmittedEvent is emitted.
     * It updates the read model (study_form_data) and creates an audit trail.
     * 
     * Processing Steps:
     * 1. Check idempotency (aggregate UUID already exists?)
     * 2. Create StudyFormDataEntity from event
     * 3. Save to study_form_data table
     * 4. Create audit record in study_form_data_audit
     * 5. Log successful projection
     * 
     * Error Handling:
     * - If UUID exists: Log warning and skip (idempotency)
     * - If database error: Log error and throw (will retry)
     * - Transaction rollback ensures consistency
     * 
     * @param event FormDataSubmittedEvent from aggregate
     */
    @EventHandler
    @Transactional
    public void on(FormDataSubmittedEvent event) {
        log.info("Projecting FormDataSubmittedEvent: formDataId={}, studyId={}, formId={}, subjectId={}, status={}", 
            event.getFormDataId(), event.getStudyId(), event.getFormId(), 
            event.getSubjectId(), event.getStatus());
        
        try {
            // Step 1: Check idempotency - has this event already been processed?
            String aggregateUuid = event.getFormDataId().toString();
            Optional<StudyFormDataEntity> existing = formDataRepository.findByAggregateUuid(aggregateUuid);
            
            if (existing.isPresent()) {
                log.warn("FormDataSubmittedEvent already processed (idempotency check): formDataId={}, existing record id={}", 
                    event.getFormDataId(), existing.get().getId());
                return; // Skip duplicate event
            }
            
            // Step 2: Create StudyFormDataEntity from event
            StudyFormDataEntity formDataEntity = StudyFormDataEntity.builder()
                .aggregateUuid(aggregateUuid)
                .studyId(event.getStudyId())
                .formId(event.getFormId())
                .subjectId(event.getSubjectId())
                .visitId(event.getVisitId())
                .siteId(event.getSiteId())
                .formData(event.getFormData())
                .status(event.getStatus())
                .version(event.getVersion())
                .isLocked(event.isLocked())
                .createdAt(event.getSubmittedAt())
                .updatedAt(event.getSubmittedAt())
                .createdBy(event.getSubmittedBy())
                .updatedBy(event.getSubmittedBy())
                .relatedRecordId(event.getRelatedRecordId())
                .totalFields(event.getTotalFields())
                .completedFields(event.getCompletedFields())
                .requiredFields(event.getRequiredFields())
                .completedRequiredFields(event.getCompletedRequiredFields())
                .build();
            
            // Step 3: Save to study_form_data table
            StudyFormDataEntity savedEntity = formDataRepository.save(formDataEntity);
            
            log.info("Form data record created: id={}, formDataId={}, studyId={}, formId={}, subjectId={}, fieldCount={}", 
                savedEntity.getId(), event.getFormDataId(), event.getStudyId(), 
                event.getFormId(), event.getSubjectId(), event.getFieldCount());
            
            // Step 4: Create audit record
            createAuditRecord(event, savedEntity.getId());
            
            log.info("FormDataSubmittedEvent projection completed successfully: record id={}", savedEntity.getId());
            
        } catch (Exception e) {
            log.error("Error projecting FormDataSubmittedEvent: formDataId={}, error={}", 
                event.getFormDataId(), e.getMessage(), e);
            throw new RuntimeException("Failed to project FormDataSubmittedEvent", e);
        }
    }

    /**
     * Create audit record for form submission
     * 
     * Every form submission creates an audit trail record.
     * This is required for:
     * - Regulatory compliance (GCP/FDA 21 CFR Part 11)
     * - Change tracking
     * - Data integrity verification
     * - Audit reports
     * 
     * Audit Record Contents:
     * - studyId: Study context
     * - recordId: Reference to study_form_data record
     * - action: INSERT (new submission)
     * - oldData: NULL (no previous data)
     * - newData: Complete form data as JSON
     * - changedBy: User who submitted
     * - changedAt: Submission timestamp
     * - eventId: Link to event store
     * 
     * @param event FormDataSubmittedEvent
     * @param recordId ID of saved StudyFormDataEntity
     */
    private void createAuditRecord(FormDataSubmittedEvent event, Long recordId) {
        try {
            StudyFormDataAuditEntity auditEntity = StudyFormDataAuditEntity.builder()
                .studyId(event.getStudyId())
                .recordId(recordId)
                .aggregateUuid(event.getFormDataId().toString())
                .action("INSERT") // New form submission
                .oldData(null) // No previous data for new submission
                .newData(event.getFormData()) // Complete form data
                .changedBy(event.getSubmittedBy())
                .changedAt(event.getSubmittedAt())
                .reason(null) // No reason required for initial submission
                .ipAddress(null) // TODO: Add IP address from security context if available
                .eventId(event.getFormDataId().toString()) // Link to event
                .build();
            
            StudyFormDataAuditEntity savedAudit = auditRepository.save(auditEntity);
            
            log.info("Audit record created: auditId={}, recordId={}, action=INSERT, fieldCount={}", 
                savedAudit.getAuditId(), recordId, event.getFieldCount());
            
        } catch (Exception e) {
            log.error("Error creating audit record: recordId={}, error={}", recordId, e.getMessage(), e);
            throw new RuntimeException("Failed to create audit record", e);
        }
    }

    /**
     * Future: Handle FormDataUpdatedEvent
     * 
     * When form data is updated (not implemented yet), this handler would:
     * 1. Find existing StudyFormDataEntity by aggregate UUID
     * 2. Update fields with new values
     * 3. Increment version number
     * 4. Create audit record with oldData and newData
     * 
     * Business Rules for Updates:
     * - DRAFT forms can be updated freely
     * - SUBMITTED forms require reason for update
     * - LOCKED forms cannot be updated
     * 
     * @EventHandler
     * @Transactional
     * public void on(FormDataUpdatedEvent event) {
     *     // Implementation for form updates
     * }
     */

    /**
     * Future: Handle FormDataLockedEvent
     * 
     * When database lock is applied, this handler would:
     * 1. Find StudyFormDataEntity by aggregate UUID
     * 2. Set isLocked = true
     * 3. Set status = "LOCKED"
     * 4. Create audit record with action=LOCK
     * 
     * Database Lock Rules:
     * - All forms for a study are locked simultaneously
     * - Once locked, no modifications allowed
     * - Unlock requires regulatory approval (UNLOCK action)
     * 
     * @EventHandler
     * @Transactional
     * public void on(FormDataLockedEvent event) {
     *     // Implementation for database lock
     * }
     */
}
