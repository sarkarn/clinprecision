# Study-Specific Form Database Setup

This directory contains SQL scripts for setting up study-specific forms in the ClinPrecision database. These scripts complement the existing form library setup and create forms that are tied to specific studies.

## Files Created

### 1. `fix_form_definitions_structure.sql`
**Purpose**: Fixes the form_definitions table structure to match form_templates table.

**What it does**:
- Adds the missing `structure` JSON field to form_definitions table
- Updates existing form_definitions records with basic structure information
- Creates an index for better performance on structure queries

**When to run**: Run this script BEFORE running the study_specific_forms_setup.sql script.

### 2. `study_specific_forms_setup.sql`
**Purpose**: Creates comprehensive study-specific form data similar to form_library_setup.sql but for study-specific forms.

**What it creates**:
- Study-specific forms for multiple existing studies
- Forms that are based on form_templates (using template_id references)
- Custom forms designed specifically for study requirements
- Proper form versions for all created forms

**Studies included**:
- **Study 1 (COVID-19 Vaccine Trial)**: Demographics with COVID-19 specific fields, Adverse Events with vaccine-specific assessments
- **Study 3 (Alzheimer's Disease)**: Cognitive Assessment Battery, Drug Administration Log
- **Study 4 (Rheumatoid Arthritis)**: Joint Assessment with disease activity scores
- **Study 6 (Pediatric Asthma)**: Pediatric Asthma Control Test (ACT)

## Key Features

### Structure Field Integration
All forms now include the `structure` JSON field that organizes form fields into logical sections with layout information:

```json
{
  "sections": [
    {
      "id": "section_id",
      "title": "Section Title", 
      "description": "Section description",
      "fields": ["field1", "field2"],
      "layout": {"columns": 2, "style": "standard"}
    }
  ],
  "layout": {
    "type": "sections",
    "orientation": "vertical",
    "spacing": "normal"
  }
}
```

### Template Integration
Forms can be based on existing form_templates:
- References template via `template_id` and `template_version`
- Allows customization while maintaining template relationship
- Supports both template-based and fully custom forms

### Study Context
- All forms are tied to specific studies via `study_id`
- Forms can include study-specific fields and validations
- Maintains consistency with study protocols and requirements

## Running the Scripts

### Prerequisites
1. Ensure the ClinPrecision database exists and is accessible
2. Ensure form_templates table is populated (run form_library_setup.sql first)
3. Ensure studies and users exist in the database

### Execution Order
```sql
-- 1. Fix form_definitions table structure
SOURCE fix_form_definitions_structure.sql;

-- 2. Create study-specific forms
SOURCE study_specific_forms_setup.sql;
```

### Verification
After running the scripts, verify the results:

```sql
-- Check form_definitions table structure
DESCRIBE form_definitions;

-- Count created forms by study
SELECT study_id, COUNT(*) as form_count 
FROM form_definitions 
GROUP BY study_id;

-- Verify structure field is populated
SELECT name, study_id, 
       JSON_EXTRACT(structure, '$.sections') IS NOT NULL as has_structure
FROM form_definitions
WHERE structure IS NOT NULL;
```

## Integration with Frontend

These forms are designed to work seamlessly with:

### StudyFormService.js
- Compatible with existing API endpoints (`/api/form-definitions`)
- Supports study context filtering
- Includes proper JSON structure for form rendering

### StudyFormList.jsx
- Displays study-specific forms correctly
- Supports template selection and form creation
- Handles form status and version management

### CRFBuilderIntegration.jsx
- Can load and edit study-specific forms
- Properly handles structure field for form layout
- Supports both template-based and custom forms

## Data Model Alignment

### Consistent with Form Templates
- Same field structure and validation patterns
- Compatible JSON schema for fields and structure
- Maintains relationship between templates and study forms

### Study Integration
- Forms belong to specific studies
- Can be filtered and managed by study context
- Support for study-specific workflows and permissions

## Maintenance

### Adding New Study Forms
1. Follow the pattern established in `study_specific_forms_setup.sql`
2. Ensure proper `structure` JSON is included
3. Reference appropriate `template_id` if based on template
4. Include study-specific tags for searchability

### Updating Form Structure
1. Update both `fields` and `structure` JSON when modifying forms
2. Create new version records in `form_versions` table
3. Maintain backwards compatibility for existing data

## Troubleshooting

### Common Issues
1. **Missing structure field**: Run `fix_form_definitions_structure.sql`
2. **Invalid JSON in fields/structure**: Validate JSON before insertion
3. **Template reference errors**: Ensure form_templates exist before referencing
4. **Study reference errors**: Ensure studies exist before creating forms

### Validation Queries
```sql
-- Check JSON validity
SELECT name, JSON_VALID(fields) as valid_fields, 
       JSON_VALID(structure) as valid_structure
FROM form_definitions;

-- Check template references  
SELECT fd.name, ft.name as template_name
FROM form_definitions fd
LEFT JOIN form_templates ft ON fd.template_id = ft.id
WHERE fd.template_id IS NOT NULL;
```

## Notes

- All forms include comprehensive field definitions with validation rules
- Structure supports multiple layout styles (standard, grid, inline, paired)
- Forms are tagged appropriately for search and filtering functionality
- Version management is handled automatically
- All forms are created with proper audit trail (created_by, timestamps)

This setup provides a complete foundation for study-specific form management that integrates seamlessly with the existing form library and frontend components.