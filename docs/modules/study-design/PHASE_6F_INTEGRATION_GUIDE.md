# Phase 6F Integration Guide - Study Design Workflow

**Created**: October 12, 2025  
**Status**: Implementation Guide  
**Purpose**: Integrate Phase 6F metadata components into the standard Study Design workflow

---

## 🎯 Integration Overview

Phase 6F components should be integrated into the **Study Design Dashboard** workflow as additional design phases that occur **after Form Binding** and **before Review & Publish**. This ensures:

1. **Consistent UI/UX** - Follows existing study design patterns
2. **Logical Workflow** - Metadata configuration happens after forms are bound to visits
3. **Standard Navigation** - Uses existing StudyContextHeader, NavigationSidebar, and WorkflowProgressTracker
4. **Phase-based Progress** - Integrates with existing phase tracking system

---

## 📋 Current Study Design Workflow

### Existing Phases (StudyDesignDashboard.jsx)

```
1. Basic Information     ✅ (StudyCreationWizard)
2. Study Arms            ✅ (StudyArmsDesigner)
3. Visit Schedule        ✅ (VisitScheduleDesigner)
4. Form Binding          ✅ (FormBindingDesigner)
5. Review & Validation   ✅ (Review component)
6. Publish Study         ✅ (StudyPublishWorkflow)
```

---

## 🆕 Enhanced Workflow with Phase 6F

### Updated Phases

```
1. Basic Information         ✅ (StudyCreationWizard)
2. Study Arms                ✅ (StudyArmsDesigner)
3. Visit Schedule            ✅ (VisitScheduleDesigner)
4. Form Binding              ✅ (FormBindingDesigner)
5. Field Metadata            🆕 (Phase 6F - Configure field-level metadata)
6. SDV Planning              🆕 (Phase 6F - Plan SDV workflows)
7. Medical Coding            🆕 (Phase 6F - Configure medical coding)
8. CDASH/SDTM Mapping        🆕 (Phase 6F - Map to regulatory standards)
9. Compliance Review         🆕 (Phase 6F - Review regulatory compliance)
10. Review & Validation      ✅ (Review component)
11. Publish Study            ✅ (StudyPublishWorkflow)
```

---

## 🔧 Implementation Steps

### Step 1: Update StudyDesignDashboard.jsx

Add new phases to the `designPhases` array:

```javascript
// Add after 'forms' phase and before 'review' phase
{
    id: 'field-metadata',
    name: 'Field Metadata',
    description: 'Configure field-level clinical and regulatory metadata',
    icon: <Settings className="h-5 w-5" />,
    path: '/study-design/field-metadata',
    status: 'AVAILABLE',
    category: 'metadata',
    requiresCompletion: ['forms'] // Requires form binding to be complete
},
{
    id: 'sdv-planning',
    name: 'SDV Planning',
    description: 'Plan Source Data Verification workflows',
    icon: <CheckSquare className="h-5 w-5" />,
    path: '/study-design/sdv-planning',
    status: 'AVAILABLE',
    category: 'metadata',
    requiresCompletion: ['field-metadata']
},
{
    id: 'medical-coding',
    name: 'Medical Coding',
    description: 'Configure MedDRA and WHO Drug medical coding',
    icon: <Tag className="h-5 w-5" />,
    path: '/study-design/medical-coding',
    status: 'AVAILABLE',
    category: 'metadata',
    requiresCompletion: ['field-metadata']
},
{
    id: 'cdash-mapping',
    name: 'CDASH/SDTM Mapping',
    description: 'Map fields to CDISC standards for regulatory submission',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    path: '/study-design/cdash-mapping',
    status: 'AVAILABLE',
    category: 'metadata',
    requiresCompletion: ['field-metadata']
},
{
    id: 'compliance-review',
    name: 'Compliance Review',
    description: 'Review regulatory compliance and generate reports',
    icon: <ShieldCheck className="h-5 w-5" />,
    path: '/study-design/compliance-review',
    status: 'AVAILABLE',
    category: 'metadata',
    requiresCompletion: ['field-metadata', 'sdv-planning', 'medical-coding', 'cdash-mapping']
},
```

