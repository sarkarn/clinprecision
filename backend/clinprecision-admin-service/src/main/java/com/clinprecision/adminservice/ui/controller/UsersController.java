package com.clinprecision.adminservice.ui.controller;

 import com.clinprecision.adminservice.service.UsersService;
 import com.clinprecision.common.dto.AuthUserDto;
 import com.clinprecision.common.dto.UserDto;
 import com.clinprecision.common.dto.UserTypeDto;
 import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
 import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinprecision.adminservice.ui.model.CreateUserRequestModel;
import com.clinprecision.adminservice.ui.model.CreateUserResponseModel;
 import com.clinprecision.adminservice.ui.model.UserResponseModel;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/users")
public class UsersController {
	
	@Autowired
	private Environment env;
	
	@Autowired
    UsersService usersService;


	@PostMapping(
			consumes = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE },
			produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE }
			)
	public ResponseEntity<CreateUserResponseModel> createUser(@RequestBody CreateUserRequestModel userDetails)
	{
        // Manually map from CreateUserRequestModel to UserDto
        UserDto userDto = new UserDto();
        userDto.setFirstName(userDetails.getFirstName());
        userDto.setLastName(userDetails.getLastName());
        userDto.setEmail(userDetails.getEmail());
        userDto.setPassword(userDetails.getPassword());
        // Set organizationId if provided
        userDto.setOrganizationId(userDetails.getOrganizationId());
        // Set roleIds if provided
        if (userDetails.getRoleIds() != null) {
            userDto.setRoleIds(new java.util.HashSet<>(userDetails.getRoleIds()));
        }

        UserDto createdUser = usersService.createUser(userDto);

        // Manually map from UserDto to CreateUserResponseModel
        CreateUserResponseModel returnValue = new CreateUserResponseModel();
        returnValue.setFirstName(createdUser.getFirstName());
        returnValue.setLastName(createdUser.getLastName());
        returnValue.setEmail(createdUser.getEmail());
        returnValue.setUserId(createdUser.getUserId());

        return ResponseEntity.status(HttpStatus.CREATED).body(returnValue);
	}
	
    @GetMapping(value="/{userId}", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN') or hasRole('DB_ADMIN') or principal == #userId")
    public ResponseEntity<UserResponseModel> getUser(@PathVariable("userId") String userId, 
    		@RequestHeader("Authorization") String authorization) {
       
        UserDto userDto = usersService.getUserByUserId(userId, authorization); 
        
        // Manually map from UserDto to UserResponseModel
        UserResponseModel returnValue = new UserResponseModel();
        returnValue.setFirstName(userDto.getFirstName());
        returnValue.setLastName(userDto.getLastName());
        returnValue.setEmail(userDto.getEmail());
        returnValue.setUserId(userDto.getUserId());
        
        // Get the user types for this user
        try {
            List<Long> userTypeIds = usersService.getUserTypeIds(userId);
            returnValue.setUserTypes(userTypeIds);
        } catch (Exception e) {
            // If there's an error getting user types, just set an empty list
            returnValue.setUserTypes(new ArrayList<>());
            // Log the error
            System.err.println("Error fetching user types for user " + userId + ": " + e.getMessage());
        }
        
        return ResponseEntity.status(HttpStatus.OK).body(returnValue);
    }
    
    @GetMapping(produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    // Removed PreAuthorize annotation to allow public access
    public ResponseEntity<List<UserResponseModel>> getAllUsers() {
        List<UserDto> userDtos = usersService.getAllUsers();
        
        List<UserResponseModel> returnValue = new ArrayList<>();
        for(UserDto userDto : userDtos) {
            UserResponseModel userResponseModel = new UserResponseModel();
            userResponseModel.setFirstName(userDto.getFirstName());
            userResponseModel.setLastName(userDto.getLastName());
            userResponseModel.setEmail(userDto.getEmail());
            userResponseModel.setUserId(userDto.getUserId());
            
            // Get the user types for this user
            try {
                List<Long> userTypeIds = usersService.getUserTypeIds(userDto.getUserId());
                userResponseModel.setUserTypes(userTypeIds);
            } catch (Exception e) {
                // If there's an error getting user types, just set an empty list
                userResponseModel.setUserTypes(new ArrayList<>());
                // Log the error
                System.err.println("Error fetching user types for user " + userDto.getUserId() + ": " + e.getMessage());
            }
            
            returnValue.add(userResponseModel);
        }
        
        return ResponseEntity.status(HttpStatus.OK).body(returnValue);
    }
    
    @org.springframework.web.bind.annotation.PutMapping(
            value="/{userId}",
            consumes = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE },
            produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE }
    )
    //@PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN') or hasAuthority('MANAGE_USER') or principal == #userId")
    public ResponseEntity<UserResponseModel> updateUser(
            @PathVariable("userId") String userId,
            @RequestBody CreateUserRequestModel userDetails,
            @RequestHeader("Authorization") String authorization) {
        
        // Manually map from CreateUserRequestModel to UserDto
        UserDto userDto = new UserDto();
        userDto.setFirstName(userDetails.getFirstName());
        userDto.setLastName(userDetails.getLastName());
        userDto.setEmail(userDetails.getEmail());
        // Only set password if it's provided and not empty
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            userDto.setPassword(userDetails.getPassword());
        }
        
        // Set user types if provided
        if (userDetails.getUserTypeIds() != null && !userDetails.getUserTypeIds().isEmpty()) {
            for (Long typeId : userDetails.getUserTypeIds()) {
                UserTypeDto userTypeDto = new UserTypeDto();
                userTypeDto.setId(typeId);
                userDto.getUserTypes().add(userTypeDto);
            }
        }
        
        UserDto updatedUser = usersService.updateUser(userId, userDto, authorization);
        
        // Manually map from UserDto to UserResponseModel
        UserResponseModel returnValue = new UserResponseModel();
        returnValue.setFirstName(updatedUser.getFirstName());
        returnValue.setLastName(updatedUser.getLastName());
        returnValue.setEmail(updatedUser.getEmail());
        returnValue.setUserId(updatedUser.getUserId());
        
        // Get the user types for this user
        try {
            List<Long> userTypeIds = usersService.getUserTypeIds(userId);
            returnValue.setUserTypes(userTypeIds);
        } catch (Exception e) {
            // If there's an error getting user types, just set an empty list
            returnValue.setUserTypes(new ArrayList<>());
            // Log the error
            System.err.println("Error fetching user types for user " + userId + ": " + e.getMessage());
        }
        
        return ResponseEntity.status(HttpStatus.OK).body(returnValue);
    }
    
  //  @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN') or hasAuthority('MANAGE_USER') or principal == #userId")
    @DeleteMapping("/{userId}")
    public String deleteUser(@PathVariable("userId") String userId) {
    	
    	// Delete user logic here
    	
    	return "Deleting user with id " + userId;
    }
    
    @GetMapping(value="/{userId}/role", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<String> getUserRole(@PathVariable("userId") Long userId) {
        String role = usersService.getUserRole(userId);
        return ResponseEntity.status(HttpStatus.OK).body(role);
    }
    
    @GetMapping(value="/by-email/{email}", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<UserDto> getUserDetailsByEmail(@PathVariable("email") String email) {
        UserDto userDto = usersService.getUserDetailsByEmail(email);
        return ResponseEntity.status(HttpStatus.OK).body(userDto);
    }
    
    @GetMapping(value="/auth/{email}", produces = { MediaType.APPLICATION_XML_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<AuthUserDto> loadUserByUsername(@PathVariable("email") String email) {
        org.springframework.security.core.userdetails.UserDetails userDetails = usersService.loadUserByUsername(email);
        
        if (userDetails == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Convert UserDetails to AuthUserDto
        AuthUserDto authUserDto = new AuthUserDto();
        authUserDto.setUsername(userDetails.getUsername());
        authUserDto.setPassword(userDetails.getPassword());
        authUserDto.setEnabled(userDetails.isEnabled());
        authUserDto.setAccountNonExpired(userDetails.isAccountNonExpired());
        authUserDto.setAccountNonLocked(userDetails.isAccountNonLocked());
        authUserDto.setCredentialsNonExpired(userDetails.isCredentialsNonExpired());
        
        // Convert authorities to List<String>
        java.util.List<String> authorities = userDetails.getAuthorities().stream()
            .map(authority -> authority.getAuthority())
            .collect(java.util.stream.Collectors.toList());
        authUserDto.setAuthorities(authorities);
        
        return ResponseEntity.status(HttpStatus.OK).body(authUserDto);
    }
	
	
}
