package com.clinprecision.clinopsservice.studydesign.service;

import com.clinprecision.clinopsservice.studydesign.dto.FormAssignmentResponse;
import com.clinprecision.clinopsservice.studydesign.dto.StudyArmResponse;
import com.clinprecision.clinopsservice.studydesign.dto.StudyDesignResponse;
import com.clinprecision.clinopsservice.studydesign.dto.VisitDefinitionResponse;
import com.clinprecision.clinopsservice.studydesign.repository.StudyArmReadRepository;
import com.clinprecision.clinopsservice.studydesign.repository.VisitDefinitionReadRepository;
import com.clinprecision.clinopsservice.studydesign.repository.VisitFormReadRepository;
import com.clinprecision.clinopsservice.entity.StudyArmEntity;
import com.clinprecision.clinopsservice.entity.VisitDefinitionEntity;
import com.clinprecision.clinopsservice.entity.VisitFormEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for querying StudyDesign read models
 * Transforms entities to DTOs for API responses
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudyDesignQueryService {

    private final StudyArmReadRepository armRepository;
    private final VisitDefinitionReadRepository visitRepository;
    private final VisitFormReadRepository visitFormRepository;

    /**
     * Get complete study design
     */
    @Transactional(readOnly = true)
    public StudyDesignResponse getStudyDesign(UUID studyDesignId) {
        log.info("Fetching complete study design: {}", studyDesignId);
        
        return StudyDesignResponse.builder()
            .arms(getStudyArms(studyDesignId))
            .visits(getVisits(studyDesignId))
            .formAssignments(getFormAssignments(studyDesignId))
            .build();
    }

    /**
     * Get all study arms
     */
    @Transactional(readOnly = true)
    public List<StudyArmResponse> getStudyArms(UUID studyDesignId) {
        log.info("Fetching study arms for design: {}", studyDesignId);
        
        return armRepository.findAllByAggregateUuid(studyDesignId).stream()
            .map(this::toArmResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get specific study arm
     */
    @Transactional(readOnly = true)
    public StudyArmResponse getStudyArm(UUID studyDesignId, UUID armId) {
        log.info("Fetching study arm {} from design: {}", armId, studyDesignId);
        
        return armRepository.findByAggregateUuidAndArmUuid(studyDesignId, armId)
            .map(this::toArmResponse)
            .orElseThrow(() -> new IllegalArgumentException("Study arm not found: " + armId));
    }

    /**
     * Get all visits
     */
    @Transactional(readOnly = true)
    public List<VisitDefinitionResponse> getVisits(UUID studyDesignId) {
        log.info("Fetching visits for design: {}", studyDesignId);
        
        return visitRepository.findAllByAggregateUuid(studyDesignId).stream()
            .map(this::toVisitResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get general (non-arm-specific) visits
     */
    @Transactional(readOnly = true)
    public List<VisitDefinitionResponse> getGeneralVisits(UUID studyDesignId) {
        log.info("Fetching general visits for design: {}", studyDesignId);
        
        return visitRepository.findGeneralVisitsByAggregateUuid(studyDesignId).stream()
            .map(this::toVisitResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get arm-specific visits
     */
    @Transactional(readOnly = true)
    public List<VisitDefinitionResponse> getArmSpecificVisits(UUID studyDesignId, UUID armId) {
        log.info("Fetching arm-specific visits for arm {} in design: {}", armId, studyDesignId);
        
        return visitRepository.findArmSpecificVisits(studyDesignId, armId).stream()
            .map(this::toVisitResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get specific visit
     */
    @Transactional(readOnly = true)
    public VisitDefinitionResponse getVisit(UUID studyDesignId, UUID visitId) {
        log.info("Fetching visit {} from design: {}", visitId, studyDesignId);
        
        return visitRepository.findByAggregateUuidAndVisitUuid(studyDesignId, visitId)
            .map(this::toVisitResponse)
            .orElseThrow(() -> new IllegalArgumentException("Visit not found: " + visitId));
    }

    /**
     * Get visits by type
     */
    @Transactional(readOnly = true)
    public List<VisitDefinitionResponse> getVisitsByType(UUID studyDesignId, String visitType) {
        log.info("Fetching visits of type {} for design: {}", visitType, studyDesignId);
        
        VisitDefinitionEntity.VisitType type = VisitDefinitionEntity.VisitType.valueOf(visitType);
        return visitRepository.findByVisitType(studyDesignId, type).stream()
            .map(this::toVisitResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get all form assignments
     */
    @Transactional(readOnly = true)
    public List<FormAssignmentResponse> getFormAssignments(UUID studyDesignId) {
        log.info("Fetching form assignments for design: {}", studyDesignId);
        
        return visitFormRepository.findAllByAggregateUuid(studyDesignId).stream()
            .map(this::toFormAssignmentResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get form assignments for a visit
     */
    @Transactional(readOnly = true)
    public List<FormAssignmentResponse> getFormAssignmentsByVisit(UUID studyDesignId, UUID visitId) {
        log.info("Fetching form assignments for visit {} in design: {}", visitId, studyDesignId);
        
        return visitFormRepository.findByVisitUuid(studyDesignId, visitId).stream()
            .map(this::toFormAssignmentResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get required forms for a visit
     */
    @Transactional(readOnly = true)
    public List<FormAssignmentResponse> getRequiredForms(UUID studyDesignId, UUID visitId) {
        log.info("Fetching required forms for visit {} in design: {}", visitId, studyDesignId);
        
        return visitFormRepository.findRequiredFormsByVisit(studyDesignId, visitId).stream()
            .map(this::toFormAssignmentResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get specific form assignment
     */
    @Transactional(readOnly = true)
    public FormAssignmentResponse getFormAssignment(UUID studyDesignId, UUID assignmentId) {
        log.info("Fetching form assignment {} from design: {}", assignmentId, studyDesignId);
        
        return visitFormRepository.findByAggregateUuidAndAssignmentUuid(studyDesignId, assignmentId)
            .map(this::toFormAssignmentResponse)
            .orElseThrow(() -> new IllegalArgumentException("Form assignment not found: " + assignmentId));
    }

    // ===================== MAPPING METHODS =====================

    private StudyArmResponse toArmResponse(StudyArmEntity entity) {
        return StudyArmResponse.builder()
            .armId(entity.getArmUuid())
            .name(entity.getName())
            .description(entity.getDescription())
            .type(entity.getType().name())
            .sequenceNumber(entity.getSequence())
            .plannedSubjects(entity.getPlannedSubjects())
            .isDeleted(entity.getIsDeleted())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    private VisitDefinitionResponse toVisitResponse(VisitDefinitionEntity entity) {
        return VisitDefinitionResponse.builder()
            .visitId(entity.getVisitUuid())
            .name(entity.getName())
            .description(entity.getDescription())
            .timepoint(entity.getTimepoint())
            .windowBefore(entity.getWindowBefore())
            .windowAfter(entity.getWindowAfter())
            .visitType(entity.getVisitType().name())
            .isRequired(entity.getIsRequired())
            .sequenceNumber(entity.getSequenceNumber())
            .armId(entity.getArmUuid())
            .isDeleted(entity.getIsDeleted())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    private FormAssignmentResponse toFormAssignmentResponse(VisitFormEntity entity) {
        return FormAssignmentResponse.builder()
            .assignmentId(entity.getAssignmentUuid())
            .visitId(entity.getVisitUuid())
            .formId(entity.getFormUuid())
            .isRequired(entity.getIsRequired())
            .isConditional(entity.getIsConditional())
            .conditionalLogic(entity.getConditionalLogic())
            .displayOrder(entity.getDisplayOrder())
            .instructions(entity.getInstructions())
            .isDeleted(entity.getIsDeleted())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
