package com.clinprecision.clinopsservice.config;

import org.axonframework.config.EventProcessingConfigurer;
import org.springframework.context.annotation.Configuration;

/**
 * Axon Event Processing configuration for Study Design Service.
 *
 * Registers a TrackingEventProcessor for the study database build projection
 * group so that projections run asynchronously in their own transaction,
 * avoiding transactional coupling with command handling.
 */
@Configuration
public class AxonEventProcessingConfig {

    public AxonEventProcessingConfig(EventProcessingConfigurer configurer) {
        // Use a tracking processor for projection handlers
        configurer.registerTrackingEventProcessor("studydatabase-projection");
    }
}



