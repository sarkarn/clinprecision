package com.clinprecision.clinopsservice.study.controller;

import com.clinprecision.clinopsservice.study.dto.request.StudyArmRequestDto;
import com.clinprecision.clinopsservice.study.dto.response.StudyArmResponseDto;
import com.clinprecision.clinopsservice.study.service.StudyCommandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Study Arms Command Controller
 * 
 * Separate controller for arm-specific endpoints that don't fit under /api/studies path.
 * This is a bridge pattern implementation for backward compatibility.
 * 
 * Base Path: /api/arms
 * 
 * Command Endpoints:
 * - PUT    /api/arms/{armId}    - Update study arm
 * - DELETE /api/arms/{armId}    - Delete study arm
 * 
 * Architecture:
 * - Bridge pattern for frontend compatibility
 * - Delegates to StudyCommandService
 * - TODO: Migrate to proper DDD commands when StudyDesignAggregate is ready
 * 
 * @author DDD Migration Team
 * @version 1.0
 * @since V004 Migration
 */
@RestController
@RequestMapping("/api/arms")
@RequiredArgsConstructor
@Validated
@Slf4j
public class StudyArmsCommandController {

    private final StudyCommandService studyCommandService;

    /**
     * Update a study arm by arm ID
     * 
     * Bridge endpoint: Frontend calls PUT /api/arms/{armId}
     * 
     * Command: UpdateStudyArmCommand (TODO - future DDD implementation)
     * 
     * @param armId Arm ID
     * @param armData Updated arm data
     * @return 200 OK with updated arm data
     */
    @PutMapping("/{armId}")
    public ResponseEntity<StudyArmResponseDto> updateStudyArm(
            @PathVariable Long armId,
            @Valid @RequestBody StudyArmRequestDto armData) {
        
        log.info("REST: Updating study arm: {}", armId);
        
        try {
            // TODO: Send DDD command to StudyDesignAggregate
            // For now, update directly in read model (temporary bridge implementation)
            StudyArmResponseDto updatedArm = studyCommandService.updateStudyArm(armId, armData);
            
            log.info("REST: Study arm updated successfully: {}", updatedArm.getName());
            return ResponseEntity.ok(updatedArm);
            
        } catch (Exception e) {
            log.error("REST: Error updating study arm: {}", armId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Delete a study arm by arm ID
     * 
     * Bridge endpoint: Frontend calls DELETE /api/arms/{armId}
     * 
     * Command: RemoveStudyArmCommand (TODO - future DDD implementation)
     * 
     * @param armId Arm ID
     * @return 204 No Content
     */
    @DeleteMapping("/{armId}")
    public ResponseEntity<Void> deleteStudyArm(@PathVariable Long armId) {
        log.info("REST: Deleting study arm: {}", armId);
        
        try {
            // TODO: Send DDD command to StudyDesignAggregate
            // For now, delete directly in read model (temporary bridge implementation)
            studyCommandService.deleteStudyArm(armId);
            
            log.info("REST: Study arm deleted successfully");
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            log.error("REST: Error deleting study arm: {}", armId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
