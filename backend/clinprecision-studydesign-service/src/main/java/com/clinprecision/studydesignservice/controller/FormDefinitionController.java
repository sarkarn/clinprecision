package com.clinprecision.studydesignservice.controller;


import com.clinprecision.studydesignservice.model.FormDefinition;
import com.clinprecision.studydesignservice.service.FormDefinitionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/forms")
@RequiredArgsConstructor
public class FormDefinitionController {

    private final FormDefinitionService formDefinitionService;

    @GetMapping
    public ResponseEntity<List<FormDefinition>> getAllForms() {
        return ResponseEntity.ok(formDefinitionService.getAllForms());
    }

    @GetMapping("/study/{studyId}")
    public ResponseEntity<List<FormDefinition>> getFormsByStudy(@PathVariable String studyId) {
        return ResponseEntity.ok(formDefinitionService.getFormsByStudy(studyId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FormDefinition> getFormById(@PathVariable String id) {
        return ResponseEntity.ok(formDefinitionService.getFormById(id));
    }

    @PostMapping
    public ResponseEntity<FormDefinition> createForm(
            @Valid @RequestBody FormDefinition formDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        FormDefinition createdForm = formDefinitionService.createForm(
                formDTO,
                userDetails.getUsername()
        );

        return new ResponseEntity<>(createdForm, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormDefinition> updateForm(
            @PathVariable String id,
            @Valid @RequestBody FormDefinition formDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        FormDefinition updatedForm = formDefinitionService.updateForm(
                id,
                formDTO,
                userDetails.getUsername()
        );

        return ResponseEntity.ok(updatedForm);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable String id) {
        formDefinitionService.deleteForm(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<FormDefinition> approveForm(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {

        FormDefinition approvedForm = formDefinitionService.approveForm(
                id,
                userDetails.getUsername()
        );

        return ResponseEntity.ok(approvedForm);
    }
}