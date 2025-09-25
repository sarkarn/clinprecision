package com.clinprecision.studydesignservice.controller;


import com.clinprecision.common.dto.studydesign.StudyVersionCreateRequestDto;
import com.clinprecision.common.dto.studydesign.StudyVersionDto;
import com.clinprecision.common.dto.studydesign.StudyVersionUpdateRequestDto;
import com.clinprecision.studydesignservice.service.StudyVersionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Study Version and Amendment Management
 */
@RestController
@RequestMapping("/api/studies/{studyId}")
public class StudyVersionController {
    
    @Autowired
    private StudyVersionService studyVersionService;
    
    /**
     * Get all versions for a study
     */
    @GetMapping("/versions")
    public ResponseEntity<List<StudyVersionDto>> getStudyVersions(@PathVariable Long studyId) {
        try {
            List<StudyVersionDto> versions = studyVersionService.getStudyVersions(studyId);
            return ResponseEntity.ok(versions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get a specific version by ID
     */
    @GetMapping("/versions/{versionId}")
    public ResponseEntity<StudyVersionDto> getVersionById(
            @PathVariable Long studyId,
            @PathVariable Long versionId) {
        try {
            Optional<StudyVersionDto> version = studyVersionService.getVersionById(versionId);
            return version.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get the active version for a study
     */
    @GetMapping("/versions/active")
    public ResponseEntity<StudyVersionDto> getActiveVersion(@PathVariable Long studyId) {
        try {
            Optional<StudyVersionDto> version = studyVersionService.getActiveVersion(studyId);
            return version.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get the latest version for a study
     */
    @GetMapping("/versions/latest")
    public ResponseEntity<StudyVersionDto> getLatestVersion(@PathVariable Long studyId) {
        try {
            Optional<StudyVersionDto> version = studyVersionService.getLatestVersion(studyId);
            return version.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Create a new study version
     */
    @PostMapping("/versions")
    public ResponseEntity<StudyVersionDto> createVersion(
            @PathVariable Long studyId,
            @Valid @RequestBody StudyVersionCreateRequestDto request) {
        try {
            // TODO: Get actual user ID from security context
            Long userId = 1L; // Placeholder - should come from authentication
            
            StudyVersionDto createdVersion = studyVersionService.createVersion(studyId, request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVersion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update a study version
     */
    @PutMapping("/versions/{versionId}")
    public ResponseEntity<StudyVersionDto> updateVersion(
            @PathVariable Long studyId,
            @PathVariable Long versionId,
            @RequestBody StudyVersionUpdateRequestDto request) {
        try {
            // TODO: Get actual user ID from security context
            Long userId = 1L; // Placeholder - should come from authentication
            
            StudyVersionDto updatedVersion = studyVersionService.updateVersion(versionId, request, userId);
            return ResponseEntity.ok(updatedVersion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Delete a study version
     */
    @DeleteMapping("/versions/{versionId}")
    public ResponseEntity<Void> deleteVersion(
            @PathVariable Long studyId,
            @PathVariable Long versionId) {
        try {
            studyVersionService.deleteVersion(versionId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Approve a version
     */
    @PostMapping("/versions/{versionId}/approve")
    public ResponseEntity<StudyVersionDto> approveVersion(
            @PathVariable Long studyId,
            @PathVariable Long versionId) {
        try {
            // TODO: Get actual user ID from security context
            Long approverId = 1L; // Placeholder - should come from authentication
            
            StudyVersionDto approvedVersion = studyVersionService.approveVersion(versionId, approverId);
            return ResponseEntity.ok(approvedVersion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Activate a version (make it the current active version)
     */
    @PostMapping("/versions/{versionId}/activate")
    public ResponseEntity<StudyVersionDto> activateVersion(
            @PathVariable Long studyId,
            @PathVariable Long versionId) {
        try {
            StudyVersionDto activatedVersion = studyVersionService.activateVersion(versionId);
            return ResponseEntity.ok(activatedVersion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get version history for a study
     */
    @GetMapping("/versions/history")
    public ResponseEntity<List<StudyVersionDto>> getVersionHistory(@PathVariable Long studyId) {
        try {
            List<StudyVersionDto> history = studyVersionService.getVersionHistory(studyId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}