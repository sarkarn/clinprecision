package com.clinprecision.clinopsservice.studydesign.protocolmgmt.controller;

import com.clinprecision.clinopsservice.common.util.DeprecationHeaderUtil;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.api.ProtocolApiConstants;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.commands.*;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionIdentifier;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionNumber;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.service.ProtocolVersionCommandService;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.service.ProtocolVersionQueryService;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.entity.ProtocolVersionEntity;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.dto.*;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.response.StudyResponseDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.service.StudyQueryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Protocol Version Command Controller - DDD/CQRS Write Operations
 * 
 * <p>Handles all write operations for protocol versions following CQRS pattern.</p>
 * <p><b>⚠️ REPLACES DATABASE TRIGGERS</b> with explicit REST API endpoints!</p>
 * 
 * <p><b>⚠️ URL MIGRATION IN PROGRESS</b></p>
 * <p>This controller supports both old and new URL patterns during the migration period.
 * Old URLs are deprecated and will be removed on April 19, 2026.</p>
 * 
 * <p><b>Old URLs (DEPRECATED):</b></p>
 * <ul>
 *   <li>POST   /api/protocol-versions - Create version</li>
 *   <li>PUT    /api/protocol-versions/{id}/status - Change status (REPLACES TRIGGERS!)</li>
 *   <li>PUT    /api/protocol-versions/{id}/approve - Approve version</li>
 *   <li>PUT    /api/protocol-versions/{id}/activate - Activate version</li>
 *   <li>PUT    /api/protocol-versions/{id} - Update version details</li>
 *   <li>DELETE /api/protocol-versions/{id} - Withdraw version</li>
 *   <li>POST   /api/protocol-versions/async - Async create</li>
 * </ul>
 * 
 * <p><b>New URLs (RECOMMENDED):</b></p>
 * <ul>
 *   <li>POST   /api/v1/study-design/protocol-versions - Create version</li>
 *   <li>PUT    /api/v1/study-design/protocol-versions/{id}/status - Change status</li>
 *   <li>PUT    /api/v1/study-design/protocol-versions/{id}/lifecycle/approve - Approve version</li>
 *   <li>PUT    /api/v1/study-design/protocol-versions/{id}/lifecycle/activate - Activate version</li>
 *   <li>PUT    /api/v1/study-design/protocol-versions/{id} - Update version details</li>
 *   <li>DELETE /api/v1/study-design/protocol-versions/{id} - Withdraw version</li>
 *   <li>POST   /api/v1/study-design/protocol-versions/async - Async create</li>
 * </ul>
 * 
 * <p><b>Backward Compatibility:</b> Both URL patterns work during migration period.
 * Clients using old URLs will receive deprecation headers.</p>
 * 
 * @see ProtocolApiConstants
 * @see ProtocolVersionCommandService
 * @since October 2025 (URL Refactoring)
 */
@RestController
@RequestMapping({
    ProtocolApiConstants.PROTOCOL_VERSIONS_PATH,      // NEW: /api/v1/study-design/protocol-versions
    ProtocolApiConstants.LEGACY_PROTOCOL_VERSIONS     // OLD (deprecated): /api/protocol-versions
})
@RequiredArgsConstructor
@Slf4j
public class ProtocolVersionCommandController {

    private final ProtocolVersionCommandService commandService;
    private final StudyQueryService studyQueryService;
    private final ProtocolVersionQueryService queryService;

    /**
     * Create a new protocol version
     * 
     * <p><b>Bridge Pattern:</b> Accepts either studyAggregateUuid OR studyId (legacy ID).
     * If studyId is provided, it will be resolved to Study aggregate UUID.</p>
     * 
     * <p><b>New URL:</b> POST /api/v1/study-design/protocol-versions</p>
     * <p><b>Old URL:</b> POST /api/protocol-versions (deprecated)</p>
     * 
     * @param request the version creation request (must have studyAggregateUuid OR studyId)
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with created version UUID
     */
    @PostMapping
    public ResponseEntity<?> createVersion(
            @RequestBody CreateVersionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Creating protocol version: {} for study: {} or studyId: {}", 
                request.getVersionNumber(), request.getStudyAggregateUuid(), request.getStudyId());
        
        // Bridge Pattern: Resolve studyId to studyAggregateUuid if needed
        UUID studyAggregateUuid = request.getStudyAggregateUuid();
        
