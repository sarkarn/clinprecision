# ClinPrecision EDC User and Organization Data Model

## Overview

This document outlines the enhanced user and organization data model for the ClinPrecision EDC system. The model has been designed based on industry standards including BRIDG, HL7 FHIR, and CDISC to support different user types, organizations, and role-based access control.

## User Types

The system supports the following user types:

1. **CR Users**
   - Clinical Research Associate (CRA)
   - Data Manager

2. **Site Users**
   - Principal Investigator (PI)
   - Clinical Research Coordinator (CRC)
   - Clinical Data Manager

3. **Administrative Users**
   - Database Administrator
   - System Administrator

4. **Vendor Users**
   - LAB Central Vendor User
   - Other service providers

5. **Patients/Subjects**
   - Trial participants

## Organization Types

Organizations are categorized as:

1. **Sponsor** - Initiates, manages, and/or finances clinical trials
2. **CRO** - Contract Research Organization that provides clinical trial services
3. **Site** - Clinical site where the study is conducted
4. **Vendor** - Service provider for the clinical trial
5. **Laboratory** - Laboratory for processing trial samples

## Data Model Relationships

### Core Entities

1. **Users**
   - Basic user information (name, contact details)
   - Extended with professional information (title, profession)
   - Authentication details (userId, encryptedPassword)
   - Address and contact information
   - Status management (active, inactive, pending, locked)

2. **Organizations**
   - Basic organization information (name, type)
   - Contact details and address
   - External identifiers
   - Status management

3. **Sites**
   - Study-specific clinical sites
   - Connected to parent organization
   - Site identifiers and staff
   - Status management
   - Subject capacity tracking

### Roles and Permissions

1. **Roles**
   - System-defined roles (e.g., ROLE_PI, ROLE_CRA)
   - Associated with permissions

2. **Authorities**
   - Granular permissions (e.g., READ_STUDY, CREATE_SUBJECT)
   - Assigned to roles

3. **User Types**
   - Professional categorization (e.g., CRA, PI, Data Manager)
   - Can be assigned to users

### Study-Specific Assignments

1. **User Study Roles**
   - Assigns users to specific roles within studies
   - Optionally associated with specific sites
   - Time-bound role assignments

2. **User Site Assignments**
   - Assigns users to specific sites
   - Associated with roles
   - Time-bound assignments

3. **Organization Studies**
   - Connects organizations to studies
   - Defines organization's role in the study
   - Time-bound involvement

### Additional Features

1. **User Qualifications**
   - Tracks certifications, training, licenses
   - Supports verification workflow
   - Expiration date tracking

2. **Data Delegations**
   - Tracks delegation of responsibilities
   - Supports regulatory requirements
   - Time-bound delegations

3. **User Sessions**
   - Tracks user login/logout activity
   - Records IP and device information
   - Session status management

4. **Audit Trails**
   - User data changes
   - Organization data changes
   - Includes reason for changes and who made them

## Implementation

The data model has been implemented through:

1. SQL database scripts in `clinprecision-db/ddl/user_organization_model.sql`
2. Java entity classes in the user service module
3. Updated relationships in existing entities

## Database Tables

### Core User and Organization Tables

- `users` - Extended with additional fields
- `organizations` - New table for organization data
- `organization_types` - New table for organization categorization
- `sites` - New table for study sites

### Relationship and Assignment Tables

- `users_roles` - Existing table connecting users to roles
- `roles_authorities` - Existing table connecting roles to permissions
- `users_user_types` - New table connecting users to professional types
- `user_study_roles` - New table for study-specific role assignments
- `user_site_assignments` - New table for site-specific assignments
- `organization_studies` - New table connecting organizations to studies

### Supporting Tables

- `user_qualifications` - New table for tracking professional qualifications
- `data_delegations` - New table for tracking responsibility delegations
- `user_sessions` - New table for tracking user login sessions
- `organization_contacts` - New table for organization contact persons
- `patient_users` - New table linking patient users to subjects
- `user_audit_trail` - New table for user data change history
- `organization_audit_trail` - New table for organization data change history

## Access Control Model

The access control model follows these principles:

1. **Role-Based Access Control (RBAC)**
   - Users are assigned roles
   - Roles contain permissions (authorities)
   - System checks permissions for operations

2. **Context-Specific Permissions**
   - Permissions can be limited to specific studies
   - Permissions can be limited to specific sites
   - Time-bound permissions

3. **Hierarchical Access**
   - Organization-level access
   - Study-level access
   - Site-level access

4. **Delegation Model**
   - PI can delegate to Sub-Investigators
   - Supports regulatory requirements for delegation

## Data Integrity and Audit

1. **Complete Audit Trail**
   - All changes to user data are tracked
   - All changes to organization data are tracked
   - Session activity is recorded

2. **Regulatory Compliance**
   - Supports 21 CFR Part 11 requirements
   - Supports ICH GCP compliance
   - Maintains delegation records

## Recommended Next Steps

1. Implement repository interfaces for new entities
2. Create service-layer classes for managing the entities
3. Develop REST controllers for the new functionality
4. Update frontend components to support the enhanced model
5. Implement migration plan for existing data
