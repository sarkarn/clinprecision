package com.clinprecision.common.mapper;

import com.clinprecision.common.dto.OrganizationDto;
import com.clinprecision.common.entity.OrganizationEntity;
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
public class OrganizationMapperImpl implements OrganizationMapper {

    @Override
    public OrganizationDto toDto(OrganizationEntity entity) {
        if ( entity == null ) {
            return null;
        }

        OrganizationDto organizationDto = new OrganizationDto();

        organizationDto.setId( entity.getId() );
        organizationDto.setName( entity.getName() );
        organizationDto.setExternalId( entity.getExternalId() );
        organizationDto.setAddressLine1( entity.getAddressLine1() );
        organizationDto.setAddressLine2( entity.getAddressLine2() );
        organizationDto.setCity( entity.getCity() );
        organizationDto.setState( entity.getState() );
        organizationDto.setPostalCode( entity.getPostalCode() );
        organizationDto.setCountry( entity.getCountry() );
        organizationDto.setPhone( entity.getPhone() );
        organizationDto.setEmail( entity.getEmail() );
        organizationDto.setWebsite( entity.getWebsite() );
        organizationDto.setStatus( entity.getStatus() );
        organizationDto.setCreatedAt( entity.getCreatedAt() );
        organizationDto.setUpdatedAt( entity.getUpdatedAt() );

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
