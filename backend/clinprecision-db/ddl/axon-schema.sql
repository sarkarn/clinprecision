-- Axon Framework JPA Event Store Schema
-- This script creates the necessary tables for Axon's JPA-based event store
-- Run this script in your MySQL database to enable event sourcing

-- Table for storing domain events
CREATE TABLE IF NOT EXISTS domain_event_entry (
    global_index BIGINT AUTO_INCREMENT NOT NULL,
    event_identifier VARCHAR(255) NOT NULL,
    meta_data MEDIUMBLOB,
    payload MEDIUMBLOB NOT NULL,
    payload_revision VARCHAR(255),
    payload_type VARCHAR(255) NOT NULL,
    time_stamp VARCHAR(255) NOT NULL,
    aggregate_identifier VARCHAR(255) NOT NULL,
    sequence_number BIGINT NOT NULL,
    type VARCHAR(255),
    PRIMARY KEY (global_index),
    UNIQUE KEY uk_domain_event_entry (aggregate_identifier, sequence_number),
    KEY idx_domain_event_entry_time_stamp (time_stamp)
);

-- Table for storing snapshot events
CREATE TABLE IF NOT EXISTS snapshot_event_entry (
    aggregate_identifier VARCHAR(255) NOT NULL,
    sequence_number BIGINT NOT NULL,
    type VARCHAR(255) NOT NULL,
    event_identifier VARCHAR(255) NOT NULL,
    meta_data MEDIUMBLOB,
    payload MEDIUMBLOB NOT NULL,
    payload_revision VARCHAR(255),
    payload_type VARCHAR(255) NOT NULL,
    time_stamp VARCHAR(255) NOT NULL,
    PRIMARY KEY (aggregate_identifier, sequence_number, type)
);

-- Table for storing saga association values
CREATE TABLE IF NOT EXISTS association_value_entry (
    id BIGINT AUTO_INCREMENT NOT NULL,
    association_key VARCHAR(255) NOT NULL,
    association_value VARCHAR(255),
    saga_id VARCHAR(255) NOT NULL,
    saga_type VARCHAR(255),
    PRIMARY KEY (id),
    KEY idx_association_value_entry (saga_id, saga_type),
    KEY idx_association_value_entry_key_value (association_key, association_value)
);

-- Table for tracking event processors
CREATE TABLE IF NOT EXISTS token_entry (
    processor_name VARCHAR(255) NOT NULL,
    segment INT NOT NULL,
    token MEDIUMBLOB,
    token_type VARCHAR(255),
    timestamp VARCHAR(255),
    owner VARCHAR(255),
    PRIMARY KEY (processor_name, segment)
);