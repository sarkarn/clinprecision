package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.StudyArmEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyArmRepository extends JpaRepository<StudyArmEntity, Long> {
    List<StudyArmEntity> findByStudyId(Long studyId);
}
