package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.entity.FormDefinitionEntity;
import com.clinprecision.studydesignservice.exception.EntityLockedException;
import com.clinprecision.studydesignservice.model.FormDefinition;
import com.clinprecision.studydesignservice.model.FormField;
import com.clinprecision.studydesignservice.model.FormFieldMetadata;
import com.clinprecision.studydesignservice.repository.FormDefinitionRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import static java.util.stream.Collectors.toList;


import java.time.LocalDateTime;
import java.util.List;


@Service
public class FormDefinitionService {

    private final FormDefinitionRepository formDefinitionRepository;
    private final LockingService lockingService;
    private ModelMapper modelMapper;

    public FormDefinitionService(
            FormDefinitionRepository formDefinitionRepository,
            LockingService lockingService) {
        this.formDefinitionRepository = formDefinitionRepository;
        this.lockingService = lockingService;
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
        // Validate fields and enforce the one-to-one relationship
        validateFormFields(formDTO.getFields());
        // Process quality control flags if needed
        ensureQualityControlFlags(formDTO.getFields());

        return FormDefinition.fromEntity(formDefinitionRepository.save(form));
    }

    @Transactional
    public FormDefinition updateForm(String id, FormDefinition formDTO, String userId) {
        // Check if form is locked
        lockingService.ensureFormNotLocked(id);
        
        // Also check if parent study is locked
        lockingService.ensureStudyNotLocked(formDTO.getStudyId());
        
        FormDefinitionEntity form = formDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form not found with id: " + id));

        form.setName(formDTO.getName());
        form.setDescription(formDTO.getDescription());
        form.setFields(formDTO.getFields().stream().map(FormField::toEntity).collect(toList()));
        form.setUpdatedAt(LocalDateTime.now());

        // Validate fields and enforce the one-to-one relationship
        validateFormFields(formDTO.getFields());
        // Process quality control flags if needed
        ensureQualityControlFlags(formDTO.getFields());

        return FormDefinition.fromEntity(formDefinitionRepository.save(form));
    }

    @Transactional
    public void deleteForm(String id) {
        FormDefinitionEntity form = formDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form not found with id: " + id));
        
        // Check if form is locked
        lockingService.ensureFormNotLocked(id);
        
        // Also check if parent study is locked
        lockingService.ensureStudyNotLocked(form.getStudyId());
        
        formDefinitionRepository.delete(form);
    }

    @Transactional
    public FormDefinition approveForm(String id, String userId) {
        FormDefinitionEntity form = formDefinitionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form not found with id: " + id));
        
        // Check if form is locked
        lockingService.ensureFormNotLocked(id);
        
        // Also check if parent study is locked
        lockingService.ensureStudyNotLocked(form.getStudyId());
        
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
    
    /**
     * Validates that each form field has exactly one metadata object (one-to-one relationship)
     */
    private void validateFormFields(List<FormField> fields) {
        if (fields == null) return;

        for (FormField field : fields) {
            // Ensure each field has exactly one metadata object
            if (field.getMetadata() == null) {
                throw new ValidationException("Each form field must have exactly one metadata object. Field: " + field.getLabel());
            }
            
            // Additional field-specific validations can be added here
            if (field.getType().equals("select") || field.getType().equals("radio") || field.getType().equals("checkbox")) {
                FormFieldMetadata metadata = field.getMetadata();
                if (metadata.getOptions() == null || metadata.getOptions().isEmpty()) {
                    throw new ValidationException("Fields of type " + field.getType() + " must have options defined. Field: " + field.getLabel());
                }
            }
        }
    }
}