package com.clinprecision.clinopsservice.controller;


import com.clinprecision.clinopsservice.service.StudyVersionService;
import com.clinprecision.common.dto.clinops.StudyVersionDto;
import com.clinprecision.common.entity.clinops.StudyVersionEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/study-versions")
public class StudyVersionStatusController {
    
    private static final Logger log = LoggerFactory.getLogger(StudyVersionStatusController.class);
    
    @Autowired
    private StudyVersionService studyVersionService;


    /**
     * Update version status - handles status changes like Submit for Review
     */
    @PutMapping("/{versionId}/status")
    public ResponseEntity<StudyVersionDto> updateVersionStatus(
            @PathVariable Long versionId,
            @RequestBody Map<String, String> statusRequest) {
        log.info("Received request to update version status: versionId={}, request={}", versionId, statusRequest);
        try {
                String statusString = statusRequest.get("status");
                if (statusString == null) {
                    return ResponseEntity.badRequest().build();
                }

                // Convert string to enum
                StudyVersionEntity.VersionStatus status;
                try {
                    status = StudyVersionEntity.VersionStatus.valueOf(statusString);
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest().build();
                }

                // TODO: Get actual user ID from security context
                Long userId = 1L; // Placeholder - should come from authentication

                StudyVersionDto updatedVersion = studyVersionService.updateVersionStatus(versionId, status, userId);
                return ResponseEntity.ok(updatedVersion);
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().build();
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
        }
}
