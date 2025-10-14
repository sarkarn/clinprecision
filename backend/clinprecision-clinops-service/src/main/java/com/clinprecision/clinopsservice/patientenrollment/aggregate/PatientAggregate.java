package com.clinprecision.clinopsservice.patientenrollment.aggregate;

import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import com.clinprecision.clinopsservice.patientenrollment.domain.commands.RegisterPatientCommand;
import com.clinprecision.clinopsservice.patientenrollment.domain.commands.EnrollPatientCommand;
import com.clinprecision.clinopsservice.patientenrollment.domain.commands.ChangePatientStatusCommand;
import com.clinprecision.clinopsservice.patientenrollment.domain.events.PatientRegisteredEvent;
import com.clinprecision.clinopsservice.patientenrollment.domain.events.PatientEnrolledEvent;
import com.clinprecision.clinopsservice.patientenrollment.domain.events.PatientStatusChangedEvent;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientStatus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Patient Aggregate - Core domain object for patient management
 * 
 * Implements Event Sourcing for:
 * - Complete audit trail (FDA 21 CFR Part 11 compliance)  
 * - Immutable patient history
 * - Regulatory compliance tracking
 * 
 * This aggregate handles the complete lifecycle of a patient
 */
@Aggregate
public class PatientAggregate {
    
    private static final Logger logger = LoggerFactory.getLogger(PatientAggregate.class);

    @AggregateIdentifier
    private UUID patientId;
    
    private String firstName;
    private String middleName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private String phoneNumber;
    private String email;
    private PatientStatus status;
    private Set<UUID> studyEnrollments;
    private LocalDateTime registeredAt;
    private String registeredBy;
    
    // Required default constructor for Axon
    public PatientAggregate() {
        this.studyEnrollments = new HashSet<>();
    }

    /**
     * Command Handler: Register Patient
     * Business Rules:
     * - Patient must be at least 18 years old
     * - Email must be unique (if provided)
     * - Contact information required
     */
    @CommandHandler
    public PatientAggregate(RegisterPatientCommand command) {
        // Validate command
        command.validate();
        
        // Business rule validation
        validatePatientRegistration(command);
        
        // Apply event
        AggregateLifecycle.apply(PatientRegisteredEvent.builder()
            .patientId(command.getPatientId())
            .firstName(command.getFirstName())
            .middleName(command.getMiddleName())
            .lastName(command.getLastName())
            .dateOfBirth(command.getDateOfBirth())
            .gender(command.getGender())
            .phoneNumber(command.getPhoneNumber())
            .email(command.getEmail())
            .createdBy(command.getCreatedBy())
            .registeredBy(command.getCreatedBy())
            .registeredAt(LocalDateTime.now())
            .build());
    }
    
    /**
     * Event Sourcing Handler: Patient Registered
     */
    @EventSourcingHandler
    public void on(PatientRegisteredEvent event) {
        this.patientId = event.getPatientId();
        this.firstName = event.getFirstName();
        this.middleName = event.getMiddleName();
        this.lastName = event.getLastName();
        this.dateOfBirth = event.getDateOfBirth();
        this.gender = event.getGender();
        this.phoneNumber = event.getPhoneNumber();
        this.email = event.getEmail();
        this.status = PatientStatus.REGISTERED;
        this.registeredAt = event.getRegisteredAt();
        this.registeredBy = event.getRegisteredBy();
    }
    
    /**
     * Command Handler: Enroll Patient
     * Business Rules:
     * - Patient must exist (aggregate already created)
     * - Patient must be in REGISTERED or SCREENING status
     * - Cannot enroll in same study twice
     * - Study and site must be valid (validated by service layer)
     */
    @CommandHandler
    public void handle(EnrollPatientCommand command) {
        logger.info("Handling EnrollPatientCommand for patient: {}, study: {}, site: {}", 
            command.getPatientId(), command.getStudyId(), command.getSiteId());
        
        // Validate command
        command.validate();
        
        // Business rule validation
        validateEnrollment(command);
        
        // Apply event
        logger.info("Creating PatientEnrolledEvent with studySiteId={}", command.getStudySiteId());
        AggregateLifecycle.apply(PatientEnrolledEvent.builder()
            .enrollmentId(command.getEnrollmentId())
            .patientId(command.getPatientId())
            .studyId(command.getStudyId())
            .siteId(command.getSiteId())
            .studySiteId(command.getStudySiteId())  // Pass FK from command to event for immutable projection
            .screeningNumber(command.getScreeningNumber())
            .enrollmentDate(command.getEnrollmentDate() != null ? command.getEnrollmentDate() : LocalDate.now())
            .enrollmentStatus("ENROLLED")
            .enrolledBy(command.getCreatedBy())
            .enrolledAt(LocalDateTime.now())
            .createdBy(command.getCreatedBy())
            .eligibilityConfirmed(false)
            .build());
        
        logger.info("PatientEnrolledEvent emitted for patient: {}, enrollment: {}", 
            command.getPatientId(), command.getEnrollmentId());
    }
    
