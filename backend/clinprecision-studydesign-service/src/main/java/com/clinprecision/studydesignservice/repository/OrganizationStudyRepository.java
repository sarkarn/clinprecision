package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.OrganizationStudyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganizationStudyRepository extends JpaRepository<OrganizationStudyEntity, Long> {
    List<OrganizationStudyEntity> findByStudyId(Long studyId);
    List<OrganizationStudyEntity> findByOrganizationId(Long organizationId);
}
