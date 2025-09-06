package com.clinprecision.userservice;

import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.UUID;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.clinprecision.userservice.data.AuthorityEntity;
import com.clinprecision.userservice.data.AuthorityRepository;
import com.clinprecision.userservice.data.RoleEntity;
import com.clinprecision.userservice.data.RoleRepository;
import com.clinprecision.userservice.data.UserEntity;
import com.clinprecision.userservice.data.UsersRepository;
import com.clinprecision.userservice.shared.Roles;

import jakarta.transaction.Transactional;

@Component
public class InitialUsersSetup {

	@Autowired
	AuthorityRepository authorityRepository;

	@Autowired
	RoleRepository roleRepository;

	@Autowired
	BCryptPasswordEncoder bCryptPasswordEncoder;

	@Autowired
	UsersRepository usersRepository;

	private final Logger logger = LoggerFactory.getLogger(this.getClass());

	@Transactional
	@EventListener
	public void onApplicationEvent(ApplicationReadyEvent event) {
		logger.info("Initializing default users and roles");

		// Create core authorities
		AuthorityEntity readAuthority = createAuthority("READ_STUDY");
		AuthorityEntity writeAuthority = createAuthority("WRITE");
		AuthorityEntity deleteAuthority = createAuthority("DELETE");
		AuthorityEntity updateAuthority = createAuthority("UPDATE_STUDY");
		AuthorityEntity createStudyAuthority = createAuthority("CREATE_STUDY");
		AuthorityEntity manageUserAuthority = createAuthority("MANAGE_USER");
		AuthorityEntity assignUserAuthority = createAuthority("ASSIGN_USER");
		AuthorityEntity systemConfigAuthority = createAuthority("SYSTEM_CONFIGURATION");
		AuthorityEntity readSubjectAuthority = createAuthority("READ_SUBJECT");
		AuthorityEntity createSubjectAuthority = createAuthority("CREATE_SUBJECT");
		AuthorityEntity updateSubjectAuthority = createAuthority("UPDATE_SUBJECT");
		AuthorityEntity readFormAuthority = createAuthority("READ_FORM");
		AuthorityEntity createFormAuthority = createAuthority("CREATE_FORM");
		AuthorityEntity updateFormAuthority = createAuthority("UPDATE_FORM");
		AuthorityEntity enterDataAuthority = createAuthority("ENTER_DATA");
		AuthorityEntity reviewDataAuthority = createAuthority("REVIEW_DATA");
		AuthorityEntity signDataAuthority = createAuthority("SIGN_DATA");
		AuthorityEntity lockFormAuthority = createAuthority("LOCK_FORM");
		AuthorityEntity unlockFormAuthority = createAuthority("UNLOCK_FORM");
		AuthorityEntity createQueryAuthority = createAuthority("CREATE_QUERY");
		AuthorityEntity exportDataAuthority = createAuthority("EXPORT_DATA");
		AuthorityEntity importDataAuthority = createAuthority("IMPORT_DATA");
		
		// Create standard roles from the Roles enum
		Collection<AuthorityEntity> userAuthorities = new ArrayList<>();
		userAuthorities.add(readAuthority);
		userAuthorities.add(writeAuthority);
		createRole(Roles.ROLE_USER.name(), userAuthorities);
		
		Collection<AuthorityEntity> adminAuthorities = new ArrayList<>();
		adminAuthorities.add(readAuthority);
		adminAuthorities.add(writeAuthority);
		adminAuthorities.add(deleteAuthority);
		RoleEntity roleAdmin = createRole(Roles.ROLE_ADMIN.name(), adminAuthorities);
		
		// Create roles based on the consolidated schema definitions
		Collection<AuthorityEntity> systemAdminAuthorities = new ArrayList<>();
		systemAdminAuthorities.add(readAuthority);
		systemAdminAuthorities.add(writeAuthority);
		systemAdminAuthorities.add(deleteAuthority);
		systemAdminAuthorities.add(updateAuthority);
		systemAdminAuthorities.add(createStudyAuthority);
		systemAdminAuthorities.add(manageUserAuthority);
		systemAdminAuthorities.add(assignUserAuthority);
		systemAdminAuthorities.add(systemConfigAuthority);
		systemAdminAuthorities.add(readSubjectAuthority);
		systemAdminAuthorities.add(createSubjectAuthority);
		systemAdminAuthorities.add(updateSubjectAuthority);
		systemAdminAuthorities.add(readFormAuthority);
		systemAdminAuthorities.add(createFormAuthority);
		systemAdminAuthorities.add(updateFormAuthority);
		systemAdminAuthorities.add(enterDataAuthority);
		systemAdminAuthorities.add(reviewDataAuthority);
		systemAdminAuthorities.add(signDataAuthority);
		systemAdminAuthorities.add(lockFormAuthority);
		systemAdminAuthorities.add(unlockFormAuthority);
		systemAdminAuthorities.add(createQueryAuthority);
		systemAdminAuthorities.add(exportDataAuthority);
		systemAdminAuthorities.add(importDataAuthority);
		RoleEntity roleSystemAdmin = createRole(Roles.ROLE_SYSTEM_ADMIN.name(), systemAdminAuthorities);
		
		Collection<AuthorityEntity> dbAdminAuthorities = new ArrayList<>();
		dbAdminAuthorities.add(readAuthority);
		dbAdminAuthorities.add(readSubjectAuthority);
		dbAdminAuthorities.add(readFormAuthority);
		dbAdminAuthorities.add(exportDataAuthority);
		dbAdminAuthorities.add(importDataAuthority);
		dbAdminAuthorities.add(systemConfigAuthority);
		RoleEntity roleDbAdmin = createRole(Roles.ROLE_DB_ADMIN.name(), dbAdminAuthorities);
		
		Collection<AuthorityEntity> sponsorAdminAuthorities = new ArrayList<>();
		sponsorAdminAuthorities.add(readAuthority);
		sponsorAdminAuthorities.add(createStudyAuthority);
		sponsorAdminAuthorities.add(updateAuthority);
		sponsorAdminAuthorities.add(readSubjectAuthority);
		sponsorAdminAuthorities.add(createSubjectAuthority);
		sponsorAdminAuthorities.add(updateSubjectAuthority);
		sponsorAdminAuthorities.add(readFormAuthority);
		sponsorAdminAuthorities.add(createFormAuthority);
		sponsorAdminAuthorities.add(updateFormAuthority);
		sponsorAdminAuthorities.add(reviewDataAuthority);
		sponsorAdminAuthorities.add(createQueryAuthority);
		sponsorAdminAuthorities.add(exportDataAuthority);
		sponsorAdminAuthorities.add(assignUserAuthority);
		RoleEntity roleSponsorAdmin = createRole(Roles.ROLE_SPONSOR_ADMIN.name(), sponsorAdminAuthorities);
		
		UserEntity adminUser = new UserEntity();
		adminUser.setFirstName("admin");
		adminUser.setLastName("admin");
		adminUser.setEmail("admin@test.com");
		adminUser.setUserId(UUID.randomUUID().toString());
		adminUser.setEncryptedPassword(bCryptPasswordEncoder.encode("12345678"));
		
		Collection<RoleEntity> adminRoles = new ArrayList<>();
		adminRoles.add(roleAdmin);
		adminUser.setRoles(adminRoles);

		UserEntity storedAdminUser = usersRepository.findByEmail("admin@test.com");
		if(storedAdminUser == null) {
			usersRepository.save(adminUser);
		}
		
		// Create the three requested users with specified roles
		Collection<RoleEntity> sysAdminRoles = new ArrayList<>();
		sysAdminRoles.add(roleSystemAdmin);
		createUser(
			"sysadmin@clinprecision.com", 
			"System", 
			"Administrator", 
			"12345678", 
			sysAdminRoles
		);
		
		Collection<RoleEntity> dbAdminRoles = new ArrayList<>();
		dbAdminRoles.add(roleDbAdmin);
		createUser(
			"dbadmin@clinprecision.com", 
			"Database", 
			"Administrator", 
			"12345678", 
			dbAdminRoles
		);
		
		Collection<RoleEntity> sponsorAdminRoles = new ArrayList<>();
		sponsorAdminRoles.add(roleSponsorAdmin);
		createUser(
			"sponsor@clinprecision.com", 
			"Sponsor", 
			"Admin", 
			"12345678", 
			sponsorAdminRoles
		);
		
		logger.info("Default users and roles initialized successfully");
	}
	
