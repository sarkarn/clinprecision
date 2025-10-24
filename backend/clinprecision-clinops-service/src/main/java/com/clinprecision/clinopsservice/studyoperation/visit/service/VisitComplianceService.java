package com.clinprecision.clinopsservice.studyoperation.visit.service;

import com.clinprecision.clinopsservice.studyoperation.visit.entity.StudyVisitInstanceEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Service for calculating visit compliance status and overdue days
 * Gap #4: Visit Window Compliance
 * 
 * Compliance Status Values:
 * - SCHEDULED: Visit scheduled, window not yet open
 * - WINDOW_OPEN: Current date is within visit window, visit not completed
 * - APPROACHING_DEADLINE: Visit not completed, less than 2 days until window closes
 * - ON_TIME: Visit completed within allowed window
 * - OVERDUE: Past window_end date, not yet completed (1-7 days late)
 * - MISSED: Past window_end date by more than 7 days, not completed
 * - OUT_OF_WINDOW_EARLY: Visit completed before window_start date (protocol violation)
 * - OUT_OF_WINDOW_LATE: Visit completed after window_end date (protocol violation)
 * 
 * @author ClinPrecision Development Team
 * @version 1.0
 */
@Service
public class VisitComplianceService {

    private static final int MISSED_THRESHOLD_DAYS = 7;
    private static final int APPROACHING_DEADLINE_DAYS = 2;

    /**
     * Calculate compliance status for a visit instance
     * 
     * @param visit The visit instance to check
     * @return Compliance status string
     */
    public String calculateComplianceStatus(StudyVisitInstanceEntity visit) {
        if (visit == null) {
            return "UNKNOWN";
        }

        LocalDate windowStart = visit.getVisitWindowStart();
        LocalDate windowEnd = visit.getVisitWindowEnd();
        LocalDate actualDate = visit.getActualVisitDate();
        String visitStatus = visit.getVisitStatus() != null ? visit.getVisitStatus().name() : null;
        
        // No window configured yet
        if (windowStart == null || windowEnd == null) {
            return "SCHEDULED";
        }

        LocalDate today = LocalDate.now();

        // Visit completed - check if within window
        if ("COMPLETED".equals(visitStatus) && actualDate != null) {
            if (actualDate.isBefore(windowStart)) {
                return "OUT_OF_WINDOW_EARLY";
            } else if (actualDate.isAfter(windowEnd)) {
                return "OUT_OF_WINDOW_LATE";
            } else {
                return "ON_TIME";
            }
        }

        // Visit not completed - check current date against window
        if ("COMPLETED".equals(visitStatus)) {
            // Completed but no actual date recorded - assume on time
            return "ON_TIME";
        }

        // Check if visit is missed (>7 days past window)
        if (today.isAfter(windowEnd)) {
            long daysLate = ChronoUnit.DAYS.between(windowEnd, today);
            if (daysLate > MISSED_THRESHOLD_DAYS) {
                return "MISSED";
            } else {
                return "OVERDUE";
            }
        }

        // Check if approaching deadline (<2 days until window closes)
        if (today.isAfter(windowStart) && !today.isAfter(windowEnd)) {
            long daysRemaining = ChronoUnit.DAYS.between(today, windowEnd);
            if (daysRemaining <= APPROACHING_DEADLINE_DAYS) {
                return "APPROACHING_DEADLINE";
            } else {
                return "WINDOW_OPEN";
            }
        }

        // Window hasn't opened yet
        if (today.isBefore(windowStart)) {
            return "SCHEDULED";
        }

        // Default fallback
        return "SCHEDULED";
    }

    /**
     * Calculate days overdue for a visit
     * 
     * @param visit The visit instance to check
     * @return Days overdue (positive = late, negative = days remaining, 0 = due today)
     */
    public long getDaysOverdue(StudyVisitInstanceEntity visit) {
        if (visit == null || visit.getVisitWindowEnd() == null) {
            return 0;
        }

        LocalDate windowEnd = visit.getVisitWindowEnd();
        String visitStatus = visit.getVisitStatus() != null ? visit.getVisitStatus().name() : null;

        // If visit completed, check actual date vs window
        if ("COMPLETED".equals(visitStatus)) {
            LocalDate actualDate = visit.getActualVisitDate();
            if (actualDate != null) {
                // Return days between window end and actual date
                // Positive = late, negative = early
                return ChronoUnit.DAYS.between(windowEnd, actualDate);
            }
            // Completed but no actual date - assume on time
            return 0;
        }

        // Visit not completed - check today vs window end
        LocalDate today = LocalDate.now();
        // Positive = overdue, negative = days remaining
        return ChronoUnit.DAYS.between(windowEnd, today);
    }

    /**
     * Check if visit is overdue (past window end and not completed)
     * 
     * @param visit The visit instance to check
     * @return true if overdue, false otherwise
     */
    public boolean isOverdue(StudyVisitInstanceEntity visit) {
        String status = calculateComplianceStatus(visit);
        return "OVERDUE".equals(status) || "MISSED".equals(status);
    }

    /**
     * Check if visit is approaching deadline (<2 days until window closes)
     * 
     * @param visit The visit instance to check
     * @return true if approaching deadline, false otherwise
     */
    public boolean isApproachingDeadline(StudyVisitInstanceEntity visit) {
        return "APPROACHING_DEADLINE".equals(calculateComplianceStatus(visit));
    }

    /**
     * Check if visit was completed out of window (protocol violation)
     * 
     * @param visit The visit instance to check
     * @return true if completed outside window, false otherwise
     */
    public boolean isProtocolViolation(StudyVisitInstanceEntity visit) {
        String status = calculateComplianceStatus(visit);
        return "OUT_OF_WINDOW_EARLY".equals(status) || "OUT_OF_WINDOW_LATE".equals(status);
    }

    /**
     * Get human-readable description of compliance status
     * 
     * @param complianceStatus The compliance status
     * @return Human-readable description
     */
    public String getComplianceDescription(String complianceStatus) {
        if (complianceStatus == null) {
            return "Unknown";
        }

        return switch (complianceStatus) {
            case "SCHEDULED" -> "Visit scheduled";
            case "WINDOW_OPEN" -> "Visit window is open";
            case "APPROACHING_DEADLINE" -> "Deadline approaching";
            case "ON_TIME" -> "Completed on time";
            case "OVERDUE" -> "Visit overdue";
            case "MISSED" -> "Visit missed";
            case "OUT_OF_WINDOW_EARLY" -> "Completed too early (protocol violation)";
            case "OUT_OF_WINDOW_LATE" -> "Completed too late (protocol violation)";
            default -> "Unknown status";
        };
    }

    /**
     * Get CSS class for compliance status badge color
     * 
     * @param complianceStatus The compliance status
     * @return CSS class name
     */
    public String getComplianceBadgeClass(String complianceStatus) {
        if (complianceStatus == null) {
            return "badge-secondary";
        }

        return switch (complianceStatus) {
            case "ON_TIME" -> "badge-success";
            case "WINDOW_OPEN" -> "badge-info";
            case "APPROACHING_DEADLINE" -> "badge-warning";
            case "OVERDUE" -> "badge-danger";
            case "MISSED" -> "badge-dark";
            case "OUT_OF_WINDOW_EARLY", "OUT_OF_WINDOW_LATE" -> "badge-danger-outline";
            case "SCHEDULED" -> "badge-secondary";
            default -> "badge-secondary";
        };
    }
}
