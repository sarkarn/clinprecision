package com.clinprecision.common.mapper;

import com.clinprecision.common.dto.OrganizationDto;
import com.clinprecision.common.entity.OrganizationEntity;
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
public class OrganizationMapperImpl implements OrganizationMapper {

    @Override
    public OrganizationDto toDto(OrganizationEntity entity) {
        if ( entity == null ) {
            return null;
        }

        OrganizationDto organizationDto = new OrganizationDto();

        organizationDto.setAddressLine1( entity.getAddressLine1() );
        organizationDto.setAddressLine2( entity.getAddressLine2() );
        organizationDto.setCity( entity.getCity() );
        organizationDto.setCountry( entity.getCountry() );
        organizationDto.setCreatedAt( entity.getCreatedAt() );
        organizationDto.setEmail( entity.getEmail() );
        organizationDto.setExternalId( entity.getExternalId() );
        organizationDto.setId( entity.getId() );
        organizationDto.setName( entity.getName() );
        organizationDto.setPhone( entity.getPhone() );
        organizationDto.setPostalCode( entity.getPostalCode() );
        organizationDto.setState( entity.getState() );
        organizationDto.setStatus( entity.getStatus() );
        organizationDto.setUpdatedAt( entity.getUpdatedAt() );
        organizationDto.setWebsite( entity.getWebsite() );

        return organizationDto;
    }

    @Override
    public List<OrganizationDto> toDtoList(List<OrganizationEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<OrganizationDto> list = new ArrayList<OrganizationDto>( entities.size() );
        for ( OrganizationEntity organizationEntity : entities ) {
            list.add( toDto( organizationEntity ) );
        }

        return list;
    }

    @Override
    public OrganizationEntity toEntity(OrganizationDto dto) {
        if ( dto == null ) {
            return null;
        }

        OrganizationEntity organizationEntity = new OrganizationEntity();

        organizationEntity.setId( dto.getId() );
        organizationEntity.setName( dto.getName() );
        organizationEntity.setExternalId( dto.getExternalId() );
        organizationEntity.setAddressLine1( dto.getAddressLine1() );
        organizationEntity.setAddressLine2( dto.getAddressLine2() );
        organizationEntity.setCity( dto.getCity() );
        organizationEntity.setState( dto.getState() );
        organizationEntity.setPostalCode( dto.getPostalCode() );
        organizationEntity.setCountry( dto.getCountry() );
        organizationEntity.setPhone( dto.getPhone() );
        organizationEntity.setEmail( dto.getEmail() );
        organizationEntity.setWebsite( dto.getWebsite() );
        organizationEntity.setStatus( dto.getStatus() );
        organizationEntity.setCreatedAt( dto.getCreatedAt() );
        organizationEntity.setUpdatedAt( dto.getUpdatedAt() );

        return organizationEntity;
    }
}
