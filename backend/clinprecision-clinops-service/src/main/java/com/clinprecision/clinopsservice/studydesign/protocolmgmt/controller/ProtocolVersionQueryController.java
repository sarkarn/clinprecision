package com.clinprecision.clinopsservice.studydesign.protocolmgmt.controller;

import com.clinprecision.clinopsservice.common.util.DeprecationHeaderUtil;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.api.ProtocolApiConstants;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionStatus;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.dto.VersionResponse;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.entity.ProtocolVersionEntity;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.service.ProtocolVersionQueryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Protocol Version Query Controller - DDD/CQRS Read Operations
 * 
 * <p>Handles all read operations for protocol versions following CQRS pattern.</p>
 * <p>Queries the read model (ProtocolVersionEntity) for optimized queries.</p>
 * 
 * <p><b>⚠️ URL MIGRATION IN PROGRESS</b></p>
 * <p>This controller supports both old and new URL patterns during the migration period.
 * Old URLs are deprecated and will be removed on April 19, 2026.</p>
 * 
 * <p><b>Old URLs (DEPRECATED):</b></p>
 * <ul>
 *   <li>GET /api/protocol-versions/{id} - Get version by UUID</li>
 *   <li>GET /api/protocol-versions/study/{studyUuid} - Get all versions for study</li>
 *   <li>GET /api/protocol-versions/study/{studyUuid}/active - Get active version</li>
 *   <li>GET /api/protocol-versions/study/{studyUuid}/status/{status} - Get versions by study and status</li>
 *   <li>GET /api/protocol-versions/status/{status} - Get versions by status</li>
 *   <li>GET /api/protocol-versions/awaiting-approval - Get versions awaiting approval</li>
 *   <li>GET /api/protocol-versions/db/{id} - Get version by database ID</li>
 *   <li>GET /api/protocol-versions/study/{studyUuid}/version/{versionNumber}/exists - Check if version exists</li>
 *   <li>GET /api/protocol-versions/study/{studyUuid}/status/{status}/count - Count versions</li>
 *   <li>GET /api/protocol-versions/all - Get all versions</li>
 * </ul>
 * 
 * <p><b>New URLs (RECOMMENDED):</b></p>
 * <ul>
 *   <li>GET /api/v1/study-design/protocol-versions/{id} - Get version by UUID</li>
 *   <li>GET /api/v1/study-design/studies/{studyUuid}/protocol-versions - Get versions for study</li>
 *   <li>GET /api/v1/study-design/studies/{studyUuid}/protocol-versions/active - Get active version</li>
 *   <li>GET /api/v1/study-design/studies/{studyUuid}/protocol-versions?status={status} - Filter by status</li>
 *   <li>GET /api/v1/study-design/protocol-versions?status={status} - Get versions by status</li>
 *   <li>GET /api/v1/study-design/protocol-versions?status=awaiting_approval - Awaiting approval</li>
 *   <li>GET /api/v1/study-design/protocol-versions/by-database-id/{id} - Get by database ID</li>
 *   <li>GET /api/v1/study-design/studies/{studyUuid}/protocol-versions/{versionNumber}/exists - Check exists</li>
 *   <li>GET /api/v1/study-design/studies/{studyUuid}/protocol-versions/count?status={status} - Count versions</li>
 *   <li>GET /api/v1/study-design/protocol-versions?includeAll=true - Get all versions</li>
 * </ul>
 * 
 * <p><b>Backward Compatibility:</b> Both URL patterns work during migration period.
 * Clients using old URLs will receive deprecation headers.</p>
 * 
 * @see ProtocolApiConstants
 * @see ProtocolVersionQueryService
 * @since October 2025 (URL Refactoring)
 */
@RestController
@RequestMapping({
    ProtocolApiConstants.PROTOCOL_VERSIONS_PATH,      // NEW: /api/v1/study-design/protocol-versions
    ProtocolApiConstants.LEGACY_PROTOCOL_VERSIONS     // OLD (deprecated): /api/protocol-versions
})
@RequiredArgsConstructor
@Slf4j
public class ProtocolVersionQueryController {

    private final ProtocolVersionQueryService queryService;

