package com.clinprecision.userservice.service;

import java.util.Optional;
import java.util.Collection;
import java.util.stream.Collectors;

import com.clinprecision.common.dto.AuthUserDto;
import com.clinprecision.common.dto.UserDto;
import com.clinprecision.common.dto.UserStudyRoleDto;
import com.clinprecision.userservice.client.AdminUsersServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class UsersServiceImpl implements UsersService {
	

    AdminUsersServiceClient adminUsersServiceClient;
    BCryptPasswordEncoder bCryptPasswordEncoder;
    Environment environment;
	
	Logger logger = LoggerFactory.getLogger(this.getClass());
	
	@Autowired
    public UsersServiceImpl(AdminUsersServiceClient adminUsersServiceClient,
            BCryptPasswordEncoder bCryptPasswordEncoder,
            Environment environment) {
        this.adminUsersServiceClient = adminUsersServiceClient;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.environment = environment;
    }

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		ResponseEntity<AuthUserDto> response = adminUsersServiceClient.loadUserByUsername(username);
		
		if(response == null || response.getBody() == null) {
			throw new UsernameNotFoundException("User not found: " + username);
		}
		
		AuthUserDto authUserDto = response.getBody();
		
		if (authUserDto == null || authUserDto.getAuthorities() == null) {
			throw new UsernameNotFoundException("Invalid user data for: " + username);
		}
		
		// Convert AuthUserDto to UserDetails using Spring Security's User class
		Collection<SimpleGrantedAuthority> authorities = authUserDto.getAuthorities().stream()
			.map(SimpleGrantedAuthority::new)
			.collect(Collectors.toList());
			
		return new User(
			authUserDto.getUsername(),
			authUserDto.getPassword(),
			authUserDto.isEnabled(),
			authUserDto.isAccountNonExpired(),
			authUserDto.isCredentialsNonExpired(),
			authUserDto.isAccountNonLocked(),
			authorities
		);
	}

	@Override
	public UserDto getUserDetailsByEmail(String email) {
		ResponseEntity<UserDto> response = adminUsersServiceClient.getUserDetailsByEmail(email);
		
		if(response == null || response.getBody() == null) {
			throw new UsernameNotFoundException(email);
		}
		
		return response.getBody();
	}
	
	@Override
	public String getUserRole(Long userId) {
	    logger.debug("Determining role for user ID: {}", userId);
	    
	    try {
	        // Step 1: Check user_study_roles for active study-specific roles via Admin Service
	        // Get the highest priority active study role
        ResponseEntity<Optional<UserStudyRoleDto>> response = 
                adminUsersServiceClient.findHighestPriorityActiveRoleByUserId(userId);	        if (response != null && response.getStatusCode().is2xxSuccessful()) {
	            Optional<UserStudyRoleDto> roleOptional = response.getBody();
	            if (roleOptional != null && roleOptional.isPresent()) {
	                UserStudyRoleDto highestStudyRole = roleOptional.get();
	                
	                // Verify the role is active and within date range
	                if (highestStudyRole.isActive() && highestStudyRole.isWithinDateRange()) {
	                    String studyRoleName = highestStudyRole.getRoleName();
	                    logger.debug("Found active study role: {} for user ID: {}", studyRoleName, userId);
	                    return studyRoleName;
	                }
	            }
	        }
	    } catch (Exception ex) {
	        logger.warn("Failed to retrieve study role from Admin Service for user ID: {}. Error: {}", 
	                   userId, ex.getMessage());
	        // Continue to fallback logic below
	    }
	    
    // Step 2: If no study role or service unavailable, get role from Admin Service
    try {
        ResponseEntity<String> roleResponse = adminUsersServiceClient.getUserRole(userId);
        if (roleResponse != null && roleResponse.getStatusCode().is2xxSuccessful() && 
            roleResponse.getBody() != null) {
            String generalRole = roleResponse.getBody();
            logger.debug("Found general system role: {} for user ID: {}", generalRole, userId);
            return generalRole;
        }
    } catch (Exception ex) {
        logger.warn("Failed to retrieve general role from Admin Service for user ID: {}. Error: {}", 
                   userId, ex.getMessage());
    }
    
    // Step 3: Fall back to default role
    logger.debug("No specific role found for user ID: {}, using default: SITE_USER", userId);
    return "SITE_USER";
}

}