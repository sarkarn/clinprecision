package com.clinprecision.siteservice.ui.controller;

import com.clinprecision.siteservice.site.service.StudySiteAssociationService;
import com.clinprecision.siteservice.ui.model.ActivateSiteForStudyDto;
import com.clinprecision.siteservice.ui.model.CreateStudySiteAssociationDto;
import com.clinprecision.siteservice.ui.model.UpdateStudySiteAssociationDto;
import com.clinprecision.siteservice.ui.model.SiteStudyDto;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing Study-Site associations
 * This controller handles the many-to-many relationship between studies and sites.
 */
@RestController
@RequestMapping("/api/sites")
public class StudySiteAssociationController {

    @Autowired
    private StudySiteAssociationService studySiteAssociationService;

    /**
     * Associate a site with a study
     */
    @PostMapping("/{siteId}/studies")
    public ResponseEntity<SiteStudyDto> associateSiteWithStudy(
            @PathVariable Long siteId,
            @Valid @RequestBody CreateStudySiteAssociationDto associationDto,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "userEmail", required = false) String userEmail,
            Authentication authentication) {
        
        String userId = getUserId(authentication, userEmail, authorization);
        SiteStudyDto association = studySiteAssociationService.associateSiteWithStudy(
            siteId, 
            associationDto.getStudyId(), 
            userId, 
            associationDto.getReason()
        );
        
        return ResponseEntity.ok(association);
    }

    /**
     * Activate a site for a specific study
     */
    @PostMapping("/{siteId}/studies/{studyId}/activate")
    public ResponseEntity<SiteStudyDto> activateSiteForStudy(
            @PathVariable Long siteId,
        @PathVariable Long studyId,
            @Valid @RequestBody ActivateSiteForStudyDto activationDto,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "userEmail", required = false) String userEmail,
            Authentication authentication) {
        
        String userId = getUserId(authentication, userEmail, authorization);
        
        // First find the association by siteId and studyId
        List<SiteStudyDto> associations = studySiteAssociationService.getStudyAssociationsForSite(siteId);
        SiteStudyDto association = associations.stream()
            .filter(a -> a.getStudyId().equals(studyId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Site-study association not found"));
        
        // Now activate using the association ID
        SiteStudyDto activatedAssociation = studySiteAssociationService.activateSiteForStudy(
            association.getId(), 
            studyId, 
            userId, 
            activationDto.getReason()
        );
        
        return ResponseEntity.ok(activatedAssociation);
    }

    /**
     * Get all study associations for a site
     */
    @GetMapping("/{siteId}/studies")
    public ResponseEntity<List<SiteStudyDto>> getStudyAssociationsForSite(@PathVariable Long siteId) {
        List<SiteStudyDto> associations = studySiteAssociationService.getStudyAssociationsForSite(siteId);
        return ResponseEntity.ok(associations);
    }

    /**
     * Get a specific study association by ID
     */
    @GetMapping("/{siteId}/studies/{studyId}/association/{associationId}")
    public ResponseEntity<SiteStudyDto> getStudyAssociationById(
            @PathVariable Long siteId,
            @PathVariable Long studyId,
            @PathVariable Long associationId) {
        
        List<SiteStudyDto> associations = studySiteAssociationService.getStudyAssociationsForSite(siteId);
        SiteStudyDto association = associations.stream()
            .filter(a -> a.getId().equals(associationId) && a.getStudyId().equals(studyId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Site-study association not found"));
        
        return ResponseEntity.ok(association);
    }

    /**
     * Get all site associations for a study
     */
    @GetMapping("/studies/{studyId}")
    public ResponseEntity<List<SiteStudyDto>> getSiteAssociationsForStudy(@PathVariable Long studyId) {
        List<SiteStudyDto> associations = studySiteAssociationService.getSiteAssociationsForStudy(studyId);
        return ResponseEntity.ok(associations);
    }

    /**
     * Update a site-study association
     */
    @PutMapping("/{siteId}/studies/{studyId}")
    public ResponseEntity<SiteStudyDto> updateSiteStudyAssociation(
            @PathVariable Long siteId,
            @PathVariable Long studyId,
            @Valid @RequestBody UpdateStudySiteAssociationDto updateDto,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "userEmail", required = false) String userEmail,
            Authentication authentication) {
        
        String userId = getUserId(authentication, userEmail, authorization);
        
        // First find the association by siteId and studyId
        List<SiteStudyDto> associations = studySiteAssociationService.getStudyAssociationsForSite(siteId);
        SiteStudyDto association = associations.stream()
            .filter(a -> a.getStudyId().equals(studyId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Site-study association not found"));
        
        // Now update using the association ID
        SiteStudyDto updatedAssociation = studySiteAssociationService.updateSiteStudyAssociation(
            association.getId(), 
            studyId,
            updateDto.getSubjectEnrollmentCap(),
            updateDto.getSubjectEnrollmentCount(),
            userId, 
            updateDto.getReason()
        );
        
        return ResponseEntity.ok(updatedAssociation);
    }

    /**
     * Remove association between site and study
     */
    @DeleteMapping("/{siteId}/studies/{studyId}")
    public ResponseEntity<Void> removeSiteStudyAssociation(
            @PathVariable Long siteId,
            @PathVariable Long studyId,
            @RequestParam(required = false) String reason,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "userEmail", required = false) String userEmail,
            Authentication authentication) {
        
        String userId = getUserId(authentication, userEmail, authorization);
        
        // First find the association by siteId and studyId
        List<SiteStudyDto> associations = studySiteAssociationService.getStudyAssociationsForSite(siteId);
        SiteStudyDto association = associations.stream()
            .filter(a -> a.getStudyId().equals(studyId))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Site-study association not found"));
        
        // Now remove using the association ID
        studySiteAssociationService.removeSiteStudyAssociation(
            association.getId(), 
            studyId, 
            userId, 
            reason != null ? reason : "Administrative removal"
        );
        
        return ResponseEntity.ok().build();
    }

    /**
     * Helper method to extract user ID from authentication context
     */
    private String getUserId(Authentication authentication, String userEmail, String authorization) {
        if (authentication != null && authentication.getName() != null) {
            return authentication.getName();
        }
        
        if (userEmail != null && !userEmail.isEmpty()) {
            return userEmail;
        }
        
        // Fallback for development/testing
        return "system";
    }
}
