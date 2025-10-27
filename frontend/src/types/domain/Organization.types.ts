import type { BaseEntity, EntityStatus, Address, ContactInfo} from '../common.types';

export interface Organization extends BaseEntity {
  organizationId?: number;
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

export interface IStudyOrganizationService {
  getAllOrganizations: () => Promise<Organization[]>;
  getOrganizationById: (id: string) => Promise<Organization>;
}



