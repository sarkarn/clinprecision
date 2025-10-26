import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Settings, Table, List, ChevronDown, ChevronUp, Eye, Edit3 } from 'lucide-react';
import FormService from 'services/FormService';
import StudyFormService from 'services/data-capture/StudyFormService';
import FormVersionService from 'services/data-capture/FormVersionService';
import ApiService from 'services/ApiService';
import { Alert } from '../../modules/trialdesign/components/UIComponents';

type FieldMetadata = Record<string, any>;

interface CRFField {
    id: string;
    name: string;
    label?: string;
    type: string;
    required?: boolean;
    metadata?: FieldMetadata;
    [key: string]: any;
}

interface CRFSection {
    id: string;
    name: string;
    title?: string;
    description?: string;
    type?: string;
    fields: CRFField[];
    metadata?: Record<string, any>;
    [key: string]: any;
}
interface CRFData {
    sections: CRFSection[];
    fields?: CRFField[];
}

interface SuccessMessage {
    title: string;
    message: string;
}

interface ErrorMessage {
    title: string;
    message: string;
}

interface FormTemplate {
    id: number | string;
    name: string;
    description?: string;
    type?: string;
    structure?: CRFData | string;
    fields?: CRFField[] | string;
    category?: string;
    complexity?: string;
    estimatedTime?: string;
    icon?: string;
    templateId?: string | number;
    [key: string]: any;
}

type MetadataTab = 'basic' | 'clinical' | 'standards' | 'coding' | 'quality' | 'regulatory' | 'export';

type SectionExpansionState = Record<string, boolean>;
type FieldMetadataVisibility = Record<string, boolean>;
type FieldMetadataTabState = Record<string, MetadataTab>;
type CodeListOptions = Record<string, string[]>;
type PreviewDataState = Record<string, any>;

interface RouteParams {
    formId?: string;
    versionId?: string;
    studyId?: string;
}

declare global {
    interface Window {
        lastFormCreationCall?: string;
    }
}

