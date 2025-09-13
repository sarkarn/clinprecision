package com.clinprecision.common.mapper;


import com.clinprecision.common.dto.OrganizationDto;
import com.clinprecision.common.entity.OrganizationEntity;
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