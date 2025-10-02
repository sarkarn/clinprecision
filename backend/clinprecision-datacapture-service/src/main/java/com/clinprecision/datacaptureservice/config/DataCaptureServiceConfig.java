package com.clinprecision.datacaptureservice.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * Main configuration class for the datacapture service
 * Ensures proper component scanning for Axon Framework integration
 */
@Configuration
@ComponentScan(basePackages = {
    "com.clinprecision.datacaptureservice",
    "com.clinprecision.common"
})
public class DataCaptureServiceConfig {
    
}