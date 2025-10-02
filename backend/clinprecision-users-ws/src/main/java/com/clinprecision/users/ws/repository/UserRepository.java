package com.clinprecision.users.ws.repository;

import com.clinprecision.common.entity.UserEntity;
import org.springframework.data.repository.CrudRepository;

public interface UserRepository extends CrudRepository<UserEntity, Long> {
	UserEntity findByEmail(String email);
	UserEntity findByUserId(String userId);
}