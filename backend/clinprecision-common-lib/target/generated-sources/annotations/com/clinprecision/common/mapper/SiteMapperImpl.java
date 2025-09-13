package com.clinprecision.common.mapper;

import com.clinprecision.common.dto.SiteDto;
import com.clinprecision.common.entity.SiteEntity;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-09-13T17:09:16-0400",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21 (Oracle Corporation)"
)
@Component
public class SiteMapperImpl implements SiteMapper {

    @Autowired
    private OrganizationMapper organizationMapper;
    @Autowired
    private UserMapper userMapper;

    @Override
    public SiteDto toDto(SiteEntity entity) {
        if ( entity == null ) {
            return null;
        }

        SiteDto siteDto = new SiteDto();

        siteDto.setId( entity.getId() );
        siteDto.setName( entity.getName() );
        siteDto.setSiteNumber( entity.getSiteNumber() );
        siteDto.setOrganization( organizationMapper.toDto( entity.getOrganization() ) );
        siteDto.setPrincipalInvestigator( userMapper.toDto( entity.getPrincipalInvestigator() ) );
        siteDto.setAddressLine1( entity.getAddressLine1() );
        siteDto.setAddressLine2( entity.getAddressLine2() );
        siteDto.setCity( entity.getCity() );
        siteDto.setState( entity.getState() );
        siteDto.setPostalCode( entity.getPostalCode() );
        siteDto.setCountry( entity.getCountry() );
        siteDto.setPhone( entity.getPhone() );
        siteDto.setEmail( entity.getEmail() );
        siteDto.setStatus( entity.getStatus() );
        siteDto.setCreatedAt( entity.getCreatedAt() );
        siteDto.setUpdatedAt( entity.getUpdatedAt() );

        return siteDto;
    }

    @Override
    public List<SiteDto> toDtoList(List<SiteEntity> entities) {
        if ( entities == null ) {
            return null;
        }

        List<SiteDto> list = new ArrayList<SiteDto>( entities.size() );
        for ( SiteEntity siteEntity : entities ) {
            list.add( toDto( siteEntity ) );
        }

        return list;
    }

    @Override
    public SiteEntity toEntity(SiteDto dto) {
        if ( dto == null ) {
            return null;
        }

        SiteEntity siteEntity = new SiteEntity();

        siteEntity.setId( dto.getId() );
        siteEntity.setName( dto.getName() );
        siteEntity.setSiteNumber( dto.getSiteNumber() );
        siteEntity.setOrganization( organizationMapper.toEntity( dto.getOrganization() ) );
        siteEntity.setPrincipalInvestigator( userMapper.toEntity( dto.getPrincipalInvestigator() ) );
        siteEntity.setAddressLine1( dto.getAddressLine1() );
        siteEntity.setAddressLine2( dto.getAddressLine2() );
        siteEntity.setCity( dto.getCity() );
        siteEntity.setState( dto.getState() );
        siteEntity.setPostalCode( dto.getPostalCode() );
        siteEntity.setCountry( dto.getCountry() );
        siteEntity.setPhone( dto.getPhone() );
        siteEntity.setEmail( dto.getEmail() );
        siteEntity.setStatus( dto.getStatus() );
        siteEntity.setCreatedAt( dto.getCreatedAt() );
        siteEntity.setUpdatedAt( dto.getUpdatedAt() );

        return siteEntity;
    }
}
