package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.entity.FormDefinitionEntity;
import com.clinprecision.studydesignservice.entity.StudyEntity;
import com.clinprecision.studydesignservice.entity.VisitDefinitionEntity;
import com.clinprecision.studydesignservice.entity.VisitFormEntity;
import com.clinprecision.studydesignservice.repository.FormDefinitionRepository;
import com.clinprecision.studydesignservice.repository.StudyRepository;
import com.clinprecision.studydesignservice.repository.VisitDefinitionRepository;
import com.clinprecision.studydesignservice.repository.VisitFormRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service responsible for maintaining data integrity across versioned entities.
 * This ensures that when a study or CRF is versioned, all related entities are 
 * properly handled to maintain referential integrity.
 */
@Service
public class VersionIntegrityService {

    private final StudyRepository studyRepository;
    private final VisitDefinitionRepository visitDefinitionRepository;
    private final FormDefinitionRepository formDefinitionRepository;
    private final VisitFormRepository visitFormRepository;

    public VersionIntegrityService(
            StudyRepository studyRepository,
            VisitDefinitionRepository visitDefinitionRepository,
            FormDefinitionRepository formDefinitionRepository,
            VisitFormRepository visitFormRepository) {
        this.studyRepository = studyRepository;
        this.visitDefinitionRepository = visitDefinitionRepository;
        this.formDefinitionRepository = formDefinitionRepository;
        this.visitFormRepository = visitFormRepository;
    }

    /**
     * Creates a new version of a study with all its related entities
     * This ensures data integrity by creating new versions of all related
     * study arms, visits, and forms.
     *
     * @param studyId The ID of the study to version
     * @param versionNotes Notes describing this version
     * @param userId ID of the user creating the version
     * @return The ID of the newly created study version
     */
    @Transactional
    public String createStudyVersionWithRelatedEntities(String studyId, String versionNotes, String userId) {
        // Get the current study
        StudyEntity currentStudy = studyRepository.findById(studyId)
                .orElseThrow(() -> new EntityNotFoundException("Study not found with id: " + studyId));

        // Mark current version as not latest
        currentStudy.setLatestVersion(false);
        studyRepository.save(currentStudy);

        // Create new version of the study
        StudyEntity newStudyVersion = new StudyEntity();
        BeanUtils.copyProperties(currentStudy, newStudyVersion, "id", "createdAt", "isLatestVersion");

        // Set new version properties
        String newStudyId = UUID.randomUUID().toString();
        newStudyVersion.setId(newStudyId);
        newStudyVersion.setParentVersionId(currentStudy.getId());
        
        // Increment version number (e.g., 1.0 -> 1.1)
        String[] versionParts = currentStudy.getVersion().split("\\.");
        int major = Integer.parseInt(versionParts[0]);
        int minor = Integer.parseInt(versionParts[1]) + 1;
        newStudyVersion.setVersion(major + "." + minor);
        
        newStudyVersion.setLatestVersion(true);
        newStudyVersion.setVersionNotes(versionNotes);
        newStudyVersion.setCreatedBy(userId);
        newStudyVersion.setCreatedAt(LocalDateTime.now());
        newStudyVersion.setUpdatedAt(LocalDateTime.now());
        
        // Save new study version
        StudyEntity savedStudy = studyRepository.save(newStudyVersion);
        
        // Create copies of all associated entities with updated references
        // First, get all visit definitions for this study
        List<VisitDefinitionEntity> currentVisits = visitDefinitionRepository.findByStudyId(studyId);
        
        // Map to store old visit IDs to new visit IDs for reference updating
        Map<String, String> visitIdMap = new HashMap<>();
        
        // Create new versions of all visits
        for (VisitDefinitionEntity currentVisit : currentVisits) {
            VisitDefinitionEntity newVisit = new VisitDefinitionEntity();
            BeanUtils.copyProperties(currentVisit, newVisit, "id", "studyId", "createdAt");
            
            String newVisitId = UUID.randomUUID().toString();
            newVisit.setId(newVisitId);
            newVisit.setStudyId(newStudyId);
            newVisit.setCreatedAt(LocalDateTime.now());
            
            visitIdMap.put(currentVisit.getId(), newVisitId);
            visitDefinitionRepository.save(newVisit);
        }
        
        // Now handle all CRFs associated with these visits
        List<VisitFormEntity> currentVisitForms = visitFormRepository.findByVisitDefinitionIdIn(
            currentVisits.stream().map(VisitDefinitionEntity::getId).collect(Collectors.toList())
        );
        
        // Map to store old form IDs to new form IDs
        Map<String, String> formIdMap = new HashMap<>();
        
        // For each visit form, create new versions of both the mapping and the CRF
        for (VisitFormEntity currentVisitForm : currentVisitForms) {
            // First, check if we need to create a new CRF version
            String oldFormId = currentVisitForm.getFormDefinitionId();
            String newFormId;
            
            if (!formIdMap.containsKey(oldFormId)) {
                // Create new version of this form
                FormDefinitionEntity currentForm = formDefinitionRepository.findById(oldFormId)
                    .orElseThrow(() -> new EntityNotFoundException("Form definition not found: " + oldFormId));
                
                FormDefinitionEntity newForm = new FormDefinitionEntity();
                BeanUtils.copyProperties(currentForm, newForm, "id", "createdAt", "isLatestVersion");
                
                newFormId = UUID.randomUUID().toString();
                newForm.setId(newFormId);
                newForm.setStudyId(newStudyId);
                newForm.setParentVersionId(oldFormId);
                
                // Increment form version
                String[] formVersionParts = currentForm.getVersion().split("\\.");
                int formMajor = Integer.parseInt(formVersionParts[0]);
                int formMinor = Integer.parseInt(formVersionParts[1]) + 1;
                newForm.setVersion(formMajor + "." + formMinor);
                
                newForm.setLatestVersion(true);
                newForm.setCreatedAt(LocalDateTime.now());
                newForm.setUpdatedAt(LocalDateTime.now());
                
                formDefinitionRepository.save(newForm);
                formIdMap.put(oldFormId, newFormId);
            } else {
                newFormId = formIdMap.get(oldFormId);
            }
            
            // Now create new visit form mapping
            VisitFormEntity newVisitForm = new VisitFormEntity();
            BeanUtils.copyProperties(currentVisitForm, newVisitForm, "id", "visitDefinitionId", "formDefinitionId", "createdAt");
            
            newVisitForm.setId(UUID.randomUUID().toString());
            newVisitForm.setVisitDefinitionId(visitIdMap.get(currentVisitForm.getVisitDefinitionId()));
            newVisitForm.setFormDefinitionId(newFormId);
            newVisitForm.setCreatedAt(LocalDateTime.now());
            
            visitFormRepository.save(newVisitForm);
        }
        
        return newStudyId;
    }
    
