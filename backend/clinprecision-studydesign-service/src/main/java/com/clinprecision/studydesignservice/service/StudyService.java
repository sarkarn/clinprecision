package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.entity.StudyEntity;
import com.clinprecision.studydesignservice.exception.EntityLockedException;
import com.clinprecision.studydesignservice.model.Study;
import com.clinprecision.studydesignservice.repository.StudyRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudyService {
    private final StudyRepository studyRepository;
    private final ModelMapper modelMapper;
    private final LockingService lockingService;

    public StudyService(StudyRepository studyRepository, LockingService lockingService) {
        this.studyRepository = studyRepository;
        this.modelMapper = new ModelMapper();
        this.lockingService = lockingService;
    }

    public List<Study> getAllStudies() {
        return studyRepository.findAll()
                .stream()
                .map(entity -> modelMapper.map(entity, Study.class))
                .collect(Collectors.toList());
    }

    public Optional<Study> getStudyById(String id) {
        return studyRepository.findById(id)
                .map(entity -> modelMapper.map(entity, Study.class));
    }

    public Study createStudy(Study study) {
        StudyEntity entity = modelMapper.map(study, StudyEntity.class);
        StudyEntity saved = studyRepository.save(entity);
        return modelMapper.map(saved, Study.class);
    }

    public Study updateStudy(String id, Study study) {
        // Check if study is locked
        lockingService.ensureStudyNotLocked(id);
        
        study.setId(id);
        StudyEntity entity = modelMapper.map(study, StudyEntity.class);
        StudyEntity saved = studyRepository.save(entity);
        return modelMapper.map(saved, Study.class);
    }

    public void deleteStudy(String id) {
        // Check if study is locked
        lockingService.ensureStudyNotLocked(id);
        
        studyRepository.deleteById(id);
    }
}

