package com.clinprecision.studydesignservice.controller;


import com.clinprecision.studydesignservice.model.Study;
import com.clinprecision.studydesignservice.model.StudyDetailsDTO;
import com.clinprecision.studydesignservice.service.StudyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/studies")
public class StudyController {
    private final StudyService studyService;

    public StudyController(StudyService studyService) {
        this.studyService = studyService;
    }

    @GetMapping
    public List<Study> getAllStudies() {
        return studyService.getAllStudies();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Study> getStudyById(@PathVariable Long id) {
        return studyService.getStudyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Study createStudy(@RequestBody Study study) {
        return studyService.createStudy(study);
    }

    @PutMapping("/{id}")
    public Study updateStudy(@PathVariable Long id, @RequestBody Study study) {
        return studyService.updateStudy(id, study);
    }

    /**
     * Endpoint to update only the basic details of a study without affecting collections or relationships.
     * This avoids Hibernate cascade issues when updating partial data.
     * 
     * @param id The ID of the study to update
     * @param details The details to update
     * @return The updated study
     */
    @PostMapping("/{id}/details")
    public Study updateStudyDetailsOnly(@PathVariable Long id, @RequestBody StudyDetailsDTO details) {
        return studyService.updateStudyDetailsOnly(id, details);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudy(@PathVariable Long id) {
        studyService.deleteStudy(id);
        return ResponseEntity.noContent().build();
    }
}
