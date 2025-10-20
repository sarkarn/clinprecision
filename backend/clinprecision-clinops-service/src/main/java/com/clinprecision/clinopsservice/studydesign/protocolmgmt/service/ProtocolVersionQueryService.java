package com.clinprecision.clinopsservice.studydesign.protocolmgmt.service;

import com.clinprecision.clinopsservice.studydesign.protocolmgmt.domain.valueobjects.VersionStatus;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.entity.ProtocolVersionEntity;
import com.clinprecision.clinopsservice.studydesign.protocolmgmt.repository.ProtocolVersionReadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Protocol Version Query Service - Read operations on the read model
 * 
 * Provides query operations for protocol versions.
 * Uses the read model (ProtocolVersionEntity) for optimized queries.
 * 
 * CQRS Pattern: This is the Query side - read-only operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProtocolVersionQueryService {

    private final ProtocolVersionReadRepository repository;

    /**
     * Find version by aggregate UUID
     */
    public Optional<ProtocolVersionEntity> findByAggregateUuid(UUID aggregateUuid) {
        log.debug("Querying version by aggregate UUID: {}", aggregateUuid);
        return repository.findByAggregateUuid(aggregateUuid);
    }

    /**
     * Find version by database ID
     */
    public Optional<ProtocolVersionEntity> findById(Long id) {
        log.debug("Querying version by ID: {}", id);
        return repository.findById(id);
    }

    /**
     * Find all versions for a study
     */
    public List<ProtocolVersionEntity> findByStudyUuid(UUID studyUuid) {
        log.debug("Querying versions for study: {}", studyUuid);
        return repository.findByStudyAggregateUuid(studyUuid);
    }

    /**
     * Find all versions for a study ordered by creation date
     */
    public List<ProtocolVersionEntity> findByStudyUuidOrderedByDate(UUID studyUuid) {
        log.debug("Querying versions for study ordered by date: {}", studyUuid);
        return repository.findByStudyAggregateUuidOrderByCreatedAtDesc(studyUuid);
    }

    /**
     * Find all versions for a legacy study ID ordered by creation date
     *
     * <p>Backward compatibility bridge while Study module migrates to UUID identifiers.</p>
     */
    public List<ProtocolVersionEntity> findByStudyIdOrderedByDate(Long studyId) {
        log.debug("Querying versions for legacy study ID ordered by date: {}", studyId);
        return repository.findByStudyIdOrderByCreatedAtDesc(studyId);
    }

    /**
     * Find versions by status
     */
    public List<ProtocolVersionEntity> findByStatus(VersionStatus status) {
        log.debug("Querying versions by status: {}", status);
        return repository.findByStatus(status);
    }

    /**
     * Find versions for a study by status
     */
    public List<ProtocolVersionEntity> findByStudyUuidAndStatus(UUID studyUuid, VersionStatus status) {
        log.debug("Querying versions for study {} with status {}", studyUuid, status);
        return repository.findByStudyAggregateUuidAndStatus(studyUuid, status);
    }

    /**
     * Find versions by legacy study ID and status.
     */
    public List<ProtocolVersionEntity> findByStudyIdAndStatus(Long studyId, VersionStatus status) {
        log.debug("Querying versions for legacy study ID {} with status {}", studyId, status);
        return repository.findByStudyIdAndStatus(studyId, status);
    }

    /**
     * Find active version for a study
     * CRITICAL: Only one version should be active per study
     */
    public Optional<ProtocolVersionEntity> findActiveVersionByStudyUuid(UUID studyUuid) {
        log.debug("Querying active version for study: {}", studyUuid);
        return repository.findActiveVersionByStudyUuid(studyUuid);
    }

    /**
     * Find active version for a legacy study ID.
     */
    public Optional<ProtocolVersionEntity> findActiveVersionByStudyId(Long studyId) {
        log.debug("Querying active version for legacy study ID: {}", studyId);
        return repository.findActiveVersionByStudyId(studyId);
    }

    /**
     * Find version by version number for a study
     */
    public Optional<ProtocolVersionEntity> findByStudyUuidAndVersionNumber(
            UUID studyUuid, 
            String versionNumber) {
        log.debug("Querying version {} for study {}", versionNumber, studyUuid);
        return repository.findByStudyAggregateUuidAndVersionNumber(studyUuid, versionNumber);
    }

    /**
     * Check if version number exists for a study
     */
    public boolean versionNumberExists(UUID studyUuid, String versionNumber) {
        log.debug("Checking if version {} exists for study {}", versionNumber, studyUuid);
        return repository.existsByStudyAggregateUuidAndVersionNumber(studyUuid, versionNumber);
    }

    /**
     * Check if a version number exists for a legacy study ID.
     */
    public boolean versionNumberExists(Long studyId, String versionNumber) {
        log.debug("Checking if version {} exists for legacy study ID {}", versionNumber, studyId);
        return repository.findByStudyIdOrderByCreatedAtDesc(studyId)
            .stream()
            .anyMatch(entity -> versionNumber.equals(entity.getVersionNumber()));
    }

    /**
     * Find versions awaiting regulatory approval
     */
    public List<ProtocolVersionEntity> findVersionsAwaitingRegulatoryApproval() {
        log.debug("Querying versions awaiting regulatory approval");
        return repository.findVersionsAwaitingRegulatoryApproval();
    }

    /**
     * Count versions by status for a study
     */
    public long countByStudyUuidAndStatus(UUID studyUuid, VersionStatus status) {
        log.debug("Counting versions for study {} with status {}", studyUuid, status);
        return repository.countByStudyAggregateUuidAndStatus(studyUuid, status);
    }

    /**
     * Count versions for a legacy study ID and status.
     */
    public long countByStudyIdAndStatus(Long studyId, VersionStatus status) {
        log.debug("Counting versions for legacy study ID {} with status {}", studyId, status);
        return repository.findByStudyIdAndStatus(studyId, status).size();
    }

    /**
     * Find all versions
     */
    public List<ProtocolVersionEntity> findAll() {
        log.debug("Querying all versions");
        return repository.findAll();
    }
}