### Step 2: Create Phase Wrapper Components

Create wrapper components that integrate Phase 6F components with StudyDesignDashboard layout:

#### `/study-design/phases/FieldMetadataPhase.jsx`
```javascript
import React from 'react';
import { useParams } from 'react-router-dom';
import FieldMetadataPanel from '../../../study-design/metadata/FieldMetadataPanel';
import StudyFormService from '../../../../services/StudyFormService';

const FieldMetadataPhase = ({ study, onPhaseComplete }) => {
    const { studyId } = useParams();
    const [forms, setForms] = React.useState([]);
    const [selectedForm, setSelectedForm] = React.useState(null);
    const [selectedField, setSelectedField] = React.useState(null);

    React.useEffect(() => {
        loadStudyForms();
    }, [studyId]);

    const loadStudyForms = async () => {
        const studyForms = await StudyFormService.getFormsByStudyId(studyId);
        setForms(studyForms);
    };

    return (
        <div className="space-y-6">
            {/* Phase Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Field-Level Metadata Configuration
                </h2>
                <p className="text-gray-600">
                    Configure clinical and regulatory metadata for each field in your study forms.
                    This metadata drives data quality, compliance, and regulatory submissions.
                </p>
            </div>

            {/* Form Selector */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Select Form</h3>
                <select
                    value={selectedForm?.id || ''}
                    onChange={(e) => {
                        const form = forms.find(f => f.id === parseInt(e.target.value));
                        setSelectedForm(form);
                        setSelectedField(null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                    <option value="">-- Select a form --</option>
                    {forms.map(form => (
                        <option key={form.id} value={form.id}>
                            {form.name} (v{form.version})
                        </option>
                    ))}
                </select>
            </div>

            {/* Field List & Metadata Panel */}
            {selectedForm && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Field List */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">Form Fields</h3>
                        <div className="space-y-2">
                            {selectedForm.fields?.map(field => (
                                <button
                                    key={field.id}
                                    onClick={() => setSelectedField(field)}
                                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                                        selectedField?.id === field.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="font-medium">{field.label}</div>
                                    <div className="text-sm text-gray-500 font-mono">
                                        {field.name}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Metadata Panel */}
                    <div className="lg:col-span-2">
                        {selectedField ? (
                            <FieldMetadataPanel
                                studyId={parseInt(studyId)}
                                formId={selectedForm.id}
                                fieldName={selectedField.name}
                                onSave={(metadata) => {
                                    console.log('Metadata saved:', metadata);
                                    // Optionally mark phase as complete
                                }}
                                onClose={() => setSelectedField(null)}
                            />
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-12 text-center text-gray-500">
                                Select a field to configure its metadata
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Phase Actions */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    ← Previous Phase
                </button>
                <button
                    onClick={() => onPhaseComplete('field-metadata')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Continue to SDV Planning →
                </button>
            </div>
        </div>
    );
};

export default FieldMetadataPhase;
```

#### `/study-design/phases/SdvPlanningPhase.jsx`
```javascript
import React from 'react';
import { useParams } from 'react-router-dom';
import SdvWorkflowComponent from '../../../study-design/metadata/SdvWorkflowComponent';

const SdvPlanningPhase = ({ study, onPhaseComplete }) => {
    const { studyId } = useParams();

    return (
        <div className="space-y-6">
            {/* Phase Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    SDV Workflow Planning
                </h2>
                <p className="text-gray-600">
                    Plan and configure Source Data Verification (SDV) workflows for your study.
                    Review SDV requirements and coverage percentages.
                </p>
            </div>

            {/* SDV Component */}
            <SdvWorkflowComponent studyId={parseInt(studyId)} />

            {/* Phase Actions */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    ← Previous Phase
                </button>
                <button
                    onClick={() => onPhaseComplete('sdv-planning')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Continue to Medical Coding →
                </button>
            </div>
        </div>
    );
};

export default SdvPlanningPhase;
```

