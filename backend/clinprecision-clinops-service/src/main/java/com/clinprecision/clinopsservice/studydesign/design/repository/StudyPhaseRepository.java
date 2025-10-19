package com.clinprecision.clinopsservice.studydesign.design.repository;



import com.clinprecision.clinopsservice.studydesign.design.entity.StudyPhaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for StudyPhaseEntity
 * Provides database access methods for study phase lookup operations
 */
@Repository
public interface StudyPhaseRepository extends JpaRepository<StudyPhaseEntity, Long> {
    
    /**
     * Find study phase by code (case insensitive)
     */
    @Query("SELECT sp FROM StudyPhaseEntity sp WHERE UPPER(sp.code) = UPPER(:code)")
    Optional<StudyPhaseEntity> findByCodeIgnoreCase(@Param("code") String code);
    
    /**
     * Find all active study phases ordered by display order
     */
    @Query("SELECT sp FROM StudyPhaseEntity sp WHERE sp.isActive = true ORDER BY sp.displayOrder")
    List<StudyPhaseEntity> findAllActiveOrderByDisplayOrder();
    
    /**
     * Find study phases by category
     */
    @Query("SELECT sp FROM StudyPhaseEntity sp WHERE sp.isActive = true AND sp.phaseCategory = :category ORDER BY sp.displayOrder")
    List<StudyPhaseEntity> findByCategoryOrderByDisplayOrder(@Param("category") StudyPhaseEntity.PhaseCategory category);
    
    /**
     * Find phases that require IND (Investigational New Drug)
     */
    @Query("SELECT sp FROM StudyPhaseEntity sp WHERE sp.isActive = true AND sp.requiresInd = true ORDER BY sp.displayOrder")
    List<StudyPhaseEntity> findRequiresInd();
    
    /**
     * Find phases that require IDE (Investigational Device Exemption)
     */
    @Query("SELECT sp FROM StudyPhaseEntity sp WHERE sp.isActive = true AND sp.requiresIde = true ORDER BY sp.displayOrder")
    List<StudyPhaseEntity> findRequiresIde();
    
    /**
     * Find study phase by code (exact match)
     */
    Optional<StudyPhaseEntity> findByCode(String code);
    
    /**
     * Check if phase code exists (case insensitive) excluding a specific ID
     */
    @Query("SELECT COUNT(sp) > 0 FROM StudyPhaseEntity sp WHERE UPPER(sp.code) = UPPER(:code) AND sp.id != :excludeId")
    boolean existsByCodeIgnoreCaseExcludingId(@Param("code") String code, @Param("excludeId") Long excludeId);
    
    /**
     * Find phases by typical patient count range
     */
    @Query("SELECT sp FROM StudyPhaseEntity sp WHERE sp.isActive = true AND " +
           "sp.typicalPatientCountMin <= :patientCount AND " +
           "sp.typicalPatientCountMax >= :patientCount " +
           "ORDER BY sp.displayOrder")
    List<StudyPhaseEntity> findByTypicalPatientCount(@Param("patientCount") Integer patientCount);
    
    /**
     * Find early phase studies (Phase 0, I, I/II)
     */
    @Query("SELECT sp FROM StudyPhaseEntity sp WHERE sp.isActive = true AND sp.phaseCategory = 'EARLY_PHASE' ORDER BY sp.displayOrder")
    List<StudyPhaseEntity> findEarlyPhases();
    
    /**
     * Find efficacy phases (Phase II, IIa, IIb, II/III)
     */
    @Query("SELECT sp FROM StudyPhaseEntity sp WHERE sp.isActive = true AND sp.phaseCategory = 'EFFICACY' ORDER BY sp.displayOrder")
    List<StudyPhaseEntity> findEfficacyPhases();
    
    /**
     * Find registration phases (Phase III, IIIa, IIIb)
     */
    @Query("SELECT sp FROM StudyPhaseEntity sp WHERE sp.isActive = true AND sp.phaseCategory = 'REGISTRATION' ORDER BY sp.displayOrder")
    List<StudyPhaseEntity> findRegistrationPhases();
}



