package com.clinprecision.datacaptureservice.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.clinprecision.datacaptureservice.patientenrollment.projection.PatientProjectionHandler;

/**
 * Debug configuration to verify beans are properly loaded
 */
@Configuration
public class DebugConfig {

    @Bean
    public CommandLineRunner debugBeans(ApplicationContext context) {
        return args -> {
            System.out.println("[DEBUG] ========== Bean Debug Information ==========");
            
            // Check if PatientProjectionHandler is loaded
            try {
                PatientProjectionHandler handler = context.getBean(PatientProjectionHandler.class);
                System.out.println("[DEBUG] PatientProjectionHandler bean found: " + handler.getClass().getName());
            } catch (Exception e) {
                System.out.println("[DEBUG] PatientProjectionHandler bean NOT found: " + e.getMessage());
            }
            
            // Check if AxonConfig is loaded
            try {
                Object axonConfig = context.getBean("axonConfig");
                System.out.println("[DEBUG] AxonConfig bean found: " + axonConfig.getClass().getName());
            } catch (Exception e) {
                System.out.println("[DEBUG] AxonConfig bean NOT found: " + e.getMessage());
            }
            
            // List all beans with "patient" in the name
            String[] beanNames = context.getBeanDefinitionNames();
            System.out.println("[DEBUG] Beans containing 'patient':");
            for (String beanName : beanNames) {
                if (beanName.toLowerCase().contains("patient")) {
                    System.out.println("[DEBUG] - " + beanName);
                }
            }
            
            // List all beans with "projection" in the name
            System.out.println("[DEBUG] Beans containing 'projection':");
            for (String beanName : beanNames) {
                if (beanName.toLowerCase().contains("projection")) {
                    System.out.println("[DEBUG] - " + beanName);
                }
            }
            
            System.out.println("[DEBUG] ========== Bean Debug Complete ==========");
        };
    }
}