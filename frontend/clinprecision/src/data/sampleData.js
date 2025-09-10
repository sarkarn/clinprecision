/**
 * ClinPrecision Sample Study Data
 * This file contains sample study data for development and testing
 * purposes in the frontend application.
 * 
 * This data matches the SQL sample data in backend/clinprecision-db/ddl/sample_data_setup.sql
 */

const sampleStudies = [
  {
    id: '1',
    name: 'COVID-19 Vaccine Trial',
    phase: 'Phase 3',
    status: 'active',
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    sponsor: 'BioPharm Inc.',
    investigator: 'Dr. Jane Smith',
    description: 'A randomized controlled trial to evaluate the efficacy of a novel COVID-19 vaccine.',
    arms: [
      {
        id: '1',
        name: 'Treatment Arm',
        description: 'Receives active treatment',
        visits: [
          {
            id: '1',
            name: 'Screening Visit',
            timepoint: 0,
            description: 'Initial screening',
            crfs: [
              {
                id: '1',
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
    status: 'active',
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    sponsor: 'Medical Research Group',
    investigator: 'Dr. Robert Johnson',
    description: 'Evaluating a new approach to diabetes management.',
    arms: []
  },
  {
    id: '3',
    name: 'Alzheimer\'s Disease Intervention Study',
    phase: 'Phase 2',
    status: 'active',
    startDate: '2024-03-10',
    endDate: '2025-09-30',
    sponsor: 'NeuroCare Foundation',
    investigator: 'Dr. Emily Chen',
    description: 'Evaluating a novel therapeutic approach for early-stage Alzheimer\'s disease.',
    arms: [
      {
        id: '2',
        name: 'High Dose Arm',
        description: 'Patients receiving high dose of the investigational product',
        visits: [
          {
            id: '2',
            name: 'Screening',
            timepoint: -14,
            description: 'Initial patient assessment and eligibility screening',
            crfs: [
              {
                id: '2',
                name: 'Eligibility Checklist',
                type: 'standard',
                description: 'Inclusion/exclusion criteria verification'
              },
              {
                id: '3',
                name: 'Medical History',
                type: 'standard',
                description: 'Complete medical history documentation'
              },
              {
                id: '4',
                name: 'Cognitive Assessment',
                type: 'custom',
                description: 'Baseline cognitive function measurements'
              }
            ]
          },
          {
            id: '3',
            name: 'Baseline Visit',
            timepoint: 0,
            description: 'First treatment administration and baseline assessments',
            crfs: [
              {
                id: '5',
                name: 'Vital Signs',
                type: 'standard',
                description: 'Temperature, blood pressure, heart rate, etc.'
              },
              {
                id: '6',
                name: 'Medication Administration',
                type: 'standard',
                description: 'Details of study medication administration'
              }
            ]
          },
          {
            id: '4',
            name: 'Follow-up Visit 1',
            timepoint: 30,
            description: '30-day follow-up assessment',
            crfs: [
              {
                id: '7',
                name: 'Adverse Events',
                type: 'standard',
                description: 'Documentation of any adverse events'
              },
              {
                id: '8',
                name: 'Follow-up Cognitive Assessment',
                type: 'custom',
                description: 'Repeat cognitive function measurements'
              }
            ]
          }
        ]
      },
      {
        id: '3',
        name: 'Low Dose Arm',
        description: 'Patients receiving low dose of the investigational product',
        visits: [
          {
            id: '5',
            name: 'Screening',
            timepoint: -14,
            description: 'Initial patient assessment and eligibility screening',
            crfs: [
              {
                id: '2',
                name: 'Eligibility Checklist',
                type: 'standard',
                description: 'Inclusion/exclusion criteria verification'
              },
              {
                id: '3',
                name: 'Medical History',
                type: 'standard',
                description: 'Complete medical history documentation'
              },
              {
                id: '4',
                name: 'Cognitive Assessment',
                type: 'custom',
                description: 'Baseline cognitive function measurements'
              }
            ]
          },
          {
            id: '6',
            name: 'Baseline Visit',
            timepoint: 0,
            description: 'First treatment administration and baseline assessments',
            crfs: [
              {
                id: '5',
                name: 'Vital Signs',
                type: 'standard',
                description: 'Temperature, blood pressure, heart rate, etc.'
              },
              {
                id: '6',
                name: 'Medication Administration',
                type: 'standard',
                description: 'Details of study medication administration'
              }
            ]
          },
          {
            id: '7',
            name: 'Follow-up Visit 1',
            timepoint: 30,
            description: '30-day follow-up assessment',
            crfs: [
              {
                id: '7',
                name: 'Adverse Events',
                type: 'standard',
                description: 'Documentation of any adverse events'
              },
              {
                id: '8',
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
  {
    id: '4',
    name: 'Rheumatoid Arthritis Comparative Therapy Trial',
    phase: 'Phase 3',
    status: 'active',
    startDate: '2024-05-01',
    endDate: '2026-04-30',
    sponsor: 'ArthriCare Pharmaceuticals',
    investigator: 'Dr. Michael Rodriguez',
    description: 'A comparative study of three different therapeutic approaches for rheumatoid arthritis.',
    arms: [
      {
        id: '4',
        name: 'Standard of Care',
        description: 'Control arm receiving current standard of care',
        visits: [
          {
            id: '8',
            name: 'Enrollment',
            timepoint: -7,
            description: 'Patient enrollment and initial assessment',
            crfs: [
              {
                id: '9',
                name: 'Patient Demographics',
                type: 'standard',
                description: 'Basic patient information collection'
              },
              {
                id: '10',
                name: 'Disease History',
                type: 'custom',
                description: 'Detailed history of RA progression and treatments'
              }
            ]
          },
          {
            id: '9',
            name: 'Baseline',
            timepoint: 0,
            description: 'Baseline assessments before treatment starts',
            crfs: [
              {
                id: '11',
                name: 'Joint Assessment',
                type: 'custom',
                description: 'Comprehensive joint evaluation'
              },
              {
                id: '12',
                name: 'Quality of Life Questionnaire',
                type: 'standard',
                description: 'Patient-reported quality of life measures'
              },
              {
                id: '13',
                name: 'Pain Assessment',
                type: 'standard',
                description: 'Standardized pain scale evaluation'
              }
            ]
          }
        ]
      },
      {
        id: '5',
        name: 'Experimental Therapy A',
        description: 'First experimental treatment arm',
        visits: [
          {
            id: '10',
            name: 'Enrollment',
            timepoint: -7,
            description: 'Patient enrollment and initial assessment',
            crfs: [
              {
                id: '9',
                name: 'Patient Demographics',
                type: 'standard',
                description: 'Basic patient information collection'
              },
              {
                id: '10',
                name: 'Disease History',
                type: 'custom',
                description: 'Detailed history of RA progression and treatments'
              }
            ]
          },
          {
            id: '11',
            name: 'Baseline',
            timepoint: 0,
            description: 'Baseline assessments before treatment starts',
            crfs: [
              {
                id: '11',
                name: 'Joint Assessment',
                type: 'custom',
                description: 'Comprehensive joint evaluation'
              },
              {
                id: '12',
                name: 'Quality of Life Questionnaire',
                type: 'standard',
                description: 'Patient-reported quality of life measures'
              },
              {
                id: '13',
                name: 'Pain Assessment',
                type: 'standard',
                description: 'Standardized pain scale evaluation'
              }
            ]
          }
        ]
      },
      {
        id: '6',
        name: 'Experimental Therapy B',
        description: 'Second experimental treatment arm',
        visits: [
          {
            id: '12',
            name: 'Enrollment',
            timepoint: -7,
            description: 'Patient enrollment and initial assessment',
            crfs: [
              {
                id: '9',
                name: 'Patient Demographics',
                type: 'standard',
                description: 'Basic patient information collection'
              },
              {
                id: '10',
                name: 'Disease History',
                type: 'custom',
                description: 'Detailed history of RA progression and treatments'
              }
            ]
          },
          {
            id: '13',
            name: 'Baseline',
            timepoint: 0,
            description: 'Baseline assessments before treatment starts',
            crfs: [
              {
                id: '11',
                name: 'Joint Assessment',
                type: 'custom',
                description: 'Comprehensive joint evaluation'
              },
              {
                id: '12',
                name: 'Quality of Life Questionnaire',
                type: 'standard',
                description: 'Patient-reported quality of life measures'
              },
              {
                id: '13',
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
  {
    id: '5',
    name: 'Hypertension Management in Elderly Patients',
    phase: 'Phase 4',
    status: 'active',
    startDate: '2023-11-15',
    endDate: '2024-11-14',
    sponsor: 'CardioHealth Institute',
    investigator: 'Dr. Sarah Williams',
    description: 'Post-marketing study examining optimal hypertension management strategies in patients over 65.',
    arms: [
      {
        id: '7',
        name: 'Standard Medication',
        description: 'Patients receiving standard medication regimen',
        visits: [
          {
            id: '14',
            name: 'Initial Assessment',
            timepoint: 0,
            description: 'Baseline evaluation',
            crfs: [
              {
                id: '14',
                name: 'Blood Pressure Log',
                type: 'custom',
                description: 'Daily blood pressure recording form'
              },
              {
                id: '15',
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
  {
    id: '6',
    name: 'Pediatric Asthma Treatment Optimization',
    phase: 'Phase 2',
    status: 'completed',
    startDate: '2023-01-10',
    endDate: '2023-12-20',
    sponsor: 'RespiCare Foundation',
    investigator: 'Dr. David Lee',
    description: 'Evaluating the efficacy of a modified treatment protocol in pediatric asthma patients aged 5-12.',
    arms: [
      {
        id: '8',
        name: 'Standard Protocol',
        description: 'Control arm following standard asthma management protocol',
        visits: [
          {
            id: '15',
            name: 'Screening',
            timepoint: -14,
            description: 'Initial eligibility assessment',
            crfs: [
              {
                id: '16',
                name: 'Asthma History',
                type: 'custom',
                description: 'Detailed asthma history documentation'
              },
              {
                id: '17',
                name: 'Pulmonary Function Test',
                type: 'standard',
                description: 'Baseline lung function assessment'
              }
            ]
          },
          {
            id: '16',
            name: 'Month 1 Follow-up',
            timepoint: 30,
            description: 'First follow-up visit',
            crfs: [
              {
                id: '18',
                name: 'Symptom Diary Review',
                type: 'custom',
                description: 'Analysis of patient-recorded symptoms'
              },
              {
                id: '19',
                name: 'Medication Adherence',
                type: 'standard',
                description: 'Assessment of treatment compliance'
              },
              {
                id: '20',
                name: 'Quality of Life Assessment',
                type: 'standard',
                description: 'Pediatric quality of life questionnaire'
              }
            ]
          },
          {
            id: '17',
            name: 'Final Visit',
            timepoint: 90,
            description: 'End of study assessment',
            crfs: [
              {
                id: '21',
                name: 'Final Pulmonary Function',
                type: 'standard',
                description: 'Final lung function assessment'
              },
              {
                id: '22',
                name: 'Study Completion Form',
                type: 'standard',
                description: 'Study conclusion documentation'
              }
            ]
          }
        ]
      },
      {
        id: '9',
        name: 'Modified Protocol',
        description: 'Experimental arm using modified treatment approach',
        visits: [
          {
            id: '18',
            name: 'Screening',
            timepoint: -14,
            description: 'Initial eligibility assessment',
            crfs: [
              {
                id: '16',
                name: 'Asthma History',
                type: 'custom',
                description: 'Detailed asthma history documentation'
              },
              {
                id: '17',
                name: 'Pulmonary Function Test',
                type: 'standard',
                description: 'Baseline lung function assessment'
              }
            ]
          },
          {
            id: '19',
            name: 'Month 1 Follow-up',
            timepoint: 30,
            description: 'First follow-up visit',
            crfs: [
              {
                id: '18',
                name: 'Symptom Diary Review',
                type: 'custom',
                description: 'Analysis of patient-recorded symptoms'
              },
              {
                id: '19',
                name: 'Medication Adherence',
                type: 'standard',
                description: 'Assessment of treatment compliance'
              },
              {
                id: '20',
                name: 'Quality of Life Assessment',
                type: 'standard',
                description: 'Pediatric quality of life questionnaire'
              }
            ]
          },
          {
            id: '20',
            name: 'Final Visit',
            timepoint: 90,
            description: 'End of study assessment',
            crfs: [
              {
                id: '21',
                name: 'Final Pulmonary Function',
                type: 'standard',
                description: 'Final lung function assessment'
              },
              {
                id: '22',
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

// Sample form definitions with fields
const sampleFormDefinitions = [
  {
    id: '1',
    name: 'Demographics Form',
    description: 'Basic patient information',
    type: 'standard',
    fields: [
      {
        id: 'field_1',
        label: 'First Name',
        type: 'text',
        required: true
      },
      {
        id: 'field_2',
        label: 'Last Name',
        type: 'text',
        required: true
      },
      {
        id: 'field_3',
        label: 'Date of Birth',
        type: 'date',
        required: true
      },
      {
        id: 'field_4',
        label: 'Gender',
        type: 'select',
        options: ['Male', 'Female', 'Other'],
        required: true
      }
    ]
  },
  {
    id: '2',
    name: 'Eligibility Checklist',
    description: 'Inclusion/exclusion criteria verification',
    type: 'standard',
    fields: [
      {
        id: 'inc_1',
        label: 'Age 55 or older',
        type: 'checkbox',
        required: true
      },
      {
        id: 'inc_2',
        label: 'Confirmed early-stage Alzheimer\'s',
        type: 'checkbox',
        required: true
      },
      {
        id: 'exc_1',
        label: 'History of stroke',
        type: 'checkbox',
        required: true
      }
    ]
  },
  {
    id: '3',
    name: 'Medical History',
    description: 'Complete medical history documentation',
    type: 'standard',
    fields: [
      {
        id: 'med_1',
        label: 'Previous Medications',
        type: 'textarea',
        required: true
      },
      {
        id: 'med_2',
        label: 'Known Allergies',
        type: 'textarea',
        required: false
      },
      {
        id: 'med_3',
        label: 'Past Surgeries',
        type: 'textarea',
        required: false
      }
    ]
  },
  {
    id: '4',
    name: 'Cognitive Assessment',
    description: 'Baseline cognitive function measurements',
    type: 'custom',
    fields: [
      {
        id: 'cog_1',
        label: 'MMSE Score',
        type: 'number',
        min: 0,
        max: 30,
        required: true
      },
      {
        id: 'cog_2',
        label: 'Clock Drawing Test',
        type: 'select',
        options: ['Normal', 'Mildly Impaired', 'Moderately Impaired', 'Severely Impaired'],
        required: true
      }
    ]
  }
  // Additional form definitions can be added as needed
];

// Sample users with roles
const sampleUsers = [
  {
    id: '1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jsmith@biopharm.com',
    userId: 'jsmith',
    organization: 'BioPharm Inc.',
    roles: ['SPONSOR_ADMIN']
  },
  {
    id: '2',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'rjohnson@medicalresearch.org',
    userId: 'rjohnson',
    organization: 'Medical Research Group',
    roles: ['SPONSOR_ADMIN']
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Chen',
    email: 'echen@neurocare.org',
    userId: 'echen',
    organization: 'NeuroCare Foundation',
    roles: ['SPONSOR_ADMIN']
  },
  {
    id: '4',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    email: 'mrodriguez@arthricare.com',
    userId: 'mrodriguez',
    organization: 'ArthriCare Pharmaceuticals',
    roles: ['SPONSOR_ADMIN']
  },
  {
    id: '5',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'swilliams@cardiohealth.org',
    userId: 'swilliams',
    organization: 'CardioHealth Institute',
    roles: ['SPONSOR_ADMIN']
  },
  {
    id: '6',
    firstName: 'David',
    lastName: 'Lee',
    email: 'dlee@respicare.org',
    userId: 'dlee',
    organization: 'RespiCare Foundation',
    roles: ['SPONSOR_ADMIN']
  },
  {
    id: '7',
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@clinprecision.com',
    userId: 'admin',
    roles: ['SYSTEM_ADMIN']
  }
];

// Sample organizations
const sampleOrganizations = [
  {
    id: '1',
    name: 'BioPharm Inc.',
    type: 'SPONSOR',
    status: 'active'
  },
  {
    id: '2',
    name: 'Medical Research Group',
    type: 'SPONSOR',
    status: 'active'
  },
  {
    id: '3',
    name: 'NeuroCare Foundation',
    type: 'SPONSOR',
    status: 'active'
  },
  {
    id: '4',
    name: 'ArthriCare Pharmaceuticals',
    type: 'SPONSOR',
    status: 'active'
  },
  {
    id: '5',
    name: 'CardioHealth Institute',
    type: 'SPONSOR',
    status: 'active'
  },
  {
    id: '6',
    name: 'RespiCare Foundation',
    type: 'SPONSOR',
    status: 'active'
  },
  {
    id: '7',
    name: 'Clinical Management Services',
    type: 'CRO',
    status: 'active'
  }
];

// Sample subjects
const sampleSubjects = [
  {
    id: '1',
    protocolSubjectId: 'S1-001',
    studyId: '1',
    armId: '1',
    enrollmentDate: '2024-01-20',
    status: 'active'
  },
  {
    id: '2',
    protocolSubjectId: 'S1-002',
    studyId: '1',
    armId: '1',
    enrollmentDate: '2024-01-22',
    status: 'active'
  },
  {
    id: '3',
    protocolSubjectId: 'S3-001',
    studyId: '3',
    armId: '2',
    enrollmentDate: '2024-03-15',
    status: 'active'
  },
  {
    id: '4',
    protocolSubjectId: 'S3-002',
    studyId: '3',
    armId: '2',
    enrollmentDate: '2024-03-17',
    status: 'active'
  },
  {
    id: '5',
    protocolSubjectId: 'S3-003',
    studyId: '3',
    armId: '3',
    enrollmentDate: '2024-03-20',
    status: 'active'
  }
];

export {
  sampleStudies,
  sampleFormDefinitions,
  sampleUsers,
  sampleOrganizations,
  sampleSubjects
};
