/**
 * Organization data model for Study context
 */
export interface Organization {
  id: string;
  name: string;
  code?: string;
  type?: string;
  status?: string;
  address?: Address;
  contactInfo?: ContactInfo;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}


/**
 * Study Organization Service interface
 */
export interface IStudyOrganizationService {
  getAllOrganizations: () => Promise<Organization[]>;
  getOrganizationById: (id: string) => Promise<Organization>;
}

