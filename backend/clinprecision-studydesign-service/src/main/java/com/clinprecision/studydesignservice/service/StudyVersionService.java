package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.entity.StudyVersionEntity;
import com.clinprecision.studydesignservice.model.StudyVersion;
import com.clinprecision.studydesignservice.repository.StudyVersionRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudyVersionService {
    private final StudyVersionRepository repository;
    private final ModelMapper modelMapper = new ModelMapper();

    public StudyVersionService(StudyVersionRepository repository) {
        this.repository = repository;
    }

    public List<StudyVersion> getByStudyId(Long studyId) {
        return repository.findByStudyId(studyId)
                .stream()
                .map(e -> modelMapper.map(e, StudyVersion.class))
                .collect(Collectors.toList());
    }

    public StudyVersion create(StudyVersion model) {
        StudyVersionEntity entity = modelMapper.map(model, StudyVersionEntity.class);
        StudyVersionEntity saved = repository.save(entity);
        return modelMapper.map(saved, StudyVersion.class);
    }

    public Optional<StudyVersion> getById(Long id) {
        return repository.findById(id).map(e -> modelMapper.map(e, StudyVersion.class));
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
