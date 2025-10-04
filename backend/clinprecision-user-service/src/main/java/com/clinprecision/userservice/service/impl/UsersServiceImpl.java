package com.clinprecision.userservice.service.impl;


import com.clinprecision.common.dto.UserDto;
import com.clinprecision.common.dto.UserTypeDto;
import com.clinprecision.common.entity.RoleEntity;
import com.clinprecision.common.entity.UserEntity;
import com.clinprecision.common.entity.UserTypeEntity;
import com.clinprecision.userservice.repository.OrganizationRepository;
import com.clinprecision.userservice.repository.RoleRepository;
import com.clinprecision.userservice.repository.UserTypeRepository;
import com.clinprecision.userservice.repository.UsersRepository;
import com.clinprecision.userservice.service.UserStudyRoleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.clinprecision.userservice.service.UsersService;

import java.util.*;


@Service
public class UsersServiceImpl implements UsersService {
	

    UsersRepository usersRepository;
    BCryptPasswordEncoder bCryptPasswordEncoder;
    //RestTemplate restTemplate;
    Environment environment;
    UserTypeRepository userTypeRepository;
    RoleRepository roleRepository;
    UserStudyRoleService userStudyRoleService;
    OrganizationRepository organizationRepository;
	
	Logger logger = LoggerFactory.getLogger(this.getClass());
	
	@Autowired
    public UsersServiceImpl(UsersRepository usersRepository,
            BCryptPasswordEncoder bCryptPasswordEncoder,
            Environment environment,
            UserTypeRepository userTypeRepository,
            RoleRepository roleRepository,
                            OrganizationRepository organizationRepository,
            UserStudyRoleService userStudyRoleService) {
        this.usersRepository = usersRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.environment = environment;
        this.userTypeRepository = userTypeRepository;
        this.roleRepository = roleRepository;
        this.organizationRepository = organizationRepository;
        this.userStudyRoleService = userStudyRoleService;
    }
 
	@Override
	public UserDto createUser(UserDto userDetails) {
		userDetails.setUserId(UUID.randomUUID().toString());
		userDetails.setEncryptedPassword(bCryptPasswordEncoder.encode(userDetails.getPassword()));
		
		// Create entity and manually map fields
		UserEntity userEntity = new UserEntity();
		userEntity.setFirstName(userDetails.getFirstName());
		userEntity.setLastName(userDetails.getLastName());
		userEntity.setEmail(userDetails.getEmail());
		userEntity.setUserId(userDetails.getUserId());
		userEntity.setEncryptedPassword(userDetails.getEncryptedPassword());
		
        // Set organization if provided
        if (userDetails.getOrganizationId() != null) {
            organizationRepository.findById(userDetails.getOrganizationId()).ifPresent(userEntity::setOrganization);
        }

        // Set roles if provided
        if (userDetails.getRoleIds() != null && !userDetails.getRoleIds().isEmpty()) {
            Collection<RoleEntity> roles = new ArrayList<>();
            for (Long roleId : userDetails.getRoleIds()) {
                roleRepository.findById(roleId).ifPresent(roles::add);
            }
            userEntity.setRoles(roles);
        }

        // Save the entity
        userEntity = usersRepository.save(userEntity);

        // Map back to DTO (use mapper if available)
        UserDto returnValue = new UserDto();
        returnValue.setId(userEntity.getId());
        returnValue.setUserId(userEntity.getUserId());
        returnValue.setFirstName(userEntity.getFirstName());
        returnValue.setLastName(userEntity.getLastName());
        returnValue.setEmail(userEntity.getEmail());
        returnValue.setEncryptedPassword(userEntity.getEncryptedPassword());
        // Set organizationId and roleIds in return DTO
        if (userEntity.getOrganization() != null) {
            returnValue.setOrganizationId(userEntity.getOrganization().getId());
        }
        if (userEntity.getRoles() != null) {
            Set<Long> roleIds = new HashSet<>();
            for (RoleEntity role : userEntity.getRoles()) {
                roleIds.add(role.getId());
            }
            returnValue.setRoleIds(roleIds);
        }
        return returnValue;
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		try {
			UserEntity userEntity = usersRepository.findByEmailWithRoles(username);
			
			if (userEntity == null) {
				throw new UsernameNotFoundException("User not found: " + username);
			}
			
			// Check if user is active
			if (userEntity.getStatus() != UserEntity.UserStatus.active) {
				throw new UsernameNotFoundException("User account is not active: " + username);
			}
			
			// Load user's actual roles for authentication
			Collection<SimpleGrantedAuthority> authorities = loadUserAuthorities(userEntity.getId());
				
			User userDetails = new User(
				userEntity.getEmail(),
				userEntity.getEncryptedPassword(),
				true, // enabled
				true, // accountNonExpired
				true, // credentialsNonExpired - Always true for now; password reset is separate from expiration
				userEntity.getStatus() != UserEntity.UserStatus.locked, // accountNonLocked
				authorities
			);
			
			return userDetails;
			
		} catch (Exception ex) {
			logger.error("Error in loadUserByUsername: {}", ex.getMessage(), ex);
			throw ex;
		}
	}	

