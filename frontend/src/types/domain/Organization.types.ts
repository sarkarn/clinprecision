import type { BaseEntity, EntityStatus, Address, ContactInfo} from '../common.types';

export interface Organization extends BaseEntity {
  id: number;
  aggregateUUID?: RegExpStringIterator;
  name?: string;
  type?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: EntityStatus;
  code?: string;
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


export interface IStudyOrganizationService {
  getAllOrganizations: () => Promise<Organization[]>;
  getOrganizationById: (id: string) => Promise<Organization>;
}






