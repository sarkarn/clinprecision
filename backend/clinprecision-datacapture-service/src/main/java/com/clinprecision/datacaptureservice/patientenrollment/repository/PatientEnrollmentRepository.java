package com.clinprecision.datacaptureservice.patientenrollment.repository;

import com.clinprecision.datacaptureservice.patientenrollment.entity.PatientEnrollmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

/**
 * Repository interface for PatientEnrollmentEntity
 * Follows established ClinPrecision patterns
 */
@Repository
public interface PatientEnrollmentRepository extends JpaRepository<PatientEnrollmentEntity, Long> {

    /**
     * Find enrollment by aggregate UUID (used by Axon projection handlers)
     */
    Optional<PatientEnrollmentEntity> findByAggregateUuid(String aggregateUuid);

    /**
     * Find enrollment by screening number (human-readable ID)
     */
    Optional<PatientEnrollmentEntity> findByScreeningNumber(String screeningNumber);

    /**
     * Find enrollments by patient ID
     */
    List<PatientEnrollmentEntity> findByPatientId(Long patientId);

    /**
     * Find the most recent enrollment by patient ID
     */
    Optional<PatientEnrollmentEntity> findTopByPatientIdOrderByEnrollmentDateDesc(Long patientId);

    /**
     * Find enrollments by patient aggregate UUID
     */
    List<PatientEnrollmentEntity> findByPatientAggregateUuid(String patientAggregateUuid);

    /**
     * Find enrollments by study ID
     */
    List<PatientEnrollmentEntity> findByStudyId(Long studyId);

    /**
     * Find enrollments by study site ID (site association ID)
     */
    List<PatientEnrollmentEntity> findByStudySiteId(Long studySiteId);

    /**
     * Find enrollments by site aggregate UUID
     */
    List<PatientEnrollmentEntity> findBySiteAggregateUuid(String siteAggregateUuid);

    /**
     * Find enrollments by status
     */
    List<PatientEnrollmentEntity> findByEnrollmentStatus(String enrollmentStatus);

    /**
     * Check if patient is already enrolled in study (for uniqueness validation)
     */
    boolean existsByPatientIdAndStudyId(Long patientId, Long studyId);

    /**
     * Check if screening number exists (for uniqueness validation)
     */
    boolean existsByScreeningNumber(String screeningNumber);

    /**
     * Check if a screening number exists within a specific study (industry norm)
     */
    boolean existsByStudyIdAndScreeningNumber(Long studyId, String screeningNumber);

    /**
     * Find enrollments by enrolled by user
     */
    List<PatientEnrollmentEntity> findByEnrolledBy(String enrolledBy);

    /**
     * Find enrollments with confirmed eligibility
     */
    List<PatientEnrollmentEntity> findByEligibilityConfirmed(Boolean eligibilityConfirmed);

    /**
     * Find enrollments by study and status
     */
    List<PatientEnrollmentEntity> findByStudyIdAndEnrollmentStatus(Long studyId, String enrollmentStatus);

    /**
     * Find enrollments by site and status
     */
    List<PatientEnrollmentEntity> findByStudySiteIdAndEnrollmentStatus(Long studySiteId, String enrollmentStatus);

    /**
     * Count enrollments by study
     */
    @Query("SELECT COUNT(e) FROM PatientEnrollmentEntity e WHERE e.studyId = :studyId")
    long countByStudyId(@Param("studyId") Long studyId);

    /**
     * Count enrollments by site
     */
    @Query("SELECT COUNT(e) FROM PatientEnrollmentEntity e WHERE e.studySiteId = :studySiteId")
    long countByStudySiteId(@Param("studySiteId") Long studySiteId);

    /**
     * Find enrollments by date range
     */
    @Query("SELECT e FROM PatientEnrollmentEntity e WHERE e.enrollmentDate >= :startDate AND e.enrollmentDate <= :endDate")
    List<PatientEnrollmentEntity> findByEnrollmentDateBetween(@Param("startDate") java.time.LocalDate startDate,
                                                               @Param("endDate") java.time.LocalDate endDate);
}