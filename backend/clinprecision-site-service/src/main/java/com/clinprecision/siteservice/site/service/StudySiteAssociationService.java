package com.clinprecision.siteservice.site.service;

import com.clinprecision.siteservice.repository.SiteRepository;
import com.clinprecision.siteservice.repository.SiteStudyRepository;
import com.clinprecision.siteservice.ui.model.SiteStudyDto;
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
    public SiteStudyDto associateSiteWithStudy(Long siteId, Long studyId, String userId, String reason) {
        // Validate site exists
        SiteEntity site = siteRepository.findById(siteId)
            .orElseThrow(() -> new IllegalArgumentException("Site not found: " + siteId));
        

        // Create the association
        SiteStudyEntity siteStudy = new SiteStudyEntity();
        siteStudy.setSite(site);
        siteStudy.setStudyId(studyId);
        siteStudy.setStatus(SiteStudyEntity.SiteStudyStatus.PENDING);
        
        SiteStudyEntity savedSiteStudy = siteStudyRepository.save(siteStudy);
        
        return mapToDto(savedSiteStudy);
    }

    /**
     * Activate a site for a specific study
     * 
     * @param associationId Site-Study association ID
     * @param studyId Study ID
     * @param userId User performing activation
     * @param reason Reason for activation
     * @return Updated site-study association
     */
    public SiteStudyDto activateSiteForStudy(Long associationId, Long studyId, String userId, String reason) {
        SiteStudyEntity siteStudy = siteStudyRepository.findByIdAndStudyId(associationId, studyId);
        
        if (siteStudy == null) {
            throw new IllegalArgumentException("Site-study association not found");
        }
        
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
        return siteStudyRepository.findAll().stream()
            .filter(siteStudy -> siteStudy.getSite().getId().equals(siteId))
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    /**
     * Get all site associations for a study
     * 
     * @param studyId Study ID
     * @return List of site associations
     */
    public List<SiteStudyDto> getSiteAssociationsForStudy(Long studyId) {
        return siteStudyRepository.findByStudyId(studyId).stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    /**
     * Update a site-study association
     * 
     * @param associationId Site-Study association ID
     * @param studyId Study ID
     * @param subjectEnrollmentCap Optional enrollment cap
     * @param subjectEnrollmentCount Optional enrollment count
     * @param userId User performing update
     * @param reason Reason for update
     * @return Updated site-study association
     */
    public SiteStudyDto updateSiteStudyAssociation(Long associationId, Long studyId, 
                                                   Integer subjectEnrollmentCap, 
                                                   Integer subjectEnrollmentCount,
                                                   String userId, String reason) {
        SiteStudyEntity siteStudy = siteStudyRepository.findByIdAndStudyId(associationId, studyId);
        
        if (siteStudy == null) {
            throw new IllegalArgumentException("Site-study association not found");
        }
        
        // Update fields if provided
        if (subjectEnrollmentCap != null) {
            siteStudy.setSubjectEnrollmentCap(subjectEnrollmentCap);
        }
        if (subjectEnrollmentCount != null) {
            siteStudy.setSubjectEnrollmentCount(subjectEnrollmentCount);
        }
        
        SiteStudyEntity updatedSiteStudy = siteStudyRepository.save(siteStudy);
        
        return mapToDto(updatedSiteStudy);
    }

    /**
     * Remove association between site and study
     * 
     * @param associationId Site-Study association ID
     * @param studyId Study ID
     * @param userId User performing removal
     * @param reason Reason for removal
     */
    public void removeSiteStudyAssociation(Long associationId, Long studyId, String userId, String reason) {
        SiteStudyEntity siteStudy = siteStudyRepository.findByIdAndStudyId(associationId, studyId);
        
        if (siteStudy == null) {
            throw new IllegalArgumentException("Site-study association not found");
        }
        
        // For audit compliance, we might want to soft delete instead
        siteStudy.setStatus(SiteStudyEntity.SiteStudyStatus.INACTIVE);
        siteStudy.setDeactivationDate(LocalDateTime.now());
        siteStudyRepository.save(siteStudy);
    }

    /**
     * Map entity to DTO
     */
    private SiteStudyDto mapToDto(SiteStudyEntity entity) {
        SiteStudyDto dto = new SiteStudyDto();
        dto.setId(entity.getId());
        dto.setStudyId(entity.getStudyId());
        dto.setStatus(entity.getStatus());
        dto.setActivationDate(entity.getActivationDate());
        dto.setDeactivationDate(entity.getDeactivationDate());
        dto.setSubjectEnrollmentCap(entity.getSubjectEnrollmentCap());
        dto.setSubjectEnrollmentCount(entity.getSubjectEnrollmentCount());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // Include site details for display
        if (entity.getSite() != null) {
            dto.setSiteName(entity.getSite().getName());
            dto.setSiteNumber(entity.getSite().getSiteNumber());
        }
        
        return dto;
    }
}
