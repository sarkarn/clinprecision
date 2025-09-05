package com.clinprecision.studydesignservice.repository;


import com.clinprecision.studydesignservice.entity.FormDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormDefinitionRepository extends JpaRepository<FormDefinitionEntity, String> {
    List<FormDefinitionEntity> findByStudyId(String studyId);
    List<FormDefinitionEntity> findByTemplateId(String templateId);
}