// ...existing code...
// ...existing code...
package com.clinprecision.studydesignservice.service;


import com.clinprecision.common.dto.studydesign.*;
import com.clinprecision.common.entity.studydesign.OrganizationStudyEntity;
import com.clinprecision.common.entity.studydesign.StudyEntity;
import com.clinprecision.common.entity.studydesign.StudyStatusEntity;
import com.clinprecision.studydesignservice.repository.StudyStatusRepository;
import com.clinprecision.studydesignservice.exception.StudyNotFoundException;
import com.clinprecision.studydesignservice.mapper.StudyMapper;
import com.clinprecision.studydesignservice.repository.OrganizationStudyRepository;
import com.clinprecision.studydesignservice.repository.StudyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for study operations
 * Handles the main business logic for study management
 */
@Service
@Transactional
public class StudyService {
    
    private static final Logger logger = LoggerFactory.getLogger(StudyService.class);
    
    private final StudyRepository studyRepository;
    private final OrganizationStudyRepository organizationStudyRepository;
    private final StudyMapper studyMapper;
    private final StudyValidationService validationService;
    private final StudyStatusRepository studyStatusRepository;
    private final StudyDocumentService documentService;
    private final StudyStatusComputationService statusComputationService;
    private final CrossEntityStatusValidationService crossEntityValidationService;
    
    public StudyService(StudyRepository studyRepository,
                       OrganizationStudyRepository organizationStudyRepository,
                       StudyMapper studyMapper,
                       StudyValidationService validationService,
                       StudyStatusRepository studyStatusRepository,
                       StudyDocumentService documentService,
                       StudyStatusComputationService statusComputationService,
                       CrossEntityStatusValidationService crossEntityValidationService) {
        this.studyRepository = studyRepository;
        this.organizationStudyRepository = organizationStudyRepository;
        this.studyMapper = studyMapper;
        this.validationService = validationService;
        this.studyStatusRepository = studyStatusRepository;
        this.documentService = documentService;
        this.statusComputationService = statusComputationService;
        this.crossEntityValidationService = crossEntityValidationService;
    }
    
    /**
     * Create a new study
     */
    public StudyResponseDto createStudy(StudyCreateRequestDto request) {
        logger.info("Creating new study: {}", request.getName());
        
        // 1. Validate request
        validationService.validateStudyCreation(request);
        
        // 2. Map to entity
        StudyEntity study = studyMapper.toEntity(request);
        
        // 3. Set default values and audit information
        study.setCreatedBy(getCurrentUserId()); // From security context
        
        // 4. Validate entity integrity for new study
        validateStudyEntityIntegrity(study, "create study");
        
        // 5. Save study
        StudyEntity savedStudy = studyRepository.save(study);
        logger.info("Study saved with ID: {}", savedStudy.getId());
        
        // 6. Handle organization associations
        if (request.getOrganizations() != null && !request.getOrganizations().isEmpty()) {
            saveOrganizationAssociations(savedStudy, request.getOrganizations());
        }
        
        // 7. Reload study with associations for response
        StudyEntity studyWithAssociations = studyRepository.findByIdWithAllRelationships(savedStudy.getId())
            .orElse(savedStudy);
        
        // 8. Return response
        StudyResponseDto response = studyMapper.toResponseDto(studyWithAssociations);
        logger.info("Study created successfully: {}", response.getId());
        return response;
    }
    
    /**
     * Get study by ID
     */
    @Transactional(readOnly = true)
    public StudyResponseDto getStudyById(Long id) {
        logger.info("Fetching study with ID: {}", id);
        
        StudyEntity study = studyRepository.findByIdWithAllRelationships(id)
            .orElseThrow(() -> new StudyNotFoundException(id));
        
        return studyMapper.toResponseDto(study);
    }
    