#### `/study-design/phases/MedicalCodingPhase.jsx`
```javascript
import React from 'react';
import { useParams } from 'react-router-dom';
import MedicalCodingComponent from '../../../study-design/metadata/MedicalCodingComponent';

const MedicalCodingPhase = ({ study, onPhaseComplete }) => {
    const { studyId } = useParams();

    return (
        <div className="space-y-6">
            {/* Phase Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Medical Coding Configuration
                </h2>
                <p className="text-gray-600">
                    Configure MedDRA and WHO Drug medical coding for verbatim text fields.
                    Set up coding workflows, thresholds, and reviewer roles.
                </p>
            </div>

            {/* Medical Coding Component */}
            <MedicalCodingComponent studyId={parseInt(studyId)} />

            {/* Phase Actions */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    ← Previous Phase
                </button>
                <button
                    onClick={() => onPhaseComplete('medical-coding')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Continue to CDASH Mapping →
                </button>
            </div>
        </div>
    );
};

export default MedicalCodingPhase;
```

#### `/study-design/phases/CdashMappingPhase.jsx`
```javascript
import React from 'react';
import { useParams } from 'react-router-dom';
import CdashExportDialog from '../../../study-design/metadata/CdashExportDialog';

const CdashMappingPhase = ({ study, onPhaseComplete }) => {
    const { studyId } = useParams();

    return (
        <div className="space-y-6">
            {/* Phase Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    CDASH/SDTM Mapping
                </h2>
                <p className="text-gray-600">
                    Map study fields to CDISC standards (CDASH/SDTM) for regulatory submissions.
                    Review mappings completeness and export for define.xml generation.
                </p>
            </div>

            {/* CDASH Export Component */}
            <CdashExportDialog 
                studyId={parseInt(studyId)} 
                open={true}
                onClose={() => {}}
            />

            {/* Phase Actions */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    ← Previous Phase
                </button>
                <button
                    onClick={() => onPhaseComplete('cdash-mapping')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Continue to Compliance Review →
                </button>
            </div>
        </div>
    );
};

export default CdashMappingPhase;
```

#### `/study-design/phases/ComplianceReviewPhase.jsx`
```javascript
import React from 'react';
import { useParams } from 'react-router-dom';
import RegulatoryDashboard from '../../../study-design/metadata/RegulatoryDashboard';

const ComplianceReviewPhase = ({ study, onPhaseComplete }) => {
    const { studyId } = useParams();

    return (
        <div className="space-y-6">
            {/* Phase Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Regulatory Compliance Review
                </h2>
                <p className="text-gray-600">
                    Review overall regulatory compliance, SDV coverage, and metadata completeness.
                    Generate compliance reports for regulatory submissions.
                </p>
            </div>

            {/* Regulatory Dashboard */}
            <RegulatoryDashboard studyId={parseInt(studyId)} />

            {/* Phase Actions */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    ← Previous Phase
                </button>
                <button
                    onClick={() => onPhaseComplete('compliance-review')}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    Complete Metadata Configuration ✓
                </button>
            </div>
        </div>
    );
};

export default ComplianceReviewPhase;
```

### Step 3: Update StudyDesignModule.jsx Routes

Add routes for the new phases:

```javascript
// Add these routes after the 'forms' route and before 'review'
<Route path="study/:studyId/design/field-metadata" element={<FieldMetadataPhase />} />
<Route path="study/:studyId/design/sdv-planning" element={<SdvPlanningPhase />} />
<Route path="study/:studyId/design/medical-coding" element={<MedicalCodingPhase />} />
<Route path="study/:studyId/design/cdash-mapping" element={<CdashMappingPhase />} />
<Route path="study/:studyId/design/compliance-review" element={<ComplianceReviewPhase />} />
```

### Step 4: Update Phase Rendering Logic

Update the `renderPhaseContent()` function in StudyDesignDashboard.jsx:

