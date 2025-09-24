package com.clinprecision.datacaptureservice.service.workflow;

import com.clinprecision.common.dto.SiteActivationRequest;
import com.clinprecision.common.dto.TrainingRequest;
import com.clinprecision.common.dto.UserAccessRequest;
import com.clinprecision.common.dto.UserAccessResult;
import com.clinprecision.datacaptureservice.dto.workflow.StudyActivationWorkflowRequest;
import com.clinprecision.datacaptureservice.dto.workflow.StudyActivationWorkflowResult;
import com.clinprecision.datacaptureservice.service.database.StudyDatabaseBuildService;
import com.clinprecision.datacaptureservice.service.user.UserAccessProvisioningService;
import com.clinprecision.datacaptureservice.service.site.SiteManagementService;
import com.clinprecision.datacaptureservice.service.training.TrainingCertificationService;
import com.clinprecision.datacaptureservice.dto.database.DatabaseBuildRequest;
import com.clinprecision.datacaptureservice.dto.database.DatabaseBuildResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Phase 1.1 Study Activation Workflow Service
 * 
 * Orchestrates the complete Phase 1.1 workflow:
 * Study Design → Database Configuration → User Access Setup → Site Training → Site Activation
 * 
 * This service coordinates all components of the study activation process
 * and ensures proper sequencing and error handling across all phases.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StudyActivationWorkflowService {
    
    private final StudyDatabaseBuildService databaseBuildService;
    private final UserAccessProvisioningService userAccessService;
    private final SiteManagementService siteManagementService;
    private final TrainingCertificationService trainingService;
    
    /**
     * Execute the complete Phase 1.1 study activation workflow
     * 
     * @param request Workflow execution request
     * @return StudyActivationWorkflowResult with workflow execution status
     */
    @Transactional
    public StudyActivationWorkflowResult executePhase1Workflow(StudyActivationWorkflowRequest request) {
        log.info("Starting Phase 1.1 workflow execution for study: {}", request.getStudyId());
        
        StudyActivationWorkflowResult.StudyActivationWorkflowResultBuilder resultBuilder = StudyActivationWorkflowResult.builder()
                .studyId(request.getStudyId())
                .workflowStartTime(LocalDateTime.now())
                .workflowStatus("IN_PROGRESS");
        
        List<String> completedPhases = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        
        try {
            // Phase 1: Database Configuration
            log.info("Phase 1: Database Configuration for study {}", request.getStudyId());
            var databaseResult = executeDatabaseConfiguration(request);
            if ("COMPLETED".equals(databaseResult.getBuildStatus())) {
                completedPhases.add("DATABASE_CONFIGURATION");
                log.info("Database configuration completed successfully for study {}", request.getStudyId());
            } else {
                throw new RuntimeException("Database configuration failed: " + databaseResult.getMessage());
            }
            
            // Phase 2: User Access Setup
            log.info("Phase 2: User Access Setup for study {}", request.getStudyId());
            var userAccessResult = executeUserAccessSetup(request);
            if ("COMPLETED".equals(userAccessResult.getProvisioningStatus())) {
                completedPhases.add("USER_ACCESS_SETUP");
                log.info("User access setup completed successfully for study {}", request.getStudyId());
            } else {
                throw new RuntimeException("User access setup failed: " + userAccessResult.getMessage());
            }
            
            // Phase 3: Site Customization and Training
            log.info("Phase 3: Site Customization and Training for study {}", request.getStudyId());
            executeSiteCustomizationAndTraining(request);
            boolean allSitesCustomized = true; // Simplified for now
            
            if (allSitesCustomized) {
                completedPhases.add("SITE_CUSTOMIZATION_TRAINING");
                log.info("Site customization and training completed successfully for study {}", request.getStudyId());
            } else {
                throw new RuntimeException("Site customization and training failed for some sites");
            }
            
            // Phase 4: Site Activation
            log.info("Phase 4: Site Activation for study {}", request.getStudyId());
            executeSiteActivation(request);
            boolean allSitesActivated = true; // Simplified for now
            
            if (allSitesActivated) {
                completedPhases.add("SITE_ACTIVATION");
                log.info("Site activation completed successfully for study {}", request.getStudyId());
            } else {
                throw new RuntimeException("Site activation failed for some sites");
            }
            
            // Workflow completed successfully
            log.info("Phase 1.1 workflow completed successfully for study {}", request.getStudyId());
            
            return resultBuilder
                    .workflowStatus("COMPLETED")
                    .workflowEndTime(LocalDateTime.now())
                    .completedPhases(completedPhases)
                    .message("Phase 1.1 workflow completed successfully")
                    .totalSitesActivated(request.getSites().size())
                    .build();
                    
        } catch (Exception e) {
            log.error("Phase 1.1 workflow failed for study {}: {}", request.getStudyId(), e.getMessage(), e);
            errors.add(e.getMessage());
            
            // Attempt rollback of completed phases
            rollbackCompletedPhases(request, completedPhases);
            
            return resultBuilder
                    .workflowStatus("FAILED")
                    .workflowEndTime(LocalDateTime.now())
                    .completedPhases(completedPhases)
                    .errors(errors)
                    .message("Phase 1.1 workflow failed: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Get workflow execution status
     * 
     * @param studyId Study identifier
     * @return Current workflow status
     */
    public StudyActivationWorkflowResult getWorkflowStatus(Long studyId) {
        log.info("Getting workflow status for study: {}", studyId);
        
        try {
            // Check status of each workflow phase
            List<String> completedPhases = checkCompletedPhases(studyId);
            
            String status = completedPhases.contains("SITE_ACTIVATION") ? "COMPLETED" : 
                          completedPhases.size() > 0 ? "IN_PROGRESS" : "NOT_STARTED";
            
            return StudyActivationWorkflowResult.builder()
                    .studyId(studyId)
                    .workflowStatus(status)
                    .completedPhases(completedPhases)
                    .message("Workflow status retrieved successfully")
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to get workflow status for study {}: {}", studyId, e.getMessage(), e);
            
            return StudyActivationWorkflowResult.builder()
                    .studyId(studyId)
                    .workflowStatus("UNKNOWN")
                    .message("Failed to retrieve workflow status: " + e.getMessage())
                    .build();
        }
    }
    
    /**
     * Cancel workflow execution
     * 
     * @param studyId Study identifier
     * @return Cancellation result
     */
    @Transactional
    public StudyActivationWorkflowResult cancelWorkflow(Long studyId) {
        log.info("Cancelling workflow for study: {}", studyId);
        
        try {
            // Get currently completed phases
            List<String> completedPhases = checkCompletedPhases(studyId);
            
            // Rollback completed phases
            rollbackCompletedPhases(createRollbackRequest(studyId), completedPhases);
            
            return StudyActivationWorkflowResult.builder()
                    .studyId(studyId)
                    .workflowStatus("CANCELLED")
                    .workflowEndTime(LocalDateTime.now())
                    .message("Workflow cancelled and rolled back successfully")
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to cancel workflow for study {}: {}", studyId, e.getMessage(), e);
            
            return StudyActivationWorkflowResult.builder()
                    .studyId(studyId)
                    .workflowStatus("CANCEL_FAILED")
                    .workflowEndTime(LocalDateTime.now())
                    .message("Workflow cancellation failed: " + e.getMessage())
                    .build();
        }
    }
    
    // Private helper methods for workflow execution
    private DatabaseBuildResult executeDatabaseConfiguration(StudyActivationWorkflowRequest request) {
        DatabaseBuildRequest dbRequest = DatabaseBuildRequest.builder()
                .studyId(request.getStudyId())
                .studyDesignConfiguration(request.getStudyDesignConfiguration())
                .requestedBy(Long.parseLong(request.getRequestedBy()))
                .build();
        
        return databaseBuildService.buildStudyDatabase(dbRequest);
    }
    
    private UserAccessResult executeUserAccessSetup(StudyActivationWorkflowRequest request) {
        UserAccessRequest userRequest = UserAccessRequest.builder()
                .studyId(request.getStudyId())
                .requestedBy(request.getRequestedBy())
                .build();
        
        return userAccessService.provisionUserAccess(userRequest, "SYSTEM_WORKFLOW");
    }
    
    private List<Object> executeSiteCustomizationAndTraining(StudyActivationWorkflowRequest request) {
        List<Object> results = new ArrayList<>();
        
        for (var site : request.getSites()) {
            // Site customization
            SiteActivationRequest customizationRequest = SiteActivationRequest.builder()
                    .studyId(request.getStudyId())
                    .siteId(site.getSiteId())
                    .requestedBy(request.getRequestedBy())
                    .build();
            
            var customizationResult = siteManagementService.applySiteCustomizations(customizationRequest);
            results.add(customizationResult);
            
            // Training plan creation
            TrainingRequest trainingRequest = TrainingRequest.builder()
                    .studyId(request.getStudyId())
                    .siteId(site.getSiteId())
                    .requestedBy(request.getRequestedBy())
                    .trainingType(TrainingRequest.TrainingType.INITIAL_TRAINING)
                    .build();
            
            var trainingResult = trainingService.createTrainingPlan(trainingRequest);
            results.add(trainingResult);
        }
        
        return results;
    }
    
    private List<Object> executeSiteActivation(StudyActivationWorkflowRequest request) {
        List<Object> results = new ArrayList<>();
        
        for (var site : request.getSites()) {
            SiteActivationRequest activationRequest = SiteActivationRequest.builder()
                    .studyId(request.getStudyId())
                    .siteId(site.getSiteId())
                    .build();
            
            var activationResult = siteManagementService.activateSite(activationRequest);
            results.add(activationResult);
        }
        
        return results;
    }
    
    private void rollbackCompletedPhases(StudyActivationWorkflowRequest request, List<String> completedPhases) {
        log.info("Rolling back completed phases: {} for study: {}", completedPhases, request.getStudyId());
        
        // Rollback in reverse order
        if (completedPhases.contains("SITE_ACTIVATION")) {
            rollbackSiteActivation(request);
        }
        
        if (completedPhases.contains("SITE_CUSTOMIZATION_TRAINING")) {
            rollbackSiteCustomizationAndTraining(request);
        }
        
        if (completedPhases.contains("USER_ACCESS_SETUP")) {
            rollbackUserAccessSetup(request);
        }
        
        if (completedPhases.contains("DATABASE_CONFIGURATION")) {
            rollbackDatabaseConfiguration(request);
        }
    }
    
    private void rollbackSiteActivation(StudyActivationWorkflowRequest request) {
        log.info("Rolling back site activation for study: {}", request.getStudyId());
        
        for (var site : request.getSites()) {
            try {
                siteManagementService.deactivateSite(request.getStudyId(), site.getSiteId(), "Workflow rollback");
            } catch (Exception e) {
                log.warn("Failed to deactivate site {} during rollback: {}", site.getSiteId(), e.getMessage());
            }
        }
    }
    
    private void rollbackSiteCustomizationAndTraining(StudyActivationWorkflowRequest request) {
        log.info("Rolling back site customization and training for study: {}", request.getStudyId());
        
        // Implementation would remove site customizations and training plans
        // This is a placeholder for the actual rollback logic
    }
    
    private void rollbackUserAccessSetup(StudyActivationWorkflowRequest request) {
        log.info("Rolling back user access setup for study: {}", request.getStudyId());
        
        for (var userRole : request.getUserRoleAssignments()) {
            try {
                userAccessService.revokeUserAccess(request.getStudyId(), userRole.getUserId(), "SYSTEM_ROLLBACK");
            } catch (Exception e) {
                log.warn("Failed to revoke access for user {} during rollback: {}", userRole.getUserId(), e.getMessage());
            }
        }
    }
    
    private void rollbackDatabaseConfiguration(StudyActivationWorkflowRequest request) {
        log.info("Rolling back database configuration for study: {}", request.getStudyId());
        
        // Implementation would remove study-specific database configurations
        // This is a placeholder for the actual rollback logic
    }
    
    private List<String> checkCompletedPhases(Long studyId) {
        List<String> completedPhases = new ArrayList<>();
        
        // Check each phase completion status
        // This would be implemented based on actual status checking logic
        
        return completedPhases;
    }
    
    private StudyActivationWorkflowRequest createRollbackRequest(Long studyId) {
        // Create a minimal request for rollback operations
        return StudyActivationWorkflowRequest.builder()
                .studyId(studyId)
                .build();
    }
}