package com.clinprecision.adminservice.service.impl;


import com.clinprecision.adminservice.repository.UsersRepository;
import com.clinprecision.adminservice.repository.UserTypeRepository;
import com.clinprecision.adminservice.service.UserAssignmentService;
import com.clinprecision.common.entity.UserEntity;
import com.clinprecision.common.entity.UserTypeEntity;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserAssignmentServiceImpl implements UserAssignmentService {

    @Autowired
    private UsersRepository usersRepository;
    
    @Autowired
    private UserTypeRepository userTypeRepository;
    
    @Override
    public List<Long> getUserTypeIds(String userId) {
        UserEntity user = usersRepository.findByUserId(userId);
        if (user == null) {
            throw new EntityNotFoundException("User with ID: " + userId + " not found");
        }
        
        return user.getUserTypes().stream()
                .map(UserTypeEntity::getId)
                .collect(Collectors.toList());
    }
    
    @Override
    public void assignUserType(String userId, Long typeId) {
        UserEntity user = usersRepository.findByUserId(userId);
        if (user == null) {
            throw new EntityNotFoundException("User with ID: " + userId + " not found");
        }
        
        Optional<UserTypeEntity> userTypeOptional = userTypeRepository.findById(typeId);
        if (!userTypeOptional.isPresent()) {
            throw new EntityNotFoundException("User type with ID: " + typeId + " not found");
        }
        
        UserTypeEntity userType = userTypeOptional.get();
        
        // Check if the user already has this user type
        if (user.getUserTypes().stream().anyMatch(type -> type.getId().equals(typeId))) {
            return; // User already has this type, no need to add it again
        }
        
        user.getUserTypes().add(userType);
        usersRepository.save(user);
    }
    
    @Override
    public void removeUserType(String userId, Long typeId) {
        UserEntity user = usersRepository.findByUserId(userId);
        if (user == null) {
            throw new EntityNotFoundException("User with ID: " + userId + " not found");
        }
        
        Optional<UserTypeEntity> userTypeOptional = userTypeRepository.findById(typeId);
        if (!userTypeOptional.isPresent()) {
            throw new EntityNotFoundException("User type with ID: " + typeId + " not found");
        }
        
        // Remove the user type if the user has it
        user.getUserTypes().removeIf(type -> type.getId().equals(typeId));
        usersRepository.save(user);
    }
}