    /**
     * Get study overview data for dashboard
     * This method returns comprehensive study data for the overview tab
     */
    @Transactional(readOnly = true)
    public StudyResponseDto getStudyOverview(Long id) {
        logger.info("Fetching study overview with ID: {}", id);
        
        StudyEntity study = studyRepository.findByIdWithAllRelationships(id)
            .orElseThrow(() -> new StudyNotFoundException(id));
        
        // Convert to DTO with all overview fields populated
        StudyResponseDto response = studyMapper.toResponseDto(study);
        
        // Add computed fields if not already set
        populateComputedOverviewFields(response, study);
        
        // Add document information to the overview
        populateDocumentOverviewFields(response, id);
        
        logger.info("Study overview fetched successfully for study: {}", response.getName());
        return response;
    }
    
    /**
     * Populate computed overview fields that may not be stored directly
     */
    private void populateComputedOverviewFields(StudyResponseDto response, StudyEntity study) {
        // If enrollment rate is not stored, calculate it
        if (response.getEnrollmentRate() == null && 
            response.getPlannedSubjects() != null && 
            response.getEnrolledSubjects() != null && 
            response.getPlannedSubjects() > 0) {
            double rate = (response.getEnrolledSubjects().doubleValue() / response.getPlannedSubjects().doubleValue()) * 100;
            response.setEnrollmentRate(Math.round(rate * 10.0) / 10.0); // Round to 1 decimal
        }
        
        // If screening success rate is not stored, calculate it
        if (response.getScreeningSuccessRate() == null && 
            response.getScreenedSubjects() != null && 
            response.getEnrolledSubjects() != null && 
            response.getScreenedSubjects() > 0) {
            double rate = (response.getEnrolledSubjects().doubleValue() / response.getScreenedSubjects().doubleValue()) * 100;
            response.setScreeningSuccessRate(Math.round(rate * 10.0) / 10.0); // Round to 1 decimal
        }
        
        // Set default recent activities if not present
        if (response.getRecentActivities() == null) {
            response.setRecentActivities("[]"); // Empty JSON array
        }
        
        // Set default endpoints if not present
        if (response.getSecondaryEndpoints() == null) {
            response.setSecondaryEndpoints("[]"); // Empty JSON array
        }
        
        if (response.getInclusionCriteria() == null) {
            response.setInclusionCriteria("[]"); // Empty JSON array
        }
        
        if (response.getExclusionCriteria() == null) {
            response.setExclusionCriteria("[]"); // Empty JSON array
        }
        
        if (response.getTimeline() == null) {
            response.setTimeline("{}"); // Empty JSON object
        }
    }
    
    /**
     * Populate document overview fields for study dashboard
     */
    private void populateDocumentOverviewFields(StudyResponseDto response, Long studyId) {
        try {
            logger.debug("Populating document overview fields for study: {}", studyId);
            
            // Get document statistics
            StudyDocumentService.DocumentStatistics stats = documentService.getDocumentStatistics(studyId);
            
            // Get recent documents (current documents for overview)
            List<StudyDocumentDto> recentDocuments = documentService.getCurrentStudyDocuments(studyId);
            
            // Build document summary JSON for the frontend
            StringBuilder documentSummary = new StringBuilder();
            documentSummary.append("{");
            documentSummary.append("\"totalCount\":").append(stats.getTotalCount()).append(",");
            documentSummary.append("\"totalSize\":\"").append(stats.getFormattedTotalSize()).append("\",");
            documentSummary.append("\"currentCount\":").append(stats.getCurrentCount()).append(",");
            documentSummary.append("\"draftCount\":").append(stats.getDraftCount()).append(",");
            documentSummary.append("\"recentDocuments\":[");
            
            // Add recent documents (limit to 5 most recent for overview)
            int maxDocs = Math.min(5, recentDocuments.size());
            for (int i = 0; i < maxDocs; i++) {
                StudyDocumentDto doc = recentDocuments.get(i);
                if (i > 0) documentSummary.append(",");
                documentSummary.append("{");
                documentSummary.append("\"id\":").append(doc.getId()).append(",");
                documentSummary.append("\"name\":\"").append(escapeJson(doc.getName())).append("\",");
                documentSummary.append("\"type\":\"").append(escapeJson(doc.getType())).append("\",");
                documentSummary.append("\"status\":\"").append(doc.getStatus()).append("\",");
                documentSummary.append("\"uploadedAt\":\"").append(doc.getUploadedAt()).append("\",");
                documentSummary.append("\"formattedSize\":\"").append(doc.getSize()).append("\"");
                documentSummary.append("}");
            }
            
            documentSummary.append("]}");
            
            // Add document summary to metadata field (since no dedicated field exists)
            String existingMetadata = response.getMetadata();
            if (existingMetadata == null || existingMetadata.trim().isEmpty() || "{}".equals(existingMetadata.trim())) {
                // Create new metadata with documents
                response.setMetadata("{\"documents\":" + documentSummary.toString() + "}");
            } else {
                // Try to merge with existing metadata
                try {
                    if (existingMetadata.trim().endsWith("}")) {
                        // Insert documents before the last brace
                        String newMetadata = existingMetadata.substring(0, existingMetadata.lastIndexOf("}")) 
                            + ",\"documents\":" + documentSummary.toString() + "}";
                        response.setMetadata(newMetadata);
                    } else {
                        // Fallback: replace with new metadata
                        response.setMetadata("{\"documents\":" + documentSummary.toString() + "}");
                    }
                } catch (Exception e) {
                    logger.warn("Failed to merge with existing metadata, using documents only", e);
                    response.setMetadata("{\"documents\":" + documentSummary.toString() + "}");
                }
            }
            
            logger.debug("Document overview fields populated successfully for study: {}", studyId);
            
        } catch (Exception e) {
            logger.warn("Failed to populate document overview fields for study: {}", studyId, e);
            // Don't fail the entire response if document data fails
            // Just log the warning and continue
        }
    }
    
