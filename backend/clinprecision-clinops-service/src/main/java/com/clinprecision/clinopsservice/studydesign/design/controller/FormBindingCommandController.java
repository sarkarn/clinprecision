package com.clinprecision.clinopsservice.studydesign.design.controller;

import com.clinprecision.clinopsservice.common.util.DeprecationHeaderUtil;
import com.clinprecision.clinopsservice.studydesign.build.entity.VisitFormEntity;
import com.clinprecision.clinopsservice.studydesign.build.repository.VisitFormRepository;
import com.clinprecision.clinopsservice.studydesign.design.api.StudyDesignApiConstants;
import com.clinprecision.clinopsservice.studydesign.design.dto.UpdateFormAssignmentRequest;
import com.clinprecision.clinopsservice.studydesign.design.service.StudyDesignCommandService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Form Binding Command Controller - Bridge Pattern
 * 
 * <p>REST API for form binding write operations (command side).
 * Temporary bridge implementation until DDD commands are fully implemented.</p>
 * 
 * <p><b>URL Migration (October 2025 - April 2026):</b></p>
 * <ul>
 *   <li>NEW (Primary): {@code /api/v1/study-design/form-bindings/*} - DDD-aligned, domain-focused paths</li>
 *   <li>OLD (Deprecated): {@code /api/form-bindings/*} - Legacy bridge paths</li>
 * </ul>
 * 
 * <p><b>Command Endpoints:</b></p>
 * <ul>
 *   <li>PUT /api/form-bindings/{bindingId} - Update form binding</li>
 *   <li>DELETE /api/form-bindings/{bindingId} - Remove form binding</li>
 * </ul>
 * 
 * <p><b>NOTE:</b> POST endpoint is in StudyCommandController as POST /api/studies/{studyId}/visits/{visitId}/forms/{formId}</p>
 * 
 * <p><b>Architecture:</b></p>
 * <ul>
 *   <li>Bridge pattern for legacy compatibility</li>
 *   <li>Returns mock responses until DDD implementation is complete</li>
 *   <li>TODO: Implement UpdateFormAssignmentCommand and RemoveFormAssignmentCommand</li>
 * </ul>
 * 
 * <p><b>Deprecation Timeline:</b> October 19, 2025 - April 19, 2026 (6 months)</p>
 * 
 * @see StudyDesignApiConstants
 * @see DeprecationHeaderUtil
 * @author DDD Migration Team
 * @version 1.0
 * @since V004 Migration - Form Binding Phase - Module 1.3 Phase 1 (October 2025)
 */
@RestController
@RequestMapping({
    StudyDesignApiConstants.FORM_BINDINGS_PATH,        // NEW: /api/v1/study-design/form-bindings
    StudyDesignApiConstants.LEGACY_FORM_BINDINGS       // OLD: /api/form-bindings (deprecated)
})
@RequiredArgsConstructor
@Validated
@Slf4j
public class FormBindingCommandController {

    private final StudyDesignCommandService studyDesignCommandService;
    private final VisitFormRepository visitFormRepository;

    /**
     * Update form binding (modify form-to-visit assignment)
     * 
     * <p><b>Endpoints (Bridge Pattern):</b></p>
     * <ul>
     *   <li>NEW: {@code PUT /api/v1/study-design/form-bindings/{bindingId}}</li>
     *   <li>OLD: {@code PUT /api/form-bindings/{bindingId}} (deprecated)</li>
     * </ul>
     * 
     * <p><b>Command:</b> UpdateFormAssignmentCommand</p>
     * <p><b>Event:</b> FormAssignmentUpdatedEvent</p>
     * 
     * @param bindingId Form binding ID (assignment UUID)
     * @param updates Form binding updates
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return 200 OK with updated binding data
     */
    @PutMapping("/{bindingId}")
    public ResponseEntity<Map<String, Object>> updateFormBinding(
            @PathVariable String bindingId,
            @RequestBody Map<String, Object> updates,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Updating form binding: {}", bindingId);
        log.debug("REST: Update data: {}", updates);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.FORM_BINDINGS_PATH + "/{bindingId}",
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        try {
            UUID assignmentUuid = UUID.fromString(bindingId);
            
            // Find the existing binding to get the studyDesignId
            VisitFormEntity existingBinding =
                visitFormRepository.findByAssignmentUuid(assignmentUuid)
                    .orElseThrow(() -> new IllegalArgumentException("Form binding not found: " + bindingId));
            
            UUID studyDesignId = existingBinding.getAggregateUuid();
            
            // Create request DTO
            UpdateFormAssignmentRequest request =
                UpdateFormAssignmentRequest.builder()
                    .isRequired((Boolean) updates.getOrDefault("isRequired", existingBinding.getIsRequired()))
                    .isConditional((Boolean) updates.getOrDefault("isConditional", existingBinding.getIsConditional()))
                    .conditionalLogic((String) updates.get("conditionalLogic"))
                    .instructions((String) updates.get("instructions"))
                    .updatedBy(1L) // TODO: Get from security context
                    .build();
            
            // Send command via StudyDesignCommandService
            studyDesignCommandService.updateFormAssignment(studyDesignId, assignmentUuid, request).join();
            
            log.info("REST: Form binding updated: {}", bindingId);
            
            // Return response matching frontend expectations
            Map<String, Object> response = Map.of(
                "id", bindingId,
                "isRequired", request.getIsRequired(),
                "isConditional", request.getIsConditional(),
                "conditionalLogic", request.getConditionalLogic() != null ? request.getConditionalLogic() : "",
                "instructions", request.getInstructions() != null ? request.getInstructions() : "",
                "timing", updates.getOrDefault("timing", "ANY_TIME"),
                "conditions", updates.getOrDefault("conditions", new Object[0]),
                "reminders", updates.getOrDefault("reminders", Map.of("enabled", true, "days", new int[]{1}))
            );
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("REST: Invalid binding ID or binding not found: {}", bindingId, e);
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            log.error("REST: Business rule violation: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("REST: Error updating form binding: {}", bindingId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Remove form binding (unassign form from visit)
     * 
     * <p><b>Endpoints (Bridge Pattern):</b></p>
     * <ul>
     *   <li>NEW: {@code DELETE /api/v1/study-design/form-bindings/{bindingId}}</li>
     *   <li>OLD: {@code DELETE /api/form-bindings/{bindingId}} (deprecated)</li>
     * </ul>
     * 
     * <p><b>Command:</b> RemoveFormAssignmentCommand</p>
     * <p><b>Event:</b> FormAssignmentRemovedEvent</p>
     * 
     * @param bindingId Form binding ID (assignment UUID)
     * @param httpRequest HTTP servlet request for deprecation header detection
     * @param httpResponse HTTP servlet response for deprecation headers
     * @return 204 No Content
     */
    @DeleteMapping("/{bindingId}")
    public ResponseEntity<Void> removeFormBinding(
            @PathVariable String bindingId,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        
        log.info("REST: Removing form binding: {}", bindingId);
        
        // Add deprecation headers if using old URL
        DeprecationHeaderUtil.addDeprecationHeaders(
            httpRequest, httpResponse,
            StudyDesignApiConstants.FORM_BINDINGS_PATH + "/{bindingId}",
            StudyDesignApiConstants.DEPRECATION_MESSAGE,
            StudyDesignApiConstants.SUNSET_DATE
        );
        
        try {
            UUID assignmentUuid = UUID.fromString(bindingId);
            
            // Find the existing binding to get the studyDesignId
            VisitFormEntity existingBinding =
                visitFormRepository.findByAssignmentUuid(assignmentUuid)
                    .orElseThrow(() -> new IllegalArgumentException("Form binding not found: " + bindingId));
            
            UUID studyDesignId = existingBinding.getAggregateUuid();
            
            // Send command via StudyDesignCommandService
            studyDesignCommandService.removeFormAssignment(
                studyDesignId, 
                assignmentUuid, 
                "User requested removal", 
                1L // TODO: Get from security context
            ).join();
            
            log.info("REST: Form binding removed: {}", bindingId);
            
            return ResponseEntity.noContent().build();
            
        } catch (IllegalArgumentException e) {
            log.error("REST: Invalid binding ID or binding not found: {}", bindingId, e);
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            log.error("REST: Business rule violation: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("REST: Error removing form binding: {}", bindingId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
