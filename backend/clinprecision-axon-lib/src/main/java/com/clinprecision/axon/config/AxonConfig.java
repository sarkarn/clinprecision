package com.clinprecision.axon.config;

import org.axonframework.common.transaction.TransactionManager;
import org.axonframework.eventsourcing.eventstore.EventStore;
import org.axonframework.eventsourcing.eventstore.jpa.JpaEventStorageEngine;
import org.axonframework.eventsourcing.eventstore.EmbeddedEventStore;
import org.axonframework.serialization.Serializer;
import org.axonframework.serialization.json.JacksonSerializer;
import org.axonframework.spring.messaging.unitofwork.SpringTransactionManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * Shared Axon Framework Configuration for all ClinPrecision microservices
 * 
 * Provides minimal configuration to enable JPA-based event store for aggregates.
 * Uses manually configured database schema for event storage.
 * Uses Jackson serialization for improved security and performance.
 * 
 * This configuration is shared across all microservices that use CQRS + Event Sourcing.
 */
@Configuration
public class AxonConfig {

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Configure Jackson-based serializer for improved security
     * Replaces default XStream serializer to avoid security warnings
     */
    @Bean
    public Serializer eventSerializer() {
        return JacksonSerializer.defaultSerializer();
    }

    /**
     * Configure message serializer to use Jackson as well
     * Ensures consistent serialization across all Axon components
     */
    @Bean 
    public Serializer messageSerializer() {
        return JacksonSerializer.defaultSerializer();
    }

    /**
     * Configure Axon Transaction Manager to wrap Spring's PlatformTransactionManager
     * This ensures Axon events are persisted within Spring-managed transactions
     */
    @Bean
    public TransactionManager axonTransactionManager(PlatformTransactionManager platformTransactionManager) {
        return new SpringTransactionManager(platformTransactionManager);
    }

    /**
     * Configure JPA Event Storage Engine for event sourcing
     * Uses the manually configured database schema with secure Jackson serialization
     */
    @Bean
    public JpaEventStorageEngine eventStorageEngine(TransactionManager axonTransactionManager, 
                                                     Serializer eventSerializer) {
        return JpaEventStorageEngine.builder()
                .entityManagerProvider(() -> entityManager)
                .transactionManager(axonTransactionManager)
                .eventSerializer(eventSerializer)
                .snapshotSerializer(eventSerializer)
                .build();
    }

    /**
     * Configure Event Store using JPA storage engine
     * Shared across all microservices for consistent event storage
     */
    @Bean
    public EventStore eventStore(JpaEventStorageEngine eventStorageEngine) {
        return EmbeddedEventStore.builder()
                .storageEngine(eventStorageEngine)
                .build();
    }
}