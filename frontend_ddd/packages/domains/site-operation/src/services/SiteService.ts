// src/services/SiteService.ts
import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import ApiService from '@packages/services/ApiService';
import type { Site, SiteStudyAssociation } from '@packages/utils/types';
import type { ApiResponse } from '@shared/types/api.types';

// ============================================================================
// Types
// ============================================================================

interface SiteCreateData {
  name: string;
  siteNumber: string;
  organizationId: number;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  reason: string;
}

interface SiteUpdateData extends SiteCreateData {
  // Same fields as create
}

interface SiteActivationData {
  reason: string;
}

interface SiteAssociationData {
  studyId: number;
  reason: string;
}

interface SiteAssociationUpdateData {
  subjectEnrollmentCap?: number;
  subjectEnrollmentCount?: number;
  reason: string;
}

interface SiteStatistics {
  totalSites: number;
  activeSites: number;
  pendingSites: number;
  inactiveSites: number;
  suspendedSites: number;
  sitesByOrganization: Record<string, number>;
}

interface SiteSearchCriteria {
  name?: string;
  siteNumber?: string;
  status?: string;
  organizationId?: string;
  country?: string;
  state?: string;
}

interface SiteValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============================================================================
// Core API Functions
// ============================================================================

/**
 * Fetch all sites
 */
export const fetchAllSites = async (): Promise<Site[]> => {
  const response = await ApiService.get('/site-ws/sites');
  const apiResponse = response.data as ApiResponse<Site[]>;
  return apiResponse.data || [];
};

/**
 * Fetch a specific site by ID
 */
export const fetchSiteById = async (id: string): Promise<Site> => {
  const response = await ApiService.get(`/site-ws/sites/${id}`);
  const apiResponse = response.data as ApiResponse<Site>;
  return apiResponse.data;
};

/**
 * Fetch sites by organization
 */
export const fetchSitesByOrganization = async (organizationId: string): Promise<Site[]> => {
  const response = await ApiService.get(`/site-ws/sites/organization/${organizationId}`);
  const apiResponse = response.data as ApiResponse<Site[]>;
  return apiResponse.data || [];
};

/**
 * Create a new clinical trial site
 */
export const createSite = async (siteData: SiteCreateData): Promise<Site> => {
  // Validate required fields
  const requiredFields: (keyof SiteCreateData)[] = ['name', 'siteNumber', 'organizationId', 'reason'];
  for (const field of requiredFields) {
    if (!siteData[field]) {
      throw new Error(`Required field missing: ${field}`);
    }
  }

  const response = await ApiService.post('/site-ws/sites', siteData);
  const apiResponse = response.data as ApiResponse<Site>;
  return apiResponse.data;
};

/**
 * Update an existing clinical trial site
 */
