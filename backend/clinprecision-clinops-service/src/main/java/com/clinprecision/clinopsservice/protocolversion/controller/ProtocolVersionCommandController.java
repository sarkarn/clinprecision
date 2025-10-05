package com.clinprecision.clinopsservice.protocolversion.controller;

import com.clinprecision.clinopsservice.protocolversion.domain.commands.*;
import com.clinprecision.clinopsservice.protocolversion.domain.valueobjects.VersionIdentifier;
import com.clinprecision.clinopsservice.protocolversion.domain.valueobjects.VersionNumber;
import com.clinprecision.clinopsservice.protocolversion.dto.*;
import com.clinprecision.clinopsservice.protocolversion.service.ProtocolVersionCommandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Protocol Version Command Controller - Write operations (Commands)
 * 
 * Handles all write operations for protocol versions.
 * REPLACES DATABASE TRIGGERS with explicit REST API endpoints!
 * 
 * Endpoints:
 * - POST /api/protocol-versions - Create version
 * - PUT /api/protocol-versions/{id}/status - Change status (REPLACES TRIGGERS!)
 * - PUT /api/protocol-versions/{id}/approve - Approve version
 * - PUT /api/protocol-versions/{id}/activate - Activate version
 * - PUT /api/protocol-versions/{id} - Update version details
 * - DELETE /api/protocol-versions/{id} - Withdraw version
 */
@RestController
@RequestMapping("/api/protocol-versions")
@RequiredArgsConstructor
@Slf4j
public class ProtocolVersionCommandController {

    private final ProtocolVersionCommandService commandService;

    /**
     * Create a new protocol version
     * POST /api/protocol-versions
     */
    @PostMapping
    public ResponseEntity<UUID> createVersion(@Valid @RequestBody CreateVersionRequest request) {
        log.info("REST: Creating protocol version: {}", request.getVersionNumber());
        
        try {
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
     * PUT /api/protocol-versions/{id}/status
     * 
     * CRITICAL: This endpoint REPLACES database triggers!
     * All status changes must go through this explicit API call.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> changeStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeStatusRequest request) {
        
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
     * PUT /api/protocol-versions/{id}/approve
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approveVersion(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveVersionRequest request) {
        
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
     * PUT /api/protocol-versions/{id}/activate
     * 
     * Makes version active and supersedes previous active version
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<Void> activateVersion(
            @PathVariable UUID id,
            @Valid @RequestBody ActivateVersionRequest request) {
        
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
     * PUT /api/protocol-versions/{id}
     * 
     * Only editable fields can be updated
     */
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateVersion(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateVersionRequest request) {
        
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
     * DELETE /api/protocol-versions/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> withdrawVersion(
            @PathVariable UUID id,
            @Valid @RequestBody WithdrawVersionRequest request) {
        
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
     * POST /api/protocol-versions/async
     */
    @PostMapping("/async")
    public CompletableFuture<ResponseEntity<UUID>> createVersionAsync(
            @Valid @RequestBody CreateVersionRequest request) {
        
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



