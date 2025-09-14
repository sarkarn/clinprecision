package com.clinprecision.adminservice.ui.controllers;


import com.clinprecision.adminservice.service.UserTypeService;
import com.clinprecision.adminservice.ui.model.UserTypeRequestModel;
import com.clinprecision.adminservice.ui.model.UserTypeResponseModel;

import com.clinprecision.common.dto.UserTypeDto;
import com.clinprecision.common.entity.UserTypeEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/usertypes")
public class UserTypeController {

    @Autowired
    private UserTypeService userTypeService;

    /**
     * Get all user types
     * @return List of user types
     */
    @GetMapping(produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<List<UserTypeResponseModel>> getAllUserTypes() {
        List<UserTypeDto> userTypeDtos = userTypeService.getAllUserTypes();
        List<UserTypeResponseModel> responseList = new ArrayList<>();
        
        for(UserTypeDto userTypeDto : userTypeDtos) {
            UserTypeResponseModel model = new UserTypeResponseModel();
            model.setId(userTypeDto.getId());
            model.setName(userTypeDto.getName());
            model.setDescription(userTypeDto.getDescription());
            model.setCode(userTypeDto.getCode());
            model.setCategory(userTypeDto.getCategory());
            responseList.add(model);
        }
        
        return ResponseEntity.status(HttpStatus.OK).body(responseList);
    }

    /**
     * Get user type by ID
     * @param id User type ID
     * @return User type details
     */
    @GetMapping(value = "/{id}", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<UserTypeResponseModel> getUserTypeById(@PathVariable("id") Long id) {
        UserTypeDto userTypeDto = userTypeService.getUserTypeById(id);
        
        UserTypeResponseModel responseModel = new UserTypeResponseModel();
        responseModel.setId(userTypeDto.getId());
        responseModel.setName(userTypeDto.getName());
        responseModel.setDescription(userTypeDto.getDescription());
        responseModel.setCode(userTypeDto.getCode());
        responseModel.setCategory(userTypeDto.getCategory());
        
        return ResponseEntity.status(HttpStatus.OK).body(responseModel);
    }

    /**
     * Create a new user type
     * @param userTypeDetails User type details
     * @return Created user type
     */
    @PostMapping(
            consumes = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE },
            produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE }
    )
   // @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<UserTypeResponseModel> createUserType(@RequestBody UserTypeRequestModel userTypeDetails) {
        UserTypeDto userTypeDto = new UserTypeDto();
        userTypeDto.setName(userTypeDetails.getName());
        userTypeDto.setDescription(userTypeDetails.getDescription());
        
        // Set default code if not provided
        String code = userTypeDetails.getCode();
        if (code == null || code.isEmpty()) {
            code = userTypeDetails.getName().toUpperCase().replaceAll("\\s+", "_");
        }
        userTypeDto.setCode(code);
        
        // Set default category if not provided
        UserTypeEntity.UserCategory category = userTypeDetails.getCategory();
        if (category == null) {
            category = UserTypeEntity.UserCategory.SYSTEM_USER;
        }
        userTypeDto.setCategory(category);
        
        UserTypeDto createdUserType = userTypeService.createUserType(userTypeDto);
        
        UserTypeResponseModel responseModel = new UserTypeResponseModel();
        responseModel.setId(createdUserType.getId());
        responseModel.setName(createdUserType.getName());
        responseModel.setDescription(createdUserType.getDescription());
        responseModel.setCode(createdUserType.getCode());
        responseModel.setCategory(createdUserType.getCategory());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(responseModel);
    }

    /**
     * Update an existing user type
     * @param id User type ID
     * @param userTypeDetails Updated user type details
     * @return Updated user type
     */
    @PutMapping(
            value = "/{id}",
            consumes = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE },
            produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE }
    )
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<UserTypeResponseModel> updateUserType(
            @PathVariable("id") Long id,
            @RequestBody UserTypeRequestModel userTypeDetails) {
        
        UserTypeDto userTypeDto = new UserTypeDto();
        userTypeDto.setName(userTypeDetails.getName());
        userTypeDto.setDescription(userTypeDetails.getDescription());
        userTypeDto.setCode(userTypeDetails.getCode());
        userTypeDto.setCategory(userTypeDetails.getCategory());
        
        UserTypeDto updatedUserType = userTypeService.updateUserType(id, userTypeDto);
        
        UserTypeResponseModel responseModel = new UserTypeResponseModel();
        responseModel.setId(updatedUserType.getId());
        responseModel.setName(updatedUserType.getName());
        responseModel.setDescription(updatedUserType.getDescription());
        responseModel.setCode(updatedUserType.getCode());
        responseModel.setCategory(updatedUserType.getCategory());
        
        return ResponseEntity.status(HttpStatus.OK).body(responseModel);
    }

    /**
     * Delete a user type
     * @param id User type ID
     * @return Deletion confirmation
     */
    @DeleteMapping("/{id}")
   // @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<String> deleteUserType(@PathVariable("id") Long id) {
        userTypeService.deleteUserType(id);
        return ResponseEntity.status(HttpStatus.OK).body("User type with ID: " + id + " deleted successfully");
    }

    /**
     * Get user types by category
     * @param category User type category
     * @return List of user types in the specified category
     */
    @GetMapping(value = "/category/{category}", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<List<UserTypeResponseModel>> getUserTypesByCategory(@PathVariable("category") String category) {
        UserTypeEntity.UserCategory userCategory;
        try {
            userCategory = UserTypeEntity.UserCategory.valueOf(category.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        
        List<UserTypeDto> userTypeDtos = userTypeService.getUserTypesByCategory(userCategory);
        List<UserTypeResponseModel> responseList = new ArrayList<>();
        
        for(UserTypeDto userTypeDto : userTypeDtos) {
            UserTypeResponseModel model = new UserTypeResponseModel();
            model.setId(userTypeDto.getId());
            model.setName(userTypeDto.getName());
            model.setDescription(userTypeDto.getDescription());
            model.setCode(userTypeDto.getCode());
            model.setCategory(userTypeDto.getCategory());
            responseList.add(model);
        }
        
        return ResponseEntity.status(HttpStatus.OK).body(responseList);
    }
}