    /**
     * Get version by aggregate UUID
     * 
     * <p><b>New URL:</b> GET /api/v1/study-design/protocol-versions/{id}</p>
     * <p><b>Old URL:</b> GET /api/protocol-versions/{id} (deprecated)</p>
     * 
     * @param id the protocol version UUID
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with version details
     */
    @GetMapping(ProtocolApiConstants.BY_ID)
    public ResponseEntity<VersionResponse> getVersionByUuid(
            @PathVariable UUID id,
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
        
        log.info("REST: Querying version by UUID: {}", id);
        
        return queryService.findByAggregateUuid(id)
            .map(this::toResponse)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all versions for a study (with optional status filter)
     * 
     * <p><b>New URLs:</b></p>
     * <ul>
     *   <li>GET /api/v1/study-design/studies/{studyUuid}/protocol-versions</li>
     *   <li>GET /api/v1/study-design/studies/{studyUuid}/protocol-versions?status=DRAFT</li>
     * </ul>
     * 
     * <p><b>Old URLs (deprecated):</b></p>
     * <ul>
     *   <li>GET /api/protocol-versions/study/{studyUuid}</li>
     *   <li>GET /api/protocol-versions/study/{studyUuid}/status/{status}</li>
     * </ul>
     * 
     * @param studyUuid the study UUID
     * @param status optional status filter (query parameter)
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with list of versions
     */
    @GetMapping(value = {
        "/study/{studyUuid}",                           // OLD (deprecated)
        "/study/{studyUuid}/status/{status}"            // OLD (deprecated) - for backward compatibility
    })
    public ResponseEntity<List<VersionResponse>> getVersionsByStudyUuid(
        @PathVariable("studyUuid") String studyIdentifier,
            @PathVariable(required = false) VersionStatus status,
            @RequestParam(required = false) VersionStatus statusParam,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest,
            httpResponse,
            ProtocolApiConstants.STUDIES_PATH + ProtocolApiConstants.BY_STUDY,
            ProtocolApiConstants.DEPRECATION_MESSAGE,
            ProtocolApiConstants.SUNSET_DATE
        );
        
        // Determine which status to use (path variable takes precedence for backward compatibility)
        VersionStatus filterStatus = (status != null) ? status : statusParam;
        
        UUID studyUuid = parseUuid(studyIdentifier);
        Long legacyStudyId = (studyUuid == null) ? parseLegacyStudyId(studyIdentifier) : null;

        if (studyUuid == null && legacyStudyId == null) {
            log.warn("REST: Invalid study identifier received: {}", studyIdentifier);
            return ResponseEntity.badRequest().build();
        }

        if (filterStatus != null) {
            log.info("REST: Querying versions for study identifier {} with status {}", studyIdentifier, filterStatus);
            List<ProtocolVersionEntity> entities = (studyUuid != null)
                ? queryService.findByStudyUuidAndStatus(studyUuid, filterStatus)
                : queryService.findByStudyIdAndStatus(legacyStudyId, filterStatus);

            List<VersionResponse> versions = entities.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
            return ResponseEntity.ok(versions);
        }

        log.info("REST: Querying versions for study identifier: {}", studyIdentifier);
        List<ProtocolVersionEntity> entities = (studyUuid != null)
            ? queryService.findByStudyUuidOrderedByDate(studyUuid)
            : queryService.findByStudyIdOrderedByDate(legacyStudyId);

        List<VersionResponse> versions = entities.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(versions);
    }

    /**
     * Get active version for a study
     * 
     * <p><b>New URL:</b> GET /api/v1/study-design/studies/{studyUuid}/protocol-versions/active</p>
     * <p><b>Old URL:</b> GET /api/protocol-versions/study/{studyUuid}/active (deprecated)</p>
     * 
     * <p><b>⚠️ CRITICAL:</b> Only one version should be active per study.</p>
     * 
     * @param studyUuid the study UUID
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with active version
     */
    @GetMapping("/study/{studyUuid}/active")
    public ResponseEntity<VersionResponse> getActiveVersionByStudyUuid(
        @PathVariable("studyUuid") String studyIdentifier,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest,
            httpResponse,
            ProtocolApiConstants.STUDIES_PATH + ProtocolApiConstants.BY_STUDY_ACTIVE,
            ProtocolApiConstants.DEPRECATION_MESSAGE,
            ProtocolApiConstants.SUNSET_DATE
        );
        
        UUID studyUuid = parseUuid(studyIdentifier);
        Long legacyStudyId = (studyUuid == null) ? parseLegacyStudyId(studyIdentifier) : null;

