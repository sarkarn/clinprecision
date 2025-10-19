package com.clinprecision.clinopsservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Async Configuration for Study Database Build Worker
 * 
 * Enables asynchronous execution of database build tasks to avoid blocking
 * the main command processing thread.
 * 
 * Thread Pool Configuration:
 * - Core Pool Size: 2 threads (can handle 2 concurrent builds)
 * - Max Pool Size: 5 threads (maximum concurrent builds)
 * - Queue Capacity: 10 (pending builds)
 * - Thread Name Prefix: "db-build-" (for easy identification in logs)
 * 
 * Architecture:
 * - Allows multiple database builds to run concurrently
 * - Prevents blocking of API requests
 * - Provides clear thread naming for debugging
 * 
 * FDA Compliance: Ensures non-blocking operation while maintaining audit trail
 */
@Configuration
@EnableAsync
@Slf4j
public class AsyncConfiguration {

    /**
     * Thread pool executor for database build operations
     * 
     * @return Configured ThreadPoolTaskExecutor
     */
    @Bean(name = "databaseBuildExecutor")
    public Executor databaseBuildExecutor() {
        log.info("Configuring async executor for database build operations");
        
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // Core pool size: Number of threads to keep in pool
        executor.setCorePoolSize(2);
        
        // Maximum pool size: Maximum number of threads
        executor.setMaxPoolSize(5);
        
        // Queue capacity: Number of tasks to queue before rejecting
        executor.setQueueCapacity(10);
        
        // Thread name prefix for identification
        executor.setThreadNamePrefix("db-build-");
        
        // Wait for tasks to complete on shutdown
        executor.setWaitForTasksToCompleteOnShutdown(true);
        
        // Grace period for shutdown
        executor.setAwaitTerminationSeconds(60);
        
        // Initialize the executor
        executor.initialize();
        
        log.info("Database build executor configured: corePoolSize={}, maxPoolSize={}, queueCapacity={}", 
                 executor.getCorePoolSize(), executor.getMaxPoolSize(), executor.getQueueCapacity());
        
        return executor;
    }
    
    /**
     * General purpose async executor (if needed for other async operations)
     * 
     * @return Configured ThreadPoolTaskExecutor
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        log.info("Configuring general purpose async executor");
        
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        
        log.info("General async executor configured: corePoolSize={}, maxPoolSize={}, queueCapacity={}", 
                 executor.getCorePoolSize(), executor.getMaxPoolSize(), executor.getQueueCapacity());
        
        return executor;
    }
}
