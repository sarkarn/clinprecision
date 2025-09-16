package com.clinprecision.common.mapper;

import com.clinprecision.common.dto.UserTypeDto;
import com.clinprecision.common.entity.UserTypeEntity;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-09-15T14:57:21-0400",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.43.0.v20250819-1513, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class UserTypeMapperImpl implements UserTypeMapper {

    @Override
    public UserTypeDto toDto(UserTypeEntity entity) {
        if ( entity == null ) {
            return null;
        }

        UserTypeDto userTypeDto = new UserTypeDto();

        userTypeDto.setCategory( entity.getCategory() );
        userTypeDto.setCode( entity.getCode() );
        userTypeDto.setCreatedAt( entity.getCreatedAt() );
        userTypeDto.setDescription( entity.getDescription() );
        userTypeDto.setId( entity.getId() );
        userTypeDto.setName( entity.getName() );
        userTypeDto.setUpdatedAt( entity.getUpdatedAt() );

        return userTypeDto;
    }

    @Override
    public List<UserTypeDto> toDtoList(List<UserTypeEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<UserTypeDto> list = new ArrayList<UserTypeDto>( entities.size() );
        for ( UserTypeEntity userTypeEntity : entities ) {
            list.add( toDto( userTypeEntity ) );
        }

        return list;
    }

    @Override
    public UserTypeEntity toEntity(UserTypeDto dto) {
        if ( dto == null ) {
            return null;
        }

        UserTypeEntity userTypeEntity = new UserTypeEntity();

        userTypeEntity.setId( dto.getId() );
        userTypeEntity.setName( dto.getName() );
        userTypeEntity.setDescription( dto.getDescription() );
        userTypeEntity.setCode( dto.getCode() );
        userTypeEntity.setCategory( dto.getCategory() );
        userTypeEntity.setCreatedAt( dto.getCreatedAt() );
        userTypeEntity.setUpdatedAt( dto.getUpdatedAt() );

        return userTypeEntity;
    }
}
