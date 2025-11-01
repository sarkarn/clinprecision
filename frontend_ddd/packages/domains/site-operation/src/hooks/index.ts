// Custom hooks for site-operation domain
// Re-export hooks from SiteService
export {
  useSites,
  useSite,
  useSitesByOrganization,
  useCreateSite,
  useUpdateSite,
  useActivateSite,
  useSiteStatistics,
  useSearchSites,
  useSiteAssociationsForStudy,
  useStudyAssociationsForSite,
  useAssociateSiteWithStudy,
  useActivateSiteForStudy,
  useUpdateSiteStudyAssociation,
  useRemoveSiteStudyAssociation,
} from '../services/SiteService';
