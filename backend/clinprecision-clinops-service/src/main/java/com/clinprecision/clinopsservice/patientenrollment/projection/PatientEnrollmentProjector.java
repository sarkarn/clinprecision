package com.clinprecision.clinopsservice.patientenrollment.projection;

import com.clinprecision.clinopsservice.patientenrollment.domain.events.PatientEnrolledEvent;
import com.clinprecision.clinopsservice.patientenrollment.domain.events.PatientStatusChangedEvent;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEntity;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEnrollmentEntity;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEnrollmentAuditEntity;
import com.clinprecision.clinopsservice.patientenrollment.entity.EnrollmentStatus;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientStatus;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientRepository;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientEnrollmentRepository;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientEnrollmentAuditRepository;

import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Optional;

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
    
    /**
     * Handle PatientEnrolledEvent - Create enrollment record
     */
    @EventHandler
    @Transactional
    public void on(PatientEnrolledEvent event) {
        log.info("Projecting PatientEnrolledEvent: patient={}, study={}, enrollment={}", 
            event.getPatientId(), event.getStudyId(), event.getEnrollmentId());
        
        try {
            // Find patient entity by aggregate UUID
            Optional<PatientEntity> patientOpt = patientRepository.findByAggregateUuid(event.getPatientId().toString());
            if (patientOpt.isEmpty()) {
                log.error("Patient not found for UUID: {}", event.getPatientId());
                throw new IllegalStateException("Patient not found: " + event.getPatientId());
            }
            
            PatientEntity patient = patientOpt.get();
            
            // Find site-study association to get Long IDs
            // Note: event.getSiteId() is the site aggregate UUID, we need to find the association
            // For now, we'll need to look up by study and site UUIDs
            // This is a temporary solution - ideally we'd pass the association ID in the command
            
            // Create enrollment record
            PatientEnrollmentEntity enrollment = PatientEnrollmentEntity.builder()
                .aggregateUuid(event.getEnrollmentId().toString())
                .enrollmentNumber(generateEnrollmentNumber(patient.getId(), event.getStudyId().toString()))
                .patientId(patient.getId())
                .patientAggregateUuid(event.getPatientId().toString())
                .studyId(extractLongId(event.getStudyId().toString()))
                .studySiteId(null) // Will be updated when we have proper site-study lookup
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
            
            // Update patient status to ENROLLED
            patient.setStatus(PatientStatus.ENROLLED);
            patient.setUpdatedAt(LocalDateTime.now());
            patientRepository.save(patient);
            log.info("Patient status updated to ENROLLED: {}", patient.getId());
            
            // Create audit record
            createAuditRecord(
                saved.getId(),
                event.getEnrollmentId().toString(),
                PatientEnrollmentAuditEntity.AuditActionType.ENROLL,
                null,
                String.format("{\"patientId\": %d, \"studyId\": %s, \"screeningNumber\": \"%s\"}", 
                    patient.getId(), event.getStudyId(), event.getScreeningNumber()),
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
     * Handle PatientStatusChangedEvent - Update patient status
     */
    @EventHandler
    @Transactional
    public void on(PatientStatusChangedEvent event) {
        log.info("Projecting PatientStatusChangedEvent: patient={}, {} → {}", 
            event.getPatientId(), event.getPreviousStatus(), event.getNewStatus());
        
        try {
            // Find patient entity
            Optional<PatientEntity> patientOpt = patientRepository.findByAggregateUuid(event.getPatientId().toString());
            if (patientOpt.isEmpty()) {
                log.error("Patient not found for UUID: {}", event.getPatientId());
                return; // Don't throw - patient might not be in projection yet
            }
            
            PatientEntity patient = patientOpt.get();
            PatientStatus oldStatus = patient.getStatus();
            
            // Update status
            patient.setStatus(PatientStatus.valueOf(event.getNewStatus()));
            patient.setUpdatedAt(LocalDateTime.now());
            patientRepository.save(patient);
            
            log.info("Patient status updated: {} → {}", oldStatus, event.getNewStatus());
            
            // If enrollment-specific, update enrollment record
            if (event.getEnrollmentId() != null) {
                Optional<PatientEnrollmentEntity> enrollmentOpt = 
                    patientEnrollmentRepository.findByAggregateUuid(event.getEnrollmentId().toString());
                
                if (enrollmentOpt.isPresent()) {
                    PatientEnrollmentEntity enrollment = enrollmentOpt.get();
                    enrollment.setEnrollmentStatus(
                        EnrollmentStatus.valueOf(event.getNewStatus())
                    );
                    enrollment.setUpdatedAt(LocalDateTime.now());
                    patientEnrollmentRepository.save(enrollment);
                    
                    log.info("Enrollment status updated: {}", enrollment.getId());
                }
            }
            
            // Create audit record
            createAuditRecord(
                patient.getId(),
                event.getPatientId().toString(),
                PatientEnrollmentAuditEntity.AuditActionType.UPDATE,
                String.format("{\"status\": \"%s\"}", event.getPreviousStatus()),
                String.format("{\"status\": \"%s\"}", event.getNewStatus()),
                event.getChangedBy(),
                event.getReason()
            );
            
            log.info("PatientStatusChangedEvent projection completed successfully");
            
        } catch (Exception e) {
            log.error("Error projecting PatientStatusChangedEvent: {}", e.getMessage(), e);
            // Don't throw - allow processing to continue
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