        if (studyUuid == null && legacyStudyId == null) {
            log.warn("REST: Invalid study identifier received for active version lookup: {}", studyIdentifier);
            return ResponseEntity.badRequest().build();
        }

        log.info("REST: Querying active version for study identifier: {}", studyIdentifier);

        return ((studyUuid != null)
            ? queryService.findActiveVersionByStudyUuid(studyUuid)
            : queryService.findActiveVersionByStudyId(legacyStudyId))
            .map(this::toResponse)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get versions by status (with optional includeAll flag)
     * 
     * <p><b>New URLs:</b></p>
     * <ul>
     *   <li>GET /api/v1/study-design/protocol-versions?status=DRAFT</li>
     *   <li>GET /api/v1/study-design/protocol-versions?status=awaiting_approval</li>
     *   <li>GET /api/v1/study-design/protocol-versions?includeAll=true</li>
     * </ul>
     * 
     * <p><b>Old URLs (deprecated):</b></p>
     * <ul>
     *   <li>GET /api/protocol-versions/status/{status}</li>
     *   <li>GET /api/protocol-versions/awaiting-approval</li>
     *   <li>GET /api/protocol-versions/all</li>
     * </ul>
     * 
     * @param status optional status filter (query parameter)
     * @param pathStatus status from path variable (for backward compatibility)
     * @param includeAll flag to include all versions
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with list of versions
     */
    @GetMapping(value = {
        "",                                    // NEW: query param based
        "/status/{pathStatus}",                // OLD (deprecated): path-based
        "/awaiting-approval",                  // OLD (deprecated): specific endpoint
        "/all"                                 // OLD (deprecated): specific endpoint
    })
    public ResponseEntity<List<VersionResponse>> getVersionsByStatus(
            @RequestParam(required = false) VersionStatus status,
            @PathVariable(required = false) VersionStatus pathStatus,
            @RequestParam(required = false, defaultValue = "false") Boolean includeAll,
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
        
        // Determine which status to use (path variable takes precedence for backward compatibility)
        VersionStatus filterStatus = (pathStatus != null) ? pathStatus : status;
        
        // Handle /awaiting-approval endpoint (backward compatibility)
        String requestUri = httpRequest.getRequestURI();
        if (requestUri.endsWith("/awaiting-approval")) {
            log.info("REST: Querying versions awaiting regulatory approval");
            List<VersionResponse> versions = queryService.findVersionsAwaitingRegulatoryApproval()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
            return ResponseEntity.ok(versions);
        }
        
        // Handle /all endpoint (backward compatibility)
        if (requestUri.endsWith("/all") || includeAll) {
            log.info("REST: Querying all versions");
            List<VersionResponse> versions = queryService.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
            return ResponseEntity.ok(versions);
        }
        
        // Handle status filter
        if (filterStatus != null) {
            log.info("REST: Querying versions by status: {}", filterStatus);
            List<VersionResponse> versions = queryService.findByStatus(filterStatus)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
            return ResponseEntity.ok(versions);
        }
        
        // Default: return all versions
        log.info("REST: Querying all versions (default)");
        List<VersionResponse> versions = queryService.findAll()
            .stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(versions);
    }

    /**
     * Get version by database ID
     * 
     * <p><b>New URL:</b> GET /api/v1/study-design/protocol-versions/by-database-id/{id}</p>
     * <p><b>Old URL:</b> GET /api/protocol-versions/db/{id} (deprecated)</p>
     * 
     * @param id the database ID
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with version details
     */
    @GetMapping(value = {
        ProtocolApiConstants.BY_DATABASE_ID,   // NEW: /by-database-id/{id}
        "/db/{id}"                              // OLD (deprecated): /db/{id}
    })
    public ResponseEntity<VersionResponse> getVersionById(
            @PathVariable Long id,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest,
            httpResponse,
            ProtocolApiConstants.PROTOCOL_VERSIONS_PATH + ProtocolApiConstants.BY_DATABASE_ID,
            ProtocolApiConstants.DEPRECATION_MESSAGE,
            ProtocolApiConstants.SUNSET_DATE
        );
        
        log.info("REST: Querying version by database ID: {}", id);
        
