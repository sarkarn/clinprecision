package com.clinprecision.common.mapper;


import com.clinprecision.common.dto.SiteDto;
import com.clinprecision.common.entity.SiteEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Mapper for converting between SiteEntity and SiteDto.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, 
    uses = {OrganizationMapper.class, UserMapper.class})
public interface SiteMapper {
    SiteDto toDto(SiteEntity entity);
    List<SiteDto> toDtoList(List<SiteEntity> entities);
    SiteEntity toEntity(SiteDto dto);
}