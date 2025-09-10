package com.clinprecision.studydesignservice.mapper;

import com.clinprecision.studydesignservice.dto.VisitDefinitionDto;
import com.clinprecision.studydesignservice.entity.StudyArmEntity;
import com.clinprecision.studydesignservice.entity.StudyEntity;
import com.clinprecision.studydesignservice.entity.VisitDefinitionEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * Mapper for VisitDefinitionEntity and VisitDefinitionDto
 */
@Component
public class VisitDefinitionMapper {
    
    private final ModelMapper modelMapper;
    private final StudyArmMapper studyArmMapper;
    private final VisitFormMapper visitFormMapper;
    
    public VisitDefinitionMapper(ModelMapper modelMapper, StudyArmMapper studyArmMapper, VisitFormMapper visitFormMapper) {
        this.modelMapper = modelMapper;
        this.studyArmMapper = studyArmMapper;
        this.visitFormMapper = visitFormMapper;
    }
    
    public VisitDefinitionDto toDto(VisitDefinitionEntity entity) {
        if (entity == null) {
            return null;
        }
        
        VisitDefinitionDto dto = modelMapper.map(entity, VisitDefinitionDto.class);
        
        if (entity.getStudy() != null) {
            dto.setStudyId(entity.getStudy().getId());
        }
        
        if (entity.getArm() != null) {
            dto.setArmId(entity.getArm().getId());
            dto.setArm(studyArmMapper.toDto(entity.getArm()));
        }
        
        if (entity.getVisitForms() != null && !entity.getVisitForms().isEmpty()) {
            dto.setVisitForms(
                entity.getVisitForms().stream()
                    .map(visitFormMapper::toDto)
                    .collect(Collectors.toList())
            );
        }
        
        return dto;
    }
    
    public VisitDefinitionEntity toEntity(VisitDefinitionDto dto) {
        if (dto == null) {
            return null;
        }
        
        VisitDefinitionEntity entity = modelMapper.map(dto, VisitDefinitionEntity.class);
        
        if (dto.getStudyId() != null) {
            StudyEntity studyEntity = new StudyEntity();
            studyEntity.setId(dto.getStudyId());
            entity.setStudy(studyEntity);
        }
        
        if (dto.getArmId() != null) {
            StudyArmEntity armEntity = new StudyArmEntity();
            armEntity.setId(dto.getArmId());
            entity.setArm(armEntity);
        }
        
        // visitForms are handled separately
        entity.setVisitForms(null);
        
        return entity;
    }
    
    public void updateEntityFromDto(VisitDefinitionDto dto, VisitDefinitionEntity entity) {
        if (dto == null || entity == null) {
            return;
        }
        
        // Don't update id, createdAt and visitForms
        Long id = entity.getId();
        var createdAt = entity.getCreatedAt();
        var visitForms = entity.getVisitForms();
        var study = entity.getStudy();
        var arm = entity.getArm();
        
        modelMapper.map(dto, entity);
        
        // Restore properties that should not be updated
        entity.setId(id);
        entity.setCreatedAt(createdAt);
        entity.setVisitForms(visitForms);
        
        // Set the study relationship
        if (dto.getStudyId() != null && (study == null || !dto.getStudyId().equals(study.getId()))) {
            StudyEntity studyEntity = new StudyEntity();
            studyEntity.setId(dto.getStudyId());
            entity.setStudy(studyEntity);
        } else {
            entity.setStudy(study);
        }
        
        // Set the arm relationship
        if (dto.getArmId() != null && (arm == null || !dto.getArmId().equals(arm.getId()))) {
            StudyArmEntity armEntity = new StudyArmEntity();
            armEntity.setId(dto.getArmId());
            entity.setArm(armEntity);
        } else {
            entity.setArm(arm);
        }
    }
}