	@Override
	public UserDto getUserDetailsByEmail(String email) {
		
		try {
			logger.debug("Getting user details by email: {}", email);
			
			logger.info("Calling usersRepository.findByEmail({})", email);
			UserEntity userEntity = usersRepository.findByEmail(email);
			
			if (userEntity == null) {
				logger.error("User not found by email: {}", email);
				throw new UsernameNotFoundException("User not found: " + email);
			}
			
			logger.info("User found - ID: {}, UserId: {}, Name: {} {}", 
				userEntity.getId(), userEntity.getUserId(), 
				userEntity.getFirstName(), userEntity.getLastName());
			
			// Manual conversion from UserEntity to UserDto
			UserDto userDto = new UserDto();
			userDto.setId(userEntity.getId());
			userDto.setUserId(userEntity.getUserId());
			userDto.setFirstName(userEntity.getFirstName());
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
			
			logger.info("User details retrieved successfully for email: {}", email);
			logger.info("=== GET USER DETAILS SUCCESS ====");
			return userDto;
			
		} catch (Exception ex) {
			logger.error("=== GET USER DETAILS FAILED ==== Error: {}", ex.getMessage(), ex);
			throw ex;
		}
	}
	
	@Override
	public String getUserRole(Long userId) {
		logger.info("=== GET USER ROLE ====");
		logger.info("getUserRole called with userId: [{}]", userId);
		logger.info("Current thread: {}", Thread.currentThread().getName());
		
	    try {
	        // STEP 1: First check for study roles (priority)
	        logger.info("STEP 1: Checking for study roles for user ID: {}", userId);
	        var activeStudyRole = userStudyRoleService.findHighestPriorityActiveRoleByUserId(userId);
	        
	        if (activeStudyRole.isPresent()) {
	            String roleName = activeStudyRole.get().getRole().getName();
	            logger.info("Found active study role: {} for user ID: {}", roleName, userId);
	            logger.info("=== GET USER ROLE SUCCESS (Study Role) ====");
	            return roleName;
	        }
	        
	        logger.info("No active study roles found for user ID: {}, checking system roles", userId);
	        
	        // STEP 2: Fall back to system roles if no study roles
	        logger.info("STEP 2: Checking for system roles for user ID: {}", userId);
	        Optional<UserEntity> userOptional = usersRepository.findByIdWithRoles(userId);
	        if (userOptional.isPresent()) {
	            UserEntity userEntity = userOptional.get();
	            logger.info("User entity found, checking roles collection...");
	            
	            if (userEntity.getRoles() != null && !userEntity.getRoles().isEmpty()) {
	                logger.info("User has {} roles assigned", userEntity.getRoles().size());
	                userEntity.getRoles().forEach(role -> 
	                    logger.info("- Role: {} (System Role: {})", role.getName(), role.isSystemRole())
	                );
	                
	                // Get the highest priority general role
	                String generalRole = getHighestPriorityGeneralRole(userEntity.getRoles());
	                if (generalRole != null) {
	                    logger.info("Found general system role: {} for user ID: {}", generalRole, userId);
	                    logger.info("=== GET USER ROLE SUCCESS (System Role) ====");
	                    return generalRole;
	                } else {
	                    logger.warn("getHighestPriorityGeneralRole returned null for user ID: {}", userId);
	                }
	            } else {
	                logger.warn("User has no roles assigned or roles collection is empty for user ID: {}", userId);
	            }
	        } else {
	            logger.warn("User entity not found for user ID: {}", userId);
	        }
	        
	        // STEP 3: Fall back to default role if no roles found
	        logger.info("STEP 3: No system or study roles found for user ID: {}, using default: SITE_USER", userId);
	        logger.info("=== GET USER ROLE SUCCESS (Default Role) ====");
	        return "SITE_USER";
	        
	    } catch (Exception ex) {
	        logger.error("=== GET USER ROLE FAILED ==== Error for user ID: {}. Error: {}", userId, ex.getMessage(), ex);
	        return "SITE_USER"; // Default role on error
	    }
	}

