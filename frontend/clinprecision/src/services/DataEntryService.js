// DataEntryService.js
// Mock data and service functions for data entry

import ApiService from './ApiService';

// Storage for form data (replace with actual API calls in production)
let formDataStore = [
  {
    subjectId: '1',
    visitId: '1-1',
    formId: '1-1-1-1',
    status: 'complete',
    lastUpdated: '2024-04-15T14:30:00Z',
    data: {
      'firstName': 'John',
      'lastName': 'Doe',
      'birthDate': '1980-05-15',
      'gender': 'M'
    }
  }
];

// Get form definition (fields, metadata, etc.)
export const getFormDefinition = async (formId) => {
  console.log('DataEntryService: getFormDefinition called with formId:', formId);
  
  try {
    // Call real API to get form definition
    const response = await ApiService.get(`/clinops-ws/api/form-definitions/${formId}`);
    console.log('DataEntryService: Received form definition from API:', response.data);
    
    // Map backend DTO to frontend format expected by FormEntry component
    const formDef = response.data;
    
    // Parse fields from JSON string if needed
    let fields = [];
    if (formDef.fields) {
      try {
        fields = typeof formDef.fields === 'string' 
          ? JSON.parse(formDef.fields) 
          : formDef.fields;
      } catch (parseError) {
        console.error('DataEntryService: Error parsing fields JSON:', parseError);
        fields = [];
      }
    }
    
    return {
      id: formDef.id,
      name: formDef.name,
      description: formDef.description,
      fields: fields
    };
    
  } catch (error) {
    console.error('DataEntryService: Error fetching form definition:', error);
    
    // Fallback to mock data for development/testing
    console.warn('DataEntryService: Falling back to mock form definitions');
    
    const formDefinitions = {
    '1-1-1-1': {
      id: '1-1-1-1',
      name: 'Demographics Form',
      description: 'Basic patient information',
      fields: [
        {
          id: 'firstName',
          type: 'text',
          label: 'First Name',
          metadata: {
            required: true,
            maxLength: 100,
            description: 'Patient\'s legal first name'
          }
        },
        {
          id: 'lastName',
          type: 'text',
          label: 'Last Name',
          metadata: {
            required: true,
            maxLength: 100,
            description: 'Patient\'s legal last name'
          }
        },
        {
          id: 'birthDate',
          type: 'date',
          label: 'Date of Birth',
          metadata: {
            required: true,
            description: 'Patient\'s date of birth'
          }
        },
        {
          id: 'gender',
          type: 'radio',
          label: 'Gender',
          metadata: {
            required: true,
            options: [
              { value: 'M', label: 'Male' },
              { value: 'F', label: 'Female' },
              { value: 'O', label: 'Other' }
            ],
            description: 'Patient\'s gender'
          }
        }
      ]
    },
    '1-1-1-2': {
      id: '1-1-1-2',
      name: 'Medical History',
      description: 'Patient medical history information',
      fields: [
        {
          id: 'hasAllergies',
          type: 'checkbox',
          label: 'Has Allergies',
          metadata: {
            checkboxLabel: 'Patient has allergies',
            description: 'Check if the patient has any allergies'
          }
        },
        {
          id: 'allergies',
          type: 'text',
          label: 'Allergies',
          metadata: {
            description: 'List patient allergies if applicable'
          }
        },
        {
          id: 'hasMedicalConditions',
          type: 'checkbox',
          label: 'Has Medical Conditions',
          metadata: {
            checkboxLabel: 'Patient has pre-existing medical conditions',
            description: 'Check if the patient has any pre-existing medical conditions'
          }
        },
        {
          id: 'medicalConditions',
          type: 'text',
          label: 'Medical Conditions',
          metadata: {
            description: 'List patient medical conditions if applicable'
          }
        }
      ]
    },
    '1-1-2-1': {
      id: '1-1-2-1',
      name: 'Vital Signs',
      description: 'Patient vital signs',
      fields: [
        {
          id: 'temperature',
          type: 'number',
          label: 'Temperature',
          metadata: {
            required: true,
            minValue: 35,
            maxValue: 42,
            units: '°C',
            description: 'Patient\'s body temperature'
          }
        },
        {
          id: 'heartRate',
          type: 'number',
          label: 'Heart Rate',
          metadata: {
            required: true,
            minValue: 40,
            maxValue: 200,
            units: 'bpm',
            description: 'Patient\'s heart rate'
          }
        },
        {
          id: 'systolicBP',
          type: 'number',
          label: 'Systolic Blood Pressure',
          metadata: {
            required: true,
            minValue: 70,
            maxValue: 220,
            units: 'mmHg',
            description: 'Patient\'s systolic blood pressure'
          }
        },
        {
          id: 'diastolicBP',
          type: 'number',
          label: 'Diastolic Blood Pressure',
          metadata: {
            required: true,
            minValue: 40,
            maxValue: 120,
            units: 'mmHg',
            description: 'Patient\'s diastolic blood pressure'
          }
        }
      ]
    }
  };
  
    return formDefinitions[formId] || null;
  }
};

