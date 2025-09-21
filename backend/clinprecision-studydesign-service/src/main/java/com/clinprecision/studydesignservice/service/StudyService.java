// ...existing code...
// ...existing code...
package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.dto.*;
import com.clinprecision.studydesignservice.entity.OrganizationStudyEntity;
import com.clinprecision.studydesignservice.entity.StudyEntity;
import com.clinprecision.studydesignservice.entity.StudyStatusEntity;
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
    
    public StudyService(StudyRepository studyRepository,
                       OrganizationStudyRepository organizationStudyRepository,
                       StudyMapper studyMapper,
                       StudyValidationService validationService,
                       StudyStatusRepository studyStatusRepository,
                       StudyDocumentService documentService) {
        this.studyRepository = studyRepository;
        this.organizationStudyRepository = organizationStudyRepository;
        this.studyMapper = studyMapper;
        this.validationService = validationService;
        this.studyStatusRepository = studyStatusRepository;
        this.documentService = documentService;
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
        
        // 4. Save study
        StudyEntity savedStudy = studyRepository.save(study);
        logger.info("Study saved with ID: {}", savedStudy.getId());
        
        // 5. Handle organization associations
        if (request.getOrganizations() != null && !request.getOrganizations().isEmpty()) {
            saveOrganizationAssociations(savedStudy, request.getOrganizations());
        }
        
        // 6. Reload study with associations for response
        StudyEntity studyWithAssociations = studyRepository.findByIdWithAllRelationships(savedStudy.getId())
            .orElse(savedStudy);
        
        // 7. Return response
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
        StudyEntity existingStudy = studyRepository.findById(id)
            .orElseThrow(() -> new StudyNotFoundException(id));
        
        // 2. Validate update
        validationService.validateStudyUpdate(existingStudy, request);
        
        // 3. Update fields
        studyMapper.updateEntityFromDto(request, existingStudy);
        
        // 4. Update audit information
        existingStudy.setModifiedBy(getCurrentUserName()); // Set who modified it
        
        // 5. Save updated study
        StudyEntity updatedStudy = studyRepository.save(existingStudy);
        
        // 5. Update organization associations if provided
        if (request.getOrganizations() != null) {
            updateOrganizationAssociations(updatedStudy, request.getOrganizations());
        }
        
        // 6. Reload study with associations for response
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

        // 2. Validate eligibility (all design phases complete)
        // TODO: Add more robust validation as needed
        // For now, assume eligible if not already ACTIVE/COMPLETED/TERMINATED
        String currentStatus = study.getStudyStatus() != null ? study.getStudyStatus().getCode() : null;
        if ("ACTIVE".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("Study is already published (ACTIVE)");
        }
        if ("COMPLETED".equalsIgnoreCase(currentStatus) || "TERMINATED".equalsIgnoreCase(currentStatus)) {
            throw new IllegalStateException("Cannot publish a completed or terminated study");
        }

        // 3. Set status to ACTIVE (published)
        StudyStatusEntity activeStatus = studyStatusRepository.findByCodeIgnoreCase("ACTIVE")
            .orElseThrow(() -> new IllegalStateException("ACTIVE status not found in lookup table"));
        study.setStudyStatus(activeStatus);

        // 4. Save and return updated study
        StudyEntity saved = studyRepository.save(study);
        logger.info("Study {} published successfully", id);
        return studyMapper.toResponseDto(saved);
    }
}

