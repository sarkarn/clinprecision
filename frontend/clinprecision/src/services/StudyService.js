// Hardcoded list of studies for demonstration
const studies = [
  {
    id: "STU001",
    name: "Diabetes Type 2 Prevention Study",
    phase: "Phase III",
    status: "Active",
    startDate: "2023-01-15",
    endDate: "2025-06-30",
    sponsor: "MediPharm Inc.",
    investigator: "Dr. Sarah Johnson",
    arms: [
      {
        id: "arm_1",
        name: "Treatment Arm",
        description: "Patients receiving the investigational drug",
        visits: [
          {
            id: "visit_1",
            name: "Screening",
            timepoint: "0",
            description: "Initial screening visit",
            crfs: [
              {
                id: "crf_1",
                name: "Demographics",
                type: "demographics",
                description: "Patient demographic information"
              },
              {
                id: "crf_2",
                name: "Eligibility",
                type: "custom",
                description: "Study eligibility criteria"
              }
            ]
          },
          {
            id: "visit_2",
            name: "Baseline",
            timepoint: "14",
            description: "Baseline measurements",
            crfs: [
              {
                id: "crf_3",
                name: "Vital Signs",
                type: "vitals",
                description: "Patient vital signs"
              },
              {
                id: "crf_4",
                name: "Lab Tests",
                type: "labs",
                description: "Baseline laboratory tests"
              }
            ]
          }
        ]
      },
      {
        id: "arm_2",
        name: "Control Arm",
        description: "Patients receiving placebo",
        visits: [
          {
            id: "visit_1",
            name: "Screening",
            timepoint: "0",
            description: "Initial screening visit"
          },
          {
            id: "visit_2",
            name: "Baseline",
            timepoint: "14",
            description: "Baseline measurements"
          }
        ]
      }
    ]
  },
  {
    id: "STU002",
    name: "COVID-19 Vaccine Efficacy",
    phase: "Phase IV",
    status: "Completed",
    startDate: "2021-03-10",
    endDate: "2022-12-25",
    sponsor: "Global Vaccines Ltd.",
    investigator: "Dr. Michael Chen",
    arms: []
  },
  {
    id: "STU003",
    name: "Alzheimer's Early Detection",
    phase: "Phase II",
    status: "Recruiting",
    startDate: "2024-02-01",
    endDate: "2026-01-31",
    sponsor: "Neuroscience Foundation",
    investigator: "Dr. Robert Williams",
    arms: [
      {
        id: "arm_1",
        name: "Biomarker Study Arm",
        description: "Patients undergoing biomarker analysis",
        visits: [
          {
            id: "visit_1",
            name: "Screening",
            timepoint: "0",
            description: "Initial screening for biomarkers"
          },
          {
            id: "visit_2",
            name: "Follow-up",
            timepoint: "30",
            description: "30-day follow-up visit"
          }
        ]
      }
    ]
  },
  {
    id: "STU004",
    name: "Hypertension Treatment Optimization",
    phase: "Phase III",
    status: "Active",
    startDate: "2023-09-12",
    endDate: "2025-10-15",
    sponsor: "CardioHealth Systems",
    investigator: "Dr. Emily Rodriguez",
    arms: [
      {
        id: "arm_1",
        name: "Standard Care Arm",
        description: "Patients receiving standard hypertension care",
        visits: [
          {
            id: "visit_1",
            name: "Baseline",
            timepoint: "0",
            description: "Baseline blood pressure measurement"
          },
          {
            id: "visit_2",
            name: "3-Month Follow-up",
            timepoint: "90",
            description: "Follow-up blood pressure measurement"
          }
        ]
      },
      {
        id: "arm_2",
        name: "Intensive Care Arm",
        description: "Patients receiving intensive hypertension management",
        visits: [
          {
            id: "visit_1",
            name: "Baseline",
            timepoint: "0",
            description: "Baseline blood pressure measurement"
          },
          {
            id: "visit_2",
            name: "1-Month Follow-up",
            timepoint: "30",
            description: "Follow-up blood pressure measurement"
          },
          {
            id: "visit_3",
            name: "3-Month Follow-up",
            timepoint: "90",
            description: "Follow-up blood pressure measurement"
          }
        ]
      }
    ]
  },
  {
    id: "STU005",
    name: "Pediatric Asthma Management",
    phase: "Phase II",
    status: "On Hold",
    startDate: "2023-05-20",
    endDate: "2025-05-19",
    sponsor: "Respiratory Research Alliance",
    investigator: "Dr. James Peterson",
    arms: [
      {
        id: "arm_1",
        name: "Inhaled Corticosteroids Arm",
        description: "Patients receiving inhaled corticosteroids",
        visits: [
          {
            id: "visit_1",
            name: "Screening",
            timepoint: "0",
            description: "Initial screening and assessment"
          },
          {
            id: "visit_2",
            name: "Follow-up",
            timepoint: "60",
            description: "Follow-up visit for symptom assessment"
          }
        ]
      },
      {
        id: "arm_2",
        name: "Leukotriene Receptor Antagonists Arm",
        description: "Patients receiving leukotriene receptor antagonists",
        visits: [
          {
            id: "visit_1",
            name: "Screening",
            timepoint: "0",
            description: "Initial screening and assessment"
          },
          {
            id: "visit_2",
            name: "Follow-up",
            timepoint: "60",
            description: "Follow-up visit for symptom assessment"
          }
        ]
      }
    ]
  }
];

export const getStudies = () => {
  // Simulating an API call with a Promise
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(studies);
    }, 500); // Adding a small delay to simulate network request
  });
};

export const getStudyById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const study = studies.find(s => s.id === id);
      if (study) {
        resolve(study);
      } else {
        reject(new Error("Study not found"));
      }
    }, 300);
  });
};