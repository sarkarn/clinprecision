package com.clinprecision.studydesignservice.controller;

import com.clinprecision.studydesignservice.dto.FormDto;
import com.clinprecision.studydesignservice.dto.FormVersionDto;
import com.clinprecision.studydesignservice.service.FormService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing forms and form versions
 */
@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
public class FormController {

    private final FormService formService;

    /**
     * GET /api/forms : Get all forms
     * 
     * @return List of all forms
     */
    @GetMapping
    public ResponseEntity<List<FormDto>> getAllForms() {
        return ResponseEntity.ok(formService.getAllForms());
    }

    /**
     * GET /api/forms/study/{studyId} : Get forms by study
     * 
     * @param studyId Study ID
     * @return List of forms for the given study
     */
    @GetMapping("/study/{studyId}")
    public ResponseEntity<List<FormDto>> getFormsByStudy(@PathVariable Long studyId) {
        return ResponseEntity.ok(formService.getFormsByStudy(studyId));
    }

    /**
     * GET /api/forms/{id} : Get form by ID
     * 
     * @param id Form ID
     * @return Form with the given ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<FormDto> getFormById(@PathVariable Long id) {
        return ResponseEntity.ok(formService.getFormById(id));
    }

    /**
     * POST /api/forms : Create a new form
     * 
     * @param formDto Form DTO
     * @param userDetails Authenticated user details
     * @return Created form
     */
    @PostMapping
    public ResponseEntity<FormDto> createForm(
            @Valid @RequestBody FormDto formDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Extract user ID from userDetails - implementation depends on how user details are structured
        Long userId = extractUserId(userDetails);
        
        FormDto createdForm = formService.createForm(formDto, userId);
        return new ResponseEntity<>(createdForm, HttpStatus.CREATED);
    }

    /**
     * PUT /api/forms/{id} : Update an existing form
     * 
     * @param id Form ID
     * @param formDto Form DTO
     * @param userDetails Authenticated user details
     * @return Updated form
     */
    @PutMapping("/{id}")
    public ResponseEntity<FormDto> updateForm(
            @PathVariable Long id,
            @Valid @RequestBody FormDto formDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = extractUserId(userDetails);
        
        FormDto updatedForm = formService.updateForm(id, formDto, userId);
        return ResponseEntity.ok(updatedForm);
    }

    /**
     * DELETE /api/forms/{id} : Delete a form
     * 
     * @param id Form ID
     * @return No content response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable Long id) {
        formService.deleteForm(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/forms/{id}/publish : Publish a form
     * 
     * @param id Form ID
     * @param userDetails Authenticated user details
     * @return Published form
     */
    @PostMapping("/{id}/publish")
    public ResponseEntity<FormDto> publishForm(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = extractUserId(userDetails);
        
        FormDto publishedForm = formService.publishForm(id, userId);
        return ResponseEntity.ok(publishedForm);
    }

    /**
     * GET /api/forms/{formId}/versions : Get all versions of a form
     * 
     * @param formId Form ID
     * @return List of form versions
     */
    @GetMapping("/{formId}/versions")
    public ResponseEntity<List<FormVersionDto>> getFormVersions(@PathVariable Long formId) {
        return ResponseEntity.ok(formService.getFormVersions(formId));
    }

    /**
     * GET /api/forms/{formId}/versions/{versionId} : Get a specific version of a form
     * 
     * @param formId Form ID
     * @param versionId Version ID
     * @return Form version
     */
    @GetMapping("/{formId}/versions/{versionId}")
    public ResponseEntity<FormVersionDto> getFormVersion(
            @PathVariable Long formId,
            @PathVariable Long versionId) {
        
        return ResponseEntity.ok(formService.getFormVersion(formId, versionId));
    }

    /**
     * POST /api/forms/{formId}/versions : Create a new version of a form
     * 
     * @param formId Form ID
     * @param versionDto Form version DTO
     * @param userDetails Authenticated user details
     * @return Created form version
     */
    @PostMapping("/{formId}/versions")
    public ResponseEntity<FormVersionDto> createFormVersion(
            @PathVariable Long formId,
            @Valid @RequestBody FormVersionDto versionDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = extractUserId(userDetails);
        
        FormVersionDto createdVersion = formService.createFormVersion(formId, versionDto, userId);
        return new ResponseEntity<>(createdVersion, HttpStatus.CREATED);
    }

    /**
     * PUT /api/forms/{formId}/versions/{versionId} : Update a form version
     * 
     * @param formId Form ID
     * @param versionId Version ID
     * @param versionDto Form version DTO
     * @param userDetails Authenticated user details
     * @return Updated form version
     */
    @PutMapping("/{formId}/versions/{versionId}")
    public ResponseEntity<FormVersionDto> updateFormVersion(
            @PathVariable Long formId,
            @PathVariable Long versionId,
            @Valid @RequestBody FormVersionDto versionDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = extractUserId(userDetails);
        
        FormVersionDto updatedVersion = formService.updateFormVersion(formId, versionId, versionDto, userId);
        return ResponseEntity.ok(updatedVersion);
    }

    /**
     * POST /api/forms/{formId}/versions/{versionId}/publish : Publish a form version
     * 
     * @param formId Form ID
     * @param versionId Version ID
     * @param userDetails Authenticated user details
     * @return Published form version
     */
    @PostMapping("/{formId}/versions/{versionId}/publish")
    public ResponseEntity<FormVersionDto> publishFormVersion(
            @PathVariable Long formId,
            @PathVariable Long versionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = extractUserId(userDetails);
        
        FormVersionDto publishedVersion = formService.publishFormVersion(formId, versionId, userId);
        return ResponseEntity.ok(publishedVersion);
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
