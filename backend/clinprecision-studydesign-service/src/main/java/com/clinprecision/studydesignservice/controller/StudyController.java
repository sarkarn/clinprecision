package com.clinprecision.studydesignservice.controller;


import com.clinprecision.studydesignservice.model.Study;
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
    public ResponseEntity<Study> getStudyById(@PathVariable String id) {
        return studyService.getStudyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Study createStudy(@RequestBody Study study) {
        return studyService.createStudy(study);
    }

    @PutMapping("/{id}")
    public Study updateStudy(@PathVariable String id, @RequestBody Study study) {
        return studyService.updateStudy(id, study);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudy(@PathVariable String id) {
        studyService.deleteStudy(id);
        return ResponseEntity.noContent().build();
    }
}
