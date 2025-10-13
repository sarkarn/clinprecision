package com.clinprecision.clinopsservice.formdata.service;

import com.clinprecision.clinopsservice.formdata.domain.commands.SubmitFormDataCommand;
import com.clinprecision.clinopsservice.formdata.dto.FormSubmissionRequest;
import com.clinprecision.clinopsservice.formdata.dto.FormSubmissionResponse;
import com.clinprecision.clinopsservice.formdata.dto.FormDataDto;
import com.clinprecision.clinopsservice.formdata.entity.StudyFormDataEntity;
import com.clinprecision.clinopsservice.formdata.repository.StudyFormDataRepository;

import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * StudyFormDataService - Business logic for form data submissions
 * 
 * Responsibilities:
 * 1. Form submission validation
 * 2. Command creation and dispatch (to Axon)
 * 3. Form data retrieval
 * 4. Business rule enforcement
 * 
 * Architecture:
 * - Controller → Service → CommandGateway → Aggregate
 * - Aggregate → Event → Projector → Repository → Database
 * - Service queries Repository for read operations
 * 
 * Event Sourcing Flow:
 * 1. Service creates SubmitFormDataCommand
 * 2. CommandGateway sends command to FormDataAggregate
 * 3. Aggregate validates and emits FormDataSubmittedEvent
 * 4. FormDataProjector handles event and updates database
 * 5. Service returns response to controller
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudyFormDataService {

    private final CommandGateway commandGateway;
    private final StudyFormDataRepository formDataRepository;

    /**
     * Submit form data
     * 
     * Converts FormSubmissionRequest to SubmitFormDataCommand and dispatches
     * to Axon framework for event sourcing.
     * 
     * Process:
     * 1. Validate request
     * 2. Generate UUID for form submission
     * 3. Extract user ID from security context (TODO)
     * 4. Create command
     * 5. Send command via CommandGateway
     * 6. Wait for completion (synchronous)
     * 7. Query database for created record
     * 8. Return response
     * 
     * @param request Form submission request from frontend
     * @return Response with formDataId and recordId
     */
    // DO NOT ADD @Transactional - it prevents projection from seeing the committed event!
    // Axon handles transactions internally for command processing
    public FormSubmissionResponse submitFormData(FormSubmissionRequest request) {
        log.info("Submitting form data: studyId={}, formId={}, subjectId={}, status={}", 
            request.getStudyId(), request.getFormId(), request.getSubjectId(), request.getStatus());
        
        try {
            // Step 1: Validate request
            validateFormSubmissionRequest(request);
            
            // Step 2: Generate UUID for this submission
            UUID formDataId = UUID.randomUUID();
            
            // Step 3: Get current user ID (TODO: Extract from SecurityContext)
            Long currentUserId = getCurrentUserId();
            
            // Step 4: Create command
            SubmitFormDataCommand command = SubmitFormDataCommand.builder()
                .formDataId(formDataId)
                .studyId(request.getStudyId())
                .formId(request.getFormId())
                .subjectId(request.getSubjectId())
                .visitId(request.getVisitId())
                .siteId(request.getSiteId())
                .formData(request.getFormData())
                .status(request.getStatus())
                .submittedBy(currentUserId)
                .relatedRecordId(request.getRelatedRecordId())
                .version(1)
                .build();
            
            log.info("Sending SubmitFormDataCommand: formDataId={}", formDataId);
            
            // Step 5: Send command and wait for completion (synchronous)
            commandGateway.sendAndWait(command);
            
            log.info("SubmitFormDataCommand completed successfully: formDataId={}", formDataId);
            
            // Step 6: Wait for projection to complete (with retry)
            // Event sourcing: Command completes immediately, but projection may take a few ms
            StudyFormDataEntity savedEntity = waitForFormDataProjection(formDataId.toString());
            
            // Step 7: Build response
            FormSubmissionResponse response = FormSubmissionResponse.builder()
                .formDataId(formDataId)
                .recordId(savedEntity.getId())
                .studyId(savedEntity.getStudyId())
                .formId(savedEntity.getFormId())
                .subjectId(savedEntity.getSubjectId())
                .visitId(savedEntity.getVisitId())
                .status(savedEntity.getStatus())
                .submittedAt(savedEntity.getCreatedAt())
                .submittedBy(savedEntity.getCreatedBy())
                .version(savedEntity.getVersion())
                .relatedRecordId(savedEntity.getRelatedRecordId())
                .message("Form submitted successfully")
                .build();
            
            log.info("Form submission completed: formDataId={}, recordId={}", formDataId, savedEntity.getId());
            
            return response;
            
        } catch (Exception e) {
            log.error("Error submitting form data: studyId={}, formId={}, error={}", 
                request.getStudyId(), request.getFormId(), e.getMessage(), e);
            throw new RuntimeException("Failed to submit form data: " + e.getMessage(), e);
        }
    }

    /**
     * Get all form submissions for a subject
     * 
     * @param subjectId Subject ID
     * @return List of form submissions
     */
    @Transactional(readOnly = true)
    public List<FormDataDto> getSubjectFormData(Long subjectId) {
        log.info("Retrieving form data for subject: {}", subjectId);
        
        List<StudyFormDataEntity> entities = formDataRepository.findBySubjectIdOrderByCreatedAtDesc(subjectId);
        
        log.info("Found {} form submissions for subject {}", entities.size(), subjectId);
        
        return entities.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get all form submissions for a study
     * 
     * @param studyId Study ID
     * @return List of form submissions
     */
    @Transactional(readOnly = true)
    public List<FormDataDto> getStudyFormData(Long studyId) {
        log.info("Retrieving form data for study: {}", studyId);
        
        List<StudyFormDataEntity> entities = formDataRepository.findByStudyIdOrderByCreatedAtDesc(studyId);
        
        log.info("Found {} form submissions for study {}", entities.size(), studyId);
        
        return entities.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Get specific form submission by ID
     * 
     * @param id Record ID
     * @return Form data DTO
     */
    @Transactional(readOnly = true)
    public FormDataDto getFormDataById(Long id) {
        log.info("Retrieving form data by ID: {}", id);
        
        StudyFormDataEntity entity = formDataRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Form data not found: " + id));
        
        return toDto(entity);
    }

    /**
     * Get form submissions by study and form definition
     * 
     * @param studyId Study ID
     * @param formId Form definition ID
     * @return List of form submissions
     */
    @Transactional(readOnly = true)
    public List<FormDataDto> getFormDataByStudyAndForm(Long studyId, Long formId) {
        log.info("Retrieving form data for study {} and form {}", studyId, formId);
        
        List<StudyFormDataEntity> entities = formDataRepository
            .findByStudyIdAndFormIdOrderByCreatedAtDesc(studyId, formId);
        
        log.info("Found {} submissions for study {} form {}", entities.size(), studyId, formId);
        
        return entities.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    /**
     * Validate form submission request
     * 
     * Business rules:
     * 1. Study, form, and form data must be present
     * 2. Status must be valid (DRAFT, SUBMITTED, LOCKED)
     * 3. Visit forms require subject ID
     * 4. Form data cannot be empty
     */
    private void validateFormSubmissionRequest(FormSubmissionRequest request) {
        if (request.getStudyId() == null) {
            throw new IllegalArgumentException("Study ID is required");
        }
        
        if (request.getFormId() == null) {
            throw new IllegalArgumentException("Form ID is required");
        }
        
        if (request.getFormData() == null || request.getFormData().isEmpty()) {
            throw new IllegalArgumentException("Form data cannot be empty");
        }
        
        if (!request.hasValidStatus()) {
            throw new IllegalArgumentException("Invalid status. Must be DRAFT, SUBMITTED, or LOCKED");
        }
        
        if (request.isVisitForm() && request.getSubjectId() == null) {
            throw new IllegalArgumentException("Subject ID is required for visit-based forms");
        }
        
        log.debug("Form submission request validation passed: studyId={}, formId={}", 
            request.getStudyId(), request.getFormId());
    }

    /**
     * Convert entity to DTO
     */
    private FormDataDto toDto(StudyFormDataEntity entity) {
        return FormDataDto.builder()
            .id(entity.getId())
            .aggregateUuid(entity.getAggregateUuid())
            .studyId(entity.getStudyId())
            .formId(entity.getFormId())
            .subjectId(entity.getSubjectId())
            .visitId(entity.getVisitId())
            .siteId(entity.getSiteId())
            .formData(entity.getFormData())
            .status(entity.getStatus())
            .version(entity.getVersion())
            .isLocked(entity.getIsLocked())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .createdBy(entity.getCreatedBy())
            .updatedBy(entity.getUpdatedBy())
            .relatedRecordId(entity.getRelatedRecordId())
            .build();
    }

    /**
     * Get current user ID from security context
     * 
     * TODO: Integrate with Spring Security
     * For now, return a placeholder
     */
    private Long getCurrentUserId() {
        // TODO: Extract from SecurityContext
        // SecurityContext context = SecurityContextHolder.getContext();
        // Authentication auth = context.getAuthentication();
        // UserDetails user = (UserDetails) auth.getPrincipal();
        // return user.getId();
        
        return 1L; // Placeholder - replace with actual security integration
    }

    /**
     * Wait for form data projection to complete
     * 
     * Event sourcing pattern: Commands complete immediately, but projections
     * are asynchronous and may take a few milliseconds. This method polls
     * the database until the projection is found or timeout occurs.
     * 
     * Polling Strategy (same as PatientStatusService):
     * - Attempt 1-3: 50ms, 100ms, 200ms (exponential backoff)
     * - Attempt 4-13: 500ms each (steady polling)
     * - Total timeout: ~5 seconds
     * 
     * @param aggregateUuid UUID of FormData aggregate
     * @return StudyFormDataEntity from projection
     * @throws RuntimeException if projection not found after timeout
     */
    private StudyFormDataEntity waitForFormDataProjection(String aggregateUuid) {
        log.info("Waiting for form data projection: aggregateUuid={}", aggregateUuid);
        
        int maxAttempts = 13;
        int attempt = 0;
        long totalWaitTime = 0;
        
        while (attempt < maxAttempts) {
            attempt++;
            
            // Check if projection exists
            Optional<StudyFormDataEntity> formData = formDataRepository.findByAggregateUuid(aggregateUuid);
            
            if (formData.isPresent()) {
                log.info("Form data projection found: aggregateUuid={}, recordId={}, attempts={}, totalWait={}ms", 
                    aggregateUuid, formData.get().getId(), attempt, totalWaitTime);
                return formData.get();
            }
            
            // Calculate delay (exponential backoff, then steady)
            long delay = attempt <= 3 ? (long) Math.pow(2, attempt - 1) * 50 : 500;
            totalWaitTime += delay;
            
            log.debug("Form data projection not found yet, attempt {}, waiting {}ms", attempt, delay);
            
            try {
                Thread.sleep(delay);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted while waiting for form data projection", e);
            }
        }
        
        log.error("Form data projection not found after {}ms and {} attempts: aggregateUuid={}", 
            totalWaitTime, maxAttempts, aggregateUuid);
        throw new RuntimeException("Form data not found after submission timeout: " + aggregateUuid);
    }
}