    /**
     * Event Sourcing Handler: Patient Enrolled
     */
    @EventSourcingHandler
    public void on(PatientEnrolledEvent event) {
        logger.info("Applying PatientEnrolledEvent for patient: {}", event.getPatientId());
        
        // Add study to enrollments set
        this.studyEnrollments.add(event.getStudyId());
        
        // Update status to ENROLLED
        this.status = PatientStatus.ENROLLED;
        
        logger.info("Patient {} now enrolled in {} studies, status: {}", 
            event.getPatientId(), this.studyEnrollments.size(), this.status);
    }
    
    /**
     * Command Handler: Change Patient Status
     * Business Rules:
     * - Patient must exist
     * - Status transition must be valid
     * - Reason must be provided
     */
    @CommandHandler
    public void handle(ChangePatientStatusCommand command) {
        logger.info("Handling ChangePatientStatusCommand for patient: {}, new status: {}", 
            command.getPatientId(), command.getNewStatus());
        
        // Validate command
        command.validate();
        
        // Validate status transition
        validateStatusChange(command.getNewStatus(), command.getReason());
        
        // Apply event
        AggregateLifecycle.apply(PatientStatusChangedEvent.builder()
            .patientId(command.getPatientId())
            .previousStatus(this.status.name())
            .newStatus(command.getNewStatus().toUpperCase())
            .reason(command.getReason())
            .changedBy(command.getChangedBy())
            .changedAt(LocalDateTime.now())
            .enrollmentId(command.getEnrollmentId())
            .notes(command.getNotes())
            .build());
        
        logger.info("PatientStatusChangedEvent emitted for patient: {}", command.getPatientId());
    }
    
    /**
     * Event Sourcing Handler: Patient Status Changed
     */
    @EventSourcingHandler
    public void on(PatientStatusChangedEvent event) {
        logger.info("Applying PatientStatusChangedEvent for patient: {} from {} to {}", 
            event.getPatientId(), event.getPreviousStatus(), event.getNewStatus());
        
        this.status = PatientStatus.valueOf(event.getNewStatus());
        
        logger.info("Patient {} status updated to {}", event.getPatientId(), this.status);
    }
    
    private void validatePatientRegistration(RegisterPatientCommand command) {
        if (!command.hasContactInfo()) {
            throw new IllegalArgumentException("Patient must have either phone number or email");
        }
        
        if (command.getAge() < 18) {
            throw new IllegalArgumentException("Patient must be at least 18 years old");
        }
    }
    
    private void validateEnrollment(EnrollPatientCommand command) {
        // Patient must be in eligible status
        if (status != PatientStatus.REGISTERED && status != PatientStatus.SCREENING) {
            throw new IllegalStateException(
                String.format("Cannot enroll patient in status %s. Must be REGISTERED or SCREENING", status)
            );
        }
        
        // Cannot enroll in same study twice
        if (studyEnrollments.contains(command.getStudyId())) {
            throw new IllegalStateException(
                String.format("Patient %s is already enrolled in study %s", patientId, command.getStudyId())
            );
        }
        
        logger.info("Enrollment validation passed for patient: {}", command.getPatientId());
    }
    
    private void validateStatusChange(String newStatus, String reason) {
        String currentStatusStr = this.status.name();
        
        // Build valid transition message
        String validTransitions = "Valid transitions: REGISTERED→SCREENING, SCREENING→ENROLLED, " +
                                 "ENROLLED→ACTIVE, ACTIVE→COMPLETED, ANY→WITHDRAWN";
        
        // Check if transition is valid
        boolean isValid = false;
        
        if ("SCREENING".equals(newStatus) && "REGISTERED".equals(currentStatusStr)) {
            isValid = true;
        } else if ("ENROLLED".equals(newStatus) && "SCREENING".equals(currentStatusStr)) {
            isValid = true;
        } else if ("ACTIVE".equals(newStatus) && "ENROLLED".equals(currentStatusStr)) {
            isValid = true;
        } else if ("COMPLETED".equals(newStatus) && "ACTIVE".equals(currentStatusStr)) {
            isValid = true;
        } else if ("WITHDRAWN".equals(newStatus)) {
            // Can withdraw from any status
            isValid = true;
        }
        
        if (!isValid) {
            throw new IllegalStateException(
                String.format("Invalid status transition from %s to %s. %s", 
                    currentStatusStr, newStatus, validTransitions)
            );
        }
        
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Reason is required for status change");
        }
        
        logger.info("Status change validation passed: {} → {}", currentStatusStr, newStatus);
    }
    
    // Business methods
    public String getFullName() {
        StringBuilder fullName = new StringBuilder(firstName);
        if (middleName != null && !middleName.trim().isEmpty()) {
            fullName.append(" ").append(middleName);
        }
        fullName.append(" ").append(lastName);
        return fullName.toString();
    }
    
    public int getAge() {
        if (dateOfBirth == null) return 0;
        return dateOfBirth.until(LocalDate.now()).getYears();
    }
    
    public boolean isEligibleForStudy() {
        return status == PatientStatus.REGISTERED && getAge() >= 18;
    }
    
    // Getters for aggregate state
    public UUID getPatientId() { return patientId; }
    public PatientStatus getStatus() { return status; }
    public Set<UUID> getStudyEnrollments() { return studyEnrollments; }
}



