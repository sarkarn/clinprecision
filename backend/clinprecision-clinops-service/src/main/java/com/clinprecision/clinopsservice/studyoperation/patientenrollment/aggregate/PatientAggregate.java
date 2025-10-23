package com.clinprecision.clinopsservice.studyoperation.patientenrollment.aggregate;

import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import com.clinprecision.clinopsservice.studyoperation.patientenrollment.domain.commands.RegisterPatientCommand;
import com.clinprecision.clinopsservice.studyoperation.patientenrollment.domain.commands.EnrollPatientCommand;
import com.clinprecision.clinopsservice.studyoperation.patientenrollment.domain.commands.ChangePatientStatusCommand;
import com.clinprecision.clinopsservice.studyoperation.patientenrollment.domain.commands.UpdatePatientDemographicsCommand;
import com.clinprecision.clinopsservice.studyoperation.patientenrollment.domain.events.PatientRegisteredEvent;
import com.clinprecision.clinopsservice.studyoperation.patientenrollment.domain.events.PatientEnrolledEvent;
import com.clinprecision.clinopsservice.studyoperation.patientenrollment.domain.events.PatientStatusChangedEvent;
import com.clinprecision.clinopsservice.studyoperation.patientenrollment.domain.events.PatientDemographicsUpdatedEvent;
import com.clinprecision.clinopsservice.studyoperation.patientenrollment.entity.PatientStatus;

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
     * 
     * NOTE: Enrollment in a study does NOT automatically change patient status.
     * Patient status lifecycle (REGISTERED → SCREENING → ENROLLED → ACTIVE → COMPLETED)
     * is separate from study enrollment (association with a study).
     * Status changes must be explicit via ChangePatientStatusCommand.
     */
    @EventSourcingHandler
    public void on(PatientEnrolledEvent event) {
        logger.info("Applying PatientEnrolledEvent for patient: {}", event.getPatientId());
        
        // Add study to enrollments set
        this.studyEnrollments.add(event.getStudyId());
        
        // DO NOT change status here - enrollment ≠ status change
        // Status remains whatever it was (typically REGISTERED)
        
        logger.info("Patient {} now enrolled in {} studies, status remains: {}", 
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
            .relatedRecordId(command.getRelatedRecordId())
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
    
    /**
     * Command Handler: Update Patient Demographics
     * Business Rules:
     * - Patient must exist (aggregate already created)
     * - At least one field must be provided
     * - If dateOfBirth changes, patient must still be 18+
     * - Must have either phone or email
     */
    @CommandHandler
    public void handle(UpdatePatientDemographicsCommand command) {
        logger.info("Handling UpdatePatientDemographicsCommand for patient: {}", command.getPatientId());
        
        // Validate command
        command.validate();
        
        // Apply event with both old and new values for audit trail
        AggregateLifecycle.apply(PatientDemographicsUpdatedEvent.builder()
            .patientId(command.getPatientId())
            .firstName(command.getFirstName() != null ? command.getFirstName() : this.firstName)
            .middleName(command.getMiddleName() != null ? command.getMiddleName() : this.middleName)
            .lastName(command.getLastName() != null ? command.getLastName() : this.lastName)
            .dateOfBirth(command.getDateOfBirth() != null ? command.getDateOfBirth() : this.dateOfBirth)
            .gender(command.getGender() != null ? command.getGender() : this.gender)
            .phoneNumber(command.getPhoneNumber() != null ? command.getPhoneNumber() : this.phoneNumber)
            .email(command.getEmail() != null ? command.getEmail() : this.email)
            .updatedBy(command.getUpdatedBy())
            .updatedAt(LocalDateTime.now())
            .build());
        
        logger.info("PatientDemographicsUpdatedEvent emitted for patient: {}", command.getPatientId());
    }
    
    /**
     * Event Sourcing Handler: Patient Demographics Updated
     */
    @EventSourcingHandler
    public void on(PatientDemographicsUpdatedEvent event) {
        logger.info("Applying PatientDemographicsUpdatedEvent for patient: {}", event.getPatientId());
        
        // Update aggregate state with new values
        if (event.getFirstName() != null) this.firstName = event.getFirstName();
        if (event.getMiddleName() != null) this.middleName = event.getMiddleName();
        if (event.getLastName() != null) this.lastName = event.getLastName();
        if (event.getDateOfBirth() != null) this.dateOfBirth = event.getDateOfBirth();
        if (event.getGender() != null) this.gender = event.getGender();
        if (event.getPhoneNumber() != null) this.phoneNumber = event.getPhoneNumber();
        if (event.getEmail() != null) this.email = event.getEmail();
        
        logger.info("Patient {} demographics updated", event.getPatientId());
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