export const updateSite = async ({ id, data }: { id: string; data: SiteUpdateData }): Promise<Site> => {
  // Validate required fields
  const requiredFields: (keyof SiteUpdateData)[] = ['name', 'siteNumber', 'organizationId', 'reason'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Required field missing: ${field}`);
    }
  }

  const response = await ApiService.put(`/site-ws/sites/${id}`, data);
  const apiResponse = response.data as ApiResponse<Site>;
  return apiResponse.data;
};

/**
 * Activate a clinical trial site
 * Site activation is now independent of study context.
 * Study-site associations are managed separately.
 */
export const activateSite = async ({ id, data }: { id: string; data: SiteActivationData }): Promise<Site> => {
  if (!data.reason) {
    throw new Error('Reason is required for site activation');
  }

  console.log('[SITESERVICE] About to call API for site activation:', id, data);
  console.log('[SITESERVICE] API URL will be:', `/site-ws/sites/${id}/activate`);

  const response = await ApiService.post(`/site-ws/sites/${id}/activate`, data);
  console.log('[SITESERVICE] API response received:', response);

  const apiResponse = response.data as ApiResponse<Site>;
  return apiResponse.data;
};

/**
 * Get site statistics and status information
 */
export const fetchSiteStatistics = async (): Promise<SiteStatistics> => {
  const sites = await fetchAllSites();

  // Calculate statistics
  const stats: SiteStatistics = {
    totalSites: sites.length,
    activeSites: sites.filter(site => site.status === 'ACTIVE').length,
    pendingSites: sites.filter(site => site.status === 'DRAFT' || site.status === 'UNDER_REVIEW').length,
    inactiveSites: sites.filter(site => site.status === 'INACTIVE').length,
    suspendedSites: sites.filter(site => site.status === 'ARCHIVED').length,
    sitesByOrganization: {}
  };

  // Group sites by organization
  sites.forEach(site => {
    const orgName = (site as any).organizationName || 'Unknown';
    if (!stats.sitesByOrganization[orgName]) {
      stats.sitesByOrganization[orgName] = 0;
    }
    stats.sitesByOrganization[orgName]++;
  });

  return stats;
};

/**
 * Search sites by various criteria
 */
export const searchSites = async (searchCriteria: SiteSearchCriteria): Promise<Site[]> => {
  // Get all sites first (could be optimized with server-side search later)
  let filteredSites = await fetchAllSites();

  // Apply client-side filtering
  if (searchCriteria.name) {
    filteredSites = filteredSites.filter(site =>
      (site.name || site.siteName || '').toLowerCase().includes(searchCriteria.name!.toLowerCase())
    );
  }

  if (searchCriteria.siteNumber) {
    filteredSites = filteredSites.filter(site =>
      site.siteNumber === searchCriteria.siteNumber
    );
  }

  if (searchCriteria.status) {
    filteredSites = filteredSites.filter(site =>
      site.status === searchCriteria.status
    );
  }

  if (searchCriteria.organizationId) {
    filteredSites = filteredSites.filter(site =>
      (site as any).organizationId === parseInt(searchCriteria.organizationId!)
    );
  }

  if (searchCriteria.country) {
    filteredSites = filteredSites.filter(site =>
      site.country && site.country.toLowerCase().includes(searchCriteria.country!.toLowerCase())
    );
  }

  if (searchCriteria.state) {
    filteredSites = filteredSites.filter(site =>
      site.state && site.state.toLowerCase().includes(searchCriteria.state!.toLowerCase())
    );
  }

  return filteredSites;
};

/**
 * Validate site data before submission
 */
export const validateSiteData = (siteData: Partial<SiteCreateData>): SiteValidationResult => {
  const errors: string[] = [];

  // Required fields validation
  if (!siteData.name || siteData.name.trim().length === 0) {
    errors.push('Site name is required');
  }

  if (!siteData.siteNumber || siteData.siteNumber.trim().length === 0) {
    errors.push('Site number is required');
  }

  if (!siteData.organizationId) {
    errors.push('Organization is required');
  }

  if (!siteData.reason || siteData.reason.trim().length === 0) {
    errors.push('Reason for site creation is required for audit compliance');
  }

  // Format validations
  if (siteData.email && !isValidEmail(siteData.email)) {
    errors.push('Please enter a valid email address');
  }

  if (siteData.phone && !isValidPhone(siteData.phone)) {
    errors.push('Please enter a valid phone number');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

// ============================================================================
// Study-Site Association API Functions
// ============================================================================

/**
 * Associate a site with a study
 */
export const associateSiteWithStudy = async ({ siteId, data }: { siteId: string; data: SiteAssociationData }): Promise<SiteStudyAssociation> => {
  const requiredFields: (keyof SiteAssociationData)[] = ['studyId', 'reason'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Required field missing: ${field}`);
    }
  }

  // Use StudySiteAssociationController via API Gateway prefix
  const response = await ApiService.post(`/site-ws/api/sites/${siteId}/studies`, data);
  const apiResponse = response.data as ApiResponse<SiteStudyAssociation>;
  return apiResponse.data;
};

/**
 * Activate a site for a specific study
 */
