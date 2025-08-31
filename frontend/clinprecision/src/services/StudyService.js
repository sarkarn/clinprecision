// Mock data and service functions for studies

// Mock data store (replace with actual API calls in production)
let studies = [
  {
    id: '1',
    name: 'COVID-19 Vaccine Trial',
    phase: 'Phase 3',
    status: 'Active',
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    sponsor: 'BioPharm Inc.',
    investigator: 'Dr. Jane Smith',
    description: 'A randomized controlled trial to evaluate the efficacy of a novel COVID-19 vaccine.',
    arms: [
      {
        id: '1-1',
        name: 'Treatment Arm',
        description: 'Receives active treatment',
        visits: [
          {
            id: '1-1-1',
            name: 'Screening Visit',
            timepoint: 0,
            description: 'Initial screening',
            crfs: [
              {
                id: '1-1-1-1',
                name: 'Demographics Form',
                type: 'standard',
                description: 'Basic patient information'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Diabetes Management Study',
    phase: 'Phase 2',
    status: 'Recruiting',
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    sponsor: 'Medical Research Group',
    investigator: 'Dr. Robert Johnson',
    description: 'Evaluating a new approach to diabetes management.',
    arms: []
  },
  // New Study 1 - with 2 arms, multiple visits and CRFs
  {
    id: '3',
    name: 'Alzheimer\'s Disease Intervention Study',
    phase: 'Phase 2',
    status: 'Active',
    startDate: '2024-03-10',
    endDate: '2025-09-30',
    sponsor: 'NeuroCare Foundation',
    investigator: 'Dr. Emily Chen',
    description: 'Evaluating a novel therapeutic approach for early-stage Alzheimer\'s disease.',
    arms: [
      {
        id: '3-1',
        name: 'High Dose Arm',
        description: 'Patients receiving high dose of the investigational product',
        visits: [
          {
            id: '3-1-1',
            name: 'Screening',
            timepoint: -14,
            description: 'Initial patient assessment and eligibility screening',
            crfs: [
              {
                id: '3-1-1-1',
                name: 'Eligibility Checklist',
                type: 'standard',
                description: 'Inclusion/exclusion criteria verification'
              },
              {
                id: '3-1-1-2',
                name: 'Medical History',
                type: 'standard',
                description: 'Complete medical history documentation'
              },
              {
                id: '3-1-1-3',
                name: 'Cognitive Assessment',
                type: 'custom',
                description: 'Baseline cognitive function measurements'
              }
            ]
          },
          {
            id: '3-1-2',
            name: 'Baseline Visit',
            timepoint: 0,
            description: 'First treatment administration and baseline assessments',
            crfs: [
              {
                id: '3-1-2-1',
                name: 'Vital Signs',
                type: 'standard',
                description: 'Temperature, blood pressure, heart rate, etc.'
              },
              {
                id: '3-1-2-2',
                name: 'Medication Administration',
                type: 'standard',
                description: 'Details of study medication administration'
              }
            ]
          },
          {
            id: '3-1-3',
            name: 'Follow-up Visit 1',
            timepoint: 30,
            description: '30-day follow-up assessment',
            crfs: [
              {
                id: '3-1-3-1',
                name: 'Adverse Events',
                type: 'standard',
                description: 'Documentation of any adverse events'
              },
              {
                id: '3-1-3-2',
                name: 'Follow-up Cognitive Assessment',
                type: 'custom',
                description: 'Repeat cognitive function measurements'
              }
            ]
          }
        ]
      },
      {
        id: '3-2',
        name: 'Low Dose Arm',
        description: 'Patients receiving low dose of the investigational product',
        visits: [
          {
            id: '3-2-1',
            name: 'Screening',
            timepoint: -14,
            description: 'Initial patient assessment and eligibility screening',
            crfs: [
              {
                id: '3-2-1-1',
                name: 'Eligibility Checklist',
                type: 'standard',
                description: 'Inclusion/exclusion criteria verification'
              },
              {
                id: '3-2-1-2',
                name: 'Medical History',
                type: 'standard',
                description: 'Complete medical history documentation'
              },
              {
                id: '3-2-1-3',
                name: 'Cognitive Assessment',
                type: 'custom',
                description: 'Baseline cognitive function measurements'
              }
            ]
          },
          {
            id: '3-2-2',
            name: 'Baseline Visit',
            timepoint: 0,
            description: 'First treatment administration and baseline assessments',
            crfs: [
              {
                id: '3-2-2-1',
                name: 'Vital Signs',
                type: 'standard',
                description: 'Temperature, blood pressure, heart rate, etc.'
              },
              {
                id: '3-2-2-2',
                name: 'Medication Administration',
                type: 'standard',
                description: 'Details of study medication administration'
              }
            ]
          },
          {
            id: '3-2-3',
            name: 'Follow-up Visit 1',
            timepoint: 30,
            description: '30-day follow-up assessment',
            crfs: [
              {
                id: '3-2-3-1',
                name: 'Adverse Events',
                type: 'standard',
                description: 'Documentation of any adverse events'
              },
              {
                id: '3-2-3-2',
                name: 'Follow-up Cognitive Assessment',
                type: 'custom',
                description: 'Repeat cognitive function measurements'
              }
            ]
          }
        ]
      }
    ]
  },
  // New Study 2 - with 3 arms and multiple visits/CRFs
  {
    id: '4',
    name: 'Rheumatoid Arthritis Comparative Therapy Trial',
    phase: 'Phase 3',
    status: 'Recruiting',
    startDate: '2024-05-01',
    endDate: '2026-04-30',
    sponsor: 'ArthriCare Pharmaceuticals',
    investigator: 'Dr. Michael Rodriguez',
    description: 'A comparative study of three different therapeutic approaches for rheumatoid arthritis.',
    arms: [
      {
        id: '4-1',
        name: 'Standard of Care',
        description: 'Control arm receiving current standard of care',
        visits: [
          {
            id: '4-1-1',
            name: 'Enrollment',
            timepoint: -7,
            description: 'Patient enrollment and initial assessment',
            crfs: [
              {
                id: '4-1-1-1',
                name: 'Patient Demographics',
                type: 'standard',
                description: 'Basic patient information collection'
              },
              {
                id: '4-1-1-2',
                name: 'Disease History',
                type: 'custom',
                description: 'Detailed history of RA progression and treatments'
              }
            ]
          },
          {
            id: '4-1-2',
            name: 'Baseline',
            timepoint: 0,
            description: 'Baseline assessments before treatment starts',
            crfs: [
              {
                id: '4-1-2-1',
                name: 'Joint Assessment',
                type: 'custom',
                description: 'Comprehensive joint evaluation'
              },
              {
                id: '4-1-2-2',
                name: 'Quality of Life Questionnaire',
                type: 'standard',
                description: 'Patient-reported quality of life measures'
              },
              {
                id: '4-1-2-3',
                name: 'Pain Assessment',
                type: 'standard',
                description: 'Standardized pain scale evaluation'
              }
            ]
          }
        ]
      },
      {
        id: '4-2',
        name: 'Experimental Therapy A',
        description: 'First experimental treatment arm',
        visits: [
          {
            id: '4-2-1',
            name: 'Enrollment',
            timepoint: -7,
            description: 'Patient enrollment and initial assessment',
            crfs: [
              {
                id: '4-2-1-1',
                name: 'Patient Demographics',
                type: 'standard',
                description: 'Basic patient information collection'
              },
              {
                id: '4-2-1-2',
                name: 'Disease History',
                type: 'custom',
                description: 'Detailed history of RA progression and treatments'
              }
            ]
          },
          {
            id: '4-2-2',
            name: 'Baseline',
            timepoint: 0,
            description: 'Baseline assessments before treatment starts',
            crfs: [
              {
                id: '4-2-2-1',
                name: 'Joint Assessment',
                type: 'custom',
                description: 'Comprehensive joint evaluation'
              },
              {
                id: '4-2-2-2',
                name: 'Quality of Life Questionnaire',
                type: 'standard',
                description: 'Patient-reported quality of life measures'
              },
              {
                id: '4-2-2-3',
                name: 'Pain Assessment',
                type: 'standard',
                description: 'Standardized pain scale evaluation'
              }
            ]
          }
        ]
      },
      {
        id: '4-3',
        name: 'Experimental Therapy B',
        description: 'Second experimental treatment arm',
        visits: [
          {
            id: '4-3-1',
            name: 'Enrollment',
            timepoint: -7,
            description: 'Patient enrollment and initial assessment',
            crfs: [
              {
                id: '4-3-1-1',
                name: 'Patient Demographics',
                type: 'standard',
                description: 'Basic patient information collection'
              },
              {
                id: '4-3-1-2',
                name: 'Disease History',
                type: 'custom',
                description: 'Detailed history of RA progression and treatments'
              }
            ]
          },
          {
            id: '4-3-2',
            name: 'Baseline',
            timepoint: 0,
            description: 'Baseline assessments before treatment starts',
            crfs: [
              {
                id: '4-3-2-1',
                name: 'Joint Assessment',
                type: 'custom',
                description: 'Comprehensive joint evaluation'
              },
              {
                id: '4-3-2-2',
                name: 'Quality of Life Questionnaire',
                type: 'standard',
                description: 'Patient-reported quality of life measures'
              },
              {
                id: '4-3-2-3',
                name: 'Pain Assessment',
                type: 'standard',
                description: 'Standardized pain scale evaluation'
              }
            ]
          }
        ]
      }
    ]
  },
  // New Study 3 - simpler structure
  {
    id: '5',
    name: 'Hypertension Management in Elderly Patients',
    phase: 'Phase 4',
    status: 'On Hold',
    startDate: '2023-11-15',
    endDate: '2024-11-14',
    sponsor: 'CardioHealth Institute',
    investigator: 'Dr. Sarah Williams',
    description: 'Post-marketing study examining optimal hypertension management strategies in patients over 65.',
    arms: [
      {
        id: '5-1',
        name: 'Standard Medication',
        description: 'Patients receiving standard medication regimen',
        visits: [
          {
            id: '5-1-1',
            name: 'Initial Assessment',
            timepoint: 0,
            description: 'Baseline evaluation',
            crfs: [
              {
                id: '5-1-1-1',
                name: 'Blood Pressure Log',
                type: 'custom',
                description: 'Daily blood pressure recording form'
              },
              {
                id: '5-1-1-2',
                name: 'Medication History',
                type: 'standard',
                description: 'Current and previous medications'
              }
            ]
          }
        ]
      }
    ]
  },
  // New Study 4 - with 2 arms and multiple visits/CRFs
  {
    id: '6',
    name: 'Pediatric Asthma Treatment Optimization',
    phase: 'Phase 2',
    status: 'Completed',
    startDate: '2023-01-10',
    endDate: '2023-12-20',
    sponsor: 'RespiCare Foundation',
    investigator: 'Dr. David Lee',
    description: 'Evaluating the efficacy of a modified treatment protocol in pediatric asthma patients aged 5-12.',
    arms: [
      {
        id: '6-1',
        name: 'Standard Protocol',
        description: 'Control arm following standard asthma management protocol',
        visits: [
          {
            id: '6-1-1',
            name: 'Screening',
            timepoint: -14,
            description: 'Initial eligibility assessment',
            crfs: [
              {
                id: '6-1-1-1',
                name: 'Asthma History',
                type: 'custom',
                description: 'Detailed asthma history documentation'
              },
              {
                id: '6-1-1-2',
                name: 'Pulmonary Function Test',
                type: 'standard',
                description: 'Baseline lung function assessment'
              }
            ]
          },
          {
            id: '6-1-2',
            name: 'Month 1 Follow-up',
            timepoint: 30,
            description: 'First follow-up visit',
            crfs: [
              {
                id: '6-1-2-1',
                name: 'Symptom Diary Review',
                type: 'custom',
                description: 'Analysis of patient-recorded symptoms'
              },
              {
                id: '6-1-2-2',
                name: 'Medication Adherence',
                type: 'standard',
                description: 'Assessment of treatment compliance'
              },
              {
                id: '6-1-2-3',
                name: 'Quality of Life Assessment',
                type: 'standard',
                description: 'Pediatric quality of life questionnaire'
              }
            ]
          },
          {
            id: '6-1-3',
            name: 'Final Visit',
            timepoint: 90,
            description: 'End of study assessment',
            crfs: [
              {
                id: '6-1-3-1',
                name: 'Final Pulmonary Function',
                type: 'standard',
                description: 'Final lung function assessment'
              },
              {
                id: '6-1-3-2',
                name: 'Study Completion Form',
                type: 'standard',
                description: 'Study conclusion documentation'
              }
            ]
          }
        ]
      },
      {
        id: '6-2',
        name: 'Modified Protocol',
        description: 'Experimental arm using modified treatment approach',
        visits: [
          {
            id: '6-2-1',
            name: 'Screening',
            timepoint: -14,
            description: 'Initial eligibility assessment',
            crfs: [
              {
                id: '6-2-1-1',
                name: 'Asthma History',
                type: 'custom',
                description: 'Detailed asthma history documentation'
              },
              {
                id: '6-2-1-2',
                name: 'Pulmonary Function Test',
                type: 'standard',
                description: 'Baseline lung function assessment'
              }
            ]
          },
          {
            id: '6-2-2',
            name: 'Month 1 Follow-up',
            timepoint: 30,
            description: 'First follow-up visit',
            crfs: [
              {
                id: '6-2-2-1',
                name: 'Symptom Diary Review',
                type: 'custom',
                description: 'Analysis of patient-recorded symptoms'
              },
              {
                id: '6-2-2-2',
                name: 'Medication Adherence',
                type: 'standard',
                description: 'Assessment of treatment compliance'
              },
              {
                id: '6-2-2-3',
                name: 'Quality of Life Assessment',
                type: 'standard',
                description: 'Pediatric quality of life questionnaire'
              }
            ]
          },
          {
            id: '6-2-3',
            name: 'Final Visit',
            timepoint: 90,
            description: 'End of study assessment',
            crfs: [
              {
                id: '6-2-3-1',
                name: 'Final Pulmonary Function',
                type: 'standard',
                description: 'Final lung function assessment'
              },
              {
                id: '6-2-3-2',
                name: 'Study Completion Form',
                type: 'standard',
                description: 'Study conclusion documentation'
              }
            ]
          }
        ]
      }
    ]
  }
];

// Get all studies
export const getStudies = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...studies];
};

// Get study by ID
export const getStudyById = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const study = studies.find(s => s.id === id);
  if (!study) {
    throw new Error('Study not found');
  }
  return { ...study };
};

// Register a new study
export const registerStudy = async (studyData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate ID (would be handled by backend in real app)
  const newId = (studies.length + 1).toString();
  
  const newStudy = {
    id: newId,
    ...studyData,
    arms: []
  };
  
  studies.push(newStudy);
  return { ...newStudy };
};

// Update an existing study
export const updateStudy = async (id, studyData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const index = studies.findIndex(s => s.id === id);
  if (index === -1) {
    throw new Error('Study not found');
  }
  
  const updatedStudy = {
    ...studies[index],
    ...studyData,
    id // Ensure ID remains the same
  };
  
  studies[index] = updatedStudy;
  return { ...updatedStudy };
};

// Delete a study
export const deleteStudy = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const initialLength = studies.length;
  studies = studies.filter(s => s.id !== id);
  
  if (studies.length === initialLength) {
    throw new Error('Study not found');
  }
  
  return { success: true };
};