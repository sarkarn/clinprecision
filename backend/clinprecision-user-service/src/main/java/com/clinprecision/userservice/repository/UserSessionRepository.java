package com.clinprecision.userservice.repository;

import com.clinprecision.common.entity.UserSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UserSession entities.
 */
@Repository
public interface UserSessionRepository extends JpaRepository<UserSessionEntity, Long> {
    
    /**
     * Find a session by its token.
     *
     * @param sessionToken the session token
     * @return optional containing the session if found
     */
    Optional<UserSessionEntity> findBySessionToken(String sessionToken);
    
    /**
     * Find a session by its refresh token.
     *
     * @param refreshToken the refresh token
     * @return optional containing the session if found
     */
    Optional<UserSessionEntity> findByRefreshToken(String refreshToken);
    
    /**
     * Find all active sessions for a specific user.
     *
     * @param userId the ID of the user
     * @param status the status of the sessions to find
     * @return list of active sessions for the specified user
     */
    List<UserSessionEntity> findByUser_IdAndStatus(Long userId, UserSessionEntity.SessionStatus status);
    
    /**
     * Find all sessions for a specific user.
     *
     * @param userId the ID of the user
     * @return list of sessions for the specified user
     */
    List<UserSessionEntity> findByUser_Id(Long userId);
    
    /**
     * Find all sessions that have not been active since a specific time.
     *
     * @param lastActiveTime the cutoff time for last activity
     * @return list of sessions that have not been active since the specified time
     */
    List<UserSessionEntity> findByLastActiveTimeBefore(LocalDateTime lastActiveTime);
    
    /**
     * Find all sessions with a specific status.
     *
     * @param status the session status
     * @return list of sessions with the specified status
     */
    List<UserSessionEntity> findByStatus(UserSessionEntity.SessionStatus status);
    
    /**
     * Find all sessions from a specific IP address.
     *
     * @param ipAddress the IP address
     * @return list of sessions from the specified IP address
     */
    List<UserSessionEntity> findByIpAddress(String ipAddress);
}