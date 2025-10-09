package com.clinprecision.clinopsservice.patientenrollment.repository;

import com.clinprecision.common.entity.SiteStudyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SiteStudyRepository extends JpaRepository<SiteStudyEntity, Long> {
    Optional<SiteStudyEntity> findByIdAndStudyId(Long id, Long studyId);
}