	@Override
	public UserDto getUserByUserId(String userId, String authorization) {
		
        UserEntity userEntity = usersRepository.findByUserId(userId);     
        if(userEntity == null) throw new UsernameNotFoundException("User not found");
        
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
    public List<UserDto> getAllUsers() {
        List<UserDto> returnValue = new ArrayList<>();
        
        // Get all users from the repository
        Iterable<UserEntity> users = usersRepository.findAll();
        
        // Convert each entity to DTO
        for (UserEntity userEntity : users) {
            UserDto userDto = new UserDto();
            userDto.setId(userEntity.getId());
            userDto.setUserId(userEntity.getUserId());
            userDto.setFirstName(userEntity.getFirstName());
            userDto.setLastName(userEntity.getLastName());
            userDto.setEmail(userEntity.getEmail());
            
            // Add user to the return list
            returnValue.add(userDto);
        }
        
        return returnValue;
    }
    
    @Override
    public UserDto updateUser(String userId, UserDto userDetails, String authorization) {
        // Find the user by userId
        UserEntity userEntity = usersRepository.findByUserId(userId);
        if (userEntity == null) throw new UsernameNotFoundException("User not found");
        
        // Update user properties
        if (userDetails.getFirstName() != null) {
            userEntity.setFirstName(userDetails.getFirstName());
        }
        
        if (userDetails.getLastName() != null) {
            userEntity.setLastName(userDetails.getLastName());
        }
        
        if (userDetails.getEmail() != null) {
            // Check if email is changed and not already in use
            if (!userEntity.getEmail().equals(userDetails.getEmail())) {
                UserEntity existingUser = usersRepository.findByEmail(userDetails.getEmail());
                if (existingUser != null) {
                    throw new RuntimeException("Email already in use");
                }
                userEntity.setEmail(userDetails.getEmail());
            }
        }
        
        // Only update password if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            userEntity.setEncryptedPassword(bCryptPasswordEncoder.encode(userDetails.getPassword()));
        }
        
        // Update optional fields if provided
        if (userDetails.getMiddleName() != null) {
            userEntity.setMiddleName(userDetails.getMiddleName());
        }
        
        if (userDetails.getTitle() != null) {
            userEntity.setTitle(userDetails.getTitle());
        }
        
        if (userDetails.getProfession() != null) {
            userEntity.setProfession(userDetails.getProfession());
        }
        
        if (userDetails.getPhone() != null) {
            userEntity.setPhone(userDetails.getPhone());
        }
        
        if (userDetails.getMobilePhone() != null) {
            userEntity.setMobilePhone(userDetails.getMobilePhone());
        }
        
        if (userDetails.getAddressLine1() != null) {
            userEntity.setAddressLine1(userDetails.getAddressLine1());
        }
        
        if (userDetails.getAddressLine2() != null) {
            userEntity.setAddressLine2(userDetails.getAddressLine2());
        }
        
        if (userDetails.getCity() != null) {
            userEntity.setCity(userDetails.getCity());
        }
        
        if (userDetails.getState() != null) {
            userEntity.setState(userDetails.getState());
        }
        
        if (userDetails.getPostalCode() != null) {
            userEntity.setPostalCode(userDetails.getPostalCode());
        }
        
        if (userDetails.getCountry() != null) {
            userEntity.setCountry(userDetails.getCountry());
        }
        
        if (userDetails.getStatus() != null) {
            userEntity.setStatus(userDetails.getStatus());
        }
        
        if (userDetails.getNotes() != null) {
            userEntity.setNotes(userDetails.getNotes());
        }
        
        // Update user types if provided
        if (userDetails.getUserTypes() != null && !userDetails.getUserTypes().isEmpty()) {
            // Clear existing user types
            if (userEntity.getUserTypes() == null) {
                userEntity.setUserTypes(new HashSet<>());
            } else {
                userEntity.getUserTypes().clear();
            }
            
            // Add the new user types
            final UserEntity finalUserEntity = userEntity; // Create final copy for lambda
            for (UserTypeDto userTypeDto : userDetails.getUserTypes()) {
                userTypeRepository.findById(userTypeDto.getId())
                    .ifPresent(userType -> finalUserEntity.getUserTypes().add(userType));
            }
        }
        
        // Save updated user
        userEntity = usersRepository.save(userEntity);
        
        // Map entity back to DTO
        UserDto returnValue = new UserDto();
        returnValue.setId(userEntity.getId());
        returnValue.setUserId(userEntity.getUserId());
        returnValue.setFirstName(userEntity.getFirstName());
        returnValue.setLastName(userEntity.getLastName());
        returnValue.setEmail(userEntity.getEmail());
        returnValue.setMiddleName(userEntity.getMiddleName());
        returnValue.setTitle(userEntity.getTitle());
        returnValue.setProfession(userEntity.getProfession());
        returnValue.setPhone(userEntity.getPhone());
        returnValue.setMobilePhone(userEntity.getMobilePhone());
        returnValue.setAddressLine1(userEntity.getAddressLine1());
        returnValue.setAddressLine2(userEntity.getAddressLine2());
        returnValue.setCity(userEntity.getCity());
        returnValue.setState(userEntity.getState());
        returnValue.setPostalCode(userEntity.getPostalCode());
        returnValue.setCountry(userEntity.getCountry());
        returnValue.setStatus(userEntity.getStatus());
        returnValue.setLastLoginAt(userEntity.getLastLoginAt());
        returnValue.setPasswordResetRequired(userEntity.isPasswordResetRequired());
        returnValue.setNotes(userEntity.getNotes());
        returnValue.setCreatedAt(userEntity.getCreatedAt());
        returnValue.setUpdatedAt(userEntity.getUpdatedAt());
        
        return returnValue;
    }
    
