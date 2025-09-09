package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.entity.FormEntity;
import com.clinprecision.studydesignservice.entity.FormVersionEntity;
import com.clinprecision.studydesignservice.entity.StudyEntity;
import com.clinprecision.studydesignservice.entity.VisitDefinitionEntity;
import com.clinprecision.studydesignservice.entity.VisitFormEntity;
import com.clinprecision.studydesignservice.repository.FormRepository;
import com.clinprecision.studydesignservice.repository.FormVersionRepository;
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
import java.util.stream.Collectors;

/**
 * Service responsible for maintaining data integrity across versioned entities.
 * This ensures that when a study or form is versioned, all related entities are 
 * properly handled to maintain referential integrity.
 */
@Service
public class VersionIntegrityService {

    private final StudyRepository studyRepository;
    private final VisitDefinitionRepository visitDefinitionRepository;
    private final FormRepository formRepository;
    private final FormVersionRepository formVersionRepository;
    private final VisitFormRepository visitFormRepository;

    public VersionIntegrityService(
            StudyRepository studyRepository,
            VisitDefinitionRepository visitDefinitionRepository,
            FormRepository formRepository,
            FormVersionRepository formVersionRepository,
            VisitFormRepository visitFormRepository) {
        this.studyRepository = studyRepository;
        this.visitDefinitionRepository = visitDefinitionRepository;
        this.formRepository = formRepository;
        this.formVersionRepository = formVersionRepository;
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
    public Long createStudyVersionWithRelatedEntities(Long studyId, String versionNotes, Long userId) {
        // Get the current study
        StudyEntity currentStudy = studyRepository.findById(studyId)
                .orElseThrow(() -> new EntityNotFoundException("Study not found with id: " + studyId));

        // Mark current version as not latest
        currentStudy.setLatestVersion(false);
        studyRepository.save(currentStudy);

        // Create new version of the study
        StudyEntity newStudyVersion = new StudyEntity();
        BeanUtils.copyProperties(currentStudy, newStudyVersion, "id", "createdAt", "isLatestVersion", "versions", "arms");

        // Set new version properties
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
        StudyEntity savedStudyVersion = studyRepository.save(newStudyVersion);
        Long newStudyId = savedStudyVersion.getId();
        
        // Create copies of all associated entities with updated references
        // First, get all visit definitions for this study
        List<VisitDefinitionEntity> currentVisits = visitDefinitionRepository.findByStudyId(studyId);
        
        // Map to store old visit IDs to new visit IDs for reference updating
        Map<Long, Long> visitIdMap = new HashMap<>();
        
        // Create new versions of all visits
        for (VisitDefinitionEntity currentVisit : currentVisits) {
            VisitDefinitionEntity newVisit = new VisitDefinitionEntity();
            BeanUtils.copyProperties(currentVisit, newVisit, "id", "study", "arm", "createdAt", "visitForms");
            
            newVisit.setStudy(savedStudyVersion);
            newVisit.setCreatedAt(LocalDateTime.now());
            
            VisitDefinitionEntity savedVisit = visitDefinitionRepository.save(newVisit);
            visitIdMap.put(currentVisit.getId(), savedVisit.getId());
        }
        
        // Now handle all forms associated with these visits
        List<VisitFormEntity> currentVisitForms = visitFormRepository.findByVisitDefinitionIdIn(
            currentVisits.stream().map(VisitDefinitionEntity::getId).collect(Collectors.toList())
        );
        
        // Map to store old form IDs to new form IDs
        Map<Long, Long> formIdMap = new HashMap<>();
        
        // For each visit form, create new versions of both the mapping and the form
        for (VisitFormEntity currentVisitForm : currentVisitForms) {
            // First, check if we need to create a new form version
            Long oldFormId = currentVisitForm.getForm().getId();
            Long newFormId;
            
            if (!formIdMap.containsKey(oldFormId)) {
                // Create new version of this form
                FormEntity currentForm = formRepository.findById(oldFormId)
                    .orElseThrow(() -> new EntityNotFoundException("Form not found: " + oldFormId));
                
                FormEntity newForm = new FormEntity();
                BeanUtils.copyProperties(currentForm, newForm, "id", "study", "createdAt", "versions", "visitForms");
                
                // Set study relationship
                newForm.setStudy(savedStudyVersion);
                newForm.setCreatedAt(LocalDateTime.now());
                newForm.setUpdatedAt(LocalDateTime.now());
                
                FormEntity savedForm = formRepository.save(newForm);
                newFormId = savedForm.getId();
                formIdMap.put(oldFormId, newFormId);
                
                // Also create a new version of the current active form version if it exists
                if (currentVisitForm.getActiveFormVersion() != null) {
                    FormVersionEntity currentFormVersion = currentVisitForm.getActiveFormVersion();
                    FormVersionEntity newFormVersion = new FormVersionEntity();
                    
                    BeanUtils.copyProperties(currentFormVersion, newFormVersion, "id", "form", "createdAt");
                    
                    newFormVersion.setForm(savedForm);
                    newFormVersion.setCreatedAt(LocalDateTime.now());
                    newFormVersion.setUpdatedAt(LocalDateTime.now());
                    
                    formVersionRepository.save(newFormVersion);
                }
            } else {
                newFormId = formIdMap.get(oldFormId);
            }
            
            // Now create new visit form mapping
            VisitFormEntity newVisitForm = new VisitFormEntity();
            BeanUtils.copyProperties(currentVisitForm, newVisitForm, "id", "visitDefinition", "form", "activeFormVersion", "createdAt");
            
            // Set the new relationships
            VisitDefinitionEntity newVisitDefinition = visitDefinitionRepository.findById(visitIdMap.get(currentVisitForm.getVisitDefinition().getId()))
                    .orElseThrow(() -> new EntityNotFoundException("Visit definition not found"));
            
            FormEntity newForm = formRepository.findById(newFormId)
                    .orElseThrow(() -> new EntityNotFoundException("Form not found"));
            
            newVisitForm.setVisitDefinition(newVisitDefinition);
            newVisitForm.setForm(newForm);
            newVisitForm.setCreatedAt(LocalDateTime.now());
            
            // The active form version will be set separately if needed
            
            visitFormRepository.save(newVisitForm);
        }
        
        return newStudyId;
    }
    
    /**
     * Creates a new version of a form.
     * This creates a new FormVersionEntity for the specified form.
     *
     * @param formId The ID of the form
     * @param versionNumber The version number to assign
     * @param versionName The name for this version
     * @param userId ID of the user creating the version
     * @return The ID of the newly created form version
     */
    @Transactional
    public Long createFormVersion(Long formId, String versionNumber, String versionName, Long userId) {
        // Get the current form
        FormEntity form = formRepository.findById(formId)
                .orElseThrow(() -> new EntityNotFoundException("Form not found: " + formId));
        
        // Create new form version
        FormVersionEntity newVersion = new FormVersionEntity();
        newVersion.setForm(form);
        newVersion.setVersionNumber(versionNumber);
        newVersion.setName(versionName);
        newVersion.setDescription("Version " + versionNumber + " of " + form.getName());
        newVersion.setActive(true);
        newVersion.setPublished(false);  // New versions start unpublished
        newVersion.setStatus("DRAFT");
        newVersion.setCreatedBy(userId);
        newVersion.setCreatedAt(LocalDateTime.now());
        newVersion.setUpdatedAt(LocalDateTime.now());
        
        // If this is the first version, we might copy form schema from the form itself
        // or leave it blank for the user to fill in
        
        FormVersionEntity savedVersion = formVersionRepository.save(newVersion);
        return savedVersion.getId();
    }
    
    /**
     * Updates all visit forms that reference a specific form version to use a new version.
     * This is useful when a new form version is published and should be used by default.
     *
     * @param oldVersionId The ID of the old form version
     * @param newVersionId The ID of the new form version
     * @return Number of visit form mappings updated
     */
    @Transactional
    public int updateVisitFormReferencesToNewVersion(Long oldVersionId, Long newVersionId) {
        FormVersionEntity oldVersion = formVersionRepository.findById(oldVersionId)
                .orElseThrow(() -> new EntityNotFoundException("Form version not found: " + oldVersionId));
        
        FormVersionEntity newVersion = formVersionRepository.findById(newVersionId)
                .orElseThrow(() -> new EntityNotFoundException("Form version not found: " + newVersionId));
        
        // Ensure both versions belong to the same form
        if (!oldVersion.getForm().getId().equals(newVersion.getForm().getId())) {
            throw new IllegalArgumentException("Form versions must belong to the same form");
        }
        
        // Find all visit forms that reference the old version
        List<VisitFormEntity> visitForms = visitFormRepository.findByFormId(oldVersion.getForm().getId());
        int count = 0;
        
        for (VisitFormEntity visitForm : visitForms) {
            if (visitForm.getActiveFormVersion() != null && 
                visitForm.getActiveFormVersion().getId().equals(oldVersionId)) {
                
                visitForm.setActiveFormVersion(newVersion);
                visitForm.setUpdatedAt(LocalDateTime.now());
                visitFormRepository.save(visitForm);
                count++;
            }
        }
        
        return count;
    }
}
