package com.clinprecision.common.mapper;

import com.clinprecision.common.dto.UserDto;
import com.clinprecision.common.dto.UserTypeDto;
import com.clinprecision.common.entity.UserEntity;
import com.clinprecision.common.entity.UserTypeEntity;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-09-15T14:57:21-0400",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.43.0.v20250819-1513, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Autowired
    private OrganizationMapper organizationMapper;
    @Autowired
    private UserTypeMapper userTypeMapper;

    @Override
    public UserDto toDto(UserEntity entity) {
        if ( entity == null ) {
            return null;
        }

        UserDto userDto = new UserDto();

        userDto.setAddressLine1( entity.getAddressLine1() );
        userDto.setAddressLine2( entity.getAddressLine2() );
        userDto.setCity( entity.getCity() );
        userDto.setCountry( entity.getCountry() );
        userDto.setCreatedAt( entity.getCreatedAt() );
        userDto.setEmail( entity.getEmail() );
        userDto.setEncryptedPassword( entity.getEncryptedPassword() );
        userDto.setFirstName( entity.getFirstName() );
        userDto.setId( entity.getId() );
        userDto.setLastLoginAt( entity.getLastLoginAt() );
        userDto.setLastName( entity.getLastName() );
        userDto.setMiddleName( entity.getMiddleName() );
        userDto.setMobilePhone( entity.getMobilePhone() );
        userDto.setNotes( entity.getNotes() );
        userDto.setOrganization( organizationMapper.toDto( entity.getOrganization() ) );
        userDto.setPasswordResetRequired( entity.isPasswordResetRequired() );
        userDto.setPhone( entity.getPhone() );
        userDto.setPostalCode( entity.getPostalCode() );
        userDto.setProfession( entity.getProfession() );
        userDto.setState( entity.getState() );
        userDto.setStatus( entity.getStatus() );
        userDto.setTitle( entity.getTitle() );
        userDto.setUpdatedAt( entity.getUpdatedAt() );
        userDto.setUserId( entity.getUserId() );
        userDto.setUserTypes( userTypeEntitySetToUserTypeDtoSet( entity.getUserTypes() ) );

        userDto.setRoleIds( entity.getRoles() != null ? entity.getRoles().stream().map(role -> role.getId()).collect(java.util.stream.Collectors.toSet()) : null );

        return userDto;
    }

    @Override
    public List<UserDto> toDtoList(List<UserEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<UserDto> list = new ArrayList<UserDto>( entities.size() );
        for ( UserEntity userEntity : entities ) {
            list.add( toDto( userEntity ) );
        }

        return list;
    }

    @Override
    public UserEntity toEntity(UserDto dto) {
        if ( dto == null ) {
            return null;
        }

        UserEntity userEntity = new UserEntity();

        if ( dto.getId() != null ) {
            userEntity.setId( dto.getId() );
        }
        userEntity.setFirstName( dto.getFirstName() );
        userEntity.setLastName( dto.getLastName() );
        userEntity.setEmail( dto.getEmail() );
        userEntity.setUserId( dto.getUserId() );
        userEntity.setEncryptedPassword( dto.getEncryptedPassword() );
        userEntity.setMiddleName( dto.getMiddleName() );
        userEntity.setTitle( dto.getTitle() );
        userEntity.setOrganization( organizationMapper.toEntity( dto.getOrganization() ) );
        userEntity.setProfession( dto.getProfession() );
        userEntity.setPhone( dto.getPhone() );
        userEntity.setMobilePhone( dto.getMobilePhone() );
        userEntity.setAddressLine1( dto.getAddressLine1() );
        userEntity.setAddressLine2( dto.getAddressLine2() );
        userEntity.setCity( dto.getCity() );
        userEntity.setState( dto.getState() );
        userEntity.setPostalCode( dto.getPostalCode() );
        userEntity.setCountry( dto.getCountry() );
        userEntity.setStatus( dto.getStatus() );
        userEntity.setLastLoginAt( dto.getLastLoginAt() );
        userEntity.setPasswordResetRequired( dto.isPasswordResetRequired() );
        userEntity.setNotes( dto.getNotes() );
        userEntity.setCreatedAt( dto.getCreatedAt() );
        userEntity.setUpdatedAt( dto.getUpdatedAt() );
        userEntity.setUserTypes( userTypeDtoSetToUserTypeEntitySet( dto.getUserTypes() ) );

        return userEntity;
    }

    protected Set<UserTypeDto> userTypeEntitySetToUserTypeDtoSet(Set<UserTypeEntity> set) {
        if ( set == null ) {
            return null;
        }

        Set<UserTypeDto> set1 = new LinkedHashSet<UserTypeDto>( Math.max( (int) ( set.size() / .75f ) + 1, 16 ) );
        for ( UserTypeEntity userTypeEntity : set ) {
            set1.add( userTypeMapper.toDto( userTypeEntity ) );
        }

        return set1;
    }

    protected Set<UserTypeEntity> userTypeDtoSetToUserTypeEntitySet(Set<UserTypeDto> set) {
        if ( set == null ) {
            return null;
        }

        Set<UserTypeEntity> set1 = new LinkedHashSet<UserTypeEntity>( Math.max( (int) ( set.size() / .75f ) + 1, 16 ) );
        for ( UserTypeDto userTypeDto : set ) {
            set1.add( userTypeMapper.toEntity( userTypeDto ) );
        }

        return set1;
    }
}
