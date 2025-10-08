package com.clinprecision.clinopsservice.study.controller;

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
 * REST API for form binding write operations (command side).
 * Temporary bridge implementation until DDD commands are implemented.
 * 
 * Base Path: /api/form-bindings
 * 
 * Command Endpoints:
 * - PUT    /api/form-bindings/{bindingId}      - Update form binding
 * - DELETE /api/form-bindings/{bindingId}      - Remove form binding
 * 
 * NOTE: POST endpoint is in StudyCommandController as POST /api/studies/{studyId}/visits/{visitId}/forms/{formId}
 * 
 * Architecture:
 * - Bridge pattern for legacy compatibility
 * - Returns mock responses until DDD implementation is complete
 * - TODO: Implement UpdateFormAssignmentCommand and RemoveFormAssignmentCommand
 * 
 * @author DDD Migration Team
 * @version 1.0
 * @since V004 Migration - Form Binding Phase
 */
@RestController
@RequestMapping("/api/form-bindings")
@RequiredArgsConstructor
@Validated
@Slf4j
public class FormBindingCommandController {

    private final com.clinprecision.clinopsservice.studydesign.service.StudyDesignCommandService studyDesignCommandService;
    private final com.clinprecision.clinopsservice.repository.VisitFormRepository visitFormRepository;

    /**
     * Update form binding (modify form-to-visit assignment)
     * 
     * Bridge endpoint: Frontend calls PUT /api/form-bindings/{bindingId}
     * Backend DDD: UpdateFormAssignmentCommand
     * 
     * Command: UpdateFormAssignmentCommand
     * Event: FormAssignmentUpdatedEvent
     * 
     * @param bindingId Form binding ID (assignment UUID)
     * @param updates Form binding updates
     * @return 200 OK with updated binding data
     */
    @PutMapping("/{bindingId}")
    public ResponseEntity<Map<String, Object>> updateFormBinding(
            @PathVariable String bindingId,
            @RequestBody Map<String, Object> updates) {
        
        log.info("REST: Updating form binding: {}", bindingId);
        log.debug("REST: Update data: {}", updates);
        
        try {
            UUID assignmentUuid = UUID.fromString(bindingId);
            
            // Find the existing binding to get the studyDesignId
            com.clinprecision.clinopsservice.entity.VisitFormEntity existingBinding = 
                visitFormRepository.findByAssignmentUuid(assignmentUuid)
                    .orElseThrow(() -> new IllegalArgumentException("Form binding not found: " + bindingId));
            
            UUID studyDesignId = existingBinding.getAggregateUuid();
            
            // Create request DTO
            com.clinprecision.clinopsservice.studydesign.dto.UpdateFormAssignmentRequest request = 
                com.clinprecision.clinopsservice.studydesign.dto.UpdateFormAssignmentRequest.builder()
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
     * Bridge endpoint: Frontend calls DELETE /api/form-bindings/{bindingId}
     * Backend DDD: RemoveFormAssignmentCommand
     * 
     * Command: RemoveFormAssignmentCommand
     * Event: FormAssignmentRemovedEvent
     * 
     * @param bindingId Form binding ID (assignment UUID)
     * @return 204 No Content
     */
    @DeleteMapping("/{bindingId}")
    public ResponseEntity<Void> removeFormBinding(@PathVariable String bindingId) {
        
        log.info("REST: Removing form binding: {}", bindingId);
        
        try {
            UUID assignmentUuid = UUID.fromString(bindingId);
            
            // Find the existing binding to get the studyDesignId
            com.clinprecision.clinopsservice.entity.VisitFormEntity existingBinding = 
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
