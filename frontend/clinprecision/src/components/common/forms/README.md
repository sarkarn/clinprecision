# Reusable Form Architecture - Implementation Guide

## Overview

This document provides a comprehensive guide to the reusable form architecture implemented for ClinPrecision. The architecture enables the same form components to be used across different contexts: form library design, study-specific form design, and patient data capture.

## Architecture Components

### Core Components

#### 1. FormRenderer.jsx
**Purpose**: Central form rendering engine that handles multiple modes and contexts.

**Key Features**:
- **Multiple Modes**: `entry`, `view`, `preview`, `designer`
- **Context Awareness**: `general`, `study`, `template`, `patient`
- **Validation Engine**: Real-time validation with custom rules
- **Auto-save**: Configurable auto-save functionality
- **Progress Tracking**: Section completion and overall progress
- **Error Handling**: Comprehensive error display and recovery

**Usage**:
```jsx
<FormRenderer
  formDefinition={formDef}
  formData={data}
  mode="entry"
  context="patient"
  onDataChange={handleDataChange}
  showSections={true}
  showProgress={true}
/>
```

#### 2. FormContext.jsx
**Purpose**: State management and validation providers for form operations.

**Key Features**:
- **FormProvider**: Manages form state with useReducer
- **Validation Context**: Centralized validation handling
- **Custom Hooks**: `useForm`, `useFormField` for easy component integration
- **Action Creators**: Standardized form actions (update, validate, reset)

**Usage**:
```jsx
<FormProvider initialData={data} context="study" mode="entry">
  <FormRenderer formDefinition={formDef} />
</FormProvider>
```

#### 3. FormFieldRenderer.jsx
**Purpose**: Individual field type renderer with comprehensive field type support.

**Key Features**:
- **Field Type Support**: Text, number, date, select, checkbox, file, etc.
- **Clinical Field Types**: Vital signs, lab values, medications, diagnosis codes
- **Context-Aware Rendering**: Different behavior based on context
- **Read-Only Mode**: Automatic switching for view mode

### Field Components

#### 4. TextInput.jsx
**Purpose**: Text input field with validation and formatting.

**Key Features**:
- **Input Masking**: Phone numbers, SSN, custom patterns
- **Autocomplete**: Suggestions based on context
- **Character Counting**: Visual feedback for length limits
- **Clinical Context**: Special handling for clinical text fields

#### 5. NumberInput.jsx
**Purpose**: Numeric input with clinical reference ranges.

**Key Features**:
- **Input Types**: Integer, float, currency formatting
- **Step Controls**: Increment/decrement buttons
- **Reference Ranges**: Visual indicators for clinical values
- **Unit Display**: Automatic unit formatting (mmHg, bpm, etc.)

#### 6. DateInput.jsx
**Purpose**: Date/time input with validation and convenience features.

**Key Features**:
- **Date Types**: Date, time, datetime-local
- **Relative Dates**: Quick selection (today, yesterday, +1 week)
- **Age Calculation**: Automatic age calculation for birth dates
- **Time Zone Support**: Time zone display for datetime fields

#### 7. SelectInput.jsx
**Purpose**: Dropdown/multi-select with search and custom options.

**Key Features**:
- **Single/Multi Select**: Configurable selection mode
- **Searchable**: Type-ahead search functionality
- **Custom Options**: Allow users to add custom values
- **Option Grouping**: Group options by category

#### 8. CheckboxInput.jsx
**Purpose**: Single checkbox and checkbox groups.

**Key Features**:
- **Single/Group Mode**: Individual checkbox or group selection
- **Layout Options**: Vertical, horizontal, grid layouts
- **Select All/None**: Bulk selection controls
- **Max Selections**: Limit number of selections

### Support Components

#### 9. FieldWrapper.jsx
**Purpose**: Common wrapper providing consistent layout and error display.

