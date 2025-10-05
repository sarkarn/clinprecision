-- H2 Test Database Schema
-- This schema matches the entity definitions for testing

-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS study_document_audit CASCADE;
DROP TABLE IF EXISTS study_documents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop Axon tables if they exist
DROP TABLE IF EXISTS association_value_entry CASCADE;
DROP TABLE IF EXISTS domain_event_entry CASCADE;
DROP TABLE IF EXISTS snapshot_event_entry CASCADE;
DROP TABLE IF EXISTS saga_entry CASCADE;
DROP TABLE IF EXISTS token_entry CASCADE;
DROP TABLE IF EXISTS dead_letter_entry CASCADE;

-- Users table (referenced by foreign keys)
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Study Documents table with complete lifecycle columns
CREATE TABLE study_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id VARCHAR(36) NOT NULL UNIQUE,
    study_id BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    version_number INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL,
    uploaded_by BIGINT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by BIGINT NULL,
    approved_at TIMESTAMP NULL,
    archived_by BIGINT NULL,
    archived_at TIMESTAMP NULL,
    superseded_by_document_id VARCHAR(36) NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (archived_by) REFERENCES users(id)
);

-- Study Document Audit table
CREATE TABLE study_document_audit (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_id BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    performed_by BIGINT NOT NULL,
    performed_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    details TEXT,
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

-- Axon Framework Event Store Tables
CREATE TABLE domain_event_entry (
    global_index BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_identifier VARCHAR(255) NOT NULL UNIQUE,
    meta_data BLOB,
    payload BLOB NOT NULL,
    payload_revision VARCHAR(255),
    payload_type VARCHAR(255) NOT NULL,
    time_stamp VARCHAR(255) NOT NULL,
    aggregate_identifier VARCHAR(255) NOT NULL,
    sequence_number BIGINT NOT NULL,
    type VARCHAR(255),
    UNIQUE (aggregate_identifier, sequence_number)
);

CREATE TABLE snapshot_event_entry (
    aggregate_identifier VARCHAR(255) NOT NULL,
    sequence_number BIGINT NOT NULL,
    type VARCHAR(255) NOT NULL,
    event_identifier VARCHAR(255) NOT NULL UNIQUE,
    meta_data BLOB,
    payload BLOB NOT NULL,
    payload_revision VARCHAR(255),
    payload_type VARCHAR(255) NOT NULL,
    time_stamp VARCHAR(255) NOT NULL,
    PRIMARY KEY (aggregate_identifier, sequence_number, type)
);

CREATE TABLE association_value_entry (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    association_key VARCHAR(255) NOT NULL,
    association_value VARCHAR(255),
    saga_id VARCHAR(255) NOT NULL,
    saga_type VARCHAR(255)
);

CREATE TABLE saga_entry (
    saga_id VARCHAR(255) NOT NULL PRIMARY KEY,
    revision VARCHAR(255),
    saga_type VARCHAR(255),
    serialized_saga BLOB
);

CREATE TABLE token_entry (
    processor_name VARCHAR(255) NOT NULL,
    segment INT NOT NULL,
    owner VARCHAR(255),
    timestamp VARCHAR(255) NOT NULL,
    token BLOB,
    token_type VARCHAR(255),
    PRIMARY KEY (processor_name, segment)
);

CREATE TABLE dead_letter_entry (
    dead_letter_id VARCHAR(255) NOT NULL,
    cause_message VARCHAR(1024),
    cause_type VARCHAR(255),
    diagnostics BLOB,
    enqueued_at TIMESTAMP NOT NULL,
    last_touched TIMESTAMP,
    aggregate_identifier VARCHAR(255),
    event_identifier VARCHAR(255) NOT NULL,
    message_type VARCHAR(255) NOT NULL,
    meta_data BLOB,
    payload BLOB NOT NULL,
    payload_revision VARCHAR(255),
    payload_type VARCHAR(255) NOT NULL,
    sequence_number BIGINT,
    time_stamp VARCHAR(255) NOT NULL,
    token BLOB,
    token_type VARCHAR(255),
    type VARCHAR(255),
    processing_group VARCHAR(255) NOT NULL,
    processing_started TIMESTAMP,
    sequence_index BIGINT NOT NULL,
    PRIMARY KEY (dead_letter_id, processing_group)
);

-- Indexes for performance
CREATE INDEX idx_study_documents_document_id ON study_documents(document_id);
CREATE INDEX idx_study_documents_study_id ON study_documents(study_id);
CREATE INDEX idx_study_documents_status ON study_documents(status);
CREATE INDEX idx_study_documents_uploaded_by ON study_documents(uploaded_by);
CREATE INDEX idx_study_documents_uploaded_at ON study_documents(uploaded_at);
CREATE INDEX idx_study_documents_approved_by ON study_documents(approved_by);
CREATE INDEX idx_study_documents_archived_by ON study_documents(archived_by);
CREATE INDEX idx_study_documents_approved_at ON study_documents(approved_at);
CREATE INDEX idx_study_documents_is_deleted ON study_documents(is_deleted);

CREATE INDEX idx_study_document_audit_document_id ON study_document_audit(document_id);
CREATE INDEX idx_study_document_audit_performed_by ON study_document_audit(performed_by);
CREATE INDEX idx_study_document_audit_performed_at ON study_document_audit(performed_at);
CREATE INDEX idx_study_document_audit_action_type ON study_document_audit(action_type);

CREATE INDEX idx_association_value_entry_saga_id ON association_value_entry(saga_id, saga_type);
CREATE INDEX idx_association_value_entry_key_value ON association_value_entry(association_key, association_value, saga_type);

-- Insert test users for foreign key references
MERGE INTO users (id, username, email) KEY(id) VALUES (1, 'testuser1', 'testuser1@clinprecision.com');
MERGE INTO users (id, username, email) KEY(id) VALUES (2, 'testuser2', 'testuser2@clinprecision.com');
MERGE INTO users (id, username, email) KEY(id) VALUES (100, 'approver', 'approver@clinprecision.com');
MERGE INTO users (id, username, email) KEY(id) VALUES (200, 'archiver', 'archiver@clinprecision.com');
