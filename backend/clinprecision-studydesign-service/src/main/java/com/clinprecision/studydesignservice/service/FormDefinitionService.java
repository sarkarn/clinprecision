package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.entity.FormDefinitionEntity;
import com.clinprecision.studydesignservice.model.FormDefinition;
import com.clinprecision.studydesignservice.model.FormField;
import com.clinprecision.studydesignservice.model.FormFieldMetadata;
import com.clinprecision.studydesignservice.repository.FormDefinitionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import static java.util.stream.Collectors.toList;


import java.time.LocalDateTime;
import java.util.List;


@Service
public class FormDefinitionService {

    private final FormDefinitionRepository formDefinitionRepository;
    private ModelMapper modelMapper;

    public FormDefinitionService(FormDefinitionRepository formDefinitionRepository) {
        this.formDefinitionRepository = formDefinitionRepository;
        this.modelMapper = new ModelMapper();
    }

    public List<FormDefinition> getAllForms() {
        return
                formDefinitionRepository.findAll().stream()
                .map(FormDefinition::fromEntity)
                        .collect(toList());
    }

    public List<FormDefinition> getFormsByStudy(String studyId) {
        return formDefinitionRepository.findByStudyId(studyId).stream()
                .map(FormDefinition::fromEntity)
                .collect(toList());
    }

    public FormDefinition getFormById(String id) {
        return formDefinitionRepository.findById(id)
                .map(FormDefinition::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Form not found with id: " + id));
    }

    @Transactional
    public FormDefinition createForm(FormDefinition formDTO, String userId) {
        FormDefinitionEntity form = formDTO.toEntity();
        // Process quality control flags if needed
        ensureQualityControlFlags(formDTO.getFields());

        return FormDefinition.fromEntity(formDefinitionRepository.save(form));
    }

    @Transactional
    public FormDefinition updateForm(String id, FormDefinition formDTO, String userId) {
        FormDefinitionEntity form = formDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form not found with id: " + id));

        form.setName(formDTO.getName());
        form.setDescription(formDTO.getDescription());
        form.setFields(formDTO.getFields().stream().map(FormField::toEntity).collect(toList()));
        form.setUpdatedAt(LocalDateTime.now());

        // Process quality control flags if needed
        ensureQualityControlFlags(formDTO.getFields());

        return FormDefinition.fromEntity(formDefinitionRepository.save(form));
    }

    @Transactional
    public void deleteForm(String id) {
        FormDefinitionEntity form = formDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form not found with id: " + id));
        formDefinitionRepository.delete(form);
    }

    @Transactional
    public FormDefinition approveForm(String id, String userId) {
        FormDefinitionEntity form = formDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form not found with id: " + id));
        form.setStatus(FormDefinitionEntity.FormStatus.APPROVED);
        form.setUpdatedAt(LocalDateTime.now());
        return FormDefinition.fromEntity(formDefinitionRepository.save(form));
    }

    /**
     * Ensures all fields have quality control flags properly set
     */
    private void ensureQualityControlFlags(List<FormField> fields) {
        if (fields == null) return;

        for (FormField field : fields) {
            if (field.getMetadata() == null) {
                field.setMetadata(new FormFieldMetadata());
            }

            // Initialize QC flags if they're not set
            FormFieldMetadata metadata = field.getMetadata();

            // These flags should be explicitly set to false if not provided
            // This mirrors the logic in your CRFBuilder React component
            if (metadata.isSdvRequired()) {
                // Flag is already true, do nothing
            } else {
                metadata.setSdvRequired(false);
            }

            if (metadata.isMedicalReview()) {
                // Flag is already true, do nothing
            } else {
                metadata.setMedicalReview(false);
            }

            if (metadata.isDataReview()) {
                // Flag is already true, do nothing
            } else {
                metadata.setDataReview(false);
            }

            if (metadata.isCriticalDataPoint()) {
                // Flag is already true, do nothing
            } else {
                metadata.setCriticalDataPoint(false);
            }
        }
    }

}