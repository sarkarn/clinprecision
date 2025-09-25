package com.clinprecision.studydesignservice.controller;


import com.clinprecision.common.dto.studydesign.StudyArmCreateRequestDto;
import com.clinprecision.common.dto.studydesign.StudyArmResponseDto;
import com.clinprecision.common.dto.studydesign.StudyArmUpdateRequestDto;
import com.clinprecision.studydesignservice.service.StudyArmService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Controller for StudyArm operations
 * Provides endpoints that match frontend StudyDesignService calls
 */
@RestController
public class StudyArmController {
    
    private static final Logger log = LoggerFactory.getLogger(StudyArmController.class);
    
    private final StudyArmService studyArmService;
    
    public StudyArmController(StudyArmService studyArmService) {
        this.studyArmService = studyArmService;
    }
    
    /**
     * Get all study arms for a study
     * GET /studies/{studyId}/arms (both /api and without /api for compatibility)
     */
    @GetMapping({"/studies/{studyId}/arms", "/api/studies/{studyId}/arms"})
    public ResponseEntity<List<StudyArmResponseDto>> getStudyArmsByStudyId(@PathVariable Long studyId) {
        log.debug("GET /studies/{}/arms", studyId);
        
        try {
            List<StudyArmResponseDto> studyArms = studyArmService.getStudyArmsByStudyId(studyId);
            return ResponseEntity.ok(studyArms);
        } catch (Exception e) {
            log.error("Error fetching study arms for study {}: {}", studyId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get a specific study arm by ID
     * GET /arms/{armId}
     */
    @GetMapping({"/arms/{armId}", "/api/arms/{armId}"})
    public ResponseEntity<StudyArmResponseDto> getStudyArmById(@PathVariable Long armId) {
        log.debug("GET /arms/{}", armId);
        
        try {
            StudyArmResponseDto studyArm = studyArmService.getStudyArmById(armId);
            return ResponseEntity.ok(studyArm);
        } catch (RuntimeException e) {
            log.error("Error fetching study arm {}: {}", armId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching study arm {}: {}", armId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get a specific study arm for a study (with security check)
     * GET /studies/{studyId}/arms/{armId}
     */
    @GetMapping({"/studies/{studyId}/arms/{armId}", "/api/studies/{studyId}/arms/{armId}"})
    public ResponseEntity<StudyArmResponseDto> getStudyArmByIdAndStudyId(
            @PathVariable Long studyId,
            @PathVariable Long armId) {
        log.debug("GET /studies/{}/arms/{}", studyId, armId);
        
        try {
            StudyArmResponseDto studyArm = studyArmService.getStudyArmByIdAndStudyId(armId, studyId);
            return ResponseEntity.ok(studyArm);
        } catch (RuntimeException e) {
            log.error("Error fetching study arm {} for study {}: {}", armId, studyId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching study arm {} for study {}: {}", armId, studyId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Create a new study arm
     * POST /studies/{studyId}/arms
     */
    @PostMapping({"/studies/{studyId}/arms", "/api/studies/{studyId}/arms"})
    public ResponseEntity<StudyArmResponseDto> createStudyArm(
            @PathVariable Long studyId,
            @Valid @RequestBody StudyArmCreateRequestDto request) {
        log.debug("POST /studies/{}/arms with data: {}", studyId, request);
        
        try {
            StudyArmResponseDto createdStudyArm = studyArmService.createStudyArm(studyId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStudyArm);
        } catch (RuntimeException e) {
            log.error("Error creating study arm for study {}: {}", studyId, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error creating study arm for study {}: {}", studyId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update an existing study arm
     * PUT /arms/{armId}
     */
    @PutMapping({"/arms/{armId}", "/api/arms/{armId}"})
    public ResponseEntity<StudyArmResponseDto> updateStudyArm(
            @PathVariable Long armId,
            @Valid @RequestBody StudyArmUpdateRequestDto request) {
        log.debug("PUT /arms/{} with data: {}", armId, request);
        
        try {
            StudyArmResponseDto updatedStudyArm = studyArmService.updateStudyArm(armId, request);
            return ResponseEntity.ok(updatedStudyArm);
        } catch (RuntimeException e) {
            log.error("Error updating study arm {}: {}", armId, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error updating study arm {}: {}", armId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Delete a study arm
     * DELETE /arms/{armId}
     */
    @DeleteMapping({"/arms/{armId}", "/api/arms/{armId}"})
    public ResponseEntity<Void> deleteStudyArm(@PathVariable Long armId) {
        log.debug("DELETE /arms/{}", armId);
        
        try {
            studyArmService.deleteStudyArm(armId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error deleting study arm {}: {}", armId, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error deleting study arm {}: {}", armId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get study arm statistics for a study
     * GET /studies/{studyId}/arms/stats
     */
    @GetMapping({"/studies/{studyId}/arms/stats", "/api/studies/{studyId}/arms/stats"})
    public ResponseEntity<StudyArmService.StudyArmStatsDto> getStudyArmStats(@PathVariable Long studyId) {
        log.debug("GET /studies/{}/arms/stats", studyId);
        
        try {
            StudyArmService.StudyArmStatsDto stats = studyArmService.getStudyArmStats(studyId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching study arm stats for study {}: {}", studyId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Reorder study arm sequences
     * POST /studies/{studyId}/arms/reorder
     */
    @PostMapping({"/studies/{studyId}/arms/reorder", "/api/studies/{studyId}/arms/reorder"})
    public ResponseEntity<List<StudyArmResponseDto>> reorderStudyArmSequences(@PathVariable Long studyId) {
        log.debug("POST /studies/{}/arms/reorder", studyId);
        
        try {
            List<StudyArmResponseDto> reorderedArms = studyArmService.reorderStudyArmSequences(studyId);
            return ResponseEntity.ok(reorderedArms);
        } catch (Exception e) {
            log.error("Error reordering study arms for study {}: {}", studyId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}