export const activateSiteForStudy = async ({ siteId, studyId, data }: { siteId: string; studyId: number | string; data: SiteActivationData }): Promise<SiteStudyAssociation> => {
  if (!data.reason) {
    throw new Error('Reason is required for study-site activation');
  }

  // Use StudySiteAssociationController via API Gateway prefix and include studyId in payload
  const payload = { studyId, ...data };
  const response = await ApiService.post(`/site-ws/api/sites/${siteId}/studies/${studyId}/activate`, payload);
  const apiResponse = response.data as ApiResponse<SiteStudyAssociation>;
  return apiResponse.data;
};

/**
 * Get all study associations for a site
 */
export const fetchStudyAssociationsForSite = async (siteId: string): Promise<SiteStudyAssociation[]> => {
  // Use StudySiteAssociationController via API Gateway prefix
  const response = await ApiService.get(`/site-ws/api/sites/${siteId}/studies`);
  const apiResponse = response.data as ApiResponse<SiteStudyAssociation[]>;
  return apiResponse.data || [];
};

/**
 * Get all site associations for a study
 */
export const fetchSiteAssociationsForStudy = async (studyId: string): Promise<SiteStudyAssociation[]> => {
  // Use StudySiteAssociationController via API Gateway prefix
  const url = `/site-ws/api/sites/studies/${studyId}`;
  console.log('[SiteService] GET site associations for study ->', url);
  const response = await ApiService.get(url);

  // Basic diagnostics about the response shape
  const data = response?.data;
  if (Array.isArray(data)) {
    console.log(`[SiteService] Associations received: ${data.length}`);
  } else {
    console.warn('[SiteService] Unexpected response shape for associations:', data);
  }

  return data || [];
};

/**
 * Update a site-study association
 */
export const updateSiteStudyAssociation = async ({ siteId, studyId, data }: { siteId: string; studyId: number | string; data: SiteAssociationUpdateData }): Promise<SiteStudyAssociation> => {
  if (!data.reason) {
    throw new Error('Reason is required for updating association');
  }
  const response = await ApiService.put(`/site-ws/api/sites/${siteId}/studies/${studyId}`, data);
  const apiResponse = response.data as ApiResponse<SiteStudyAssociation>;
  return apiResponse.data;
};

/**
 * Remove association between site and study
 */
export const removeSiteStudyAssociation = async ({ siteId, studyId, reason = 'Administrative removal' }: { siteId: string; studyId: string; reason?: string }): Promise<void> => {
  // Use StudySiteAssociationController via API Gateway prefix
  await ApiService.delete(`/site-ws/api/sites/${siteId}/studies/${studyId}?reason=${encodeURIComponent(reason)}`);
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch all sites with automatic caching
 * 
 * @example
 * ```tsx
 * const { data: sites, isLoading, error } = useSites();
 * ```
 */
export const useSites = (): UseQueryResult<Site[], Error> => {
  return useQuery({
    queryKey: ['sites'],
    queryFn: fetchAllSites,
  });
};

/**
 * Hook to fetch a specific site by ID
 * 
 * @example
 * ```tsx
 * const { data: site } = useSite(siteId);
 * ```
 */
export const useSite = (id: string | undefined): UseQueryResult<Site, Error> => {
  return useQuery({
    queryKey: ['site', id],
    queryFn: () => fetchSiteById(id!),
    enabled: !!id, // Only fetch if ID is provided
  });
};

/**
 * Hook to fetch sites by organization
 * 
 * @example
 * ```tsx
 * const { data: orgSites } = useSitesByOrganization(organizationId);
 * ```
 */
export const useSitesByOrganization = (organizationId: string | undefined): UseQueryResult<Site[], Error> => {
  return useQuery({
    queryKey: ['sites', 'organization', organizationId],
    queryFn: () => fetchSitesByOrganization(organizationId!),
    enabled: !!organizationId,
  });
};

/**
 * Hook to create a new site
 * 
 * @example
 * ```tsx
 * const createMutation = useCreateSite();
 * await createMutation.mutateAsync(siteData);
 * ```
 */
export const useCreateSite = (): UseMutationResult<Site, Error, SiteCreateData, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSite,
    onSuccess: () => {
      // Invalidate sites list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
};

/**
 * Hook to update an existing site
 * 
 * @example
 * ```tsx
 * const updateMutation = useUpdateSite();
 * await updateMutation.mutateAsync({ id: siteId, data: updatedData });
 * ```
 */
export const useUpdateSite = (): UseMutationResult<Site, Error, { id: string; data: SiteUpdateData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSite,
    onSuccess: (data, variables) => {
      // Update the cache for this specific site
      queryClient.setQueryData(['site', variables.id], data);
      // Invalidate sites list
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
};

/**
 * Hook to activate a site
 * 
 * @example
 * ```tsx
 * const activateMutation = useActivateSite();
 * await activateMutation.mutateAsync({ id: siteId, data: { reason: 'Site ready for trials' } });
 * ```
 */
export const useActivateSite = (): UseMutationResult<Site, Error, { id: string; data: SiteActivationData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateSite,
    onSuccess: (data, variables) => {
      // Update the cache for this specific site
      queryClient.setQueryData(['site', variables.id], data);
      // Invalidate sites list and statistics
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey: ['site-statistics'] });
    },
  });
};

