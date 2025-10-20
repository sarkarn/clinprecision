package com.clinprecision.clinopsservice.studydesign.protocolmgmt.controller;

import com.clinprecision.clinopsservice.common.util.DeprecationHeaderUtil;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.api.ProtocolApiConstants;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.commands.ChangeVersionStatusCommand;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionStatus;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.entity.ProtocolVersionEntity;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.service.ProtocolVersionCommandService;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.service.ProtocolVersionQueryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Bridge Controller for Protocol Versions - Legacy Compatibility
 * 
 * <p><b>Purpose:</b> Provide backward-compatible REST endpoints that accept legacy Long IDs
 * and map them to DDD commands with UUIDs.</p>
 * 
 * <p><b>Mapping:</b> /api/study-versions/{legacyId} → DDD commands with UUIDs</p>
 * 
 * <p>This controller exists to maintain API compatibility with the frontend
 * while the backend uses DDD with UUID-based aggregate identifiers.</p>
 * 
 * <p><b>⚠️ LEGACY SUPPORT ONLY</b></p>
 * <p>This controller ONLY handles the deprecated legacy URL pattern.</p>
 * <p>The new URL pattern is handled by {@link ProtocolVersionCommandController}.</p>
 * 
 * <p><b>Legacy URL (DEPRECATED - mapped here):</b></p>
 * <ul>
 *   <li>PUT /api/study-versions/{versionId}/status - Update version status (accepts Long ID)</li>
 * </ul>
 * 
 * <p><b>New URL (handled by ProtocolVersionCommandController):</b></p>
 * <ul>
 *   <li>PUT /api/v1/study-design/protocol-versions/{versionId}/status - Update version status (accepts UUID)</li>
 * </ul>
 * 
 * <p><b>Note:</b> This bridge controller will be removed on April 19, 2026 when legacy support ends.</p>
 * 
 * @see ProtocolApiConstants
 * @see ProtocolVersionCommandController
 * @since October 2025 (URL Refactoring)
 */
@Slf4j
@RestController
@RequestMapping({
    ProtocolApiConstants.LEGACY_STUDY_VERSIONS        // OLD (deprecated): /api/study-versions
})
@RequiredArgsConstructor
public class ProtocolVersionBridgeController {

    private final ProtocolVersionQueryService protocolVersionQueryService;
    private final ProtocolVersionCommandService protocolVersionCommandService;

    /**
     * Bridge endpoint: Update protocol version status (accepts legacy Long IDs)
     * 
     * <p><b>Legacy URL:</b> PUT /api/study-versions/{versionId}/status (deprecated)</p>
     * 
     * <p><b>Frontend compatibility:</b> This endpoint accepts legacy Long IDs from the database
     * and maps them to DDD aggregate UUIDs internally.</p>
     * 
     * <p><b>⚠️ DEPRECATED:</b> This endpoint will be removed on April 19, 2026.</p>
     * <p>Clients should migrate to use UUID-based endpoints:</p>
     * <ul>
     *   <li>New URL: PUT /api/v1/study-design/protocol-versions/{uuid}/status</li>
     *   <li>Handler: {@link ProtocolVersionCommandController#changeStatus}</li>
     * </ul>
     * 
     * <p><b>Request body:</b></p>
     * <pre>
     * {
     *   "status": "UNDER_REVIEW",
     *   "reason": "Reason for status change",
     *   "userId": 1
     * }
     * </pre>
     * 
     * @param versionId Legacy protocol version ID (Long)
     * @param statusData Request body with status, reason, and userId
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return Success response or error details
     */
    @PutMapping("/{versionId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long versionId,
            @RequestBody Map<String, Object> statusData,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers for legacy URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest,
            httpResponse,
            ProtocolApiConstants.PROTOCOL_VERSIONS_PATH + "/{id}/status",
            "This endpoint accepts legacy Long IDs. Please migrate to UUID-based endpoints at /api/v1/study-design/protocol-versions/{uuid}/status",
            ProtocolApiConstants.SUNSET_DATE
        );
        
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
