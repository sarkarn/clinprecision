// src/types/study/StudyOrganization.types.ts

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
 * Address information
 */
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/**
 * Contact information
 */
export interface ContactInfo {
  email?: string;
  phone?: string;
  fax?: string;
}

/**
 * Study Organization Service interface
 */
export interface IStudyOrganizationService {
  getAllOrganizations: () => Promise<Organization[]>;
  getOrganizationById: (id: string) => Promise<Organization>;
}
