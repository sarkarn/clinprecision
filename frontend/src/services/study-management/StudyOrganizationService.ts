// src/services/StudyOrganizationService.ts
import ApiService from '../infrastructure/ApiService';
import type { Organization, IStudyOrganizationService } from '../../types/domain/StudyOrganization.types';

/**
 * Study-specific Organization Service
 * 
 * This service is specifically for Study Create/Edit workflows and uses
 * the clinops-service proxy to fetch organization data.
 * 
 * WHY THIS EXISTS:
 * - OrganizationService.js is used by the Organization module and calls organization-ws directly
 * - Study module needs to go through clinops-service proxy for architectural consistency
 * - This keeps concerns separated and prevents breaking Organization module functionality
 * 
 * ARCHITECTURE:
 * Frontend → clinops-service (proxy) → organization-service (via Feign)
 * 
 * ENDPOINTS:
 * - GET /clinops-ws/api/organizations → OrganizationProxyController.getAllOrganizations()
 * - GET /clinops-ws/api/organizations/{id} → OrganizationProxyController.getOrganizationById()
 */
export const StudyOrganizationService: IStudyOrganizationService = {
  /**
   * Get all organizations for Study dropdowns
   * Proxied through clinops-service for Study module consistency
   * 
   * @returns Promise with organizations data
   */
  getAllOrganizations: async (): Promise<Organization[]> => {
    try {
      const response = await ApiService.get<Organization[]>('/clinops-ws/api/organizations');
      return response.data;
    } catch (error) {
      console.error("Error fetching organizations for study:", error);
      throw error;
    }
  },

  /**
   * Get a specific organization by ID for Study context
   * Proxied through clinops-service for Study module consistency
   * 
   * @param id - Organization ID
   * @returns Promise with organization data
   */
  getOrganizationById: async (id: string): Promise<Organization> => {
    try {
      const response = await ApiService.get<Organization>(`/clinops-ws/api/organizations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching organization ${id} for study:`, error);
      throw error;
    }
  }
};

export default StudyOrganizationService;
