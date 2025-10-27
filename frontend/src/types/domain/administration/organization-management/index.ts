import type { BaseEntity, EntityStatus} from '../../common';

export interface Organization extends BaseEntity {
  organizationId?: number;
  name?: string;
  type?: string;
  address?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: EntityStatus;
}
