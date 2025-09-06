package com.clinprecision.studydesignservice.repository;

import com.clinprecision.studydesignservice.entity.LockingAuditEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for managing locking audit records.
 */
@Repository
public interface LockingAuditRepository extends JpaRepository<LockingAuditEntity, String> {
    
    /**
     * Find all audit records for a specific entity.
     *
     * @param entityId The ID of the entity
     * @return List of audit records
     */
    List<LockingAuditEntity> findByEntityIdOrderByCreatedAtDesc(String entityId);
    
    /**
     * Find all audit records for a specific entity type.
     *
     * @param entityType The type of entity
     * @return List of audit records
     */
    List<LockingAuditEntity> findByEntityTypeOrderByCreatedAtDesc(LockingAuditEntity.EntityType entityType);
    
    /**
     * Find all audit records performed by a specific user.
     *
     * @param userId The ID of the user
     * @return List of audit records
     */
    List<LockingAuditEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
}
