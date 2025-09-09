package com.clinprecision.studydesignservice.mapper;

import com.clinprecision.studydesignservice.dto.StudyArmDto;
import com.clinprecision.studydesignservice.entity.StudyArmEntity;
import com.clinprecision.studydesignservice.entity.StudyEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

/**
 * Mapper for StudyArmEntity and StudyArmDto
 */
@Component
public class StudyArmMapper {
    
    private final ModelMapper modelMapper;
    
    public StudyArmMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }
    
    public StudyArmDto toDto(StudyArmEntity entity) {
        if (entity == null) {
            return null;
        }
        
        StudyArmDto dto = modelMapper.map(entity, StudyArmDto.class);
        
        if (entity.getStudy() != null) {
            dto.setStudyId(entity.getStudy().getId());
        }
        
        return dto;
    }
    
    public StudyArmEntity toEntity(StudyArmDto dto) {
        if (dto == null) {
            return null;
        }
        
        StudyArmEntity entity = modelMapper.map(dto, StudyArmEntity.class);
        
        if (dto.getStudyId() != null) {
            StudyEntity studyEntity = new StudyEntity();
            studyEntity.setId(dto.getStudyId());
            entity.setStudy(studyEntity);
        }
        
        return entity;
    }
    
    public void updateEntityFromDto(StudyArmDto dto, StudyArmEntity entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        // Don't update id and createdAt
        Long id = entity.getId();
        var createdAt = entity.getCreatedAt();
        var study = entity.getStudy();
        
        modelMapper.map(dto, entity);
        
        // Restore properties that should not be updated
        entity.setId(id);
        entity.setCreatedAt(createdAt);
        
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
