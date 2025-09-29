package com.clinprecision.datacaptureservice.patientenrollment.events;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event raised when a patient is registered
 * Follows consistent event pattern across the system
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
    private final String registeredBy;
    private final LocalDateTime registeredAt;
}
