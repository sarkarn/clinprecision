package com.clinprecision.clinopsservice.studyoperation.patientenrollment.domain.events;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event emitted when patient demographic information is updated
 * 
 * Immutable event for CQRS/Event Sourcing pattern.
 * Maintains complete audit trail for FDA 21 CFR Part 11 compliance.
 * 
 * Follows established ClinPrecision event patterns.
 * 
 * @see PatientRegisteredEvent
 * @see PatientStatusChangedEvent
 */
@Getter
@Builder
@ToString
public class PatientDemographicsUpdatedEvent {

    private final UUID patientId;
    private final String firstName;
    private final String middleName;
    private final String lastName;
    private final LocalDate dateOfBirth;
    private final String gender;
    private final String phoneNumber;
    private final String email;
    private final String updatedBy;
    private final LocalDateTime updatedAt;
    
    public String getFullName() {
        if (firstName == null || lastName == null) return null;
        StringBuilder fullName = new StringBuilder(firstName);
        if (middleName != null && !middleName.trim().isEmpty()) {
            fullName.append(" ").append(middleName);
        }
        fullName.append(" ").append(lastName);
        return fullName.toString();
    }
}
