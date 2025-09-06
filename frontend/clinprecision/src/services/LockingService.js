import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * Service for handling study and CRF locking operations.
 */
class LockingService {
    /**
     * Lock a study to prevent further changes
     * 
     * @param {string} studyId - The ID of the study to lock
     * @param {string} reason - The reason for locking
     * @param {number} userId - The ID of the user performing the action
     * @returns {Promise} - Promise resolving to the response
     */
    lockStudy(studyId, reason, userId) {
        return axios.post(`${API_BASE_URL}/api/locking/study/${studyId}/lock`, {
            reason,
            userId
        });
    }
    
    /**
     * Unlock a study to allow changes
     * 
     * @param {string} studyId - The ID of the study to unlock
     * @param {string} reason - The reason for unlocking
     * @param {number} userId - The ID of the user performing the action
     * @returns {Promise} - Promise resolving to the response
     */
    unlockStudy(studyId, reason, userId) {
        return axios.post(`${API_BASE_URL}/api/locking/study/${studyId}/unlock`, {
            reason,
            userId
        });
    }
    
    /**
     * Lock a CRF to prevent further changes
     * 
     * @param {string} formId - The ID of the form to lock
     * @param {string} reason - The reason for locking
     * @param {number} userId - The ID of the user performing the action
     * @returns {Promise} - Promise resolving to the response
     */
    lockForm(formId, reason, userId) {
        return axios.post(`${API_BASE_URL}/api/locking/form/${formId}/lock`, {
            reason,
            userId
        });
    }
    
    /**
     * Unlock a CRF to allow changes
     * 
     * @param {string} formId - The ID of the form to unlock
     * @param {string} reason - The reason for unlocking
     * @param {number} userId - The ID of the user performing the action
     * @returns {Promise} - Promise resolving to the response
     */
    unlockForm(formId, reason, userId) {
        return axios.post(`${API_BASE_URL}/api/locking/form/${formId}/unlock`, {
            reason,
            userId
        });
    }
    
    /**
     * Check if a study is locked
     * 
     * @param {string} studyId - The ID of the study to check
     * @returns {Promise} - Promise resolving to the lock status
     */
    checkStudyLockStatus(studyId) {
        return axios.get(`${API_BASE_URL}/api/locking/study/${studyId}/status`);
    }
    
    /**
     * Check if a form is locked
     * 
     * @param {string} formId - The ID of the form to check
     * @returns {Promise} - Promise resolving to the lock status
     */
    checkFormLockStatus(formId) {
        return axios.get(`${API_BASE_URL}/api/locking/form/${formId}/status`);
    }
}

export default new LockingService();
