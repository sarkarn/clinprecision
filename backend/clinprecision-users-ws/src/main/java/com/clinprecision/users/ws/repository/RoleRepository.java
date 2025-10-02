package com.clinprecision.users.ws.repository;

import com.clinprecision.common.entity.RoleEntity;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface RoleRepository extends CrudRepository<RoleEntity, Long> {

	RoleEntity findByName(String name);
	
	List<RoleEntity> findByIsSystemRole(boolean isSystemRole);
}