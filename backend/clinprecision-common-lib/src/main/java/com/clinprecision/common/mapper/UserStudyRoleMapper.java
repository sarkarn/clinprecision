package com.clinprecision.common.mapper;

import com.clinprecision.common.dto.UserStudyRoleDto;
import com.clinprecision.common.entity.UserStudyRoleEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
    @Mapping(source = "startDate", target = "startDate", qualifiedByName = "localDateToLocalDateTime")
    @Mapping(source = "endDate", target = "endDate", qualifiedByName = "localDateToLocalDateTime")
    @Mapping(target = "studyName", ignore = true)        // Not available in entity
    @Mapping(target = "studyCode", ignore = true)        // Not available in entity
    @Mapping(target = "rolePriority", ignore = true)     // Not available in entity
    UserStudyRoleDto entityToDto(UserStudyRoleEntity entity);
    
    /**
     * Convert LocalDate to LocalDateTime (at start of day)
     */
    @Named("localDateToLocalDateTime")
    default LocalDateTime localDateToLocalDateTime(LocalDate date) {
        return date != null ? date.atStartOfDay() : null;
    }
    
    /**
     * Convert LocalDateTime to LocalDate
     */
    @Named("localDateTimeToLocalDate")
    default LocalDate localDateTimeToLocalDate(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.toLocalDate() : null;
    }
    
    /**
     * Converts UserStudyRoleDto to UserStudyRoleEntity
     * Note: This creates a new entity - relationships need to be set separately
     */
    @Mapping(target = "user", ignore = true)             // Set separately using userId
    @Mapping(target = "role", ignore = true)             // Set separately using roleCode
    @Mapping(target = "siteId", ignore = true)           // Not available in DTO
    @Mapping(source = "startDate", target = "startDate", qualifiedByName = "localDateTimeToLocalDate")
    @Mapping(source = "endDate", target = "endDate", qualifiedByName = "localDateTimeToLocalDate")
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