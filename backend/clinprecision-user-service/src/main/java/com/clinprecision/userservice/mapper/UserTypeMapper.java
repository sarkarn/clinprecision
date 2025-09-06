package com.clinprecision.userservice.mapper;

import com.clinprecision.userservice.data.UserTypeEntity;
import com.clinprecision.userservice.ui.model.UserTypeDto;

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