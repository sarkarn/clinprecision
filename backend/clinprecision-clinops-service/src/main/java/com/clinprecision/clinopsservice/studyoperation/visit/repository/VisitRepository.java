package com.clinprecision.clinopsservice.studyoperation.visit.repository;

import com.clinprecision.clinopsservice.studyoperation.visit.entity.VisitEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for Visit read model queries
 */
@Repository
public interface VisitRepository extends JpaRepository<VisitEntity, UUID> {

    /**
     * Find all visits for a specific patient
     * Ordered by visit date descending (most recent first)
     */
    @Query("SELECT v FROM VisitEntity v WHERE v.patientId = :patientId ORDER BY v.visitDate DESC")
    List<VisitEntity> findByPatientIdOrderByVisitDateDesc(@Param("patientId") Long patientId);

    /**
     * Find all visits for a specific study
     */
    List<VisitEntity> findByStudyId(Long studyId);

    /**
     * Find visits by type (e.g., all SCREENING visits)
     */
    List<VisitEntity> findByVisitType(String visitType);

    /**
     * Find visits by status (e.g., all SCHEDULED visits)
     */
    List<VisitEntity> findByStatus(String status);

    /**
     * Find visits for a patient by visit type
     */
    @Query("SELECT v FROM VisitEntity v WHERE v.patientId = :patientId AND v.visitType = :visitType ORDER BY v.visitDate DESC")
    List<VisitEntity> findByPatientIdAndVisitType(@Param("patientId") Long patientId, @Param("visitType") String visitType);
}
