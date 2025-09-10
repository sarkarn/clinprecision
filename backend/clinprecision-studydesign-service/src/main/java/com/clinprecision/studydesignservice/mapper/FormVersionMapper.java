package com.clinprecision.studydesignservice.mapper;

import com.clinprecision.studydesignservice.dto.FormVersionDto;
import com.clinprecision.studydesignservice.entity.FormEntity;
import com.clinprecision.studydesignservice.entity.FormVersionEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

/**
 * Mapper for FormVersionEntity and FormVersionDto
 */
@Component
public class FormVersionMapper {
    
    private final ModelMapper modelMapper;
    
    public FormVersionMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }
    
    public FormVersionDto toDto(FormVersionEntity entity) {
        if (entity == null) {
            return null;
        }
        
        FormVersionDto dto = modelMapper.map(entity, FormVersionDto.class);
        
        if (entity.getForm() != null) {
            dto.setFormId(entity.getForm().getId());
        }
        
        return dto;
    }
    
    public FormVersionEntity toEntity(FormVersionDto dto) {
        if (dto == null) {
            return null;
        }
        
        FormVersionEntity entity = modelMapper.map(dto, FormVersionEntity.class);
        
        if (dto.getFormId() != null) {
            FormEntity formEntity = new FormEntity();
            formEntity.setId(dto.getFormId());
            entity.setForm(formEntity);
        }
        
        return entity;
    }
    
    public void updateEntityFromDto(FormVersionDto dto, FormVersionEntity entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        // Don't update id and createdAt
        Long id = entity.getId();
        var createdAt = entity.getCreatedAt();
        var form = entity.getForm();
        
        modelMapper.map(dto, entity);
        
        // Restore properties that should not be updated
        entity.setId(id);
        entity.setCreatedAt(createdAt);
        
        // Set the form relationship
        if (dto.getFormId() != null && (form == null || !dto.getFormId().equals(form.getId()))) {
            FormEntity formEntity = new FormEntity();
            formEntity.setId(dto.getFormId());
            entity.setForm(formEntity);
        } else {
            entity.setForm(form);
        }
    }
}
