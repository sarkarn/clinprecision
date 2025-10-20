package com.clinprecision.clinopsservice.studydesign.protocolmgmt.controller;

import com.clinprecision.clinopsservice.common.util.DeprecationHeaderUtil;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.api.ProtocolApiConstants;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.commands.*;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionIdentifier;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionNumber;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.service.ProtocolVersionCommandService;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.dto.*;
import com.clinprecision.clinopsservice.studydesign.studymgmt.service.StudyQueryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    /**
     * Create a new protocol version
     * 
     * <p><b>New URL:</b> POST /api/v1/study-design/protocol-versions</p>
     * <p><b>Old URL:</b> POST /api/protocol-versions (deprecated)</p>
     * 
     * @param request the version creation request
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with created version UUID
     */
    @PostMapping
    public ResponseEntity<UUID> createVersion(
            @Valid @RequestBody CreateVersionRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest,
            httpResponse,
            ProtocolApiConstants.PROTOCOL_VERSIONS_PATH,
            ProtocolApiConstants.DEPRECATION_MESSAGE,
            ProtocolApiConstants.SUNSET_DATE
        );
        
        log.info("REST: Creating protocol version: {}", request.getVersionNumber());
        
        try {
            UUID versionId = VersionIdentifier.newIdentifier().getValue();
            
            StudyIdentifiers identifiers = resolveStudyIdentifiers(request);
            if (identifiers == null || identifiers.getStudyUuid() == null || identifiers.getStudyId() == null) {
                log.warn("REST: Unable to resolve study identifiers for request: {}", request);
                return ResponseEntity.badRequest().build();
            }

            CreateProtocolVersionCommand command = CreateProtocolVersionCommand.builder()
                .versionId(versionId)
                .studyAggregateUuid(identifiers.getStudyUuid())
                .studyId(identifiers.getStudyId())
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
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("REST: Error creating version", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
     * @param id the protocol version UUID
     * @param request the status change request
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with status
     */
    @PutMapping(ProtocolApiConstants.STATUS)
    public ResponseEntity<Void> changeStatus(
            @PathVariable UUID id,
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
        
        log.info("REST: Changing version status: {} -> {}", id, request.getNewStatus());
        
        try {
            ChangeVersionStatusCommand command = ChangeVersionStatusCommand.builder()
                .versionId(id)
                .newStatus(request.getNewStatus())
                .reason(request.getReason())
                .userId(request.getUserId())
                .build();
            
            commandService.changeStatusSync(command);
            
            log.info("REST: Version status changed successfully");
            return ResponseEntity.ok().build();
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.error("REST: Validation error changing status", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("REST: Error changing status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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

        StudyIdentifiers identifiers = resolveStudyIdentifiers(request);
        if (identifiers == null || identifiers.getStudyUuid() == null || identifiers.getStudyId() == null) {
            log.warn("REST: Unable to resolve study identifiers for async request: {}", request);
            return CompletableFuture.completedFuture(ResponseEntity.badRequest().build());
        }

        CreateProtocolVersionCommand command = CreateProtocolVersionCommand.builder()
            .versionId(versionId)
            .studyAggregateUuid(identifiers.getStudyUuid())
            .studyId(identifiers.getStudyId())
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

    private StudyIdentifiers resolveStudyIdentifiers(CreateVersionRequest request) {
        UUID providedUuid = request.getStudyAggregateUuid();
        Long providedLegacyId = request.getLegacyStudyId();

        if (providedUuid != null) {
            return studyQueryService.findStudyEntityByUuid(providedUuid)
                .map(entity -> {
                    if (providedLegacyId != null && !providedLegacyId.equals(entity.getId())) {
                        log.warn("REST: Legacy study ID {} does not match record {} for UUID {}", providedLegacyId, entity.getId(), providedUuid);
                    }
                    return new StudyIdentifiers(entity.getAggregateUuid(), entity.getId());
                })
                .orElseGet(() -> {
                    log.warn("REST: Study not found for provided UUID: {}", providedUuid);
                    if (providedLegacyId != null) {
                        return studyQueryService.findStudyEntityById(providedLegacyId)
                            .map(entity -> new StudyIdentifiers(entity.getAggregateUuid(), entity.getId()))
                            .orElse(null);
                    }
                    return null;
                });
        }

        if (providedLegacyId != null) {
            return studyQueryService.findStudyEntityById(providedLegacyId)
                .map(entity -> new StudyIdentifiers(entity.getAggregateUuid(), entity.getId()))
                .orElse(null);
        }

        return null;
    }

    private static final class StudyIdentifiers {
        private final UUID studyUuid;
        private final Long studyId;

        private StudyIdentifiers(UUID studyUuid, Long studyId) {
            this.studyUuid = studyUuid;
            this.studyId = studyId;
        }

        private UUID getStudyUuid() {
            return studyUuid;
        }

        private Long getStudyId() {
            return studyId;
        }
    }
}



