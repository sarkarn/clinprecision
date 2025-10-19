package com.clinprecision.clinopsservice.studyoperation.visit.repository;

import com.clinprecision.clinopsservice.studyoperation.visit.entity.UnscheduledVisitConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for managing unscheduled visit configurations.
 */
@Repository
public interface UnscheduledVisitConfigRepository extends JpaRepository<UnscheduledVisitConfigEntity, Long> {

    /**
     * Find all enabled unscheduled visit configurations.
     * Used during study build to create visit definitions.
     *
     * @return List of enabled configurations ordered by visit_order
     */
    List<UnscheduledVisitConfigEntity> findByIsEnabledTrueOrderByVisitOrderAsc();

    /**
     * Find a specific configuration by visit code.
     *
     * @param visitCode Unique visit code (e.g., EARLY_TERM)
     * @return Optional containing the configuration if found
     */
    Optional<UnscheduledVisitConfigEntity> findByVisitCode(String visitCode);

    /**
     * Check if a visit code already exists (for validation).
     *
     * @param visitCode Visit code to check
     * @return True if exists, false otherwise
     */
    boolean existsByVisitCode(String visitCode);

    /**
     * Find all configurations (enabled and disabled) ordered by visit_order.
     *
     * @return List of all configurations
     */
    List<UnscheduledVisitConfigEntity> findAllByOrderByVisitOrderAsc();
}