/**
 * Hook to fetch site statistics
 * 
 * @example
 * ```tsx
 * const { data: stats } = useSiteStatistics();
 * console.log(`Total sites: ${stats?.totalSites}`);
 * ```
 */
export const useSiteStatistics = (): UseQueryResult<SiteStatistics, Error> => {
  return useQuery({
    queryKey: ['site-statistics'],
    queryFn: fetchSiteStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to search sites with criteria
 * 
 * @example
 * ```tsx
 * const { data: results } = useSearchSites({ name: 'Hospital', country: 'USA' });
 * ```
 */
export const useSearchSites = (criteria: SiteSearchCriteria): UseQueryResult<Site[], Error> => {
  return useQuery({
    queryKey: ['sites', 'search', criteria],
    queryFn: () => searchSites(criteria),
    enabled: Object.keys(criteria).length > 0, // Only search if criteria provided
  });
};

// ============================================================================
// Study-Site Association React Query Hooks
// ============================================================================

/**
 * Hook to fetch site associations for a study
 * 
 * @example
 * ```tsx
 * const { data: siteAssociations } = useSiteAssociationsForStudy(studyId);
 * ```
 */
export const useSiteAssociationsForStudy = (studyId: string | undefined): UseQueryResult<SiteStudyAssociation[], Error> => {
  return useQuery({
    queryKey: ['study', studyId, 'sites'],
    queryFn: () => fetchSiteAssociationsForStudy(studyId!),
    enabled: !!studyId,
  });
};

/**
 * Hook to fetch study associations for a site
 * 
 * @example
 * ```tsx
 * const { data: studyAssociations } = useStudyAssociationsForSite(siteId);
 * ```
 */
export const useStudyAssociationsForSite = (siteId: string | undefined): UseQueryResult<SiteStudyAssociation[], Error> => {
  return useQuery({
    queryKey: ['site', siteId, 'studies'],
    queryFn: () => fetchStudyAssociationsForSite(siteId!),
    enabled: !!siteId,
  });
};

/**
 * Hook to associate a site with a study
 * 
 * @example
 * ```tsx
 * const associateMutation = useAssociateSiteWithStudy();
 * await associateMutation.mutateAsync({ 
 *   siteId: '123', 
 *   data: { studyId: 456, reason: 'Site ready for enrollment' } 
 * });
 * ```
 */
export const useAssociateSiteWithStudy = (): UseMutationResult<SiteStudyAssociation, Error, { siteId: string; data: SiteAssociationData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: associateSiteWithStudy,
    onSuccess: (data, variables) => {
      // Invalidate both site and study association caches
      queryClient.invalidateQueries({ queryKey: ['site', variables.siteId, 'studies'] });
      queryClient.invalidateQueries({ queryKey: ['study', variables.data.studyId.toString(), 'sites'] });
    },
  });
};

/**
 * Hook to activate a site for a specific study
 * 
 * @example
 * ```tsx
 * const activateMutation = useActivateSiteForStudy();
 * await activateMutation.mutateAsync({ 
 *   siteId: '123', 
 *   studyId: 456, 
 *   data: { reason: 'Site initiated and ready' } 
 * });
 * ```
 */
export const useActivateSiteForStudy = (): UseMutationResult<SiteStudyAssociation, Error, { siteId: string; studyId: number | string; data: SiteActivationData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateSiteForStudy,
    onSuccess: (data, variables) => {
      // Invalidate association caches
      queryClient.invalidateQueries({ queryKey: ['site', variables.siteId, 'studies'] });
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId.toString(), 'sites'] });
    },
  });
};

