package com.clinprecision.clinopsservice.visit.service;

import com.clinprecision.clinopsservice.entity.VisitDefinitionEntity;
import com.clinprecision.clinopsservice.repository.VisitDefinitionRepository;
import com.clinprecision.clinopsservice.visit.domain.commands.CreateVisitCommand;
import com.clinprecision.clinopsservice.visit.dto.CreateVisitRequest;
import com.clinprecision.clinopsservice.visit.dto.VisitDto;
import com.clinprecision.clinopsservice.visit.dto.VisitResponse;
import com.clinprecision.clinopsservice.visit.entity.StudyVisitInstanceEntity;
import com.clinprecision.clinopsservice.visit.repository.StudyVisitInstanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Unscheduled Visit Service
 * 
 * <p>Orchestrates unscheduled visit creation following CQRS/Event Sourcing patterns.
 * This service handles both command (write) and query (read) operations for visits.</p>
 * 
 * <p><b>Command Operations (Write):</b></p>
 * <ul>
 *   <li>createUnscheduledVisit() - Generic visit creation for any type</li>
 *   <li>createScreeningVisit() - Convenience method for screening visits</li>
 *   <li>createEnrollmentVisit() - Convenience method for enrollment visits</li>
 *   <li>createDiscontinuationVisit() - Convenience method for discontinuation visits</li>
 * </ul>
 * 
 * <p><b>Query Operations (Read):</b></p>
 * <ul>
 *   <li>getPatientVisits() - All visits for a patient</li>
 *   <li>getStudyVisits() - All visits for a study</li>
 *   <li>getVisitsByType() - Filter by visit type</li>
 *   <li>getVisitById() - Single visit details</li>
 * </ul>
 * 
 * <p><b>Architecture Flow:</b></p>
 * <pre>
 * UI/Controller → UnscheduledVisitService → CommandGateway → VisitAggregate
 *                                                 ↓
 *                                        VisitCreatedEvent
 *                                                 ↓
 *                                          VisitProjector
 *                                                 ↓
 *                                           [visit table]
 *                                                 ↓
 *                                  UnscheduledVisitService (Query)
 * </pre>
 * 
 * <p><b>Visit Types:</b></p>
 * <ul>
 *   <li>SCREENING - After REGISTERED → SCREENING status change</li>
 *   <li>ENROLLMENT - After SCREENING → ENROLLED status change</li>
 *   <li>DISCONTINUATION - When patient withdraws</li>
 *   <li>ADVERSE_EVENT - Unplanned safety assessment</li>
 * </ul>
 * 
 * <p><b>Integration with Form Collection:</b></p>
 * After visit creation, the visitId can be used with StudyFormDataService
 * to collect forms (screening forms, enrollment forms, etc.)
 * 
 * NOTE: No @Transactional - Axon handles transactions for command processing.
 * Transaction isolation prevents projections from being visible within same transaction.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UnscheduledVisitService {

    private final CommandGateway commandGateway;
    private final StudyVisitInstanceRepository studyVisitInstanceRepository;
    private final VisitDefinitionRepository visitDefinitionRepository;

    // ==================== Command Operations (Write) ====================

    /**
     * Create an unscheduled visit (generic method)
     * 
     * <p>This method orchestrates the visit creation process:</p>
     * <ol>
     *   <li>Validates request data</li>
     *   <li>Generates visitId (UUID)</li>
     *   <li>Sends CreateVisitCommand to aggregate</li>
     *   <li>Waits for command completion</li>
     *   <li>Waits for projection (visit record)</li>
     *   <li>Returns visit response</li>
     * </ol>
     * 
     * @param request CreateVisitRequest with visit details
     * @return VisitResponse with visitId and details
     */
    public VisitResponse createUnscheduledVisit(CreateVisitRequest request) {
        log.info("Creating unscheduled visit for patientId: {}, visitType: {}", 
                request.getPatientId(), request.getVisitType());

        // Validate request
        validateVisitRequest(request);

        // Generate unique visit ID
        UUID visitId = UUID.randomUUID();

        // Create command
        CreateVisitCommand command = new CreateVisitCommand(
            visitId,
            request.getPatientId(),
            request.getStudyId(),
            request.getSiteId(),
            request.getVisitType(),
            request.getVisitDate(),
            "SCHEDULED", // Default status for new visits
            request.getCreatedBy(),
            request.getNotes()
        );

        try {
            // Send command to aggregate (synchronous - wait for event to be stored)
            commandGateway.sendAndWait(command);
            log.info("CreateVisitCommand sent successfully for visitId: {}", visitId);

            // Wait for projection (with timeout to avoid infinite wait)
            StudyVisitInstanceEntity visitEntity = waitForVisitProjection(visitId, 5000);

            if (visitEntity != null) {
                log.info("Visit created successfully: visitId={}, patientId={}, visitType={}", 
                        visitId, request.getPatientId(), request.getVisitType());
                
                // Get visit name - for unscheduled visits, use "Unscheduled Visit"
                String visitName = "Unscheduled Visit";
                if (visitEntity.getVisitId() != null) {
                    // Protocol visit - try to get name from visit_definitions
                    visitName = visitDefinitionRepository.findById(visitEntity.getVisitId())
                        .map(vd -> vd.getName())
                        .orElse("Unknown Visit");
                }
                
                return new VisitResponse(
                    visitId, // Use the command's UUID
                    visitEntity.getSubjectId(),
                    visitEntity.getStudyId(),
                    visitEntity.getSiteId(),
                    visitName, // Visit name from visit_definitions or default
                    visitEntity.getVisitDate(),
                    visitEntity.getVisitStatus(),
                    null, // createdBy - not stored in study_visit_instances
                    visitEntity.getCreatedAt(),
                    null  // notes - not stored in study_visit_instances yet
                );
            } else {
                throw new RuntimeException("Visit projection not found after timeout");
            }

        } catch (Exception e) {
            log.error("Error creating unscheduled visit for patientId: {}", request.getPatientId(), e);
            throw new RuntimeException("Failed to create unscheduled visit: " + e.getMessage(), e);
        }
    }

    /**
     * Create a screening visit (convenience method)
     * 
     * @param patientId Patient ID
     * @param studyId Study ID
     * @param siteId Site ID
     * @param visitDate Date of screening visit
     * @param createdBy User ID creating the visit
     * @param notes Optional notes
     * @return VisitResponse
     */
    public VisitResponse createScreeningVisit(Long patientId, Long studyId, Long siteId, 
                                             LocalDate visitDate, Long createdBy, String notes) {
        log.info("Creating screening visit for patientId: {}", patientId);
        
        CreateVisitRequest request = new CreateVisitRequest();
        request.setPatientId(patientId);
        request.setStudyId(studyId);
        request.setSiteId(siteId);
        request.setVisitType("SCREENING");
        request.setVisitDate(visitDate);
        request.setCreatedBy(createdBy);
        request.setNotes(notes);
        
        return createUnscheduledVisit(request);
    }

    /**
     * Create an enrollment visit (convenience method)
     * 
     * @param patientId Patient ID
     * @param studyId Study ID
     * @param siteId Site ID
     * @param visitDate Date of enrollment visit
     * @param createdBy User ID creating the visit
     * @param notes Optional notes
     * @return VisitResponse
     */
    public VisitResponse createEnrollmentVisit(Long patientId, Long studyId, Long siteId,
                                              LocalDate visitDate, Long createdBy, String notes) {
        log.info("Creating enrollment visit for patientId: {}", patientId);
        
        CreateVisitRequest request = new CreateVisitRequest();
        request.setPatientId(patientId);
        request.setStudyId(studyId);
        request.setSiteId(siteId);
        request.setVisitType("ENROLLMENT");
        request.setVisitDate(visitDate);
        request.setCreatedBy(createdBy);
        request.setNotes(notes);
        
        return createUnscheduledVisit(request);
    }

    /**
     * Create a discontinuation visit (convenience method)
     * 
     * @param patientId Patient ID
     * @param studyId Study ID
     * @param siteId Site ID
     * @param visitDate Date of discontinuation visit
     * @param createdBy User ID creating the visit
     * @param reason Reason for discontinuation
     * @return VisitResponse
     */
    public VisitResponse createDiscontinuationVisit(Long patientId, Long studyId, Long siteId,
                                                   LocalDate visitDate, Long createdBy, String reason) {
        log.info("Creating discontinuation visit for patientId: {}", patientId);
        
        CreateVisitRequest request = new CreateVisitRequest();
        request.setPatientId(patientId);
        request.setStudyId(studyId);
        request.setSiteId(siteId);
        request.setVisitType("DISCONTINUATION");
        request.setVisitDate(visitDate);
        request.setCreatedBy(createdBy);
        request.setNotes(reason); // Discontinuation reason goes in notes
        
        return createUnscheduledVisit(request);
    }

    // ==================== Query Operations (Read) ====================

    /**
     * Get all visits for a patient
     * 
     * @param patientId Patient ID
     * @return List of VisitDto
     */
    public List<VisitDto> getPatientVisits(Long patientId) {
        log.debug("Getting visits for patientId: {}", patientId);
        
        List<StudyVisitInstanceEntity> visits = studyVisitInstanceRepository
                .findBySubjectIdOrderByVisitDateDesc(patientId);
        
        return visits.stream()
                .map(this::mapToVisitDto)
                .collect(Collectors.toList());
    }

    /**
     * Get all visits for a study
     * 
     * @param studyId Study ID
     * @return List of VisitDto
     */
    public List<VisitDto> getStudyVisits(Long studyId) {
        log.debug("Getting visits for studyId: {}", studyId);
        
        List<StudyVisitInstanceEntity> visits = studyVisitInstanceRepository.findByStudyId(studyId);
        
        return visits.stream()
                .map(this::mapToVisitDto)
                .collect(Collectors.toList());
    }

    /**
     * Get visits by type (e.g., all SCREENING visits)
     * 
     * @param visitType Visit type (SCREENING, ENROLLMENT, etc.)
     * @return List of VisitDto
     */
    public List<VisitDto> getVisitsByType(String visitType) {
        log.debug("Getting visits by type: {}", visitType);
        
        List<StudyVisitInstanceEntity> visits = studyVisitInstanceRepository.findByVisitStatus(visitType);
        
        return visits.stream()
                .map(this::mapToVisitDto)
                .collect(Collectors.toList());
    }

    /**
     * Get a single visit by ID
     * Note: study_visit_instances uses Long id, not UUID
     * 
     * @param visitId Visit ID (Long, not UUID)
     * @return VisitDto or null if not found
     */
    public VisitDto getVisitById(Long visitId) {
        log.debug("Getting visit by visitId: {}", visitId);
        
        return studyVisitInstanceRepository.findById(visitId)
                .map(this::mapToVisitDto)
                .orElse(null);
    }

    // ==================== Helper Methods ====================

    /**
     * Validate visit request data
     */
    private void validateVisitRequest(CreateVisitRequest request) {
        if (request.getPatientId() == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }
        if (request.getStudyId() == null) {
            throw new IllegalArgumentException("Study ID is required");
        }
        if (request.getSiteId() == null) {
            throw new IllegalArgumentException("Site ID is required");
        }
        if (request.getVisitType() == null || request.getVisitType().trim().isEmpty()) {
            throw new IllegalArgumentException("Visit type is required");
        }
        if (request.getVisitDate() == null) {
            throw new IllegalArgumentException("Visit date is required");
        }
    }

    /**
     * Wait for visit projection to be available (with timeout)
     * Looks for study_visit_instances created by event projector
     * 
     * @param visitId UUID of the visit (stored in aggregate_uuid column)
     * @param timeoutMs Maximum wait time in milliseconds
     * @return StudyVisitInstanceEntity or null if not found within timeout
     */
    private StudyVisitInstanceEntity waitForVisitProjection(UUID visitId, long timeoutMs) {
        log.debug("Waiting for visit projection: visitId={}", visitId);
        
        long startTime = System.currentTimeMillis();
        int attempts = 0;
        
        while (System.currentTimeMillis() - startTime < timeoutMs) {
            attempts++;
            
            // Query by aggregate_uuid (for unscheduled visits created via events)
            var visitOpt = studyVisitInstanceRepository.findByAggregateUuid(visitId.toString());
            if (visitOpt.isPresent()) {
                log.debug("Visit projection found after {} attempts ({}ms)", 
                         attempts, System.currentTimeMillis() - startTime);
                return visitOpt.get();
            }
            
            // Wait 50ms before next attempt
            try {
                Thread.sleep(50);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Interrupted while waiting for visit projection");
                return null;
            }
        }
        
        log.warn("Visit projection not found after {}ms ({} attempts): visitId={}", 
                timeoutMs, attempts, visitId);
        return null;
    }

    /**
     * Map StudyVisitInstanceEntity to VisitDto
     * Looks up visit definition to get visit name and type
     */
    private VisitDto mapToVisitDto(StudyVisitInstanceEntity entity) {
        VisitDto dto = new VisitDto();
        
        // Map direct fields
        dto.setVisitId(entity.getId() != null ? 
                UUID.nameUUIDFromBytes(entity.getId().toString().getBytes()) : null);
        dto.setPatientId(entity.getSubjectId());
        dto.setStudyId(entity.getStudyId());
        dto.setSiteId(entity.getSiteId());
        dto.setVisitDate(entity.getVisitDate());
        dto.setStatus(entity.getVisitStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        
        // Get visit name and type from visit_definitions
        if (entity.getVisitId() != null) {
            // Protocol visit - get name from visit_definitions
            visitDefinitionRepository.findById(entity.getVisitId()).ifPresent(visitDef -> {
                dto.setVisitName(visitDef.getName());
                dto.setVisitType(visitDef.getVisitType() != null ? visitDef.getVisitType().name() : "UNKNOWN");
            });
            
            // Fallback if visit definition not found
            if (dto.getVisitName() == null) {
                dto.setVisitName("Unknown Visit");
                dto.setVisitType("UNKNOWN");
            }
        } else {
            // Unscheduled visit (event-sourced)
            dto.setVisitName("Unscheduled Visit");
            dto.setVisitType("UNSCHEDULED");
        }
        
        return dto;
    }
}
