package com.clinprecision.userservice.service.impl;

import com.clinprecision.userservice.data.UserEntity;
import com.clinprecision.userservice.data.UserTypeEntity;
import com.clinprecision.userservice.data.UsersRepository;
import com.clinprecision.userservice.repository.UserTypeRepository;
import com.clinprecision.userservice.service.UserAssignmentService;
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
