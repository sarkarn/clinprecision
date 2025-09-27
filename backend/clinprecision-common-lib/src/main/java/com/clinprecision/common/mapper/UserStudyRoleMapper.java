package com.clinprecision.common.mapper;

import com.clinprecision.common.dto.UserStudyRoleDto;
import com.clinprecision.common.entity.UserStudyRoleEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

/**
 * MapStruct mapper for UserStudyRole entity and DTO conversions
 */
@Mapper(componentModel = "spring")
public interface UserStudyRoleMapper {
    
    UserStudyRoleMapper INSTANCE = Mappers.getMapper(UserStudyRoleMapper.class);
    
    /**
     * Converts UserStudyRoleEntity to UserStudyRoleDto
     */
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "role.name", target = "roleCode")  // Assuming role name is the code
    @Mapping(source = "role.name", target = "roleName")
    @Mapping(target = "description", ignore = true)      // Not available in entity
    @Mapping(source = "studyId", target = "studyId")
    @Mapping(target = "studyName", ignore = true)        // Not available in entity
    @Mapping(target = "studyCode", ignore = true)        // Not available in entity
    @Mapping(target = "rolePriority", ignore = true)     // Not available in entity
    UserStudyRoleDto entityToDto(UserStudyRoleEntity entity);
    
    /**
     * Converts UserStudyRoleDto to UserStudyRoleEntity
     * Note: This creates a new entity - relationships need to be set separately
     */
    @Mapping(target = "user", ignore = true)             // Set separately using userId
    @Mapping(target = "role", ignore = true)             // Set separately using roleCode
    @Mapping(target = "siteId", ignore = true)           // Not available in DTO
    UserStudyRoleEntity dtoToEntity(UserStudyRoleDto dto);
    
    /**
     * Creates a basic DTO with essential fields only (for fallback scenarios)
     */
    @Named("toBasicDto")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "role.name", target = "roleCode")
    @Mapping(source = "role.name", target = "roleName") 
    @Mapping(source = "studyId", target = "studyId")
    @Mapping(target = "studyName", ignore = true)
    @Mapping(target = "studyCode", ignore = true)
    @Mapping(target = "description", ignore = true)
    @Mapping(target = "rolePriority", ignore = true)
    UserStudyRoleDto entityToBasicDto(UserStudyRoleEntity entity);
}