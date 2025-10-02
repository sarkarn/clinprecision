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
     * Find all site relationships for a specific study.
     *
     * @param studyId the ID of the study
     * @return list of site relationships for the specified study
     */
    List<SiteStudyEntity> findByStudyId(Long studyId);
    
    /**
     * Find all active site relationships for a specific study.
     *
     * @param studyId the ID of the study
     * @param status the status of the relationships to find
     * @return list of active site relationships for the specified study
     */
    List<SiteStudyEntity> findByStudyIdAndStatus(Long studyId, SiteStudyEntity.SiteStudyStatus status);

    /**
     * Find site-study association by ID and study ID for validation
     *
     * @param id the site-study association ID  
     * @param studyId the study ID
     * @return the site-study association if found
     */
    SiteStudyEntity findByIdAndStudyId(Long id, Long studyId);



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
