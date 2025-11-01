// Constants for site-operation domain
// Site status constants
export const SITE_STATUSES = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  ARCHIVED: 'ARCHIVED',
} as const;

export type SiteStatus = typeof SITE_STATUSES[keyof typeof SITE_STATUSES];
