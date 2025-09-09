/**
 * ClinPrecision Mock Data Service
 * This file provides mock service functions to simulate API calls
 * using the sample data. This can be used for development and testing
 * before connecting to the actual backend.
 */

import { 
  sampleStudies, 
  sampleFormDefinitions, 
  sampleUsers, 
  sampleOrganizations, 
  sampleSubjects 
} from './sampleData';

/**
 * Mock Study Service functions
 */
const StudyMockService = {
  /**
   * Get all studies
   * @returns {Promise} Promise resolving to array of studies
   */
  getAllStudies: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(sampleStudies.map(study => ({
          id: study.id,
          name: study.name,
          phase: study.phase,
          status: study.status,
          startDate: study.startDate,
          endDate: study.endDate,
          sponsor: study.sponsor,
          investigator: study.investigator,
          description: study.description
        })));
      }, 500);
    });
  },

  /**
   * Get study by ID
   * @param {string} id Study ID
   * @returns {Promise} Promise resolving to study object
   */
  getStudyById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const study = sampleStudies.find(s => s.id === id);
        if (study) {
          resolve({...study});
        } else {
          reject(new Error(`Study with ID ${id} not found`));
        }
      }, 500);
    });
  },

  /**
   * Create a new study
   * @param {Object} studyData Study data object
   * @returns {Promise} Promise resolving to created study
   */
  createStudy: (studyData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newStudy = {
          id: (parseInt(sampleStudies[sampleStudies.length - 1].id) + 1).toString(),
          ...studyData,
          arms: []
        };
        resolve(newStudy);
      }, 500);
    });
  },

  /**
   * Update an existing study
   * @param {string} id Study ID
   * @param {Object} studyData Study data to update
   * @returns {Promise} Promise resolving to updated study
   */
  updateStudy: (id, studyData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const studyIndex = sampleStudies.findIndex(s => s.id === id);
        if (studyIndex !== -1) {
          const updatedStudy = {
            ...sampleStudies[studyIndex],
            ...studyData
          };
          resolve(updatedStudy);
        } else {
          reject(new Error(`Study with ID ${id} not found`));
        }
      }, 500);
    });
  },

  /**
   * Get study arms
   * @param {string} studyId Study ID
   * @returns {Promise} Promise resolving to array of arms
   */
  getStudyArms: (studyId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const study = sampleStudies.find(s => s.id === studyId);
        if (study) {
          resolve(study.arms || []);
        } else {
          reject(new Error(`Study with ID ${studyId} not found`));
        }
      }, 500);
    });
  },

  /**
   * Create a study arm
   * @param {string} studyId Study ID
   * @param {Object} armData Arm data
   * @returns {Promise} Promise resolving to created arm
   */
  createStudyArm: (studyId, armData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const study = sampleStudies.find(s => s.id === studyId);
        if (study) {
          const newArm = {
            id: study.arms && study.arms.length > 0 
              ? (parseInt(study.arms[study.arms.length - 1].id) + 1).toString()
              : '1',
            ...armData,
            visits: []
          };
          resolve(newArm);
        } else {
          reject(new Error(`Study with ID ${studyId} not found`));
        }
      }, 500);
    });
  }
};

/**
 * Mock Visit Service functions
 */
const VisitMockService = {
  /**
   * Get visits for a study arm
   * @param {string} studyId Study ID
   * @param {string} armId Arm ID
   * @returns {Promise} Promise resolving to array of visits
   */
  getVisitsForArm: (studyId, armId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const study = sampleStudies.find(s => s.id === studyId);
        if (study) {
          const arm = study.arms.find(a => a.id === armId);
          if (arm) {
            resolve(arm.visits || []);
          } else {
            reject(new Error(`Arm with ID ${armId} not found in study ${studyId}`));
          }
        } else {
          reject(new Error(`Study with ID ${studyId} not found`));
        }
      }, 500);
    });
  },

  /**
   * Create a visit for a study arm
   * @param {string} studyId Study ID
   * @param {string} armId Arm ID
   * @param {Object} visitData Visit data
   * @returns {Promise} Promise resolving to created visit
   */
  createVisit: (studyId, armId, visitData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const study = sampleStudies.find(s => s.id === studyId);
        if (study) {
          const arm = study.arms.find(a => a.id === armId);
          if (arm) {
            const newVisit = {
              id: arm.visits && arm.visits.length > 0 
                ? (parseInt(arm.visits[arm.visits.length - 1].id) + 1).toString()
                : '1',
              ...visitData,
              crfs: []
            };
            resolve(newVisit);
          } else {
            reject(new Error(`Arm with ID ${armId} not found in study ${studyId}`));
          }
        } else {
          reject(new Error(`Study with ID ${studyId} not found`));
        }
      }, 500);
    });
  }
};

/**
 * Mock Form Service functions
 */
