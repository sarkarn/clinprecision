package com.clinprecision.clinopsservice.service;



import com.clinprecision.clinopsservice.exception.StudyValidationException;
import com.clinprecision.clinopsservice.repository.StudyRepository;
import com.clinprecision.clinopsservice.study.dto.request.StudyCreateRequestDto;
import com.clinprecision.clinopsservice.study.dto.request.StudyUpdateRequestDto;
import com.clinprecision.clinopsservice.entity.StudyEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Service for validating study operations
 * Contains business validation logic for studies
 */
@Service
public class StudyValidationService {
    
    private final StudyRepository studyRepository;
    
    public StudyValidationService(StudyRepository studyRepository) {
        this.studyRepository = studyRepository;
    }
    
    /**
     * Validate study creation request
     */
    public void validateStudyCreation(StudyCreateRequestDto request) {
        if (request == null) {
            throw new StudyValidationException("Study creation request cannot be null");
        }
        
        // 1. Check protocol number uniqueness
        if (request.getProtocolNumber() != null && !request.getProtocolNumber().trim().isEmpty()) {
            Optional<StudyEntity> existing = studyRepository.findByProtocolNumber(request.getProtocolNumber());
            if (existing.isPresent()) {
                throw new StudyValidationException("Protocol number already exists: " + request.getProtocolNumber());
            }
        }
        
        // 2. Validate date ranges
        validateDateRange(request.getStartDate(), request.getEndDate());
        
        // Note: Organization assignments and metadata are handled separately in DDD architecture
        // - Organization assignments are managed through OrganizationStudy aggregate
        // - Metadata is not part of the core Study aggregate in DDD model
    }
    
    /**
     * Validate study update request
     */
    public void validateStudyUpdate(StudyEntity existingStudy, StudyUpdateRequestDto request) {
        if (existingStudy == null) {
            throw new StudyValidationException("Existing study cannot be null");
        }
        
        if (request == null) {
            throw new StudyValidationException("Study update request cannot be null");
        }
        
        // 1. Check if study is locked
        if (Boolean.TRUE.equals(existingStudy.getIsLocked())) {
            throw new StudyValidationException("Cannot update locked study");
        }
        
        // 2. Check protocol number uniqueness (excluding current study)
        if (request.getProtocolNumber() != null && !request.getProtocolNumber().trim().isEmpty()) {
            Long count = studyRepository.countByProtocolNumberExcludingId(request.getProtocolNumber(), existingStudy.getId());
            if (count > 0) {
                throw new StudyValidationException("Protocol number already exists: " + request.getProtocolNumber());
            }
        }
        
        // 3. Validate date ranges
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : existingStudy.getStartDate();
        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : existingStudy.getEndDate();
        validateDateRange(startDate, endDate);
        
        // Note: Organization assignments and metadata are handled separately in DDD architecture
        // - Organization assignments are managed through OrganizationStudy aggregate
        // - Metadata is not part of the core Study aggregate in DDD model
    }
    
    /**
     * Validate date range
     */
    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null) {
            if (endDate.isBefore(startDate)) {
                throw new StudyValidationException("End date cannot be before start date");
            }
            
            // Validate that start date is not too far in the past
            LocalDate threeYearsAgo = LocalDate.now().minusYears(3);
            if (startDate.isBefore(threeYearsAgo)) {
                throw new StudyValidationException("Start date cannot be more than 3 years in the past");
            }
            
            // Validate that end date is not too far in the future
            LocalDate tenYearsFromNow = LocalDate.now().plusYears(10);
            if (endDate.isAfter(tenYearsFromNow)) {
                throw new StudyValidationException("End date cannot be more than 10 years in the future");
            }
        }
    }
    
    /*
     * NOTE: The following validation methods are commented out because they were designed
     * for the legacy DTO structure. In the DDD/CQRS architecture:
     * - Organization assignments are managed through the OrganizationStudy aggregate
     * - Metadata is not part of the core Study aggregate
     * 
     * These validations may be re-implemented in their respective bounded contexts if needed.
     */
    
    // /**
    //  * Validate organization assignments
    //  */
    // private void validateOrganizationAssignments(StudyCreateRequestDto request) {
    //     // Legacy validation - not used in DDD architecture
    // }
    // 
    // /**
    //  * Validate organization assignments (update version)
    //  */
    // private void validateOrganizationAssignments(StudyUpdateRequestDto request) {
    //     // Legacy validation - not used in DDD architecture
    // }
    // 
    // /**
    //  * Validate metadata JSON structure
    //  */
    // private void validateMetadata(String metadata) {
    //     // Legacy validation - not used in DDD architecture
    // }
}



