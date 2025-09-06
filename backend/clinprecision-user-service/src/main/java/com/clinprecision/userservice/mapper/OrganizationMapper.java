package com.clinprecision.userservice.mapper;

import com.clinprecision.userservice.data.OrganizationEntity;
import com.clinprecision.userservice.ui.model.OrganizationDto;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Mapper for converting between OrganizationEntity and OrganizationDto.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrganizationMapper {
    OrganizationDto toDto(OrganizationEntity entity);
    List<OrganizationDto> toDtoList(List<OrganizationEntity> entities);
    OrganizationEntity toEntity(OrganizationDto dto);
}