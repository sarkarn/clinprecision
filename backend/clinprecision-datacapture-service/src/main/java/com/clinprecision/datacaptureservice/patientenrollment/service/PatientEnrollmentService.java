package com.clinprecision.datacaptureservice.patientenrollment.service;

import com.clinprecision.datacaptureservice.patientenrollment.domain.commands.RegisterPatientCommand;
import com.clinprecision.datacaptureservice.patientenrollment.dto.RegisterPatientDto;
import com.clinprecision.datacaptureservice.patientenrollment.dto.PatientDto;
import com.clinprecision.datacaptureservice.patientenrollment.entity.PatientEntity;
import com.clinprecision.datacaptureservice.patientenrollment.repository.PatientRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
            
            // Send command and wait for completion
            CompletableFuture<Void> future = commandGateway.send(command);
            future.get(); // Wait for event to be processed
            
            // Wait a brief moment for projection to be updated
            Thread.sleep(100);
            
            // Fetch the created patient entity from read model
            PatientEntity entity = patientRepository.findByAggregateUuid(patientUuid.toString())
                    .orElseThrow(() -> new RuntimeException("Patient not found after creation"));
            
            PatientDto result = mapToDto(entity);
            
            log.info("Patient registered successfully: ID={}, UUID={}", result.getId(), result.getAggregateUuid());
            return result;
            
        } catch (Exception e) {
            log.error("Error registering patient: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to register patient: " + e.getMessage(), e);
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
     * Get all patients
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
}