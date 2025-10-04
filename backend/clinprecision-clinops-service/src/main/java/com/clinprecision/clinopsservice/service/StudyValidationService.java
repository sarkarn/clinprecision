package com.clinprecision.clinopsservice.service;



import com.clinprecision.clinopsservice.exception.StudyValidationException;
import com.clinprecision.clinopsservice.repository.StudyRepository;
import com.clinprecision.common.dto.clinops.StudyCreateRequestDto;
import com.clinprecision.common.dto.clinops.StudyUpdateRequestDto;
import com.clinprecision.common.entity.clinops.StudyEntity;
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
        
        // 3. Validate organization assignments
        if (request.getOrganizations() != null && !request.getOrganizations().isEmpty()) {
            validateOrganizationAssignments(request);
        }
        
        // 4. Validate metadata JSON if provided
        validateMetadata(request.getMetadata());
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
        
        // 4. Validate metadata JSON if provided
        if (request.getMetadata() != null) {
            validateMetadata(request.getMetadata());
        }
        
        // 5. Validate organization assignments if provided
        if (request.getOrganizations() != null && !request.getOrganizations().isEmpty()) {
            validateOrganizationAssignments(request);
        }
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
    
    /**
     * Validate organization assignments
     */
    private void validateOrganizationAssignments(StudyCreateRequestDto request) {
        // Check for duplicate organization-role combinations
        boolean hasDuplicates = request.getOrganizations().stream()
            .map(org -> org.getOrganizationId() + "-" + org.getRole())
            .distinct()
            .count() != request.getOrganizations().size();
            
        if (hasDuplicates) {
            throw new StudyValidationException("Duplicate organization-role combinations are not allowed");
        }
        
        // Validate that each organization has a valid role
        for (var org : request.getOrganizations()) {
            if (org.getOrganizationId() == null || org.getOrganizationId() <= 0) {
                throw new StudyValidationException("Invalid organization ID: " + org.getOrganizationId());
            }
            
            if (org.getRole() == null || org.getRole().trim().isEmpty()) {
                throw new StudyValidationException("Organization role cannot be empty");
            }
            
            // Validate date range for organization assignment
            if (org.getStartDate() != null && org.getEndDate() != null) {
                if (org.getEndDate().isBefore(org.getStartDate())) {
                    throw new StudyValidationException("Organization assignment end date cannot be before start date");
                }
            }
        }
    }
    
    /**
     * Validate organization assignments (update version)
     */
    private void validateOrganizationAssignments(StudyUpdateRequestDto request) {
        // Check for duplicate organization-role combinations
        boolean hasDuplicates = request.getOrganizations().stream()
            .map(org -> org.getOrganizationId() + "-" + org.getRole())
            .distinct()
            .count() != request.getOrganizations().size();
            
        if (hasDuplicates) {
            throw new StudyValidationException("Duplicate organization-role combinations are not allowed");
        }
        
        // Validate that each organization has a valid role
        for (var org : request.getOrganizations()) {
            if (org.getOrganizationId() == null || org.getOrganizationId() <= 0) {
                throw new StudyValidationException("Invalid organization ID: " + org.getOrganizationId());
            }
            
            if (org.getRole() == null || org.getRole().trim().isEmpty()) {
                throw new StudyValidationException("Organization role cannot be empty");
            }
            
            // Validate date range for organization assignment
            if (org.getStartDate() != null && org.getEndDate() != null) {
                if (org.getEndDate().isBefore(org.getStartDate())) {
                    throw new StudyValidationException("Organization assignment end date cannot be before start date");
                }
            }
        }
    }
    
    /**
     * Validate metadata JSON structure
     */
    private void validateMetadata(String metadata) {
        if (metadata == null || metadata.trim().isEmpty()) {
            return; // Metadata is optional
        }
        
        try {
            // Basic JSON structure validation
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.readTree(metadata);
        } catch (Exception e) {
            throw new StudyValidationException("Invalid JSON format in metadata: " + e.getMessage());
        }
    }
}
