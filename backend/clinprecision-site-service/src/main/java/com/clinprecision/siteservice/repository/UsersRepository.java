package com.clinprecision.siteservice.repository;

import com.clinprecision.common.entity.UserEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsersRepository extends CrudRepository<UserEntity, Long> {
	UserEntity findByEmail(String email);
	UserEntity findByUserId(String userId);
	
	@Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.roles WHERE u.id = :userId")
	Optional<UserEntity> findByIdWithRoles(@Param("userId") Long userId);
	
	@Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.roles WHERE u.email = :email")
	UserEntity findByEmailWithRoles(@Param("email") String email);
}
