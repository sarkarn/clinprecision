package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.entity.StudyArmEntity;
import com.clinprecision.studydesignservice.model.StudyArm;
import com.clinprecision.studydesignservice.repository.StudyArmRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudyArmService {
    private final StudyArmRepository repository;
    private final ModelMapper modelMapper = new ModelMapper();

    public StudyArmService(StudyArmRepository repository) {
        this.repository = repository;
    }

    public List<StudyArm> getByStudyId(Long studyId) {
        return repository.findByStudyId(studyId)
                .stream()
                .map(e -> modelMapper.map(e, StudyArm.class))
                .collect(Collectors.toList());
    }

    public StudyArm create(StudyArm model) {
        StudyArmEntity entity = modelMapper.map(model, StudyArmEntity.class);
        StudyArmEntity saved = repository.save(entity);
        return modelMapper.map(saved, StudyArm.class);
    }

    public Optional<StudyArm> getById(Long id) {
        return repository.findById(id).map(e -> modelMapper.map(e, StudyArm.class));
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
