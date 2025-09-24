package com.clinprecision.datacaptureservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ComponentScan;

/**
 * Phase 1.1 Workflow Configuration
 * 
 * Configures all components needed for the Phase 1.1 Study Database Build workflow:
 * - Study Design → Database Configuration → User Access Setup → Site Training → Site Activation
 */
@Configuration
@ComponentScan(basePackages = {
    "com.clinprecision.datacaptureservice.service.workflow",
    "com.clinprecision.datacaptureservice.client"
})
public class StudyActivationWorkflowConfiguration {
    
    // Additional workflow-specific configurations can be added here
}