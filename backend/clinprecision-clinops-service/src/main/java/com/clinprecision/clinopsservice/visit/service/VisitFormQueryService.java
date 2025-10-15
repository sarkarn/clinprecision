package com.clinprecision.clinopsservice.visit.service;

import com.clinprecision.clinopsservice.entity.VisitFormEntity;
import com.clinprecision.clinopsservice.entity.FormDefinitionEntity;
import com.clinprecision.clinopsservice.repository.VisitFormRepository;
import com.clinprecision.clinopsservice.visit.repository.StudyVisitInstanceRepository;
import com.clinprecision.clinopsservice.visit.dto.VisitFormDto;
import com.clinprecision.clinopsservice.visit.entity.StudyVisitInstanceEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for querying visit-form associations
 * Resolves Gap #2: Visit-Form Association
 * 
 * Returns forms associated with a visit instance based on protocol schedule
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VisitFormQueryService {

    private final StudyVisitInstanceRepository visitInstanceRepository;
    private final VisitFormRepository visitFormRepository;

    /**
     * Get all forms associated with a visit instance
     * 
     * Logic:
     * 1. Get visit instance by Long ID
     * 2. Get visit_definition_id from the instance
     * 3. Query visit_forms table for forms assigned to this visit definition
     * 4. For each form, check completion status in form_data table (TODO: Phase 2)
     * 5. Return enriched DTOs with form metadata and completion status
     * 
     * @param visitInstanceId Long ID of the visit instance (from study_visit_instances.id)
     * @return List of forms associated with this visit
     */
    @Transactional(readOnly = true)
    public List<VisitFormDto> getFormsForVisitInstance(Long visitInstanceId) {
        log.info("Fetching forms for visit instance: {}", visitInstanceId);

        // Step 1: Get visit instance
        StudyVisitInstanceEntity visitInstance = visitInstanceRepository.findById(visitInstanceId)
                .orElseThrow(() -> new RuntimeException("Visit instance not found: " + visitInstanceId));

        log.info("Found visit instance: visitId={}, subjectId={}, visit_definition_id={}", 
                 visitInstance.getId(), visitInstance.getSubjectId(), visitInstance.getVisitId());

        // Step 2: Check if this is a protocol visit or unscheduled visit
        if (visitInstance.getVisitId() == null) {
            log.warn("Visit instance {} is an unscheduled visit (visit_id is NULL). No protocol forms assigned.", 
                     visitInstanceId);
            return new ArrayList<>(); // Unscheduled visits don't have pre-defined forms
        }

        // Step 3: Query visit_forms table for this visit definition
        Long visitDefinitionId = visitInstance.getVisitId();
        List<VisitFormEntity> visitForms = visitFormRepository
                .findByVisitDefinitionIdOrderByDisplayOrderAsc(visitDefinitionId);

        log.info("Found {} form assignments for visit definition {}", visitForms.size(), visitDefinitionId);

        // Step 4: Map to DTOs
        return visitForms.stream()
                .map(vf -> mapToDto(vf, visitInstance))
                .collect(Collectors.toList());
    }

    /**
     * Get only required forms for a visit instance
     */
    @Transactional(readOnly = true)
    public List<VisitFormDto> getRequiredFormsForVisitInstance(Long visitInstanceId) {
        log.info("Fetching required forms for visit instance: {}", visitInstanceId);

        StudyVisitInstanceEntity visitInstance = visitInstanceRepository.findById(visitInstanceId)
                .orElseThrow(() -> new RuntimeException("Visit instance not found: " + visitInstanceId));

        if (visitInstance.getVisitId() == null) {
            return new ArrayList<>();
        }

        Long visitDefinitionId = visitInstance.getVisitId();
        List<VisitFormEntity> requiredForms = visitFormRepository
                .findByVisitDefinitionIdAndIsRequiredTrueOrderByDisplayOrderAsc(visitDefinitionId);

        log.info("Found {} required forms for visit definition {}", requiredForms.size(), visitDefinitionId);

        return requiredForms.stream()
                .map(vf -> mapToDto(vf, visitInstance))
                .collect(Collectors.toList());
    }

    /**
     * Get only optional forms for a visit instance
     */
    @Transactional(readOnly = true)
    public List<VisitFormDto> getOptionalFormsForVisitInstance(Long visitInstanceId) {
        log.info("Fetching optional forms for visit instance: {}", visitInstanceId);

        StudyVisitInstanceEntity visitInstance = visitInstanceRepository.findById(visitInstanceId)
                .orElseThrow(() -> new RuntimeException("Visit instance not found: " + visitInstanceId));

        if (visitInstance.getVisitId() == null) {
            return new ArrayList<>();
        }

        Long visitDefinitionId = visitInstance.getVisitId();
        List<VisitFormEntity> optionalForms = visitFormRepository
                .findByVisitDefinitionIdAndIsRequiredFalseOrderByDisplayOrderAsc(visitDefinitionId);

        log.info("Found {} optional forms for visit definition {}", optionalForms.size(), visitDefinitionId);

        return optionalForms.stream()
                .map(vf -> mapToDto(vf, visitInstance))
                .collect(Collectors.toList());
    }

    /**
     * Map VisitFormEntity to VisitFormDto with completion status
     * 
     * TODO Phase 2: Query form_data table to get actual completion status
     * For now, returns "not_started" as default
     */
    private VisitFormDto mapToDto(VisitFormEntity visitForm, StudyVisitInstanceEntity visitInstance) {
        FormDefinitionEntity formDef = visitForm.getFormDefinition();

        return VisitFormDto.builder()
                .formId(formDef.getId())
                .formName(formDef.getName())
                .formType(formDef.getFormType() != null ? formDef.getFormType().toString() : "UNKNOWN")
                .description(formDef.getDescription())
                .isRequired(visitForm.getIsRequired())
                .displayOrder(visitForm.getDisplayOrder())
                .instructions(visitForm.getInstructions())
                // TODO: Query form_data table for completion status
                .completionStatus("not_started") // Default for now
                .lastUpdated(null) // TODO: Get from form_data
                .updatedBy(null)   // TODO: Get from form_data
                // TODO: Get field counts from form template
                .fieldCount(null)
                .completedFieldCount(null)
                .build();
    }

    /**
     * Calculate visit completion percentage
     * Returns percentage of required forms that are complete
     * 
     * TODO: Implement after form_data querying is added
     */
    public Double calculateVisitCompletionPercentage(Long visitInstanceId) {
        List<VisitFormDto> requiredForms = getRequiredFormsForVisitInstance(visitInstanceId);
        
        if (requiredForms.isEmpty()) {
            return 100.0; // No required forms = 100% complete
        }

        long completedCount = requiredForms.stream()
                .filter(form -> "complete".equals(form.getCompletionStatus()))
                .count();

        return (completedCount * 100.0) / requiredForms.size();
    }

    /**
     * Check if visit is complete
     * Visit is complete when all required forms are complete
     */
    public boolean isVisitComplete(Long visitInstanceId) {
        Double completionPercentage = calculateVisitCompletionPercentage(visitInstanceId);
        return completionPercentage >= 100.0;
    }
}
