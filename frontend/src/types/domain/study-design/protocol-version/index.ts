import type { BaseEntity, EntityStatus } from '../../common';

export interface ProtocolVersion extends BaseEntity {
  studyId?: number;
  versionNumber?: string;
  status?: EntityStatus;
  effectiveDate?: string;
  expiryDate?: string;
  documentUrl?: string;
  changeDescription?: string;
  approvedBy?: string;
  approvalDate?: string;
}