        return queryService.findById(id)
            .map(this::toResponse)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Check if version number exists for a study
     * 
     * <p><b>New URL:</b> GET /api/v1/study-design/studies/{studyUuid}/protocol-versions/{versionNumber}/exists</p>
     * <p><b>Old URL:</b> GET /api/protocol-versions/study/{studyUuid}/version/{versionNumber}/exists (deprecated)</p>
     * 
     * @param studyUuid the study UUID
     * @param versionNumber the version number to check
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with boolean indicating existence
     */
    @GetMapping("/study/{studyUuid}/version/{versionNumber}/exists")
    public ResponseEntity<Boolean> versionNumberExists(
        @PathVariable("studyUuid") String studyIdentifier,
            @PathVariable String versionNumber,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest,
            httpResponse,
            ProtocolApiConstants.STUDIES_PATH + ProtocolApiConstants.BY_STUDY_VERSION_EXISTS,
            ProtocolApiConstants.DEPRECATION_MESSAGE,
            ProtocolApiConstants.SUNSET_DATE
        );
        
        UUID studyUuid = parseUuid(studyIdentifier);
        Long legacyStudyId = (studyUuid == null) ? parseLegacyStudyId(studyIdentifier) : null;

        if (studyUuid == null && legacyStudyId == null) {
            log.warn("REST: Invalid study identifier received while checking version existence: {}", studyIdentifier);
            return ResponseEntity.badRequest().build();
        }

        log.info("REST: Checking if version {} exists for study identifier {}", versionNumber, studyIdentifier);
        
        boolean exists = (studyUuid != null)
            ? queryService.versionNumberExists(studyUuid, versionNumber)
            : queryService.versionNumberExists(legacyStudyId, versionNumber);
        return ResponseEntity.ok(exists);
    }

    /**
     * Count versions by status for a study
     * 
     * <p><b>New URL:</b> GET /api/v1/study-design/studies/{studyUuid}/protocol-versions/count?status=DRAFT</p>
     * <p><b>Old URL:</b> GET /api/protocol-versions/study/{studyUuid}/status/{status}/count (deprecated)</p>
     * 
     * @param studyUuid the study UUID
     * @param status status from query parameter
     * @param pathStatus status from path variable (for backward compatibility)
     * @param httpRequest the HTTP servlet request
     * @param httpResponse the HTTP servlet response
     * @return ResponseEntity with count
     */
    @GetMapping(value = {
        "/study/{studyUuid}/protocol-versions/count",           // NEW: query param based
        "/study/{studyUuid}/status/{pathStatus}/count"          // OLD (deprecated): path-based
    })
    public ResponseEntity<Long> countVersionsByStatus(
        @PathVariable("studyUuid") String studyIdentifier,
            @RequestParam(required = false) VersionStatus status,
            @PathVariable(required = false) VersionStatus pathStatus,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest,
            httpResponse,
            ProtocolApiConstants.STUDIES_PATH + ProtocolApiConstants.BY_STUDY_COUNT,
            ProtocolApiConstants.DEPRECATION_MESSAGE,
            ProtocolApiConstants.SUNSET_DATE
        );
        
        // Determine which status to use (path variable takes precedence for backward compatibility)
        VersionStatus filterStatus = (pathStatus != null) ? pathStatus : status;
        
        UUID studyUuid = parseUuid(studyIdentifier);
        Long legacyStudyId = (studyUuid == null) ? parseLegacyStudyId(studyIdentifier) : null;

        if (studyUuid == null && legacyStudyId == null) {
            log.warn("REST: Invalid study identifier received while counting versions: {}", studyIdentifier);
            return ResponseEntity.badRequest().build();
        }

        if (filterStatus != null) {
            log.info("REST: Counting versions for study identifier {} with status {}", studyIdentifier, filterStatus);
            long count = (studyUuid != null)
                ? queryService.countByStudyUuidAndStatus(studyUuid, filterStatus)
                : queryService.countByStudyIdAndStatus(legacyStudyId, filterStatus);
            return ResponseEntity.ok(count);
        }

        log.info("REST: Counting all versions for study identifier {}", studyIdentifier);
        long count = (studyUuid != null)
            ? queryService.findByStudyUuidOrderedByDate(studyUuid).size()
            : queryService.findByStudyIdOrderedByDate(legacyStudyId).size();
        return ResponseEntity.ok(count);
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

    private UUID parseUuid(String identifier) {
        try {
            return UUID.fromString(identifier);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private Long parseLegacyStudyId(String identifier) {
        try {
            return Long.parseLong(identifier);
        } catch (NumberFormatException ex) {
            return null;
        }
    }
}



