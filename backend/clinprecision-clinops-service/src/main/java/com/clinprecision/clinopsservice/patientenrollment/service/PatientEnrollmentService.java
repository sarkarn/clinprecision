package com.clinprecision.clinopsservice.patientenrollment.service;

import com.clinprecision.clinopsservice.patientenrollment.domain.commands.RegisterPatientCommand;
import com.clinprecision.clinopsservice.patientenrollment.domain.commands.EnrollPatientCommand;
import com.clinprecision.clinopsservice.patientenrollment.dto.EnrollPatientDto;
import com.clinprecision.clinopsservice.patientenrollment.dto.RegisterPatientDto;
import com.clinprecision.clinopsservice.patientenrollment.dto.PatientDto;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEntity;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEnrollmentEntity;
import com.clinprecision.clinopsservice.patientenrollment.entity.EnrollmentStatus;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientRepository;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientEnrollmentRepository;
import com.clinprecision.clinopsservice.patientenrollment.repository.PatientEnrollmentAuditRepository;
import com.clinprecision.clinopsservice.patientenrollment.entity.PatientEnrollmentAuditEntity;
import com.clinprecision.clinopsservice.patientenrollment.repository.SiteStudyRepository;
import com.clinprecision.common.entity.SiteStudyEntity;
import com.clinprecision.clinopsservice.repository.StudyRepository;
import com.clinprecision.clinopsservice.repository.StudyArmRepository;
import com.clinprecision.clinopsservice.entity.StudyEntity;
import com.clinprecision.clinopsservice.entity.StudyArmEntity;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Patient Enrollment Service - Orchestrates patient management operations
 * 
 * Follows established ClinPrecision patterns:
 * - Uses Axon CommandGateway for write operations
 * - Uses repositories for read operations
 * - Maps between DTOs and domain objects
 * - Handles Long ID to UUID mapping
 * 
 * NOTE: No class-level @Transactional - Axon handles transactions for command processing.
 * Adding @Transactional prevents projections from seeing committed events due to transaction
 * isolation - the waitForPatientProjection() and waitForEnrollmentProjection() methods can't
 * see the INSERT until transaction commits, but the transaction can't commit because the
 * method is still waiting (circular deadlock).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PatientEnrollmentService {

    private final CommandGateway commandGateway;
    private final PatientRepository patientRepository;
    private final PatientEnrollmentRepository patientEnrollmentRepository;
    private final SiteStudyRepository siteStudyRepository;
    private final PatientEnrollmentAuditRepository auditRepository;
    private final StudyRepository studyRepository;
    private final StudyArmRepository studyArmRepository;

    /**
     * Register a new patient in the system
     * 
     * @param registerDto Patient registration details
     * @param createdBy User creating the patient
     * @return Created patient DTO with database ID and aggregate UUID
     */
    public PatientDto registerPatient(RegisterPatientDto registerDto, String createdBy) {
        log.info("Registering new patient: {} {}", registerDto.getFirstName(), registerDto.getLastName());
        
        try {
            // Generate patient UUID for Axon
            UUID patientUuid = UUID.randomUUID();
            log.info("Generated patient UUID: {} for registration", patientUuid);
            
            // Send command in separate transaction context
            sendPatientRegistrationCommand(patientUuid, registerDto, createdBy);
            
            log.info("RegisterPatientCommand completed successfully for UUID: {}", patientUuid);
            
            // Simple approach: wait a moment for projection, then fetch directly
            try {
                Thread.sleep(100); // Give projection a moment to process
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            // Try direct fetch first
            Optional<PatientEntity> optionalEntity = patientRepository.findByAggregateUuid(patientUuid.toString());
            PatientEntity entity;
            
            if (optionalEntity.isPresent()) {
                log.info("Patient projection found immediately for UUID: {}", patientUuid);
                entity = optionalEntity.get();
            } else {
                log.warn("Patient projection not found immediately, using retry mechanism for UUID: {}", patientUuid);
                // Fallback to retry mechanism if immediate fetch fails
                entity = waitForPatientProjection(patientUuid.toString(), 5000); // 5 second timeout
            }
            
            PatientDto result = mapToDto(entity);
            
            log.info("Patient registered successfully: ID={}, UUID={}", result.getId(), result.getAggregateUuid());
            return result;
            
        } catch (Exception e) {
            log.error("Error registering patient: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to register patient: " + e.getMessage(), e);
        }
    }
    
    /**
     * Send patient registration command in separate transaction context
     */
    @Transactional
    private void sendPatientRegistrationCommand(UUID patientUuid, RegisterPatientDto registerDto, String createdBy) {
        try {
            // Create and send Axon command
            RegisterPatientCommand command = RegisterPatientCommand.builder()
                    .patientId(patientUuid)
                    .firstName(registerDto.getFirstName())
                    .middleName(registerDto.getMiddleName())
                    .lastName(registerDto.getLastName())
                    .dateOfBirth(registerDto.getDateOfBirth())
                    .gender(registerDto.getGender())
                    .phoneNumber(registerDto.getPhoneNumber())
                    .email(registerDto.getEmail())
                    .createdBy(createdBy)
                    .build();
            
            log.info("Sending RegisterPatientCommand to Axon for UUID: {}", patientUuid);
            
            // Send command and wait for completion
            CompletableFuture<Void> future = commandGateway.send(command);
            future.get(); // Wait for event to be processed
            
        } catch (Exception e) {
            log.error("Error sending patient registration command for UUID {}: {}", patientUuid, e.getMessage(), e);
            throw new RuntimeException("Failed to send patient registration command", e);
        }
    }

    /**
     * Get patient by database ID with enrollment information
     */
    public PatientDto getPatientById(Long patientId) {
        log.info("Fetching patient by ID: {}", patientId);
        
        PatientEntity entity = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + patientId));
        
        // Return with enrollment information if available
        return mapToDtoWithEnrollment(entity);
    }

    /**
     * Get patient by aggregate UUID
     */
    public PatientDto getPatientByUuid(String aggregateUuid) {
        log.info("Fetching patient by UUID: {}", aggregateUuid);
        
        PatientEntity entity = patientRepository.findByAggregateUuid(aggregateUuid)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + aggregateUuid));
        
        return mapToDto(entity);
    }

    /**
     * Get all patients with their enrollment information
     */
    public List<PatientDto> getAllPatientsWithEnrollments() {
        log.info("Fetching all patients with enrollment data");
        
        List<PatientEntity> patients = patientRepository.findAll();
        return patients.stream()
                .map(this::mapToDtoWithEnrollment)
                .collect(Collectors.toList());
    }

    /**
     * Get patients enrolled in a specific study
     */
    public List<PatientDto> getPatientsByStudy(Long studyId) {
        log.info("Fetching patients for study: {}", studyId);
        
        List<PatientEnrollmentEntity> enrollments = patientEnrollmentRepository.findByStudyId(studyId);
        
        return enrollments.stream()
                .map(enrollment -> {
                    PatientEntity patient = patientRepository.findById(enrollment.getPatientId())
                            .orElse(null);
                    if (patient != null) {
                        return mapToDtoWithEnrollment(patient, enrollment);
                    }
                    return null;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    /**
     * Get all patients (simple version without enrollment data)
     */
    public List<PatientDto> getAllPatients() {
        log.info("Fetching all patients");
        
        List<PatientEntity> entities = patientRepository.findAll();
        return entities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Search patients by name
     */
    public List<PatientDto> searchPatientsByName(String searchTerm) {
        log.info("Searching patients by name: {}", searchTerm);
        
        List<PatientEntity> entities = patientRepository.findByNameContaining(searchTerm);
        return entities.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Map entity to DTO
     */
    private PatientDto mapToDto(PatientEntity entity) {
        return PatientDto.builder()
                .id(entity.getId())
                .aggregateUuid(entity.getAggregateUuid())
                .patientNumber(entity.getPatientNumber())
                .firstName(entity.getFirstName())
                .middleName(entity.getMiddleName())
                .lastName(entity.getLastName())
                .dateOfBirth(entity.getDateOfBirth())
                .gender(entity.getGender() != null ? entity.getGender().name() : null)
                .phoneNumber(entity.getPhoneNumber())
                .email(entity.getEmail())
                .fullName(entity.getFullName())
                .age(entity.getAge())
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    /**
     * Map entity to DTO with enrollment information
     */
    private PatientDto mapToDtoWithEnrollment(PatientEntity entity) {
        // Get the most recent enrollment for this patient
        Optional<PatientEnrollmentEntity> latestEnrollment = patientEnrollmentRepository
                .findTopByPatientIdOrderByEnrollmentDateDesc(entity.getId());
        
        if (latestEnrollment.isPresent()) {
            return mapToDtoWithEnrollment(entity, latestEnrollment.get());
        } else {
            // Return basic patient data without enrollment info
            return mapToDto(entity);
        }
    }

    /**
     * Map entity to DTO with specific enrollment information
     */
    private PatientDto mapToDtoWithEnrollment(PatientEntity entity, PatientEnrollmentEntity enrollment) {
        PatientDto.PatientDtoBuilder builder = PatientDto.builder()
                .id(entity.getId())
                .aggregateUuid(entity.getAggregateUuid())
                .patientNumber(entity.getPatientNumber())
                .firstName(entity.getFirstName())
                .middleName(entity.getMiddleName())
                .lastName(entity.getLastName())
                .dateOfBirth(entity.getDateOfBirth())
                .gender(entity.getGender() != null ? entity.getGender().name() : null)
                .phoneNumber(entity.getPhoneNumber())
                .email(entity.getEmail())
                .fullName(entity.getFullName())
                .age(entity.getAge())
                .status(entity.getStatus() != null ? entity.getStatus().name() : null)
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt());

        // Add enrollment information if available
        if (enrollment != null) {
            builder
                .studyId(enrollment.getStudyId())
                .enrollmentId(enrollment.getId())
                .enrollmentStatus(enrollment.getEnrollmentStatus() != null ? enrollment.getEnrollmentStatus().name() : null)
                .enrollmentDate(enrollment.getEnrollmentDate())
                .screeningNumber(enrollment.getScreeningNumber())
                .siteId(enrollment.getStudySiteId());
            
            // Lookup study name (protocol number + title)
            if (enrollment.getStudyId() != null) {
                studyRepository.findById(enrollment.getStudyId()).ifPresent(study -> {
                    // Use protocol number if available, otherwise study name
                    String studyDisplay = study.getProtocolNumber() != null 
                        ? study.getProtocolNumber() + " - " + study.getName()
                        : study.getName();
                    builder.studyName(studyDisplay);
                });
            }
            
            // TODO: Lookup treatment arm name when arm_id field is added to patient_enrollments table
            // Randomization to treatment arms is typically done after enrollment
            // For now, leave treatmentArm and treatmentArmName as null
            
            // TODO: Add site name lookup when SiteRepository is available
        }

        return builder.build();
    }

    /**
     * Enroll an existing patient into a study at a site.
     * 
     * NOW USING EVENT SOURCING:
     * - Sends EnrollPatientCommand to PatientAggregate
     * - PatientAggregate validates and emits PatientEnrolledEvent
     * - PatientEnrollmentProjector handles event and updates read models
     * - Returns enrollment entity from projection
     */
    public PatientEnrollmentEntity enrollPatient(Long patientId, EnrollPatientDto dto, String createdBy) {
        log.info("=== ENROLLMENT FLOW START ===");
        log.info("Enrolling patient {} into study {} at site {}", patientId, dto.getStudyId(), dto.getSiteId());

        // Validate inputs
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }
        if (dto.getStudyId() == null) {
            throw new IllegalArgumentException("Study ID is required");
        }
        if (dto.getSiteId() == null) {
            throw new IllegalArgumentException("Site ID is required");
        }
        if (dto.getScreeningNumber() == null || dto.getScreeningNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Screening number is required");
        }

        // Validate patient exists and get UUID
        PatientEntity patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));
        
        UUID patientUuid = UUID.fromString(patient.getAggregateUuid());
        log.info("Patient UUID: {}", patientUuid);

        // Uniqueness checks
        if (patientEnrollmentRepository.existsByPatientIdAndStudyId(patientId, dto.getStudyId())) {
            throw new IllegalArgumentException("Patient is already enrolled in this study");
        }
        if (patientEnrollmentRepository.existsByStudyIdAndScreeningNumber(dto.getStudyId(), dto.getScreeningNumber())) {
            throw new IllegalArgumentException("Screening number already exists for this study");
        }

        // Validate site-studies association exists and matches the study
        SiteStudyEntity association = siteStudyRepository
            .findByIdAndStudyId(dto.getSiteId(), dto.getStudyId())
            .orElseThrow(() -> new IllegalArgumentException("Invalid site association: siteId does not belong to study"));

        // Optional: ensure association is ACTIVE
        if (association.getStatus() != null && association.getStatus() != SiteStudyEntity.SiteStudyStatus.ACTIVE) {
            throw new IllegalArgumentException("Site is not ACTIVE for the selected study");
        }

        // Determine site aggregate UUID from linked site if present
        String siteAggregateUuidStr = association.getSite() != null ? association.getSite().getAggregateUuid() : null;
        if (siteAggregateUuidStr == null || siteAggregateUuidStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Site aggregate UUID not found for association");
        }
        UUID siteAggregateUuid = UUID.fromString(siteAggregateUuidStr);
        log.info("Site UUID: {}", siteAggregateUuid);

        // Enforce site enrollment cap if configured
        if (association.getSubjectEnrollmentCap() != null) {
            long currentCount = patientEnrollmentRepository.countByStudySiteId(association.getId());
            if (currentCount >= association.getSubjectEnrollmentCap()) {
                throw new IllegalArgumentException("Site enrollment cap reached for this study site");
            }
        }

        // Generate enrollment UUID
        UUID enrollmentUuid = UUID.randomUUID();
        log.info("Enrollment UUID: {}", enrollmentUuid);
        
        // Map studyId to UUID (for now, use a simple approach - in production, lookup from study table)
        UUID studyUuid = mapLongIdToUuid("STUDY", dto.getStudyId());
        log.info("Study UUID: {}", studyUuid);

        // Create and send EnrollPatientCommand via Axon
        com.clinprecision.clinopsservice.patientenrollment.domain.commands.EnrollPatientCommand command = 
            com.clinprecision.clinopsservice.patientenrollment.domain.commands.EnrollPatientCommand.builder()
                .patientId(patientUuid)
                .enrollmentId(enrollmentUuid)
                .studyId(studyUuid)
                .siteId(siteAggregateUuid)
                .studySiteId(association.getId()) // Pass FK for immutable event sourcing
                .screeningNumber(dto.getScreeningNumber())
                .enrollmentDate(dto.getEnrollmentDate())
                .createdBy(createdBy != null ? createdBy : "system")
                .build();
        
        log.info("Sending EnrollPatientCommand to aggregate with studySiteId={}: {}", association.getId(), command);
        
        try {
            // Send command and wait for completion
            CompletableFuture<Object> future = commandGateway.send(command);
            Object result = future.join(); // Wait for command to be processed
            
            log.info("EnrollPatientCommand processed successfully: {}", result);
            
        } catch (Exception e) {
            log.error("Failed to process EnrollPatientCommand: {}", e.getMessage(), e);
            throw new RuntimeException("Enrollment failed: " + e.getMessage(), e);
        }
        
        // Wait for projection to complete (with retry logic)
        log.info("Waiting for enrollment projection to complete...");
        PatientEnrollmentEntity enrollment = waitForEnrollmentProjection(enrollmentUuid.toString(), 10000); // Increased timeout to 10s
        
        if (enrollment == null) {
            log.warn("Enrollment projection not found after timeout - projection may still be processing");
            log.warn("Enrollment UUID: {} - you can query later using: GET /api/v1/patient-enrollments?aggregateUuid={}", 
                enrollmentUuid, enrollmentUuid);
            // Don't throw - the event was successfully emitted and will eventually be projected
            // Return a placeholder entity with the UUID so caller can track it
            enrollment = new PatientEnrollmentEntity();
            enrollment.setAggregateUuid(enrollmentUuid.toString());
            enrollment.setScreeningNumber(dto.getScreeningNumber());
            enrollment.setEnrollmentDate(dto.getEnrollmentDate());
            enrollment.setEnrollmentStatus(EnrollmentStatus.ENROLLED);
            enrollment.setPatientId(patientId);
            return enrollment;
        }
        
        log.info("Enrollment projection found: id={}, screening={}", enrollment.getId(), enrollment.getScreeningNumber());
        
        // Update association enrollment count (best-effort)
        try {
            Integer count = association.getSubjectEnrollmentCount();
            association.setSubjectEnrollmentCount((count == null ? 0 : count) + 1);
            siteStudyRepository.save(association);
            log.info("Updated association enrollment count: {}", association.getSubjectEnrollmentCount());
        } catch (Exception ex) {
            log.warn("Failed to update subjectEnrollmentCount for association {}: {}", association.getId(), ex.getMessage());
        }
        
        log.info("=== ENROLLMENT FLOW COMPLETE ===");
        return enrollment;
    }
    
    /**
     * Wait for enrollment projection to be updated with retry logic
     * 
     * <p>Pattern matches PatientStatusService.waitForStatusHistoryProjection()</p>
     * <p>Uses exponential backoff with graceful degradation if projection is delayed.</p>
     * 
     * @param enrollmentUuid the enrollment aggregate UUID to wait for
     * @param timeoutMs maximum time to wait in milliseconds
     * @return the projected enrollment entity, or null if not found within timeout
     */
    private PatientEnrollmentEntity waitForEnrollmentProjection(String enrollmentUuid, long timeoutMs) {
        long startTime = System.currentTimeMillis();
        long delay = 50; // Start with 50ms delay
        int attempts = 0;
        
        log.info("Waiting for enrollment projection with UUID: {}", enrollmentUuid);
        
        while (System.currentTimeMillis() - startTime < timeoutMs) {
            try {
                attempts++;
                Optional<PatientEnrollmentEntity> entity = patientEnrollmentRepository.findByAggregateUuid(enrollmentUuid);
                if (entity.isPresent()) {
                    log.info("Enrollment projection found after {}ms and {} attempts", 
                        System.currentTimeMillis() - startTime, attempts);
                    return entity.get();
                }
                
                // Log every 5 attempts to reduce log spam
                if (attempts % 5 == 0 || attempts <= 3) {
                    log.info("Enrollment projection not found yet, attempt {}, waiting {}ms", attempts, delay);
                }
                
                // Wait before retrying
                Thread.sleep(delay);
                
                // Exponential backoff up to 500ms
                delay = Math.min(delay * 2, 500);
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Interrupted while waiting for enrollment projection");
                return null; // Don't throw - graceful degradation
            }
        }
        
        log.warn("Enrollment projection not found after {}ms and {} attempts - projection may still be processing asynchronously", 
            timeoutMs, attempts);
        return null;
    }
    
    /**
     * Map Long ID to UUID
     * TODO: Replace with proper UUID lookup from entity tables
     */
    private UUID mapLongIdToUuid(String entityType, Long id) {
        // This is a temporary solution for mapping Long IDs to UUIDs
        // In production, we would look up the actual UUID from the entity table
        
        // For now, create a deterministic UUID based on entity type and ID
        String uuidString = String.format("%s-%08d-0000-0000-000000000000", 
            entityType.toLowerCase(), id);
        
        try {
            return UUID.fromString(uuidString);
        } catch (IllegalArgumentException e) {
            // Fallback: create random UUID
            log.warn("Failed to create deterministic UUID for {}:{}, using random UUID", entityType, id);
            return UUID.randomUUID();
        }
    }

    private String generateEnrollmentNumber(EnrollPatientDto dto) {
        String studyPart = String.valueOf(dto.getStudyId());
        String sitePart = String.valueOf(dto.getSiteId());
        String ts = String.valueOf(System.currentTimeMillis()).substring(6);
        return "ENR-" + studyPart + "-" + sitePart + "-" + ts;
    }

    /**
     * Wait for patient projection to be updated with retry logic
     * 
     * @param patientUuid The patient UUID to look for
     * @param timeoutMs Maximum time to wait in milliseconds
     * @return The patient entity when found
     * @throws RuntimeException if patient not found within timeout
     */
    private PatientEntity waitForPatientProjection(String patientUuid, long timeoutMs) {
        long startTime = System.currentTimeMillis();
        long delay = 50; // Start with 50ms delay
        int attempts = 0;
        
        log.info("Waiting for patient projection with UUID: {}", patientUuid);
        
        while (System.currentTimeMillis() - startTime < timeoutMs) {
            try {
                attempts++;
                Optional<PatientEntity> entity = patientRepository.findByAggregateUuid(patientUuid);
                if (entity.isPresent()) {
                    log.info("Patient projection found after {}ms and {} attempts", System.currentTimeMillis() - startTime, attempts);
                    return entity.get();
                }
                
                log.debug("Patient projection not found yet, attempt {}, waiting {}ms", attempts, delay);
                
                // Wait before retrying
                Thread.sleep(delay);
                
                // Exponential backoff up to 500ms
                delay = Math.min(delay * 2, 500);
                
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted while waiting for patient projection", e);
            }
        }
        
        log.error("Patient projection timeout after {}ms and {} attempts for UUID: {}", timeoutMs, attempts, patientUuid);
        throw new RuntimeException("Patient not found after creation - projection timeout after " + timeoutMs + "ms");
    }

    /**
     * Test method to enroll a registered patient into a study
     * This helps validate the enrollment workflow
     */
    public String performTestEnrollment() {
        log.info("Performing test enrollment...");
        
        // Get the first registered patient
        List<PatientEntity> patients = patientRepository.findAll();
        if (patients.isEmpty()) {
            return "No patients found. Please register a patient first.";
        }
        
        PatientEntity firstPatient = patients.get(0);
        log.info("Using patient {} for test enrollment", firstPatient.getId());
        
        // Check if this patient is already enrolled
        List<PatientEnrollmentEntity> existingEnrollments = patientEnrollmentRepository.findByPatientId(firstPatient.getId());
        if (!existingEnrollments.isEmpty()) {
            return "Patient " + firstPatient.getPatientNumber() + " is already enrolled in " + existingEnrollments.size() + " study(ies)";
        }
        
        // Get site-study associations to use a valid siteId
        List<SiteStudyEntity> siteStudies = siteStudyRepository.findAll();
        if (siteStudies.isEmpty()) {
            return "No site-study associations found. Please activate a site for a study first.";
        }
        
        SiteStudyEntity firstAssociation = siteStudies.get(0);
        log.info("Using site-study association {} (study {}, site {})", 
                firstAssociation.getId(), firstAssociation.getStudyId(), firstAssociation.getSite().getName());
        
        // Create enrollment DTO
        EnrollPatientDto enrollDto = EnrollPatientDto.builder()
                .studyId(firstAssociation.getStudyId())
                .siteId(firstAssociation.getId()) // This is the site-study association ID
                .screeningNumber("TEST-SCR-" + System.currentTimeMillis())
                .enrollmentDate(java.time.LocalDate.now())
                .build();
        
        try {
            // Perform enrollment
            PatientEnrollmentEntity enrollment = enrollPatient(firstPatient.getId(), enrollDto, "test-system");
            
            return String.format(
                "Successfully enrolled patient %s (ID: %d) into study %d at site '%s'. Enrollment ID: %d, Screening Number: %s",
                firstPatient.getPatientNumber(),
                firstPatient.getId(),
                enrollDto.getStudyId(),
                firstAssociation.getSite().getName(),
                enrollment.getId(),
                enrollment.getScreeningNumber()
            );
            
        } catch (Exception e) {
            log.error("Test enrollment failed: {}", e.getMessage(), e);
            return "Test enrollment failed: " + e.getMessage();
        }
    }
}



