package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.entity.FormDataEntity;
import com.clinprecision.studydesignservice.entity.FormDefinitionEntity;
import com.clinprecision.studydesignservice.model.FormData;
import com.clinprecision.studydesignservice.repository.FormDataRepository;
import com.clinprecision.studydesignservice.repository.FormDefinitionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service responsible for managing form data entries with version awareness.
 * This service ensures that form data is always properly linked to the 
 * correct version of the form definition.
 */
@Service
public class FormDataService {

    private final FormDataRepository formDataRepository;
    private final FormDefinitionRepository formDefinitionRepository;

    public FormDataService(
            FormDataRepository formDataRepository,
            FormDefinitionRepository formDefinitionRepository) {
        this.formDataRepository = formDataRepository;
        this.formDefinitionRepository = formDefinitionRepository;
    }

    /**
     * Creates a new form data entry using the latest version of the form definition.
     *
     * @param formData The form data to create
     * @param userId The ID of the user creating the entry
     * @return The created form data
     */
    @Transactional
    public FormData createFormData(FormData formData, Long userId) {
        // Get the latest version of the form definition
        FormDefinitionEntity formDefinition = formDefinitionRepository
                .findById(formData.getFormDefinitionId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Form definition not found: " + formData.getFormDefinitionId()));
        
        // Create and configure entity
        FormDataEntity entity = new FormDataEntity();
        entity.setId(UUID.randomUUID().toString());
        entity.setSubjectId(formData.getSubjectId());
        entity.setSubjectVisitId(formData.getSubjectVisitId());
        entity.setFormDefinitionId(formData.getFormDefinitionId());
        
        // Set the specific form version used
        entity.setFormVersion(formDefinition.getVersion());
        entity.setFormVersionUsed("Form Version: " + formDefinition.getVersion() + 
                " - ID: " + formDefinition.getId());
        entity.setUsesLatestFormVersion(formDefinition.isLatestVersion());
        
        entity.setStatus(FormDataEntity.FormDataStatus.valueOf(formData.getStatus().name()));
        entity.setData(formData.getData());
        entity.setCreatedBy(userId);
        entity.setUpdatedBy(userId);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        entity.setEntryReason(formData.getEntryReason());
        
        // Save entity
        FormDataEntity savedEntity = formDataRepository.save(entity);
        
        // Convert to DTO and return
        return convertToDto(savedEntity);
    }

    /**
     * Updates an existing form data entry. 
     * If the form definition has been updated since this data was created,
     * the system will maintain the link to the original form version.
     *
     * @param id The ID of the form data to update
     * @param formData The updated form data
     * @param userId The ID of the user updating the entry
     * @return The updated form data
     */
    @Transactional
    public FormData updateFormData(String id, FormData formData, Long userId) {
        // Get existing entity
        FormDataEntity entity = formDataRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form data not found: " + id));
        
        // Check if current form definition is still the latest version
        FormDefinitionEntity currentFormDef = formDefinitionRepository
                .findById(entity.getFormDefinitionId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Form definition not found: " + entity.getFormDefinitionId()));
        
        // Set flag if the form definition has been updated
        entity.setUsesLatestFormVersion(currentFormDef.isLatestVersion());
        
        // Update properties
        entity.setData(formData.getData());
        entity.setStatus(FormDataEntity.FormDataStatus.valueOf(formData.getStatus().name()));
        entity.setUpdatedBy(userId);
        entity.setUpdatedAt(LocalDateTime.now());
        entity.setEntryReason(formData.getEntryReason());
        
        // Special handling for signed status
        if (FormDataEntity.FormDataStatus.SIGNED.equals(entity.getStatus())) {
            entity.setSignedBy(userId);
            entity.setSignedAt(LocalDateTime.now());
        }
        
        // Save entity
        FormDataEntity savedEntity = formDataRepository.save(entity);
        
        // Convert to DTO and return
        return convertToDto(savedEntity);
    }

    /**
     * Gets form data by ID.
     *
     * @param id The ID of the form data to get
     * @return The form data
     */
    public FormData getFormDataById(String id) {
        FormDataEntity entity = formDataRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Form data not found: " + id));
        
        return convertToDto(entity);
    }

    /**
     * Gets all form data for a subject visit.
     *
     * @param subjectVisitId The ID of the subject visit
     * @return List of form data entries
     */
    public List<FormData> getFormDataBySubjectVisit(String subjectVisitId) {
        List<FormDataEntity> entities = formDataRepository.findBySubjectVisitId(subjectVisitId);
        
        return entities.stream()
                .map(this::convertToDto)
                .toList();
    }

    /**
     * Upgrades form data to use the latest form definition version.
     * This should be called when a form is updated and existing data
     * needs to be upgraded to the new version.
     *
     * @param formDataId The ID of the form data to upgrade
     * @param userId The ID of the user performing the upgrade
     * @return The upgraded form data
     */
    @Transactional
    public FormData upgradeToLatestFormVersion(String formDataId, Long userId) {
        // Get existing form data
        FormDataEntity entity = formDataRepository.findById(formDataId)
                .orElseThrow(() -> new EntityNotFoundException("Form data not found: " + formDataId));
        
        // Find the latest version of the form definition
        FormDefinitionEntity latestFormDef = formDefinitionRepository
                .findLatestVersionByFormId(entity.getFormDefinitionId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Latest form definition not found for: " + entity.getFormDefinitionId()));
        
        // Create a copy of the existing data
        FormDataEntity newEntity = new FormDataEntity();
        newEntity.setId(UUID.randomUUID().toString());
        newEntity.setSubjectId(entity.getSubjectId());
        newEntity.setSubjectVisitId(entity.getSubjectVisitId());
        newEntity.setFormDefinitionId(latestFormDef.getId());
        newEntity.setFormVersion(latestFormDef.getVersion());
        newEntity.setFormVersionUsed("Form Version: " + latestFormDef.getVersion() + 
                " - ID: " + latestFormDef.getId());
        newEntity.setUsesLatestFormVersion(true);
        
        // Migrate data fields to match the new form structure
        // This might require field mapping if the form structure has changed
        Map<String, Object> migratedData = migrateDataToNewFormVersion(
                entity.getData(), entity.getFormDefinitionId(), latestFormDef.getId());
        newEntity.setData(migratedData);
        
        newEntity.setStatus(entity.getStatus());
        newEntity.setCreatedBy(userId);
        newEntity.setUpdatedBy(userId);
        newEntity.setCreatedAt(LocalDateTime.now());
        newEntity.setUpdatedAt(LocalDateTime.now());
        newEntity.setEntryReason("Upgraded from form version " + entity.getFormVersion() + 
                " to " + latestFormDef.getVersion());
        
        // Save new entity
        FormDataEntity savedEntity = formDataRepository.save(newEntity);
        
        // Mark old entity as superseded
        entity.setStatus(FormDataEntity.FormDataStatus.SUPERSEDED);
        entity.setUpdatedAt(LocalDateTime.now());
        entity.setUpdatedBy(userId);
        formDataRepository.save(entity);
        
        // Convert to DTO and return
        return convertToDto(savedEntity);
    }

    /**
     * Migrates data from an old form version to a new form version.
     * This handles any structural changes between versions.
     *
     * @param sourceData The original data
     * @param oldFormId The ID of the old form version
     * @param newFormId The ID of the new form version
     * @return The migrated data
     */
    private Map<String, Object> migrateDataToNewFormVersion(
            Object sourceData, String oldFormId, String newFormId) {
        // Get old and new form definitions to compare structures
        FormDefinitionEntity oldForm = formDefinitionRepository.findById(oldFormId)
                .orElseThrow(() -> new EntityNotFoundException("Form definition not found: " + oldFormId));
        
        FormDefinitionEntity newForm = formDefinitionRepository.findById(newFormId)
                .orElseThrow(() -> new EntityNotFoundException("Form definition not found: " + newFormId));
        
        // Implementation would depend on how form definitions and data are structured
        // This is a simplified example
        
        // In real implementation, you would:
        // 1. Compare field definitions between old and new forms
        // 2. Map fields from old form to new form based on field IDs or names
        // 3. Handle added/removed fields appropriately
        // 4. Transform data to match the new structure
        
        // For simplicity, we're just returning the source data
        // In a real implementation, this would be more complex
        return (Map<String, Object>) sourceData;
    }

    /**
     * Converts a FormDataEntity to a FormData DTO.
     *
     * @param entity The entity to convert
     * @return The converted DTO
     */
    private FormData convertToDto(FormDataEntity entity) {
        FormData dto = new FormData();
        dto.setId(entity.getId());
        dto.setSubjectId(entity.getSubjectId());
        dto.setSubjectVisitId(entity.getSubjectVisitId());
        dto.setFormDefinitionId(entity.getFormDefinitionId());
        dto.setFormVersion(entity.getFormVersion());
        dto.setStatus(FormData.FormDataStatus.valueOf(entity.getStatus().name()));
        dto.setData(entity.getData());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setUpdatedBy(entity.getUpdatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setSignedBy(entity.getSignedBy());
        dto.setSignedAt(entity.getSignedAt());
        dto.setUsesLatestFormVersion(entity.isUsesLatestFormVersion());
        dto.setEntryReason(entity.getEntryReason());
        dto.setFormVersionUsed(entity.getFormVersionUsed());
        
        return dto;
    }
}
