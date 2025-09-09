package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.entity.StudyEntity;
import com.clinprecision.studydesignservice.exception.EntityLockedException;
import com.clinprecision.studydesignservice.model.Study;
import com.clinprecision.studydesignservice.model.StudyDetailsDTO;
import com.clinprecision.studydesignservice.repository.StudyRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public Optional<Study> getStudyById(Long id) {
        return studyRepository.findById(id)
                .map(entity -> modelMapper.map(entity, Study.class));
    }

    public Study createStudy(Study study) {
        StudyEntity entity = modelMapper.map(study, StudyEntity.class);
        StudyEntity saved = studyRepository.save(entity);
        return modelMapper.map(saved, Study.class);
    }

    public Study updateStudy(Long id, Study study) {
        // Check if study is locked
        lockingService.ensureStudyNotLocked(id);
        
        study.setId(id);
        StudyEntity entity = modelMapper.map(study, StudyEntity.class);
        StudyEntity saved = studyRepository.save(entity);
        return modelMapper.map(saved, Study.class);
    }

    /**
     * Updates only the basic details of a study without affecting collections or relationships.
     * This method avoids Hibernate cascade issues by performing a selective update.
     *
     * @param id The ID of the study to update
     * @param details The study details to update
     * @return The updated study
     */
    @Transactional
    public Study updateStudyDetailsOnly(Long id, StudyDetailsDTO details) {
        // Check if study is locked
        lockingService.ensureStudyNotLocked(id);
        
        // Get the existing entity from the database
        StudyEntity entity = studyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Study not found with ID: " + id));
        
        // Update only the scalar properties, preserving collections and relationships
        if (details.getName() != null) entity.setName(details.getName());
        if (details.getDescription() != null) entity.setDescription(details.getDescription());
        if (details.getSponsor() != null) entity.setSponsor(details.getSponsor());
        if (details.getProtocolNumber() != null) entity.setProtocolNumber(details.getProtocolNumber());
        if (details.getPhase() != null) entity.setPhase(details.getPhase());
        if (details.getStatus() != null) entity.setStatus(details.getStatus());
        if (details.getStartDate() != null) entity.setStartDate(details.getStartDate());
        if (details.getEndDate() != null) entity.setEndDate(details.getEndDate());
        if (details.getMetadata() != null) entity.setMetadata(details.getMetadata());
        
        // Save the updated entity
        StudyEntity saved = studyRepository.save(entity);
        
        // Return the updated study
        return modelMapper.map(saved, Study.class);
    }

    public void deleteStudy(Long id) {
        // Check if study is locked
        lockingService.ensureStudyNotLocked(id);
        
        studyRepository.deleteById(id);
    }
}

