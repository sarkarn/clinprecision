package com.clinprecision.clinopsservice.studyoperation.visit.service;

import com.clinprecision.clinopsservice.studydesign.build.entity.VisitFormEntity;
import com.clinprecision.clinopsservice.studydesign.design.form.entity.FormDefinitionEntity;
import com.clinprecision.clinopsservice.studydesign.build.repository.VisitFormRepository;
import com.clinprecision.clinopsservice.studyoperation.visit.repository.StudyVisitInstanceRepository;
import com.clinprecision.clinopsservice.studyoperation.visit.dto.VisitFormDto;
import com.clinprecision.clinopsservice.studyoperation.visit.entity.StudyVisitInstanceEntity;
import com.clinprecision.clinopsservice.studyoperation.datacapture.formdata.entity.StudyFormDataEntity;
import com.clinprecision.clinopsservice.studyoperation.datacapture.formdata.repository.StudyFormDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
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
    private final StudyFormDataRepository formDataRepository;

    /**
     * Get all forms associated with a visit instance
     * 
     * CRITICAL FIX (Oct 16, 2025): Now filters by build_id to ensure protocol version consistency
     * 
     * Logic:
     * 1. Get visit instance by Long ID
     * 2. Get visit_definition_id AND build_id from the instance
     * 3. Query visit_forms table for forms assigned to this visit definition IN THIS BUILD VERSION
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

        log.info("Found visit instance: visitId={}, subjectId={}, visit_definition_id={}, buildId={}, aggregateUuid={}", 
                 visitInstance.getId(), visitInstance.getSubjectId(), visitInstance.getVisitId(), 
                 visitInstance.getBuildId(), visitInstance.getAggregateUuid());

        // Step 2: Check if this is a protocol visit or unscheduled visit
        if (visitInstance.getVisitId() == null) {
            log.info("Visit instance {} is an unscheduled visit (visit_id is NULL). Querying forms by visit UUID.", 
                     visitInstanceId);
            
            // For unscheduled visits, query by visit_uuid
            UUID visitUuid = UUID.fromString(visitInstance.getAggregateUuid());
            List<VisitFormEntity> visitForms = visitFormRepository.findByVisitUuidOnly(visitUuid);
            
            log.info("Found {} forms assigned to unscheduled visit UUID {}", visitForms.size(), visitUuid);
            
            return visitForms.stream()
                    .map(vf -> mapToDto(vf, visitInstance))
                    .collect(Collectors.toList());
        }

        // CRITICAL: Extract build_id from visit instance
        Long buildId = visitInstance.getBuildId();
        if (buildId == null) {
            log.error("CRITICAL DATA INTEGRITY ERROR: Visit instance {} has NULL build_id! " +
                     "This should not happen for visits created after Oct 16, 2025. " +
                     "Falling back to unfiltered query for legacy data.", visitInstanceId);
            // Fallback for legacy data - use old query without build filtering
            return getLegacyFormsForVisitInstance(visitInstance);
        }

        // Step 3: Query visit_forms table for this visit definition IN THIS BUILD VERSION
        Long visitDefinitionId = visitInstance.getVisitId();
        List<VisitFormEntity> visitForms = visitFormRepository
                .findByVisitDefinitionIdAndBuildIdOrderByDisplayOrderAsc(visitDefinitionId, buildId);

        log.info("Found {} form assignments for visit definition {} in build {}", 
                 visitForms.size(), visitDefinitionId, buildId);

        // Step 4: Map to DTOs
        return visitForms.stream()
                .map(vf -> mapToDto(vf, visitInstance))
                .collect(Collectors.toList());
    }

    /**
     * Get only required forms for a visit instance
     * CRITICAL FIX: Now filters by build_id
     */
    @Transactional(readOnly = true)
    public List<VisitFormDto> getRequiredFormsForVisitInstance(Long visitInstanceId) {
        log.info("Fetching required forms for visit instance: {}", visitInstanceId);

        StudyVisitInstanceEntity visitInstance = visitInstanceRepository.findById(visitInstanceId)
                .orElseThrow(() -> new RuntimeException("Visit instance not found: " + visitInstanceId));

        if (visitInstance.getVisitId() == null) {
            return new ArrayList<>();
        }

        Long buildId = visitInstance.getBuildId();
        if (buildId == null) {
            log.error("Visit instance {} has NULL build_id. Using legacy fallback.", visitInstanceId);
            return getLegacyRequiredFormsForVisitInstance(visitInstance);
        }

        Long visitDefinitionId = visitInstance.getVisitId();
        List<VisitFormEntity> requiredForms = visitFormRepository
                .findByVisitDefinitionIdAndBuildIdAndIsRequiredTrueOrderByDisplayOrderAsc(
                        visitDefinitionId, buildId);

        log.info("Found {} required forms for visit definition {} in build {}", 
                 requiredForms.size(), visitDefinitionId, buildId);

        return requiredForms.stream()
                .map(vf -> mapToDto(vf, visitInstance))
                .collect(Collectors.toList());
    }

    /**
     * Get only optional forms for a visit instance
     * CRITICAL FIX: Now filters by build_id
     */
    @Transactional(readOnly = true)
    public List<VisitFormDto> getOptionalFormsForVisitInstance(Long visitInstanceId) {
        log.info("Fetching optional forms for visit instance: {}", visitInstanceId);

        StudyVisitInstanceEntity visitInstance = visitInstanceRepository.findById(visitInstanceId)
                .orElseThrow(() -> new RuntimeException("Visit instance not found: " + visitInstanceId));

        if (visitInstance.getVisitId() == null) {
            return new ArrayList<>();
        }

        Long buildId = visitInstance.getBuildId();
        if (buildId == null) {
            log.error("Visit instance {} has NULL build_id. Using legacy fallback.", visitInstanceId);
            return getLegacyOptionalFormsForVisitInstance(visitInstance);
        }

        Long visitDefinitionId = visitInstance.getVisitId();
        List<VisitFormEntity> optionalForms = visitFormRepository
                .findByVisitDefinitionIdAndBuildIdAndIsRequiredFalseOrderByDisplayOrderAsc(
                        visitDefinitionId, buildId);

        log.info("Found {} optional forms for visit definition {} in build {}", 
                 optionalForms.size(), visitDefinitionId, buildId);

        return optionalForms.stream()
                .map(vf -> mapToDto(vf, visitInstance))
                .collect(Collectors.toList());
    }

    /**
     * Map VisitFormEntity to VisitFormDto with completion status
     * 
     * Queries study_form_data table to get real completion status
     */
    private VisitFormDto mapToDto(VisitFormEntity visitForm, StudyVisitInstanceEntity visitInstance) {
        FormDefinitionEntity formDef = visitForm.getFormDefinition();

        // Get real completion status from study_form_data table
        String completionStatus = getFormCompletionStatus(visitInstance.getId(), formDef.getId());
        LocalDateTime lastUpdated = getLastUpdated(visitInstance.getId(), formDef.getId());
        Long updatedBy = getUpdatedBy(visitInstance.getId(), formDef.getId());

        return VisitFormDto.builder()
                .formId(formDef.getId())
                .formName(formDef.getName())
                .formType(formDef.getFormType() != null ? formDef.getFormType().toString() : "UNKNOWN")
                .description(formDef.getDescription())
                .isRequired(visitForm.getIsRequired())
                .displayOrder(visitForm.getDisplayOrder())
                .instructions(visitForm.getInstructions())
                .completionStatus(completionStatus)
                .lastUpdated(lastUpdated)
                .updatedBy(updatedBy)
                // TODO Phase 3: Get field counts from form template
                .fieldCount(null)
                .completedFieldCount(null)
                .build();
    }

    /**
     * Get form completion status from study_form_data table
     * 
     * Logic:
     * 1. Query for most recent form submission for this visit+form
     * 2. If no record → "not_started"
     * 3. If status = SUBMITTED or LOCKED → "complete"
     * 4. If status = DRAFT with data → "in_progress"
     * 5. Else → "not_started"
     * 
     * @param visitInstanceId ID of the visit instance
     * @param formId ID of the form definition
     * @return Completion status: "not_started", "in_progress", or "complete"
     */
    private String getFormCompletionStatus(Long visitInstanceId, Long formId) {
        log.debug("Checking completion status for visitInstanceId={}, formId={}", visitInstanceId, formId);
        
        // Query study_form_data for this visit + form combination
        List<StudyFormDataEntity> formDataList = formDataRepository
                .findByVisitIdOrderByCreatedAtDesc(visitInstanceId);
        
        // Find matching form (most recent by created_at DESC ordering)
        Optional<StudyFormDataEntity> formData = formDataList.stream()
                .filter(fd -> fd.getFormId().equals(formId))
                .findFirst();
        
        if (formData.isEmpty()) {
            log.debug("No form data found → not_started");
            return "not_started";
        }
        
        StudyFormDataEntity data = formData.get();
        
        // Check if form is submitted or locked
        if (data.isSubmitted()) {
            log.debug("Form status={} → complete", data.getStatus());
            return "complete";
        }
        
        // Check if form is draft with data
        if (data.isDraft() && data.getFieldCount() > 0) {
            log.debug("Form is DRAFT with {} fields → in_progress", data.getFieldCount());
            return "in_progress";
        }
        
        log.debug("Form status={}, fields={} → not_started", 
                  data.getStatus(), data.getFieldCount());
        return "not_started";
    }
    
    /**
     * Get last updated timestamp for form
     */
    private LocalDateTime getLastUpdated(Long visitInstanceId, Long formId) {
        List<StudyFormDataEntity> formDataList = formDataRepository
                .findByVisitIdOrderByCreatedAtDesc(visitInstanceId);
        
        return formDataList.stream()
                .filter(fd -> fd.getFormId().equals(formId))
                .findFirst()
                .map(StudyFormDataEntity::getUpdatedAt)
                .orElse(null);
    }
    
    /**
     * Get user ID who last updated form
     */
    private Long getUpdatedBy(Long visitInstanceId, Long formId) {
        List<StudyFormDataEntity> formDataList = formDataRepository
                .findByVisitIdOrderByCreatedAtDesc(visitInstanceId);
        
        return formDataList.stream()
                .filter(fd -> fd.getFormId().equals(formId))
                .findFirst()
                .map(StudyFormDataEntity::getUpdatedBy)
                .orElse(null);
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

    // ========== Legacy Support Methods (for visits created before build tracking) ==========
    
    /**
     * DEPRECATED: Legacy fallback for visits without build_id
     * Used only for visits created before Oct 16, 2025 build tracking implementation
     */
    @Deprecated
    private List<VisitFormDto> getLegacyFormsForVisitInstance(StudyVisitInstanceEntity visitInstance) {
        Long visitDefinitionId = visitInstance.getVisitId();
        log.warn("Using LEGACY unfiltered query for visit instance {} (no build tracking)", 
                 visitInstance.getId());
        
        List<VisitFormEntity> visitForms = visitFormRepository
                .findByVisitDefinitionIdOrderByDisplayOrderAsc(visitDefinitionId);
        
        return visitForms.stream()
                .map(vf -> mapToDto(vf, visitInstance))
                .collect(Collectors.toList());
    }

    /**
     * DEPRECATED: Legacy fallback for required forms without build_id
     */
    @Deprecated
    private List<VisitFormDto> getLegacyRequiredFormsForVisitInstance(StudyVisitInstanceEntity visitInstance) {
        Long visitDefinitionId = visitInstance.getVisitId();
        log.warn("Using LEGACY unfiltered query for required forms (visit instance {})", 
                 visitInstance.getId());
        
        List<VisitFormEntity> requiredForms = visitFormRepository
                .findByVisitDefinitionIdAndIsRequiredTrueOrderByDisplayOrderAsc(visitDefinitionId);
        
        return requiredForms.stream()
                .map(vf -> mapToDto(vf, visitInstance))
                .collect(Collectors.toList());
    }

    /**
     * DEPRECATED: Legacy fallback for optional forms without build_id
     */
    @Deprecated
    private List<VisitFormDto> getLegacyOptionalFormsForVisitInstance(StudyVisitInstanceEntity visitInstance) {
        Long visitDefinitionId = visitInstance.getVisitId();
        log.warn("Using LEGACY unfiltered query for optional forms (visit instance {})", 
                 visitInstance.getId());
        
        List<VisitFormEntity> optionalForms = visitFormRepository
                .findByVisitDefinitionIdAndIsRequiredFalseOrderByDisplayOrderAsc(visitDefinitionId);
        
        return optionalForms.stream()
                .map(vf -> mapToDto(vf, visitInstance))
                .collect(Collectors.toList());
    }
}
