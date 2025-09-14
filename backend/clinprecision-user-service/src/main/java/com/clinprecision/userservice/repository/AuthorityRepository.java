package com.clinprecision.userservice.repository;

import com.clinprecision.common.entity.AuthorityEntity;
import org.springframework.data.repository.CrudRepository;

public interface AuthorityRepository extends CrudRepository<AuthorityEntity, Long> {

	AuthorityEntity findByName(String name);
	
}
