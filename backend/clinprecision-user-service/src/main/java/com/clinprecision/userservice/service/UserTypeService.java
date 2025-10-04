package com.clinprecision.userservice.service;


import com.clinprecision.common.dto.UserTypeDto;
import com.clinprecision.common.entity.UserTypeEntity;

import java.util.List;

/**
 * Service interface for managing user types
 */
public interface UserTypeService {
    
    /**
     * Get all user types
     * @return List of all user types
     */
    List<UserTypeDto> getAllUserTypes();
    
    /**
     * Get user type by ID
     * @param id User type ID
     * @return User type with the specified ID
     */
    UserTypeDto getUserTypeById(Long id);
    
    /**
     * Create a new user type
     * @param userTypeDto User type data
     * @return Created user type
     */
    UserTypeDto createUserType(UserTypeDto userTypeDto);
    
    /**
     * Update an existing user type
     * @param id User type ID
     * @param userTypeDto Updated user type data
     * @return Updated user type
     */
    UserTypeDto updateUserType(Long id, UserTypeDto userTypeDto);
    
    /**
     * Delete a user type
     * @param id User type ID
     */
    void deleteUserType(Long id);
    
    /**
     * Get user types by category
     * @param category User type category
     * @return List of user types with the specified category
     */
    List<UserTypeDto> getUserTypesByCategory(UserTypeEntity.UserCategory category);
    
    /**
     * Get user type by name
     * @param name User type name
     * @return User type with the specified name
     */
    UserTypeDto getUserTypeByName(String name);
    
    /**
     * Get user type by code
     * @param code User type code
     * @return User type with the specified code
     */
    UserTypeDto getUserTypeByCode(String code);
}
