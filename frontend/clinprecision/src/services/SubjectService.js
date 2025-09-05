// SubjectService.js
// Mock data and service functions for subjects

// Mock data store (replace with actual API calls in production)
let subjects = [
  {
    id: '1',
    subjectId: 'SUBJ-001',
    studyId: '1',
    armId: '1-1',
    armName: 'Treatment Arm',
    enrollmentDate: '2024-04-15',
    status: 'Active',
    visits: [
      {
        id: '1-1',
        visitId: '1-1-1',
        visitName: 'Screening Visit',
        visitDate: '2024-04-15',
        status: 'complete',
        timepoint: 0
      },
      {
        id: '1-2',
        visitId: '1-1-2',
        visitName: 'Baseline Visit',
        visitDate: '2024-04-22',
        status: 'incomplete',
        timepoint: 7
      }
    ]
  },
  {
    id: '2',
    subjectId: 'SUBJ-002',
    studyId: '1',
    armId: '1-2',
    armName: 'Placebo Arm',
    enrollmentDate: '2024-04-16',
    status: 'Active',
    visits: [
      {
        id: '2-1',
        visitId: '1-2-1',
        visitName: 'Screening Visit',
        visitDate: '2024-04-16',
        status: 'complete',
        timepoint: 0
      }
    ]
  }
];

// Get subjects by study
export const getSubjectsByStudy = async (studyId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return subjects.filter(subject => subject.studyId === studyId);
};

// Get subject by ID
export const getSubjectById = async (subjectId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) {
    throw new Error('Subject not found');
  }
  return { ...subject };
};

// Enroll a new subject
export const enrollSubject = async (subjectData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate ID (would be handled by backend in real app)
  const newId = (subjects.length + 1).toString();
  
  // Find the arm name
  let armName = 'Unknown Arm';
  try {
    const { getStudyById } = require('./StudyService');
    const study = await getStudyById(subjectData.studyId);
    const arm = study.arms.find(a => a.id === subjectData.armId);
    if (arm) armName = arm.name;
  } catch (error) {
    console.error('Error getting arm name:', error);
  }
  
  const newSubject = {
    id: newId,
    ...subjectData,
    armName,
    visits: []
  };
  
  subjects.push(newSubject);
  return { ...newSubject };
};

// Update subject status
export const updateSubjectStatus = async (subjectId, status) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const subjectIndex = subjects.findIndex(s => s.id === subjectId);
  if (subjectIndex === -1) {
    throw new Error('Subject not found');
  }
  
  subjects[subjectIndex].status = status;
  return { ...subjects[subjectIndex] };
};