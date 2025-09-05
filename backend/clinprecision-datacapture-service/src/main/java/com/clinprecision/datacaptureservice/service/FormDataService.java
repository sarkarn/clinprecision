package com.clinprecision.datacaptureservice.service;

// src/main/java/com/clinprecision/edc/service/FormDataService.java
package com.clinprecision.edc.service;

import com.clinprecision.edc.domain.FormData;
import com.clinprecision.edc.domain.FormDefinition;
import com.clinprecision.edc.domain.FormField;
import com.clinprecision.edc.dto.FormDataDTO;
import com.clinprecision.edc.repository.FormDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FormDataService {

    private final FormDataRepository formDataRepository;
    private final FormDefinitionService formDefinitionService;
    private final FieldVerificationService fieldVerificationService;

    public List<FormData> getFormDataBySubject(String subjectId) {
        return formDataRepository.findBySubjectId(subjectId);
    }

    public List<FormData> getFormDataByVisit(String visitId) {
        return formDataRepository.findBySubjectVisitId(visitId);
    }

    public FormData getFormDataById(String id) {
        return formDataRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form data not found with id: " + id));
    }

    @Transactional
    public FormData createOrUpdateFormData(FormDataDTO formDataDTO, String userId) {
        // Check if this is an update to existing form data
        FormData formData = formDataRepository
                .findBySubjectVisitIdAndFormDefinitionId(
                        formDataDTO.getSubjectVisitId(),
                        formDataDTO.getFormDefinitionId()
                )
                .orElse(new FormData());

        // If new form data
        if (formData.getId() == null) {
            formData.setSubjectId(formDataDTO.getSubjectId());
            formData.setSubjectVisitId(formDataDTO.getSubjectVisitId());
            formData.setFormDefinitionId(formDataDTO.getFormDefinitionId());

            // Get form definition to set the version
            FormDefinition formDef = formDefinitionService.getFormById(formDataDTO.getFormDefinitionId());
            formData.setFormVersion(formDef.getVersion());
            formData.setCreatedBy(userId);

            // Create verification records for fields requiring verification
            setupVerificationRecords(formDef, formData.getId());
        }

        // Update form data and status
        formData.setData(formDataDTO.getData());
        formData.setStatus(determineFormStatus(formDataDTO.getData(), formData.getFormDefinitionId()));
        formData.setUpdatedBy(userId);
        formData.setUpdatedAt(LocalDateTime.now());

        return formDataRepository.save(formData);
    }

    @Transactional
    public FormData signFormData(String id, String userId) {
        FormData formData = getFormDataById(id);

        // Can only sign a complete form
        if (formData.getStatus() != FormData.FormDataStatus.COMPLETE) {
            throw new IllegalStateException("Cannot sign an incomplete form");
        }

        formData.setStatus(FormData.FormDataStatus.SIGNED);
        formData.setSignedBy(userId);
        formData.setSignedAt(LocalDateTime.now());
        formData.setUpdatedAt(LocalDateTime.now());

        return formDataRepository.save(formData);
    }

    @Transactional
    public FormData lockFormData(String id, String userId) {
        FormData formData = getFormDataById(id);

        // Can only lock a signed form
        if (formData.getStatus() != FormData.FormDataStatus.SIGNED) {
            throw new IllegalStateException("Cannot lock an unsigned form");
        }

        formData.setStatus(FormData.FormDataStatus.LOCKED);
        formData.setUpdatedBy(userId);
        formData.setUpdatedAt(LocalDateTime.now());

        return formDataRepository.save(formData);
    }

    /**
     * Determine form status based on data completeness
     */
    private FormData.FormDataStatus determineFormStatus(Map<String, Object> data, String formDefinitionId) {
        // If no data, form is not started
        if (data == null || data.isEmpty()) {
            return FormData.FormDataStatus.NOT_STARTED;
        }

        // Get form definition to check required fields
        FormDefinition formDef = formDefinitionService.getFormById(formDefinitionId);
        boolean hasAllRequiredFields = true;

        // Check if all required fields have values
        for (FormField field : formDef.getFields()) {
            if (field.getMetadata() != null && field.getMetadata().isRequired()) {
                String fieldId = field.getMetadata().getVariableName();
                if (fieldId != null && !data.containsKey(fieldId) || data.get(fieldId) == null) {
                    hasAllRequiredFields = false;
                    break;
                }
            }
        }

        return hasAllRequiredFields ?
                FormData.FormDataStatus.COMPLETE :
                FormData.FormDataStatus.INCOMPLETE;
    }

    /**
     * Set up verification records for fields requiring verification
     */
    private void setupVerificationRecords(FormDefinition formDef, String formDataId) {
        for (FormField field : formDef.getFields()) {
            FormField.FieldMetadata metadata = field.getMetadata();
            if (metadata != null) {
                String fieldId = metadata.getVariableName();

                // Check each verification type
                if (metadata.isSdvRequired()) {
                    fieldVerificationService.createVerificationRecord(
                            formDataId,
                            fieldId,
                            "sdv"
                    );
                }

                if (metadata.isMedicalReview()) {
                    fieldVerificationService.createVerificationRecord(
                            formDataId,
                            fieldId,
                            "medical_review"
                    );
                }

                if (metadata.isDataReview()) {
                    fieldVerificationService.createVerificationRecord(
                            formDataId,
                            fieldId,
                            "data_review"
                    );
                }
            }
        }
    }
}