    @Override
    public List<Long> getUserTypeIds(String userId) {
        UserEntity userEntity = usersRepository.findByUserId(userId);
        if (userEntity == null) throw new UsernameNotFoundException("User not found");
        
        List<Long> userTypeIds = new ArrayList<>();
        
        // Extract the user type IDs from the user's user types
        if (userEntity.getUserTypes() != null) {
            for (UserTypeEntity userType : userEntity.getUserTypes()) {
                userTypeIds.add(userType.getId());
            }
        }
        
        return userTypeIds;
    }
    
  
    /**
	 * Determines the highest priority role from a collection of general roles.
	 * Priority order: SYSTEM_ADMIN > PRINCIPAL_INVESTIGATOR > STUDY_COORDINATOR > DATA_MANAGER > CRA > MEDICAL_CODER > AUDITOR > SITE_USER
	 */
	private String getHighestPriorityGeneralRole(Collection<com.clinprecision.common.entity.RoleEntity> roles) {
	    // Priority mapping - lower number = higher priority
	    java.util.Map<String, Integer> rolePriority = new java.util.HashMap<>();
	    rolePriority.put("SYSTEM_ADMIN", 1);
	    rolePriority.put("PRINCIPAL_INVESTIGATOR", 2);
	    rolePriority.put("STUDY_COORDINATOR", 3);
	    rolePriority.put("DATA_MANAGER", 4);
	    rolePriority.put("CRA", 5);
	    rolePriority.put("MEDICAL_CODER", 6);
	    rolePriority.put("AUDITOR", 7);
	    rolePriority.put("SITE_USER", 8);
	    
	    return roles.stream()
	        .filter(role -> role.isSystemRole()) // Only system roles
	        .map(role -> role.getName())
	        .min((role1, role2) -> {
	            int priority1 = rolePriority.getOrDefault(role1, 999);
	            int priority2 = rolePriority.getOrDefault(role2, 999);
	            return Integer.compare(priority1, priority2);
	        })
	        .orElse(null);
	}
	
