package com.clinprecision.datacaptureservice.patientenrollment.domain.events;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event emitted when a patient is successfully registered in the system
 * Follows established patterns from other ClinPrecision domain events
 */
@Getter
@Builder
@ToString
public class PatientRegisteredEvent {

    private final UUID patientId;
    private final String firstName;
    private final String middleName;
    private final String lastName;
    private final LocalDate dateOfBirth;
    private final String gender;
    private final String phoneNumber;
    private final String email;
    private final String createdBy;
    private final String registeredBy;
    private final LocalDateTime registeredAt;
    
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
        return LocalDate.now().getYear() - dateOfBirth.getYear();
    }
    
    public boolean hasContactInfo() {
        return (phoneNumber != null && !phoneNumber.trim().isEmpty()) ||
               (email != null && !email.trim().isEmpty());
    }
}