package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.dto.*;
import com.clinprecision.studydesignservice.entity.OrganizationStudyEntity;
import com.clinprecision.studydesignservice.entity.StudyEntity;
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
    
    public StudyService(StudyRepository studyRepository,
                       OrganizationStudyRepository organizationStudyRepository,
                       StudyMapper studyMapper,
                       StudyValidationService validationService) {
        this.studyRepository = studyRepository;
        this.organizationStudyRepository = organizationStudyRepository;
        this.studyMapper = studyMapper;
        this.validationService = validationService;
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
}

