-- Create the admin user first
INSERT INTO users (
    first_name, 
    last_name, 
    email, 
    user_id, 
    encrypted_password, 
    title,
    status, 
    created_at, 
    updated_at
) VALUES (
    'System', 
    'Administrator', 
    'admin@clinprecision.com',
    'admin',
    '$2a$10$abCd1234EfGh5678IjKl.mnOpQ9876rStU5432vWxYz1234AdmIn',
    'Admin',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);





SET @admin_user_id = 1;

INSERT INTO user_types (name, description, code,category) VALUES
('CRA', 'Clinical Research Associate responsible for monitoring trial sites', 'CRA','CRO_USER'),
('Data Manager', 'Responsible for managing clinical trial data','DM','CRO_USER'),
('Principal Investigator', 'Lead investigator at a clinical site','PI','SITE_USER'),
('Clinical Research Coordinator', 'Coordinates clinical trial activities at a site','CRC','CRO_USER'),
('Clinical Data Manager', 'Manages data at the site level','CDM','CRO_USER'),
('Database Administrator', 'Administers the clinical trial database','DBADMIN','SYSTEM_USER'),
('System Administrator', 'Manages the EDC system','SYSADMIN','SYSTEM_USER'),
('Lab Technician', 'Laboratory staff processing trial samples','LABTECH','SITE_USER'),
('Lab Manager', 'Manages laboratory operations','LABMGR','SITE_USER'),
('Patient/Subject', 'Trial participant','SUBJ','SUBJECT_USER'),
('Medical Monitor', 'Provides medical oversight for the trial','MEDMON','CRO_USER'),
('Sponsor Monitor', 'Monitors the trial on behalf of the sponsor','SPONMON','SPONSOR_USER'),
('Statistician', 'Performs statistical analysis of trial data','STAT','CRO_USER'),
('Regulatory Affairs', 'Handles regulatory compliance','REGAFFR','REG_USER'),
('Quality Assurance', 'Ensures quality standards are met','QA','CRO_USER');

-- Insert default roles aligned with BRIDG/CDISC
INSERT INTO roles (name, description, is_system_role) VALUES
('SYSTEM_ADMIN', 'Full system administration rights', TRUE),
('DB_ADMIN', 'Database administration rights', TRUE),
('SPONSOR_ADMIN', 'Sponsor administrator with study oversight', TRUE),
('CRO_ADMIN', 'CRO administrator with delegated study oversight', TRUE),
('SITE_ADMIN', 'Site administrator with site management rights', TRUE),
('PI', 'Principal Investigator role', TRUE),
('SUB_I', 'Sub-investigator role', TRUE),
('CRC', 'Clinical Research Coordinator role', TRUE),
('CRA', 'Clinical Research Associate role', TRUE),
('DATA_MANAGER', 'Data management role', TRUE),
('MEDICAL_MONITOR', 'Medical monitoring role', TRUE),
('LAB_USER', 'Laboratory user role', TRUE),
('PATIENT', 'Patient/subject portal access', TRUE),
('DATA_ENTRY', 'Data entry capabilities', TRUE),
('DATA_REVIEW', 'Data review capabilities', TRUE),
('QUERY_MANAGEMENT', 'Query creation and resolution', TRUE),
('REPORT_VIEWER', 'Report viewing capabilities', TRUE),
('STUDY_BUILDER', 'Study and CRF design capabilities', TRUE);

-- Insert default authorities
INSERT INTO authorities (name) VALUES
('READ_STUDY'),
('CREATE_STUDY'),
('UPDATE_STUDY'),
('DELETE_STUDY'),
('READ_SUBJECT'),
('CREATE_SUBJECT'),
('UPDATE_SUBJECT'),
('DELETE_SUBJECT'),
('READ_FORM'),
('CREATE_FORM'),
('UPDATE_FORM'),
('DELETE_FORM'),
('ENTER_DATA'),
('REVIEW_DATA'),
('SIGN_DATA'),
('LOCK_FORM'),
('UNLOCK_FORM'),
('CREATE_QUERY'),
('ANSWER_QUERY'),
('CLOSE_QUERY'),
('EXPORT_DATA'),
('IMPORT_DATA'),
('ASSIGN_USER'),
('MANAGE_SITE'),
('MANAGE_USER'),
('SYSTEM_CONFIGURATION');

-- Assign authorities to roles (system admin example)
INSERT INTO roles_authorities (roles_id, authorities_id) 
SELECT r.id, a.id FROM roles r, authorities a WHERE r.name = 'SYSTEM_ADMIN' AND a.name IN (
    'READ_STUDY', 'CREATE_STUDY', 'UPDATE_STUDY', 'DELETE_STUDY', 
    'READ_SUBJECT', 'CREATE_SUBJECT', 'UPDATE_SUBJECT', 'DELETE_SUBJECT',
    'READ_FORM', 'CREATE_FORM', 'UPDATE_FORM', 'DELETE_FORM',
    'ENTER_DATA', 'REVIEW_DATA', 'SIGN_DATA', 'LOCK_FORM', 'UNLOCK_FORM',
    'CREATE_QUERY', 'ANSWER_QUERY', 'CLOSE_QUERY', 'EXPORT_DATA', 'IMPORT_DATA',
    'ASSIGN_USER', 'MANAGE_SITE', 'MANAGE_USER', 'SYSTEM_CONFIGURATION'
);

