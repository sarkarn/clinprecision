package com.clinprecision.studydesignservice.controller;

import com.clinprecision.studydesignservice.dto.VisitDefinitionDto;
import com.clinprecision.studydesignservice.service.VisitDefinitionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for managing visit definitions
 */
@RestController
@RequestMapping("/api/visit-definitions")
@RequiredArgsConstructor
public class VisitDefinitionController {

    private final VisitDefinitionService visitDefinitionService;

    /**
     * GET /api/visit-definitions : Get all visit definitions
     * 
     * @return List of all visit definitions
     */
    @GetMapping
    public ResponseEntity<List<VisitDefinitionDto>> getAllVisitDefinitions() {
        return ResponseEntity.ok(visitDefinitionService.getAllVisitDefinitions());
    }

    /**
     * GET /api/visit-definitions/study/{studyId} : Get visit definitions by study
     * 
     * @param studyId Study ID
     * @return List of visit definitions for the given study
     */
    @GetMapping("/study/{studyId}")
    public ResponseEntity<List<VisitDefinitionDto>> getVisitDefinitionsByStudy(@PathVariable Long studyId) {
        return ResponseEntity.ok(visitDefinitionService.getVisitDefinitionsByStudy(studyId));
    }

    /**
     * GET /api/visit-definitions/arm/{armId} : Get visit definitions by study arm
     * 
     * @param armId Study arm ID
     * @return List of visit definitions for the given study arm
     */
    @GetMapping("/arm/{armId}")
    public ResponseEntity<List<VisitDefinitionDto>> getVisitDefinitionsByArm(@PathVariable Long armId) {
        return ResponseEntity.ok(visitDefinitionService.getVisitDefinitionsByArm(armId));
    }

    /**
     * GET /api/visit-definitions/{id} : Get visit definition by ID
     * 
     * @param id Visit definition ID
     * @return Visit definition with the given ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<VisitDefinitionDto> getVisitDefinitionById(@PathVariable Long id) {
        return ResponseEntity.ok(visitDefinitionService.getVisitDefinitionById(id));
    }

    /**
     * POST /api/visit-definitions : Create a new visit definition
     * 
     * @param visitDefinitionDto Visit definition DTO
     * @param userDetails Authenticated user details
     * @return Created visit definition
     */
    @PostMapping
    public ResponseEntity<VisitDefinitionDto> createVisitDefinition(
            @Valid @RequestBody VisitDefinitionDto visitDefinitionDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Extract user ID from userDetails - implementation depends on how user details are structured
        Long userId = extractUserId(userDetails);
        
        VisitDefinitionDto createdVisitDefinition = visitDefinitionService.createVisitDefinition(visitDefinitionDto, userId);
        return new ResponseEntity<>(createdVisitDefinition, HttpStatus.CREATED);
    }

    /**
     * PUT /api/visit-definitions/{id} : Update an existing visit definition
     * 
     * @param id Visit definition ID
     * @param visitDefinitionDto Visit definition DTO
     * @param userDetails Authenticated user details
     * @return Updated visit definition
     */
    @PutMapping("/{id}")
    public ResponseEntity<VisitDefinitionDto> updateVisitDefinition(
            @PathVariable Long id,
            @Valid @RequestBody VisitDefinitionDto visitDefinitionDto,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = extractUserId(userDetails);
        
        VisitDefinitionDto updatedVisitDefinition = visitDefinitionService.updateVisitDefinition(id, visitDefinitionDto, userId);
        return ResponseEntity.ok(updatedVisitDefinition);
    }

    /**
     * DELETE /api/visit-definitions/{id} : Delete a visit definition
     * 
     * @param id Visit definition ID
     * @return No content response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVisitDefinition(@PathVariable Long id) {
        visitDefinitionService.deleteVisitDefinition(id);
        return ResponseEntity.noContent().build();
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