	private void createUser(String email, String firstName, String lastName, 
			String password, Collection<RoleEntity> roles) {
		
		UserEntity storedUser = usersRepository.findByEmail(email);
		
		if(storedUser == null) {
			UserEntity user = new UserEntity();
			user.setFirstName(firstName);
			user.setLastName(lastName);
			user.setEmail(email);
			user.setUserId(UUID.randomUUID().toString());
			user.setEncryptedPassword(bCryptPasswordEncoder.encode(password));
			user.setRoles(roles);
			
			usersRepository.save(user);
			logger.info("Created user: " + email);
		} else {
			logger.info("User already exists: " + email);
		}
	}

	@Transactional
	protected AuthorityEntity createAuthority(String name) {
		AuthorityEntity authority = authorityRepository.findByName(name);
		
		if(authority == null) {
			authority = new AuthorityEntity(name);
			authority = authorityRepository.save(authority);
		}
		
		return authority;
	}

	@Transactional
    protected RoleEntity createRole(String name, Collection<AuthorityEntity> authorities) {
		RoleEntity role = roleRepository.findByName(name);

		if(role == null) {
			role = new RoleEntity(name, authorities);
			role = roleRepository.save(role);
		} else {
			// Update existing role with authorities if needed
			// This ensures roles have the right authorities even if they already exist
			role.setAuthorities(authorities);
			role = roleRepository.save(role);
		}

		return role;
	}

}
