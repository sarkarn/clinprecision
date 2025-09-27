package com.clinprecision.adminservice.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * Main configuration class for the admin service
 */
@Configuration
@ComponentScan(basePackages = {
    "com.clinprecision.adminservice",
    "com.clinprecision.common"
})
public class AdminServiceConfig {
    
}