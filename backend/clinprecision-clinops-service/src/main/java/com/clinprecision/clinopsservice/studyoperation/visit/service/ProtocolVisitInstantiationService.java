package com.clinprecision.clinopsservice.studyoperation.visit.service;

import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.entity.VisitDefinitionEntity;
import com.clinprecision.clinopsservice.studydesign.design.visitdefinition.repository.VisitDefinitionRepository;
import com.clinprecision.clinopsservice.studyoperation.visit.entity.StudyVisitInstanceEntity;
import com.clinprecision.clinopsservice.studyoperation.visit.repository.StudyVisitInstanceRepository;
import com.clinprecision.clinopsservice.studydesign.build.entity.StudyDatabaseBuildEntity;
import com.clinprecision.clinopsservice.studydesign.build.entity.StudyDatabaseBuildStatus;
import com.clinprecision.clinopsservice.studydesign.build.repository.StudyDatabaseBuildRepository;
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
    private final StudyDatabaseBuildRepository studyDatabaseBuildRepository;

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

        // CRITICAL FIX: Get active study database build FIRST
        StudyDatabaseBuildEntity activeBuild = getActiveStudyBuild(studyId);
        
        if (activeBuild == null) {
            throw new IllegalStateException(
                "No active study database build found for studyId: " + studyId + ". " +
                "Study must have a COMPLETED database build before enrolling patients. " +
                "Please build the study database first.");
        }
        
        log.info("Using study build: id={}, version={}, status={}, completedAt={}", 
                 activeBuild.getId(), activeBuild.getBuildRequestId(), 
                 activeBuild.getBuildStatus(), activeBuild.getBuildEndTime());

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
                        baselineDate,
                        activeBuild.getId() // CRITICAL: Pass build ID
                );

                instances.add(studyVisitInstanceRepository.save(instance));

                log.debug("Created visit instance: visitDefId={}, name={}, date={}, buildId={}",
                        visitDef.getId(), visitDef.getName(), instance.getVisitDate(), activeBuild.getId());

            } catch (Exception e) {
                log.error("Error creating visit instance for visitDefId: {}, name: {}",
                        visitDef.getId(), visitDef.getName(), e);
                // Continue with other visits even if one fails
            }
        }

        log.info("Successfully instantiated {} protocol visits for patientId: {} using build {}",
                instances.size(), patientId, activeBuild.getId());

        return instances;
    }

    /**
     * Get active study database build (CRITICAL for data integrity)
     * Returns the most recent COMPLETED build for the study
     * 
     * @param studyId Study database ID
     * @return Active build entity, or null if no completed builds exist
     */
    private StudyDatabaseBuildEntity getActiveStudyBuild(Long studyId) {
        log.debug("Looking for active build for studyId: {}", studyId);
        
        return studyDatabaseBuildRepository
                .findTopByStudyIdAndBuildStatusOrderByBuildEndTimeDesc(
                    studyId, 
                    StudyDatabaseBuildStatus.COMPLETED
                )
                .orElse(null);
    }

    /**
     * Get protocol visits for study
     * Includes arm-specific visits (if armId provided) + common visits
     * 
     * CRITICAL FIX (Oct 19, 2025): Exclude unscheduled visits from automatic instantiation
     * Unscheduled visits should ONLY be created on-demand via VisitController.createUnscheduledVisit()
     */
    private List<VisitDefinitionEntity> getProtocolVisits(Long studyId, Long armId) {
        List<VisitDefinitionEntity> protocolVisits = new ArrayList<>();

        if (armId != null) {
            // Get arm-specific visits (EXCLUDING unscheduled)
            List<VisitDefinitionEntity> armVisits =
                    visitDefinitionRepository.findByStudyIdAndArmIdOrderBySequenceNumberAsc(studyId, armId);
            
            // CRITICAL: Filter out unscheduled visits
            List<VisitDefinitionEntity> scheduledArmVisits = armVisits.stream()
                .filter(v -> !Boolean.TRUE.equals(v.getIsUnscheduled()))
                .toList();
            
            protocolVisits.addAll(scheduledArmVisits);

            log.debug("Found {} arm-specific visits for armId: {} (excluded {} unscheduled)", 
                     scheduledArmVisits.size(), armId, armVisits.size() - scheduledArmVisits.size());
        }

        // Get common visits (no arm assignment, EXCLUDING unscheduled)
        List<VisitDefinitionEntity> commonVisits =
                visitDefinitionRepository.findByStudyIdAndArmIdIsNullOrderBySequenceNumberAsc(studyId);
        
        // CRITICAL: Filter out unscheduled visits
        List<VisitDefinitionEntity> scheduledCommonVisits = commonVisits.stream()
            .filter(v -> !Boolean.TRUE.equals(v.getIsUnscheduled()))
            .toList();
        
        protocolVisits.addAll(scheduledCommonVisits);

        log.debug("Found {} common visits (excluded {} unscheduled)", 
                 scheduledCommonVisits.size(), commonVisits.size() - scheduledCommonVisits.size());

        // Sort by timepoint (day offset) to ensure correct chronological order
        protocolVisits.sort(Comparator.comparing(VisitDefinitionEntity::getTimepoint));

        log.info("Total SCHEDULED protocol visits for study {}: {} (unscheduled visits excluded)", 
                studyId, protocolVisits.size());

        return protocolVisits;
    }

    /**
     * Create a visit instance from a visit definition
     * CRITICAL: Now includes buildId for proper protocol versioning
     * Gap #4 Fix: Populates visit window fields from visit definition
     */
    private StudyVisitInstanceEntity createVisitInstance(
            Long patientId,
            Long studyId,
            Long siteId,
            VisitDefinitionEntity visitDef,
            LocalDate baselineDate,
            Long buildId) { // CRITICAL: Added buildId parameter

        // Calculate visit date from baseline + day offset
        LocalDate visitDate = calculateVisitDate(baselineDate, visitDef.getTimepoint());
        
        // Gap #4 Fix: Calculate visit window dates from visit definition
        // Window configuration comes from protocol design (visit_definitions table)
        Integer windowBefore = visitDef.getWindowBefore() != null ? visitDef.getWindowBefore() : 0;
        Integer windowAfter = visitDef.getWindowAfter() != null ? visitDef.getWindowAfter() : 0;
        
        LocalDate windowStart = visitDate.minusDays(windowBefore);
        LocalDate windowEnd = visitDate.plusDays(windowAfter);
        
        log.debug("Visit window calculated: visitDate={}, windowBefore={}, windowAfter={}, windowStart={}, windowEnd={}",
                visitDate, windowBefore, windowAfter, windowStart, windowEnd);

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
                .buildId(buildId) // CRITICAL: Track which build version was used
                // Gap #4: Visit window compliance fields (copied from visit definition)
                .visitWindowStart(windowStart)
                .visitWindowEnd(windowEnd)
                .windowDaysBefore(windowBefore)
                .windowDaysAfter(windowAfter)
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
