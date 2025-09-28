package com.clinprecision.adminservice.config;

import org.axonframework.eventsourcing.EventSourcingRepository;
import org.axonframework.eventsourcing.eventstore.EventStore;
import org.axonframework.eventsourcing.eventstore.jpa.JpaEventStorageEngine;
import org.axonframework.modelling.command.Repository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.clinprecision.adminservice.site.aggregate.SiteAggregate;

import org.axonframework.common.jpa.SimpleEntityManagerProvider;
import org.axonframework.spring.messaging.unitofwork.SpringTransactionManager;
import org.axonframework.serialization.Serializer;
import org.axonframework.serialization.json.JacksonSerializer;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Axon Framework Configuration for ClinPrecision Admin Service
 * 
 * This configuration sets up:
 * - JPA-based event store using existing MySQL database
 * - Site aggregate repository
 * - Event sourcing infrastructure for regulatory compliance
 */
@Configuration
public class AxonConfig {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private PlatformTransactionManager transactionManager;

    /**
     * Configure Jackson Serializer for secure JSON serialization
     * Replaces default XStream for better security
     */
    @Bean
    public Serializer eventSerializer() {
        return JacksonSerializer.defaultSerializer();
    }

    /**
     * Configure JPA Event Storage Engine
     * Uses the existing MySQL database - no additional infrastructure needed
     */
    @Bean
    public JpaEventStorageEngine eventStorageEngine() {
        return JpaEventStorageEngine.builder()
                .entityManagerProvider(new SimpleEntityManagerProvider(entityManager))
                .transactionManager(new SpringTransactionManager(transactionManager))
                .eventSerializer(eventSerializer())
                .snapshotSerializer(eventSerializer())
                .build();
    }

    /**
     * Site Aggregate Repository
     * Handles command processing and event sourcing for sites
     */
    @Bean("siteAggregateRepository")
    public Repository<SiteAggregate> siteAggregateRepository(EventStore eventStore) {
        return EventSourcingRepository.builder(SiteAggregate.class)
                .eventStore(eventStore)
                .build();
    }
}