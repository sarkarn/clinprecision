-- Quick script to add Axon Framework event store tables
-- Run this on existing database to add missing tables

USE clinprecisiondb;

-- Domain Event Entry Table - Stores all domain events
CREATE TABLE IF NOT EXISTS domain_event_entry (
    global_index BIGINT AUTO_INCREMENT NOT NULL,
    event_identifier VARCHAR(255) NOT NULL UNIQUE,
    aggregate_identifier VARCHAR(255) NOT NULL,
    sequence_number BIGINT NOT NULL,
    type VARCHAR(255),
    meta_data BLOB,
    payload BLOB NOT NULL,
    payload_revision VARCHAR(255),
    payload_type VARCHAR(255) NOT NULL,
    time_stamp VARCHAR(255) NOT NULL,
    
    PRIMARY KEY (global_index),
    UNIQUE KEY UK_domain_event_entry (aggregate_identifier, sequence_number),
    KEY IDX_domain_event_entry_time_stamp (time_stamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Snapshot Event Entry Table - Stores aggregate snapshots
CREATE TABLE IF NOT EXISTS snapshot_event_entry (
    aggregate_identifier VARCHAR(255) NOT NULL,
    sequence_number BIGINT NOT NULL,
    type VARCHAR(255) NOT NULL,
    event_identifier VARCHAR(255) NOT NULL UNIQUE,
    meta_data BLOB,
    payload BLOB NOT NULL,
    payload_revision VARCHAR(255),
    payload_type VARCHAR(255) NOT NULL,
    time_stamp VARCHAR(255) NOT NULL,
    
    PRIMARY KEY (aggregate_identifier, sequence_number),
    KEY IDX_snapshot_event_entry_event_identifier (event_identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Association Value Entry Table - Used by Sagas
CREATE TABLE IF NOT EXISTS association_value_entry (
    id BIGINT AUTO_INCREMENT NOT NULL,
    association_key VARCHAR(255) NOT NULL,
    association_value VARCHAR(255),
    saga_id VARCHAR(255) NOT NULL,
    saga_type VARCHAR(255),
    
    PRIMARY KEY (id),
    KEY IDX_association_value_entry (saga_id, saga_type),
    KEY IDX_association_value_entry_key_value (association_key, association_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Token Entry Table - Tracks event processor progress
CREATE TABLE IF NOT EXISTS token_entry (
    processor_name VARCHAR(255) NOT NULL,
    segment INTEGER NOT NULL DEFAULT 0,
    token BLOB,
    token_type VARCHAR(255),
    timestamp VARCHAR(255),
    owner VARCHAR(255),
    
    PRIMARY KEY (processor_name, segment)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Saga Entry Table - Stores saga instances
CREATE TABLE IF NOT EXISTS saga_entry (
    saga_id VARCHAR(255) NOT NULL,
    revision VARCHAR(255),
    saga_type VARCHAR(255),
    serialized_saga BLOB,
    
    PRIMARY KEY (saga_id),
    KEY IDX_saga_entry_saga_type (saga_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Verify tables were created
SELECT 'Axon Framework tables created successfully!' AS status;
SHOW TABLES LIKE '%event%';
SHOW TABLES LIKE '%token%';
SHOW TABLES LIKE '%saga%';