    /**
     * Creates a new version of a form while maintaining integrity with studies
     * that reference it. Optionally updates the study to use this new form version.
     *
     * @param formId The ID of the form to version
     * @param versionNotes Notes describing the version
     * @param userId ID of the user creating the version
     * @param updateStudyReferences Whether to update study references to this form
     * @return The ID of the newly created form version
     */
    @Transactional
    public String createFormVersionWithIntegrity(String formId, String versionNotes, String userId, boolean updateStudyReferences) {
        // Get the current form
        FormDefinitionEntity currentForm = formDefinitionRepository.findById(formId)
                .orElseThrow(() -> new EntityNotFoundException("Form definition not found: " + formId));
        
        // Mark current version as not latest
        currentForm.setLatestVersion(false);
        formDefinitionRepository.save(currentForm);
        
        // Create new version
        FormDefinitionEntity newForm = new FormDefinitionEntity();
        BeanUtils.copyProperties(currentForm, newForm, "id", "createdAt", "isLatestVersion");
        
        // Set new version properties
        String newFormId = UUID.randomUUID().toString();
        newForm.setId(newFormId);
        newForm.setParentVersionId(formId);
        
        // Increment version
        String[] versionParts = currentForm.getVersion().split("\\.");
        int major = Integer.parseInt(versionParts[0]);
        int minor = Integer.parseInt(versionParts[1]) + 1;
        newForm.setVersion(major + "." + minor);
        
        newForm.setLatestVersion(true);
        newForm.setVersionNotes(versionNotes);
        newForm.setCreatedAt(LocalDateTime.now());
        newForm.setUpdatedAt(LocalDateTime.now());
        
        FormDefinitionEntity savedForm = formDefinitionRepository.save(newForm);
        
        // If requested, update study references to this form
        if (updateStudyReferences) {
            // Find all visit forms that reference the old form
            List<VisitFormEntity> visitForms = visitFormRepository.findByFormDefinitionId(formId);
            
            for (VisitFormEntity visitForm : visitForms) {
                // Only update for active studies
                VisitDefinitionEntity visit = visitDefinitionRepository.findById(visitForm.getVisitDefinitionId())
                        .orElse(null);
                
                if (visit != null) {
                    StudyEntity study = studyRepository.findById(visit.getStudyId())
                            .orElse(null);
                    
                    if (study != null && study.getStatus() == StudyEntity.StudyStatus.ACTIVE) {
                        VisitFormEntity newVisitForm = new VisitFormEntity();
                        BeanUtils.copyProperties(visitForm, newVisitForm, "id", "formDefinitionId", "createdAt");
                        
                        newVisitForm.setId(UUID.randomUUID().toString());
                        newVisitForm.setFormDefinitionId(newFormId);
                        newVisitForm.setCreatedAt(LocalDateTime.now());
                        
                        // Save new mapping
                        visitFormRepository.save(newVisitForm);
                        
                        // Deactivate old mapping
                        visitForm.setActive(false);
                        visitFormRepository.save(visitForm);
                    }
                }
            }
        }
        
        return newFormId;
    }
}
