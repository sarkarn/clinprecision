import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * Service for accessing locking audit trail.
 */
class LockingAuditService {
    /**
     * Get audit trail for a specific entity
     * 
     * @param {string} entityId - The ID of the entity
     * @returns {Promise} - Promise resolving to the audit records
     */
    getAuditForEntity(entityId) {
        return axios.get(`${API_BASE_URL}/api/locking/audit/entity/${entityId}`);
    }
    
    /**
     * Get audit trail for a specific entity type
     * 
     * @param {string} entityType - The type of entity (STUDY or FORM)
     * @returns {Promise} - Promise resolving to the audit records
     */
    getAuditForEntityType(entityType) {
        return axios.get(`${API_BASE_URL}/api/locking/audit/type/${entityType}`);
    }
    
    /**
     * Get audit trail for a specific user
     * 
     * @param {number} userId - The ID of the user
     * @returns {Promise} - Promise resolving to the audit records
     */
    getAuditForUser(userId) {
        return axios.get(`${API_BASE_URL}/api/locking/audit/user/${userId}`);
    }
    
    /**
     * Get all audit records
     * 
     * @returns {Promise} - Promise resolving to all audit records
     */
    getAllAudits() {
        return axios.get(`${API_BASE_URL}/api/locking/audit`);
    }
}

export default new LockingAuditService();
