package com.clinprecision.common.mapper;

import com.clinprecision.common.dto.UserTypeDto;
import com.clinprecision.common.entity.UserTypeEntity;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-09-13T17:09:16-0400",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21 (Oracle Corporation)"
)
@Component
public class UserTypeMapperImpl implements UserTypeMapper {

    @Override
    public UserTypeDto toDto(UserTypeEntity entity) {
        if ( entity == null ) {
            return null;
        }

        UserTypeDto userTypeDto = new UserTypeDto();

        userTypeDto.setId( entity.getId() );
        userTypeDto.setName( entity.getName() );
        userTypeDto.setDescription( entity.getDescription() );
        userTypeDto.setCode( entity.getCode() );
        userTypeDto.setCategory( entity.getCategory() );
        userTypeDto.setCreatedAt( entity.getCreatedAt() );
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
