package com.clinprecision.studydesignservice.mapper;

import com.clinprecision.studydesignservice.dto.VisitFormDto;
import com.clinprecision.studydesignservice.entity.FormEntity;
import com.clinprecision.studydesignservice.entity.VisitDefinitionEntity;
import com.clinprecision.studydesignservice.entity.VisitFormEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

/**
 * Mapper for VisitFormEntity and VisitFormDto
 */
@Component
public class VisitFormMapper {
    
    private final ModelMapper modelMapper;
    private final FormMapper formMapper;
    private final FormVersionMapper formVersionMapper;
    
    public VisitFormMapper(ModelMapper modelMapper, FormMapper formMapper, FormVersionMapper formVersionMapper) {
        this.modelMapper = modelMapper;
        this.formMapper = formMapper;
        this.formVersionMapper = formVersionMapper;
    }
    
    public VisitFormDto toDto(VisitFormEntity entity) {
        if (entity == null) {
            return null;
        }
        
        VisitFormDto dto = modelMapper.map(entity, VisitFormDto.class);
        
        if (entity.getVisitDefinition() != null) {
            dto.setVisitDefinitionId(entity.getVisitDefinition().getId());
        }
        
        if (entity.getForm() != null) {
            dto.setFormId(entity.getForm().getId());
            dto.setForm(formMapper.toDto(entity.getForm()));
        }
        
        if (entity.getActiveFormVersion() != null) {
            dto.setActiveFormVersion(formVersionMapper.toDto(entity.getActiveFormVersion()));
        }
        
        return dto;
    }
    
    public VisitFormEntity toEntity(VisitFormDto dto) {
        if (dto == null) {
            return null;
        }
        
        VisitFormEntity entity = modelMapper.map(dto, VisitFormEntity.class);
        
        if (dto.getVisitDefinitionId() != null) {
            VisitDefinitionEntity visitDefinitionEntity = new VisitDefinitionEntity();
            visitDefinitionEntity.setId(dto.getVisitDefinitionId());
            entity.setVisitDefinition(visitDefinitionEntity);
        }
        
        if (dto.getFormId() != null) {
            FormEntity formEntity = new FormEntity();
            formEntity.setId(dto.getFormId());
            entity.setForm(formEntity);
        }
        
        // activeFormVersion is handled separately
        entity.setActiveFormVersion(null);
        
        return entity;
    }
    
    public void updateEntityFromDto(VisitFormDto dto, VisitFormEntity entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        // Don't update id and createdAt
        Long id = entity.getId();
        var createdAt = entity.getCreatedAt();
        var visitDefinition = entity.getVisitDefinition();
        var form = entity.getForm();
        var activeFormVersion = entity.getActiveFormVersion();
        
        modelMapper.map(dto, entity);
        
        // Restore properties that should not be updated
        entity.setId(id);
        entity.setCreatedAt(createdAt);
        entity.setActiveFormVersion(activeFormVersion);
        
        // Set the visitDefinition relationship
        if (dto.getVisitDefinitionId() != null && 
            (visitDefinition == null || !dto.getVisitDefinitionId().equals(visitDefinition.getId()))) {
            VisitDefinitionEntity visitDefEntity = new VisitDefinitionEntity();
            visitDefEntity.setId(dto.getVisitDefinitionId());
            entity.setVisitDefinition(visitDefEntity);
        } else {
            entity.setVisitDefinition(visitDefinition);
        }
        
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
