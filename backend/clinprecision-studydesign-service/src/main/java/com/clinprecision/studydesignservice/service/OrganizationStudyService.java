package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.entity.OrganizationStudyEntity;
import com.clinprecision.studydesignservice.model.OrganizationStudy;
import com.clinprecision.studydesignservice.repository.OrganizationStudyRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrganizationStudyService {
    private final OrganizationStudyRepository repository;
    private final ModelMapper modelMapper = new ModelMapper();

    public OrganizationStudyService(OrganizationStudyRepository repository) {
        this.repository = repository;
    }

    public List<OrganizationStudy> getByStudyId(Long studyId) {
        return repository.findByStudyId(studyId)
                .stream()
                .map(e -> modelMapper.map(e, OrganizationStudy.class))
                .collect(Collectors.toList());
    }

    public List<OrganizationStudy> getByOrganizationId(Long orgId) {
        return repository.findByOrganizationId(orgId)
                .stream()
                .map(e -> modelMapper.map(e, OrganizationStudy.class))
                .collect(Collectors.toList());
    }

    public OrganizationStudy create(OrganizationStudy model) {
        OrganizationStudyEntity entity = modelMapper.map(model, OrganizationStudyEntity.class);
        OrganizationStudyEntity saved = repository.save(entity);
        return modelMapper.map(saved, OrganizationStudy.class);
    }

    public Optional<OrganizationStudy> getById(Long id) {
        return repository.findById(id).map(e -> modelMapper.map(e, OrganizationStudy.class));
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
