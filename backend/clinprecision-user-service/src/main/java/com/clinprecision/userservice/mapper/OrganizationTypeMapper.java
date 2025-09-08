package com.clinprecision.userservice.mapper;

import com.clinprecision.userservice.data.OrganizationTypeEntity;
import com.clinprecision.userservice.ui.model.OrganizationTypeDto;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Mapper for converting between OrganizationTypeEntity and OrganizationTypeDto.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrganizationTypeMapper {
    OrganizationTypeDto toDto(OrganizationTypeEntity entity);
    List<OrganizationTypeDto> toDtoList(List<OrganizationTypeEntity> entities);
    OrganizationTypeEntity toEntity(OrganizationTypeDto dto);
}