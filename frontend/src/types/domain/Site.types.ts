import type { BaseEntity, EntityStatus} from '../common.types';

export interface Site extends BaseEntity {
  siteNumber?: string;
  siteName?: string;
  name?: string;  // Legacy compatibility
  status?: EntityStatus;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  principalInvestigator?: string;
  contactPhone?: string;
  contactEmail?: string;
  activationDate?: string;
  capacity?: number;
}

export interface SiteStudyAssociation {
  studyId?: number;
  siteId?: number;
  site?: Site;
  status?: EntityStatus;
  activationDate?: string;
  enrollmentCapacity?: number;
}