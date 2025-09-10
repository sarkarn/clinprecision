package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.StudyVersionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyVersionRepository extends JpaRepository<StudyVersionEntity, Long> {
    List<StudyVersionEntity> findByStudyId(Long studyId);
}
