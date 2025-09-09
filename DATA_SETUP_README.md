# ClinPrecision Data Setup

This directory contains scripts and utilities for setting up sample data in the ClinPrecision application.

## Backend Database Setup

### SQL Script

The main SQL script for database setup is located at:

```
backend/clinprecision-db/ddl/consolidated_schema.sql
```

This script creates all the necessary tables and indexes for the application database.

### Sample Data SQL Script

Sample data for development and testing can be loaded using:

```
backend/clinprecision-db/ddl/sample_data_setup.sql
```

This script populates the database with:
- Sample users and roles
- Organizations
- Studies with arms, visits, and CRFs
- Form definitions with fields
- Sample subjects and subject visits

To execute these scripts:

1. First run the schema script to create the database and tables
2. Then run the sample data script to populate the tables

## Frontend Sample Data

For frontend development and testing without backend connectivity, the following files provide mock data:

```
frontend/clinprecision/src/data/sampleData.js
frontend/clinprecision/src/data/mockDataService.js
```

These files contain:
- JavaScript objects representing the same sample data as in the SQL script
- Mock service functions that simulate API calls to retrieve data

## Utilities

A SQL generation utility is provided to help create additional test data:

```
frontend/clinprecision/src/utils/sqlGenerationUtil.js
```

This utility contains functions to:
- Generate SQL INSERT statements from JavaScript objects
- Create sample form definitions with fields
- Generate subject data

## Data Model

The sample data follows this hierarchical structure:

1. Studies - Top-level clinical trials
2. Arms - Treatment groups within studies
3. Visits - Scheduled patient visits within arms
4. CRFs (Case Report Forms) - Forms completed during visits
5. Form Definitions - Templates for CRFs with field definitions
6. Subjects - Patients enrolled in studies

## Usage Example

To generate SQL for a new study using the utility:

```javascript
import { generateStudySQL } from '../utils/sqlGenerationUtil';

const newStudy = {
  id: '7',
  name: 'New Clinical Trial',
  phase: 'Phase 1',
  status: 'draft',
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  sponsor: 'Test Sponsor',
  investigator: 'Dr. Test',
  description: 'Test description',
  arms: [
    {
      id: '10',
      name: 'Test Arm',
      description: 'Test arm description',
      visits: [
        {
          id: '20',
          name: 'Screening Visit',
          timepoint: -14,
          description: 'Initial screening',
          crfs: [
            {
              id: '30',
              name: 'Test Form',
              type: 'standard',
              description: 'Test form description'
            }
          ]
        }
      ]
    }
  ]
};

const sql = generateStudySQL(newStudy);
console.log(sql);
```

This will generate the SQL statements needed to insert this study and its related entities into the database.
