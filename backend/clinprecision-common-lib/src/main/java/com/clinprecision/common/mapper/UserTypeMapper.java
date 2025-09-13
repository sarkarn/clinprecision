package com.clinprecision.common.mapper;


import com.clinprecision.common.dto.UserTypeDto;
import com.clinprecision.common.entity.UserTypeEntity;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Mapper for converting between UserTypeEntity and UserTypeDto.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserTypeMapper {
    UserTypeDto toDto(UserTypeEntity entity);
    List<UserTypeDto> toDtoList(List<UserTypeEntity> entities);
    UserTypeEntity toEntity(UserTypeDto dto);
}