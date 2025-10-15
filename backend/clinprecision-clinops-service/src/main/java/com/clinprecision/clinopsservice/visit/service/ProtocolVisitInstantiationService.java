package com.clinprecision.clinopsservice.visit.service;

import com.clinprecision.clinopsservice.entity.VisitDefinitionEntity;
import com.clinprecision.clinopsservice.repository.VisitDefinitionRepository;
import com.clinprecision.clinopsservice.visit.entity.StudyVisitInstanceEntity;
import com.clinprecision.clinopsservice.visit.repository.StudyVisitInstanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Service for instantiating protocol visits from visit definitions
 * 
 * When a patient becomes ACTIVE, this service creates visit instances
 * from the study's protocol schedule (visit_definitions table).
 * 
 * Key Responsibilities:
 * - Query visit_definitions for study (arm-specific + common visits)
 * - Create study_visit_instances for patient
 * - Calculate visit dates from baseline + day offset
 * - Set initial status to "Scheduled"
 * 
 * Gap #1 Resolution: Protocol Visit Instantiation
 * Industry Standard: Medidata Rave, Oracle InForm auto-create visits from protocol
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ProtocolVisitInstantiationService {

    private final VisitDefinitionRepository visitDefinitionRepository;
    private final StudyVisitInstanceRepository studyVisitInstanceRepository;

    /**
     * Instantiate protocol visits for a patient
     * 
     * Called when patient status changes to ACTIVE.
     * Creates visit instances from protocol schedule.
     * 
     * @param patientId Patient/Subject database ID
     * @param studyId Study database ID
     * @param siteId Site database ID
     * @param armId Study arm ID (can be null for common visits only)
     * @param baselineDate Baseline date for calculating visit dates (usually enrollment date)
     * @return List of created visit instances
     */
    @Transactional
    public List<StudyVisitInstanceEntity> instantiateProtocolVisits(
            Long patientId,
            Long studyId,
            Long siteId,
            Long armId,
            LocalDate baselineDate) {

        log.info("Instantiating protocol visits for patient: patientId={}, studyId={}, armId={}, baseline={}",
                patientId, studyId, armId, baselineDate);

        // 1. Check if visits already instantiated (idempotency check)
        if (hasProtocolVisitsInstantiated(patientId)) {
            log.warn("Protocol visits already instantiated for patientId: {}. Skipping.", patientId);
            return studyVisitInstanceRepository.findBySubjectIdOrderByVisitDateDesc(patientId);
        }

        // 2. Query visit_definitions for this study
        List<VisitDefinitionEntity> protocolVisits = getProtocolVisits(studyId, armId);

        if (protocolVisits.isEmpty()) {
            log.warn("No protocol visits found for studyId: {}, armId: {}. No visits created.", studyId, armId);
            return List.of();
        }

        log.info("Found {} protocol visits to instantiate", protocolVisits.size());

        // 3. For each protocol visit, create a study_visit_instance
        List<StudyVisitInstanceEntity> instances = new ArrayList<>();

        for (VisitDefinitionEntity visitDef : protocolVisits) {
            try {
                StudyVisitInstanceEntity instance = createVisitInstance(
                        patientId,
                        studyId,
                        siteId,
                        visitDef,
                        baselineDate
                );

                instances.add(studyVisitInstanceRepository.save(instance));

                log.debug("Created visit instance: visitDefId={}, name={}, date={}",
                        visitDef.getId(), visitDef.getName(), instance.getVisitDate());

            } catch (Exception e) {
                log.error("Error creating visit instance for visitDefId: {}, name: {}",
                        visitDef.getId(), visitDef.getName(), e);
                // Continue with other visits even if one fails
            }
        }

        log.info("Successfully instantiated {} protocol visits for patientId: {}",
                instances.size(), patientId);

        return instances;
    }

    /**
     * Get protocol visits for study
     * Includes arm-specific visits (if armId provided) + common visits
     */
    private List<VisitDefinitionEntity> getProtocolVisits(Long studyId, Long armId) {
        List<VisitDefinitionEntity> protocolVisits = new ArrayList<>();

        if (armId != null) {
            // Get arm-specific visits
            List<VisitDefinitionEntity> armVisits =
                    visitDefinitionRepository.findByStudyIdAndArmIdOrderBySequenceNumberAsc(studyId, armId);
            protocolVisits.addAll(armVisits);

            log.debug("Found {} arm-specific visits for armId: {}", armVisits.size(), armId);
        }

        // Get common visits (no arm assignment)
        List<VisitDefinitionEntity> commonVisits =
                visitDefinitionRepository.findByStudyIdAndArmIdIsNullOrderBySequenceNumberAsc(studyId);
        protocolVisits.addAll(commonVisits);

        log.debug("Found {} common visits", commonVisits.size());

        // Sort by timepoint (day offset) to ensure correct chronological order
        protocolVisits.sort(Comparator.comparing(VisitDefinitionEntity::getTimepoint));

        return protocolVisits;
    }

    /**
     * Create a visit instance from a visit definition
     */
    private StudyVisitInstanceEntity createVisitInstance(
            Long patientId,
            Long studyId,
            Long siteId,
            VisitDefinitionEntity visitDef,
            LocalDate baselineDate) {

        // Calculate visit date from baseline + day offset
        LocalDate visitDate = calculateVisitDate(baselineDate, visitDef.getTimepoint());

        return StudyVisitInstanceEntity.builder()
                .subjectId(patientId)
                .studyId(studyId)
                .siteId(siteId)
                .visitId(visitDef.getId()) // FK to visit_definitions
                .visitDate(visitDate)
                .actualVisitDate(null) // Not yet completed
                .visitStatus("Scheduled") // Initial status
                .windowStatus(null) // Will be calculated by VisitComplianceService
                .completionPercentage(0.0) // No forms completed yet
                .aggregateUuid(null) // NULL for protocol visits (not event-sourced)
                .notes(null)
                .createdBy(1L) // System user (TODO: get from security context)
                .build();
    }

    /**
     * Calculate visit date from baseline + day offset
     * 
     * @param baselineDate Patient's enrollment/baseline date
     * @param dayOffset Days from baseline (from visit_definitions.timepoint)
     *                  Negative = screening visits (before baseline)
     *                  0 = Day 1
     *                  Positive = follow-up visits
     * @return Calculated visit date
     */
    private LocalDate calculateVisitDate(LocalDate baselineDate, Integer dayOffset) {
        if (dayOffset == null) {
            log.warn("Visit definition has null timepoint/dayOffset, using baseline date");
            return baselineDate;
        }
        return baselineDate.plusDays(dayOffset);
    }

    /**
     * Check if protocol visits already instantiated for patient
     * Prevents duplicate instantiation
     * 
     * @param patientId Patient database ID
     * @return true if patient has any visits (protocol or unscheduled)
     */
    public boolean hasProtocolVisitsInstantiated(Long patientId) {
        List<StudyVisitInstanceEntity> visits = studyVisitInstanceRepository.findBySubjectIdOrderByVisitDateDesc(patientId);
        return !visits.isEmpty();
    }

    /**
     * Get all visit instances for a patient (for display)
     * 
     * @param patientId Patient database ID
     * @return List of visit instances ordered by visit date (most recent first)
     */
    public List<StudyVisitInstanceEntity> getPatientVisits(Long patientId) {
        return studyVisitInstanceRepository.findBySubjectIdOrderByVisitDateDesc(patientId);
    }

    /**
     * Count total protocol visits for a study
     * Useful for validation/testing
     * 
     * @param studyId Study database ID
     * @return Total number of visit definitions (protocol visits)
     */
    public long countProtocolVisitsForStudy(Long studyId) {
        return visitDefinitionRepository.countByStudyId(studyId);
    }
}
