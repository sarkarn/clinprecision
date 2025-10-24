package com.clinprecision.clinopsservice.studyoperation.protocoldeviation.service;

import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.entity.ProtocolDeviationCommentEntity;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.entity.ProtocolDeviationEntity;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationSeverity;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationStatus;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.enums.DeviationType;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.repository.ProtocolDeviationCommentRepository;
import com.clinprecision.clinopsservice.studyoperation.protocoldeviation.repository.ProtocolDeviationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Protocol Deviation Service
 * Business logic for protocol deviation tracking and management
 * 
 * Responsibilities:
 * - Record new protocol deviations
 * - Update deviation status workflow (OPEN → UNDER_REVIEW → RESOLVED → CLOSED)
 * - Add comments and investigation notes
 * - Query deviations by various criteria
 * - Auto-flag visit window violations
 * - Manage regulatory reporting flags
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProtocolDeviationService {

    private final ProtocolDeviationRepository deviationRepository;
    private final ProtocolDeviationCommentRepository commentRepository;

    /**
     * Record a new protocol deviation
     * 
     * @param deviation The deviation entity to save
     * @return Saved deviation entity with generated ID and timestamps
     */
    public ProtocolDeviationEntity recordDeviation(ProtocolDeviationEntity deviation) {
        log.info("Recording new protocol deviation for patient ID: {}, type: {}, severity: {}", 
                deviation.getPatientId(), deviation.getDeviationType(), deviation.getSeverity());
        
        // Set initial status if not provided
        if (deviation.getDeviationStatus() == null) {
            deviation.setDeviationStatus(DeviationStatus.OPEN);
        }
        
        // Set detection date to today if not provided
        if (deviation.getDetectionDate() == null) {
            deviation.setDetectionDate(LocalDate.now());
        }
        
        // Auto-determine reporting requirement for MAJOR/CRITICAL deviations
        if (deviation.getSeverity() == DeviationSeverity.MAJOR || 
            deviation.getSeverity() == DeviationSeverity.CRITICAL) {
            deviation.setRequiresReporting(true);
        }
        
        ProtocolDeviationEntity saved = deviationRepository.save(deviation);
        log.info("Protocol deviation recorded successfully with ID: {}", saved.getId());
        
        return saved;
    }

    /**
     * Record a visit window violation as a protocol deviation
     * Auto-calculates severity based on days overdue
     * 
     * @param patientId Patient ID
     * @param studyId Study ID
     * @param studySiteId Study site ID
     * @param visitInstanceId Visit instance ID
     * @param daysOverdue Number of days outside visit window
     * @param expectedDate Expected visit date
     * @param actualDate Actual visit date
     * @param detectedBy User ID who detected the deviation
     * @return Saved deviation entity
     */
    public ProtocolDeviationEntity recordVisitWindowViolation(
            Long patientId, Long studyId, Long studySiteId, Long visitInstanceId,
            int daysOverdue, LocalDate expectedDate, LocalDate actualDate, Long detectedBy) {
        
        log.info("Auto-flagging visit window violation - Patient: {}, Days overdue: {}", 
                patientId, daysOverdue);
        
        // Calculate severity based on days overdue
        DeviationSeverity severity;
        if (Math.abs(daysOverdue) < 3) {
            severity = DeviationSeverity.MINOR;
        } else if (Math.abs(daysOverdue) <= 7) {
            severity = DeviationSeverity.MAJOR;
        } else {
            severity = DeviationSeverity.CRITICAL;
        }
        
        // Build description
        String description = String.format(
            "Visit completed outside protocol-defined visit window. " +
            "Expected on or around %s, actual visit date: %s. " +
            "Deviation: %d days %s window.",
            expectedDate, actualDate, Math.abs(daysOverdue),
            daysOverdue > 0 ? "after" : "before"
        );
        
        ProtocolDeviationEntity deviation = ProtocolDeviationEntity.builder()
                .patientId(patientId)
                .studyId(studyId)
                .studySiteId(studySiteId)
                .visitInstanceId(visitInstanceId)
                .deviationType(DeviationType.VISIT_WINDOW)
                .severity(severity)
                .deviationStatus(DeviationStatus.OPEN)
                .title("Visit Window Violation")
                .description(description)
                .protocolSection("Visit Schedule")
                .expectedProcedure(String.format("Visit on or around %s", expectedDate))
                .actualProcedure(String.format("Visit completed on %s", actualDate))
                .deviationDate(actualDate)
                .detectionDate(LocalDate.now())
                .detectedBy(detectedBy)
                .requiresReporting(severity != DeviationSeverity.MINOR)
                .build();
        
        return recordDeviation(deviation);
    }

    /**
     * Update deviation status
     * Follows workflow: OPEN → UNDER_REVIEW → RESOLVED → CLOSED
     * 
     * @param deviationId Deviation ID
     * @param newStatus New status
     * @param userId User making the change
     * @return Updated deviation
     */
    public ProtocolDeviationEntity updateDeviationStatus(Long deviationId, DeviationStatus newStatus, Long userId) {
        log.info("Updating deviation {} status to: {}", deviationId, newStatus);
        
        ProtocolDeviationEntity deviation = deviationRepository.findById(deviationId)
                .orElseThrow(() -> new EntityNotFoundException("Protocol deviation not found with ID: " + deviationId));
        
        DeviationStatus oldStatus = deviation.getDeviationStatus();
        deviation.setDeviationStatus(newStatus);
        
        // Update reviewer/resolver based on status
        switch (newStatus) {
            case UNDER_REVIEW:
                if (deviation.getReviewedBy() == null) {
                    deviation.setReviewedBy(userId);
                }
                break;
            case RESOLVED:
            case CLOSED:
                if (deviation.getResolvedBy() == null) {
                    deviation.setResolvedBy(userId);
                }
                if (deviation.getResolvedDate() == null) {
                    deviation.setResolvedDate(LocalDate.now());
                }
                break;
        }
        
        ProtocolDeviationEntity updated = deviationRepository.save(deviation);
        log.info("Deviation {} status changed from {} to {}", deviationId, oldStatus, newStatus);
        
        return updated;
    }

    /**
     * Add a comment to a deviation
     * 
     * @param deviationId Deviation ID
     * @param commentText Comment text
     * @param userId User adding the comment
     * @param isInternal Whether comment is internal (site use only) or external (visible to sponsor)
     * @return Saved comment entity
     */
    public ProtocolDeviationCommentEntity addComment(Long deviationId, String commentText, Long userId, boolean isInternal) {
        log.info("Adding comment to deviation {} by user {}", deviationId, userId);
        
        // Verify deviation exists
        if (!deviationRepository.existsById(deviationId)) {
            throw new EntityNotFoundException("Protocol deviation not found with ID: " + deviationId);
        }
        
        ProtocolDeviationCommentEntity comment = ProtocolDeviationCommentEntity.builder()
                .deviationId(deviationId)
                .commentText(commentText)
                .commentedBy(userId)
                .isInternal(isInternal)
                .build();
        
        return commentRepository.save(comment);
    }

    /**
     * Mark deviation as reported to IRB
     * 
     * @param deviationId Deviation ID
     * @param reportDate Date reported to IRB
     * @return Updated deviation
     */
    public ProtocolDeviationEntity markReportedToIrb(Long deviationId, LocalDate reportDate) {
        log.info("Marking deviation {} as reported to IRB on {}", deviationId, reportDate);
        
        ProtocolDeviationEntity deviation = getDeviationById(deviationId);
        deviation.setReportedToIrb(true);
        deviation.setIrbReportDate(reportDate);
        
        return deviationRepository.save(deviation);
    }

    /**
     * Mark deviation as reported to Sponsor
     * 
     * @param deviationId Deviation ID
     * @param reportDate Date reported to Sponsor
     * @return Updated deviation
     */
    public ProtocolDeviationEntity markReportedToSponsor(Long deviationId, LocalDate reportDate) {
        log.info("Marking deviation {} as reported to Sponsor on {}", deviationId, reportDate);
        
        ProtocolDeviationEntity deviation = getDeviationById(deviationId);
        deviation.setReportedToSponsor(true);
        deviation.setSponsorReportDate(reportDate);
        
        return deviationRepository.save(deviation);
    }

    // === Query Methods ===
    
    /**
     * Get deviation by ID
     */
    @Transactional(readOnly = true)
    public ProtocolDeviationEntity getDeviationById(Long id) {
        return deviationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Protocol deviation not found with ID: " + id));
    }

    /**
     * Get all deviations for a patient
     */
    @Transactional(readOnly = true)
    public List<ProtocolDeviationEntity> getDeviationsByPatient(Long patientId) {
        log.debug("Fetching deviations for patient ID: {}", patientId);
        return deviationRepository.findByPatientIdOrderByDeviationDateDesc(patientId);
    }

    /**
     * Get active (open or under review) deviations for a patient
     */
    @Transactional(readOnly = true)
    public List<ProtocolDeviationEntity> getActiveDeviationsByPatient(Long patientId) {
        log.debug("Fetching active deviations for patient ID: {}", patientId);
        return deviationRepository.findActiveDeviationsByPatient(patientId);
    }

    /**
     * Get all deviations for a study
     */
    @Transactional(readOnly = true)
    public List<ProtocolDeviationEntity> getDeviationsByStudy(Long studyId) {
        log.debug("Fetching deviations for study ID: {}", studyId);
        return deviationRepository.findByStudyIdOrderByDeviationDateDesc(studyId);
    }

    /**
     * Get active deviations for a study
     */
    @Transactional(readOnly = true)
    public List<ProtocolDeviationEntity> getActiveDeviationsByStudy(Long studyId) {
        log.debug("Fetching active deviations for study ID: {}", studyId);
        return deviationRepository.findActiveDeviationsByStudy(studyId);
    }

    /**
     * Get critical deviations for a study
     */
    @Transactional(readOnly = true)
    public List<ProtocolDeviationEntity> getCriticalDeviationsByStudy(Long studyId) {
        log.debug("Fetching critical deviations for study ID: {}", studyId);
        return deviationRepository.findCriticalDeviationsByStudy(studyId);
    }

    /**
     * Get deviations requiring reporting but not yet reported
     */
    @Transactional(readOnly = true)
    public List<ProtocolDeviationEntity> getUnreportedDeviations() {
        log.debug("Fetching unreported deviations");
        return deviationRepository.findByRequiresReportingTrueOrderByDeviationDateDesc();
    }

    /**
     * Get comments for a deviation
     */
    @Transactional(readOnly = true)
    public List<ProtocolDeviationCommentEntity> getCommentsByDeviation(Long deviationId) {
        log.debug("Fetching comments for deviation ID: {}", deviationId);
        return commentRepository.findByDeviationIdOrderByCommentedAtAsc(deviationId);
    }

    /**
     * Get external comments for a deviation (visible to sponsor/auditors)
     */
    @Transactional(readOnly = true)
    public List<ProtocolDeviationCommentEntity> getExternalCommentsByDeviation(Long deviationId) {
        log.debug("Fetching external comments for deviation ID: {}", deviationId);
        return commentRepository.findExternalCommentsByDeviation(deviationId);
    }

    /**
     * Check if patient has any critical deviations
     */
    @Transactional(readOnly = true)
    public boolean patientHasCriticalDeviations(Long patientId) {
        return deviationRepository.hasCriticalDeviations(patientId);
    }

    /**
     * Count deviations by study and severity
     */
    @Transactional(readOnly = true)
    public Long countDeviationsByStudyAndSeverity(Long studyId, DeviationSeverity severity) {
        return deviationRepository.countByStudyIdAndSeverity(studyId, severity);
    }

    /**
     * Count deviations by study and type
     */
    @Transactional(readOnly = true)
    public Long countDeviationsByStudyAndType(Long studyId, DeviationType type) {
        return deviationRepository.countByStudyIdAndType(studyId, type);
    }
}
