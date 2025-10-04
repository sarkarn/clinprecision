package com.clinprecision.common.mapper;

import com.clinprecision.common.dto.CodeListDto;
import com.clinprecision.common.dto.clinops.CreateCodeListRequest;
import com.clinprecision.common.dto.clinops.UpdateCodeListRequest;
import com.clinprecision.common.entity.CodeListEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Mapper for CodeList entities and DTOs
 */
@Component
public class CodeListMapper {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Convert entity to DTO
     */
    public CodeListDto toDto(CodeListEntity entity) {
        if (entity == null) {
            return null;
        }
        
        CodeListDto dto = new CodeListDto();
        dto.setId(entity.getId());
        dto.setCategory(entity.getCategory());
        dto.setCode(entity.getCode());
        dto.setDisplayName(entity.getDisplayName());
        dto.setDescription(entity.getDescription());
        dto.setSortOrder(entity.getSortOrder());
        dto.setIsActive(entity.getIsActive());
        dto.setSystemCode(entity.getSystemCode());
        dto.setParentCodeId(entity.getParentCodeId());
        dto.setValidFrom(entity.getValidFrom());
        dto.setValidTo(entity.getValidTo());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedBy(entity.getUpdatedBy());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setVersionNumber(entity.getVersionNumber());
        
        // Convert metadata from JSON string to Map
        dto.setMetadata(convertJsonStringToMap(entity.getMetadata()));
        
        // Set computed fields
        dto.setIsCurrentlyValid(entity.isCurrentlyValid());
        dto.setCanEdit(!entity.isSystemManaged());
        dto.setCanDelete(!entity.isSystemManaged());
        
        return dto;
    }
    
    /**
     * Convert list of entities to DTOs
     */
    public List<CodeListDto> toDtoList(List<CodeListEntity> entities) {
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert DTO to entity (for updates)
     */
    public CodeListEntity toEntity(CodeListDto dto) {
        if (dto == null) {
            return null;
        }
        
        CodeListEntity entity = new CodeListEntity();
        entity.setId(dto.getId());
        entity.setCategory(dto.getCategory());
        entity.setCode(dto.getCode());
        entity.setDisplayName(dto.getDisplayName());
        entity.setDescription(dto.getDescription());
        entity.setSortOrder(dto.getSortOrder());
        entity.setIsActive(dto.getIsActive());
        entity.setSystemCode(dto.getSystemCode());
        entity.setParentCodeId(dto.getParentCodeId());
        entity.setValidFrom(dto.getValidFrom());
        entity.setValidTo(dto.getValidTo());
        entity.setCreatedBy(dto.getCreatedBy());
        entity.setCreatedAt(dto.getCreatedAt());
        entity.setUpdatedBy(dto.getUpdatedBy());
        entity.setUpdatedAt(dto.getUpdatedAt());
        entity.setVersionNumber(dto.getVersionNumber());
        
        // Convert metadata from Map to JSON string
        entity.setMetadata(convertMapToJsonString(dto.getMetadata()));
        
        return entity;
    }
    
    /**
     * Convert create request to entity
     */
    public CodeListEntity toEntity(CreateCodeListRequest request) {
        if (request == null) {
            return null;
        }
        
        CodeListEntity entity = new CodeListEntity();
        entity.setCategory(request.getCategory());
        entity.setCode(request.getCode());
        entity.setDisplayName(request.getDisplayName());
        entity.setDescription(request.getDescription());
        entity.setSortOrder(request.getSortOrder());
        entity.setIsActive(request.getIsActive());
        entity.setSystemCode(request.getSystemCode());
        entity.setParentCodeId(request.getParentCodeId());
        entity.setValidFrom(request.getValidFrom());
        entity.setValidTo(request.getValidTo());
        entity.setCreatedBy(request.getCreatedBy());
        
        // Convert metadata from Map to JSON string
        entity.setMetadata(convertMapToJsonString(request.getMetadata()));
        
        return entity;
    }
    
    /**
     * Update entity from update request
     */
    public void updateEntityFromRequest(CodeListEntity entity, UpdateCodeListRequest request) {
        if (entity == null || request == null) {
            return;
        }
        
        if (request.getDisplayName() != null) {
            entity.setDisplayName(request.getDisplayName());
        }
        
        if (request.getDescription() != null) {
            entity.setDescription(request.getDescription());
        }
        
        if (request.getSortOrder() != null) {
            entity.setSortOrder(request.getSortOrder());
        }
        
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
        
        if (request.getValidFrom() != null) {
            entity.setValidFrom(request.getValidFrom());
        }
        
        if (request.getValidTo() != null) {
            entity.setValidTo(request.getValidTo());
        }
        
        if (request.getMetadata() != null) {
            entity.setMetadata(convertMapToJsonString(request.getMetadata()));
        }
        
        entity.setUpdatedBy(request.getUpdatedBy());
    }
    
    /**
     * Create a simple DTO for dropdown usage (minimal fields)
     */
    public CodeListDto toSimpleDto(CodeListEntity entity) {
        if (entity == null) {
            return null;
        }
        
        CodeListDto dto = new CodeListDto();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setDisplayName(entity.getDisplayName());
        dto.setDescription(entity.getDescription());
        dto.setSortOrder(entity.getSortOrder());
        dto.setMetadata(convertJsonStringToMap(entity.getMetadata()));
        
        return dto;
    }
    
    /**
     * Convert list of entities to simple DTOs
     */
    public List<CodeListDto> toSimpleDtoList(List<CodeListEntity> entities) {
        return entities.stream()
                .map(this::toSimpleDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert JSON string to Map
     */
    private Map<String, Object> convertJsonStringToMap(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return new HashMap<>();
        }
        
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonString);
            @SuppressWarnings("unchecked")
            Map<String, Object> result = objectMapper.convertValue(jsonNode, Map.class);
            return result;
        } catch (JsonProcessingException e) {
            // Return empty map if JSON parsing fails
            return new HashMap<>();
        }
    }
    
    /**
     * Convert Map to JSON string
     */
    private String convertMapToJsonString(Map<String, Object> map) {
        if (map == null || map.isEmpty()) {
            return null;
        }
        
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            // Return null if JSON serialization fails
            return null;
        }
    }
    
    /**
     * Create a DTO with hierarchical parent information
     */
    public CodeListDto toDtoWithParent(CodeListEntity entity, CodeListEntity parentEntity) {
        CodeListDto dto = toDto(entity);
        if (dto != null && parentEntity != null) {
            dto.setParentCode(toSimpleDto(parentEntity));
        }
        return dto;
    }
}