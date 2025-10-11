package com.clinprecision.clinopsservice.studydatabase.service;

import com.clinprecision.clinopsservice.studydatabase.entity.StudyFormDataReviewEntity;
import com.clinprecision.clinopsservice.studydatabase.repository.StudyFormDataReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for Study Review Workflow Management (Phase 6E)
 * 
 * Provides business logic for:
 * - SDV (Source Data Verification) tracking
 * - Medical review workflow
 * - Data review workflow
 * - Review completion tracking
 * 
 * Features:
 * - Workflow state management
 * - Review assignment and tracking
 * - Completion statistics
 * - Cache invalidation on updates
 * 
 * @author ClinPrecision Development Team
 * @since Phase 6E: Service Layer
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StudyReviewService {
    
    private final StudyFormDataReviewRepository reviewRepository;
    
    /**
     * Get all reviews for a subject
     */
    @Cacheable(value = "subjectReviews", key = "#studyId + '-' + #subjectId")
    public List<StudyFormDataReviewEntity> getSubjectReviews(Long studyId, Long subjectId) {
        log.debug("Fetching reviews for study {} subject {}", studyId, subjectId);
        return reviewRepository.findByStudyIdAndSubjectId(studyId, subjectId);
    }
    
    /**
     * Get all SDV reviews for a study
     */
    @Cacheable(value = "sdvReviews", key = "#studyId")
    public List<StudyFormDataReviewEntity> getSdvReviews(Long studyId) {
        log.debug("Fetching SDV reviews for study {}", studyId);
        return reviewRepository.findByStudyIdAndReviewType(studyId, "SDV");
    }
    
    /**
     * Get all medical reviews for a study
     */
    @Cacheable(value = "medicalReviews", key = "#studyId")
    public List<StudyFormDataReviewEntity> getMedicalReviews(Long studyId) {
        log.debug("Fetching medical reviews for study {}", studyId);
        return reviewRepository.findByStudyIdAndReviewType(studyId, "MEDICAL_REVIEW");
    }
    
    /**
     * Get pending reviews
     */
    @Cacheable(value = "pendingReviews", key = "#studyId")
    public List<StudyFormDataReviewEntity> getPendingReviews(Long studyId) {
        log.debug("Fetching pending reviews for study {}", studyId);
        return reviewRepository.findPendingReviews(studyId);
    }
    
    /**
     * Get completed reviews
     */
    @Cacheable(value = "completedReviews", key = "#studyId")
    public List<StudyFormDataReviewEntity> getCompletedReviews(Long studyId) {
        log.debug("Fetching completed reviews for study {}", studyId);
        return reviewRepository.findByStudyIdAndReviewStatus(studyId, "COMPLETED");
    }
    
    /**
     * Get reviews by reviewer ID
     */
    @Cacheable(value = "reviewerReviews", key = "#reviewerId")
    public List<StudyFormDataReviewEntity> getReviewsByReviewer(Long reviewerId) {
        log.debug("Fetching reviews by reviewer {}", reviewerId);
        return reviewRepository.findByReviewerId(reviewerId);
    }
    
    /**
     * Complete a review
     */
    @Transactional
    @CacheEvict(value = {"subjectReviews", "pendingReviews", "completedReviews", "reviewerReviews"}, allEntries = true)
    public StudyFormDataReviewEntity completeReview(
            Long reviewId, String outcome, String comments) {
        log.info("Completing review {}", reviewId);
        
        StudyFormDataReviewEntity review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new IllegalArgumentException("Review not found: " + reviewId));
        
        if ("COMPLETED".equals(review.getReviewStatus())) {
            throw new IllegalStateException("Review already completed: " + reviewId);
        }
        
        review.setReviewStatus("COMPLETED");
        review.setReviewDate(LocalDateTime.now());
        review.setReviewOutcome(outcome);
        review.setReviewComments(comments);
        
        return reviewRepository.save(review);
    }
    
    /**
     * Get review statistics for a study
     */
    @Cacheable(value = "reviewStats", key = "#studyId")
    public ReviewStatistics getReviewStatistics(Long studyId) {
        log.debug("Calculating review statistics for study {}", studyId);
        
        List<StudyFormDataReviewEntity> allReviews = reviewRepository.findByStudyId(studyId);
        
        long totalReviews = allReviews.size();
        long pending = allReviews.stream()
            .filter(r -> "PENDING".equals(r.getReviewStatus()))
            .count();
        long inProgress = allReviews.stream()
            .filter(r -> "IN_PROGRESS".equals(r.getReviewStatus()))
            .count();
        long completed = allReviews.stream()
            .filter(r -> "COMPLETED".equals(r.getReviewStatus()))
            .count();
        
        long sdvTotal = allReviews.stream()
            .filter(r -> "SDV".equals(r.getReviewType()))
            .count();
        long sdvCompleted = allReviews.stream()
            .filter(r -> "SDV".equals(r.getReviewType()))
            .filter(r -> "COMPLETED".equals(r.getReviewStatus()))
            .count();
        
        long medicalTotal = allReviews.stream()
            .filter(r -> "MEDICAL_REVIEW".equals(r.getReviewType()))
            .count();
        long medicalCompleted = allReviews.stream()
            .filter(r -> "MEDICAL_REVIEW".equals(r.getReviewType()))
            .filter(r -> "COMPLETED".equals(r.getReviewStatus()))
            .count();
        
        double completionRate = totalReviews > 0 ? (completed * 100.0 / totalReviews) : 0.0;
        double sdvCompletionRate = sdvTotal > 0 ? (sdvCompleted * 100.0 / sdvTotal) : 0.0;
        double medicalCompletionRate = medicalTotal > 0 ? (medicalCompleted * 100.0 / medicalTotal) : 0.0;
        
        return ReviewStatistics.builder()
            .studyId(studyId)
            .totalReviews(totalReviews)
            .pending(pending)
            .inProgress(inProgress)
            .completed(completed)
            .completionRate(completionRate)
            .sdvTotal(sdvTotal)
            .sdvCompleted(sdvCompleted)
            .sdvCompletionRate(sdvCompletionRate)
            .medicalReviewTotal(medicalTotal)
            .medicalReviewCompleted(medicalCompleted)
            .medicalReviewCompletionRate(medicalCompletionRate)
            .build();
    }
    
    /**
     * Get review workload by reviewer
     */
    @Cacheable(value = "reviewWorkload", key = "#studyId")
    public Map<Long, Long> getReviewWorkloadByReviewer(Long studyId) {
        log.debug("Calculating review workload for study {}", studyId);
        
        List<StudyFormDataReviewEntity> pendingReviews = getPendingReviews(studyId);
        
        return pendingReviews.stream()
            .filter(r -> r.getReviewerId() != null)
            .collect(Collectors.groupingBy(
                StudyFormDataReviewEntity::getReviewerId,
                Collectors.counting()
            ));
    }
    
    /**
     * Get review timeline (completed reviews by date)
     */
    @Cacheable(value = "reviewTimeline", key = "#studyId")
    public Map<String, Long> getReviewCompletionTimeline(Long studyId) {
        log.debug("Calculating review timeline for study {}", studyId);
        
        List<StudyFormDataReviewEntity> completedReviews = getCompletedReviews(studyId);
        
        return completedReviews.stream()
            .filter(r -> r.getReviewDate() != null)
            .collect(Collectors.groupingBy(
                r -> r.getReviewDate().toLocalDate().toString(),
                Collectors.counting()
            ));
    }
    
    /**
     * Validate review workflow state transitions
     */
    public boolean isValidStateTransition(String currentState, String newState) {
        if (currentState == null || newState == null) {
            return false;
        }
        
        // Define valid state transitions
        return switch (currentState) {
            case "NOT_STARTED" -> "IN_PROGRESS".equals(newState);
            case "IN_PROGRESS" -> "COMPLETED".equals(newState) || "NOT_STARTED".equals(newState);
            case "COMPLETED" -> false; // Completed reviews cannot be changed
            default -> false;
        };
    }
    
    // ========== Inner Classes ==========
    
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ReviewStatistics {
        private Long studyId;
        private Long totalReviews;
        private Long pending;
        private Long inProgress;
        private Long completed;
        private Double completionRate;
        
        private Long sdvTotal;
        private Long sdvCompleted;
        private Double sdvCompletionRate;
        
        private Long medicalReviewTotal;
        private Long medicalReviewCompleted;
        private Double medicalReviewCompletionRate;
    }
}
