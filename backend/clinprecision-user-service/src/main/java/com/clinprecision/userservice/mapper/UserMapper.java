package com.clinprecision.userservice.mapper;

import com.clinprecision.userservice.data.UserEntity;
import com.clinprecision.userservice.ui.model.UserDto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * Mapper for converting between UserEntity and UserDto.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, 
    uses = {OrganizationMapper.class, UserTypeMapper.class})
public interface UserMapper {
    @Mapping(target = "password", ignore = true)
    UserDto toDto(UserEntity entity);
    List<UserDto> toDtoList(List<UserEntity> entities);
    UserEntity toEntity(UserDto dto);
}