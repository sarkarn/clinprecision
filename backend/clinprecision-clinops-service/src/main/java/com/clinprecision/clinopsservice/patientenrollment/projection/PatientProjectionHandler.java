package com.clinprecision.clinopsservice.patientenrollment.projection;

import com.clinprecision.clinopsservice.patientenrollment.domain.events.PatientRegisteredEvent;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEntity;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientGender;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientStatus;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientRepository;

import org.axonframework.config.ProcessingGroup;
import org.axonframework.eventhandling.EventHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Patient Projection Handler - Updates read models from patient events
 * 
 * Creates the read-side projections from patient domain events.
 * Separates the write model (aggregate) from read model (entity) for CQRS pattern.
 * 
 * Follows established ClinPrecision patterns for event handling.
 */
@Component
@ProcessingGroup("patient-projection")
public class PatientProjectionHandler {

    @Autowired
    private PatientRepository patientRepository;

    @PostConstruct
    public void init() {
        System.out.println("[PATIENT_PROJECTION] ========== Patient Projection Handler INITIALIZED ==========");
        System.out.println("[PATIENT_PROJECTION] Handler is ready to process PatientRegisteredEvent");
        System.out.println("[PATIENT_PROJECTION] Processing Group: patient-projection");
        System.out.println("[PATIENT_PROJECTION] Repository: " + (patientRepository != null ? "INJECTED" : "NULL"));
        System.out.println("[PATIENT_PROJECTION] ========== Handler Registration Complete ==========");
    }

    /**
     * Handle Patient Registered Event
     * Creates or updates the patient read model entity
     */
    @EventHandler
    public void on(PatientRegisteredEvent event) {
        System.out.println("[PATIENT_PROJECTION] Processing PatientRegisteredEvent for patient: " + event.getPatientId());
        
        try {
            // Check if patient entity already exists with this aggregate UUID
            Optional<PatientEntity> existingPatient = patientRepository.findByAggregateUuid(event.getPatientId().toString());
            
            if (existingPatient.isPresent()) {
                System.out.println("[PATIENT_PROJECTION] Patient entity already exists, updating...");
                PatientEntity patient = existingPatient.get();
                updatePatientEntity(patient, event);
                patientRepository.save(patient);
            } else {
                System.out.println("[PATIENT_PROJECTION] Creating new patient entity...");
                PatientEntity newPatient = createPatientEntity(event);
                patientRepository.save(newPatient);
            }
            
            System.out.println("[PATIENT_PROJECTION] PatientRegisteredEvent processed successfully");
            
        } catch (Exception e) {
            System.err.println("[PATIENT_PROJECTION] Error processing PatientRegisteredEvent: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Create new patient entity from event
     */
    private PatientEntity createPatientEntity(PatientRegisteredEvent event) {
        return PatientEntity.builder()
                .aggregateUuid(event.getPatientId().toString())
                .patientNumber(generatePatientNumber(event))
                .firstName(event.getFirstName())
                .middleName(event.getMiddleName())
                .lastName(event.getLastName())
                .dateOfBirth(event.getDateOfBirth())
                .gender(PatientGender.valueOf(event.getGender().toUpperCase()))
                .phoneNumber(event.getPhoneNumber())
                .email(event.getEmail())
                .status(PatientStatus.REGISTERED)
                .createdBy(event.getCreatedBy() != null ? event.getCreatedBy() : event.getRegisteredBy())
                .createdAt(event.getRegisteredAt() != null ? event.getRegisteredAt() : LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Update existing patient entity from event
     */
    private void updatePatientEntity(PatientEntity patient, PatientRegisteredEvent event) {
        patient.setFirstName(event.getFirstName());
        patient.setMiddleName(event.getMiddleName());
        patient.setLastName(event.getLastName());
        patient.setDateOfBirth(event.getDateOfBirth());
        patient.setGender(PatientGender.valueOf(event.getGender().toUpperCase()));
        patient.setPhoneNumber(event.getPhoneNumber());
        patient.setEmail(event.getEmail());
        patient.setUpdatedAt(LocalDateTime.now());
    }

    /**
     * Generate a human-readable patient number
     * In production, this would use a more sophisticated numbering scheme
     */
    private String generatePatientNumber(PatientRegisteredEvent event) {
        // Simple implementation - use first letter of last name + first letter of first name + timestamp
        String initials = (event.getLastName().substring(0, 1) + event.getFirstName().substring(0, 1)).toUpperCase();
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(8); // Last 5 digits
        return "P" + initials + timestamp;
    }
}