        if (studyAggregateUuid == null && request.getStudyId() != null) {
            // Resolve studyId to UUID
            try {
                // Try parsing as UUID first
                studyAggregateUuid = UUID.fromString(request.getStudyId());
                log.debug("REST: studyId is already UUID format");
            } catch (IllegalArgumentException e) {
                // Not a UUID, try as legacy ID
                try {
                    Long legacyId = Long.parseLong(request.getStudyId());
                    log.info("REST: Resolving legacy studyId {} to Study aggregate UUID", legacyId);
                    
                    StudyResponseDto study = studyQueryService.getStudyById(legacyId);
                    studyAggregateUuid = study.getStudyAggregateUuid();
                    
                    if (studyAggregateUuid == null) {
                        log.error("REST: Study {} has no aggregate UUID", legacyId);
                        return ResponseEntity.badRequest()
                            .body(Map.of("error", "Study " + legacyId + " has not been migrated to DDD yet"));
                    }
                    
                    log.info("REST: Resolved studyId {} to UUID {}", legacyId, studyAggregateUuid);
                    
                } catch (NumberFormatException nfe) {
                    log.error("REST: Invalid studyId format: {}", request.getStudyId());
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid studyId format: " + request.getStudyId()));
                }
            }
        }
        
        // Validate that we have a Study UUID
        if (studyAggregateUuid == null) {
            log.error("REST: Neither studyAggregateUuid nor studyId provided");
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Either studyAggregateUuid or studyId must be provided"));
        }
        
