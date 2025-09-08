package com.clinprecision.userservice.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.clinprecision.userservice.data.UserEntity;
import com.clinprecision.userservice.data.RoleEntity;
import com.clinprecision.userservice.ui.model.UserDto;

/**
 * Mapper for converting between UserEntity and UserDto.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, 
    uses = {OrganizationMapper.class, UserTypeMapper.class})
public interface UserMapper {
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "roleIds", expression = "java(entity.getRoles() != null ? entity.getRoles().stream().map(role -> role.getId()).collect(java.util.stream.Collectors.toSet()) : null)")
    UserDto toDto(UserEntity entity);

    List<UserDto> toDtoList(List<UserEntity> entities);

    @Mapping(target = "roles", ignore = true) // Will be set manually in service
    UserEntity toEntity(UserDto dto);
}