package com.clinprecision.userservice.ui.model;


import com.clinprecision.common.entity.UserTypeEntity;

/**
 * Request model for creating or updating a user type
 */
public class UserTypeRequestModel {
    private String name;
    private String description;
    private String code;
    private UserTypeEntity.UserCategory category;
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getCode() {
        return code;
    }
    
    public void setCode(String code) {
        this.code = code;
    }
    
    public UserTypeEntity.UserCategory getCategory() {
        return category;
    }
    
    public void setCategory(UserTypeEntity.UserCategory category) {
        this.category = category;
    }
}
