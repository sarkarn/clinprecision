package com.clinprecision.datacaptureservice.patientenrollment.aggregate;

import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;

import com.clinprecision.datacaptureservice.patientenrollment.domain.commands.RegisterPatientCommand;
import com.clinprecision.datacaptureservice.patientenrollment.domain.events.PatientRegisteredEvent;

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
    
    private void validatePatientRegistration(RegisterPatientCommand command) {
        if (!command.hasContactInfo()) {
            throw new IllegalArgumentException("Patient must have either phone number or email");
        }
        
        if (command.getAge() < 18) {
            throw new IllegalArgumentException("Patient must be at least 18 years old");
        }
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
    
    public enum PatientStatus {
        REGISTERED("Registered", "Patient has been registered in system"),
        SCREENING("Screening", "Patient is undergoing screening for studies"),
        ENROLLED("Enrolled", "Patient is enrolled in one or more studies"),  
        WITHDRAWN("Withdrawn", "Patient has withdrawn from all studies"),
        COMPLETED("Completed", "Patient has completed all study participation");
        
        private final String displayName;
        private final String description;
        
        PatientStatus(String displayName, String description) {
            this.displayName = displayName;
            this.description = description;
        }
        
        public String getDisplayName() { return displayName; }
        public String getDescription() { return description; }
    }
}
