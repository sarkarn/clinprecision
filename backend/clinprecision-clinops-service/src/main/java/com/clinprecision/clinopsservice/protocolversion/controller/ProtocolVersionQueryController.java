package com.clinprecision.clinopsservice.protocolversion.controller;

import com.clinprecision.clinopsservice.protocolversion.domain.valueobjects.VersionStatus;
import com.clinprecision.clinopsservice.protocolversion.dto.VersionResponse;
import com.clinprecision.clinopsservice.protocolversion.entity.ProtocolVersionEntity;
import com.clinprecision.clinopsservice.protocolversion.service.ProtocolVersionQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Protocol Version Query Controller - Read operations (Queries)
 * 
 * Handles all read operations for protocol versions.
 * Queries the read model (ProtocolVersionEntity) for optimized queries.
 * 
 * Endpoints:
 * - GET /api/protocol-versions/{id} - Get version by UUID
 * - GET /api/protocol-versions/study/{studyUuid} - Get all versions for study
 * - GET /api/protocol-versions/study/{studyUuid}/active - Get active version
 * - GET /api/protocol-versions/status/{status} - Get versions by status
 * - GET /api/protocol-versions/awaiting-approval - Get versions awaiting approval
 */
@RestController
@RequestMapping("/api/protocol-versions")
@RequiredArgsConstructor
@Slf4j
public class ProtocolVersionQueryController {

    private final ProtocolVersionQueryService queryService;

    /**
     * Get version by aggregate UUID
     * GET /api/protocol-versions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<VersionResponse> getVersionByUuid(@PathVariable UUID id) {
        log.info("REST: Querying version by UUID: {}", id);
        
        return queryService.findByAggregateUuid(id)
            .map(this::toResponse)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all versions for a study
     * GET /api/protocol-versions/study/{studyUuid}
     */
    @GetMapping("/study/{studyUuid}")
    public ResponseEntity<List<VersionResponse>> getVersionsByStudyUuid(@PathVariable UUID studyUuid) {
        log.info("REST: Querying versions for study: {}", studyUuid);
        
        List<VersionResponse> versions = queryService.findByStudyUuidOrderedByDate(studyUuid)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(versions);
    }

    /**
     * Get active version for a study
     * GET /api/protocol-versions/study/{studyUuid}/active
     * 
     * CRITICAL: Only one version should be active per study
     */
    @GetMapping("/study/{studyUuid}/active")
    public ResponseEntity<VersionResponse> getActiveVersionByStudyUuid(@PathVariable UUID studyUuid) {
        log.info("REST: Querying active version for study: {}", studyUuid);
        
        return queryService.findActiveVersionByStudyUuid(studyUuid)
            .map(this::toResponse)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get versions for a study by status
     * GET /api/protocol-versions/study/{studyUuid}/status/{status}
     */
    @GetMapping("/study/{studyUuid}/status/{status}")
    public ResponseEntity<List<VersionResponse>> getVersionsByStudyUuidAndStatus(
            @PathVariable UUID studyUuid,
            @PathVariable VersionStatus status) {
        
        log.info("REST: Querying versions for study {} with status {}", studyUuid, status);
        
        List<VersionResponse> versions = queryService.findByStudyUuidAndStatus(studyUuid, status)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(versions);
    }

    /**
     * Get versions by status
     * GET /api/protocol-versions/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<VersionResponse>> getVersionsByStatus(@PathVariable VersionStatus status) {
        log.info("REST: Querying versions by status: {}", status);
        
        List<VersionResponse> versions = queryService.findByStatus(status)
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(versions);
    }

    /**
     * Get versions awaiting regulatory approval
     * GET /api/protocol-versions/awaiting-approval
     */
    @GetMapping("/awaiting-approval")
    public ResponseEntity<List<VersionResponse>> getVersionsAwaitingApproval() {
        log.info("REST: Querying versions awaiting regulatory approval");
        
        List<VersionResponse> versions = queryService.findVersionsAwaitingRegulatoryApproval()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(versions);
    }

    /**
     * Get version by database ID
     * GET /api/protocol-versions/db/{id}
     */
    @GetMapping("/db/{id}")
    public ResponseEntity<VersionResponse> getVersionById(@PathVariable Long id) {
        log.info("REST: Querying version by database ID: {}", id);
        
        return queryService.findById(id)
            .map(this::toResponse)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Check if version number exists for a study
     * GET /api/protocol-versions/study/{studyUuid}/version/{versionNumber}/exists
     */
    @GetMapping("/study/{studyUuid}/version/{versionNumber}/exists")
    public ResponseEntity<Boolean> versionNumberExists(
            @PathVariable UUID studyUuid,
            @PathVariable String versionNumber) {
        
        log.info("REST: Checking if version {} exists for study {}", versionNumber, studyUuid);
        
        boolean exists = queryService.versionNumberExists(studyUuid, versionNumber);
        return ResponseEntity.ok(exists);
    }

    /**
     * Count versions by status for a study
     * GET /api/protocol-versions/study/{studyUuid}/status/{status}/count
     */
    @GetMapping("/study/{studyUuid}/status/{status}/count")
    public ResponseEntity<Long> countVersionsByStatus(
            @PathVariable UUID studyUuid,
            @PathVariable VersionStatus status) {
        
        log.info("REST: Counting versions for study {} with status {}", studyUuid, status);
        
        long count = queryService.countByStudyUuidAndStatus(studyUuid, status);
        return ResponseEntity.ok(count);
    }

    /**
     * Get all versions (admin endpoint)
     * GET /api/protocol-versions/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<VersionResponse>> getAllVersions() {
        log.info("REST: Querying all versions");
        
        List<VersionResponse> versions = queryService.findAll()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(versions);
    }

    /**
     * Convert entity to response DTO
     */
    private VersionResponse toResponse(ProtocolVersionEntity entity) {
        return VersionResponse.builder()
            .id(entity.getId())
            .aggregateUuid(entity.getAggregateUuid())
            .studyAggregateUuid(entity.getStudyAggregateUuid())
            .versionNumber(entity.getVersionNumber())
            .status(entity.getStatus())
            .amendmentType(entity.getAmendmentType())
            .description(entity.getDescription())
            .changesSummary(entity.getChangesSummary())
            .impactAssessment(entity.getImpactAssessment())
            .requiresRegulatoryApproval(entity.getRequiresRegulatoryApproval())
            .submissionDate(entity.getSubmissionDate())
            .approvalDate(entity.getApprovalDate())
            .effectiveDate(entity.getEffectiveDate())
            .notes(entity.getNotes())
            .protocolChanges(entity.getProtocolChanges())
            .icfChanges(entity.getIcfChanges())
            .approvedBy(entity.getApprovedBy())
            .approvalComments(entity.getApprovalComments())
            .previousActiveVersionUuid(entity.getPreviousActiveVersionUuid())
            .withdrawalReason(entity.getWithdrawalReason())
            .withdrawnBy(entity.getWithdrawnBy())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
