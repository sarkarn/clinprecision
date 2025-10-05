package com.clinprecision.clinopsservice.studydesign.service;

import com.clinprecision.clinopsservice.studydesign.entity.StudyEntity;
import com.clinprecision.clinopsservice.studydesign.repository.StudyReadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Study Query Service
 * 
 * Application service for study read operations (query side).
 * Following CQRS pattern: Queries against the read model for performance.
 * 
 * Responsibilities:
 * - Query read model via repository
 * - Aggregate query results
 * - Provide business-level query methods
 * - No command/aggregate interaction
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StudyQueryService {

    private final StudyReadRepository studyReadRepository;

    /**
     * Find study by ID
     */
    public Optional<StudyEntity> findById(Long id) {
        log.debug("Finding study by ID: {}", id);
        return studyReadRepository.findById(id);
    }

    /**
     * Find study by aggregate UUID
     * 
     * This is the primary lookup method for event sourcing.
     */
    public Optional<StudyEntity> findByAggregateUuid(UUID aggregateUuid) {
        log.debug("Finding study by aggregate UUID: {}", aggregateUuid);
        return studyReadRepository.findByAggregateUuid(aggregateUuid);
    }

    /**
     * Find study by protocol number
     */
    public Optional<StudyEntity> findByProtocolNumber(String protocolNumber) {
        log.debug("Finding study by protocol number: {}", protocolNumber);
        return studyReadRepository.findByProtocolNumber(protocolNumber);
    }

    /**
     * Find all studies
     */
    public List<StudyEntity> findAll() {
        log.debug("Finding all studies");
        return studyReadRepository.findAll();
    }

    /**
     * Find studies by status
     */
    public List<StudyEntity> findByStatus(String status) {
        log.debug("Finding studies by status: {}", status);
        return studyReadRepository.findByStatus(status);
    }

    /**
     * Find studies by sponsor
     */
    public List<StudyEntity> findBySponsor(String sponsor) {
        log.debug("Finding studies by sponsor: {}", sponsor);
        return studyReadRepository.findBySponsor(sponsor);
    }

    /**
     * Find studies by phase
     */
    public List<StudyEntity> findByPhase(String phase) {
        log.debug("Finding studies by phase: {}", phase);
        return studyReadRepository.findByPhase(phase);
    }

    /**
     * Find active (non-closed) studies
     */
    public List<StudyEntity> findActiveStudies() {
        log.debug("Finding active studies");
        return studyReadRepository.findByClosedFalse();
    }

    /**
     * Find closed studies
     */
    public List<StudyEntity> findClosedStudies() {
        log.debug("Finding closed studies");
        return studyReadRepository.findByClosedTrue();
    }

    /**
     * Find studies by sponsor and status
     */
    public List<StudyEntity> findBySponsorAndStatus(String sponsor, String status) {
        log.debug("Finding studies by sponsor: {} and status: {}", sponsor, status);
        return studyReadRepository.findBySponsorAndStatus(sponsor, status);
    }

    /**
     * Check if protocol number exists
     */
    public boolean protocolNumberExists(String protocolNumber) {
        log.debug("Checking if protocol number exists: {}", protocolNumber);
        return studyReadRepository.existsByProtocolNumber(protocolNumber);
    }

    /**
     * Check if aggregate UUID exists
     */
    public boolean aggregateExists(UUID aggregateUuid) {
        log.debug("Checking if aggregate exists: {}", aggregateUuid);
        return studyReadRepository.existsByAggregateUuid(aggregateUuid);
    }

    /**
     * Find studies created by user
     */
    public List<StudyEntity> findByCreatedBy(Long userId) {
        log.debug("Finding studies created by user: {}", userId);
        return studyReadRepository.findByCreatedBy(userId);
    }

    /**
     * Search studies by name or protocol number
     */
    public List<StudyEntity> searchByNameOrProtocol(String searchTerm) {
        log.debug("Searching studies by name or protocol: {}", searchTerm);
        return studyReadRepository.searchByNameOrProtocol(searchTerm);
    }

    /**
     * Find studies requiring review (regulatory submission or IRB review)
     */
    public List<StudyEntity> findStudiesRequiringReview() {
        log.debug("Finding studies requiring review");
        return studyReadRepository.findStudiesRequiringReview();
    }

    /**
     * Find operational studies (active or suspended)
     */
    public List<StudyEntity> findOperationalStudies() {
        log.debug("Finding operational studies");
        return studyReadRepository.findOperationalStudies();
    }

    /**
     * Get study count by status
     */
    public List<Object[]> getStudyCountByStatus() {
        log.debug("Getting study count by status");
        return studyReadRepository.countByStatus();
    }

    /**
     * Get total study count
     */
    public long getTotalStudyCount() {
        log.debug("Getting total study count");
        return studyReadRepository.count();
    }
}
