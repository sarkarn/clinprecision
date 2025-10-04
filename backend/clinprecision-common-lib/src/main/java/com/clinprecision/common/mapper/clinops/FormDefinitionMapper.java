package com.clinprecision.common.mapper.clinops;

import com.clinprecision.common.dto.clinops.FormDefinitionCreateRequestDto;
import com.clinprecision.common.dto.clinops.FormDefinitionDto;
import com.clinprecision.common.entity.clinops.FormDefinitionEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper class for converting between FormDefinition entities and DTOs
 * Handles the conversion logic for form definition data with updated schema
 */
@Component
public class FormDefinitionMapper {
    
    /**
     * Convert FormDefinitionEntity to FormDefinitionDto
     */
    public FormDefinitionDto toDto(FormDefinitionEntity entity) {
        if (entity == null) {
            return null;
        }
        
        FormDefinitionDto dto = new FormDefinitionDto();
        dto.setId(entity.getId());
        dto.setStudyId(entity.getStudyId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setFormType(entity.getFormType());
        dto.setVersion(entity.getVersion());
        dto.setIsLatestVersion(entity.getIsLatestVersion());
        dto.setParentVersionId(entity.getParentVersionId());
        dto.setVersionNotes(entity.getVersionNotes());
        dto.setIsLocked(entity.getIsLocked());
        dto.setStatus(entity.getStatus());
        
        // Updated: template_id is now BIGINT (Long)
        dto.setTemplateId(entity.getTemplateId());
        dto.setTemplateVersion(entity.getTemplateVersion());
        
        // New: tags field
        dto.setTags(entity.getTags());
        
        dto.setFields(entity.getFields());
        dto.setStructure(entity.getStructure());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // Add template information if available
        if (entity.getFormTemplate() != null) {
            dto.setTemplateName(entity.getFormTemplate().getName());
            dto.setTemplateCategory(entity.getFormTemplate().getCategory());
        }
        
        return dto;
    }
    
    /**
     * Convert FormDefinitionCreateRequestDto to FormDefinitionEntity
     */
    public FormDefinitionEntity toEntity(FormDefinitionCreateRequestDto dto) {
        if (dto == null) {
            return null;
        }
        
        FormDefinitionEntity entity = new FormDefinitionEntity();
        entity.setStudyId(dto.getStudyId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setFormType(dto.getFormType());
        entity.setVersion(dto.getVersion());
        entity.setIsLatestVersion(dto.getIsLatestVersion());
        entity.setParentVersionId(dto.getParentVersionId());
        entity.setVersionNotes(dto.getVersionNotes());
        entity.setIsLocked(dto.getIsLocked());
        entity.setStatus(dto.getStatus());
        
        // Updated: template_id is now BIGINT (Long)
        entity.setTemplateId(dto.getTemplateId());
        entity.setTemplateVersion(dto.getTemplateVersion());
        
        // New: tags field
        entity.setTags(dto.getTags());
        
        entity.setFields(dto.getFields());
        entity.setStructure(dto.getStructure());
        entity.setCreatedBy(dto.getCreatedBy());
        
        return entity;
    }
    
    /**
     * Update existing FormDefinitionEntity with data from FormDefinitionCreateRequestDto
     */
    public void updateEntityFromDto(FormDefinitionCreateRequestDto dto, FormDefinitionEntity entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setFormType(dto.getFormType());
        entity.setVersion(dto.getVersion());
        entity.setIsLatestVersion(dto.getIsLatestVersion());
        entity.setParentVersionId(dto.getParentVersionId());
        entity.setVersionNotes(dto.getVersionNotes());
        entity.setIsLocked(dto.getIsLocked());
        entity.setStatus(dto.getStatus());
        
        // Updated: template_id is now BIGINT (Long)
        entity.setTemplateId(dto.getTemplateId());
        entity.setTemplateVersion(dto.getTemplateVersion());
        
        // New: tags field
        entity.setTags(dto.getTags());
        
        entity.setFields(dto.getFields());
        entity.setStructure(dto.getStructure());
        // Note: studyId and createdBy are not updated in update operations
    }
}