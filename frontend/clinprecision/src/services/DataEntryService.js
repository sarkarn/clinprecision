// DataEntryService.js
// Mock data and service functions for data entry

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
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // This would typically come from your form template service
  // For now, we'll use a simple mapping
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
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would fetch from the backend
  // For now, we'll use mock data
  const visitDetails = {
    id: visitId,
    subjectId: 'SUBJ-001',
    visitName: 'Screening Visit',
    description: 'Initial patient assessment and eligibility screening',
    visitDate: '2024-04-15',
    status: 'incomplete',
    timepoint: 0,
    forms: [
      {
        id: '1-1-1-1',
        name: 'Demographics Form',
        status: 'complete',
        lastUpdated: '2024-04-15T14:30:00Z'
      },
      {
        id: '1-1-1-2',
        name: 'Medical History',
        status: 'not_started',
        lastUpdated: null
      }
    ]
  };
  
  // Update status based on form data
  const formStatuses = visitDetails.forms.map(form => form.status);
  if (formStatuses.every(status => status === 'complete')) {
    visitDetails.status = 'complete';
  } else if (formStatuses.some(status => status === 'complete' || status === 'incomplete')) {
    visitDetails.status = 'incomplete';
  } else {
    visitDetails.status = 'not_started';
  }
  
  return visitDetails;
};