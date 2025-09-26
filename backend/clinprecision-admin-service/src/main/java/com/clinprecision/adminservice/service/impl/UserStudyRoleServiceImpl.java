package com.clinprecision.adminservice.service.impl;

import com.clinprecision.adminservice.repository.UserStudyRoleRepository;
import com.clinprecision.adminservice.service.UserStudyRoleService;
import com.clinprecision.common.entity.UserStudyRoleEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserStudyRoleServiceImpl implements UserStudyRoleService {
    final UserStudyRoleRepository userStudyRoleRepository;

    public UserStudyRoleServiceImpl(UserStudyRoleRepository userStudyRoleRepository) {
        this.userStudyRoleRepository = userStudyRoleRepository;
    }

    public Optional<UserStudyRoleEntity>  findHighestPriorityActiveRoleByUserId(Long userId) {
        return userStudyRoleRepository.findHighestPriorityActiveRoleByUserId(userId);
    }
}
