// src/services/PatientEnrollmentService.js
import ApiService from './ApiService';

export const PatientEnrollmentService = {
  /**
   * Register a new patient in the system
   * @param {Object} patientData - Patient registration data
   * @param {string} patientData.firstName - First name
   * @param {string} patientData.middleName - Middle name (optional)
   * @param {string} patientData.lastName - Last name
   * @param {string} patientData.dateOfBirth - Date of birth (YYYY-MM-DD)
   * @param {string} patientData.gender - Gender (MALE, FEMALE, OTHER)
   * @param {string} patientData.phoneNumber - Phone number (optional)
   * @param {string} patientData.email - Email address (optional)
   * @returns {Promise} - Promise with created patient data
   */
  registerPatient: async (patientData) => {
    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender'];
      for (const field of requiredFields) {
        if (!patientData[field]) {
          throw new Error(`Required field missing: ${field}`);
        }
      }

      // Validate contact info
      if (!patientData.phoneNumber && !patientData.email) {
        throw new Error('Either phone number or email must be provided');
      }

      console.log('[PATIENT_SERVICE] Registering patient:', patientData);
      
      const response = await ApiService.post('/clinops-ws/api/v1/patients', patientData);
      
      console.log('[PATIENT_SERVICE] Patient registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PATIENT_SERVICE] Error registering patient:', error);
      throw error;
    }
  },

  /**
   * Get all patients
   * @returns {Promise} - Promise with patients array
   */
  getAllPatients: async () => {
    try {
      console.log('[PATIENT_SERVICE] Fetching all patients');
      
      const response = await ApiService.get('/clinops-ws/api/v1/patients');
      
      console.log('[PATIENT_SERVICE] Found patients:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('[PATIENT_SERVICE] Error fetching patients:', error);
      throw error;
    }
  },

  /**
   * Get a specific patient by ID
   * @param {string|number} patientId - Patient ID
   * @returns {Promise} - Promise with patient data
   */
  getPatientById: async (patientId) => {
    try {
      console.log('[PATIENT_SERVICE] Fetching patient by ID:', patientId);
      
      const response = await ApiService.get(`/clinops-ws/api/v1/patients/${patientId}`);
      
      console.log('[PATIENT_SERVICE] Found patient:', response.data.id);
      return response.data;
    } catch (error) {
      console.error(`[PATIENT_SERVICE] Error fetching patient ${patientId}:`, error);
      throw error;
    }
  },

  /**
   * Get a specific patient by aggregate UUID (for internal use)
   * @param {string} aggregateUuid - Patient aggregate UUID
   * @returns {Promise} - Promise with patient data
   */
  getPatientByUuid: async (aggregateUuid) => {
    try {
      console.log('[PATIENT_SERVICE] Fetching patient by UUID:', aggregateUuid);
      
      const response = await ApiService.get(`/clinops-ws/api/v1/patients/uuid/${aggregateUuid}`);
      
      console.log('[PATIENT_SERVICE] Found patient by UUID:', response.data.id);
      return response.data;
    } catch (error) {
      console.error(`[PATIENT_SERVICE] Error fetching patient by UUID ${aggregateUuid}:`, error);
      throw error;
    }
  },

  /**
   * Search patients by name
   * @param {string} searchTerm - Name search term
   * @returns {Promise} - Promise with matching patients array
   */
  searchPatientsByName: async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new Error('Search term is required');
      }

      console.log('[PATIENT_SERVICE] Searching patients by name:', searchTerm);
      
      const response = await ApiService.get(`/clinops-ws/api/v1/patients/search?name=${encodeURIComponent(searchTerm)}`);
      
      console.log('[PATIENT_SERVICE] Found matching patients:', response.data.length);
      return response.data;
    } catch (error) {
      console.error(`[PATIENT_SERVICE] Error searching patients by name '${searchTerm}':`, error);
      throw error;
    }
  },

  /**
   * Get patient count for statistics
   * @returns {Promise} - Promise with patient count
   */
  getPatientCount: async () => {
    try {
      console.log('[PATIENT_SERVICE] Fetching patient count');
      
      const response = await ApiService.get('/clinops-ws/api/v1/patients/count');
      
      console.log('[PATIENT_SERVICE] Patient count:', response.data);
      return response.data;
    } catch (error) {
      console.error('[PATIENT_SERVICE] Error fetching patient count:', error);
      throw error;
    }
  },

  /**
   * Get patient statistics and status information
   * @returns {Promise} - Promise with patient statistics
   */
  getPatientStatistics: async () => {
    try {
      console.log('[PATIENT_SERVICE] Calculating patient statistics');
      
      const patients = await PatientEnrollmentService.getAllPatients();
      
      // Calculate statistics
      const stats = {
        totalPatients: patients.length,
        registeredPatients: patients.filter(p => p.status === 'REGISTERED').length,
        screeningPatients: patients.filter(p => p.status === 'SCREENING').length,
        enrolledPatients: patients.filter(p => p.status === 'ENROLLED').length,
        withdrawnPatients: patients.filter(p => p.status === 'WITHDRAWN').length,
        completedPatients: patients.filter(p => p.status === 'COMPLETED').length,
        genderBreakdown: {
          male: patients.filter(p => p.gender === 'MALE').length,
          female: patients.filter(p => p.gender === 'FEMALE').length,
          other: patients.filter(p => p.gender === 'OTHER').length
        },
        ageGroups: {
          '18-30': 0,
          '31-50': 0,
          '51-70': 0,
          '70+': 0
        }
      };

      // Calculate age groups
      patients.forEach(patient => {
        const age = patient.age || 0;
        if (age >= 18 && age <= 30) stats.ageGroups['18-30']++;
        else if (age >= 31 && age <= 50) stats.ageGroups['31-50']++;
        else if (age >= 51 && age <= 70) stats.ageGroups['51-70']++;
        else if (age > 70) stats.ageGroups['70+']++;
      });

      console.log('[PATIENT_SERVICE] Patient statistics calculated:', stats);
      return stats;
    } catch (error) {
      console.error('[PATIENT_SERVICE] Error calculating patient statistics:', error);
      throw error;
    }
  },

  /**
   * Validate patient data before submission
   * @param {Object} patientData - Patient data to validate
   * @returns {Object} - Validation result with errors array
   */
  validatePatientData: (patientData) => {
    const errors = [];

    // Required fields validation
    if (!patientData.firstName || patientData.firstName.trim().length === 0) {
      errors.push('First name is required');
    } else if (patientData.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    }

    if (!patientData.lastName || patientData.lastName.trim().length === 0) {
      errors.push('Last name is required');
    } else if (patientData.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }

    if (!patientData.dateOfBirth) {
      errors.push('Date of birth is required');
    } else {
      // Validate age (must be at least 18)
      const birthDate = new Date(patientData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        errors.push('Patient must be at least 18 years old');
      }

      // Check if date is not in the future
      if (birthDate > today) {
        errors.push('Date of birth cannot be in the future');
      }
    }

    if (!patientData.gender) {
      errors.push('Gender is required');
    } else if (!['MALE', 'FEMALE', 'OTHER'].includes(patientData.gender.toUpperCase())) {
      errors.push('Gender must be MALE, FEMALE, or OTHER');
    }

    // Contact information validation
    if (!patientData.phoneNumber && !patientData.email) {
      errors.push('Either phone number or email must be provided');
    }

    if (patientData.email && !isValidEmail(patientData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (patientData.phoneNumber && !isValidPhone(patientData.phoneNumber)) {
      errors.push('Please enter a valid phone number');
    }

    // Middle name validation (optional but if provided, must be valid)
    if (patientData.middleName && patientData.middleName.trim().length === 1) {
      errors.push('Middle name must be at least 2 characters long if provided');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  /**
   * Format patient data for display
   * @param {Object} patient - Patient data
   * @returns {Object} - Formatted patient data
   */
  formatPatientForDisplay: (patient) => {
    if (!patient) return null;

    return {
      ...patient,
      displayName: `${patient.firstName} ${patient.middleName ? patient.middleName + ' ' : ''}${patient.lastName}`,
      displayGender: patient.gender ? patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase() : 'Unknown',
      displayStatus: patient.status ? patient.status.charAt(0) + patient.status.slice(1).toLowerCase() : 'Unknown',
      displayAge: patient.age ? `${patient.age} years old` : 'Age unknown',
      displayDateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Unknown',
      hasContactInfo: !!(patient.phoneNumber || patient.email)
    };
  },

  /**
   * Filter patients by various criteria
   * @param {Array} patients - Array of patients
   * @param {Object} filters - Filter criteria
   * @param {string} filters.status - Patient status
   * @param {string} filters.gender - Patient gender
   * @param {number} filters.minAge - Minimum age
   * @param {number} filters.maxAge - Maximum age
   * @param {string} filters.name - Name search term
   * @returns {Array} - Filtered patients array
   */
  filterPatients: (patients, filters = {}) => {
    if (!Array.isArray(patients)) return [];

    let filtered = [...patients];

    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters.gender) {
      filtered = filtered.filter(p => p.gender === filters.gender);
    }

    if (filters.minAge !== undefined) {
      filtered = filtered.filter(p => (p.age || 0) >= filters.minAge);
    }

    if (filters.maxAge !== undefined) {
      filtered = filtered.filter(p => (p.age || 0) <= filters.maxAge);
    }

    if (filters.name) {
      const searchTerm = filters.name.toLowerCase();
      filtered = filtered.filter(p => {
        const fullName = `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.toLowerCase();
        return fullName.includes(searchTerm);
      });
    }

    return filtered;
  },

  /**
   * Check service health
   * @returns {Promise} - Promise with health status
   */
  checkHealth: async () => {
    try {
      const response = await ApiService.get('/clinops-ws/api/v1/patients/health');
      return response.data;
    } catch (error) {
      console.error('[PATIENT_SERVICE] Health check failed:', error);
      throw error;
    }
  }
};

// Helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  // Basic phone validation - accepts various formats
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{9,}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export default PatientEnrollmentService;