        // Validate other required fields
        if (request.getVersionNumber() == null || request.getVersionNumber().isBlank()) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Version number is required"));
        }
        
        if (request.getCreatedBy() == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Creator user ID is required"));
        }
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest,
            httpResponse,
            ProtocolApiConstants.PROTOCOL_VERSIONS_PATH,
            ProtocolApiConstants.DEPRECATION_MESSAGE,
            ProtocolApiConstants.SUNSET_DATE
        );
        
        try {
            UUID versionId = VersionIdentifier.newIdentifier().getValue();
            
            CreateProtocolVersionCommand command = CreateProtocolVersionCommand.builder()
                .versionId(versionId)
                .studyAggregateUuid(studyAggregateUuid)  // Use resolved UUID
                .versionNumber(VersionNumber.of(request.getVersionNumber()))
                .description(request.getDescription())
                .amendmentType(request.getAmendmentType())
                .changesSummary(request.getChangesSummary())
                .impactAssessment(request.getImpactAssessment())
                .requiresRegulatoryApproval(request.getRequiresRegulatoryApproval())
                .protocolChanges(request.getProtocolChanges())
                .icfChanges(request.getIcfChanges())
                .createdBy(request.getCreatedBy())
                .build();
            
            UUID createdId = commandService.createVersionSync(command);
            
            log.info("REST: Protocol version created with UUID: {}", createdId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdId);
            
        } catch (IllegalArgumentException e) {
            log.error("REST: Validation error creating version", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("REST: Error creating version", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create version: " + e.getMessage()));
        }
    }

    /**
     * Change version status
     * 
     * <p><b>New URL:</b> PUT /api/v1/study-design/protocol-versions/{id}/status</p>
     * <p><b>Old URL:</b> PUT /api/protocol-versions/{id}/status (deprecated)</p>
     * 
     * <p><b>⚠️ CRITICAL:</b> This endpoint REPLACES database triggers!
     * All status changes must go through this explicit API call.</p>
     * 
     * <p><b>Bridge Pattern:</b> Accepts version ID as String (can be UUID or legacy Long ID).
     * If legacy ID is provided, it will be resolved to aggregate UUID.</p>
     * 
     * @param id the protocol version ID (can be UUID or legacy Long ID)
     * @param request the status change request
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with status
     */
    @PutMapping(ProtocolApiConstants.STATUS)
    public ResponseEntity<?> changeStatus(
            @PathVariable String id,
            @Valid @RequestBody ChangeStatusRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest,
            httpResponse,
            ProtocolApiConstants.PROTOCOL_VERSIONS_PATH + ProtocolApiConstants.STATUS,
            ProtocolApiConstants.DEPRECATION_MESSAGE,
            ProtocolApiConstants.SUNSET_DATE
        );
        
        log.info("REST: Changing version status for ID: {} -> {}", id, request.getNewStatus());
        
        try {
            // Bridge Pattern: Resolve ID to aggregate UUID if needed
            UUID aggregateUuid;
            try {
                // First, try parsing as UUID
                aggregateUuid = UUID.fromString(id);
                log.info("REST: Parsed ID as UUID: {}", aggregateUuid);
            } catch (IllegalArgumentException e) {
                // If not a UUID, treat as legacy Long ID
                log.info("REST: ID is not UUID, resolving legacy ID: {}", id);
                try {
                    Long legacyId = Long.parseLong(id);
                    ProtocolVersionEntity version = queryService.findById(legacyId)
                        .orElseThrow(() -> new IllegalArgumentException("Protocol version not found: " + legacyId));
                    
                    aggregateUuid = version.getAggregateUuid();
                    if (aggregateUuid == null) {
                        log.error("REST: Version {} has no aggregate UUID - not migrated to DDD", legacyId);
                        return ResponseEntity.badRequest()
                            .body(Map.of("error", "Version " + legacyId + " has not been migrated to DDD yet"));
                    }
                    log.info("REST: Resolved legacy ID {} to aggregate UUID: {}", legacyId, aggregateUuid);
                } catch (NumberFormatException nfe) {
                    log.error("REST: ID is neither UUID nor valid Long: {}", id);
                    return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid version ID format: " + id));
                }
            }
            
            ChangeVersionStatusCommand command = ChangeVersionStatusCommand.builder()
                .versionId(aggregateUuid)
                .newStatus(request.getNewStatus())
                .reason(request.getReason())
                .userId(request.getUserId())
                .build();
            
            commandService.changeStatusSync(command);
            
            log.info("REST: Version status changed successfully");
            return ResponseEntity.ok().body(Map.of(
                "message", "Status updated successfully",
                "versionId", id,
                "newStatus", request.getNewStatus().name()
            ));
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("REST: Validation error changing status", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "VALIDATION_ERROR", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("REST: Error changing status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "INTERNAL_ERROR", "message", "Failed to update status: " + e.getMessage()));
        }
    }

    /**
     * Approve a protocol version
     * 
     * <p><b>New URL:</b> PUT /api/v1/study-design/protocol-versions/{id}/lifecycle/approve</p>
     * <p><b>Old URL:</b> PUT /api/protocol-versions/{id}/approve (deprecated)</p>
     * 
     * @param id the protocol version UUID
     * @param request the approval request
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with status
     */
    @PutMapping(value = {
        ProtocolApiConstants.LIFECYCLE_APPROVE,  // NEW: /{id}/lifecycle/approve
        "/{id}/approve"                           // OLD (deprecated): /{id}/approve
    })
    public ResponseEntity<Void> approveVersion(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveVersionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest,
            httpResponse,
            ProtocolApiConstants.PROTOCOL_VERSIONS_PATH + ProtocolApiConstants.LIFECYCLE_APPROVE,
            ProtocolApiConstants.DEPRECATION_MESSAGE,
            ProtocolApiConstants.SUNSET_DATE
        );
        
        log.info("REST: Approving version: {}", id);
        
        try {
            ApproveVersionCommand command = ApproveVersionCommand.builder()
                .versionId(id)
                .approvedBy(request.getApprovedBy())
                .approvedDate(request.getApprovedDate() != null ? request.getApprovedDate().atStartOfDay() : null)
                .effectiveDate(request.getEffectiveDate())
                .approvalComments(request.getApprovalComments())
                .build();
            
            commandService.approveVersionSync(command);
            
            log.info("REST: Version approved successfully");
            return ResponseEntity.ok().build();
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("REST: Validation error approving version", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("REST: Error approving version", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Activate a protocol version
     * 
     * <p><b>New URL:</b> PUT /api/v1/study-design/protocol-versions/{id}/lifecycle/activate</p>
     * <p><b>Old URL:</b> PUT /api/protocol-versions/{id}/activate (deprecated)</p>
     * 
     * <p>Makes version active and supersedes previous active version.</p>
     * 
     * @param id the protocol version UUID
     * @param request the activation request
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with status
     */
    @PutMapping(value = {
        ProtocolApiConstants.LIFECYCLE_ACTIVATE,  // NEW: /{id}/lifecycle/activate
        "/{id}/activate"                           // OLD (deprecated): /{id}/activate
    })
    public ResponseEntity<Void> activateVersion(
            @PathVariable UUID id,
            @Valid @RequestBody ActivateVersionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest,
            httpResponse,
            ProtocolApiConstants.PROTOCOL_VERSIONS_PATH + ProtocolApiConstants.LIFECYCLE_ACTIVATE,
            ProtocolApiConstants.DEPRECATION_MESSAGE,
            ProtocolApiConstants.SUNSET_DATE
        );
        
        log.info("REST: Activating version: {}", id);
        
        try {
            ActivateVersionCommand command = ActivateVersionCommand.builder()
                .versionId(id)
                .previousActiveVersionUuid(request.getPreviousActiveVersionUuid())
                .activationReason(request.getActivationReason())
                .activatedBy(request.getActivatedBy())
                .build();
            
            commandService.activateVersionSync(command);
            
            log.info("REST: Version activated successfully");
            return ResponseEntity.ok().build();
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("REST: Validation error activating version", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("REST: Error activating version", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update version details
     * 
     * <p><b>New URL:</b> PUT /api/v1/study-design/protocol-versions/{id}</p>
     * <p><b>Old URL:</b> PUT /api/protocol-versions/{id} (deprecated)</p>
     * 
     * <p>Only editable fields can be updated.</p>
     * 
     * @param id the protocol version UUID
     * @param request the update request
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with status
     */
    @PutMapping(ProtocolApiConstants.BY_ID)
    public ResponseEntity<Void> updateVersion(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateVersionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest,
            httpResponse,
            ProtocolApiConstants.PROTOCOL_VERSIONS_PATH + ProtocolApiConstants.BY_ID,
            ProtocolApiConstants.DEPRECATION_MESSAGE,
            ProtocolApiConstants.SUNSET_DATE
        );
        
        log.info("REST: Updating version details: {}", id);
        
        try {
            UpdateVersionDetailsCommand command = UpdateVersionDetailsCommand.builder()
                .versionId(id)
                .description(request.getDescription())
                .changesSummary(request.getChangesSummary())
                .impactAssessment(request.getImpactAssessment())
                .additionalNotes(request.getNotes())
                .protocolChanges(request.getProtocolChanges())
                .icfChanges(request.getIcfChanges())
                .updatedBy(request.getUpdatedBy())
                .build();
            
            commandService.updateDetailsSync(command);
            
            log.info("REST: Version details updated successfully");
            return ResponseEntity.ok().build();
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("REST: Validation error updating version", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("REST: Error updating version", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Withdraw a protocol version
     * 
     * <p><b>New URL:</b> DELETE /api/v1/study-design/protocol-versions/{id}</p>
     * <p><b>Old URL:</b> DELETE /api/protocol-versions/{id} (deprecated)</p>
     * 
     * @param id the protocol version UUID
     * @param request the withdrawal request
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with status
     */
    @DeleteMapping(ProtocolApiConstants.BY_ID)
    public ResponseEntity<Void> withdrawVersion(
            @PathVariable UUID id,
            @Valid @RequestBody WithdrawVersionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest,
            httpResponse,
            ProtocolApiConstants.PROTOCOL_VERSIONS_PATH + ProtocolApiConstants.BY_ID,
            ProtocolApiConstants.DEPRECATION_MESSAGE,
            ProtocolApiConstants.SUNSET_DATE
        );
        
        log.info("REST: Withdrawing version: {}", id);
        
        try {
            WithdrawVersionCommand command = WithdrawVersionCommand.builder()
                .versionId(id)
                .withdrawalReason(request.getWithdrawalReason())
                .withdrawnBy(request.getWithdrawnBy())
                .build();
            
            commandService.withdrawVersionSync(command);
            
            log.info("REST: Version withdrawn successfully");
            return ResponseEntity.ok().build();
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("REST: Validation error withdrawing version", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("REST: Error withdrawing version", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create version asynchronously
     * 
     * <p><b>New URL:</b> POST /api/v1/study-design/protocol-versions/async</p>
     * <p><b>Old URL:</b> POST /api/protocol-versions/async (deprecated)</p>
     * 
     * @param request the version creation request
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return CompletableFuture with ResponseEntity containing created version UUID
     */
    @PostMapping(ProtocolApiConstants.ASYNC)
    public CompletableFuture<ResponseEntity<UUID>> createVersionAsync(
            @Valid @RequestBody CreateVersionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest,
            httpResponse,
            ProtocolApiConstants.PROTOCOL_VERSIONS_PATH + ProtocolApiConstants.ASYNC,
            ProtocolApiConstants.DEPRECATION_MESSAGE,
            ProtocolApiConstants.SUNSET_DATE
        );
        
        log.info("REST: Creating protocol version asynchronously: {}", request.getVersionNumber());
        
        UUID versionId = VersionIdentifier.newIdentifier().getValue();
        
        CreateProtocolVersionCommand command = CreateProtocolVersionCommand.builder()
            .versionId(versionId)
            .studyAggregateUuid(request.getStudyAggregateUuid())
            .versionNumber(VersionNumber.of(request.getVersionNumber()))
            .description(request.getDescription())
            .amendmentType(request.getAmendmentType())
            .changesSummary(request.getChangesSummary())
            .impactAssessment(request.getImpactAssessment())
            .requiresRegulatoryApproval(request.getRequiresRegulatoryApproval())
            .protocolChanges(request.getProtocolChanges())
            .icfChanges(request.getIcfChanges())
            .createdBy(request.getCreatedBy())
            .build();
        
        return commandService.createVersion(command)
            .thenApply(createdId -> ResponseEntity.status(HttpStatus.CREATED).body(createdId))
            .exceptionally(ex -> {
                log.error("REST: Error creating version asynchronously", ex);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            });
    }
}



