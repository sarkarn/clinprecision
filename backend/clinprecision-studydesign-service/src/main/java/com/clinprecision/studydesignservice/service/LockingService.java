package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.entity.FormDefinitionEntity;
import com.clinprecision.studydesignservice.entity.LockingAuditEntity;
import com.clinprecision.studydesignservice.entity.StudyEntity;
import com.clinprecision.studydesignservice.exception.EntityLockedException;
import com.clinprecision.studydesignservice.exception.LockingException;
import com.clinprecision.studydesignservice.repository.FormDefinitionRepository;
import com.clinprecision.studydesignservice.repository.LockingAuditRepository;
import com.clinprecision.studydesignservice.repository.StudyRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for locking and unlocking studies and CRFs to prevent unauthorized changes.
 * This is critical for maintaining data integrity in clinical trials.
 */
@Service
public class LockingService {

    private final StudyRepository studyRepository;
    private final FormDefinitionRepository formDefinitionRepository;
    private final LockingAuditRepository lockingAuditRepository;
    
    public LockingService(
            StudyRepository studyRepository,
            FormDefinitionRepository formDefinitionRepository,
            LockingAuditRepository lockingAuditRepository) {
        this.studyRepository = studyRepository;
        this.formDefinitionRepository = formDefinitionRepository;
        this.lockingAuditRepository = lockingAuditRepository;
    }
    
    /**
     * Locks a study to prevent further changes.
     * Once locked, no modifications are allowed to the study or its components.
     *
     * @param studyId The ID of the study to lock
     * @param reason The reason for locking
     * @param userId The ID of the user locking the study
     * @throws EntityNotFoundException if the study is not found
     * @throws LockingException if there's an issue with locking
     */
    @Transactional
    public void lockStudy(String studyId, String reason, Long userId) {
        StudyEntity study = studyRepository.findById(studyId)
                .orElseThrow(() -> new EntityNotFoundException("Study not found: " + studyId));
        
        // Check if already locked
        if (study.isLocked()) {
            throw new LockingException("Study is already locked: " + studyId);
        }
        
        // Lock the study
        study.setLocked(true);
        study.setUpdatedAt(LocalDateTime.now());
        
        // Save audit information about locking
        LockingAuditEntity audit = new LockingAuditEntity();
        audit.setEntityId(studyId);
        audit.setEntityType(LockingAuditEntity.EntityType.STUDY);
        audit.setOperation(LockingAuditEntity.Operation.LOCK);
        audit.setReason(reason);
        audit.setUserId(userId);
        audit.setCreatedAt(LocalDateTime.now());
        lockingAuditRepository.save(audit);
        
        // Save the updated study
        studyRepository.save(study);
        
        // Also lock all associated CRFs
        List<FormDefinitionEntity> studyForms = formDefinitionRepository.findByStudyId(studyId);
        for (FormDefinitionEntity form : studyForms) {
            form.setLocked(true);
            form.setUpdatedAt(LocalDateTime.now());
            formDefinitionRepository.save(form);
            
            // Save audit for each form
            LockingAuditEntity formAudit = new LockingAuditEntity();
            formAudit.setEntityId(form.getId());
            formAudit.setEntityType(LockingAuditEntity.EntityType.FORM);
            formAudit.setOperation(LockingAuditEntity.Operation.LOCK);
            formAudit.setReason("Automatically locked because parent study was locked. " + reason);
            formAudit.setUserId(userId);
            formAudit.setCreatedAt(LocalDateTime.now());
            lockingAuditRepository.save(formAudit);
        }
    }
    
    /**
     * Unlocks a study to allow changes.
     * This should typically only be done by administrators.
     *
     * @param studyId The ID of the study to unlock
     * @param reason The reason for unlocking
     * @param userId The ID of the user unlocking the study
     * @throws EntityNotFoundException if the study is not found
     * @throws LockingException if there's an issue with unlocking
     */
    @Transactional
    public void unlockStudy(String studyId, String reason, Long userId) {
        StudyEntity study = studyRepository.findById(studyId)
                .orElseThrow(() -> new EntityNotFoundException("Study not found: " + studyId));
        
        // Check if already unlocked
        if (!study.isLocked()) {
            throw new LockingException("Study is already unlocked: " + studyId);
        }
        
        // Unlock the study
        study.setLocked(false);
        study.setUpdatedAt(LocalDateTime.now());
        
        // Save audit information about unlocking
        LockingAuditEntity audit = new LockingAuditEntity();
        audit.setEntityId(studyId);
        audit.setEntityType(LockingAuditEntity.EntityType.STUDY);
        audit.setOperation(LockingAuditEntity.Operation.UNLOCK);
        audit.setReason(reason);
        audit.setUserId(userId);
        audit.setCreatedAt(LocalDateTime.now());
        lockingAuditRepository.save(audit);
        
        // Save the updated study
        studyRepository.save(study);
        
        // Note: We don't automatically unlock forms - that should be done explicitly
    }
    
