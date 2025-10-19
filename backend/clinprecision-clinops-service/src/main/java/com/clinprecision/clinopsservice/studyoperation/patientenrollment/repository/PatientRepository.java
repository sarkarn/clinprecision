package com.clinprecision.clinopsservice.studyoperation.patientenrollment.repository;

import com.clinprecision.clinopsservice.studyoperation.patientenrollment.entity.PatientEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

/**
 * Repository interface for PatientEntity
 * Follows established ClinPrecision patterns
 */
@Repository
public interface PatientRepository extends JpaRepository<PatientEntity, Long> {

    /**
     * Find patient by aggregate UUID (used by Axon projection handlers)
     */
    Optional<PatientEntity> findByAggregateUuid(String aggregateUuid);

    /**
     * Find patient by patient number (human-readable ID)
     */
    Optional<PatientEntity> findByPatientNumber(String patientNumber);

    /**
     * Find patient by email
     */
    Optional<PatientEntity> findByEmail(String email);

    /**
     * Check if patient number exists (for uniqueness validation)
     */
    boolean existsByPatientNumber(String patientNumber);

    /**
     * Check if email exists (for uniqueness validation)
     */
    boolean existsByEmail(String email);

    /**
     * Find patients by status
     */
    List<PatientEntity> findByStatus(String status);

    /**
     * Find patients created by specific user
     */
    List<PatientEntity> findByCreatedBy(String createdBy);

    /**
     * Search patients by name (case-insensitive)
     */
    @Query("SELECT p FROM PatientEntity p WHERE " +
           "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.middleName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<PatientEntity> findByNameContaining(@Param("searchTerm") String searchTerm);

    /**
     * Find patients by date range
     */
    @Query("SELECT p FROM PatientEntity p WHERE p.createdAt >= :startDate AND p.createdAt <= :endDate")
    List<PatientEntity> findByCreatedAtBetween(@Param("startDate") java.time.LocalDateTime startDate,
                                               @Param("endDate") java.time.LocalDateTime endDate);
}



