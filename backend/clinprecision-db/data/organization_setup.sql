-- Organization and Organization Type Setup Script
-- Generated for ClinPrecision Application
-- September 8, 2025

-- Clear existing data if needed (uncomment if you want to reset data)
-- DELETE FROM organization_contacts;
-- DELETE FROM organizations;
-- DELETE FROM organization_types;

-- Insert organization types with proper code field
INSERT INTO organization_types (name, code, description, created_at, updated_at) VALUES
('Sponsor', 'SPONSOR', 'Organization that initiates, manages and/or finances a clinical trial', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CRO', 'CRO', 'Contract Research Organization that provides clinical trial services to sponsors', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Site', 'SITE', 'Clinical site where the study is conducted', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Vendor', 'VENDOR', 'Service provider for the clinical trial', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Laboratory', 'LAB', 'Laboratory for processing trial samples', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Academic', 'ACADEMIC', 'Academic or research institution', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Regulatory', 'REGULATORY', 'Regulatory agency or authority', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Hospital', 'HOSPITAL', 'Hospital or healthcare provider', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample organizations
INSERT INTO organizations (name, org_type_id, external_id, address_line1, address_line2, city, state, postal_code, country, phone, email, website, status, created_at, updated_at) VALUES
-- Sponsors
('Pharma Global', (SELECT id FROM organization_types WHERE code = 'SPONSOR'), 'PG12345', '123 Research Drive', 'Suite 400', 'Boston', 'MA', '02110', 'USA', '+1-617-555-1234', 'contact@pharmaglobal.com', 'https://www.pharmaglobal.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('BioAdvance Corp', (SELECT id FROM organization_types WHERE code = 'SPONSOR'), 'BAC7890', '500 Innovation Way', 'Building 3', 'San Francisco', 'CA', '94107', 'USA', '+1-415-555-2345', 'info@bioadvance.com', 'https://www.bioadvance.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- CROs
('Clinical Research Partners', (SELECT id FROM organization_types WHERE code = 'CRO'), 'CRP4567', '789 Science Park', NULL, 'Princeton', 'NJ', '08540', 'USA', '+1-609-555-3456', 'info@crpartners.com', 'https://www.crpartners.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Global Trial Services', (SELECT id FROM organization_types WHERE code = 'CRO'), 'GTS2345', '1000 Clinical Boulevard', '15th Floor', 'Durham', 'NC', '27701', 'USA', '+1-919-555-4567', 'contact@globaltrialservices.com', 'https://www.globaltrialservices.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Sites
('City Medical Center', (SELECT id FROM organization_types WHERE code = 'SITE'), 'CMC8901', '567 Hospital Drive', NULL, 'Chicago', 'IL', '60612', 'USA', '+1-312-555-5678', 'admin@citymedical.org', 'https://www.citymedical.org', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('University Research Hospital', (SELECT id FROM organization_types WHERE code = 'SITE'), 'URH3456', '200 University Ave', 'Clinical Trials Unit', 'Philadelphia', 'PA', '19104', 'USA', '+1-215-555-6789', 'trials@urh.edu', 'https://www.urh.edu', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Vendors
('LabEquip Supplies', (SELECT id FROM organization_types WHERE code = 'VENDOR'), 'LES7654', '321 Industrial Parkway', NULL, 'Atlanta', 'GA', '30318', 'USA', '+1-404-555-7890', 'sales@labequip.com', 'https://www.labequip.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('MedTech Solutions', (SELECT id FROM organization_types WHERE code = 'VENDOR'), 'MTS4321', '888 Technology Square', 'Suite 500', 'Cambridge', 'MA', '02139', 'USA', '+1-617-555-8901', 'info@medtechsolutions.com', 'https://www.medtechsolutions.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Laboratories
('Central Analysis Labs', (SELECT id FROM organization_types WHERE code = 'LAB'), 'CAL9876', '444 Science Center', NULL, 'Research Triangle Park', 'NC', '27709', 'USA', '+1-919-555-9012', 'info@centrallabs.com', 'https://www.centrallabs.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Precision Diagnostics', (SELECT id FROM organization_types WHERE code = 'LAB'), 'PD5432', '777 Biotech Way', 'Building 2', 'San Diego', 'CA', '92121', 'USA', '+1-858-555-0123', 'contact@precisiondiagnostics.com', 'https://www.precisiondiagnostics.com', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Academic Institutions
('Research University', (SELECT id FROM organization_types WHERE code = 'ACADEMIC'), 'RU1234', '100 Academic Way', 'Research Wing', 'Boston', 'MA', '02115', 'USA', '+1-617-555-4321', 'research@university.edu', 'https://www.university.edu', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Medical College', (SELECT id FROM organization_types WHERE code = 'ACADEMIC'), 'MC5678', '300 College Blvd', NULL, 'New York', 'NY', '10065', 'USA', '+1-212-555-8765', 'info@medcollege.edu', 'https://www.medcollege.edu', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Regulatory Organizations
('Healthcare Regulatory Authority', (SELECT id FROM organization_types WHERE code = 'REGULATORY'), 'HRA9012', '700 Regulatory Plaza', '20th Floor', 'Washington', 'DC', '20001', 'USA', '+1-202-555-6543', 'contact@healthregauth.gov', 'https://www.healthregauth.gov', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

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
