package com.clinprecision.studydesignservice.controller;

import com.clinprecision.studydesignservice.model.StudyArm;
import com.clinprecision.studydesignservice.service.StudyArmService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/study-arms")
public class StudyArmController {
    private final StudyArmService service;

    public StudyArmController(StudyArmService service) {
        this.service = service;
    }

    @GetMapping("/study/{studyId}")
    public List<StudyArm> getByStudy(@PathVariable Long studyId) {
        return service.getByStudyId(studyId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyArm> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public StudyArm create(@RequestBody StudyArm model) {
        return service.create(model);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