**Key Features**:
- **Label Management**: Required indicators, help text
- **Error Display**: Consistent error message formatting
- **Clinical Indicators**: Reference range displays, abnormal value alerts
- **Context Styling**: Different styles based on form context

#### 10. ReadOnlyDisplay.jsx
**Purpose**: Read-only field value display for view mode.

**Key Features**:
- **Type-Aware Formatting**: Appropriate display for each field type
- **Clinical Values**: Special formatting for clinical data
- **File Display**: Preview links for uploaded files
- **Multi-Value Handling**: Display multiple selected values

### Designer Components

#### 11. FormDesigner.jsx
**Purpose**: Comprehensive form designer with drag-drop functionality.

**Key Features**:
- **Drag-Drop Reordering**: Visual field and section reordering
- **Section Management**: Create, edit, delete form sections
- **Undo/Redo**: 50-step history with state management
- **Multiple Modes**: Design, preview, properties editing
- **Context Awareness**: Different field types based on context

#### 12. FormPreview.jsx
**Purpose**: Standalone form preview with multiple display modes.

**Key Features**:
- **Preview Modes**: Interactive, filled with sample data, structure view
- **Device Responsive**: Mobile, tablet, desktop previews
- **Sample Data Generation**: Intelligent sample data based on field types
- **Metadata Display**: Form version, estimated time, field count

#### 13. FieldPropertiesEditor.jsx
**Purpose**: Comprehensive field editing with tabbed interface.

**Key Features**:
- **Tabbed Interface**: Basic, validation, options, advanced properties
- **Field Type Switching**: Change field type with automatic metadata updates
- **Validation Rules**: Configure min/max, patterns, custom validation
- **Option Management**: Add/edit/remove options for select fields

#### 14. SectionEditor.jsx
**Purpose**: Form section editing with field management.

**Key Features**:
- **Section Properties**: Name, description, ordering, conditional logic
- **Field Management**: Add, edit, reorder fields within sections
- **Collapsible Sections**: Configure section expand/collapse behavior
- **Field Summary**: Quick overview of fields in each section

#### 15. FieldTypeSelector.jsx
**Purpose**: Visual field type selector with categories and search.

**Key Features**:
- **Categorized Display**: Group field types by category
- **Search Functionality**: Find field types by name or description
- **Clinical Fields**: Additional field types for clinical contexts
- **Usage Examples**: Show common use cases for each field type

## Context-Aware Architecture

### General Context (`context="general"`)
- Basic field types (text, number, date, select, etc.)
- Standard validation rules
- Generic styling and behavior
- Template creation mode

### Study Context (`context="study"`)
- Clinical field types (vital signs, lab values, medications)
- Enhanced validation for research compliance
- Study-specific features (subject IDs, visit types)
- Regulatory compliance indicators

### Patient Context (`context="patient"`)
- Reference range displays for clinical values
- Real-time validation with clinical alerts
- Visual indicators for abnormal values
- Data capture optimizations

### Template Context (`context="template"`)
- Template creation and management
- Metadata configuration
- Versioning support
- Reusability features

## Reusability Patterns

### 1. Same Components, Different Configurations

```jsx
// General form design
<FormDesigner 
  context="general" 
  availableFieldTypes={basicFieldTypes}
/>

// Clinical study design  
<FormDesigner 
  context="study" 
  availableFieldTypes={[...basicFieldTypes, ...clinicalFieldTypes]}
  showReferenceRanges={true}
/>
```

### 2. Mode-Based Rendering

```jsx
// Design mode - for form creation
<FormRenderer mode="design" context="general" />

// Entry mode - for data capture
<FormRenderer mode="entry" context="patient" />

// View mode - for data review
<FormRenderer mode="view" context="study" />
```

### 3. Context-Aware Field Behavior

The same field component adapts based on context:

```jsx
// In general context: basic number input
<NumberInput context="general" />

// In patient context: shows reference ranges and clinical indicators
<NumberInput 
  context="patient" 
  referenceRange={{min: 90, max: 120}}
  units="mmHg"
/>
```

