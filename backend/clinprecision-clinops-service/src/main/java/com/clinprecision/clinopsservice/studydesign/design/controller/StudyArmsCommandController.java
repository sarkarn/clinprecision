package com.clinprecision.clinopsservice.studydesign.design.controller;

import com.clinprecision.clinopsservice.common.util.DeprecationHeaderUtil;
import com.clinprecision.clinopsservice.studydesign.design.api.StudyDesignApiConstants;
import com.clinprecision.clinopsservice.studydesign.design.arm.dto.StudyArmRequestDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.dto.response.StudyArmResponseDto;
import com.clinprecision.clinopsservice.studydesign.studymgmt.service.StudyCommandService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Study Arms Command Controller (Bridge Pattern)
 * 
 * <p>Separate controller for arm-specific endpoints that don't fit under /api/studies path.
 * This is a bridge pattern implementation for backward compatibility.</p>
 * 
 * <p><b>URL Migration (October 2025 - April 2026):</b></p>
 * <ul>
 *   <li>NEW (Primary): {@code /api/v1/study-design/arms/*} - DDD-aligned, domain-focused paths</li>
 *   <li>OLD (Deprecated): {@code /api/arms/*} - Legacy bridge paths</li>
 * </ul>
 * 
 * <p><b>Command Endpoints:</b></p>
 * <ul>
 *   <li>PUT /api/arms/{armId} - Update study arm</li>
 *   <li>DELETE /api/arms/{armId} - Delete study arm</li>
 * </ul>
 * 
 * <p><b>Architecture:</b></p>
 * <ul>
 *   <li>Bridge pattern for frontend compatibility</li>
 *   <li>Delegates to StudyCommandService</li>
 *   <li>TODO: Migrate to proper DDD commands when StudyDesignAggregate is ready</li>
 * </ul>
 * 
 * <p><b>Deprecation Timeline:</b> October 19, 2025 - April 19, 2026 (6 months)</p>
 * 
 * @see StudyDesignApiConstants
 * @see DeprecationHeaderUtil
 * @author DDD Migration Team
 * @version 1.0
 * @since V004 Migration - Module 1.3 Phase 1 (October 2025)
 */
@RestController
@RequestMapping({
    StudyDesignApiConstants.ARMS_PATH,        // NEW: /api/v1/study-design/arms
    StudyDesignApiConstants.LEGACY_ARMS       // OLD: /api/arms (deprecated)
})
@RequiredArgsConstructor
@Validated
@Slf4j
public class StudyArmsCommandController {

    private final StudyCommandService studyCommandService;

    /**
     * Update a study arm by arm ID
     * 
     * <p><b>Endpoints (Bridge Pattern):</b></p>
     * <ul>
     *   <li>NEW: {@code PUT /api/v1/study-design/arms/{armId}}</li>
     *   <li>OLD: {@code PUT /api/arms/{armId}} (deprecated)</li>
     * </ul>
     * 
     * <p><b>Command:</b> UpdateStudyArmCommand (TODO - future DDD implementation)</p>
     * 
     * @param armId Arm ID
     * @param armData Updated arm data
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return 200 OK with updated arm data
     */
    @PutMapping("/{armId}")
    public ResponseEntity<StudyArmResponseDto> updateStudyArm(
            @PathVariable Long armId,
            @Valid @RequestBody StudyArmRequestDto armData,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Updating study arm: {}", armId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.ARMS_PATH + "/{armId}",
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
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
     * <p><b>Endpoints (Bridge Pattern):</b></p>
     * <ul>
     *   <li>NEW: {@code DELETE /api/v1/study-design/arms/{armId}}</li>
     *   <li>OLD: {@code DELETE /api/arms/{armId}} (deprecated)</li>
     * </ul>
     * 
     * <p><b>Command:</b> RemoveStudyArmCommand (TODO - future DDD implementation)</p>
     * 
     * @param armId Arm ID
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return 204 No Content
     */
    @DeleteMapping("/{armId}")
    public ResponseEntity<Void> deleteStudyArm(
            @PathVariable Long armId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Deleting study arm: {}", armId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.ARMS_PATH + "/{armId}",
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
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
