package com.clinprecision.clinopsservice.patientenrollment.projection;

import com.clinprecision.clinopsservice.patientenrollment.domain.events.PatientRegisteredEvent;
import com.clinprecision.clinopsservice.patientenrollment.domain.events.PatientEnrolledEvent;
import com.clinprecision.clinopsservice.patientenrollment.domain.events.PatientStatusChangedEvent;
import com.clinprecision.clinopsservice.patientenrollment.domain.events.PatientDemographicsUpdatedEvent;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEntity;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEnrollmentEntity;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEnrollmentAuditEntity;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientStatusHistoryEntity;
import com.clinprecision.clinopsservice.patientenrollment.entity.EnrollmentStatus;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientStatus;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientGender;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientRepository;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientEnrollmentRepository;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientEnrollmentAuditRepository;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientStatusHistoryRepository;
import com.clinprecision.clinopsservice.visit.service.ProtocolVisitInstantiationService;
import com.clinprecision.clinopsservice.visit.entity.StudyVisitInstanceEntity;

import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

/**
 * Projector for Patient Enrollment Events
 * 
 * Handles event sourcing projections to build read models:
 * - patient_enrollments table (enrollment records)
 * - patients table (patient status updates)
 * - patient_enrollment_audit table (audit trail)
 * 
 * Follows established ClinPrecision projector patterns
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PatientEnrollmentProjector {

    private final PatientEnrollmentRepository patientEnrollmentRepository;
    private final PatientRepository patientRepository;
    private final PatientEnrollmentAuditRepository auditRepository;
    private final PatientStatusHistoryRepository statusHistoryRepository;
    private final com.clinprecision.clinopsservice.patientenrollment.repository.SiteStudyRepository siteStudyRepository;
    private final ProtocolVisitInstantiationService protocolVisitInstantiationService;
    
    /**
     * Handle PatientRegisteredEvent - Create initial status history record
     * 
     * This is the first event in a patient's lifecycle. We create:
     * 1. Initial status history record with REGISTERED status
     * 2. Audit record for patient creation
     * 
     * Note: The patient entity itself is already created by the patient service
     * before the command is sent, so we just need to create the status history.
     */
    @EventHandler
    @Transactional
    public void on(PatientRegisteredEvent event) {
        log.info("Projecting PatientRegisteredEvent: patient={}, name={} {}", 
            event.getPatientId(), event.getFirstName(), event.getLastName());
        
        try {
            // Wait for patient entity to be created by PatientProjectionHandler
            // Since both handlers process PatientRegisteredEvent in parallel,
            // we need to retry until the patient entity exists
            PatientEntity patient = waitForPatientEntity(event.getPatientId().toString(), 3000); // 3 second timeout
            
            if (patient == null) {
                log.error("Patient entity not created after waiting: {}", event.getPatientId());
                return; // Give up after timeout
            }
            
            // Generate event identifier for idempotency
            String eventId = generateEventIdForRegistration(event);
            
            // Check if initial status history already exists
            if (statusHistoryRepository.existsByEventId(eventId)) {
                log.info("Patient registration event already processed (idempotency check): eventId={}", eventId);
                return;
            }
            
            // Create initial status history record with REGISTERED status
            PatientStatusHistoryEntity statusHistory = PatientStatusHistoryEntity.builder()
                .patientId(patient.getId())
                .aggregateUuid(event.getPatientId().toString())
                .eventId(eventId)
                .previousStatus(null) // No previous status for initial registration
                .newStatus(PatientStatus.REGISTERED)
                .reason("Initial patient registration")
                .changedBy(event.getRegisteredBy())
                .changedAt(event.getRegisteredAt() != null ? event.getRegisteredAt() : LocalDateTime.now())
                .notes(String.format("Patient registered: %s %s", event.getFirstName(), event.getLastName()))
                .enrollmentId(null) // No enrollment at registration
                .build();
            
            PatientStatusHistoryEntity savedHistory = statusHistoryRepository.save(statusHistory);
            
            log.info("Initial status history record created: id={}, patient={}, status=REGISTERED", 
                savedHistory.getId(), patient.getId());
            
            // Create audit record for patient registration
            createAuditRecord(
                patient.getId(),
                event.getPatientId().toString(),
                PatientEnrollmentAuditEntity.AuditActionType.REGISTER,
                null,
                String.format("{\"firstName\": \"%s\", \"lastName\": \"%s\", \"status\": \"REGISTERED\"}", 
                    event.getFirstName(), event.getLastName()),
                event.getRegisteredBy(),
                "Patient registered in system"
            );
            
            log.info("PatientRegisteredEvent projection completed successfully");
            
        } catch (Exception e) {
            log.error("Error projecting PatientRegisteredEvent: {}", e.getMessage(), e);
            // Don't throw - allow processing to continue
        }
    }
    
    /**
     * Handle PatientEnrolledEvent - Create enrollment record
     */
    @EventHandler
    @Transactional
    public void on(PatientEnrolledEvent event) {
        log.info("Projecting PatientEnrolledEvent: patient={}, study={}, enrollment={}, studySiteId={}", 
            event.getPatientId(), event.getStudyId(), event.getEnrollmentId(), event.getStudySiteId());
        
        // Skip old events that don't have studySiteId (created before immutability fix)
        if (event.getStudySiteId() == null) {
            log.warn("Skipping PatientEnrolledEvent without studySiteId (old event): {}", event.getEnrollmentId());
            return;
        }
        
        // Idempotency check: Skip if enrollment already exists
        Optional<PatientEnrollmentEntity> existingEnrollment = 
            patientEnrollmentRepository.findByAggregateUuid(event.getEnrollmentId().toString());
        if (existingEnrollment.isPresent()) {
            log.info("Enrollment already exists (idempotent replay): enrollmentId={}, screening={}", 
                event.getEnrollmentId(), existingEnrollment.get().getScreeningNumber());
            return;
        }
        
        try {
            // Find patient entity by aggregate UUID
            Optional<PatientEntity> patientOpt = patientRepository.findByAggregateUuid(event.getPatientId().toString());
            if (patientOpt.isEmpty()) {
                log.error("Patient not found for UUID: {}", event.getPatientId());
                throw new IllegalStateException("Patient not found: " + event.getPatientId());
            }
            
            PatientEntity patient = patientOpt.get();
            
            // Look up the real study ID from the site_studies table using studySiteId
            com.clinprecision.common.entity.SiteStudyEntity siteStudy = siteStudyRepository.findById(event.getStudySiteId())
                .orElseThrow(() -> new IllegalStateException(
                    "Site-Study association not found: " + event.getStudySiteId()));
            
            Long realStudyId = siteStudy.getStudyId();
            log.info("Resolved studySiteId={} to studyId={}", event.getStudySiteId(), realStudyId);
            
            // Create enrollment record
            PatientEnrollmentEntity enrollment = PatientEnrollmentEntity.builder()
                .aggregateUuid(event.getEnrollmentId().toString())
                .enrollmentNumber(generateEnrollmentNumber(patient.getId(), event.getStudyId().toString()))
                .patientId(patient.getId())
                .patientAggregateUuid(event.getPatientId().toString())
                .studyId(realStudyId) // Use real study ID from site_studies table
                .studySiteId(event.getStudySiteId()) // Use FK from immutable event
                .siteAggregateUuid(event.getSiteId().toString())
                .screeningNumber(event.getScreeningNumber())
                .enrollmentDate(event.getEnrollmentDate())
                .enrollmentStatus(EnrollmentStatus.ENROLLED)
                .eligibilityConfirmed(event.getEligibilityConfirmed() != null ? event.getEligibilityConfirmed() : false)
                .enrolledBy(event.getEnrolledBy())
                .createdAt(LocalDateTime.now())
                .build();
            
            PatientEnrollmentEntity saved = patientEnrollmentRepository.save(enrollment);
            log.info("Enrollment record created: id={}, screening={}", saved.getId(), saved.getScreeningNumber());
            
            // NOTE: Do NOT automatically change patient status during study enrollment
            // Patient status and study enrollment are separate concepts:
            // - Enrollment = Association with a study (patient_enrollments table)
            // - Status = Lifecycle state (REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED)
            // The status should be changed explicitly via ChangePatientStatusCommand
            // This prevents confusion where enrolling in a study automatically sets status to ENROLLED
            log.info("Patient enrolled in study, but status remains: {}", patient.getStatus());
            
            // Create audit record using real study ID (Long), not UUID
            createAuditRecord(
                saved.getId(),
                event.getEnrollmentId().toString(),
                PatientEnrollmentAuditEntity.AuditActionType.ENROLL,
                null,
                String.format("{\"patientId\": %d, \"studyId\": %d, \"studySiteId\": %d, \"screeningNumber\": \"%s\"}", 
                    patient.getId(), realStudyId, event.getStudySiteId(), event.getScreeningNumber()),
                event.getEnrolledBy(),
                "Patient enrolled in study"
            );
            
            log.info("PatientEnrolledEvent projection completed successfully");
            
        } catch (Exception e) {
            log.error("Error projecting PatientEnrolledEvent: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to project enrollment event", e);
        }
    }
    
    /**
     * Handle PatientStatusChangedEvent - Update patient status and create history record
     * 
     * This handler performs three key operations:
     * 1. Updates patient status in read model (patients table)
     * 2. Creates status history record for audit trail (patient_status_history table)
     * 3. Optionally updates enrollment status if enrollment-specific
     * 
     * Idempotency: Uses event identifier to prevent duplicate status history records
     */
    @EventHandler
    @Transactional
    public void on(PatientStatusChangedEvent event) {
        log.info("Projecting PatientStatusChangedEvent: patient={}, {} → {}, reason={}", 
            event.getPatientId(), event.getPreviousStatus(), event.getNewStatus(), event.getReason());
        
        try {
            // Find patient entity
            Optional<PatientEntity> patientOpt = patientRepository.findByAggregateUuid(event.getPatientId().toString());
            if (patientOpt.isEmpty()) {
                log.error("Patient not found for UUID: {}", event.getPatientId());
                return; // Don't throw - patient might not be in projection yet
            }
            
            PatientEntity patient = patientOpt.get();
            PatientStatus oldStatus = patient.getStatus();
            PatientStatus newStatus = PatientStatus.valueOf(event.getNewStatus());
            
            // Generate event identifier for idempotency
            // Note: In production, this should come from Axon's event metadata
            String eventId = generateEventId(event);
            
            // ============================================================================
            // STEP 1: Check Idempotency - Prevent duplicate status history records
            // ============================================================================
            if (statusHistoryRepository.existsByEventId(eventId)) {
                log.info("Status change event already processed (idempotency check): eventId={}", eventId);
                return; // Event already processed, skip
            }
            
            // ============================================================================
            // STEP 2: Create Status History Record - Audit Trail
            // ============================================================================
            try {
                PatientStatus previousStatus = PatientStatus.valueOf(event.getPreviousStatus());
                
                // Determine enrollment ID (if enrollment-specific)
                Long enrollmentId = null;
                if (event.getEnrollmentId() != null) {
                    Optional<PatientEnrollmentEntity> enrollmentOpt = 
                        patientEnrollmentRepository.findByAggregateUuid(event.getEnrollmentId().toString());
                    if (enrollmentOpt.isPresent()) {
                        enrollmentId = enrollmentOpt.get().getId();
                    }
                }
                
                // Build status history entity
                PatientStatusHistoryEntity statusHistory = PatientStatusHistoryEntity.builder()
                    .patientId(patient.getId())
                    .aggregateUuid(event.getPatientId().toString())
                    .eventId(eventId)
                    .previousStatus(previousStatus)
                    .newStatus(newStatus)
                    .reason(event.getReason())
                    .changedBy(event.getChangedBy())
                    .changedAt(event.getChangedAt() != null ? event.getChangedAt() : LocalDateTime.now())
                    .notes(event.getNotes())
                    .enrollmentId(enrollmentId)
                    .build();
                
                // Save status history
                PatientStatusHistoryEntity savedHistory = statusHistoryRepository.save(statusHistory);
                
                log.info("Status history record created: id={}, {} → {}, reason={}", 
                    savedHistory.getId(), previousStatus, newStatus, event.getReason());
                
            } catch (IllegalArgumentException e) {
                log.error("Invalid status value in event: previous={}, new={}", 
                    event.getPreviousStatus(), event.getNewStatus(), e);
                // Continue with patient status update even if history fails
            } catch (Exception e) {
                log.error("Failed to create status history record: {}", e.getMessage(), e);
                // Continue with patient status update even if history fails
            }
            
            // ============================================================================
            // STEP 3: Update Patient Status - Read Model
            // ============================================================================
            patient.setStatus(newStatus);
            patient.setUpdatedAt(LocalDateTime.now());
            patientRepository.save(patient);
            
            log.info("Patient status updated: patientId={}, {} → {}", 
                patient.getId(), oldStatus, newStatus);
            
            // ============================================================================
            // STEP 4: Update Enrollment Status (if enrollment-specific)
            // ============================================================================
            if (event.getEnrollmentId() != null) {
                Optional<PatientEnrollmentEntity> enrollmentOpt = 
                    patientEnrollmentRepository.findByAggregateUuid(event.getEnrollmentId().toString());
                
                if (enrollmentOpt.isPresent()) {
                    PatientEnrollmentEntity enrollment = enrollmentOpt.get();
                    
                    try {
                        // Map patient status to enrollment status if applicable
                        EnrollmentStatus enrollmentStatus = mapToEnrollmentStatus(newStatus);
                        enrollment.setEnrollmentStatus(enrollmentStatus);
                        enrollment.setUpdatedAt(LocalDateTime.now());
                        patientEnrollmentRepository.save(enrollment);
                        
                        log.info("Enrollment status updated: enrollmentId={}, status={}", 
                            enrollment.getId(), enrollmentStatus);
                            
                    } catch (IllegalArgumentException e) {
                        log.warn("Cannot map patient status {} to enrollment status: {}", 
                            newStatus, e.getMessage());
                    }
                } else {
                    log.warn("Enrollment not found for UUID: {}", event.getEnrollmentId());
                }
            }
            
            // ============================================================================
            // STEP 4.5: Protocol Visit Instantiation (Gap #1 Resolution)
            // ============================================================================
            // When patient becomes ACTIVE, auto-create protocol visits from study schedule
            // Industry standard: Medidata Rave, Oracle InForm auto-instantiate visits
            if ("ACTIVE".equals(event.getNewStatus()) && !"ACTIVE".equals(event.getPreviousStatus())) {
                log.info("Patient transitioned to ACTIVE status, instantiating protocol visits: patientId={}, aggregateUuid={}", 
                    patient.getId(), patient.getAggregateUuid());
                
                try {
                    // Find patient's enrollment to get study and site information
                    // Try by patient ID first, then by aggregate UUID
                    List<PatientEnrollmentEntity> enrollments = patientEnrollmentRepository.findByPatientId(patient.getId());
                    
                    if (enrollments.isEmpty()) {
                        log.warn("No enrollment found by patient ID {}, trying by aggregate UUID: {}", 
                            patient.getId(), patient.getAggregateUuid());
                        enrollments = patientEnrollmentRepository.findByPatientAggregateUuid(patient.getAggregateUuid());
                    }
                    
                    Optional<PatientEnrollmentEntity> enrollmentOpt = enrollments.stream().findFirst();
                    
                    if (enrollmentOpt.isPresent()) {
                        PatientEnrollmentEntity enrollment = enrollmentOpt.get();
                        
                        log.info("Found enrollment: enrollmentId={}, studyId={}, studySiteId={}, enrollmentDate={}", 
                            enrollment.getId(), enrollment.getStudyId(), enrollment.getStudySiteId(), enrollment.getEnrollmentDate());
                        
                        // Instantiate protocol visits
                        List<StudyVisitInstanceEntity> visits = protocolVisitInstantiationService
                            .instantiateProtocolVisits(
                                patient.getId(),           // patientId
                                enrollment.getStudyId(),   // studyId
                                enrollment.getStudySiteId(), // siteId (study_site_id)
                                null,                      // armId (TODO: add when arm assignment implemented)
                                enrollment.getEnrollmentDate() // baselineDate
                            );
                        
                        log.info("Protocol visits instantiated successfully: patientId={}, count={}", 
                            patient.getId(), visits.size());
                            
                    } else {
                        log.warn("Cannot instantiate protocol visits - no enrollment found for patientId: {}", 
                            patient.getId());
                    }
                    
                } catch (Exception e) {
                    log.error("Error instantiating protocol visits for patientId: {}", 
                        patient.getId(), e);
                    // Don't throw - allow status change to succeed even if visit instantiation fails
                }
            }
            
            // ============================================================================
            // STEP 5: Create Audit Record (Legacy)
            // ============================================================================
            createAuditRecord(
                patient.getId(),
                event.getPatientId().toString(),
                PatientEnrollmentAuditEntity.AuditActionType.UPDATE,
                String.format("{\"status\": \"%s\"}", event.getPreviousStatus()),
                String.format("{\"status\": \"%s\"}", event.getNewStatus()),
                event.getChangedBy(),
                event.getReason()
            );
            
            log.info("PatientStatusChangedEvent projection completed successfully: patient={}, {} → {}", 
                event.getPatientId(), event.getPreviousStatus(), event.getNewStatus());
            
        } catch (Exception e) {
            log.error("Error projecting PatientStatusChangedEvent: {}", e.getMessage(), e);
            // Throw exception to ensure transaction rollback and retry
            throw new RuntimeException("Failed to project PatientStatusChangedEvent", e);
        }
    }
    
    /**
     * Handle PatientDemographicsUpdatedEvent - Update patient information in read model
     * 
     * This handler updates the patient entity with new demographic information.
     * Maintains complete audit trail through event sourcing.
     * 
     * Idempotency: Safe to replay - updates are idempotent
     */
    @EventHandler
    @Transactional
    public void on(PatientDemographicsUpdatedEvent event) {
        log.info("Projecting PatientDemographicsUpdatedEvent: patient={}, updatedBy={}", 
            event.getPatientId(), event.getUpdatedBy());
        
        try {
            // Find patient entity
            Optional<PatientEntity> patientOpt = patientRepository.findByAggregateUuid(event.getPatientId().toString());
            if (patientOpt.isEmpty()) {
                log.error("Patient not found for UUID: {}", event.getPatientId());
                return; // Don't throw - patient might not be in projection yet
            }
            
            PatientEntity patient = patientOpt.get();
            
            // Capture old values for audit
            String oldValues = String.format("{\"firstName\":\"%s\",\"middleName\":\"%s\",\"lastName\":\"%s\"," +
                "\"dateOfBirth\":\"%s\",\"gender\":\"%s\",\"phoneNumber\":\"%s\",\"email\":\"%s\"}",
                patient.getFirstName(), patient.getMiddleName(), patient.getLastName(),
                patient.getDateOfBirth(), patient.getGender(), patient.getPhoneNumber(), patient.getEmail());
            
            // Update patient entity with new values (only non-null values from event)
            if (event.getFirstName() != null) patient.setFirstName(event.getFirstName());
            if (event.getMiddleName() != null) patient.setMiddleName(event.getMiddleName());
            if (event.getLastName() != null) patient.setLastName(event.getLastName());
            if (event.getDateOfBirth() != null) patient.setDateOfBirth(event.getDateOfBirth());
            if (event.getGender() != null) {
                try {
                    patient.setGender(PatientGender.valueOf(event.getGender().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid gender value in event: {}", event.getGender());
                }
            }
            if (event.getPhoneNumber() != null) patient.setPhoneNumber(event.getPhoneNumber());
            if (event.getEmail() != null) patient.setEmail(event.getEmail());
            
            patient.setUpdatedAt(event.getUpdatedAt() != null ? event.getUpdatedAt() : LocalDateTime.now());
            
            // Save updated patient
            patientRepository.save(patient);
            
            log.info("Patient demographics updated: patientId={}, name={} {}", 
                patient.getId(), patient.getFirstName(), patient.getLastName());
            
            // Create audit record with new values
            String newValues = String.format("{\"firstName\":\"%s\",\"middleName\":\"%s\",\"lastName\":\"%s\"," +
                "\"dateOfBirth\":\"%s\",\"gender\":\"%s\",\"phoneNumber\":\"%s\",\"email\":\"%s\"}",
                patient.getFirstName(), patient.getMiddleName(), patient.getLastName(),
                patient.getDateOfBirth(), patient.getGender(), patient.getPhoneNumber(), patient.getEmail());
            
            createAuditRecord(
                patient.getId(),
                event.getPatientId().toString(),
                PatientEnrollmentAuditEntity.AuditActionType.UPDATE,
                oldValues,
                newValues,
                event.getUpdatedBy(),
                "Patient demographics updated"
            );
            
            log.info("PatientDemographicsUpdatedEvent projection completed successfully: patient={}", 
                event.getPatientId());
            
        } catch (Exception e) {
            log.error("Error projecting PatientDemographicsUpdatedEvent: {}", e.getMessage(), e);
            // Throw exception to ensure transaction rollback and retry
            throw new RuntimeException("Failed to project PatientDemographicsUpdatedEvent", e);
        }
    }
    
    /**
     * Generate event identifier for idempotency checks
     * 
     * In production, this should be extracted from Axon's event metadata.
     * For now, we generate a deterministic ID based on event properties.
     * 
     * @param event the status changed event
     * @return unique event identifier
     */
    private String generateEventId(PatientStatusChangedEvent event) {
        // Generate deterministic ID based on event properties
        // In production, use: event.getMetaData().get("eventIdentifier")
        String composite = String.format("%s-%s-%s-%s-%s",
            event.getPatientId(),
            event.getPreviousStatus(),
            event.getNewStatus(),
            event.getChangedBy(),
            event.getChangedAt() != null ? event.getChangedAt().toString() : "now"
        );
        
        // Generate UUID from composite string (deterministic)
        return java.util.UUID.nameUUIDFromBytes(composite.getBytes()).toString();
    }
    
    /**
     * Generate unique event ID for PatientRegisteredEvent (idempotency).
     * 
     * @param event the patient registered event
     * @return unique event identifier
     */
    private String generateEventIdForRegistration(PatientRegisteredEvent event) {
        // Generate deterministic ID based on event properties
        String composite = String.format("REGISTERED-%s-%s-%s",
            event.getPatientId(),
            event.getRegisteredBy(),
            event.getRegisteredAt() != null ? event.getRegisteredAt().toString() : "now"
        );
        
        // Generate UUID from composite string (deterministic)
        return java.util.UUID.nameUUIDFromBytes(composite.getBytes()).toString();
    }
    
    /**
     * Wait for patient entity to be created by PatientProjectionHandler.
     * 
     * Since multiple event handlers process PatientRegisteredEvent in parallel,
     * this projector may execute before the patient entity is created.
     * This method implements exponential backoff retry logic.
     * 
     * @param patientAggregateUuid the patient aggregate UUID
     * @param timeoutMs maximum time to wait in milliseconds
     * @return patient entity if found, null if timeout
     */
    private PatientEntity waitForPatientEntity(String patientAggregateUuid, long timeoutMs) {
        long startTime = System.currentTimeMillis();
        int attempt = 0;
        long[] delays = {10, 20, 50, 100, 200, 500}; // Exponential backoff
        
        while (System.currentTimeMillis() - startTime < timeoutMs) {
            Optional<PatientEntity> patientOpt = patientRepository.findByAggregateUuid(patientAggregateUuid);
            
            if (patientOpt.isPresent()) {
                log.info("Patient entity found after {}ms (attempt {})", 
                    System.currentTimeMillis() - startTime, attempt + 1);
                return patientOpt.get();
            }
            
            // Exponential backoff
            long delay = attempt < delays.length ? delays[attempt] : delays[delays.length - 1];
            attempt++;
            
            try {
                Thread.sleep(delay);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("Wait for patient entity interrupted");
                return null;
            }
        }
        
        log.error("Patient entity not found after {}ms and {} attempts", timeoutMs, attempt);
        return null;
    }
    
    /**
     * Map PatientStatus to EnrollmentStatus
     * 
     * Not all patient statuses have enrollment equivalents.
     * This handles the mapping for enrollment-specific scenarios.
     * 
     * @param patientStatus the patient status
     * @return corresponding enrollment status
     * @throws IllegalArgumentException if no mapping exists
     */
    private EnrollmentStatus mapToEnrollmentStatus(PatientStatus patientStatus) {
        switch (patientStatus) {
            case ENROLLED:
                return EnrollmentStatus.ENROLLED;
            case ACTIVE:
                return EnrollmentStatus.ENROLLED; // Active patients are enrolled
            case COMPLETED:
                return EnrollmentStatus.ENROLLED; // Completed patients remain enrolled
            case WITHDRAWN:
                return EnrollmentStatus.INELIGIBLE; // Map withdrawn to ineligible
            default:
                throw new IllegalArgumentException(
                    "Patient status " + patientStatus + " has no enrollment status mapping"
                );
        }
    }
    
    /**
     * Generate enrollment number
     */
    private String generateEnrollmentNumber(Long patientId, String studyId) {
        String studyPart = extractShortId(studyId);
        String ts = String.valueOf(System.currentTimeMillis()).substring(6);
        return "ENR-" + studyPart + "-" + patientId + "-" + ts;
    }
    
    /**
     * Extract Long ID from UUID string (temporary until we have proper UUID → Long mapping)
     */
    private Long extractLongId(String uuid) {
        // This is a temporary solution
        // In production, we'd have a proper UUID → Long ID mapping service
        return Math.abs(uuid.hashCode()) % 1000000L;
    }
    
    /**
     * Extract short ID for display
     */
    private String extractShortId(String uuid) {
        return uuid.substring(0, 8);
    }
    
    /**
     * Create audit record
     */
    private void createAuditRecord(
        Long entityId,
        String entityUuid,
        PatientEnrollmentAuditEntity.AuditActionType actionType,
        String oldValues,
        String newValues,
        String performedBy,
        String reason
    ) {
        try {
            PatientEnrollmentAuditEntity audit = PatientEnrollmentAuditEntity.builder()
                .entityType(PatientEnrollmentAuditEntity.AuditEntityType.ENROLLMENT)
                .entityId(entityId)
                .entityAggregateUuid(entityUuid)
                .actionType(actionType)
                .oldValues(oldValues)
                .newValues(newValues)
                .performedBy(performedBy)
                .performedAt(LocalDateTime.now())
                .reason(reason)
                .build();
            
            auditRepository.save(audit);
            log.debug("Audit record created: action={}, entity={}", actionType, entityId);
            
        } catch (Exception e) {
            log.warn("Failed to create audit record: {}", e.getMessage());
            // Don't throw - audit failure shouldn't break the projection
        }
    }
}