## Integration Examples

### Form Library Design
Use FormDesigner to create reusable form templates:

```jsx
<FormDesigner
  formDefinition={templateForm}
  context="template"
  mode="design"
  onSave={saveTemplate}
  enableSections={true}
  enableValidation={true}
/>
```

### Study-Specific Form Design
Extend templates with study-specific fields:

```jsx
<FormDesigner
  formDefinition={studyForm}
  context="study"
  mode="design"
  baseTemplate={generalTemplate}
  showClinicalFields={true}
  onSave={saveStudyForm}
/>
```

### Patient Data Capture
Use forms for actual patient data entry:

```jsx
<FormProvider 
  initialData={existingData}
  context="patient"
  mode="entry"
>
  <FormRenderer
    formDefinition={studyForm}
    mode="entry"
    context="patient"
    showReferenceRanges={true}
    enableAutoSave={true}
    onSave={savePatientData}
  />
</FormProvider>
```

## Validation Architecture

### Form-Level Validation
- Required field validation
- Cross-field validation rules
- Section completion requirements
- Custom business logic validation

### Field-Level Validation
- Type-specific validation (email format, phone format)
- Range validation (min/max values, date ranges)
- Pattern validation (regex patterns)
- Clinical validation (reference ranges, normal values)

### Context-Specific Validation
- **General**: Basic validation rules
- **Study**: Research compliance validation
- **Patient**: Clinical safety validation
- **Template**: Template completeness validation

## Best Practices

### Component Usage

1. **Always use FormProvider** when using FormRenderer in entry mode
2. **Specify context** explicitly for proper field type availability
3. **Use consistent field IDs** across form versions for data migration
4. **Implement validation early** in the design process
5. **Test across contexts** to ensure proper behavior

### Performance Considerations

1. **Lazy load field components** for large forms
2. **Debounce validation** for real-time validation
3. **Use React.memo** for field components to prevent unnecessary re-renders
4. **Implement virtual scrolling** for very large forms

### Accessibility

1. **Proper ARIA labels** on all form elements
2. **Keyboard navigation** support in all components
3. **Screen reader announcements** for validation messages
4. **High contrast mode** support

## Migration from Existing Components

To migrate from existing form components (FormEntry, FormView, CRFBuilderIntegration):

1. **Replace FormEntry** with FormRenderer in entry mode
2. **Replace FormView** with FormRenderer in view mode
3. **Replace CRFBuilderIntegration** with FormDesigner
4. **Update form definitions** to use new schema format
5. **Test thoroughly** across all contexts

## Extending the Architecture

### Adding New Field Types

1. Create field component following existing patterns
2. Add field type to FormFieldRenderer
3. Update FieldTypeSelector with new type
4. Add validation rules if needed

### Adding New Contexts

1. Update context prop types across components
2. Add context-specific logic in FormRenderer
3. Update field components for new context
4. Add context to FieldTypeSelector

## File Structure

```
src/components/common/forms/
├── FormRenderer.jsx              # Main form rendering engine
├── FormContext.jsx              # State management and providers
├── FormFieldRenderer.jsx        # Individual field renderer
├── FormPreview.jsx             # Form preview component
├── FormDesigner.jsx            # Form designer interface
├── fields/                     # Individual field components
│   ├── TextInput.jsx
│   ├── NumberInput.jsx
│   ├── DateInput.jsx
│   ├── SelectInput.jsx
│   ├── CheckboxInput.jsx
│   ├── FieldWrapper.jsx
│   └── ReadOnlyDisplay.jsx
├── designer/                   # Designer-specific components
│   ├── FieldPropertiesEditor.jsx
│   ├── SectionEditor.jsx
│   └── FieldTypeSelector.jsx
└── examples/                   # Integration examples
    └── FormIntegrationExamples.jsx
```

This reusable form architecture provides a solid foundation for building complex, context-aware forms while maintaining consistency and reusability across the application.