package com.clinprecision.adminservice.site.service;

import com.clinprecision.adminservice.repository.SiteRepository;
import com.clinprecision.adminservice.repository.SiteStudyRepository;
import com.clinprecision.adminservice.ui.model.SiteStudyDto;
import com.clinprecision.common.entity.SiteEntity;
import com.clinprecision.common.entity.SiteStudyEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing Study-Site associations
 * This handles the many-to-many relationship between studies and sites.
 * Sites can be created independently and later associated with studies.
 */
@Service
@Transactional
public class StudySiteAssociationService {

    @Autowired
    private SiteRepository siteRepository;
    
    @Autowired
    private SiteStudyRepository siteStudyRepository;

    /**
     * Associate a site with a study
     * 
     * @param siteId The site ID
     * @param studyId The study ID (from study design service)
     * @param userId User performing the association
     * @param reason Reason for the association (audit compliance)
     * @return The created site-study association
     */
    public SiteStudyDto associateSiteWithStudy(Long siteId, String studyId, String userId, String reason) {
        // Validate site exists
        SiteEntity site = siteRepository.findById(siteId)
            .orElseThrow(() -> new IllegalArgumentException("Site not found: " + siteId));
        
        // Check if association already exists
        if (siteStudyRepository.findBySite_IdAndStudyId(siteId, studyId).isPresent()) {
            throw new IllegalArgumentException("Site " + siteId + " is already associated with study " + studyId);
        }
        
        // Create the association
        SiteStudyEntity siteStudy = new SiteStudyEntity();
        siteStudy.setSite(site);
        siteStudy.setStudyId(studyId);
        siteStudy.setStatus(SiteStudyEntity.SiteStudyStatus.PENDING);
        siteStudy.setSiteStudyId(generateSiteStudyId(site.getSiteNumber(), studyId));
        
        SiteStudyEntity savedSiteStudy = siteStudyRepository.save(siteStudy);
        
        return mapToDto(savedSiteStudy);
    }

    /**
     * Activate a site for a specific study
     * 
     * @param siteId Site ID
     * @param studyId Study ID
     * @param userId User performing activation
     * @param reason Reason for activation
     * @return Updated site-study association
     */
    public SiteStudyDto activateSiteForStudy(Long siteId, String studyId, String userId, String reason) {
        SiteStudyEntity siteStudy = siteStudyRepository.findBySite_IdAndStudyId(siteId, studyId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Site " + siteId + " is not associated with study " + studyId));
        
        if (siteStudy.getStatus() == SiteStudyEntity.SiteStudyStatus.ACTIVE) {
            throw new IllegalArgumentException("Site is already active for this study");
        }
        
        siteStudy.setStatus(SiteStudyEntity.SiteStudyStatus.ACTIVE);
        siteStudy.setActivationDate(LocalDateTime.now());
        
        SiteStudyEntity updatedSiteStudy = siteStudyRepository.save(siteStudy);
        
        return mapToDto(updatedSiteStudy);
    }

    /**
     * Get all study associations for a site
     * 
     * @param siteId Site ID
     * @return List of study associations
     */
    public List<SiteStudyDto> getStudyAssociationsForSite(Long siteId) {
        return siteStudyRepository.findBySite_Id(siteId).stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    /**
     * Get all site associations for a study
     * 
     * @param studyId Study ID
     * @return List of site associations
     */
    public List<SiteStudyDto> getSiteAssociationsForStudy(String studyId) {
        return siteStudyRepository.findByStudyId(studyId).stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    /**
     * Remove association between site and study
     * 
     * @param siteId Site ID
     * @param studyId Study ID
     * @param userId User performing removal
     * @param reason Reason for removal
     */
    public void removeSiteStudyAssociation(Long siteId, String studyId, String userId, String reason) {
        SiteStudyEntity siteStudy = siteStudyRepository.findBySite_IdAndStudyId(siteId, studyId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Site " + siteId + " is not associated with study " + studyId));
        
        // For audit compliance, we might want to soft delete instead
        siteStudy.setStatus(SiteStudyEntity.SiteStudyStatus.INACTIVE);
        siteStudy.setDeactivationDate(LocalDateTime.now());
        siteStudyRepository.save(siteStudy);
    }

    /**
     * Generate a unique site-study identifier
     */
    private String generateSiteStudyId(String siteNumber, String studyId) {
        return siteNumber + "-" + studyId;
    }

    /**
     * Map entity to DTO
     */
    private SiteStudyDto mapToDto(SiteStudyEntity entity) {
        SiteStudyDto dto = new SiteStudyDto();
        dto.setId(entity.getId());
        dto.setSiteId(entity.getSite().getId());
        dto.setStudyId(entity.getStudyId());
        dto.setSiteStudyId(entity.getSiteStudyId());
        dto.setStatus(entity.getStatus());
        dto.setActivationDate(entity.getActivationDate());
        dto.setDeactivationDate(entity.getDeactivationDate());
        dto.setSubjectEnrollmentCap(entity.getSubjectEnrollmentCap());
        dto.setSubjectEnrollmentCount(entity.getSubjectEnrollmentCount());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}