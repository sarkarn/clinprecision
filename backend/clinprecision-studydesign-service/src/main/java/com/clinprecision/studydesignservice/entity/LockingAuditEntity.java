package com.clinprecision.studydesignservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity for tracking locking and unlocking operations.
 */
@Data
@Entity
@Table(name = "locking_audit")
@NoArgsConstructor
@AllArgsConstructor
public class LockingAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    
    @Column(name = "entity_id", nullable = false)
    private String entityId;
    
    @Column(name = "entity_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private EntityType entityType;
    
    @Column(name = "operation", nullable = false)
    @Enumerated(EnumType.STRING)
    private Operation operation;
    
    @Column(name = "reason")
    private String reason;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    public enum EntityType {
        STUDY, FORM
    }
    
    public enum Operation {
        LOCK, UNLOCK
    }
}
