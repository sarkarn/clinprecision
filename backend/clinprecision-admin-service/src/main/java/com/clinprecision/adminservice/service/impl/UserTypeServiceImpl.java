package com.clinprecision.adminservice.service.impl;

import com.clinprecision.adminservice.repository.UserTypeRepository;
import com.clinprecision.adminservice.service.UserTypeService;

import com.clinprecision.common.entity.UserTypeEntity;
import com.clinprecision.common.dto.UserTypeDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UserTypeServiceImpl implements UserTypeService {

    @Autowired
    private UserTypeRepository userTypeRepository;

    @Override
    public List<UserTypeDto> getAllUserTypes() {
        List<UserTypeEntity> userTypes = userTypeRepository.findAll();
        List<UserTypeDto> returnValue = new ArrayList<>();
        
        for (UserTypeEntity userType : userTypes) {
            returnValue.add(convertEntityToDto(userType));
        }
        
        return returnValue;
    }

    @Override
    public UserTypeDto getUserTypeById(Long id) {
        Optional<UserTypeEntity> userTypeOptional = userTypeRepository.findById(id);
        if (userTypeOptional.isPresent()) {
            return convertEntityToDto(userTypeOptional.get());
        } else {
            throw new EntityNotFoundException("User type with ID: " + id + " not found");
        }
    }

    @Override
    public UserTypeDto createUserType(UserTypeDto userTypeDto) {
        UserTypeEntity userTypeEntity = new UserTypeEntity();
        userTypeEntity.setName(userTypeDto.getName());
        userTypeEntity.setDescription(userTypeDto.getDescription());
        userTypeEntity.setCode(userTypeDto.getCode());
        userTypeEntity.setCategory(userTypeDto.getCategory());
        
        UserTypeEntity savedUserType = userTypeRepository.save(userTypeEntity);
        
        return convertEntityToDto(savedUserType);
    }

    @Override
    public UserTypeDto updateUserType(Long id, UserTypeDto userTypeDto) {
        Optional<UserTypeEntity> userTypeOptional = userTypeRepository.findById(id);
        if (userTypeOptional.isPresent()) {
            UserTypeEntity userTypeEntity = userTypeOptional.get();
            userTypeEntity.setName(userTypeDto.getName());
            userTypeEntity.setDescription(userTypeDto.getDescription());
            userTypeEntity.setCode(userTypeDto.getCode());
            userTypeEntity.setCategory(userTypeDto.getCategory());
            userTypeEntity.setUpdatedAt(LocalDateTime.now());
            
            UserTypeEntity updatedUserType = userTypeRepository.save(userTypeEntity);
            
            return convertEntityToDto(updatedUserType);
        } else {
            throw new EntityNotFoundException("User type with ID: " + id + " not found");
        }
    }

    @Override
    public void deleteUserType(Long id) {
        Optional<UserTypeEntity> userTypeOptional = userTypeRepository.findById(id);
        if (userTypeOptional.isPresent()) {
            userTypeRepository.deleteById(id);
        } else {
            throw new EntityNotFoundException("User type with ID: " + id + " not found");
        }
    }

    @Override
    public List<UserTypeDto> getUserTypesByCategory(UserTypeEntity.UserCategory category) {
        List<UserTypeEntity> userTypes = userTypeRepository.findByCategory(category);
        List<UserTypeDto> returnValue = new ArrayList<>();
        
        for (UserTypeEntity userType : userTypes) {
            returnValue.add(convertEntityToDto(userType));
        }
        
        return returnValue;
    }

    @Override
    public UserTypeDto getUserTypeByName(String name) {
        Optional<UserTypeEntity> userTypeOptional = userTypeRepository.findByName(name);
        if (userTypeOptional.isPresent()) {
            return convertEntityToDto(userTypeOptional.get());
        } else {
            throw new EntityNotFoundException("User type with name: " + name + " not found");
        }
    }

    @Override
    public UserTypeDto getUserTypeByCode(String code) {
        Optional<UserTypeEntity> userTypeOptional = userTypeRepository.findByCode(code);
        if (userTypeOptional.isPresent()) {
            return convertEntityToDto(userTypeOptional.get());
        } else {
            throw new EntityNotFoundException("User type with code: " + code + " not found");
        }
    }
    
    /**
     * Helper method to convert UserTypeEntity to UserTypeDto
     * @param userTypeEntity Entity to convert
     * @return Converted DTO
     */
    private UserTypeDto convertEntityToDto(UserTypeEntity userTypeEntity) {
        UserTypeDto userTypeDto = new UserTypeDto();
        userTypeDto.setId(userTypeEntity.getId());
        userTypeDto.setName(userTypeEntity.getName());
        userTypeDto.setDescription(userTypeEntity.getDescription());
        userTypeDto.setCode(userTypeEntity.getCode());
        userTypeDto.setCategory(userTypeEntity.getCategory());
        userTypeDto.setCreatedAt(userTypeEntity.getCreatedAt());
        userTypeDto.setUpdatedAt(userTypeEntity.getUpdatedAt());
        return userTypeDto;
    }
}