    /**
     * Escape JSON special characters in strings
     */
    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }
    
    /**
     * Get all studies
     */
    @Transactional(readOnly = true)
    public List<StudyResponseDto> getAllStudies() {
        logger.info("Fetching all studies");
        
        // For now, get all studies ordered by most recently updated first
        List<StudyEntity> studies = studyRepository.findAllByOrderByUpdatedAtDesc();
        logger.info("Found {} studies", studies.size());
        
        return studyMapper.toResponseDtoList(studies);
    }
    
    /**
     * Get all studies with filters
     */
    @Transactional(readOnly = true)
    public List<StudyResponseDto> getAllStudiesWithFilters(String status, String phase, String sponsor) {
        logger.info("Fetching filtered studies: status={}, phase={}, sponsor={}", status, phase, sponsor);
        
        // Convert status string to ID if provided
        Long statusId = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                // Try to parse as ID first
                statusId = Long.parseLong(status);
            } catch (NumberFormatException e) {
                // If not a number, we could look up by status name/code
                // For now, leave statusId as null which will be ignored in query
                logger.warn("Invalid status filter (not a valid ID): {}", status);
            }
        }
        
        // Convert phase string to ID if provided
        Long phaseId = null;
        if (phase != null && !phase.trim().isEmpty()) {
            try {
                // Try to parse as ID first
                phaseId = Long.parseLong(phase);
            } catch (NumberFormatException e) {
                // If not a number, we could look up by phase name/code
                // For now, leave phaseId as null which will be ignored in query
                logger.warn("Invalid phase filter (not a valid ID): {}", phase);
            }
        }
        
        List<StudyEntity> studies = studyRepository.findAllWithFilters(statusId, phaseId, null, sponsor);
        logger.info("Found {} filtered studies", studies.size());
        
        return studyMapper.toResponseDtoList(studies);
    }
    
    /**
     * Update an existing study
     */
    public StudyResponseDto updateStudy(Long id, StudyUpdateRequestDto request) {
        logger.info("Updating study with ID: {}", id);
        
        // 1. Find existing study
        StudyEntity existingStudy = studyRepository.findByIdWithAllRelationships(id)
            .orElseThrow(() -> new StudyNotFoundException(id));
        
        // 2. Validate that study allows modifications based on current status
        validateStudyModificationAllowed(existingStudy, "update study");
        
        // 3. Validate update
        validationService.validateStudyUpdate(existingStudy, request);
        
        // 4. Update fields
        studyMapper.updateEntityFromDto(request, existingStudy);
        
        // 5. Update audit information
        existingStudy.setModifiedBy(getCurrentUserName()); // Set who modified it
        
        // 6. Save updated study
        StudyEntity updatedStudy = studyRepository.save(existingStudy);
        
        // 7. Update organization associations if provided
        if (request.getOrganizations() != null) {
            updateOrganizationAssociations(updatedStudy, request.getOrganizations());
        }
        
        // 8. Reload study with associations for response
        StudyEntity studyWithAssociations = studyRepository.findByIdWithAllRelationships(updatedStudy.getId())
            .orElse(updatedStudy);
        
        StudyResponseDto response = studyMapper.toResponseDto(studyWithAssociations);
        logger.info("Study updated successfully: {}", response.getId());
        return response;
    }
    
    /**
     * Update study details (specific endpoint for StudyEditPage.jsx)
     */
    public StudyResponseDto updateStudyDetails(Long id, StudyUpdateRequestDto request) {
        logger.info("Updating study details for ID: {}", id);
        
        // This method can have different validation rules if needed
        // For now, it uses the same logic as updateStudy
        return updateStudy(id, request);
    }
    
    /**
     * Save organization associations for a study
     */
    private void saveOrganizationAssociations(StudyEntity study, List<OrganizationAssignmentDto> organizations) {
        logger.info("Saving {} organization associations for study {}", organizations.size(), study.getId());
        
        for (OrganizationAssignmentDto orgDto : organizations) {
            OrganizationStudyEntity orgStudy = studyMapper.toOrganizationStudyEntity(orgDto, study);
            organizationStudyRepository.save(orgStudy);
            
            logger.debug("Saved organization association: orgId={}, role={}", 
                orgDto.getOrganizationId(), orgDto.getRole());
        }
    }
    
    /**
     * Update organization associations for a study
     */
    private void updateOrganizationAssociations(StudyEntity study, List<OrganizationAssignmentDto> organizations) {
        logger.info("Updating organization associations for study {}", study.getId());
        
        // Remove existing associations
        organizationStudyRepository.deleteByStudyId(study.getId());
        
        // Add new associations
        if (!organizations.isEmpty()) {
            saveOrganizationAssociations(study, organizations);
        }
    }
    
    /**
     * Get current user ID from security context
     * TODO: Implement proper security context integration
     */
    private Long getCurrentUserId() {
        // For now, return a default user ID
        // In production, this should get the user ID from Spring Security context
        return 1L; // Temporary hardcoded value
    }
    
    /**
     * Get current user name from security context
     * TODO: Implement proper security context integration
     */
    private Long getCurrentUserName() {
        // For now, return a default user name
        // In production, this should get the user name from Spring Security context
        return 1L ; // Temporary hardcoded value
    }

    /**
     * Publish a study (set status to ACTIVE if eligible)
     */
    public StudyResponseDto publishStudy(Long id) {
        logger.info("Publishing study with ID: {}", id);

        // 1. Fetch study
        StudyEntity study = studyRepository.findByIdWithAllRelationships(id)
            .orElseThrow(() -> new StudyNotFoundException(id));

        // 2. Perform comprehensive validation for publishing
        validateStudyOperation(study, "ACTIVE", "publish study");

        // 3. Set status to ACTIVE (published)
        StudyStatusEntity activeStatus = studyStatusRepository.findByCodeIgnoreCase("ACTIVE")
            .orElseThrow(() -> new IllegalStateException("ACTIVE status not found in lookup table"));
        study.setStudyStatus(activeStatus);

        // 4. Save and return updated study
        StudyEntity saved = studyRepository.save(study);
        logger.info("Study {} published successfully", id);
        return studyMapper.toResponseDto(saved);
    }

    /**
     * Change study status with validation
     */
    public StudyResponseDto changeStudyStatus(Long id, String newStatus) {
        logger.info("Changing status for study {} to {}", id, newStatus);

        // 1. Fetch study
        StudyEntity study = studyRepository.findByIdWithAllRelationships(id)
            .orElseThrow(() -> new StudyNotFoundException(id));

        // 2. Perform comprehensive validation
        validateStudyOperation(study, newStatus, "change status to " + newStatus);

        // 3. Find new status entity
        StudyStatusEntity newStatusEntity = studyStatusRepository.findByCodeIgnoreCase(newStatus)
            .orElseThrow(() -> new IllegalStateException("Status not found: " + newStatus));

        // 4. Update status
        study.setStudyStatus(newStatusEntity);
        StudyEntity saved = studyRepository.save(study);
        
        logger.info("Study {} status changed to {} successfully", id, newStatus);
        return studyMapper.toResponseDto(saved);
    }

    /**
     * Get valid next statuses for a study
     */
    public List<StudyStatusComputationService.StatusTransitionRecommendation> getValidNextStatuses(Long id) {
        StudyEntity study = studyRepository.findByIdWithAllRelationships(id)
            .orElseThrow(() -> new StudyNotFoundException(id));
        
        return statusComputationService.getStatusTransitionRecommendations(study);
    }

    /**
     * Check if study allows modifications
     */
    public boolean allowsModification(Long id) {
        StudyEntity study = studyRepository.findByIdWithAllRelationships(id)
            .orElseThrow(() -> new StudyNotFoundException(id));
        
        return statusComputationService.allowsModification(study);
    }

    /**
     * Compute and update study status based on protocol versions
     */
    public StudyResponseDto computeAndUpdateStudyStatus(Long id) {
        logger.info("Computing and updating status for study {}", id);

        StudyEntity study = studyRepository.findByIdWithAllRelationships(id)
            .orElseThrow(() -> new StudyNotFoundException(id));

        String computedStatus = statusComputationService.computeStudyStatus(study);
        String currentStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;

        if (!computedStatus.equalsIgnoreCase(currentStatus)) {
            logger.info("Study {} status needs update: {} -> {}", id, currentStatus, computedStatus);
            
            StudyStatusEntity newStatusEntity = studyStatusRepository.findByCodeIgnoreCase(computedStatus)
                .orElseThrow(() -> new IllegalStateException("Status not found: " + computedStatus));
            
            study.setStudyStatus(newStatusEntity);
            study = studyRepository.save(study);
        }

        return studyMapper.toResponseDto(study);
    }

    // ========== STUDY LIFECYCLE OPERATIONS ==========

    /**
     * Suspend an active study
     */
    public StudyResponseDto suspendStudy(Long id, String reason) {
        logger.info("Suspending study {} with reason: {}", id, reason);
        
        StudyEntity study = studyRepository.findByIdWithAllRelationships(id)
            .orElseThrow(() -> new StudyNotFoundException(id));
        
        // Validate that study can be suspended
        validateStudyOperation(study, "SUSPENDED", "suspend study");
        
        // Set status to SUSPENDED
        StudyStatusEntity suspendedStatus = studyStatusRepository.findByCodeIgnoreCase("SUSPENDED")
            .orElseThrow(() -> new IllegalStateException("SUSPENDED status not found"));
        study.setStudyStatus(suspendedStatus);
        
        StudyEntity saved = studyRepository.save(study);
        logger.info("Study {} suspended successfully", id);
        return studyMapper.toResponseDto(saved);
    }

    /**
     * Resume a suspended study
     */
    public StudyResponseDto resumeStudy(Long id) {
        logger.info("Resuming study {}", id);
        
        StudyEntity study = studyRepository.findByIdWithAllRelationships(id)
            .orElseThrow(() -> new StudyNotFoundException(id));
        
        // Validate that study can be resumed (from SUSPENDED to ACTIVE)
        validateStudyOperation(study, "ACTIVE", "resume study");
        
        // Set status back to ACTIVE
        StudyStatusEntity activeStatus = studyStatusRepository.findByCodeIgnoreCase("ACTIVE")
            .orElseThrow(() -> new IllegalStateException("ACTIVE status not found"));
        study.setStudyStatus(activeStatus);
        
        StudyEntity saved = studyRepository.save(study);
        logger.info("Study {} resumed successfully", id);
        return studyMapper.toResponseDto(saved);
    }

    /**
     * Complete an active study
     */
    public StudyResponseDto completeStudy(Long id) {
        logger.info("Completing study {}", id);
        
        StudyEntity study = studyRepository.findByIdWithAllRelationships(id)
            .orElseThrow(() -> new StudyNotFoundException(id));
        
        // Validate that study can be completed
        validateStudyOperation(study, "COMPLETED", "complete study");
        
        // Set status to COMPLETED
        StudyStatusEntity completedStatus = studyStatusRepository.findByCodeIgnoreCase("COMPLETED")
            .orElseThrow(() -> new IllegalStateException("COMPLETED status not found"));
        study.setStudyStatus(completedStatus);
        
        StudyEntity saved = studyRepository.save(study);
        logger.info("Study {} completed successfully", id);
        return studyMapper.toResponseDto(saved);
    }

    /**
     * Terminate a study
     */
    public StudyResponseDto terminateStudy(Long id, String reason) {
        logger.info("Terminating study {} with reason: {}", id, reason);
        
        StudyEntity study = studyRepository.findByIdWithAllRelationships(id)
            .orElseThrow(() -> new StudyNotFoundException(id));
        
        // Validate that study can be terminated
        validateStudyOperation(study, "TERMINATED", "terminate study");
        
        // Set status to TERMINATED
        StudyStatusEntity terminatedStatus = studyStatusRepository.findByCodeIgnoreCase("TERMINATED")
            .orElseThrow(() -> new IllegalStateException("TERMINATED status not found"));
        study.setStudyStatus(terminatedStatus);
        
        StudyEntity saved = studyRepository.save(study);
        logger.info("Study {} terminated successfully", id);
        return studyMapper.toResponseDto(saved);
    }

    /**
     * Withdraw a study
     */
    public StudyResponseDto withdrawStudy(Long id, String reason) {
        logger.info("Withdrawing study {} with reason: {}", id, reason);
        
        StudyEntity study = studyRepository.findByIdWithAllRelationships(id)
            .orElseThrow(() -> new StudyNotFoundException(id));
        
        // Validate that study can be withdrawn
        validateStudyOperation(study, "WITHDRAWN", "withdraw study");
        
        // Set status to WITHDRAWN
        StudyStatusEntity withdrawnStatus = studyStatusRepository.findByCodeIgnoreCase("WITHDRAWN")
            .orElseThrow(() -> new IllegalStateException("WITHDRAWN status not found"));
        study.setStudyStatus(withdrawnStatus);
        
        StudyEntity saved = studyRepository.save(study);
        logger.info("Study {} withdrawn successfully", id);
        return studyMapper.toResponseDto(saved);
    }

    // ========== END STUDY LIFECYCLE OPERATIONS ==========

    // ========== STATUS VALIDATION METHODS ==========

    /**
     * Validate that the study allows modifications based on its current status
     */
    private void validateStudyModificationAllowed(StudyEntity study, String operation) {
        logger.debug("Validating modification permission for study {} - operation: {}", study.getId(), operation);
        
        if (!statusComputationService.allowsModification(study)) {
            String currentStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : "UNKNOWN";
            throw new IllegalStateException(
                String.format("Cannot %s: Study is in '%s' status which does not allow modifications", 
                             operation, currentStatus));
        }
    }

    /**
     * Validate status transition with detailed business rules
     */
    private void validateStatusTransition(StudyEntity study, String newStatus, String operation) {
        logger.debug("Validating status transition for study {} - operation: {} - new status: {}", 
                    study.getId(), operation, newStatus);
        
        StudyStatusComputationService.StatusTransitionResult result = 
            statusComputationService.validateStatusTransition(study, newStatus);
        
        if (!result.isValid()) {
            throw new IllegalStateException(
                String.format("Cannot %s: %s", operation, String.join("; ", result.getErrorMessages())));
        }
    }

    /**
     * Validate study entity integrity and required fields
     */
    private void validateStudyEntityIntegrity(StudyEntity study, String operation) {
        logger.debug("Validating study entity integrity for study {} - operation: {}", study.getId(), operation);
        
        // Validate required fields based on current status
        String currentStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;
        
        if ("UNDER_REVIEW".equalsIgnoreCase(currentStatus) || 
            "APPROVED".equalsIgnoreCase(currentStatus) || 
            "ACTIVE".equalsIgnoreCase(currentStatus)) {
            
            if (study.getName() == null || study.getName().trim().isEmpty()) {
                throw new IllegalStateException("Study name is required for status: " + currentStatus);
            }
            
            if (study.getDescription() == null || study.getDescription().trim().isEmpty()) {
                throw new IllegalStateException("Study description is required for status: " + currentStatus);
            }
            
            if (study.getPrimaryObjective() == null || study.getPrimaryObjective().trim().isEmpty()) {
                throw new IllegalStateException("Primary objective is required for status: " + currentStatus);
            }
        }
    }

    /**
     * Validate cross-entity consistency between study and its protocol versions
     */
    private void validateCrossEntityConsistency(StudyEntity study, String operation) {
        logger.debug("Validating cross-entity consistency for study {} - operation: {}", study.getId(), operation);
        
        String studyStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;
        
        try {
            // Use the comprehensive cross-entity validation service
            CrossEntityStatusValidationService.CrossEntityValidationResult validationResult = 
                crossEntityValidationService.validateCrossEntityDependencies(study, studyStatus, operation);
            
            // Handle validation errors
            if (!validationResult.getErrors().isEmpty()) {
                String errorMessage = "Cross-entity validation failures: " + 
                    String.join("; ", validationResult.getErrors());
                logger.error("Cross-entity validation failed for study {}: {}", study.getId(), errorMessage);
                throw new IllegalStateException(errorMessage);
            }
            
            // Log warnings but don't fail validation
            if (!validationResult.getWarnings().isEmpty()) {
                logger.warn("Cross-entity validation warnings for study {}: {}", 
                           study.getId(), String.join("; ", validationResult.getWarnings()));
            }
            
            // Log validation details for debugging
            logger.debug("Cross-entity validation details for study {}: {}", 
                        study.getId(), validationResult.getValidationDetails());
                        
        } catch (Exception e) {
            logger.error("Error during cross-entity validation for study {}: {}", study.getId(), e.getMessage());
            throw new RuntimeException("Cross-entity validation failed", e);
        }
    }

    /**
     * Comprehensive validation wrapper for all study operations
     */
    private void validateStudyOperation(StudyEntity study, String newStatus, String operation) {
        logger.debug("Performing comprehensive validation for study {} - operation: {} - new status: {}", 
                    study.getId(), operation, newStatus);
        
        // 1. Entity integrity validation
        validateStudyEntityIntegrity(study, operation);
        
        // 2. Status transition validation (if new status is provided)
        if (newStatus != null && !newStatus.trim().isEmpty()) {
            validateStatusTransition(study, newStatus, operation);
        }
        
        // 3. Cross-entity consistency validation
        validateCrossEntityConsistency(study, operation);
        
        logger.debug("All validations passed for study {} - operation: {}", study.getId(), operation);
    }

    // ========== PUBLIC VALIDATION METHODS ==========
    
    /**
     * Perform comprehensive cross-entity validation for a study
     * Useful for external validation checks and testing
     */
    public CrossEntityStatusValidationService.CrossEntityValidationResult validateStudyCrossEntity(Long studyId, String targetStatus, String operation) {
        logger.info("Performing cross-entity validation for study {} - target status: {} - operation: {}", 
                   studyId, targetStatus, operation);
        
        StudyEntity study = studyRepository.findById(studyId)
            .orElseThrow(() -> new StudyNotFoundException("Study not found with id: " + studyId));
        
        return crossEntityValidationService.validateCrossEntityDependencies(study, targetStatus, operation);
    }

    // ========== END STATUS VALIDATION METHODS ==========

}

