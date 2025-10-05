package com.clinprecision.clinopsservice.studydesign.controller;

import com.clinprecision.clinopsservice.studydesign.dto.StudyResponse;
import com.clinprecision.clinopsservice.studydesign.entity.StudyEntity;
import com.clinprecision.clinopsservice.study.service.StudyQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Study Query Controller
 * 
 * REST API for study read operations (query side).
 * Following CQRS pattern: Queries read from read model for performance.
 * 
 * Endpoints:
 * - GET /api/studies              - List all studies
 * - GET /api/studies/{id}         - Get study by ID
 * - GET /api/studies/uuid/{uuid}  - Get study by aggregate UUID
 * - GET /api/studies/protocol/{protocolNumber} - Get by protocol
 * - GET /api/studies/status/{status} - List by status
 * - GET /api/studies/search       - Search studies
 */
@RestController
@RequestMapping("/api/studies")
@RequiredArgsConstructor
@Slf4j
public class StudyQueryController {

    private final StudyQueryService studyQueryService;

    /**
     * Get all studies
     */
    @GetMapping
    public ResponseEntity<List<StudyResponse>> getAllStudies() {
        log.debug("REST: Getting all studies");
        
        List<StudyEntity> studies = studyQueryService.findAll();
        List<StudyResponse> response = studies.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get study by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<StudyResponse> getStudyById(@PathVariable Long id) {
        log.debug("REST: Getting study by ID: {}", id);
        
        return studyQueryService.findById(id)
            .map(this::toResponse)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get study by aggregate UUID
     */
    @GetMapping("/uuid/{uuid}")
    public ResponseEntity<StudyResponse> getStudyByUuid(@PathVariable UUID uuid) {
        log.debug("REST: Getting study by UUID: {}", uuid);
        
        return studyQueryService.findByAggregateUuid(uuid)
            .map(this::toResponse)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get study by protocol number
     */
    @GetMapping("/protocol/{protocolNumber}")
    public ResponseEntity<StudyResponse> getStudyByProtocol(@PathVariable String protocolNumber) {
        log.debug("REST: Getting study by protocol: {}", protocolNumber);
        
        return studyQueryService.findByProtocolNumber(protocolNumber)
            .map(this::toResponse)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * List studies by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<StudyResponse>> getStudiesByStatus(@PathVariable String status) {
        log.debug("REST: Getting studies by status: {}", status);
        
        List<StudyEntity> studies = studyQueryService.findByStatus(status);
        List<StudyResponse> response = studies.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * List studies by sponsor
     */
    @GetMapping("/sponsor/{sponsor}")
    public ResponseEntity<List<StudyResponse>> getStudiesBySponsor(@PathVariable String sponsor) {
        log.debug("REST: Getting studies by sponsor: {}", sponsor);
        
        List<StudyEntity> studies = studyQueryService.findBySponsor(sponsor);
        List<StudyResponse> response = studies.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * List studies by phase
     */
    @GetMapping("/phase/{phase}")
    public ResponseEntity<List<StudyResponse>> getStudiesByPhase(@PathVariable String phase) {
        log.debug("REST: Getting studies by phase: {}", phase);
        
        List<StudyEntity> studies = studyQueryService.findByPhase(phase);
        List<StudyResponse> response = studies.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get active studies
     */
    @GetMapping("/active")
    public ResponseEntity<List<StudyResponse>> getActiveStudies() {
        log.debug("REST: Getting active studies");
        
        List<StudyEntity> studies = studyQueryService.findActiveStudies();
        List<StudyResponse> response = studies.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get closed studies
     */
    @GetMapping("/closed")
    public ResponseEntity<List<StudyResponse>> getClosedStudies() {
        log.debug("REST: Getting closed studies");
        
        List<StudyEntity> studies = studyQueryService.findClosedStudies();
        List<StudyResponse> response = studies.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get operational studies (active or suspended)
     */
    @GetMapping("/operational")
    public ResponseEntity<List<StudyResponse>> getOperationalStudies() {
        log.debug("REST: Getting operational studies");
        
        List<StudyEntity> studies = studyQueryService.findOperationalStudies();
        List<StudyResponse> response = studies.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get studies requiring review
     */
    @GetMapping("/review")
    public ResponseEntity<List<StudyResponse>> getStudiesRequiringReview() {
        log.debug("REST: Getting studies requiring review");
        
        List<StudyEntity> studies = studyQueryService.findStudiesRequiringReview();
        List<StudyResponse> response = studies.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Search studies by name or protocol number
     */
    @GetMapping("/search")
    public ResponseEntity<List<StudyResponse>> searchStudies(@RequestParam String q) {
        log.debug("REST: Searching studies: {}", q);
        
        List<StudyEntity> studies = studyQueryService.searchByNameOrProtocol(q);
        List<StudyResponse> response = studies.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get study count by status
     */
    @GetMapping("/statistics/status")
    public ResponseEntity<List<Object[]>> getStudyCountByStatus() {
        log.debug("REST: Getting study count by status");
        return ResponseEntity.ok(studyQueryService.getStudyCountByStatus());
    }

    /**
     * Get total study count
     */
    @GetMapping("/statistics/total")
    public ResponseEntity<Long> getTotalStudyCount() {
        log.debug("REST: Getting total study count");
        return ResponseEntity.ok(studyQueryService.getTotalStudyCount());
    }

    /**
     * Check if protocol number exists
     */
    @GetMapping("/check/protocol/{protocolNumber}")
    public ResponseEntity<Boolean> checkProtocolExists(@PathVariable String protocolNumber) {
        log.debug("REST: Checking if protocol exists: {}", protocolNumber);
        return ResponseEntity.ok(studyQueryService.protocolNumberExists(protocolNumber));
    }

    /**
     * Convert entity to response DTO
     */
    private StudyResponse toResponse(StudyEntity entity) {
        return StudyResponse.builder()
            .id(entity.getId())
            .aggregateUuid(entity.getAggregateUuid())
            .name(entity.getName())
            .description(entity.getDescription())
            .sponsor(entity.getSponsor())
            .protocolNumber(entity.getProtocolNumber())
            .phase(entity.getPhase())
            .status(entity.getStatus())
            .statusId(entity.getStatusId())
            .indication(entity.getIndication())
            .studyType(entity.getStudyType())
            .principalInvestigator(entity.getPrincipalInvestigator())
            .plannedSubjects(entity.getPlannedSubjects())
            .plannedSites(entity.getPlannedSites())
            .plannedStartDate(entity.getPlannedStartDate())
            .plannedEndDate(entity.getPlannedEndDate())
            .actualStartDate(entity.getActualStartDate())
            .actualEndDate(entity.getActualEndDate())
            .closed(entity.getClosed())
            .closureReason(entity.getClosureReason())
            .closureNotes(entity.getClosureNotes())
            .closedBy(entity.getClosedBy())
            .closedAt(entity.getClosedAt())
            .createdBy(entity.getCreatedBy())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
