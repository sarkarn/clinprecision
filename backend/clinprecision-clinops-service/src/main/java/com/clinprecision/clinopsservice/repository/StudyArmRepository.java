package com.clinprecision.clinopsservice.repository;



import com.clinprecision.common.entity.clinops.StudyArmEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for StudyArmEntity
 * Provides CRUD operations and custom queries for study arms
 */
@Repository
public interface StudyArmRepository extends JpaRepository<StudyArmEntity, Long> {
    
    /**
     * Find all study arms for a specific study, ordered by sequence
     */
    List<StudyArmEntity> findByStudyIdOrderBySequenceAsc(Long studyId);
    
    /**
     * Find a study arm by ID and study ID (for security)
     */
    Optional<StudyArmEntity> findByIdAndStudyId(Long id, Long studyId);
    
    /**
     * Count study arms for a specific study
     */
    long countByStudyId(Long studyId);
    
    /**
     * Check if a study arm with the given sequence exists for a study
     */
    boolean existsByStudyIdAndSequence(Long studyId, Integer sequence);
    
    /**
     * Find study arms by type for a specific study
     */
    List<StudyArmEntity> findByStudyIdAndTypeOrderBySequenceAsc(Long studyId, String type);
    
    /**
     * Get the maximum sequence number for a study (for auto-incrementing)
     */
    @Query("SELECT COALESCE(MAX(sa.sequence), 0) FROM StudyArmEntity sa WHERE sa.studyId = :studyId")
    Integer findMaxSequenceByStudyId(@Param("studyId") Long studyId);
    
    /**
     * Find all study arms with planned subjects greater than specified amount
     */
    @Query("SELECT sa FROM StudyArmEntity sa WHERE sa.studyId = :studyId AND sa.plannedSubjects > :minSubjects ORDER BY sa.sequence")
    List<StudyArmEntity> findByStudyIdAndPlannedSubjectsGreaterThan(@Param("studyId") Long studyId, 
                                                                    @Param("minSubjects") Integer minSubjects);
    
    /**
     * Get total planned subjects across all arms for a study
     */
    @Query("SELECT COALESCE(SUM(sa.plannedSubjects), 0) FROM StudyArmEntity sa WHERE sa.studyId = :studyId")
    Long getTotalPlannedSubjectsByStudyId(@Param("studyId") Long studyId);
    
    /**
     * Delete all study arms for a specific study
     */
    void deleteByStudyId(Long studyId);
    
    /**
     * Find study arms by name pattern (case-insensitive)
     */
    @Query("SELECT sa FROM StudyArmEntity sa WHERE sa.studyId = :studyId AND LOWER(sa.name) LIKE LOWER(CONCAT('%', :namePattern, '%')) ORDER BY sa.sequence")
    List<StudyArmEntity> findByStudyIdAndNameContainingIgnoreCase(@Param("studyId") Long studyId, 
                                                                  @Param("namePattern") String namePattern);
    
    /**
     * Check if any study arms exist for a study
     */
    boolean existsByStudyId(Long studyId);
    
    /**
     * Find study arms that need sequence reordering (gaps in sequence)
     */
    @Query("SELECT sa FROM StudyArmEntity sa WHERE sa.studyId = :studyId ORDER BY sa.sequence")
    List<StudyArmEntity> findByStudyIdForSequenceReordering(@Param("studyId") Long studyId);
}
