package com.clinprecision.userservice.service;

import com.clinprecision.common.dto.UserDto;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;


public interface UsersService extends UserDetailsService{
	UserDto createUser(UserDto userDetails);
	UserDto getUserDetailsByEmail(String email);
	UserDto getUserByUserId(String userId, String authorization);
	List<UserDto> getAllUsers();
	UserDto updateUser(String userId, UserDto userDetails, String authorization);
	List<Long> getUserTypeIds(String userId);
	String getUserRole(Long userId);
}
