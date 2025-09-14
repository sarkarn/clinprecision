package com.clinprecision.adminservice.service;

import java.util.List;

/**
 * Service for managing user type assignments
 */
public interface UserAssignmentService {

    /**
     * Get all user type IDs assigned to a user
     * @param userId User ID
     * @return List of user type IDs
     */
    List<Long> getUserTypeIds(String userId);
    
    /**
     * Assign a user type to a user
     * @param userId User ID
     * @param typeId User type ID
     */
    void assignUserType(String userId, Long typeId);
    
    /**
     * Remove a user type from a user
     * @param userId User ID
     * @param typeId User type ID
     */
    void removeUserType(String userId, Long typeId);
}
