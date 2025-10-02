package com.clinprecision.datacaptureservice.patientenrollment.service;

import com.clinprecision.datacaptureservice.patientenrollment.domain.commands.RegisterPatientCommand;
import com.clinprecision.datacaptureservice.patientenrollment.dto.EnrollPatientDto;
import com.clinprecision.datacaptureservice.patientenrollment.dto.RegisterPatientDto;
import com.clinprecision.datacaptureservice.patientenrollment.dto.PatientDto;
import com.clinprecision.datacaptureservice.patientenrollment.entity.PatientEntity;
import com.clinprecision.datacaptureservice.patientenrollment.entity.PatientEnrollmentEntity;
import com.clinprecision.datacaptureservice.patientenrollment.entity.EnrollmentStatus;
import com.clinprecision.datacaptureservice.patientenrollment.repository.PatientRepository;
import com.clinprecision.datacaptureservice.patientenrollment.repository.PatientEnrollmentRepository;
import com.clinprecision.datacaptureservice.patientenrollment.repository.PatientEnrollmentAuditRepository;
import com.clinprecision.datacaptureservice.patientenrollment.entity.PatientEnrollmentAuditEntity;
import com.clinprecision.datacaptureservice.patientenrollment.repository.SiteStudyRepository;
import com.clinprecision.common.entity.SiteStudyEntity;

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
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PatientEnrollmentService {

    private final CommandGateway commandGateway;
    private final PatientRepository patientRepository;
    private final PatientEnrollmentRepository patientEnrollmentRepository;
    private final SiteStudyRepository siteStudyRepository;
    private final PatientEnrollmentAuditRepository auditRepository;

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
     * Get patient by database ID
     */
    public PatientDto getPatientById(Long patientId) {
        log.info("Fetching patient by ID: {}", patientId);
        
        PatientEntity entity = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + patientId));
        
        return mapToDto(entity);
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
            
            // TODO: Add study name and site name lookup when available
            // For now, these will be null and can be populated by frontend
        }

        return builder.build();
    }

    /**
     * Enroll an existing patient into a study at a site.
     * This is a minimal persistence flow to ensure siteId is stored.
     * In future iterations, wire this to an Axon command + event + projection.
     */
    public PatientEnrollmentEntity enrollPatient(Long patientId, EnrollPatientDto dto, String createdBy) {
        log.info("Enrolling patient {} into study {} at site {}", patientId, dto.getStudyId(), dto.getSiteId());

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

        // Validate patient exists
        PatientEntity patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));

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
    String siteAggregateUuid = association.getSite() != null ? association.getSite().getAggregateUuid() : "SITE-UUID-N/A";

        // Enforce site enrollment cap if configured
        if (association.getSubjectEnrollmentCap() != null) {
            long currentCount = patientEnrollmentRepository.countByStudySiteId(association.getId());
            if (currentCount >= association.getSubjectEnrollmentCap()) {
                throw new IllegalArgumentException("Site enrollment cap reached for this study site");
            }
        }

    // Minimal enrollment persistence
        UUID enrollmentUuid = UUID.randomUUID();
        PatientEnrollmentEntity enrollment = PatientEnrollmentEntity.builder()
                .aggregateUuid(enrollmentUuid.toString())
                .enrollmentNumber(generateEnrollmentNumber(dto))
                .patientId(patient.getId())
                .patientAggregateUuid(patient.getAggregateUuid())
                .studyId(dto.getStudyId())
        // Store association id in study_site_id as per schema FK to site_studies(id)
        .studySiteId(dto.getSiteId())
        .siteAggregateUuid(siteAggregateUuid != null ? siteAggregateUuid : "SITE-UUID-N/A")
                .screeningNumber(dto.getScreeningNumber())
                .enrollmentDate(dto.getEnrollmentDate() != null ? dto.getEnrollmentDate() : java.time.LocalDate.now())
                .enrollmentStatus(EnrollmentStatus.ENROLLED)
                .eligibilityConfirmed(false)
                .enrolledBy(createdBy != null ? createdBy : "system")
                .build();

    PatientEnrollmentEntity saved = patientEnrollmentRepository.save(enrollment);

        // Update association enrollment count (best-effort)
        try {
            Integer count = association.getSubjectEnrollmentCount();
            association.setSubjectEnrollmentCount((count == null ? 0 : count) + 1);
            siteStudyRepository.save(association);
        } catch (Exception ex) {
            log.warn("Failed to update subjectEnrollmentCount for association {}: {}", association.getId(), ex.getMessage());
        }

    // Write audit entry
        try {
            PatientEnrollmentAuditEntity audit = PatientEnrollmentAuditEntity.builder()
            .entityType(PatientEnrollmentAuditEntity.AuditEntityType.ENROLLMENT)
                    .entityId(saved.getId())
                    .entityAggregateUuid(saved.getAggregateUuid())
            .actionType(PatientEnrollmentAuditEntity.AuditActionType.ENROLL)
                    .oldValues(null)
            .newValues("{\"patientId\": " + saved.getPatientId() + ", \"studyId\": " + saved.getStudyId() + ", \"siteAssociationId\": " + saved.getStudySiteId() + "}")
                    .performedBy(createdBy != null ? createdBy : "system")
                    .performedAt(java.time.LocalDateTime.now())
                    .reason("Patient enrolled")
                    .build();
            auditRepository.save(audit);
        } catch (Exception ex) {
            log.warn("Failed to write enrollment audit for enrollment {}: {}", saved.getId(), ex.getMessage());
        }
        log.info("Enrollment persisted with ID {} and UUID {}", saved.getId(), saved.getAggregateUuid());
        return saved;
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