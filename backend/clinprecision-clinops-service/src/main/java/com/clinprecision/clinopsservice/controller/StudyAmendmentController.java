package com.clinprecision.clinopsservice.controller;



import com.clinprecision.clinopsservice.service.StudyAmendmentService;
import com.clinprecision.common.dto.clinops.StudyAmendmentDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Study Amendment Management
 */
@RestController
@RequestMapping("/api/studies/{studyId}")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class StudyAmendmentController {
    
    @Autowired
    private StudyAmendmentService studyAmendmentService;
    
    /**
     * Get all amendments for a study (across all versions)
     */
    @GetMapping("/amendments")
    public ResponseEntity<List<StudyAmendmentDto>> getStudyAmendments(@PathVariable Long studyId) {
        try {
            List<StudyAmendmentDto> amendments = studyAmendmentService.getStudyAmendments(studyId);
            return ResponseEntity.ok(amendments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get amendments for a specific version
     */
    @GetMapping("/versions/{versionId}/amendments")
    public ResponseEntity<List<StudyAmendmentDto>> getVersionAmendments(
            @PathVariable Long studyId,
            @PathVariable Long versionId) {
        try {
            List<StudyAmendmentDto> amendments = studyAmendmentService.getVersionAmendments(versionId);
            return ResponseEntity.ok(amendments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get a specific amendment by ID
     */
    @GetMapping("/amendments/{amendmentId}")
    public ResponseEntity<StudyAmendmentDto> getAmendmentById(
            @PathVariable Long studyId,
            @PathVariable Long amendmentId) {
        try {
            Optional<StudyAmendmentDto> amendment = studyAmendmentService.getAmendmentById(amendmentId);
            return amendment.map(ResponseEntity::ok)
                           .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
