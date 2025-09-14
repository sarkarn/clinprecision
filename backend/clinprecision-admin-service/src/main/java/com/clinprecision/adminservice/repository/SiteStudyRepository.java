package com.clinprecision.adminservice.repository;


import com.clinprecision.common.entity.SiteStudyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for SiteStudy entities.
 */
@Repository
public interface SiteStudyRepository extends JpaRepository<SiteStudyEntity, Long> {
    
    /**
     * Find all study relationships for a specific site.
     *
     * @param siteId the ID of the site
     * @return list of study relationships for the specified site
     */
    List<SiteStudyEntity> findBySite_Id(Long siteId);
    
    /**
     * Find all site relationships for a specific study.
     *
     * @param studyId the ID of the study
     * @return list of site relationships for the specified study
     */
    List<SiteStudyEntity> findByStudyId(String studyId);
    
    /**
     * Find all active site relationships for a specific study.
     *
     * @param studyId the ID of the study
     * @param status the status of the relationships to find
     * @return list of active site relationships for the specified study
     */
    List<SiteStudyEntity> findByStudyIdAndStatus(String studyId, SiteStudyEntity.SiteStudyStatus status);
    
    /**
     * Find a specific relationship for a site in a study.
     *
     * @param siteId the ID of the site
     * @param studyId the ID of the study
     * @return optional containing the site study relationship if found
     */
    Optional<SiteStudyEntity> findBySite_IdAndStudyId(Long siteId, String studyId);
    
    /**
     * Find a site study relationship by its site study ID.
     *
     * @param siteStudyId the site study ID
     * @return optional containing the site study relationship if found
     */
    Optional<SiteStudyEntity> findBySiteStudyId(String siteStudyId);
    
    /**
     * Find all site study relationships with activation dates before a specific date.
     *
     * @param activationDate the activation date
     * @return list of relationships with activation dates before the specified date
     */
    List<SiteStudyEntity> findByActivationDateBefore(LocalDateTime activationDate);
    
    /**
     * Find all relationships with a specific status.
     *
     * @param status the status
     * @return list of relationships with the specified status
     */
    List<SiteStudyEntity> findByStatus(SiteStudyEntity.SiteStudyStatus status);
    
    /**
     * Find all sites that have capacity for more subjects.
     *
     * @return list of site study relationships where enrollment count is less than capacity
     */
    @Query("SELECT s FROM SiteStudyEntity s WHERE s.subjectEnrollmentCount < s.subjectEnrollmentCap")
    List<SiteStudyEntity> findSitesWithAvailableCapacity();
}
