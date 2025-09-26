package com.clinprecision.userservice.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;

import com.clinprecision.common.dto.UserDto;
import com.clinprecision.common.entity.AuthorityEntity;
import com.clinprecision.common.entity.RoleEntity;
import com.clinprecision.common.entity.UserEntity;
import com.clinprecision.common.entity.UserStudyRoleEntity;
import com.clinprecision.userservice.repository.RoleRepository;
import com.clinprecision.userservice.repository.UsersRepository;
import com.clinprecision.userservice.repository.UserStudyRoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;


@Service
public class UsersServiceImpl implements UsersService {
	

    UsersRepository usersRepository;
    RoleRepository roleRepository;
    UserStudyRoleRepository userStudyRoleRepository;
    BCryptPasswordEncoder bCryptPasswordEncoder;
    Environment environment;
	
	Logger logger = LoggerFactory.getLogger(this.getClass());
	
	@Autowired
    public UsersServiceImpl(UsersRepository usersRepository, 
            RoleRepository roleRepository,
            UserStudyRoleRepository userStudyRoleRepository,
            BCryptPasswordEncoder bCryptPasswordEncoder,
            Environment environment) {
        this.usersRepository = usersRepository;
        this.roleRepository = roleRepository;
        this.userStudyRoleRepository = userStudyRoleRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.environment = environment;
    }

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		UserEntity userEntity = usersRepository.findByEmail(username);
		
		if(userEntity == null) throw new UsernameNotFoundException(username);	
		
		Collection<GrantedAuthority> authorities = new ArrayList<>();
		Collection<RoleEntity> roles = userEntity.getRoles();
		
		roles.forEach((role) -> {
			authorities.add(new SimpleGrantedAuthority(role.getName()));
			
			Collection<AuthorityEntity> authorityEntities = role.getAuthorities();
			authorityEntities.forEach((authorityEntity) -> {
				authorities.add(new SimpleGrantedAuthority(authorityEntity.getName()));
			});
		});
		
		return new User(userEntity.getEmail(), 
				userEntity.getEncryptedPassword(), 
				true, true, true, true, 
				authorities);
	}

	@Override
	public UserDto getUserDetailsByEmail(String email) {
		UserEntity userEntity = usersRepository.findByEmail(email);
		
		if(userEntity == null) throw new UsernameNotFoundException(email);
		
		// Create DTO and manually map the fields to avoid collection mapping issues
		UserDto userDto = new UserDto();
		userDto.setId(userEntity.getId());
		userDto.setUserId(userEntity.getUserId());
		userDto.setFirstName(userEntity.getFirstName());
		userDto.setMiddleName(userEntity.getMiddleName());
		userDto.setLastName(userEntity.getLastName());
		userDto.setEmail(userEntity.getEmail());
		userDto.setTitle(userEntity.getTitle());
		userDto.setProfession(userEntity.getProfession());
		userDto.setPhone(userEntity.getPhone());
		userDto.setMobilePhone(userEntity.getMobilePhone());
		userDto.setAddressLine1(userEntity.getAddressLine1());
		userDto.setAddressLine2(userEntity.getAddressLine2());
		userDto.setCity(userEntity.getCity());
		userDto.setState(userEntity.getState());
		userDto.setPostalCode(userEntity.getPostalCode());
		userDto.setCountry(userEntity.getCountry());
		userDto.setStatus(userEntity.getStatus());
		userDto.setLastLoginAt(userEntity.getLastLoginAt());
		userDto.setPasswordResetRequired(userEntity.isPasswordResetRequired());
		userDto.setNotes(userEntity.getNotes());
		userDto.setCreatedAt(userEntity.getCreatedAt());
		userDto.setUpdatedAt(userEntity.getUpdatedAt());
		userDto.setEncryptedPassword(userEntity.getEncryptedPassword());
		
		// Don't try to map userTypes collection - leave it as an empty set
		
		return userDto;
	}
	
	@Override
	public String getUserRole(Long userId) {
	    logger.debug("Determining role for user ID: {}", userId);
	    
	    // Step 1: Check user_study_roles for active study-specific roles
	    // Get the highest priority active study role
	    Optional<UserStudyRoleEntity> highestStudyRole = userStudyRoleRepository.findHighestPriorityActiveRoleByUserId(userId);
	    
	    if (highestStudyRole.isPresent()) {
	        String studyRoleName = highestStudyRole.get().getRole().getName();
	        logger.debug("Found active study role: {} for user ID: {}", studyRoleName, userId);
	        return studyRoleName;
	    }
	    
	    // Step 2: If no study role, check users_roles for general system roles
	    UserEntity userEntity = usersRepository.findById(userId).orElse(null);
	    if (userEntity != null && userEntity.getRoles() != null && !userEntity.getRoles().isEmpty()) {
	        // Get the highest priority general role
	        String generalRole = getHighestPriorityGeneralRole(userEntity.getRoles());
	        if (generalRole != null) {
	            logger.debug("Found general system role: {} for user ID: {}", generalRole, userId);
	            return generalRole;
	        }
	    }
	    
	    // Step 3: Fall back to default role
	    logger.debug("No specific role found for user ID: {}, using default: SITE_USER", userId);
	    return "SITE_USER";
	}
	
	/**
	 * Determines the highest priority role from a collection of general roles.
	 * Priority order: SYSTEM_ADMIN > PRINCIPAL_INVESTIGATOR > STUDY_COORDINATOR > DATA_MANAGER > CRA > MEDICAL_CODER > AUDITOR > SITE_USER
	 * 
	 * @param roles Collection of role entities
	 * @return The highest priority role name, or null if no recognized roles found
	 */
	private String getHighestPriorityGeneralRole(Collection<RoleEntity> roles) {
	    String[] priorityOrder = {
	        "SYSTEM_ADMIN", 
	        "PRINCIPAL_INVESTIGATOR", 
	        "STUDY_COORDINATOR", 
	        "DATA_MANAGER", 
	        "CRA", 
	        "MEDICAL_CODER", 
	        "AUDITOR", 
	        "SITE_USER"
	    };
	    
	    for (String priorityRole : priorityOrder) {
	        for (RoleEntity role : roles) {
	            if (priorityRole.equals(role.getName())) {
	                return priorityRole;
	            }
	        }
	    }
	    
	    // If no priority role found, return the first role's name
	    return roles.iterator().next().getName();
	}
}
