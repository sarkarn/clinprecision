package com.clinprecision.userservice.ui.controllers;

 import com.clinprecision.userservice.service.UsersService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
 import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinprecision.userservice.ui.model.CreateUserRequestModel;
import com.clinprecision.userservice.ui.model.CreateUserResponseModel;
import com.clinprecision.userservice.ui.model.UserDto;
import com.clinprecision.userservice.ui.model.UserResponseModel;

@RestController
@RequestMapping("/users")
public class UsersController {
	
	@Autowired
	private Environment env;
	
	@Autowired
    UsersService usersService;

	@GetMapping("/status/check")
	public String status()
	{
		return "Working on port " + env.getProperty("local.server.port") + ", with token = " + env.getProperty("token.secret");
	}
 
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN') or hasRole('DB_ADMIN') or principal == #userId")
    public ResponseEntity<UserResponseModel> getUser(@PathVariable("userId") String userId, 
    		@RequestHeader("Authorization") String authorization) {
       
        UserDto userDto = usersService.getUserByUserId(userId, authorization); 
        
        // Manually map from UserDto to UserResponseModel
        UserResponseModel returnValue = new UserResponseModel();
        returnValue.setFirstName(userDto.getFirstName());
        returnValue.setLastName(userDto.getLastName());
        returnValue.setEmail(userDto.getEmail());
        returnValue.setUserId(userDto.getUserId());
        
        return ResponseEntity.status(HttpStatus.OK).body(returnValue);
    }
    
    @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM_ADMIN') or hasAuthority('MANAGE_USER') or principal == #userId")
    @DeleteMapping("/{userId}")
    public String deleteUser(@PathVariable("userId") String userId) {
    	
    	// Delete user logic here
    	
    	return "Deleting user with id " + userId;
    }
	
	
}
