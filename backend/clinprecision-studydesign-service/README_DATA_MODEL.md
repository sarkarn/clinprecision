# Study Design Data Model Relationships

This document outlines the key relationships in the ClinPrecision study design data model.

## Entity Relationships

The system follows these key one-to-many and one-to-one relationships:

1. **Study to Study Arm**: One-to-Many
   - Each study can have multiple arms
   - Arms belong to exactly one study

2. **Study Arm to Study Visit**: One-to-Many
   - Each arm can have multiple visits
   - Visits belong to exactly one arm

3. **Study Visit to Visit CRF**: One-to-Many
   - Each visit can have multiple CRFs (forms)
   - CRFs are assigned to specific visits

4. **Visit CRF to Form Field Group**: One-to-Many
   - Each CRF can have multiple field groups
   - Groups belong to exactly one CRF

5. **Form Field Group to Form Field**: One-to-Many
   - Each group can have multiple fields
   - Fields belong to exactly one group

6. **Form Field to Form Field Metadata**: One-to-One
   - Each field has exactly one metadata object
   - The metadata contains all the additional properties specific to this field

## Data Storage

- Form fields and their metadata are stored as nested JSON in the `fields` column of the `form_definitions` table
- Each field has a one-to-one relationship with its metadata
- This relationship is enforced through validation in the service layer

## Technical Implementation

- In Java models, the relationship is implemented through a direct object reference
- Validation ensures each field always has exactly one metadata object
- The frontend models enforce this through the createField function in CRFModels.js
