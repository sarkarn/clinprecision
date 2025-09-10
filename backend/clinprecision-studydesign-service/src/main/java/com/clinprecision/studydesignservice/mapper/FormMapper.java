package com.clinprecision.studydesignservice.mapper;

import com.clinprecision.studydesignservice.dto.FormDto;
import com.clinprecision.studydesignservice.entity.FormEntity;
import com.clinprecision.studydesignservice.entity.StudyEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

/**
 * Mapper for FormEntity and FormDto
 */
@Component
public class FormMapper {
    
    private final ModelMapper modelMapper;
    private final FormVersionMapper formVersionMapper;
    
    public FormMapper(ModelMapper modelMapper, FormVersionMapper formVersionMapper) {
        this.modelMapper = modelMapper;
        this.formVersionMapper = formVersionMapper;
    }
    
    public FormDto toDto(FormEntity entity) {
        if (entity == null) {
            return null;
        }
        
        FormDto dto = modelMapper.map(entity, FormDto.class);
        
        // Map study ID if present
        if (entity.getStudy() != null) {
            dto.setStudyId(entity.getStudy().getId());
        }
        
        return dto;
    }
    
    public FormEntity toEntity(FormDto dto) {
        if (dto == null) {
            return null;
        }
        
        FormEntity entity = modelMapper.map(dto, FormEntity.class);
        
        // Set study relationship
        if (dto.getStudyId() != null) {
            StudyEntity studyEntity = new StudyEntity();
            studyEntity.setId(dto.getStudyId());
            entity.setStudy(studyEntity);
        }
        
        // Versions are handled separately
        entity.setVersions(null);
        
        return entity;
    }
    
    public void updateEntityFromDto(FormDto dto, FormEntity entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        // Don't update id and createdAt
        Long id = entity.getId();
        var createdAt = entity.getCreatedAt();
        var versions = entity.getVersions();
        var study = entity.getStudy();
        
        modelMapper.map(dto, entity);
        
        // Restore properties that should not be updated
        entity.setId(id);
        entity.setCreatedAt(createdAt);
        entity.setVersions(versions);
        
        // Set the study relationship
        if (dto.getStudyId() != null && (study == null || !dto.getStudyId().equals(study.getId()))) {
            StudyEntity studyEntity = new StudyEntity();
            studyEntity.setId(dto.getStudyId());
            entity.setStudy(studyEntity);
        } else {
            entity.setStudy(study);
        }
    }
}
