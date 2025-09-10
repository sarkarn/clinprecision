package com.clinprecision.studydesignservice.service;

import com.clinprecision.studydesignservice.entity.FormEntity;
import com.clinprecision.studydesignservice.entity.LockingAuditEntity;
import com.clinprecision.studydesignservice.entity.StudyEntity;
import com.clinprecision.studydesignservice.exception.EntityLockedException;
import com.clinprecision.studydesignservice.exception.LockingException;
import com.clinprecision.studydesignservice.exception.ResourceNotFoundException;
import com.clinprecision.studydesignservice.repository.FormRepository;
import com.clinprecision.studydesignservice.repository.LockingAuditRepository;
import com.clinprecision.studydesignservice.repository.StudyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for locking and unlocking studies and forms to prevent unauthorized changes.
 * This is critical for maintaining data integrity in clinical trials.
 */
@Service
public class LockingService {

    private final StudyRepository studyRepository;
    private final FormRepository formRepository;
    private final LockingAuditRepository lockingAuditRepository;
    
    public LockingService(
            StudyRepository studyRepository,
            FormRepository formRepository,
            LockingAuditRepository lockingAuditRepository) {
        this.studyRepository = studyRepository;
        this.formRepository = formRepository;
        this.lockingAuditRepository = lockingAuditRepository;
    }
    
