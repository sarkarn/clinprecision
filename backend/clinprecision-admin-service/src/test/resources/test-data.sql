-- Test data for SiteCreationDebugTest

-- Insert test organization
INSERT INTO organization (id, name, address_line1, city, state, country, phone, email, created_at, updated_at) 
VALUES (1, 'Test Organization', '123 Org Street', 'Test City', 'Test State', 'Test Country', '555-0123', 'org@example.com', NOW(), NOW());

-- Insert test user
INSERT INTO users (id, username, email, first_name, last_name, password_hash, created_at, updated_at) 
VALUES (1, 'test-user', 'test@example.com', 'Test', 'User', '$2a$10$dummy.hash.here', NOW(), NOW());

-- Insert test role
INSERT INTO roles (id, name, description, created_at, updated_at) 
VALUES (1, 'Site Coordinator', 'Coordinates site activities', NOW(), NOW());