const FormMockService = {
  /**
   * Get form definitions for a study
   * @param {string} studyId Study ID
   * @returns {Promise} Promise resolving to array of form definitions
   */
  getFormDefinitions: (studyId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real scenario, we'd filter by study ID
        // Here we'll just return all sample form definitions
        resolve(sampleFormDefinitions);
      }, 500);
    });
  },

  /**
   * Get forms for a visit
   * @param {string} studyId Study ID
   * @param {string} armId Arm ID
   * @param {string} visitId Visit ID
   * @returns {Promise} Promise resolving to array of forms
   */
  getFormsForVisit: (studyId, armId, visitId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const study = sampleStudies.find(s => s.id === studyId);
        if (study) {
          const arm = study.arms.find(a => a.id === armId);
          if (arm) {
            const visit = arm.visits.find(v => v.id === visitId);
            if (visit) {
              resolve(visit.crfs || []);
            } else {
              reject(new Error(`Visit with ID ${visitId} not found in arm ${armId}`));
            }
          } else {
            reject(new Error(`Arm with ID ${armId} not found in study ${studyId}`));
          }
        } else {
          reject(new Error(`Study with ID ${studyId} not found`));
        }
      }, 500);
    });
  },

  /**
   * Create a form definition
   * @param {string} studyId Study ID
   * @param {Object} formData Form data
   * @returns {Promise} Promise resolving to created form definition
   */
  createForm: (studyId, formData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newForm = {
          id: (sampleFormDefinitions.length + 1).toString(),
          ...formData,
          fields: formData.fields || []
        };
        resolve(newForm);
      }, 500);
    });
  },

  /**
   * Associate a form with a visit
   * @param {string} studyId Study ID
   * @param {string} armId Arm ID
   * @param {string} visitId Visit ID
   * @param {string} formId Form ID
   * @returns {Promise} Promise resolving to the visit with the added form
   */
  associateFormWithVisit: (studyId, armId, visitId, formId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const study = sampleStudies.find(s => s.id === studyId);
        if (study) {
          const arm = study.arms.find(a => a.id === armId);
          if (arm) {
            const visit = arm.visits.find(v => v.id === visitId);
            if (visit) {
              const formDef = sampleFormDefinitions.find(f => f.id === formId);
              if (formDef) {
                const newCrf = {
                  id: formId,
                  name: formDef.name,
                  type: formDef.type,
                  description: formDef.description
                };
                resolve(newCrf);
              } else {
                reject(new Error(`Form with ID ${formId} not found`));
              }
            } else {
              reject(new Error(`Visit with ID ${visitId} not found in arm ${armId}`));
            }
          } else {
            reject(new Error(`Arm with ID ${armId} not found in study ${studyId}`));
          }
        } else {
          reject(new Error(`Study with ID ${studyId} not found`));
        }
      }, 500);
    });
  }
};

/**
 * Mock User Service functions
 */
const UserMockService = {
  /**
   * Get all users
   * @returns {Promise} Promise resolving to array of users
   */
  getAllUsers: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(sampleUsers);
      }, 500);
    });
  },

  /**
   * Get user by ID
   * @param {string} id User ID
   * @returns {Promise} Promise resolving to user object
   */
  getUserById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = sampleUsers.find(u => u.id === id);
        if (user) {
          resolve({...user});
        } else {
          reject(new Error(`User with ID ${id} not found`));
        }
      }, 500);
    });
  }
};

/**
 * Mock Organization Service functions
 */
const OrganizationMockService = {
  /**
   * Get all organizations
   * @returns {Promise} Promise resolving to array of organizations
   */
  getAllOrganizations: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(sampleOrganizations);
      }, 500);
    });
  },

  /**
   * Get organization by ID
   * @param {string} id Organization ID
   * @returns {Promise} Promise resolving to organization object
   */
  getOrganizationById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const org = sampleOrganizations.find(o => o.id === id);
        if (org) {
          resolve({...org});
        } else {
          reject(new Error(`Organization with ID ${id} not found`));
        }
      }, 500);
    });
  }
};

/**
 * Mock Subject Service functions
 */
const SubjectMockService = {
  /**
   * Get subjects for a study
   * @param {string} studyId Study ID
   * @returns {Promise} Promise resolving to array of subjects
   */
  getSubjectsForStudy: (studyId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const subjects = sampleSubjects.filter(s => s.studyId === studyId);
        resolve(subjects);
      }, 500);
    });
  },

  /**
   * Get subject by ID
   * @param {string} id Subject ID
   * @returns {Promise} Promise resolving to subject object
   */
  getSubjectById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const subject = sampleSubjects.find(s => s.id === id);
        if (subject) {
          resolve({...subject});
        } else {
          reject(new Error(`Subject with ID ${id} not found`));
        }
      }, 500);
    });
  },

  /**
   * Create a subject
   * @param {Object} subjectData Subject data
   * @returns {Promise} Promise resolving to created subject
   */
  createSubject: (subjectData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSubject = {
          id: (sampleSubjects.length + 1).toString(),
          ...subjectData,
          status: 'active'
        };
        resolve(newSubject);
      }, 500);
    });
  }
};

export {
  StudyMockService,
  VisitMockService,
  FormMockService,
  UserMockService,
  OrganizationMockService,
  SubjectMockService
};
