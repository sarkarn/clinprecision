package com.clinprecision.datacaptureservice.repository;

import com.clinprecision.edc.domain.FormData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormDataRepository extends JpaRepository<FormData, String> {

    List<FormData> findBySubjectId(String subjectId);

    List<FormData> findBySubjectVisitId(String subjectVisitId);

    Optional<FormData> findBySubjectVisitIdAndFormDefinitionId(
            String subjectVisitId,
            String formDefinitionId
    );
}