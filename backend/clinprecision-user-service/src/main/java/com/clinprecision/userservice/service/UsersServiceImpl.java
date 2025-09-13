package com.clinprecision.userservice.service;

import java.util.ArrayList;
import java.util.Collection;

import com.clinprecision.common.dto.UserDto;
import com.clinprecision.common.entity.AuthorityEntity;
import com.clinprecision.common.entity.RoleEntity;
import com.clinprecision.common.entity.UserEntity;
import com.clinprecision.userservice.repository.UsersRepository;
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
    Environment environment;
	
	Logger logger = LoggerFactory.getLogger(this.getClass());
	
	@Autowired
    public UsersServiceImpl(UsersRepository usersRepository, 
            BCryptPasswordEncoder bCryptPasswordEncoder,
            Environment environment) {
        this.usersRepository = usersRepository;
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
}
