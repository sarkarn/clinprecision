package com.clinprecision.studydesignservice.controller;

import com.clinprecision.studydesignservice.dto.LockingRequest;
import com.clinprecision.studydesignservice.dto.LockingResponse;
import com.clinprecision.studydesignservice.exception.EntityLockedException;
import com.clinprecision.studydesignservice.exception.LockingException;
import com.clinprecision.studydesignservice.service.LockingService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for locking and unlocking studies and CRFs.
 */
@RestController
@RequestMapping("/api/locking")
public class LockingController {

    private final LockingService lockingService;
    
    public LockingController(LockingService lockingService) {
        this.lockingService = lockingService;
    }
    
    /**
     * Locks a study to prevent further changes.
     */
    @PostMapping("/study/{studyId}/lock")
    public ResponseEntity<LockingResponse> lockStudy(
            @PathVariable Long studyId,
            @RequestBody LockingRequest request) {
        try {
            lockingService.lockStudy(studyId, request.getReason(), request.getUserId());
            return ResponseEntity.ok(new LockingResponse(true, "Study locked successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new LockingResponse(false, e.getMessage()));
        } catch (LockingException e) {
            return ResponseEntity.badRequest()
                    .body(new LockingResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new LockingResponse(false, "Failed to lock study: " + e.getMessage()));
        }
    }
    
    /**
     * Unlocks a study to allow changes.
     */
    @PostMapping("/study/{studyId}/unlock")
    public ResponseEntity<LockingResponse> unlockStudy(
            @PathVariable Long studyId,
            @RequestBody LockingRequest request) {
        try {
            lockingService.unlockStudy(studyId, request.getReason(), request.getUserId());
            return ResponseEntity.ok(new LockingResponse(true, "Study unlocked successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new LockingResponse(false, e.getMessage()));
        } catch (LockingException e) {
            return ResponseEntity.badRequest()
                    .body(new LockingResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new LockingResponse(false, "Failed to unlock study: " + e.getMessage()));
        }
    }
    
    /**
     * Locks a CRF to prevent further changes.
     */
    @PostMapping("/form/{formId}/lock")
    public ResponseEntity<LockingResponse> lockForm(
            @PathVariable Long formId,
            @RequestBody LockingRequest request) {
        try {
            lockingService.lockForm(formId, request.getReason(), request.getUserId());
            return ResponseEntity.ok(new LockingResponse(true, "Form locked successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new LockingResponse(false, e.getMessage()));
        } catch (LockingException e) {
            return ResponseEntity.badRequest()
                    .body(new LockingResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new LockingResponse(false, "Failed to lock form: " + e.getMessage()));
        }
    }
    
    /**
     * Unlocks a CRF to allow changes.
     */
    @PostMapping("/form/{formId}/unlock")
    public ResponseEntity<LockingResponse> unlockForm(
            @PathVariable Long formId,
            @RequestBody LockingRequest request) {
        try {
            lockingService.unlockForm(formId, request.getReason(), request.getUserId());
            return ResponseEntity.ok(new LockingResponse(true, "Form unlocked successfully"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new LockingResponse(false, e.getMessage()));
        } catch (LockingException e) {
            return ResponseEntity.badRequest()
                    .body(new LockingResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new LockingResponse(false, "Failed to unlock form: " + e.getMessage()));
        }
    }
    
    /**
     * Checks if a study is locked.
     */
    @GetMapping("/study/{studyId}/status")
    public ResponseEntity<?> checkStudyLockStatus(@PathVariable Long studyId) {
        try {
            boolean isLocked = lockingService.isStudyLocked(studyId);
            return ResponseEntity.ok(new LockingResponse(true, isLocked ? "Study is locked" : "Study is unlocked"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new LockingResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new LockingResponse(false, "Failed to check study lock status: " + e.getMessage()));
        }
    }
    
    /**
     * Checks if a form is locked.
     */
    @GetMapping("/form/{formId}/status")
    public ResponseEntity<?> checkFormLockStatus(@PathVariable Long formId) {
        try {
            boolean isLocked = lockingService.isFormLocked(formId);
            return ResponseEntity.ok(new LockingResponse(true, isLocked ? "Form is locked" : "Form is unlocked"));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new LockingResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new LockingResponse(false, "Failed to check form lock status: " + e.getMessage()));
        }
    }
}