const CRFBuilderIntegration: React.FC = () => {
    const { formId, versionId, studyId } = useParams<RouteParams>();
    const navigate = useNavigate();

    // Determine if we're in study context
    const isStudyContext = !!studyId;
    const formService = isStudyContext ? StudyFormService : FormService;

    // DEBUG: Log URL parameters and context detection on component mount
    useEffect(() => {
        console.log('=== CRF BUILDER COMPONENT MOUNTED ===');
        console.log('URL Parameters extracted:', { formId, versionId, studyId });
        console.log('Context Detection Result:', {
            isStudyContext,
            studyIdExists: !!studyId,
            studyIdValue: studyId,
            studyIdType: typeof studyId
        });
        console.log('Selected service:', isStudyContext ? 'StudyFormService' : 'FormService');
        console.log('Current URL:', window.location.href);
        console.log('Current pathname:', window.location.pathname);
    }, [formId, versionId, studyId, isStudyContext]);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<any>(null);
    const [formVersion, setFormVersion] = useState<any>(null);
    const [saving, setSaving] = useState<boolean>(false);
    const [changes, setChanges] = useState<boolean>(false);
    const [expandedSections, setExpandedSections] = useState<SectionExpansionState>({});
    const [showFieldMetadata, setShowFieldMetadata] = useState<FieldMetadataVisibility>({});
    const [previewMode, setPreviewMode] = useState<boolean>(false);
    const [previewData, setPreviewData] = useState<PreviewDataState>({});
    const [activeMetadataTab, setActiveMetadataTab] = useState<FieldMetadataTabState>({});

    // Success message state
    const [successMessage, setSuccessMessage] = useState<SuccessMessage | null>(null);

    // Monitor successMessage state changes
    useEffect(() => {
        console.log('*** SUCCESS MESSAGE STATE CHANGED:', successMessage);
    }, [successMessage]);

    // Error message state
    const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);

    // Template selection for new forms
    const [showTemplateSelector, setShowTemplateSelector] = useState<boolean>(false);
    const [availableTemplates, setAvailableTemplates] = useState<FormTemplate[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
    const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

    // Code list categories for dropdown fields
    const [codeListCategories, setCodeListCategories] = useState<string[]>([]);
    const [loadingCategories, setLoadingCategories] = useState<boolean>(false);

    // Code list options cache for preview mode
    const [codeListOptions, setCodeListOptions] = useState<CodeListOptions>({});

    // CRF data would be loaded from or passed to the CRF Builder component
    const [crfData, setCrfData] = useState<CRFData>({ sections: [], fields: [] });

    // Fetch available code list categories on mount
    useEffect(() => {
        const fetchCodeListCategories = async () => {
            try {
                setLoadingCategories(true);
                const response = await ApiService.get('/clinops-ws/api/admin/codelists/categories');
                console.log('📦 Raw response from categories API:', response);

                // ApiService returns axios response, so data is in response.data
                const categories = response?.data || response;

                if (categories && Array.isArray(categories)) {
                    setCodeListCategories(categories);
                    console.log('✅ Loaded code list categories:', categories);
                } else {
                    console.warn('⚠️ Invalid response format for code list categories:', categories);
                    // Fallback to common categories
                    setCodeListCategories([
                        'COUNTRY', 'SEX', 'RACE', 'ETHNIC', 'VISIT_TYPE',
                        'SITE_STATUS', 'STUDY_PHASE', 'STUDY_STATUS'
                    ]);
                }
            } catch (error) {
                console.error('❌ Error fetching code list categories:', error);
                // Fallback to common categories if API fails
                setCodeListCategories([
                    'COUNTRY', 'SEX', 'RACE', 'ETHNIC', 'VISIT_TYPE',
                    'SITE_STATUS', 'STUDY_PHASE', 'STUDY_STATUS'
                ]);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCodeListCategories();
    }, []);

    useEffect(() => {
        const loadFormData = async () => {
            try {
                setLoading(true);
                setError(null);

                if (formId) {
                    // Load existing form using appropriate service
                    const formData = isStudyContext
                        ? await StudyFormService.getStudyFormById(formId)
                        : await FormService.getFormById(formId);
                    setForm(formData);

                    // Reconstruct CRF data from the form's fields and structure
                    let reconstructedCrfData: CRFData = {
                        sections: [],
                        fields: []
                    };

                    try {
                        // Parse the fields and structure from the backend
                        const fields = typeof formData.fields === 'string' ? JSON.parse(formData.fields) : formData.fields || [];
                        const structure = typeof formData.structure === 'string' ? JSON.parse(formData.structure) : formData.structure || {};

                        // Ensure fields have a 'name' property for compatibility with the form builder
                        const normalizedFields = fields.map(field => {
                            // Clean up options location - migrate from old to new format
                            const cleanedField = { ...field } as CRFField;

                            // If options are at root level (old format), move them to metadata
                            if (field.options && Array.isArray(field.options) && field.options.length > 0) {
                                console.log(`🔧 Migrating options for field ${field.id || field.name} from root to metadata`);
                                if (!cleanedField.metadata) {
                                    cleanedField.metadata = {};
                                }
                                // Move options to metadata if not already there or if metadata.options is empty
                                if (!cleanedField.metadata.options || cleanedField.metadata.options.length === 0) {
                                    cleanedField.metadata.options = field.options;
                                }
                                // Remove from root level
                                delete (cleanedField as any).options;
                            }

                            return {
                                ...cleanedField,
                                name: cleanedField.name || cleanedField.id // Use 'id' as 'name' if 'name' doesn't exist
                            };
                        });

                        console.log('Loaded form data:', { formData, fields: normalizedFields, structure });
                        console.log('Reconstructing CRF data...');

                        if (structure.sections && Array.isArray(structure.sections)) {
                            // Reconstruct sections with their fields
                            reconstructedCrfData.sections = structure.sections.map((section: any, sectionIndex: number) => {
                                // Populate fields for the section
                                const populatedFields = (section.fields || []).map((fieldRef: any) => {
                                    if (typeof fieldRef === 'string') {
                                        return normalizedFields.find(field => field.id === fieldRef || field.name === fieldRef);
                                    }
                                    return fieldRef;
                                }).filter((field): field is CRFField => !!field);

                                return {
                                    ...section,
                                    id: section.id || `section-${sectionIndex + 1}`,
                                    name: section.name || `Section ${sectionIndex + 1}`,
                                    description: section.description || '',
                                    type: section.type || 'regular',
                                    fields: populatedFields,
                                    metadata: {
                                        isRequired: section.metadata?.isRequired ?? false,
                                        helpText: section.metadata?.helpText ?? '',
                                        displayOrder: section.metadata?.displayOrder ?? sectionIndex + 1
                                    }
                                };
                            });
                        } else if (Array.isArray(structure)) {
                            reconstructedCrfData.sections = structure;
                        }

                        // Include any top-level fields
                        if (structure.fields && Array.isArray(structure.fields)) {
                            reconstructedCrfData.fields = structure.fields;
                        } else {
                            reconstructedCrfData.fields = normalizedFields;
                        }

                        // Final safety check: if we have no sections with fields, but we have fields, create a default section
                        const totalFieldsInSections = reconstructedCrfData.sections.reduce((count, section) => count + (section.fields?.length || 0), 0);
                        if (totalFieldsInSections === 0 && normalizedFields && normalizedFields.length > 0) {
                            console.log('⚠️ No fields found in sections after reconstruction, creating fallback section');
                            reconstructedCrfData.sections = [{
                                id: 'fallback_section',
                                name: 'Form Fields',
                                description: 'Fallback section containing all available fields',
                                type: 'regular',
                                fields: normalizedFields,
                                metadata: {
                                    isRequired: false,
                                    helpText: '',
                                    displayOrder: 1
                                }
                            }];
                        }
                    } catch (parseError) {
                        console.warn('Error parsing form data, using default structure:', parseError);
                        // If parsing fails, create empty structure
                        reconstructedCrfData = {
                            sections: [],
                            fields: []
                        };
                    }

                    console.log('Final reconstructed CRF data:', reconstructedCrfData);
                    setCrfData(reconstructedCrfData);
                } else {
                    // New form - show template selector first
                    console.log('*** NEW FORM: Loading templates and showing selector...');
                    await loadTemplates();
                    console.log('*** NEW FORM: Templates loaded, setting showTemplateSelector to true');
                    setShowTemplateSelector(true);
                    // Initialize with empty CRF data for now
                    setCrfData({
                        sections: [],
                        fields: []
                    });
                    console.log('*** NEW FORM: Template selector should now be visible');
                }

                setLoading(false);
            } catch (err) {
                console.error("Error loading form data:", err);
                const errorMessage = err.response && err.response.status === 404
                    ? `Form not found (ID: ${formId}). The form may have been deleted or you may not have permission to access it.`
                    : `Failed to load form data: ${err.message || 'Unknown error'}. Please try again.`;
                setError(errorMessage);
                setLoading(false);
            }
        };

        loadFormData();
    }, [formId, versionId]);

    // Handle updates from the CRF Builder
    const handleCrfDataUpdate = (newData: CRFData) => {
        setCrfData(newData);
        setChanges(true);
    };

    // Load available templates
    const loadTemplates = async (): Promise<void> => {
        try {
            setLoadingTemplates(true);
            // Always use FormService for templates since they're now managed in Admin module
            console.log('Loading templates from admin-ws via FormService.getForms()...');
            const templates = await FormService.getForms();
            console.log('Loaded templates:', templates?.length || 0, 'templates');
            setAvailableTemplates((templates as FormTemplate[]) || []);
        } catch (err) {
            console.error("Error loading templates:", err);
            setAvailableTemplates([]);
        } finally {
            setLoadingTemplates(false);
        }
    };

    // Handle template selection
    const handleTemplateSelect = async (template: FormTemplate | null) => {
        console.log('*** handleTemplateSelect called with template:', template);
        try {
            setSelectedTemplate(template);
            setShowTemplateSelector(false);
            console.log('*** handleTemplateSelect: Modal closed, selectedTemplate set to:', template?.id || 'null');

            if (template) {
                console.log('*** handleTemplateSelect: Processing template data...');
                console.log('*** Template structure (raw):', template.structure);
                console.log('*** Template fields (raw):', template.fields);

                // Parse structure and fields if they are JSON strings
                let parsedStructure: CRFData | undefined = (template.structure as CRFData) || undefined;
                let parsedFields: CRFField[] | undefined = (template.fields as CRFField[]) || undefined;

                if (typeof template.structure === 'string') {
                    try {
                        parsedStructure = JSON.parse(template.structure) as CRFData;
                        console.log('*** Parsed structure from JSON string:', parsedStructure);
                    } catch (e) {
                        console.error('*** Error parsing structure JSON:', e);
                        parsedStructure = { sections: [], fields: [] };
                    }
                }

                if (typeof template.fields === 'string') {
                    try {
                        parsedFields = JSON.parse(template.fields) as CRFField[];
                        console.log('*** Parsed fields from JSON string:', parsedFields);
                    } catch (e) {
                        console.error('*** Error parsing fields JSON:', e);
                        parsedFields = [];
                    }
                }

                // Initialize form with template data
                setCrfData(parsedStructure || {
                    sections: [],
                    fields: []
                });
                console.log('*** handleTemplateSelect: CRF data set from template structure');

                // Pre-populate form metadata with unique name
                const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '');
                const uniqueName = `${template.name} - Copy ${timestamp}`;
                console.log('*** handleTemplateSelect: Generated unique name:', uniqueName);

                const formData = {
                    name: uniqueName,
                    description: template.description || `Copy of ${template.name}`,
                    type: template.type,
                    templateId: template.id
                };

                setForm(formData);
                console.log('*** handleTemplateSelect: Form metadata set:', formData);

                // Template applied successfully - ready for user to save manually
                console.log('*** handleTemplateSelect: Template applied successfully');

            } else {
                console.log('*** handleTemplateSelect: Starting from scratch (no template)');
                // Start from scratch
                setCrfData({
                    sections: [],
                    fields: []
                });
                setForm(null);
            }

            setLoading(false);
            console.log('*** handleTemplateSelect: Template selection completed');
        } catch (err) {
            console.error("*** handleTemplateSelect: Error applying template:", err);
            setError("Failed to apply template. Please try again.");
            setLoading(false);
        }
    };

    // Save form (create new or update existing)
    const handleSaveForm = async (
        formMetadata?: Partial<{ name: string; description: string; type: string; version: string; status: string; }>
    ): Promise<void> => {
        try {
            setSaving(true);
            setError(null);

            console.log('=== CRF BUILDER SAVE FORM DEBUG ===');
            console.log('URL Parameters:', { formId, studyId, versionId });
            console.log('Context Detection:', { isStudyContext, studyId });
            console.log('Form metadata received:', formMetadata);

            const formData: Record<string, any> = {
                name: formMetadata?.name || form?.name || 'Untitled Form',
                description: formMetadata?.description || form?.description || '',
                type: formMetadata?.type || form?.type || 'General',
                version: formMetadata?.version || '1.0',
                status: formMetadata?.status || 'Draft',
                formDefinition: JSON.stringify(crfData),
                fields: JSON.stringify(crfData?.fields || []),
                templateId: form?.templateId || null
            };

            console.log('Base form data prepared:', formData);

            let savedForm: any;
            if (formId) {
                console.log('=== UPDATING EXISTING FORM ===');
                console.log('Form ID:', formId);
                // Update existing form using appropriate service
                if (isStudyContext) {
                    console.log('Using StudyFormService.updateStudyForm()');
                    savedForm = await StudyFormService.updateStudyForm(formId, formData);
                } else {
                    console.log('Using FormService.updateForm()');
                    savedForm = await FormService.updateForm(formId, formData);
                }
            } else {
                console.log('=== CREATING NEW FORM ===');
                console.log('Evaluating context condition: isStudyContext && studyId');
                console.log('isStudyContext =', isStudyContext, '(type:', typeof isStudyContext, ')');
                console.log('studyId =', studyId, '(type:', typeof studyId, ')');
                console.log('Condition result:', isStudyContext && studyId);

                // Create new form using appropriate service
                if (isStudyContext && studyId) {
                    console.log('*** CONDITION TRUE: STUDY CONTEXT PATH ***');
                    console.log('STUDY CONTEXT DETECTED - Creating study-specific form');
                    console.log('studyId value:', studyId, 'type:', typeof studyId);
                    console.log('isStudyContext value:', isStudyContext);

                    // EXPLICIT CHECK: If we're in study context, DO NOT call FormService
                    if (!isStudyContext || !studyId) {
                        throw new Error('CRITICAL ERROR: Study context detected but missing studyId or isStudyContext is false');
                    }

                    const studyFormData = {
                        ...formData,
                        studyId: parseInt(studyId)
                    };
                    console.log('Study form data being sent:', studyFormData);
                    console.log('*** CALLING StudyFormService.createStudyForm() ***');
                    console.log('API endpoint should be: /study-design-ws/api/form-definitions');
                    console.log('Expected backend controller: FormDefinitionController');

                    // Add a marker to track this call
                    window.lastFormCreationCall = 'StudyFormService.createStudyForm';
                    savedForm = await StudyFormService.createStudyForm(studyFormData);
                } else {
                    console.log('*** CONDITION FALSE: LIBRARY CONTEXT PATH ***');
                    console.log('LIBRARY CONTEXT DETECTED - Creating library/template form');
                    console.log('studyId value:', studyId, 'isStudyContext:', isStudyContext);
                    console.log('*** CALLING FormService.createForm() ***');
                    console.log('API endpoint should be: /admin-ws/api/form-templates (updated path)');
                    console.log('Expected backend controller: FormTemplateController');

                    // Add a marker to track this call
                    window.lastFormCreationCall = 'FormService.createForm';
                    savedForm = await FormService.createForm(formData);
                }
            }

            setForm(savedForm);
            setChanges(false);

            console.log('=== FORM SAVE SUCCESSFUL ===');
            console.log('Saved form response:', savedForm);
            console.log('Form saved to:', isStudyContext ? 'STUDY-SPECIFIC' : 'LIBRARY');

            // Show success message for manual save
            console.log('*** SETTING SUCCESS MESSAGE ***');
            setSuccessMessage({
                title: 'Success!',
                message: `Form "${savedForm.name || formData.name}" has been saved successfully!`
            });
            console.log('*** SUCCESS MESSAGE SET - Should be visible now ***');

            // Auto-dismiss after 5 seconds (increased from 3)
            window.setTimeout(() => {
                console.log('*** AUTO-DISMISSING SUCCESS MESSAGE ***');
                setSuccessMessage(null);
            }, 5000);

            // For new forms, update the URL without navigation to avoid reload
            if (!formId) {
                // Update the URL to reflect the new form ID without causing navigation
                const builderPath = isStudyContext
                    ? `/study-design/study/${studyId}/forms/builder/${savedForm.id}`
                    : `/study-design/forms/builder/${savedForm.id}`;

                console.log('Updating URL to:', builderPath);

                // Use window.history.replaceState to update URL without reload
                window.history.replaceState(null, '', builderPath);

                // The component will continue working with the savedForm data we already have
                // No need to reload or re-fetch the form data
            }

        } catch (err) {
            console.error('Error saving form:', err);
            setError(`Failed to save form: ${err.message || 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    // Cancel form creation/editing
    const handleCancel = () => {
        if (changes && !window.confirm('Are you sure you want to discard your changes?')) {
            return;
        }
        const formListPath = isStudyContext
            ? `/study-design/study/${studyId}/forms`
            : '/study-design/forms';
        navigate(formListPath);
    };

    // Toggle section expansion
    const toggleSectionExpansion = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Toggle field metadata visibility
    const toggleFieldMetadata = (fieldId) => {
        setShowFieldMetadata(prev => ({
            ...prev,
            [fieldId]: !prev[fieldId]
        }));
        // Set default active tab when opening metadata
        if (!showFieldMetadata[fieldId]) {
            setActiveMetadataTab(prev => ({
                ...prev,
                [fieldId]: 'basic'
            }));
        }
    };

    // Set active metadata tab
    const setMetadataTab = (fieldId: string, tab: MetadataTab) => {
        setActiveMetadataTab(prev => ({
            ...prev,
            [fieldId]: tab
        }));
    };

    // Create new section
    const createSection = (type: 'regular' | 'table' = 'regular') => {
        const newSection: CRFSection = {
            id: `section_${Date.now()}`,
            name: 'New Section',
            type: type, // 'regular' or 'table'
            description: '',
            fields: [],
            metadata: {
                isRequired: false,
                helpText: '',
                displayOrder: (crfData.sections?.length || 0) + 1
            }
        };
        const updatedData: CRFData = {
            ...crfData,
            sections: [...(crfData.sections || []), newSection]
        };
        handleCrfDataUpdate(updatedData);
        setExpandedSections(prev => ({ ...prev, [newSection.id]: true }));
    };

    // Create new field
    const createField = (sectionIndex: number, section: CRFSection) => {
        const newField: CRFField = {
            id: `field_${Date.now()}`,
            name: 'New Field',
            label: 'New Field Label',
            type: 'text',
            required: false,
            metadata: {
                // Basic Field Metadata
                description: '',
                helpText: '',
                placeholder: '',
                validation: {
                    minLength: '',
                    maxLength: '',
                    pattern: '',
                    min: '',
                    max: '',
                    errorMessage: ''
                },
                options: [], // For select, radio, checkbox fields
                defaultValue: '',
                displayOrder: (section.fields?.length || 0) + 1,
                fieldWidth: 'full', // full, half, third, quarter
                isReadOnly: false,
                isCalculated: false,
                calculationFormula: '',
                conditionalLogic: {
                    showIf: '',
                    hideIf: '',
                    requiredIf: ''
                },

                // Clinical Data Management Metadata
                clinicalMetadata: {
                    // Data Review Flags
                    sdvFlag: false, // Source Data Verification required
                    medicalReviewFlag: false, // Medical Review required
                    dataReviewFlag: false, // Data Management Review required

                    // Regulatory & Standards Mappings
                    cdashMapping: {
                        domain: '', // e.g., 'DM', 'AE', 'VS', 'LB'
                        variable: '', // CDASH variable name
                        implementation: '', // Implementation notes
                        core: 'Permissible', // Required, Expected, Permissible
                        dataType: 'text' // text, integer, float, date, datetime, time
                    },

                    sdtmMapping: {
                        domain: '', // SDTM domain
                        variable: '', // SDTM variable name
                        dataType: 'Char', // Char, Num, Date, DateTime, Time
                        length: '', // Variable length
                        significance: '', // Significant digits for numeric
                        format: '', // Display format
                        codelist: '', // Controlled terminology codelist
                        origin: 'CRF', // CRF, Derived, Assigned, Protocol, Predecessor
                        role: '', // Identifier, Topic, Grouping, Timing, etc.
                        comment: ''
                    },

                    // Medical Coding
                    medicalCoding: {
                        meddraRequired: false,
                        meddraLevel: '', // LLT, PT, HLT, HLGT, SOC
                        whodrugRequired: false,
                        icd10Required: false,
                        icd11Required: false,
                        customDictionary: '',
                        autoCodeFlag: false,
                        manualReviewRequired: false
                    },

                    // Data Quality & Validation
                    dataQuality: {
                        criticalDataPoint: false, // CDP flag
                        keyDataPoint: false, // KDP flag
                        primaryEndpoint: false,
                        secondaryEndpoint: false,
                        safetyVariable: false,
                        efficacyVariable: false,
                        queryGeneration: 'Auto', // Auto, Manual, None
                        rangeCheckType: 'Soft', // Hard, Soft, None
                        missingDataAcceptable: false,
                        nullFlavor: '', // Not Applicable, Unknown, etc.
                        dataEntryMethod: 'Single', // Single, Double, Import

                        // Edit Checks
                        editChecks: [],

                        // Reference Data
                        referenceRange: {
                            low: '',
                            high: '',
                            unit: '',
                            ageGroup: '',
                            gender: ''
                        }
                    },

                    // Regulatory Requirements
                    regulatoryMetadata: {
                        fdaRequired: false,
                        emaRequired: false,
                        ich: false, // ICH compliance required
                        gcp: false, // GCP compliance required
                        part11: false, // 21 CFR Part 11 compliance
                        auditTrail: true, // Audit trail required
                        electronicSignature: false,
                        reasonForChange: false, // Require reason for change

                        // Submission Requirements
                        submissionDataset: '', // Dataset for submission
                        submissionVariable: '', // Variable name in submission
                        derivationMethod: '', // How data is derived/calculated
                        precedence: 1 // Order of operations for derived fields
                    },

                    // Business Rules
                    businessRules: {
                        dataEntryWindow: {
                            enabled: false,
                            windowDays: 0,
                            baseDate: '' // Study start, subject enrollment, etc.
                        },
                        freezePoint: '', // Point at which data is frozen
                        lockPoint: '', // Point at which data is locked
                        archiveRequired: false,
                        retentionPeriod: '', // Data retention period

                        // Visit/Timepoint Association
                        visitAssociation: '',
                        timepointWindow: '',
                        scheduledTimepoint: '',

                        // Data Integration
                        externalDataSource: '', // Lab, ECG, etc.
                        integrationMethod: '', // API, File, Manual
                        transformationRequired: false
                    },

                    // Study-Specific Metadata
                    studyMetadata: {
                        therapeutic: '', // Therapeutic area
                        indication: '', // Medical indication
                        phase: '', // Study phase
                        blinding: '', // Open, Single, Double
                        population: '', // Target population

                        // Protocol References
                        protocolSection: '', // Protocol section reference
                        protocolPage: '', // Protocol page number
                        protocolAmendment: '', // Amendment version

                        // Statistical Considerations
                        statisticalTest: '', // Planned statistical test
                        analysisPopulation: '', // ITT, PP, Safety
                        imputationMethod: '', // For missing data
                        multiplicity: false // Multiple comparisons
                    }
                }
            }
        };

        const updatedSections = [...crfData.sections];
        updatedSections[sectionIndex] = {
            ...section,
            fields: [...(section.fields || []), newField]
        };
        handleCrfDataUpdate({ ...crfData, sections: updatedSections });
        setShowFieldMetadata(prev => ({ ...prev, [newField.id]: false }));
    };

    // Update section
    const updateSection = (sectionIndex: number, updates: Partial<CRFSection>) => {
        const updatedSections = [...crfData.sections];
        updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], ...updates };
        handleCrfDataUpdate({ ...crfData, sections: updatedSections });
    };

    // Update field
    const updateField = (sectionIndex: number, fieldIndex: number, updates: Partial<CRFField>) => {
        const updatedSections = [...crfData.sections];
        const updatedFields = [...updatedSections[sectionIndex].fields];
        const currentField = updatedFields[fieldIndex];
        const mergedField: CRFField = {
            ...currentField,
            ...updates,
            ...(updates.metadata
                ? { metadata: { ...(currentField.metadata ?? {}), ...updates.metadata } }
                : {})
        };

        updatedFields[fieldIndex] = mergedField;
        updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], fields: updatedFields };
        handleCrfDataUpdate({ ...crfData, sections: updatedSections });
    };

    // Remove section
    const removeSection = (sectionIndex: number) => {
        const updatedSections = crfData.sections.filter((_, i) => i !== sectionIndex);
        handleCrfDataUpdate({ ...crfData, sections: updatedSections });
    };

    // Remove field
    const removeField = (sectionIndex: number, fieldIndex: number) => {
        const updatedSections = [...crfData.sections];
        const updatedFields = updatedSections[sectionIndex].fields.filter((_, i) => i !== fieldIndex);
        updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], fields: updatedFields };
        handleCrfDataUpdate({ ...crfData, sections: updatedSections });
    };

    // Toggle preview mode
    const togglePreviewMode = () => {
        const newPreviewMode = !previewMode;
        setPreviewMode(newPreviewMode);

        // Load code list options when entering preview mode
        if (newPreviewMode) {
            loadCodeListOptionsForPreview();
        }
    };

    // Load all code list options needed for preview
    const loadCodeListOptionsForPreview = async (): Promise<void> => {
        const optionsCache: CodeListOptions = {};
        const categoriesToLoad = new Set<string>();

        // Find all fields that use code lists
        crfData?.sections?.forEach(section => {
            section.fields?.forEach(field => {
                if (field.metadata?.codeListCategory) {
                    categoriesToLoad.add(field.metadata.codeListCategory as string);
                }
            });
        });

        // Load options for each category
        for (const category of categoriesToLoad) {
            try {
                const response = await ApiService.get(`/clinops-ws/api/admin/codelists/simple/${category}`);
                const options = response?.data || response;

                if (options && Array.isArray(options)) {
                    // Transform to simple array of strings for compatibility
                    optionsCache[category] = options
                        .map((opt: any) => opt?.name || opt?.label || opt?.code || opt?.value)
                        .filter((value: any): value is string => typeof value === 'string');
                    console.log(`✅ Loaded ${optionsCache[category].length} options for ${category}`);
                }
            } catch (error) {
                console.error(`❌ Error loading options for ${category}:`, error);
                optionsCache[category] = [];
            }
        }

        setCodeListOptions(optionsCache);
    };

    // Handle preview form data changes
    const handlePreviewDataChange = (fieldId: string, value: any) => {
        setPreviewData(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    // Export field metadata - Phase 6F Enhancement
    const exportFieldMetadata = (field: CRFField, format: 'json' | 'csv' | 'excel') => {
        const metadata = {
            fieldName: field.name || field.id,
            fieldLabel: field.label,
            fieldType: field.type,
            required: field.required,
            description: field.metadata?.description,
            helpText: field.metadata?.helpText,
            clinicalMetadata: {
                sdvRequired: field.metadata?.clinicalMetadata?.sdvFlag || false,
                medicalReview: field.metadata?.clinicalMetadata?.medicalReviewFlag || false,
                cdashMapping: field.metadata?.clinicalMetadata?.cdashMapping ?? {},
                sdtmMapping: field.metadata?.clinicalMetadata?.sdtmMapping ?? {},
                medicalCoding: field.metadata?.clinicalMetadata?.medicalCoding ?? {},
                dataQuality: field.metadata?.clinicalMetadata?.dataQuality ?? {},
                regulatoryMetadata: field.metadata?.clinicalMetadata?.regulatoryMetadata ?? {}
            },
            validation: field.validation || {}
        };

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${field.name || field.id}_metadata.json`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (format === 'csv') {
            const csvRows = [
                ['Field Name', 'Field Label', 'Type', 'Required', 'SDV', 'Medical Review', 'CDASH Domain', 'SDTM Domain', 'Medical Coding'],
                [
                    field.name || field.id,
                    field.label,
                    field.type,
                    field.required ? 'Yes' : 'No',
                    metadata.clinicalMetadata.sdvRequired ? 'Yes' : 'No',
                    metadata.clinicalMetadata.medicalReview ? 'Yes' : 'No',
                    metadata.clinicalMetadata.cdashMapping?.domain || '',
                    metadata.clinicalMetadata.sdtmMapping?.domain || '',
                    metadata.clinicalMetadata.medicalCoding?.meddraRequired ? 'MedDRA' : 'No'
                ]
            ];
            const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${field.name || field.id}_metadata.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } else if (format === 'excel') {
            // For Excel, we'll use CSV format which Excel can open
            // In a production app, you'd use a library like xlsx
            exportFieldMetadata(field, 'csv');
        }
    };

    // Export all fields metadata in a section
    const exportAllFieldsMetadata = (section: CRFSection) => {
        const allMetadata = section.fields.map(field => ({
            fieldName: field.name || field.id,
            fieldLabel: field.label,
            fieldType: field.type,
            required: field.required,
            sdvRequired: field.metadata?.clinicalMetadata?.sdvFlag || false,
            medicalReview: field.metadata?.clinicalMetadata?.medicalReviewFlag || false,
            cdashDomain: field.metadata?.clinicalMetadata?.cdashMapping?.domain || '',
            cdashVariable: field.metadata?.clinicalMetadata?.cdashMapping?.variable || '',
            sdtmDomain: field.metadata?.clinicalMetadata?.sdtmMapping?.domain || '',
            sdtmVariable: field.metadata?.clinicalMetadata?.sdtmMapping?.variable || '',
            medicalCoding: field.metadata?.clinicalMetadata?.medicalCoding?.meddraRequired ? 'MedDRA' : '',
            fdaRequired: field.metadata?.clinicalMetadata?.regulatoryMetadata?.fdaRequired || false,
            emaRequired: field.metadata?.clinicalMetadata?.regulatoryMetadata?.emaRequired || false
        }));

        const csvRows = [
            ['Field Name', 'Field Label', 'Type', 'Required', 'SDV', 'Medical Review', 'CDASH Domain', 'CDASH Variable', 'SDTM Domain', 'SDTM Variable', 'Medical Coding', 'FDA', 'EMA']
        ];

        allMetadata.forEach(field => {
            csvRows.push([
                field.fieldName,
                field.fieldLabel,
                field.fieldType,
                field.required ? 'Yes' : 'No',
                field.sdvRequired ? 'Yes' : 'No',
                field.medicalReview ? 'Yes' : 'No',
                field.cdashDomain,
                field.cdashVariable,
                field.sdtmDomain,
                field.sdtmVariable,
                field.medicalCoding,
                field.fdaRequired ? 'Yes' : 'No',
                field.emaRequired ? 'Yes' : 'No'
            ]);
        });

        const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${section.title}_all_fields_metadata.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Render field input based on type
    const renderFieldInput = (
        field: CRFField,
        value: any,
        onChange: (fieldId: string, fieldValue: any) => void,
        disabled = false
    ): React.ReactNode => {
        const fieldClasses = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
        const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";

        switch (field.type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'url':
                return (
                    <input
                        type={field.type}
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.metadata?.placeholder || ''}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                        minLength={field.metadata?.validation?.minLength}
                        maxLength={field.metadata?.validation?.maxLength}
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.metadata?.placeholder || ''}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                        min={field.metadata?.validation?.min}
                        max={field.metadata?.validation?.max}
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                    />
                );

            case 'datetime':
                return (
                    <input
                        type="datetime-local"
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                    />
                );

            case 'time':
                return (
                    <input
                        type="time"
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.metadata?.placeholder || ''}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                        rows={4}
                        minLength={field.metadata?.validation?.minLength}
                        maxLength={field.metadata?.validation?.maxLength}
                    />
                );

            case 'select':
                // Check if using code list or manual options
                const selectOptions = field.metadata?.codeListCategory
                    ? codeListOptions[field.metadata.codeListCategory] || []
                    : (field.metadata?.options as any[]) || [];

                return (
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                    >
                        <option value="">
                            {field.metadata?.codeListCategory && selectOptions.length === 0
                                ? `Loading ${field.metadata.codeListCategory}...`
                                : '-- Select an option --'}
                        </option>
                        {selectOptions.map((option, index) => {
                            const optionValue = typeof option === 'string' ? option : option?.value ?? option?.label ?? '';
                            const optionLabel = typeof option === 'string' ? option : option?.label ?? optionValue;
                            return (
                                <option key={index} value={optionValue}>{optionLabel}</option>
                            );
                        })}
                    </select>
                );

            case 'multiselect':
                // Check if using code list or manual options
                const multiselectOptions = field.metadata?.codeListCategory
                    ? codeListOptions[field.metadata.codeListCategory] || []
                    : (field.metadata?.options as any[]) || [];

                return (
                    <select
                        multiple
                        value={Array.isArray(value) ? value : []}
                        onChange={(e) => {
                            const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                            onChange(field.id, selectedValues);
                        }}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                        size={Math.min(multiselectOptions.length || 3, 5)}
                    >
                        {multiselectOptions.map((option, index) => {
                            const optionValue = typeof option === 'string' ? option : option?.value ?? option?.label ?? '';
                            const optionLabel = typeof option === 'string' ? option : option?.label ?? optionValue;
                            return (
                                <option key={index} value={optionValue}>{optionLabel}</option>
                            );
                        })}
                    </select>
                );

            case 'radio':
                // Check if using code list or manual options
                const radioOptions = field.metadata?.codeListCategory
                    ? codeListOptions[field.metadata.codeListCategory] || []
                    : (field.metadata?.options as any[]) || [];

                return (
                    <div className="space-y-2">
                        {radioOptions.map((option, index) => {
                            const optionValue = typeof option === 'string' ? option : option?.value ?? option?.label ?? '';
                            const optionLabel = typeof option === 'string' ? option : option?.label ?? optionValue;
                            return (
                                <label key={index} className="flex items-center">
                                    <input
                                        type="radio"
                                        name={field.id}
                                        value={optionValue}
                                        checked={value === optionValue}
                                        onChange={(e) => onChange(field.id, e.target.value)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        disabled={disabled || field.metadata?.isReadOnly}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">{optionLabel}</span>
                                </label>
                            );
                        })}
                    </div>
                );

            case 'checkbox':
                // Check if using code list or manual options
                const checkboxOptions = field.metadata?.codeListCategory
                    ? codeListOptions[field.metadata.codeListCategory] || []
                    : (field.metadata?.options as any[]) || [];

                if (checkboxOptions.length > 0) {
                    // Multiple checkboxes
                    return (
                        <div className="space-y-2">
                            {checkboxOptions.map((option, index) => {
                                const optionValue = typeof option === 'string' ? option : option?.value ?? option?.label ?? '';
                                const optionLabel = typeof option === 'string' ? option : option?.label ?? optionValue;
                                return (
                                    <label key={index} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            value={optionValue}
                                            checked={Array.isArray(value) && value.includes(optionValue)}
                                            onChange={(e) => {
                                                const currentValues = Array.isArray(value) ? value : [];
                                                const newValues = e.target.checked
                                                    ? [...currentValues, optionValue]
                                                    : currentValues.filter(v => v !== optionValue);
                                                onChange(field.id, newValues);
                                            }}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            disabled={disabled || field.metadata?.isReadOnly}
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{optionLabel}</span>
                                    </label>
                                );
                            })}
                        </div>
                    );
                } else {
                    // Single checkbox
                    return (
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={!!value}
                                onChange={(e) => onChange(field.id, e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                disabled={disabled || field.metadata?.isReadOnly}
                            />
                            <span className="ml-2 text-sm text-gray-700">{field.label || field.name}</span>
                        </label>
                    );
                }

            case 'file':
                return (
                    <input
                        type="file"
                        onChange={(e) => onChange(field.id, e.target.files[0]?.name || '')}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                    />
                );

            default:
                return (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(field.id, e.target.value)}
                        placeholder={field.metadata?.placeholder || ''}
                        className={`${fieldClasses} ${disabledClasses}`}
                        disabled={disabled || field.metadata?.isReadOnly}
                    />
                );
        }
    };

    // Get field width class
    const getFieldWidthClass = (width?: string): string => {
        switch (width) {
            case 'half': return 'col-span-6';
            case 'third': return 'col-span-4';
            case 'quarter': return 'col-span-3';
            default: return 'col-span-12';
        }
    };

    // Render preview section
    const renderPreviewSection = (section: CRFSection): React.ReactElement => {
        if (section.type === 'table' && section.fields?.length > 0) {
            return (
                <div className="mb-8">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                        {section.description && (
                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                        )}
                    </div>

                    <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {section.fields.map((field) => (
                                        <th key={field.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {field.label || field.name}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                            {field.metadata?.helpText && (
                                                <div className="text-xs text-gray-400 mt-1 font-normal normal-case">
                                                    {field.metadata.helpText}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                    {section.fields.map((field) => (
                                        <td key={field.id} className="px-6 py-4 whitespace-nowrap">
                                            {renderFieldInput(field, previewData[field.id], handlePreviewDataChange)}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        } else {
            // Regular section
            return (
                <div className="mb-8">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
                        {section.description && (
                            <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                        )}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="grid grid-cols-12 gap-4">
                            {section.fields?.map((field) => (
                                <div key={field.id} className={getFieldWidthClass(field.metadata?.fieldWidth)}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {field.label || field.name}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>

                                    {renderFieldInput(field, previewData[field.id], handlePreviewDataChange)}

                                    {field.metadata?.helpText && (
                                        <p className="text-xs text-gray-500 mt-1">{field.metadata.helpText}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
    };

    // Save form changes
    const handleSave = async (): Promise<void> => {
        console.log('*** handleSave: Starting save operation ***');
        console.log('*** handleSave: Context - isStudyContext:', isStudyContext, 'studyId:', studyId);
        console.log('*** handleSave: formId:', formId, 'form:', form);
        console.log('*** handleSave: crfData sections:', crfData?.sections?.length || 0);

        // Prevent duplicate calls if already saving
        if (saving) {
            console.log('*** handleSave: BLOCKED - Save operation already in progress');
            return;
        }

        try {
            setSaving(true);
            console.log('*** handleSave: Set saving to true ***');

            // Extract fields from sections for the fields property
            const allFields: CRFField[] = [];
            crfData?.sections?.forEach(section => {
                if (section.fields && Array.isArray(section.fields)) {
                    allFields.push(...section.fields);
                }
            });
            console.log('*** handleSave: Extracted fields:', allFields.length, 'total fields');
            console.log('*** handleSave: DETAILED FIELD INSPECTION ***');
            allFields.forEach((field, idx) => {
                console.log(`Field ${idx} (${field.fieldName}):`, {
                    type: field.fieldType,
                    hasMetadata: !!field.metadata,
                    metadataOptions: field.metadata?.options,
                    metadataUiConfigOptions: field.metadata?.uiConfig?.options,
                    rootOptions: field.options,
                    fullField: field
                });
            });

            // Create structure object (organized layout information)
            const structureData: Record<string, any> = {
                sections: crfData?.sections?.map(section => ({
                    id: section.id,
                    name: section.name,
                    description: section.description,
                    type: section.type,
                    fields: section.fields?.map(field => field.id) || [], // Only field IDs in structure
                    metadata: section.metadata
                })) || [],
                layout: {
                    type: "sections",
                    orientation: "vertical",
                    spacing: "normal"
                }
            };
            console.log('*** handleSave: Created structure data:', structureData);

            if (!formId) {
                console.log('*** handleSave: Creating new form ***');
                console.log('Context check: isStudyContext =', isStudyContext, ', studyId =', studyId);

                // Create new form
                const newFormData: Record<string, any> = {
                    name: form?.name || "New Form",
                    description: form?.description || "Form created with CRF Builder",
                    category: form?.type || form?.category || "Custom", // Map type to category
                    version: "1.0",
                    isLatestVersion: true,
                    status: "DRAFT", // Ensure uppercase enum value
                    fields: JSON.stringify(allFields), // Field definitions as JSON string
                    structure: JSON.stringify(structureData), // Structure/layout as JSON string
                    tags: form?.tags || "",
                    createdBy: 1 // Default user ID
                };

                let result: any;
                if (isStudyContext && studyId) {
                    console.log('*** handleSave: STUDY CONTEXT - Using StudyFormService ***');
                    // Add studyId for study-specific forms
                    const studyFormData = {
                        ...newFormData,
                        studyId: parseInt(studyId),
                        // For study forms, templateId should be null for new forms or a valid Long for template-based forms
                        templateId: (selectedTemplate && form?.templateId && !isNaN(form.templateId)) ? parseInt(form.templateId) : null
                    };

                    console.log('Study form data being sent:', studyFormData);

                    if (selectedTemplate && form?.templateId && !Number.isNaN(Number(form.templateId))) {
                        // Create from template - templateId should be a valid Long
                        result = await StudyFormService.createStudyFormFromTemplate(
                            studyId,
                            parseInt(String(form.templateId), 10),
                            studyFormData.name,
                            studyFormData
                        );
                    } else {
                        // Create from scratch - templateId should be null
                        result = await StudyFormService.createStudyForm(studyFormData);
                    }
                } else {
                    console.log('*** handleSave: LIBRARY CONTEXT - Using FormService ***');
                    // For library/template forms, we need a string templateId
                    const libraryFormData = {
                        ...newFormData,
                        templateId: form?.templateId || `FORM-${Date.now()}` // String ID for templates
                    };

                    if (selectedTemplate && form?.templateId) {
                        // Create from template
                        result = await FormService.createFormFromTemplate(form.templateId, libraryFormData);
                    } else {
                        // Create from scratch
                        result = await FormService.createForm(libraryFormData);
                    }
                }

                // Show success message for manual form creation
                console.log('*** handleSave: Form created successfully ***');
                setSuccessMessage({
                    title: 'Success!',
                    message: 'Form created successfully! You can continue editing or navigate back to the form list.'
                });

                // Auto-dismiss after 3 seconds
                window.setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);

                // Update URL to reflect the newly created form ID without navigation
                if (result && result.id) {
                    const builderPath = isStudyContext
                        ? `/study-design/study/${studyId}/forms/builder/${result.id}`
                        : `/study-design/forms/builder/${result.id}`;
                    console.log('*** handleSave: Updating URL to reflect new form ID:', builderPath);

                    // Use window.history.replaceState to update URL without reload
                    window.history.replaceState(null, '', builderPath);

                    // The component will continue working with the form data we already have
                    console.log('*** handleSave: URL updated, staying on form builder page');
                }
            } else {
                // Update existing form
                console.log('*** handleSave: Updating existing form with ID:', formId);
                console.log('*** handleSave: Context - isStudyContext:', isStudyContext, 'studyId:', studyId);

                if (isStudyContext && studyId) {
                    console.log('*** handleSave: STUDY CONTEXT - Using StudyFormService for update ***');
                    // Update in study context
                    const studyFormData = {
                        studyId: studyId, // Required field for backend validation
                        name: form?.name || "Updated Form",
                        description: form?.description || "Form updated via CRF Builder",
                        formType: form?.type || form?.formType || "General",
                        version: form?.version || "1.0",
                        status: form?.status || "DRAFT",
                        fields: JSON.stringify(allFields),
                        structure: JSON.stringify(structureData),
                        templateId: form?.templateId || null
                    };

                    console.log('*** handleSave: Study form data for update:', studyFormData);
                    await StudyFormService.updateStudyForm(formId, studyFormData);
                } else {
                    console.log('*** handleSave: LIBRARY CONTEXT - Using FormService for update ***');
                    // Update in library/template context
                    const updatedFormData = {
                        templateId: form?.id || form?.templateId || `FORM-${Date.now()}`, // Backend requires templateId
                        name: form?.name || "Updated Form",
                        description: form?.description || "Form updated via CRF Builder",
                        category: form?.type || form?.category || "Custom", // Map type to category  
                        version: form?.version || "1.0",
                        isLatestVersion: true,
                        status: form?.status || "DRAFT", // Ensure uppercase enum value
                        fields: JSON.stringify(allFields), // Field definitions as JSON string
                        structure: JSON.stringify(structureData), // Structure/layout as JSON string
                        tags: form?.tags || "",
                        createdBy: form?.createdBy || 1 // Default user ID
                    };

                    await FormService.updateForm(formId, updatedFormData);
                }

                console.log('*** handleSave: Form update completed successfully ***');

                // Show success message for form update
                setSuccessMessage({
                    title: 'Success!',
                    message: 'Form updated successfully! Your changes have been saved.'
                });

                // Auto-dismiss after 3 seconds
                window.setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);
            }

            console.log('*** handleSave: Save operation completed successfully ***');
            setSaving(false);
            setChanges(false);
        } catch (err) {
            console.error("*** handleSave: Error saving form:", err);
            console.error("*** handleSave: Error details:", err.message, err.stack);
            setErrorMessage({
                title: 'Error',
                message: `Failed to save form: ${err.message || "Unknown error"}`
            });
            setSaving(false);
        }
    };

    // Prompt user before leaving if there are unsaved changes
    useEffect(() => {
        if (changes) {
            const handleBeforeUnload = (e) => {
                e.preventDefault();
                e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
                return e.returnValue;
            };

            window.addEventListener("beforeunload", handleBeforeUnload);
            return () => window.removeEventListener("beforeunload", handleBeforeUnload);
        }
    }, [changes]);

    if (loading) return <div className="text-center p-6">Loading CRF Builder...</div>;
    if (error) return <div className="text-red-500 p-6">{error}</div>;

    // Debug: Log template modal state
    console.log('*** RENDER: showTemplateSelector:', showTemplateSelector, 'availableTemplates:', availableTemplates?.length || 0);

    return (
        <div className="bg-white shadow rounded-lg p-6">
            {/* Fixed Position Success Toast - Always visible at top */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
                    {console.log('*** SUCCESS MESSAGE TOAST RENDERING:', successMessage)}
                    <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[320px]">
                        <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <p className="font-semibold">{successMessage.title}</p>
                            <p className="text-sm text-green-100">{successMessage.message}</p>
                        </div>
                        <button
                            onClick={() => {
                                console.log('*** SUCCESS MESSAGE CLOSED BY USER ***');
                                setSuccessMessage(null);
                            }}
                            className="text-white hover:text-green-100 flex-shrink-0"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <h2 className="text-2xl font-bold mb-6">
                {formId ? `Edit Form: ${form?.name}` : "Create New Form"}
            </h2>

            {/* Inline Success Message (original - keep for context) */}
            {successMessage && (
                <div className="mb-6">
                    {console.log('*** SUCCESS MESSAGE ALERT RENDERING:', successMessage)}
                    <Alert
                        type="success"
                        title={successMessage.title}
                        message={successMessage.message}
                        onClose={() => {
                            console.log('*** SUCCESS MESSAGE CLOSED BY USER ***');
                            setSuccessMessage(null);
                        }}
                    />
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div className="mb-6">
                    <Alert
                        type="error"
                        title={errorMessage.title}
                        message={errorMessage.message}
                        onClose={() => setErrorMessage(null)}
                    />
                </div>
            )}

            {/* Template indicator for new forms */}
            {!formId && selectedTemplate && (
                <div className="mb-4 p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-green-800">
                        <span className="font-medium">Template:</span> {selectedTemplate.name}
                        <span className="ml-2 text-xs bg-green-100 px-2 py-1 rounded">
                            {selectedTemplate.type}
                        </span>
                    </p>
                </div>
            )}

            {formId && formVersion && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                        Editing Version: {formVersion.version}
                        {formVersion.isActive && (
                            <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                Active
                            </span>
                        )}
                    </p>
                </div>
            )}

            {/* Form metadata editor */}
            {!formId && (
                <div className="mb-6 border-b pb-4">
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="formName">
                            Form Name
                        </label>
                        <input
                            id="formName"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="text"
                            placeholder="Enter form name"
                            value={form?.name || ""}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="formDescription">
                            Description
                        </label>
                        <textarea
                            id="formDescription"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Enter form description"
                            value={form?.description || ""}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                        />
                    </div>
                </div>
            )}

            {/* Enhanced CRF Builder Interface */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {previewMode ? 'Form Preview' : 'Form Builder'}
                        </h3>
                        <button
                            onClick={togglePreviewMode}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${previewMode
                                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {previewMode ? (
                                <>
                                    <Edit3 className="w-4 h-4" />
                                    <span>Edit Mode</span>
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4" />
                                    <span>Preview</span>
                                </>
                            )}
                        </button>
                    </div>

                    {!previewMode && (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => createSection('regular')}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md flex items-center space-x-1"
                            >
                                <List className="w-4 h-4" />
                                <span>Add Section</span>
                            </button>
                            <button
                                onClick={() => createSection('table')}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-md flex items-center space-x-1"
                            >
                                <Table className="w-4 h-4" />
                                <span>Add Table Section</span>
                            </button>
                        </div>
                    )}
                </div>

                {previewMode ? (
                    /* Form Preview */
                    <div className="space-y-6">
                        {/* Form Header in Preview */}
                        <div className="border-b border-gray-200 pb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {form?.name || 'Form Preview'}
                            </h2>
                            {form?.description && (
                                <p className="text-gray-600 mt-2">{form.description}</p>
                            )}
                        </div>

                        {/* Preview Sections */}
                        {crfData?.sections?.map((section) => (
                            <div key={section.id}>
                                {renderPreviewSection(section)}
                            </div>
                        ))}

                        {/* No sections message */}
                        {(!crfData?.sections || crfData.sections.length === 0) && (
                            <div className="text-center py-12 text-gray-500">
                                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium mb-2">No content to preview</h3>
                                <p className="text-sm">Switch to edit mode and add some sections to see the preview.</p>
                            </div>
                        )}

                        {/* Preview Actions */}
                        {crfData?.sections?.length > 0 && (
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        onClick={() => setPreviewData({})}
                                    >
                                        Clear Form
                                    </button>
                                    <button
                                        type="button"
                                        className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Submit Preview
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Form Builder Mode */
                    <div>
                        {/* Form Sections */}
                        {crfData?.sections?.map((section, sectionIndex) => (
                            <div key={section.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                                {/* Section Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1 mr-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <button
                                                onClick={() => toggleSectionExpansion(section.id)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                {expandedSections[section.id] ?
                                                    <ChevronUp className="w-5 h-5" /> :
                                                    <ChevronDown className="w-5 h-5" />
                                                }
                                            </button>
                                            <div className="flex items-center space-x-2">
                                                {section.type === 'table' ?
                                                    <Table className="w-4 h-4 text-green-600" /> :
                                                    <List className="w-4 h-4 text-blue-600" />
                                                }
                                                <input
                                                    type="text"
                                                    value={section.name}
                                                    onChange={(e) => updateSection(sectionIndex, { name: e.target.value })}
                                                    className="text-lg font-medium text-gray-900 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
                                                    placeholder="Section name"
                                                />
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    {section.type === 'table' ? 'Table' : 'Regular'}
                                                </span>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            value={section.description || ''}
                                            onChange={(e) => updateSection(sectionIndex, { description: e.target.value })}
                                            className="text-sm text-gray-600 border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 w-full"
                                            placeholder="Section description (optional)"
                                        />
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => createField(sectionIndex, section)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium py-1 px-2 rounded flex items-center space-x-1"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>{section.type === 'table' ? 'Add Column' : 'Add Field'}</span>
                                        </button>
                                        <button
                                            onClick={() => removeSection(sectionIndex)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium py-1 px-2 rounded flex items-center space-x-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Remove Section</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Section Content */}
                                {expandedSections[section.id] !== false && (
                                    <>
                                        {/* Table Section Layout */}
                                        {section.type === 'table' && section.fields?.length > 0 && (
                                            <div className="mb-4">
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Table Preview</h4>
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    {section.fields.map((field) => (
                                                                        <th key={field.id} className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300 last:border-r-0">
                                                                            {field.label || field.name}
                                                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    {section.fields.map((field) => (
                                                                        <td key={field.id} className="px-3 py-2 text-xs text-gray-500 border-r border-gray-300 last:border-r-0">
                                                                            {field.type}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Fields in this section */}
                                        {section.fields?.map((field, fieldIndex) => (
                                            <div key={field.id} className="bg-gray-50 rounded p-3 mb-3 last:mb-0">
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {section.type === 'table' ? 'Column Name' : 'Field Name'}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={field.name}
                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, { name: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Field name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                                                        <input
                                                            type="text"
                                                            value={field.label || ''}
                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, { label: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Display label"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                                        <select
                                                            value={field.type}
                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, { type: e.target.value })}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="text">Text</option>
                                                            <option value="number">Number</option>
                                                            <option value="date">Date</option>
                                                            <option value="datetime">Date & Time</option>
                                                            <option value="time">Time</option>
                                                            <option value="email">Email</option>
                                                            <option value="tel">Phone</option>
                                                            <option value="url">URL</option>
                                                            <option value="select">Select</option>
                                                            <option value="multiselect">Multi-Select</option>
                                                            <option value="textarea">Textarea</option>
                                                            <option value="checkbox">Checkbox</option>
                                                            <option value="radio">Radio</option>
                                                            <option value="file">File Upload</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={field.required}
                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, { required: e.target.checked })}
                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700">Required</span>
                                                        </label>
                                                        <button
                                                            onClick={() => toggleFieldMetadata(field.id)}
                                                            className="text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                                                            title="Field Settings"
                                                        >
                                                            <Settings className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeField(sectionIndex, fieldIndex)}
                                                            className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                                                            title="Remove Field"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Clinical Metadata Panel */}
                                                {showFieldMetadata[field.id] && (
                                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h4 className="text-sm font-medium text-gray-700">Clinical Data Management Metadata</h4>
                                                            <span className="text-xs text-gray-500">Industry Standards Compliant</span>
                                                        </div>

                                                        {/* Metadata Tabs */}
                                                        <div className="border-b border-gray-200 mb-4">
                                                            <nav className="-mb-px flex space-x-8">
                                                                {[
                                                                    { id: 'basic', label: 'Basic', icon: '📝' },
                                                                    { id: 'clinical', label: 'Clinical Flags', icon: '🏥' },
                                                                    { id: 'standards', label: 'CDASH/SDTM', icon: '📊' },
                                                                    { id: 'coding', label: 'Medical Coding', icon: '🏷️' },
                                                                    { id: 'quality', label: 'Data Quality', icon: '✅' },
                                                                    { id: 'regulatory', label: 'Regulatory', icon: '📋' },
                                                                    { id: 'export', label: 'Export', icon: '📤' }
                                                                ].map((tab) => (
                                                                    <button
                                                                        key={tab.id}
                                                                        onClick={() => setMetadataTab(field.id, tab.id)}
                                                                        className={`py-2 px-1 border-b-2 font-medium text-xs ${activeMetadataTab[field.id] === tab.id
                                                                            ? 'border-blue-500 text-blue-600'
                                                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                                            }`}
                                                                    >
                                                                        <span className="mr-1">{tab.icon}</span>
                                                                        {tab.label}
                                                                    </button>
                                                                ))}
                                                            </nav>
                                                        </div>

                                                        {/* Basic Metadata Tab */}
                                                        {activeMetadataTab[field.id] === 'basic' && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                                    <textarea
                                                                        value={field.metadata?.description || ''}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: { ...(field.metadata ?? {}), description: e.target.value }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        rows="2"
                                                                        placeholder="Field description for documentation"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Help Text</label>
                                                                    <textarea
                                                                        value={field.metadata?.helpText || ''}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: { ...(field.metadata ?? {}), helpText: e.target.value }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        rows="2"
                                                                        placeholder="Help text shown to users"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                                                                    <input
                                                                        type="text"
                                                                        value={field.metadata?.placeholder || ''}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: { ...(field.metadata ?? {}), placeholder: e.target.value }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="Placeholder text"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Value</label>
                                                                    <input
                                                                        type="text"
                                                                        value={field.metadata?.defaultValue || ''}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: { ...(field.metadata ?? {}), defaultValue: e.target.value }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="Default value"
                                                                    />
                                                                </div>

                                                                {/* Field Display Settings */}
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Field Width</label>
                                                                    <select
                                                                        value={field.metadata?.fieldWidth || 'full'}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: { ...(field.metadata ?? {}), fieldWidth: e.target.value }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    >
                                                                        <option value="full">Full Width</option>
                                                                        <option value="half">Half Width</option>
                                                                        <option value="third">One Third</option>
                                                                        <option value="quarter">One Quarter</option>
                                                                    </select>
                                                                </div>

                                                                {/* Basic Field Settings */}
                                                                <div className="col-span-2">
                                                                    <div className="flex flex-wrap gap-4">
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.isReadOnly || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: { ...(field.metadata ?? {}), isReadOnly: e.target.checked }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">Read Only</span>
                                                                        </label>
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.isCalculated || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: { ...(field.metadata ?? {}), isCalculated: e.target.checked }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">Calculated Field</span>
                                                                        </label>
                                                                    </div>
                                                                </div>

                                                                {/* Calculation Formula */}
                                                                {field.metadata?.isCalculated && (
                                                                    <div className="col-span-2">
                                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Formula</label>
                                                                        <input
                                                                            type="text"
                                                                            value={field.metadata?.calculationFormula || ''}
                                                                            onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                metadata: { ...(field.metadata ?? {}), calculationFormula: e.target.value }
                                                                            })}
                                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                            placeholder="e.g., field1 + field2 * 0.1"
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* Options for select/radio fields (excluding checkbox - it's just boolean) */}
                                                                {(field.type === 'select' || field.type === 'multiselect' || field.type === 'radio') && (
                                                                    <div className="col-span-2 space-y-3">
                                                                        {/* Option Source Toggle */}
                                                                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                                                                            <label className="flex items-center cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name={`optionSource_${field.id}`}
                                                                                    value="manual"
                                                                                    checked={!field.metadata?.codeListCategory && field.metadata?.codeListCategory !== ''}
                                                                                    onChange={() => updateField(sectionIndex, fieldIndex, {
                                                                                        metadata: {
                                                                                            ...(field.metadata ?? {}),
                                                                                            codeListCategory: undefined
                                                                                        }
                                                                                    })}
                                                                                    className="mr-2"
                                                                                />
                                                                                <span className="text-sm font-medium text-gray-700">Manual Entry</span>
                                                                            </label>
                                                                            <label className="flex items-center cursor-pointer">
                                                                                <input
                                                                                    type="radio"
                                                                                    name={`optionSource_${field.id}`}
                                                                                    value="codelist"
                                                                                    checked={field.metadata?.codeListCategory !== undefined}
                                                                                    onChange={() => updateField(sectionIndex, fieldIndex, {
                                                                                        metadata: {
                                                                                            ...(field.metadata ?? {}),
                                                                                            codeListCategory: ''
                                                                                        }
                                                                                    })}
                                                                                    className="mr-2"
                                                                                />
                                                                                <span className="text-sm font-medium text-gray-700">Code List (Database)</span>
                                                                            </label>
                                                                        </div>

                                                                        {/* Manual Options Entry */}
                                                                        {field.metadata?.codeListCategory === undefined && (
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                    Options (one per line)
                                                                                </label>
                                                                                <textarea
                                                                                    defaultValue={(field.metadata?.options || []).map(opt =>
                                                                                        typeof opt === 'string' ? opt : opt.label
                                                                                    ).join('\n')}
                                                                                    onBlur={(e) => {
                                                                                        // Parse options when user finishes editing (blur event)
                                                                                        const rawValue = e.target.value;
                                                                                        const lines = rawValue.split('\n').map(line => line.trim()).filter(line => line !== '');

                                                                                        // Convert to proper format: {value, label}
                                                                                        const newOptions = lines.map(line => ({
                                                                                            value: line.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
                                                                                            label: line
                                                                                        }));

                                                                                        console.log('📝 Manual options saved on blur:', {
                                                                                            rawInput: rawValue,
                                                                                            parsedOptions: newOptions,
                                                                                            optionCount: newOptions.length
                                                                                        });

                                                                                        // Create a clean field update that removes old location and sets new location
                                                                                        const cleanedField = {
                                                                                            ...field,
                                                                                            options: undefined, // Remove old root-level options
                                                                                            metadata: {
                                                                                                ...(field.metadata ?? {}),
                                                                                                options: newOptions // Set new metadata-level options
                                                                                            }
                                                                                        };

                                                                                        // Replace the entire field to ensure clean state
                                                                                        const updatedSections = [...crfData.sections];
                                                                                        const updatedFields = [...updatedSections[sectionIndex].fields];
                                                                                        updatedFields[fieldIndex] = cleanedField;
                                                                                        updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], fields: updatedFields };
                                                                                        handleCrfDataUpdate({ ...crfData, sections: updatedSections });
                                                                                    }}
                                                                                    onKeyDown={(e) => {
                                                                                        // Prevent Enter from triggering any parent handlers
                                                                                        if (e.key === 'Enter') {
                                                                                            e.stopPropagation();
                                                                                        }
                                                                                    }}
                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                                                                    rows="5"
                                                                                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                                                                                    spellCheck="false"
                                                                                />
                                                                                <p className="mt-1 text-xs text-gray-500">
                                                                                    Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to add each option on a new line. Options are saved when you click outside the field.
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {/* Code List Selection */}
                                                                        {field.metadata?.codeListCategory !== undefined && (
                                                                            <div>
                                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                                    Code List Category *
                                                                                </label>
                                                                                <select
                                                                                    value={field.metadata?.codeListCategory || ''}
                                                                                    onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                        metadata: {
                                                                                            ...(field.metadata ?? {}),
                                                                                            codeListCategory: e.target.value,
                                                                                            options: [] // Clear manual options when using code list
                                                                                        }
                                                                                    })}
                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                    disabled={loadingCategories}
                                                                                >
                                                                                    <option value="">
                                                                                        {loadingCategories ? 'Loading categories...' : 'Select a code list category'}
                                                                                    </option>
                                                                                    {codeListCategories.map((category) => (
                                                                                        <option key={category} value={category}>
                                                                                            {category}
                                                                                        </option>
                                                                                    ))}
                                                                                </select>
                                                                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                                                    <p className="text-xs text-blue-800 mb-2">
                                                                                        <strong>ℹ️ Dynamic Options:</strong> Options will be loaded from the database automatically.
                                                                                    </p>
                                                                                    <p className="text-xs text-blue-700">
                                                                                        API: <code className="bg-blue-100 px-1 rounded">GET /api/admin/codelists/simple/{'{category}'}</code>
                                                                                    </p>
                                                                                    {field.metadata?.codeListCategory && (
                                                                                        <p className="text-xs text-green-700 mt-2">
                                                                                            ✅ Selected: <strong>{field.metadata.codeListCategory}</strong>
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Clinical Flags Tab */}
                                                        {activeMetadataTab[field.id] === 'clinical' && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="col-span-2">
                                                                    <h5 className="text-sm font-medium text-gray-700 mb-3">Data Review Flags</h5>
                                                                    <div className="flex flex-wrap gap-4">
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.clinicalMetadata?.sdvFlag || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: {
                                                                                        ...(field.metadata ?? {}),
                                                                                        clinicalMetadata: {
                                                                                            ...(field.metadata?.clinicalMetadata ?? {}),
                                                                                            sdvFlag: e.target.checked
                                                                                        }
                                                                                    }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">SDV Required</span>
                                                                        </label>
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.clinicalMetadata?.medicalReviewFlag || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: {
                                                                                        ...(field.metadata ?? {}),
                                                                                        clinicalMetadata: {
                                                                                            ...(field.metadata?.clinicalMetadata ?? {}),
                                                                                            medicalReviewFlag: e.target.checked
                                                                                        }
                                                                                    }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">Medical Review</span>
                                                                        </label>
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.clinicalMetadata?.dataReviewFlag || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: {
                                                                                        ...(field.metadata ?? {}),
                                                                                        clinicalMetadata: {
                                                                                            ...(field.metadata?.clinicalMetadata ?? {}),
                                                                                            dataReviewFlag: e.target.checked
                                                                                        }
                                                                                    }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">Data Review</span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* CDASH/SDTM Standards Tab */}
                                                        {activeMetadataTab[field.id] === 'standards' && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="col-span-2">
                                                                    <h5 className="text-sm font-medium text-gray-700 mb-3">CDASH Mapping</h5>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">CDASH Domain</label>
                                                                    <select
                                                                        value={field.metadata?.clinicalMetadata?.cdashMapping?.domain || ''}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...(field.metadata ?? {}),
                                                                                clinicalMetadata: {
                                                                                    ...(field.metadata?.clinicalMetadata ?? {}),
                                                                                    cdashMapping: {
                                                                                        ...(field.metadata?.clinicalMetadata?.cdashMapping ?? {}),
                                                                                        domain: e.target.value
                                                                                    }
                                                                                }
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    >
                                                                        <option value="">Select Domain</option>
                                                                        <option value="DM">Demographics (DM)</option>
                                                                        <option value="AE">Adverse Events (AE)</option>
                                                                        <option value="CM">Concomitant Medications (CM)</option>
                                                                        <option value="VS">Vital Signs (VS)</option>
                                                                        <option value="LB">Laboratory (LB)</option>
                                                                        <option value="EG">ECG (EG)</option>
                                                                        <option value="PE">Physical Examination (PE)</option>
                                                                        <option value="MH">Medical History (MH)</option>
                                                                        <option value="SU">Substance Use (SU)</option>
                                                                        <option value="QS">Questionnaires (QS)</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">CDASH Variable</label>
                                                                    <input
                                                                        type="text"
                                                                        value={field.metadata?.clinicalMetadata?.cdashMapping?.variable || ''}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...(field.metadata ?? {}),
                                                                                clinicalMetadata: {
                                                                                    ...(field.metadata?.clinicalMetadata ?? {}),
                                                                                    cdashMapping: {
                                                                                        ...(field.metadata?.clinicalMetadata?.cdashMapping ?? {}),
                                                                                        variable: e.target.value
                                                                                    }
                                                                                }
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="e.g., AETERM, VSTEST"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Core Status</label>
                                                                    <select
                                                                        value={field.metadata?.clinicalMetadata?.cdashMapping?.core || 'Permissible'}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...(field.metadata ?? {}),
                                                                                clinicalMetadata: {
                                                                                    ...(field.metadata?.clinicalMetadata ?? {}),
                                                                                    cdashMapping: {
                                                                                        ...(field.metadata?.clinicalMetadata?.cdashMapping ?? {}),
                                                                                        core: e.target.value
                                                                                    }
                                                                                }
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    >
                                                                        <option value="Required">Required</option>
                                                                        <option value="Expected">Expected</option>
                                                                        <option value="Permissible">Permissible</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                                                                    <select
                                                                        value={field.metadata?.clinicalMetadata?.cdashMapping?.dataType || 'text'}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...(field.metadata ?? {}),
                                                                                clinicalMetadata: {
                                                                                    ...(field.metadata?.clinicalMetadata ?? {}),
                                                                                    cdashMapping: {
                                                                                        ...(field.metadata?.clinicalMetadata?.cdashMapping ?? {}),
                                                                                        dataType: e.target.value
                                                                                    }
                                                                                }
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    >
                                                                        <option value="text">Text</option>
                                                                        <option value="integer">Integer</option>
                                                                        <option value="float">Float</option>
                                                                        <option value="date">Date</option>
                                                                        <option value="datetime">DateTime</option>
                                                                        <option value="time">Time</option>
                                                                    </select>
                                                                </div>

                                                                <div className="col-span-2">
                                                                    <h5 className="text-sm font-medium text-gray-700 mb-3 mt-4">SDTM Mapping</h5>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">SDTM Domain</label>
                                                                    <input
                                                                        type="text"
                                                                        value={field.metadata?.clinicalMetadata?.sdtmMapping?.domain || ''}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...(field.metadata ?? {}),
                                                                                clinicalMetadata: {
                                                                                    ...(field.metadata?.clinicalMetadata ?? {}),
                                                                                    sdtmMapping: {
                                                                                        ...(field.metadata?.clinicalMetadata?.sdtmMapping ?? {}),
                                                                                        domain: e.target.value
                                                                                    }
                                                                                }
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="e.g., AE, VS, LB"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">SDTM Variable</label>
                                                                    <input
                                                                        type="text"
                                                                        value={field.metadata?.clinicalMetadata?.sdtmMapping?.variable || ''}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...(field.metadata ?? {}),
                                                                                clinicalMetadata: {
                                                                                    ...(field.metadata?.clinicalMetadata ?? {}),
                                                                                    sdtmMapping: {
                                                                                        ...(field.metadata?.clinicalMetadata?.sdtmMapping ?? {}),
                                                                                        variable: e.target.value
                                                                                    }
                                                                                }
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="e.g., AETERM, VSTEST"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                                                                    <select
                                                                        value={field.metadata?.clinicalMetadata?.sdtmMapping?.origin || 'CRF'}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...(field.metadata ?? {}),
                                                                                clinicalMetadata: {
                                                                                    ...(field.metadata?.clinicalMetadata ?? {}),
                                                                                    sdtmMapping: {
                                                                                        ...(field.metadata?.clinicalMetadata?.sdtmMapping ?? {}),
                                                                                        origin: e.target.value
                                                                                    }
                                                                                }
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    >
                                                                        <option value="CRF">CRF</option>
                                                                        <option value="Derived">Derived</option>
                                                                        <option value="Assigned">Assigned</option>
                                                                        <option value="Protocol">Protocol</option>
                                                                        <option value="Predecessor">Predecessor</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Codelist</label>
                                                                    <input
                                                                        type="text"
                                                                        value={field.metadata?.clinicalMetadata?.sdtmMapping?.codelist || ''}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...(field.metadata ?? {}),
                                                                                clinicalMetadata: {
                                                                                    ...(field.metadata?.clinicalMetadata ?? {}),
                                                                                    sdtmMapping: {
                                                                                        ...(field.metadata?.clinicalMetadata?.sdtmMapping ?? {}),
                                                                                        codelist: e.target.value
                                                                                    }
                                                                                }
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="Controlled terminology"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Medical Coding Tab */}
                                                        {activeMetadataTab[field.id] === 'coding' && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="col-span-2">
                                                                    <div className="flex flex-wrap gap-4 mb-4">
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.clinicalMetadata?.medicalCoding?.meddraRequired || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: {
                                                                                            ...(field.metadata ?? {}),
                                                                                        clinicalMetadata: {
                                                                                            ...field.metadata?.clinicalMetadata,
                                                                                            medicalCoding: {
                                                                                                ...field.metadata?.clinicalMetadata?.medicalCoding,
                                                                                                meddraRequired: e.target.checked
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">MedDRA Required</span>
                                                                        </label>
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.clinicalMetadata?.medicalCoding?.whodrugRequired || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: {
                                                                                        ...(field.metadata ?? {}),
                                                                                        clinicalMetadata: {
                                                                                            ...field.metadata?.clinicalMetadata,
                                                                                            medicalCoding: {
                                                                                                ...field.metadata?.clinicalMetadata?.medicalCoding,
                                                                                                whodrugRequired: e.target.checked
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">WHODrug Required</span>
                                                                        </label>
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.clinicalMetadata?.medicalCoding?.autoCodeFlag || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: {
                                                                                        ...(field.metadata ?? {}),
                                                                                        clinicalMetadata: {
                                                                                            ...field.metadata?.clinicalMetadata,
                                                                                            medicalCoding: {
                                                                                                ...field.metadata?.clinicalMetadata?.medicalCoding,
                                                                                                autoCodeFlag: e.target.checked
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">Auto-Code</span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">MedDRA Level</label>
                                                                    <select
                                                                        value={field.metadata?.clinicalMetadata?.medicalCoding?.meddraLevel || ''}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...field.metadata,
                                                                                clinicalMetadata: {
                                                                                    ...field.metadata?.clinicalMetadata,
                                                                                    medicalCoding: {
                                                                                        ...field.metadata?.clinicalMetadata?.medicalCoding,
                                                                                        meddraLevel: e.target.value
                                                                                    }
                                                                                }
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    >
                                                                        <option value="">Select Level</option>
                                                                        <option value="LLT">Lowest Level Term (LLT)</option>
                                                                        <option value="PT">Preferred Term (PT)</option>
                                                                        <option value="HLT">High Level Term (HLT)</option>
                                                                        <option value="HLGT">High Level Group Term (HLGT)</option>
                                                                        <option value="SOC">System Organ Class (SOC)</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Dictionary</label>
                                                                    <input
                                                                        type="text"
                                                                        value={field.metadata?.clinicalMetadata?.medicalCoding?.customDictionary || ''}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...field.metadata,
                                                                                clinicalMetadata: {
                                                                                    ...field.metadata?.clinicalMetadata,
                                                                                    medicalCoding: {
                                                                                        ...field.metadata?.clinicalMetadata?.medicalCoding,
                                                                                        customDictionary: e.target.value
                                                                                    }
                                                                                }
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="Custom dictionary name"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Data Quality Tab */}
                                                        {activeMetadataTab[field.id] === 'quality' && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="col-span-2">
                                                                    <div className="flex flex-wrap gap-4 mb-4">
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.clinicalMetadata?.dataQuality?.criticalDataPoint || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: {
                                                                                        ...(field.metadata ?? {}),
                                                                                        clinicalMetadata: {
                                                                                            ...field.metadata?.clinicalMetadata,
                                                                                            dataQuality: {
                                                                                                ...field.metadata?.clinicalMetadata?.dataQuality,
                                                                                                criticalDataPoint: e.target.checked
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">Critical Data Point</span>
                                                                        </label>
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.clinicalMetadata?.dataQuality?.keyDataPoint || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: {
                                                                                        ...field.metadata,
                                                                                        clinicalMetadata: {
                                                                                            ...field.metadata?.clinicalMetadata,
                                                                                            dataQuality: {
                                                                                                ...field.metadata?.clinicalMetadata?.dataQuality,
                                                                                                keyDataPoint: e.target.checked
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">Key Data Point</span>
                                                                        </label>
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.clinicalMetadata?.dataQuality?.primaryEndpoint || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: {
                                                                                        ...field.metadata,
                                                                                        clinicalMetadata: {
                                                                                            ...field.metadata?.clinicalMetadata,
                                                                                            dataQuality: {
                                                                                                ...field.metadata?.clinicalMetadata?.dataQuality,
                                                                                                primaryEndpoint: e.target.checked
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">Primary Endpoint</span>
                                                                        </label>
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.clinicalMetadata?.dataQuality?.safetyVariable || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: {
                                                                                        ...field.metadata,
                                                                                        clinicalMetadata: {
                                                                                            ...field.metadata?.clinicalMetadata,
                                                                                            dataQuality: {
                                                                                                ...field.metadata?.clinicalMetadata?.dataQuality,
                                                                                                safetyVariable: e.target.checked
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">Safety Variable</span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Query Generation</label>
                                                                    <select
                                                                        value={field.metadata?.clinicalMetadata?.dataQuality?.queryGeneration || 'Auto'}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...(field.metadata ?? {}),
                                                                                clinicalMetadata: {
                                                                                    ...field.metadata?.clinicalMetadata,
                                                                                    dataQuality: {
                                                                                        ...field.metadata?.clinicalMetadata?.dataQuality,
                                                                                        queryGeneration: e.target.value
                                                                                    }
                                                                                }
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    >
                                                                        <option value="Auto">Auto</option>
                                                                        <option value="Manual">Manual</option>
                                                                        <option value="None">None</option>
                                                                    </select>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Range Check</label>
                                                                    <select
                                                                        value={field.metadata?.clinicalMetadata?.dataQuality?.rangeCheckType || 'Soft'}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...field.metadata,
                                                                                clinicalMetadata: {
                                                                                    ...field.metadata?.clinicalMetadata,
                                                                                    dataQuality: {
                                                                                        ...field.metadata?.clinicalMetadata?.dataQuality,
                                                                                        rangeCheckType: e.target.value
                                                                                    }
                                                                                }
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                    >
                                                                        <option value="Hard">Hard</option>
                                                                        <option value="Soft">Soft</option>
                                                                        <option value="None">None</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Regulatory Tab */}
                                                        {activeMetadataTab[field.id] === 'regulatory' && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="col-span-2">
                                                                    <div className="flex flex-wrap gap-4 mb-4">
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.clinicalMetadata?.regulatoryMetadata?.fdaRequired || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: {
                                                                                        ...field.metadata,
                                                                                        clinicalMetadata: {
                                                                                            ...field.metadata?.clinicalMetadata,
                                                                                            regulatoryMetadata: {
                                                                                                ...field.metadata?.clinicalMetadata?.regulatoryMetadata,
                                                                                                fdaRequired: e.target.checked
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">FDA Required</span>
                                                                        </label>
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.clinicalMetadata?.regulatoryMetadata?.emaRequired || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: {
                                                                                        ...field.metadata,
                                                                                        clinicalMetadata: {
                                                                                            ...field.metadata?.clinicalMetadata,
                                                                                            regulatoryMetadata: {
                                                                                                ...field.metadata?.clinicalMetadata?.regulatoryMetadata,
                                                                                                emaRequired: e.target.checked
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">EMA Required</span>
                                                                        </label>
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.clinicalMetadata?.regulatoryMetadata?.part11 || false}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: {
                                                                                        ...field.metadata,
                                                                                        clinicalMetadata: {
                                                                                            ...field.metadata?.clinicalMetadata,
                                                                                            regulatoryMetadata: {
                                                                                                ...field.metadata?.clinicalMetadata?.regulatoryMetadata,
                                                                                                part11: e.target.checked
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">21 CFR Part 11</span>
                                                                        </label>
                                                                        <label className="flex items-center">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.metadata?.clinicalMetadata?.regulatoryMetadata?.auditTrail || true}
                                                                                onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                                    metadata: {
                                                                                        ...field.metadata,
                                                                                        clinicalMetadata: {
                                                                                            ...field.metadata?.clinicalMetadata,
                                                                                            regulatoryMetadata: {
                                                                                                ...field.metadata?.clinicalMetadata?.regulatoryMetadata,
                                                                                                auditTrail: e.target.checked
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                })}
                                                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            />
                                                                            <span className="ml-2 text-sm text-gray-700">Audit Trail</span>
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Submission Dataset</label>
                                                                    <input
                                                                        type="text"
                                                                        value={field.metadata?.clinicalMetadata?.regulatoryMetadata?.submissionDataset || ''}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...field.metadata,
                                                                                clinicalMetadata: {
                                                                                    ...field.metadata?.clinicalMetadata,
                                                                                    regulatoryMetadata: {
                                                                                        ...field.metadata?.clinicalMetadata?.regulatoryMetadata,
                                                                                        submissionDataset: e.target.value
                                                                                    }
                                                                                }
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        placeholder="Dataset name for submission"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                                                                    <textarea
                                                                        value={field.metadata?.clinicalMetadata?.sdtmMapping?.comment || ''}
                                                                        onChange={(e) => updateField(sectionIndex, fieldIndex, {
                                                                            metadata: {
                                                                                ...field.metadata,
                                                                                clinicalMetadata: {
                                                                                    ...field.metadata?.clinicalMetadata,
                                                                                    sdtmMapping: {
                                                                                        ...field.metadata?.clinicalMetadata?.sdtmMapping,
                                                                                        comment: e.target.value
                                                                                    }
                                                                                }
                                                                            }
                                                                        })}
                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                        rows="3"
                                                                        placeholder="Regulatory and compliance notes"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Export Tab - NEW Phase 6F Enhancement */}
                                                        {activeMetadataTab[field.id] === 'export' && (
                                                            <div className="space-y-6">
                                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                                    <h5 className="text-sm font-semibold text-blue-900 mb-2">📤 Export Field Metadata</h5>
                                                                    <p className="text-sm text-blue-700 mb-3">
                                                                        Export metadata for this field in various formats for regulatory submissions and documentation.
                                                                    </p>
                                                                </div>

                                                                {/* Quick Export Buttons */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                    <button
                                                                        onClick={() => exportFieldMetadata(field, 'json')}
                                                                        className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                                                    >
                                                                        <span className="text-3xl mb-2">📄</span>
                                                                        <span className="font-medium text-gray-900">JSON</span>
                                                                        <span className="text-xs text-gray-500 mt-1">Machine-readable format</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => exportFieldMetadata(field, 'excel')}
                                                                        className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                                                                    >
                                                                        <span className="text-3xl mb-2">📊</span>
                                                                        <span className="font-medium text-gray-900">Excel</span>
                                                                        <span className="text-xs text-gray-500 mt-1">Spreadsheet format</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => exportFieldMetadata(field, 'csv')}
                                                                        className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                                                                    >
                                                                        <span className="text-3xl mb-2">📑</span>
                                                                        <span className="font-medium text-gray-900">CSV</span>
                                                                        <span className="text-xs text-gray-500 mt-1">Universal format</span>
                                                                    </button>
                                                                </div>

                                                                {/* Metadata Summary */}
                                                                <div className="border border-gray-200 rounded-lg p-4">
                                                                    <h6 className="text-sm font-semibold text-gray-900 mb-3">Metadata Summary</h6>
                                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                                        <div>
                                                                            <span className="text-gray-600">Field Name:</span>
                                                                            <span className="ml-2 font-mono text-gray-900">{field.name || field.id}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-600">Type:</span>
                                                                            <span className="ml-2 font-medium text-gray-900">{field.type}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-600">SDV Required:</span>
                                                                            <span className={`ml-2 font-medium ${field.metadata?.clinicalMetadata?.sdvFlag ? 'text-green-600' : 'text-gray-400'}`}>
                                                                                {field.metadata?.clinicalMetadata?.sdvFlag ? 'Yes' : 'No'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-600">Medical Coding:</span>
                                                                            <span className={`ml-2 font-medium ${field.metadata?.clinicalMetadata?.medicalCoding?.meddraRequired ? 'text-green-600' : 'text-gray-400'}`}>
                                                                                {field.metadata?.clinicalMetadata?.medicalCoding?.meddraRequired ? 'Required' : 'Not Required'}
                                                                            </span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-600">CDASH Domain:</span>
                                                                            <span className="ml-2 font-mono text-gray-900">{field.metadata?.clinicalMetadata?.cdashMapping?.domain || 'Not mapped'}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-gray-600">SDTM Domain:</span>
                                                                            <span className="ml-2 font-mono text-gray-900">{field.metadata?.clinicalMetadata?.sdtmMapping?.domain || 'Not mapped'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Export Options */}
                                                                <div className="border border-gray-200 rounded-lg p-4">
                                                                    <h6 className="text-sm font-semibold text-gray-900 mb-3">Export Options</h6>
                                                                    <div className="space-y-2">
                                                                        <label className="flex items-center">
                                                                            <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                                                            <span className="ml-2 text-sm text-gray-700">Include CDASH/SDTM mappings</span>
                                                                        </label>
                                                                        <label className="flex items-center">
                                                                            <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                                                            <span className="ml-2 text-sm text-gray-700">Include medical coding configuration</span>
                                                                        </label>
                                                                        <label className="flex items-center">
                                                                            <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                                                            <span className="ml-2 text-sm text-gray-700">Include validation rules</span>
                                                                        </label>
                                                                        <label className="flex items-center">
                                                                            <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                                                            <span className="ml-2 text-sm text-gray-700">Include regulatory requirements</span>
                                                                        </label>
                                                                    </div>
                                                                </div>

                                                                {/* Bulk Export */}
                                                                <div className="border-t border-gray-200 pt-4">
                                                                    <button
                                                                        onClick={() => exportAllFieldsMetadata(section)}
                                                                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors font-medium"
                                                                    >
                                                                        📦 Export All Fields in This Section
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {section.fields?.length === 0 && (
                                            <div className="text-center py-4 text-gray-500">
                                                <p className="mb-2">No {section.type === 'table' ? 'columns' : 'fields'} in this section.</p>
                                                <p className="text-sm">Click "Add {section.type === 'table' ? 'Column' : 'Field'}" to get started.</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}

                        {(!crfData?.sections || crfData.sections.length === 0) && (
                            <div className="text-center py-8 text-gray-500">
                                <p className="mb-4">No sections created yet.</p>
                                <p className="text-sm">Click "Add Section" or "Add Table Section" to start building your form.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex justify-between">
                <button
                    onClick={() => {
                        if (changes && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
                            return;
                        }
                        navigate(formId
                            ? (isStudyContext ? `/study-design/study/${studyId}/forms/${formId}/versions` : `/study-design/forms/${formId}/versions`)
                            : (isStudyContext ? `/study-design/study/${studyId}/forms` : "/study-design/forms"));
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                    disabled={saving}
                >
                    Cancel
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        console.log('*** SAVE BUTTON: Click detected, saving state:', saving);
                        if (!saving) {
                            handleSave();
                        } else {
                            console.log('*** SAVE BUTTON: Click ignored - already saving');
                        }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                    disabled={saving || !changes}
                >
                    {saving ? "Saving..." : "Save Form"}
                </button>
            </div>

            {/* Template Selector Modal */}
            {showTemplateSelector && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                                Choose a Form Template
                            </h3>
                            <p className="text-gray-600 text-center mb-8">
                                Start with a pre-built clinical form template or create from scratch
                            </p>

                            {loadingTemplates ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    <span className="ml-3 text-gray-600">Loading templates...</span>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Start from Scratch Option */}
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 cursor-pointer transition-colors group"
                                        onClick={() => handleTemplateSelect(null)}
                                    >
                                        <div className="text-center">
                                            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                <Plus className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
                                            </div>
                                            <h4 className="mt-4 text-lg font-medium text-gray-900">Start from Scratch</h4>
                                            <p className="mt-2 text-sm text-gray-600">
                                                Create a completely custom form with your own fields and sections
                                            </p>
                                        </div>
                                    </div>

                                    {/* Template Categories */}
                                    {(() => {
                                        const categorizedTemplates = availableTemplates.reduce((categories, template) => {
                                            const category = template.category || 'Other';
                                            if (!categories[category]) categories[category] = [];
                                            categories[category].push(template);
                                            return categories;
                                        }, {});
                                        console.log('*** TEMPLATE MODAL: Rendering categorized templates:', categorizedTemplates);
                                        return Object.entries(categorizedTemplates);
                                    })().map(([category, templates]) => (
                                        <div key={category}>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                                                {category}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {templates.map((template) => {
                                                    console.log('*** TEMPLATE MODAL: Rendering template:', template.name, template.id);
                                                    return (
                                                        <div
                                                            key={template.id}
                                                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group"
                                                            onClick={() => {
                                                                console.log('*** TEMPLATE CLICKED:', template.name, 'ID:', template.id);
                                                                handleTemplateSelect(template);
                                                            }}
                                                        >
                                                            <div className="flex items-start space-x-3">
                                                                <div className="flex-shrink-0">
                                                                    <span className="text-2xl" role="img" aria-label={template.type}>
                                                                        {template.icon}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h5 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                                                        {template.name}
                                                                    </h5>
                                                                    <p className="text-xs text-gray-600 mt-1">
                                                                        {template.description}
                                                                    </p>
                                                                    <div className="mt-3 flex items-center justify-between text-xs">
                                                                        <span className={`px-2 py-1 rounded-full ${template.complexity === 'Basic' ? 'bg-green-100 text-green-800' :
                                                                            template.complexity === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                                                'bg-red-100 text-red-800'
                                                                            }`}>
                                                                            {template.complexity}
                                                                        </span>
                                                                        <span className="text-gray-500">
                                                                            ⏱️ {template.estimatedTime}
                                                                        </span>
                                                                    </div>
                                                                    <div className="mt-2">
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                                                                            {template.type}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={() => {
                                        setShowTemplateSelector(false);
                                        navigate(isStudyContext ? `/study-design/study/${studyId}/forms` : '/study-design/forms');
                                    }}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-6 rounded mr-4"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CRFBuilderIntegration;
