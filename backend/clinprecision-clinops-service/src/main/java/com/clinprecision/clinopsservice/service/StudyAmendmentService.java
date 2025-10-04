package com.clinprecision.clinopsservice.service;



import com.clinprecision.clinopsservice.repository.StudyAmendmentRepository;
import com.clinprecision.common.dto.clinops.StudyAmendmentDto;
import com.clinprecision.common.entity.clinops.StudyAmendmentEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service class for managing study amendments
 */
@Service
@Transactional
public class StudyAmendmentService {
    
    @Autowired
    private StudyAmendmentRepository studyAmendmentRepository;
    
    /**
     * Get all amendments for a study (across all versions)
     */
    public List<StudyAmendmentDto> getStudyAmendments(Long studyId) {
        List<StudyAmendmentEntity> amendments = studyAmendmentRepository.findByStudyIdOrderByVersionAndAmendmentNumber(studyId);
        return amendments.stream()
                .map(StudyAmendmentDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get amendments for a specific study version
     */
    public List<StudyAmendmentDto> getVersionAmendments(Long studyVersionId) {
        List<StudyAmendmentEntity> amendments = studyAmendmentRepository.findByStudyVersionIdOrderByAmendmentNumberAsc(studyVersionId);
        return amendments.stream()
                .map(StudyAmendmentDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a specific amendment by ID
     */
    public Optional<StudyAmendmentDto> getAmendmentById(Long amendmentId) {
        return studyAmendmentRepository.findById(amendmentId)
                .map(StudyAmendmentDto::new);
    }
    
    /**
     * Get amendments by status
     */
    public List<StudyAmendmentDto> getAmendmentsByStatus(StudyAmendmentEntity.AmendmentStatus status) {
        List<StudyAmendmentEntity> amendments = studyAmendmentRepository.findByStatusOrderByCreatedDateDesc(status);
        return amendments.stream()
                .map(StudyAmendmentDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get amendments requiring regulatory notification
     */
    public List<StudyAmendmentDto> getAmendmentsRequiringRegulatoryNotification() {
        List<StudyAmendmentEntity> amendments = studyAmendmentRepository.findAmendmentsRequiringRegulatoryNotification();
        return amendments.stream()
                .map(StudyAmendmentDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get amendments that impact subjects
     */
    public List<StudyAmendmentDto> getAmendmentsImpactingSubjects() {
        List<StudyAmendmentEntity> amendments = studyAmendmentRepository.findAmendmentsImpactingSubjects();
        return amendments.stream()
                .map(StudyAmendmentDto::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get amendments requiring consent updates
     */
    public List<StudyAmendmentDto> getAmendmentsRequiringConsentUpdate() {
        List<StudyAmendmentEntity> amendments = studyAmendmentRepository.findAmendmentsRequiringConsentUpdate();
        return amendments.stream()
                .map(StudyAmendmentDto::new)
                .collect(Collectors.toList());
    }
}