    /**
     * Locks a study to prevent further changes.
     * Once locked, no modifications are allowed to the study or its components.
     *
     * @param studyId The ID of the study to lock
     * @param reason The reason for locking
     * @param userId The ID of the user locking the study
     * @throws ResourceNotFoundException if the study is not found
     * @throws LockingException if there's an issue with locking
     */
    @Transactional
    public void lockStudy(Long studyId, String reason, Long userId) {
        StudyEntity study = studyRepository.findById(studyId)
                .orElseThrow(() -> new ResourceNotFoundException("Study not found: " + studyId));
        
        // Check if already locked
        if (study.isLocked()) {
            throw new LockingException("Study is already locked: " + studyId);
        }
        
        // Lock the study
        study.setLocked(true);
        study.setUpdatedAt(LocalDateTime.now());
        
        // Save audit information about locking
        LockingAuditEntity audit = new LockingAuditEntity();
        audit.setEntityId(studyId != null ? studyId.toString() : null);
        audit.setEntityType(LockingAuditEntity.EntityType.STUDY);
        audit.setOperation(LockingAuditEntity.Operation.LOCK);
        audit.setReason(reason);
        audit.setUserId(userId);
        audit.setCreatedAt(LocalDateTime.now());
        lockingAuditRepository.save(audit);
        
        // Save the updated study
        studyRepository.save(study);
        
        // Also lock all associated forms
        List<FormEntity> studyForms = formRepository.findByStudyId(studyId);
        for (FormEntity form : studyForms) {
            form.setLocked(true);
            form.setUpdatedAt(LocalDateTime.now());
            formRepository.save(form);
            
            // Save audit for each form
            LockingAuditEntity formAudit = new LockingAuditEntity();
            formAudit.setEntityId(form.getId().toString());
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
     * @throws ResourceNotFoundException if the study is not found
     * @throws LockingException if there's an issue with unlocking
     */
    @Transactional
    public void unlockStudy(Long studyId, String reason, Long userId) {
        StudyEntity study = studyRepository.findById(studyId)
                .orElseThrow(() -> new ResourceNotFoundException("Study not found: " + studyId));
        
        // Check if already unlocked
        if (!study.isLocked()) {
            throw new LockingException("Study is already unlocked: " + studyId);
        }
        
        // Unlock the study
        study.setLocked(false);
        study.setUpdatedAt(LocalDateTime.now());
        
        // Save audit information about unlocking
        LockingAuditEntity audit = new LockingAuditEntity();
        audit.setEntityId(studyId != null ? studyId.toString() : null);
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
     * Locks a specific form to prevent further changes.
     *
     * @param formId The ID of the form to lock
     * @param reason The reason for locking
     * @param userId The ID of the user locking the form
     * @throws ResourceNotFoundException if the form is not found
     * @throws LockingException if there's an issue with locking
     */
    @Transactional
    public void lockForm(Long formId, String reason, Long userId) {
        FormEntity form = formRepository.findById(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found: " + formId));
        
        // Check if already locked
        if (form.isLocked()) {
            throw new LockingException("Form is already locked: " + formId);
        }
        
        // Lock the form
        form.setLocked(true);
        form.setUpdatedAt(LocalDateTime.now());
        
        // Save audit information about locking
        LockingAuditEntity audit = new LockingAuditEntity();
        audit.setEntityId(formId.toString());
        audit.setEntityType(LockingAuditEntity.EntityType.FORM);
        audit.setOperation(LockingAuditEntity.Operation.LOCK);
        audit.setReason(reason);
        audit.setUserId(userId);
        audit.setCreatedAt(LocalDateTime.now());
        lockingAuditRepository.save(audit);
        
        // Save the updated form
        formRepository.save(form);
    }
    
    /**
     * Unlocks a specific form to allow changes.
     *
     * @param formId The ID of the form to unlock
     * @param reason The reason for unlocking
     * @param userId The ID of the user unlocking the form
     * @throws ResourceNotFoundException if the form is not found
     * @throws LockingException if there's an issue with unlocking
     */
    @Transactional
    public void unlockForm(Long formId, String reason, Long userId) {
        FormEntity form = formRepository.findById(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found: " + formId));
        
        // Check if already unlocked
        if (!form.isLocked()) {
            throw new LockingException("Form is already unlocked: " + formId);
        }
        
        // Check if the parent study is locked
        if (form.getStudy() != null) {
            StudyEntity study = form.getStudy();
            
            if (study.isLocked()) {
                throw new LockingException("Cannot unlock form because parent study is locked: " + study.getId());
            }
        }
        
        // Unlock the form
        form.setLocked(false);
        form.setUpdatedAt(LocalDateTime.now());
        
        // Save audit information about unlocking
        LockingAuditEntity audit = new LockingAuditEntity();
        audit.setEntityId(formId.toString());
        audit.setEntityType(LockingAuditEntity.EntityType.FORM);
        audit.setOperation(LockingAuditEntity.Operation.UNLOCK);
        audit.setReason(reason);
        audit.setUserId(userId);
        audit.setCreatedAt(LocalDateTime.now());
        lockingAuditRepository.save(audit);
        
        // Save the updated form
        formRepository.save(form);
    }
    
    /**
     * Checks if a study is locked.
     *
     * @param studyId The ID of the study to check
     * @return true if the study is locked, false otherwise
     * @throws ResourceNotFoundException if the study is not found
     */
    public boolean isStudyLocked(Long studyId) {
        return studyRepository.findById(studyId)
                .orElseThrow(() -> new ResourceNotFoundException("Study not found: " + studyId))
                .isLocked();
    }
    
    /**
     * Checks if a form is locked.
     *
     * @param formId The ID of the form to check
     * @return true if the form is locked, false otherwise
     * @throws ResourceNotFoundException if the form is not found
     */
    public boolean isFormLocked(Long formId) {
        return formRepository.findById(formId)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found: " + formId))
                .isLocked();
    }
    
    /**
     * Ensures a study is not locked before making changes.
     * This is a helper method to be used by other services.
     *
     * @param studyId The ID of the study to check
     * @throws EntityLockedException if the study is locked
     */
    public void ensureStudyNotLocked(Long studyId) {
        if (isStudyLocked(studyId)) {
            throw new EntityLockedException("Cannot modify locked study: " + studyId);
        }
    }
    
    /**
     * Ensures a study is not locked before making changes.
     * This is a helper method to be used by other services.
     * 
     * @param studyId The ID of the study to check as a String
     * @throws EntityLockedException if the study is locked
     */
    public void ensureStudyNotLocked(String studyId) {
        if (studyId == null) {
            return;
        }
        try {
            Long id = Long.parseLong(studyId);
            ensureStudyNotLocked(id);
        } catch (NumberFormatException e) {
            // If it's not a valid Long, we can't check it properly
            throw new IllegalArgumentException("Invalid study ID format: " + studyId);
        }
    }
    
    /**
     * Ensures a form is not locked before making changes.
     * This is a helper method to be used by other services.
     *
     * @param formId The ID of the form to check
     * @throws EntityLockedException if the form is locked
     */
    public void ensureFormNotLocked(Long formId) {
        if (isFormLocked(formId)) {
            throw new EntityLockedException("Cannot modify locked form: " + formId);
        }
    }
    
    /**
     * Ensures a form is not locked before making changes.
     * This is a helper method to be used by other services.
     *
     * @param formId The ID of the form to check as a String
     * @throws EntityLockedException if the form is locked
     */
    public void ensureFormNotLocked(String formId) {
        if (formId == null) {
            return;
        }
        try {
            Long id = Long.parseLong(formId);
            ensureFormNotLocked(id);
        } catch (NumberFormatException e) {
            // If it's not a valid Long, we can't check it properly
            throw new IllegalArgumentException("Invalid form ID format: " + formId);
        }
    }
}
