package com.clinprecision.adminservice.service.impl;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.HashSet;

import com.clinprecision.common.dto.UserTypeDto;
import com.clinprecision.common.entity.AuthorityEntity;
import com.clinprecision.common.entity.RoleEntity;
import com.clinprecision.common.entity.UserEntity;
import com.clinprecision.common.dto.UserDto;

import com.clinprecision.adminservice.repository.OrganizationRepository;
import java.util.Set;

import com.clinprecision.adminservice.repository.RoleRepository;
import com.clinprecision.adminservice.repository.UsersRepository;
import com.clinprecision.adminservice.service.UsersService;
import com.clinprecision.adminservice.repository.UserTypeRepository;
import com.clinprecision.common.entity.UserTypeEntity;
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
    BCryptPasswordEncoder bCryptPasswordEncoder;
    //RestTemplate restTemplate;
    Environment environment;
    UserTypeRepository userTypeRepository;
    OrganizationRepository organizationRepository;
    RoleRepository roleRepository;
	
	Logger logger = LoggerFactory.getLogger(this.getClass());
	
	@Autowired
    public UsersServiceImpl(UsersRepository usersRepository,
            BCryptPasswordEncoder bCryptPasswordEncoder,
            Environment environment,
            UserTypeRepository userTypeRepository,
            OrganizationRepository organizationRepository,
            RoleRepository roleRepository) {
        this.usersRepository = usersRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.environment = environment;
        this.userTypeRepository = userTypeRepository;
        this.organizationRepository = organizationRepository;
        this.roleRepository = roleRepository;
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
}
