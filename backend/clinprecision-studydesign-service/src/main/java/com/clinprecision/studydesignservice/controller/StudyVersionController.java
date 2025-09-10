package com.clinprecision.studydesignservice.controller;

import com.clinprecision.studydesignservice.model.StudyVersion;
import com.clinprecision.studydesignservice.service.StudyVersionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/study-versions")
public class StudyVersionController {
    private final StudyVersionService service;

    public StudyVersionController(StudyVersionService service) {
        this.service = service;
    }

    @GetMapping("/study/{studyId}")
    public List<StudyVersion> getByStudy(@PathVariable Long studyId) {
        return service.getByStudyId(studyId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyVersion> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public StudyVersion create(@RequestBody StudyVersion model) {
        return service.create(model);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
