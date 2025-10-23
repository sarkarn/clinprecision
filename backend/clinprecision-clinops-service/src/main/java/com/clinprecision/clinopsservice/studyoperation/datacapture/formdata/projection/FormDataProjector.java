package com.clinprecision.clinopsservice.studyoperation.datacapture.formdata.projection;

import com.clinprecision.clinopsservice.studyoperation.datacapture.formdata.domain.events.FormDataSubmittedEvent;
import com.clinprecision.clinopsservice.studyoperation.datacapture.formdata.entity.StudyFormDataEntity;
import com.clinprecision.clinopsservice.studyoperation.datacapture.formdata.entity.StudyFormDataAuditEntity;
import com.clinprecision.clinopsservice.studyoperation.datacapture.formdata.repository.StudyFormDataRepository;
import com.clinprecision.clinopsservice.studyoperation.datacapture.formdata.repository.StudyFormDataAuditRepository;
import com.clinprecision.clinopsservice.studyoperation.visit.service.PatientVisitService;

import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Optional;
import java.util.List;

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
 * - Will process events from PatientVisitService
 * - Visit context will be preserved in read model
 * - Audit trail will link: Visit → Form → Data
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FormDataProjector {

    private final StudyFormDataRepository formDataRepository;
    private final StudyFormDataAuditRepository auditRepository;
    private final PatientVisitService patientVisitService;

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
        log.info("Projecting FormDataSubmittedEvent: formDataId={}, studyId={}, formId={}, subjectId={}, buildId={}, status={}", 
            event.getFormDataId(), event.getStudyId(), event.getFormId(), 
            event.getSubjectId(), event.getBuildId(), event.getStatus());
        
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
                .buildId(event.getBuildId())  // ✅ SET BUILD ID
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
            
            log.info("Form data record created: id={}, formDataId={}, studyId={}, formId={}, subjectId={}, buildId={}, fieldCount={}", 
                savedEntity.getId(), event.getFormDataId(), event.getStudyId(), 
                event.getFormId(), event.getSubjectId(), event.getBuildId(), event.getFieldCount());
            
            // Step 4: Create audit record
            createAuditRecord(event, savedEntity.getId());
            
            // Step 5: Check if all visit forms are complete and auto-update visit status
            if (event.getVisitId() != null && "SUBMITTED".equals(event.getStatus())) {
                checkAndUpdateVisitCompletion(event.getVisitId(), event.getSubmittedBy());
            }
            
            log.info("FormDataSubmittedEvent projection completed successfully: record id={}, buildId={}", 
                savedEntity.getId(), event.getBuildId());
            
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
     * - buildId: Protocol version active at submission
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
                .buildId(event.getBuildId())  // ✅ SET BUILD ID (FDA compliance)
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
            
            log.info("Audit record created: auditId={}, recordId={}, buildId={}, action=INSERT, fieldCount={}", 
                savedAudit.getAuditId(), recordId, event.getBuildId(), event.getFieldCount());
            
        } catch (Exception e) {
            log.error("Error creating audit record: recordId={}, error={}", recordId, e.getMessage(), e);
            throw new RuntimeException("Failed to create audit record", e);
        }
    }

    /**
     * Check if all forms in a visit are complete and auto-update visit status to COMPLETED
     * 
     * This method is called after each form submission to check if the visit is now complete.
     * If all required forms for the visit are SUBMITTED, the visit status is automatically
     * updated to COMPLETED.
     * 
     * Business Logic:
     * - Only checks when a form status is SUBMITTED
     * - Queries all forms for the visit from study_form_data
     * - If ALL forms have status=SUBMITTED, updates visit to COMPLETED
     * - Logs the automatic status transition
     * 
     * @param visitId The visit instance ID
     * @param updatedBy The user who submitted the last form
     */
    private void checkAndUpdateVisitCompletion(Long visitId, Long updatedBy) {
        try {
            log.info("Checking visit completion for visitId={}", visitId);
            
            // Get all forms for this visit
            List<StudyFormDataEntity> visitForms = formDataRepository.findByVisitIdOrderByCreatedAtDesc(visitId);
            
            if (visitForms.isEmpty()) {
                log.warn("No forms found for visitId={}", visitId);
                return;
            }
            
            // Check if ALL forms are SUBMITTED
            boolean allFormsComplete = visitForms.stream()
                .allMatch(form -> "SUBMITTED".equals(form.getStatus()));
            
            if (allFormsComplete) {
                log.info("All {} forms completed for visitId={}. Auto-updating visit status to COMPLETED.", 
                    visitForms.size(), visitId);
                
                // Update visit status to COMPLETED
                boolean updated = patientVisitService.updateVisitStatus(
                    visitId,
                    "COMPLETED",
                    updatedBy,
                    "Visit auto-completed: all required forms submitted",
                    java.time.LocalDate.now()
                );
                
                if (updated) {
                    log.info("Visit status successfully updated to COMPLETED: visitId={}", visitId);
                } else {
                    log.warn("Failed to update visit status to COMPLETED: visitId={}", visitId);
                }
            } else {
                long completedCount = visitForms.stream()
                    .filter(form -> "SUBMITTED".equals(form.getStatus()))
                    .count();
                log.info("Visit not yet complete: visitId={}, completed={}/{}", 
                    visitId, completedCount, visitForms.size());
            }
            
        } catch (Exception e) {
            // Don't throw - visit status update is not critical to form submission
            log.error("Error checking visit completion: visitId={}, error={}", visitId, e.getMessage(), e);
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
