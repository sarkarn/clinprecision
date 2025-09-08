# User and Organization Data Model

This document describes the data model for users and organizations in the ClinPrecision EDC system, based on BRIDG/HL7 FHIR/CDISC standards.

## Overview

The data model represents different types of users for the EDC system including:
- CRO Users (e.g., CRA, Data Manager)
- Site Users (e.g., Principal Investigator, Clinical Research Coordinator, Clinical Data Manager)
- Database Administrators
- System Administrators
- LAB Central Vendor Users
- Patients/Subjects

These users are associated with different organizations like Sponsors, CROs, Sites, and Vendors.

## Entity Relationships

![Entity Relationship Diagram](https://placeholder-for-erd-diagram.com)

### Core Entities

1. **UserEntity**: Central entity representing any user in the system
2. **OrganizationEntity**: Represents organizations involved in clinical trials
3. **SiteEntity**: Represents clinical sites where trials are conducted
4. **UserTypeEntity**: Categorizes users into specific roles
5. **UserStudyRoleEntity**: Manages user roles specific to studies
6. **UserSiteAssignmentEntity**: Tracks which users are assigned to which sites
7. **UserQualificationEntity**: Manages user certifications and qualifications
8. **UserSessionEntity**: Tracks user login sessions

### Organizational Relationships

1. **OrganizationTypeEntity**: Categorizes organizations (Sponsor, CRO, Site, Vendor)
2. **OrganizationContactEntity**: Contact persons for organizations
3. **OrganizationStudyEntity**: Relationships between organizations and studies
4. **SiteStudyEntity**: Relationships between sites and studies

## User Types and Categories

### User Categories (UserTypeEntity.UserCategory)
- SPONSOR_USER: Users from the sponsoring organization
- CRO_USER: Users from Contract Research Organizations
- SITE_USER: Users from clinical sites
- VENDOR_USER: Users from vendor organizations (labs, etc.)
- SUBJECT_USER: Patient/subject users
- SYSTEM_USER: System administrators and technical staff

### Common User Types
1. **Sponsor Users**
   - Study Manager
   - Clinical Data Manager
   - Medical Monitor
   
2. **CRO Users**
   - Clinical Research Associate (CRA)
   - Data Manager
   - Project Manager
   
3. **Site Users**
   - Principal Investigator
   - Clinical Research Coordinator
   - Clinical Data Entry Staff
   
4. **Vendor Users**
   - Laboratory Technician
   - Central Reading Facility Staff
   
5. **System Users**
   - System Administrator
   - Database Administrator

## Organization Types

1. **Sponsor**: Organization funding and responsible for the clinical trial
2. **CRO**: Contract Research Organization managing trial operations
3. **Site**: Healthcare facilities where the trial is conducted
4. **Vendor**: Service providers (labs, imaging centers, etc.)

## Database Schema

The database schema includes tables for:

1. `users`: Central user information
2. `user_types`: User role classifications
3. `organizations`: Organizations involved in trials
4. `organization_types`: Types of organizations
5. `sites`: Clinical trial sites
6. `user_qualifications`: User certifications and credentials
7. `user_study_roles`: User roles in specific studies
8. `user_site_assignments`: User assignments to sites
9. `user_sessions`: User login sessions
10. `organization_contacts`: Contact persons for organizations
11. `organization_studies`: Organization associations with studies
12. `site_studies`: Site associations with studies
13. `users_roles`: Legacy role assignments
14. `users_user_types`: Many-to-many relationship between users and user types

## Implementation Details

### Authentication and Authorization

- User authentication is managed through the `UserEntity` and `UserSessionEntity`
- Authorization is determined by:
  - The user's assigned roles (`RoleEntity`)
  - The user's types (`UserTypeEntity`)
  - Study-specific roles (`UserStudyRoleEntity`)
  - Site-specific assignments (`UserSiteAssignmentEntity`)

### Data Integrity and Audit

- All entities include `created_at` and `updated_at` timestamps
- Statuses track the current state of entities (active, inactive, pending, etc.)
- Relationships between entities use foreign keys to maintain referential integrity

## Standards Compliance

This data model is designed to align with:

1. **BRIDG (Biomedical Research Integrated Domain Group)**: For clinical research concepts
2. **HL7 FHIR (Fast Healthcare Interoperability Resources)**: For healthcare data exchange
3. **CDISC (Clinical Data Interchange Standards Consortium)**: For clinical trial data standards

## API Endpoints

The User Service will expose RESTful endpoints for:

1. User management (CRUD operations)
2. Organization management
3. Site management
4. User authentication and session management
5. Role and permission management
6. User-Site and User-Study assignments

## Future Considerations

1. Integration with external identity providers (OAuth, SAML)
2. Enhanced audit logging for regulatory compliance
3. Electronic signatures for CFR 21 Part 11 compliance
4. Patient/subject portal integration
