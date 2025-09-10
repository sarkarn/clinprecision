package com.clinprecision.studydesignservice.controller;

import com.clinprecision.studydesignservice.model.OrganizationStudy;
import com.clinprecision.studydesignservice.service.OrganizationStudyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/organization-studies")
public class OrganizationStudyController {
    private final OrganizationStudyService service;

    public OrganizationStudyController(OrganizationStudyService service) {
        this.service = service;
    }

    @GetMapping("/study/{studyId}")
    public List<OrganizationStudy> getByStudy(@PathVariable Long studyId) {
        return service.getByStudyId(studyId);
    }

    @GetMapping("/organization/{orgId}")
    public List<OrganizationStudy> getByOrganization(@PathVariable Long orgId) {
        return service.getByOrganizationId(orgId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrganizationStudy> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public OrganizationStudy create(@RequestBody OrganizationStudy model) {
        return service.create(model);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
