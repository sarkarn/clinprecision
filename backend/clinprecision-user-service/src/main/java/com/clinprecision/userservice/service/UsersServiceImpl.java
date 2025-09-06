package com.clinprecision.userservice.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import com.clinprecision.userservice.data.*;
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


import com.clinprecision.userservice.ui.model.UserDto;



@Service
public class UsersServiceImpl implements UsersService {
	
	UsersRepository usersRepository;
	BCryptPasswordEncoder bCryptPasswordEncoder;
	//RestTemplate restTemplate;
	Environment environment;
	AlbumsServiceClient albumsServiceClient;
	
	Logger logger = LoggerFactory.getLogger(this.getClass());
	
	@Autowired
	public UsersServiceImpl(UsersRepository usersRepository, 
			BCryptPasswordEncoder bCryptPasswordEncoder,
			AlbumsServiceClient albumsServiceClient,
			Environment environment)
	{
		this.usersRepository = usersRepository;
		this.bCryptPasswordEncoder = bCryptPasswordEncoder;
		this.albumsServiceClient = albumsServiceClient;
		this.environment = environment;
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
		
		// Save the entity
		userEntity = usersRepository.save(userEntity);
		
		// Map back to DTO
		UserDto returnValue = new UserDto();
		returnValue.setId(userEntity.getId());
		returnValue.setUserId(userEntity.getUserId());
		returnValue.setFirstName(userEntity.getFirstName());
		returnValue.setLastName(userEntity.getLastName());
		returnValue.setEmail(userEntity.getEmail());
		returnValue.setEncryptedPassword(userEntity.getEncryptedPassword());
 
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
	
	
	

}
