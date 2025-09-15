package com.clinprecision.studydesignservice.mapper;

import com.clinprecision.studydesignservice.dto.FormTemplateCreateRequestDto;
import com.clinprecision.studydesignservice.dto.FormTemplateDto;
import com.clinprecision.studydesignservice.entity.FormTemplateEntity;
import org.springframework.stereotype.Component;

/**
 * Mapper class for converting between FormTemplate entities and DTOs
 * Handles the conversion logic for form template data
 */
@Component
public class FormTemplateMapper {
    
    /**
     * Convert FormTemplateEntity to FormTemplateDto
     */
    public FormTemplateDto toDto(FormTemplateEntity entity) {
        if (entity == null) {
            return null;
        }
        
        FormTemplateDto dto = new FormTemplateDto();
        dto.setId(entity.getId());
        dto.setTemplateId(entity.getTemplateId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setCategory(entity.getCategory());
        dto.setVersion(entity.getVersion());
        dto.setIsLatestVersion(entity.getIsLatestVersion());
        dto.setStatus(entity.getStatus());
        dto.setFields(entity.getFields());
        dto.setStructure(entity.getStructure());
        dto.setTags(entity.getTags());
        dto.setUsageCount(entity.getUsageCount());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        return dto;
    }
    
    /**
     * Convert FormTemplateCreateRequestDto to FormTemplateEntity
     */
    public FormTemplateEntity toEntity(FormTemplateCreateRequestDto dto) {
        if (dto == null) {
            return null;
        }
        
        FormTemplateEntity entity = new FormTemplateEntity();
        entity.setTemplateId(dto.getTemplateId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setCategory(dto.getCategory());
        entity.setVersion(dto.getVersion());
        entity.setIsLatestVersion(dto.getIsLatestVersion());
        entity.setStatus(dto.getStatus());
        entity.setFields(dto.getFields());
        entity.setStructure(dto.getStructure());
        entity.setTags(dto.getTags());
        entity.setCreatedBy(dto.getCreatedBy());
        
        return entity;
    }
    
    /**
     * Update existing FormTemplateEntity with data from FormTemplateCreateRequestDto
     */
    public void updateEntityFromDto(FormTemplateCreateRequestDto dto, FormTemplateEntity entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        entity.setTemplateId(dto.getTemplateId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setCategory(dto.getCategory());
        entity.setVersion(dto.getVersion());
        entity.setIsLatestVersion(dto.getIsLatestVersion());
        entity.setStatus(dto.getStatus());
        entity.setFields(dto.getFields());
        entity.setStructure(dto.getStructure());
        entity.setTags(dto.getTags());
        // Note: createdBy is not updated in update operations
    }
}