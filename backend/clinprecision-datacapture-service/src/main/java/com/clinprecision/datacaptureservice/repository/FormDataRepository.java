package com.clinprecision.datacaptureservice.repository;


import com.clinprecision.common.entity.datacapture.FormDataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormDataRepository extends JpaRepository<FormDataEntity, String> {

    List<FormDataEntity> findBySubjectId(String subjectId);

    List<FormDataEntity> findBySubjectVisitId(String subjectVisitId);

    Optional<FormDataEntity> findBySubjectVisitIdAndFormDefinitionId(
            String subjectVisitId,
            String formDefinitionId
    );
}