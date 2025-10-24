package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.repository;

import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.entity.ProtocolDeviationEntity;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationSeverity;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationStatus;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for Protocol Deviation Entity
 * Provides custom query methods for deviation tracking
 */
@Repository
public interface ProtocolDeviationRepository extends JpaRepository<ProtocolDeviationEntity, Long> {

    /**
     * Find all deviations for a specific patient
     */
    List<ProtocolDeviationEntity> findByPatientIdOrderByDeviationDateDesc(Long patientId);

    /**
     * Find all deviations for a specific study
     */
    List<ProtocolDeviationEntity> findByStudyIdOrderByDeviationDateDesc(Long studyId);

    /**
     * Find all deviations for a specific study site
     */
    List<ProtocolDeviationEntity> findByStudySiteIdOrderByDeviationDateDesc(Long studySiteId);

    /**
     * Find deviations by severity level
     */
    List<ProtocolDeviationEntity> findBySeverityOrderByDeviationDateDesc(DeviationSeverity severity);

    /**
     * Find deviations by status
     */
    List<ProtocolDeviationEntity> findByDeviationStatusOrderByDeviationDateDesc(DeviationStatus status);

    /**
     * Find deviations by type
     */
    List<ProtocolDeviationEntity> findByDeviationTypeOrderByDeviationDateDesc(DeviationType deviationType);

    /**
     * Find all deviations requiring regulatory reporting
     */
    List<ProtocolDeviationEntity> findByRequiresReportingTrueOrderByDeviationDateDesc();

    /**
     * Find deviations not yet reported to IRB (where reporting is required)
     */
    @Query("SELECT d FROM ProtocolDeviationEntity d WHERE d.requiresReporting = true AND d.reportedToIrb = false ORDER BY d.deviationDate DESC")
    List<ProtocolDeviationEntity> findUnreportedToIrb();

    /**
     * Find deviations not yet reported to Sponsor (where reporting is required)
     */
    @Query("SELECT d FROM ProtocolDeviationEntity d WHERE d.requiresReporting = true AND d.reportedToSponsor = false ORDER BY d.deviationDate DESC")
    List<ProtocolDeviationEntity> findUnreportedToSponsor();

    /**
     * Find active (open or under review) deviations for a patient
     */
    @Query("SELECT d FROM ProtocolDeviationEntity d WHERE d.patientId = :patientId AND d.deviationStatus IN ('OPEN', 'UNDER_REVIEW') ORDER BY d.deviationDate DESC")
    List<ProtocolDeviationEntity> findActiveDeviationsByPatient(@Param("patientId") Long patientId);

    /**
     * Find active deviations for a study
     */
    @Query("SELECT d FROM ProtocolDeviationEntity d WHERE d.studyId = :studyId AND d.deviationStatus IN ('OPEN', 'UNDER_REVIEW') ORDER BY d.deviationDate DESC")
    List<ProtocolDeviationEntity> findActiveDeviationsByStudy(@Param("studyId") Long studyId);

    /**
     * Find critical deviations for a study
     */
    @Query("SELECT d FROM ProtocolDeviationEntity d WHERE d.studyId = :studyId AND d.severity = 'CRITICAL' ORDER BY d.deviationDate DESC")
    List<ProtocolDeviationEntity> findCriticalDeviationsByStudy(@Param("studyId") Long studyId);

    /**
     * Find deviations by date range
     */
    @Query("SELECT d FROM ProtocolDeviationEntity d WHERE d.deviationDate BETWEEN :startDate AND :endDate ORDER BY d.deviationDate DESC")
    List<ProtocolDeviationEntity> findByDeviationDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Count deviations by study and severity
     */
    @Query("SELECT COUNT(d) FROM ProtocolDeviationEntity d WHERE d.studyId = :studyId AND d.severity = :severity")
    Long countByStudyIdAndSeverity(@Param("studyId") Long studyId, @Param("severity") DeviationSeverity severity);

    /**
     * Count deviations by study and type
     */
    @Query("SELECT COUNT(d) FROM ProtocolDeviationEntity d WHERE d.studyId = :studyId AND d.deviationType = :type")
    Long countByStudyIdAndType(@Param("studyId") Long studyId, @Param("type") DeviationType type);

    /**
     * Find deviations for a specific visit instance
     */
    List<ProtocolDeviationEntity> findByVisitInstanceIdOrderByDeviationDateDesc(Long visitInstanceId);

    /**
     * Check if patient has any critical deviations
     */
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM ProtocolDeviationEntity d WHERE d.patientId = :patientId AND d.severity = 'CRITICAL'")
    boolean hasCriticalDeviations(@Param("patientId") Long patientId);
}