-- Assign system admin role to the admin user
INSERT INTO users_roles (users_id, roles_id)
VALUES (@admin_user_id, (SELECT id FROM roles WHERE name = 'SYSTEM_ADMIN'));

INSERT INTO organization_roles (name, code, description, created_at, updated_at) VALUES
('Sponsor', 'SPONSOR', 'Organization that initiates, manages and/or finances a clinical trial', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CRO', 'CRO', 'Contract Research Organization that provides clinical trial services to sponsors', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Site', 'SITE', 'Clinical site where the study is conducted', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Vendor', 'VENDOR', 'Service provider for the clinical trial', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Laboratory', 'LABORATORY', 'Laboratory for processing trial samples', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Regulatory', 'REGULATORY', 'Regulatory agency or authority', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Statistics', 'STATISTICS', 'Statistics Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Safety', 'SAFETY', 'Safety Department', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample organizations
INSERT INTO organizations (name, external_id, address_line1, address_line2, city, state, postal_code, country, phone, email, website, status, created_at, updated_at) VALUES
-- Sponsors
('Pharma Global', 'PG12345', '123 Research Drive', 'Suite 400', 'Boston', 'MA', '02110', 'USA', '+1-617-555-1234', 'contact@pharmaglobal.com', 'https://www.pharmaglobal.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('BioAdvance Corp', 'BAC7890', '500 Innovation Way', 'Building 3', 'San Francisco', 'CA', '94107', 'USA', '+1-415-555-2345', 'info@bioadvance.com', 'https://www.bioadvance.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- CROs
('Clinical Research Partners', 'CRP4567', '789 Science Park', NULL, 'Princeton', 'NJ', '08540', 'USA', '+1-609-555-3456', 'info@crpartners.com', 'https://www.crpartners.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Global Trial Services', 'GTS2345', '1000 Clinical Boulevard', '15th Floor', 'Durham', 'NC', '27701', 'USA', '+1-919-555-4567', 'contact@globaltrialservices.com', 'https://www.globaltrialservices.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Sites
('City Medical Center', 'CMC8901', '567 Hospital Drive', NULL, 'Chicago', 'IL', '60612', 'USA', '+1-312-555-5678', 'admin@citymedical.org', 'https://www.citymedical.org', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('University Research Hospital', 'URH3456', '200 University Ave', 'Clinical Trials Unit', 'Philadelphia', 'PA', '19104', 'USA', '+1-215-555-6789', 'trials@urh.edu', 'https://www.urh.edu', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Vendors
('LabEquip Supplies', 'LES7654', '321 Industrial Parkway', NULL, 'Atlanta', 'GA', '30318', 'USA', '+1-404-555-7890', 'sales@labequip.com', 'https://www.labequip.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MedTech Solutions', 'MTS4321', '888 Technology Square', 'Suite 500', 'Cambridge', 'MA', '02139', 'USA', '+1-617-555-8901', 'info@medtechsolutions.com', 'https://www.medtechsolutions.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Laboratories
('Central Analysis Labs', 'CAL9876', '444 Science Center', NULL, 'Research Triangle Park', 'NC', '27709', 'USA', '+1-919-555-9012', 'info@centrallabs.com', 'https://www.centrallabs.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Precision Diagnostics',  'PD5432', '777 Biotech Way', 'Building 2', 'San Diego', 'CA', '92121', 'USA', '+1-858-555-0123', 'contact@precisiondiagnostics.com', 'https://www.precisiondiagnostics.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Academic Institutions
('Research University', 'RU1234', '100 Academic Way', 'Research Wing', 'Boston', 'MA', '02115', 'USA', '+1-617-555-4321', 'research@university.edu', 'https://www.university.edu', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Medical College', 'MC5678', '300 College Blvd', NULL, 'New York', 'NY', '10065', 'USA', '+1-212-555-8765', 'info@medcollege.edu', 'https://www.medcollege.edu', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Regulatory Organizations
('Healthcare Regulatory Authority', 'HRA9012', '700 Regulatory Plaza', '20th Floor', 'Washington', 'DC', '20001', 'USA', '+1-202-555-6543', 'contact@healthregauth.gov', 'https://www.healthregauth.gov', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO organization_contacts (
    organization_id, contact_name, title, department, email, phone, is_primary, created_at, updated_at
) VALUES
-- Pharma Global contacts
((SELECT id FROM organizations WHERE external_id = 'PG12345'), 'John Smith', 'Dr.', 'Clinical Operations', 'john.smith@pharmaglobal.com', '+1-617-555-1111', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'PG12345'), 'Sarah Johnson', 'Ms.', 'Regulatory Affairs', 'sarah.johnson@pharmaglobal.com', '+1-617-555-1113', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'PG12345'), 'Robert Chen', 'Mr.', 'Finance', 'robert.chen@pharmaglobal.com', '+1-617-555-1115', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- BioAdvance Corp contacts
((SELECT id FROM organizations WHERE external_id = 'BAC7890'), 'Michael Lee', 'Mr.', 'Research & Development', 'michael.lee@bioadvance.com', '+1-415-555-2222', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'BAC7890'), 'Emily Chen', 'Dr.', 'Clinical Research', 'emily.chen@bioadvance.com', '+1-415-555-2224', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'BAC7890'), 'James Wilson', 'Dr.', 'Medical Affairs', 'james.wilson@bioadvance.com', '+1-415-555-2226', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Clinical Research Partners contacts
((SELECT id FROM organizations WHERE external_id = 'CRP4567'), 'David Wilson', 'Mr.', 'Clinical Operations', 'david.wilson@crpartners.com', '+1-609-555-3333', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'CRP4567'), 'Jennifer Garcia', 'Ms.', 'Data Management', 'jennifer.garcia@crpartners.com', '+1-609-555-3335', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'CRP4567'), 'Thomas Brown', 'Mr.', 'Business Development', 'thomas.brown@crpartners.com', '+1-609-555-3337', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Global Trial Services contacts
((SELECT id FROM organizations WHERE external_id = 'GTS2345'), 'Robert Taylor', 'Dr.', 'Clinical Operations', 'robert.taylor@globaltrialservices.com', '+1-919-555-4444', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'GTS2345'), 'Amanda Brown', 'Ms.', 'Business Development', 'amanda.brown@globaltrialservices.com', '+1-919-555-4446', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'GTS2345'), 'Christopher Lopez', 'Mr.', 'Regulatory Affairs', 'christopher.lopez@globaltrialservices.com', '+1-919-555-4448', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- City Medical Center contacts
((SELECT id FROM organizations WHERE external_id = 'CMC8901'), 'Patricia Martinez', 'Dr.', 'Research Department', 'p.martinez@citymedical.org', '+1-312-555-5679', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'CMC8901'), 'Kevin Anderson', 'Mr.', 'Research Department', 'k.anderson@citymedical.org', '+1-312-555-5681', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- University Research Hospital contacts
((SELECT id FROM organizations WHERE external_id = 'URH3456'), 'Elizabeth Miller', 'Dr.', 'Clinical Trials Unit', 'e.miller@urh.edu', '+1-215-555-6790', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
((SELECT id FROM organizations WHERE external_id = 'URH3456'), 'Richard Davis', 'Dr.', 'Oncology Department', 'r.davis@urh.edu', '+1-215-555-6792', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add sample users with specific roles
INSERT INTO users (first_name, last_name, email, user_id, encrypted_password, status, organization_id, created_at, updated_at)
VALUES 
('Jane', 'Smith', 'jsmith@biopharm.com', 'jsmith', '$2a$10$abCd1234EfGh5678IjKl.mnOpQ9876rStU5432vWxYz1234AbCd1', 'active', (SELECT id FROM organizations WHERE external_id = 'PG12345'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Robert', 'Johnson', 'rjohnson@medicalresearch.org', 'rjohnson', '$2a$10$abCd1234EfGh5678IjKl.mnOpQ9876rStU5432vWxYz1234AbCd2', 'active', (SELECT id FROM organizations WHERE external_id = 'BAC7890'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Emily', 'Chen', 'echen@neurocare.org', 'echen', '$2a$10$abCd1234EfGh5678IjKl.mnOpQ9876rStU5432vWxYz1234AbCd3', 'active', (SELECT id FROM organizations WHERE external_id = 'PG12345'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Michael', 'Rodriguez', 'mrodriguez@arthricare.com', 'mrodriguez', '$2a$10$abCd1234EfGh5678IjKl.mnOpQ9876rStU5432vWxYz1234AbCd4', 'active', (SELECT id FROM organizations WHERE external_id = 'BAC7890'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Sarah', 'Williams', 'swilliams@cardiohealth.org', 'swilliams', '$2a$10$abCd1234EfGh5678IjKl.mnOpQ9876rStU5432vWxYz1234AbCd5', 'active', (SELECT id FROM organizations WHERE external_id = 'PG12345'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('David', 'Lee', 'dlee@respicare.org', 'dlee', '$2a$10$abCd1234EfGh5678IjKl.mnOpQ9876rStU5432vWxYz1234AbCd6', 'active', (SELECT id FROM organizations WHERE external_id = 'BAC7890'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- Assign global roles to users
INSERT INTO users_roles (users_id, roles_id)
VALUES 
((SELECT id FROM users WHERE email = 'jsmith@biopharm.com'), (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN')),
((SELECT id FROM users WHERE email = 'rjohnson@medicalresearch.org'), (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN')),
((SELECT id FROM users WHERE email = 'echen@neurocare.org'), (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN')),
((SELECT id FROM users WHERE email = 'mrodriguez@arthricare.com'), (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN')),
((SELECT id FROM users WHERE email = 'swilliams@cardiohealth.org'), (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN')),
((SELECT id FROM users WHERE email = 'dlee@respicare.org'), (SELECT id FROM roles WHERE name = 'SPONSOR_ADMIN'));