package com.clinprecision.clinopsservice.studydesign.protocolmgmt.controller;

import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.commands.ChangeVersionStatusCommand;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionStatus;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.entity.ProtocolVersionEntity;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.service.ProtocolVersionCommandService;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.service.ProtocolVersionQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Bridge Controller for Protocol Versions
 * 
 * Purpose: Provide backward-compatible REST endpoints that accept legacy Long IDs
 * Maps: /api/study-versions/{legacyId} → DDD commands with UUIDs
 * 
 * This controller exists to maintain API compatibility with the frontend
 * while the backend uses DDD with UUID-based aggregate identifiers.
 */
@Slf4j
@RestController
@RequestMapping("/api/study-versions")
@RequiredArgsConstructor
public class ProtocolVersionBridgeController {

    private final ProtocolVersionQueryService protocolVersionQueryService;
    private final ProtocolVersionCommandService protocolVersionCommandService;

    /**
     * Bridge endpoint: Update protocol version status
     * 
     * Frontend path: PUT /api/study-versions/{versionId}/status
     * Maps to DDD command: ChangeVersionStatusCommand
     * 
     * @param versionId Legacy protocol version ID (Long)
     * @param statusData Request body: { "status": "UNDER_REVIEW", "reason": "..." }
     * @return Success response or error details
     */
    @PutMapping("/{versionId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long versionId,
            @RequestBody Map<String, Object> statusData) {
        
        log.info("BRIDGE: ====== STATUS UPDATE REQUEST START ======");
        log.info("BRIDGE: Update protocol version status for legacy ID: {}", versionId);
        log.info("BRIDGE: Request body: {}", statusData);
        
        try {
            // Step 1: Resolve legacy ID to aggregate UUID
            log.info("BRIDGE: Querying for protocol version entity by legacy ID...");
            ProtocolVersionEntity version = protocolVersionQueryService.findById(versionId)
                .orElseThrow(() -> new IllegalArgumentException("Protocol version not found: " + versionId));
            
            UUID aggregateUuid = version.getAggregateUuid();
            if (aggregateUuid == null) {
                log.error("BRIDGE: Version {} has no aggregate UUID - not migrated to DDD", versionId);
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Version " + versionId + " has not been migrated to DDD yet"));
            }
            
            log.info("BRIDGE: ✓ Resolved legacy ID {} to aggregate UUID: {}", versionId, aggregateUuid);
            log.info("BRIDGE: Current version status: {}", version.getStatus());
            
            // Step 2: Extract and validate status from request
            String statusStr = (String) statusData.get("status");
            if (statusStr == null || statusStr.trim().isEmpty()) {
                log.error("BRIDGE: Status field is missing or empty in request");
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Status is required"));
            }
            
            log.info("BRIDGE: Attempting to change status from {} to {}", version.getStatus(), statusStr);
            
            VersionStatus newStatus;
            try {
                newStatus = VersionStatus.valueOf(statusStr);
                log.info("BRIDGE: ✓ Parsed status enum successfully: {}", newStatus);
            } catch (IllegalArgumentException e) {
                log.error("BRIDGE: Invalid status value: {} (valid: DRAFT, UNDER_REVIEW, SUBMITTED, APPROVED, ACTIVE, etc.)", statusStr);
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid status: " + statusStr));
            }
            
            // Step 3: Extract and validate reason
            String reason = (String) statusData.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                log.error("BRIDGE: Status change reason is required but not provided");
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Status change reason is required"));
            }
            log.info("BRIDGE: Status change reason: '{}'", reason);
            
            // Step 4: Build change status command
            log.info("BRIDGE: Building ChangeVersionStatusCommand...");
            ChangeVersionStatusCommand command = ChangeVersionStatusCommand.builder()
                .versionId(aggregateUuid)
                .newStatus(newStatus)
                .reason(reason)
                .userId((Long) statusData.getOrDefault("userId", 1L))
                .build();
            
            log.info("BRIDGE: ✓ Command built - versionId: {}, newStatus: {}, reason: '{}', userId: {}", 
                aggregateUuid, newStatus, reason, statusData.getOrDefault("userId", 1L));
            
            // Step 5: Execute command via DDD service
            log.info("BRIDGE: Sending command to ProtocolVersionCommandService...");
            protocolVersionCommandService.changeStatusSync(command);
            log.info("BRIDGE: ✓ Command executed successfully!");
            log.info("BRIDGE: ====== STATUS UPDATE REQUEST SUCCESS ======");
            
            return ResponseEntity.ok().body(Map.of(
                "message", "Status updated successfully",
                "versionId", versionId,
                "newStatus", newStatus.name()
            ));
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("BRIDGE: ====== VALIDATION ERROR ======");
            log.error("BRIDGE: Validation error for version {}: {}", versionId, e.getMessage());
            log.error("BRIDGE: Exception type: {}", e.getClass().getName());
            log.error("BRIDGE: Stack trace:", e);
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "error", "VALIDATION_ERROR", 
                    "message", e.getMessage(),
                    "versionId", versionId
                ));
        } catch (Exception ex) {
            log.error("BRIDGE: ====== INTERNAL ERROR ======");
            log.error("BRIDGE: Failed to update protocol version status for version {}", versionId, ex);
            log.error("BRIDGE: Exception type: {}", ex.getClass().getName());
            log.error("BRIDGE: Message: {}", ex.getMessage());
            if (ex.getCause() != null) {
                log.error("BRIDGE: Root cause: {} - {}", 
                    ex.getCause().getClass().getName(), ex.getCause().getMessage());
            }
            log.error("BRIDGE: Full stack trace:", ex);
            return ResponseEntity.internalServerError()
                .body(Map.of(
                    "error", "INTERNAL_ERROR", 
                    "message", "Failed to update status: " + ex.getMessage(),
                    "versionId", versionId
                ));
        }
    }
}
