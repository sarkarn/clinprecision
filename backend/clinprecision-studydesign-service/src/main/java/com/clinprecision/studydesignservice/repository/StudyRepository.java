package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.StudyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyRepository extends JpaRepository<StudyEntity, String> {
}
