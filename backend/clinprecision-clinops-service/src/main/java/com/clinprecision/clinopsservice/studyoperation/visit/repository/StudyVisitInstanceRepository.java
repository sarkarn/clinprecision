package com.clinprecision.clinopsservice.visit.repository;

import com.clinprecision.clinopsservice.visit.entity.StudyVisitInstanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for study_visit_instances table queries
 * Used for scheduled visits created from visit definitions
 */
@Repository
public interface StudyVisitInstanceRepository extends JpaRepository<StudyVisitInstanceEntity, Long> {

    /**
     * Find all visit instances for a specific subject/patient
     * Ordered by visit date descending (most recent first)
     */
    @Query("SELECT v FROM StudyVisitInstanceEntity v WHERE v.subjectId = :subjectId ORDER BY v.visitDate DESC")
    List<StudyVisitInstanceEntity> findBySubjectIdOrderByVisitDateDesc(@Param("subjectId") Long subjectId);

    /**
     * Find all visit instances for a specific study
     */
    List<StudyVisitInstanceEntity> findByStudyId(Long studyId);

    /**
     * Find visit instances by status
     */
    List<StudyVisitInstanceEntity> findByVisitStatus(String visitStatus);

    /**
     * Find visit instances for a subject by study
     */
    @Query("SELECT v FROM StudyVisitInstanceEntity v WHERE v.subjectId = :subjectId AND v.studyId = :studyId ORDER BY v.visitDate")
    List<StudyVisitInstanceEntity> findBySubjectIdAndStudyId(@Param("subjectId") Long subjectId, @Param("studyId") Long studyId);

    /**
     * Find visit instance by aggregate UUID (for event sourcing / unscheduled visits)
     */
    @Query("SELECT v FROM StudyVisitInstanceEntity v WHERE v.aggregateUuid = :aggregateUuid")
    java.util.Optional<StudyVisitInstanceEntity> findByAggregateUuid(@Param("aggregateUuid") String aggregateUuid);
}