	/**
	 * Loads the user's authorities (roles) for Spring Security authentication.
	 * This method follows the same priority logic as getUserRole but returns all relevant authorities.
	 */
	private Collection<SimpleGrantedAuthority> loadUserAuthorities(Long userId) {
	    Collection<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
	    
	    try {
	        // STEP 1: Check for study roles first (highest priority)
	        var activeStudyRoles = userStudyRoleService.findHighestPriorityActiveRoleByUserId(userId);
	        
	        if (activeStudyRoles.isPresent()) {
	            String studyRoleName = activeStudyRoles.get().getRole().getName();
	            authorities.add(new SimpleGrantedAuthority("ROLE_" + studyRoleName));
	        } else {
	            logger.info("No active study roles found");
	        }
	        
	        // STEP 2: Add system roles as well (they might be needed for certain operations)
	        logger.info("Checking for system roles...");
	        Optional<UserEntity> userOptional = usersRepository.findByIdWithRoles(userId);
	        if (userOptional.isPresent()) {
	            UserEntity userEntity = userOptional.get();
	            if (userEntity.getRoles() != null && !userEntity.getRoles().isEmpty()) {
	                logger.info("User has {} system roles", userEntity.getRoles().size());
	                userEntity.getRoles().stream()
	                    .filter(role -> role.isSystemRole())
	                    .forEach(role -> {
	                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
	                        logger.info("Added system role authority: ROLE_{}", role.getName());
	                    });
	            } else {
	                logger.warn("User has no system roles assigned");
	            }
	        } else {
	            logger.warn("User entity not found when loading authorities");
	        }
	        
	        // STEP 3: If no roles found, assign default
	        if (authorities.isEmpty()) {
	            authorities.add(new SimpleGrantedAuthority("ROLE_SITE_USER"));
	            logger.info("No specific roles found, assigned default: ROLE_SITE_USER");
	        }
	        
	        logger.info("Final authorities list: {}", authorities);
	        logger.info("=== LOADING USER AUTHORITIES COMPLETE ====");
	        
	    } catch (Exception ex) {
	        logger.error("=== LOADING USER AUTHORITIES FAILED ==== Error for user ID: {}. Error: {}", userId, ex.getMessage(), ex);
	        authorities.clear();
	        authorities.add(new SimpleGrantedAuthority("ROLE_SITE_USER"));
	        logger.info("Fallback: assigned ROLE_SITE_USER due to error");
	    }
	    
	    return authorities;
	}
}
