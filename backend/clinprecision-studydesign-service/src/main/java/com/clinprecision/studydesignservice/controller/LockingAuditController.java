package com.clinprecision.studydesignservice.controller;

import com.clinprecision.studydesignservice.dto.LockingAuditResponse;
import com.clinprecision.studydesignservice.entity.LockingAuditEntity;
import com.clinprecision.studydesignservice.repository.LockingAuditRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for accessing locking audit trail.
 */
@RestController
@RequestMapping("/api/locking/audit")
public class LockingAuditController {

    private final LockingAuditRepository lockingAuditRepository;
    
    public LockingAuditController(LockingAuditRepository lockingAuditRepository) {
        this.lockingAuditRepository = lockingAuditRepository;
    }
    
    /**
     * Get audit trail for a specific entity.
     */
    @GetMapping("/entity/{entityId}")
    public ResponseEntity<List<LockingAuditResponse>> getAuditForEntity(@PathVariable String entityId) {
        List<LockingAuditEntity> audits = lockingAuditRepository.findByEntityIdOrderByCreatedAtDesc(entityId);
        
        List<LockingAuditResponse> response = audits.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get audit trail for a specific entity type.
     */
    @GetMapping("/type/{entityType}")
    public ResponseEntity<List<LockingAuditResponse>> getAuditForEntityType(
            @PathVariable LockingAuditEntity.EntityType entityType) {
        List<LockingAuditEntity> audits = lockingAuditRepository.findByEntityTypeOrderByCreatedAtDesc(entityType);
        
        List<LockingAuditResponse> response = audits.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get audit trail for a specific user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LockingAuditResponse>> getAuditForUser(@PathVariable Long userId) {
        List<LockingAuditEntity> audits = lockingAuditRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        List<LockingAuditResponse> response = audits.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get all audit records.
     */
    @GetMapping
    public ResponseEntity<List<LockingAuditResponse>> getAllAudits() {
        List<LockingAuditEntity> audits = lockingAuditRepository.findAll();
        
        List<LockingAuditResponse> response = audits.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Convert entity to response DTO.
     */
    private LockingAuditResponse convertToResponse(LockingAuditEntity entity) {
        return new LockingAuditResponse(
                entity.getId(),
                entity.getEntityId(),
                entity.getEntityType().name(),
                entity.getOperation().name(),
                entity.getReason(),
                entity.getUserId(),
                entity.getCreatedAt()
        );
    }
}
