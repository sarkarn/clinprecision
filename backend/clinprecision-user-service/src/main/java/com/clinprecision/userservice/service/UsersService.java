package com.clinprecision.userservice.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import com.clinprecision.userservice.ui.model.UserDto;

import java.util.List;


public interface UsersService extends UserDetailsService{
	UserDto createUser(UserDto userDetails);
	UserDto getUserDetailsByEmail(String email);
	UserDto getUserByUserId(String userId, String authorization);
	List<UserDto> getAllUsers();
	UserDto updateUser(String userId, UserDto userDetails, String authorization);
	List<Long> getUserTypeIds(String userId);
}