    /**
     * Locks a specific CRF to prevent further changes.
     *
     * @param formId The ID of the form to lock
     * @param reason The reason for locking
     * @param userId The ID of the user locking the form
     * @throws EntityNotFoundException if the form is not found
     * @throws LockingException if there's an issue with locking
     */
    @Transactional
    public void lockForm(String formId, String reason, Long userId) {
        FormDefinitionEntity form = formDefinitionRepository.findById(formId)
                .orElseThrow(() -> new EntityNotFoundException("Form not found: " + formId));
        
        // Check if already locked
        if (form.isLocked()) {
            throw new LockingException("Form is already locked: " + formId);
        }
        
        // Lock the form
        form.setLocked(true);
        form.setUpdatedAt(LocalDateTime.now());
        
        // Save audit information about locking
        LockingAuditEntity audit = new LockingAuditEntity();
        audit.setEntityId(formId);
        audit.setEntityType(LockingAuditEntity.EntityType.FORM);
        audit.setOperation(LockingAuditEntity.Operation.LOCK);
        audit.setReason(reason);
        audit.setUserId(userId);
        audit.setCreatedAt(LocalDateTime.now());
        lockingAuditRepository.save(audit);
        
        // Save the updated form
        formDefinitionRepository.save(form);
    }
    
    /**
     * Unlocks a specific CRF to allow changes.
     *
     * @param formId The ID of the form to unlock
     * @param reason The reason for unlocking
     * @param userId The ID of the user unlocking the form
     * @throws EntityNotFoundException if the form is not found
     * @throws LockingException if there's an issue with unlocking
     */
    @Transactional
    public void unlockForm(String formId, String reason, Long userId) {
        FormDefinitionEntity form = formDefinitionRepository.findById(formId)
                .orElseThrow(() -> new EntityNotFoundException("Form not found: " + formId));
        
        // Check if already unlocked
        if (!form.isLocked()) {
            throw new LockingException("Form is already unlocked: " + formId);
        }
        
        // Check if the parent study is locked
        StudyEntity study = studyRepository.findById(form.getStudyId())
                .orElseThrow(() -> new EntityNotFoundException("Study not found: " + form.getStudyId()));
        
        if (study.isLocked()) {
            throw new LockingException("Cannot unlock form because parent study is locked: " + study.getId());
        }
        
        // Unlock the form
        form.setLocked(false);
        form.setUpdatedAt(LocalDateTime.now());
        
        // Save audit information about unlocking
        LockingAuditEntity audit = new LockingAuditEntity();
        audit.setEntityId(formId);
        audit.setEntityType(LockingAuditEntity.EntityType.FORM);
        audit.setOperation(LockingAuditEntity.Operation.UNLOCK);
        audit.setReason(reason);
        audit.setUserId(userId);
        audit.setCreatedAt(LocalDateTime.now());
        lockingAuditRepository.save(audit);
        
        // Save the updated form
        formDefinitionRepository.save(form);
    }
    
    /**
     * Checks if a study is locked.
     *
     * @param studyId The ID of the study to check
     * @return true if the study is locked, false otherwise
     * @throws EntityNotFoundException if the study is not found
     */
    public boolean isStudyLocked(String studyId) {
        return studyRepository.findById(studyId)
                .orElseThrow(() -> new EntityNotFoundException("Study not found: " + studyId))
                .isLocked();
    }
    
    /**
     * Checks if a form is locked.
     *
     * @param formId The ID of the form to check
     * @return true if the form is locked, false otherwise
     * @throws EntityNotFoundException if the form is not found
     */
    public boolean isFormLocked(String formId) {
        return formDefinitionRepository.findById(formId)
                .orElseThrow(() -> new EntityNotFoundException("Form not found: " + formId))
                .isLocked();
    }
    
    /**
     * Ensures a study is not locked before making changes.
     * This is a helper method to be used by other services.
     *
     * @param studyId The ID of the study to check
     * @throws EntityLockedException if the study is locked
     */
    public void ensureStudyNotLocked(String studyId) {
        if (isStudyLocked(studyId)) {
            throw new EntityLockedException("Cannot modify locked study: " + studyId);
        }
    }
    
    /**
     * Ensures a form is not locked before making changes.
     * This is a helper method to be used by other services.
     *
     * @param formId The ID of the form to check
     * @throws EntityLockedException if the form is locked
     */
    public void ensureFormNotLocked(String formId) {
        if (isFormLocked(formId)) {
            throw new EntityLockedException("Cannot modify locked form: " + formId);
        }
    }
}