// Get form data
export const getFormData = async (subjectId, visitId, formId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const formData = formDataStore.find(fd => 
    fd.subjectId === subjectId && 
    fd.visitId === visitId && 
    fd.formId === formId
  );
  
  return formData ? formData.data : {};
};

// Save form data
export const saveFormData = async (subjectId, visitId, formId, data) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const formDataIndex = formDataStore.findIndex(fd => 
    fd.subjectId === subjectId && 
    fd.visitId === visitId && 
    fd.formId === formId
  );
  
  if (formDataIndex !== -1) {
    formDataStore[formDataIndex] = {
      ...formDataStore[formDataIndex],
      ...data,
      data: data
    };
  } else {
    formDataStore.push({
      subjectId,
      visitId,
      formId,
      status: data.status,
      lastUpdated: data.lastUpdated,
      data
    });
  }
  
  return { success: true };
};

// Get visit details
export const getVisitDetails = async (subjectId, visitId) => {
  console.log('DataEntryService: getVisitDetails called with subjectId:', subjectId, 'visitId:', visitId);
  
  try {
    // Call real API to get forms for this visit instance
    // Gap #2: Replace hardcoded forms with database query
    const formsResponse = await ApiService.get(`/clinops-ws/api/v1/visits/${visitId}/forms`);
    
    console.log('DataEntryService: Received forms from API:', formsResponse.data);
    
    // Map backend DTO to frontend format
    const forms = formsResponse.data.map(form => ({
      id: form.formId.toString(),
      name: form.formName,
      status: form.completionStatus || 'not_started',
      lastUpdated: form.lastUpdated
    }));
    
    // Build visit details object
    const visitDetails = {
      id: visitId,
      subjectId: subjectId,
      visitName: 'Visit', // TODO: Get from visit instance API
      description: '', // TODO: Get from visit definition
      visitDate: new Date().toISOString().split('T')[0], // TODO: Get from visit instance
      status: 'incomplete',
      timepoint: 0, // TODO: Get from visit definition
      forms: forms
    };
    
    // Calculate visit status based on form completion
    const formStatuses = visitDetails.forms.map(form => form.status);
    if (visitDetails.forms.length === 0) {
      visitDetails.status = 'not_started';
    } else if (formStatuses.every(status => status === 'complete')) {
      visitDetails.status = 'complete';
    } else if (formStatuses.some(status => status === 'complete' || status === 'incomplete')) {
      visitDetails.status = 'incomplete';
    } else {
      visitDetails.status = 'not_started';
    }
    
    console.log('DataEntryService: Final visit details:', visitDetails);
    return visitDetails;
    
  } catch (error) {
    console.error('DataEntryService: Error fetching visit forms:', error);
    
    // Fallback to empty forms list on error
    return {
      id: visitId,
      subjectId: subjectId,
      visitName: 'Visit',
      description: '',
      visitDate: new Date().toISOString().split('T')[0],
      status: 'not_started',
      timepoint: 0,
      forms: []
    };
  }
};