/**
 * Hook to update a site-study association
 * 
 * @example
 * ```tsx
 * const updateMutation = useUpdateSiteStudyAssociation();
 * await updateMutation.mutateAsync({ 
 *   siteId: '123', 
 *   studyId: 456, 
 *   data: { subjectEnrollmentCap: 50, reason: 'Increased capacity' } 
 * });
 * ```
 */
export const useUpdateSiteStudyAssociation = (): UseMutationResult<SiteStudyAssociation, Error, { siteId: string; studyId: number | string; data: SiteAssociationUpdateData }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSiteStudyAssociation,
    onSuccess: (data, variables) => {
      // Invalidate association caches
      queryClient.invalidateQueries({ queryKey: ['site', variables.siteId, 'studies'] });
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId.toString(), 'sites'] });
    },
  });
};

/**
 * Hook to remove a site-study association
 * 
 * @example
 * ```tsx
 * const removeMutation = useRemoveSiteStudyAssociation();
 * await removeMutation.mutateAsync({ 
 *   siteId: '123', 
 *   studyId: '456', 
 *   reason: 'Site closed' 
 * });
 * ```
 */
export const useRemoveSiteStudyAssociation = (): UseMutationResult<void, Error, { siteId: string; studyId: string; reason?: string }, unknown> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeSiteStudyAssociation,
    onSuccess: (data, variables) => {
      // Invalidate association caches
      queryClient.invalidateQueries({ queryKey: ['site', variables.siteId, 'studies'] });
      queryClient.invalidateQueries({ queryKey: ['study', variables.studyId, 'sites'] });
    },
  });
};

// ============================================================================
// Helper Functions
// ============================================================================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Basic phone validation - can be enhanced based on requirements
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// ============================================================================
// Backwards Compatibility - Legacy Service Object
// ============================================================================

const SiteService = {
  getAllSites: fetchAllSites,
  getSiteById: fetchSiteById,
  getSitesByOrganization: fetchSitesByOrganization,
  createSite,
  updateSite: (siteId: string, siteData: SiteUpdateData) => updateSite({ id: siteId, data: siteData }),
  activateSite: (siteId: string, activationData: SiteActivationData) => activateSite({ id: siteId, data: activationData }),
  getSiteStatistics: fetchSiteStatistics,
  searchSites,
  validateSiteData,
  // Study-site associations
  associateSiteWithStudy: (siteId: string, associationData: SiteAssociationData) => associateSiteWithStudy({ siteId, data: associationData }),
  activateSiteForStudy: (siteId: string, studyId: number | string, activationData: SiteActivationData) => activateSiteForStudy({ siteId, studyId, data: activationData }),
  getStudyAssociationsForSite: fetchStudyAssociationsForSite,
  getSiteAssociationsForStudy: fetchSiteAssociationsForStudy,
  updateSiteStudyAssociation: (siteId: string, studyId: number | string, updateData: SiteAssociationUpdateData) => updateSiteStudyAssociation({ siteId, studyId, data: updateData }),
  removeSiteStudyAssociation: (siteId: string, studyId: string, reason?: string) => removeSiteStudyAssociation({ siteId, studyId, reason }),
};

export default SiteService;

// Named export for components using destructured imports
export { SiteService };
