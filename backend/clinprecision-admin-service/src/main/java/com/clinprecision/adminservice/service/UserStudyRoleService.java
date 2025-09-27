package com.clinprecision.adminservice.service;

import com.clinprecision.common.entity.UserStudyRoleEntity;

import java.util.Optional;

public interface UserStudyRoleService {
    Optional<UserStudyRoleEntity> findHighestPriorityActiveRoleByUserId(Long userId);
}
