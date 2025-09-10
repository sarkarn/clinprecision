package com.clinprecision.studydesignservice.controller;

import com.clinprecision.studydesignservice.dto.VisitFormDto;
import com.clinprecision.studydesignservice.service.VisitFormService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing visit form associations
 */
@RestController
@RequestMapping("/api/visit-forms")
@RequiredArgsConstructor
public class VisitFormController {

    private final VisitFormService visitFormService;

    /**
     * GET /api/visit-forms/visit/{visitDefinitionId} : Get all visit form associations for a visit definition
     * 
     * @param visitDefinitionId Visit definition ID
     * @return List of visit form associations
     */
    @GetMapping("/visit/{visitDefinitionId}")
    public ResponseEntity<List<VisitFormDto>> getVisitForms(@PathVariable Long visitDefinitionId) {
        return ResponseEntity.ok(visitFormService.getVisitForms(visitDefinitionId));
    }

    /**
     * GET /api/visit-forms/{id} : Get a visit form association by ID
     * 
     * @param id Visit form ID
     * @return Visit form with the given ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<VisitFormDto> getVisitFormById(@PathVariable Long id) {
        return ResponseEntity.ok(visitFormService.getVisitFormById(id));
    }

    /**
     * POST /api/visit-forms : Create a new visit form association
     * 
     * @param visitFormDto Visit form DTO
     * @param userDetails Authenticated user details
     * @return Created visit form
     */
    @PostMapping
    public ResponseEntity<VisitFormDto> createVisitForm(
            @Valid @RequestBody VisitFormDto visitFormDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Extract user ID from userDetails - implementation depends on how user details are structured
        Long userId = extractUserId(userDetails);
        
        VisitFormDto createdVisitForm = visitFormService.createVisitForm(visitFormDto, userId);
        return new ResponseEntity<>(createdVisitForm, HttpStatus.CREATED);
    }

    /**
     * PUT /api/visit-forms/{id} : Update a visit form association
     * 
     * @param id Visit form ID
     * @param visitFormDto Visit form DTO
     * @param userDetails Authenticated user details
     * @return Updated visit form
     */
    @PutMapping("/{id}")
    public ResponseEntity<VisitFormDto> updateVisitForm(
            @PathVariable Long id,
            @Valid @RequestBody VisitFormDto visitFormDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = extractUserId(userDetails);
        
        VisitFormDto updatedVisitForm = visitFormService.updateVisitForm(id, visitFormDto, userId);
        return ResponseEntity.ok(updatedVisitForm);
    }

    /**
     * DELETE /api/visit-forms/{id} : Delete a visit form association
     * 
     * @param id Visit form ID
     * @return No content response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVisitForm(@PathVariable Long id) {
        visitFormService.deleteVisitForm(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/visit-forms/{visitFormId}/active-version/{formVersionId} : Set the active form version
     * 
     * @param visitFormId Visit form ID
     * @param formVersionId Form version ID
     * @param userDetails Authenticated user details
     * @return Updated visit form
     */
    @PostMapping("/{visitFormId}/active-version/{formVersionId}")
    public ResponseEntity<VisitFormDto> setActiveFormVersion(
            @PathVariable Long visitFormId,
            @PathVariable Long formVersionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = extractUserId(userDetails);
        
        VisitFormDto updatedVisitForm = visitFormService.setActiveFormVersion(visitFormId, formVersionId, userId);
        return ResponseEntity.ok(updatedVisitForm);
    }
    
    /**
     * Helper method to extract user ID from UserDetails
     * Note: Implementation will depend on how user details are structured in your application
     * 
     * @param userDetails Authenticated user details
     * @return User ID
     */
    private Long extractUserId(UserDetails userDetails) {
        // This is a placeholder implementation. 
        // In a real application, you would extract the user ID from the UserDetails object
        // For example, if your UserDetails implementation has a getId() method:
        // return ((YourUserDetailsImpl) userDetails).getId();
        
        // For now, just return a dummy value
        return 1L;
    }
}