```javascript
const renderPhaseContent = () => {
    // ... existing cases ...

    case 'field-metadata':
        return <FieldMetadataPhase study={study} onPhaseComplete={handlePhaseComplete} />;
    
    case 'sdv-planning':
        return <SdvPlanningPhase study={study} onPhaseComplete={handlePhaseComplete} />;
    
    case 'medical-coding':
        return <MedicalCodingPhase study={study} onPhaseComplete={handlePhaseComplete} />;
    
    case 'cdash-mapping':
        return <CdashMappingPhase study={study} onPhaseComplete={handlePhaseComplete} />;
    
    case 'compliance-review':
        return <ComplianceReviewPhase study={study} onPhaseComplete={handlePhaseComplete} />;
};
```

---

## 🎨 UI/UX Consistency

### Maintains Existing Patterns

1. **StudyContextHeader** - Shows study name, status, breadcrumbs
2. **NavigationSidebar** - Quick navigation and escape routes
3. **WorkflowProgressTracker** - Visual progress through phases
4. **PhaseTransitionHelper** - Smart assistance for phase transitions
5. **SmartWorkflowAssistant** - Contextual help and suggestions

### Visual Hierarchy

```
┌─────────────────────────────────────────────────────┐
│ StudyContextHeader (Study XYZ-123)                 │
├──────────┬──────────────────────────────────────────┤
│   Nav    │  Phase Content Area                      │
│ Sidebar  │  ┌────────────────────────────────────┐  │
│          │  │ Phase Header (Title, Description)  │  │
│  Phase   │  ├────────────────────────────────────┤  │
│  List    │  │                                    │  │
│          │  │  Phase 6F Component                │  │
│  ✓ Info  │  │  (FieldMetadataPanel, SDV, etc.)   │  │
│  ✓ Arms  │  │                                    │  │
│  ✓ Visits│  │                                    │  │
│  ✓ Forms │  ├────────────────────────────────────┤  │
│  ➤ Meta  │  │ Phase Actions (← Previous | Next →)│  │
│    SDV   │  └────────────────────────────────────┘  │
│    Coding│                                          │
│    CDASH │                                          │
│    Review│                                          │
└──────────┴──────────────────────────────────────────┘
```

---

## ✅ Benefits of This Integration Approach

1. **Consistent Experience** - Users follow same pattern for all study design phases
2. **Phase Tracking** - Progress automatically tracked and visualized
3. **Navigation** - Standard back/next buttons, sidebar navigation
4. **Help System** - Smart workflow assistant provides contextual help
5. **Validation** - Can enforce phase dependencies (e.g., field metadata before SDV planning)
6. **Audit Trail** - Phase completion tracked in design progress
7. **Responsive** - Works on all screen sizes with existing responsive framework
8. **Accessible** - Follows existing accessibility patterns

---

## 🚀 Implementation Timeline

| Task | Duration | Owner |
|------|----------|-------|
| Create phase wrapper components | 2 hours | Frontend |
| Update StudyDesignDashboard phases | 1 hour | Frontend |
| Add routes to StudyDesignModule | 30 min | Frontend |
| Test phase transitions | 1 hour | QA |
| Update documentation | 30 min | Tech Writer |

**Total: 5 hours**

---

## 📝 Testing Checklist

- [ ] Navigate through all phases in sequence
- [ ] Back button returns to previous phase
- [ ] Phase completion updates progress tracker
- [ ] Metadata saves correctly from each phase
- [ ] Navigation sidebar shows all phases
- [ ] Workflow assistant provides relevant help
- [ ] Phase dependencies enforced correctly
- [ ] Responsive design on mobile/tablet
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Integration with existing study design data

---

## 📚 Related Documentation

- `PHASE_6F_FRONTEND_IMPLEMENTATION_PLAN.md` - Component specifications
- `StudyDesignDashboard.jsx` - Main workflow orchestrator
- `StudyContextHeader.jsx` - Study context and breadcrumbs
- `WorkflowProgressTracker.jsx` - Phase progress visualization

---

**Status**: ✅ Ready for Implementation  
**Next Steps**: Create phase wrapper components and update StudyDesignDashboard
