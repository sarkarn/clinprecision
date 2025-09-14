package com.clinprecision.userservice.service;

import com.clinprecision.common.dto.UserDto;
import org.springframework.security.core.userdetails.UserDetailsService;


public interface UsersService extends UserDetailsService{
	UserDto getUserDetailsByEmail(String email);
}
