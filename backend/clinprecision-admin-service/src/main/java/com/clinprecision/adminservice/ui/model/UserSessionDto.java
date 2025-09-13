package com.clinprecision.adminservice.ui.model;


import com.clinprecision.common.entity.UserSessionEntity;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for UserSession.
 */
@Data
public class UserSessionDto {
    private Long id;
    private Long userId; // Reference to user ID only to avoid circular references
    private String sessionToken;
    private String ipAddress;
    private String userAgent;
    private String deviceInfo;
    private LocalDateTime loginTime;
    private LocalDateTime lastActiveTime;
    private LocalDateTime logoutTime;
    private UserSessionEntity.SessionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor, getters, setters are handled by Lombok
}
