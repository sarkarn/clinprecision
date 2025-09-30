package com.clinprecision.userservice.service;

import java.util.Collection;
import java.util.Optional;

import com.clinprecision.common.dto.UserDto;
import com.clinprecision.common.entity.UserEntity;
import com.clinprecision.userservice.repository.UsersRepository;
import com.clinprecision.userservice.repository.RoleRepository;
import com.clinprecision.userservice.repository.UserStudyRoleRepository;
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


@Service
public class UsersServiceImpl implements UsersService {
	
	private final UsersRepository usersRepository;
    private final RoleRepository roleRepository;
    private final UserStudyRoleRepository userStudyRoleRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final Environment environment;
	
	private final Logger logger = LoggerFactory.getLogger(this.getClass());
	
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
        

        logger.info("UsersServiceImpl instance created successfully");
        logger.info("Repositories injected - UsersRepository: {}", usersRepository != null ? "OK" : "NULL");
        logger.info("Repositories injected - RoleRepository: {}", roleRepository != null ? "OK" : "NULL");
        logger.info("Repositories injected - UserStudyRoleRepository: {}", userStudyRoleRepository != null ? "OK" : "NULL");
        logger.info("Environment: {}", environment != null ? "OK" : "NULL");
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
	}	@Override
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
	        var activeStudyRole = userStudyRoleRepository.findHighestPriorityActiveRoleByUserId(userId);
	        
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
	        var activeStudyRoles = userStudyRoleRepository.findHighestPriorityActiveRoleByUserId(userId);
	        
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