import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

/**
 * Navigation context information
 */
export interface NavigationContext {
  type: 'study-list' | 'study-detail' | 'study-edit' | 'study-design' | 'study-forms' | 'quick-register' | 'unknown';
  studyId: string | null;
  phase?: string;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  path: string | null;
}

/**
 * Return type for useStudyNavigation hook
 */
export interface UseStudyNavigationReturn {
  // Navigation functions
  navigateBack: () => void;
  navigateToStudy: (studyId: string | number) => void;
  navigateToStudyEdit: (studyId: string | number) => void;
  navigateToStudyDesign: (studyId: string | number, phase?: string) => void;
  navigateToStudyForms: (studyId: string | number) => void;
  navigateToStudiesList: () => void;
  navigateToCreateStudy: () => void;
  navigateToQuickRegister: () => void;

  // Context helpers
  getCurrentStudyId: () => string | null;
  getCurrentContext: () => NavigationContext;
  isInStudyContext: () => boolean;
  getBreadcrumbInfo: () => BreadcrumbItem[];
  getBackDestination: () => string;
}

/**
 * React hook for managing Study Design module navigation
 * Provides context-aware navigation and breadcrumb management
 * Created: September 13, 2025
 */
export const useStudyNavigation = (): UseStudyNavigationReturn => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract study ID from current path
  const getCurrentStudyId = useCallback((): string | null => {
    const pathParts = location.pathname.split('/');
    const studyIndex = pathParts.indexOf('study');
    
    if (studyIndex !== -1 && pathParts[studyIndex + 1]) {
      return pathParts[studyIndex + 1];
    }
    
    return null;
  }, [location.pathname]);

  // Get current navigation context
  const getCurrentContext = useCallback((): NavigationContext => {
    const path = location.pathname;
    const studyId = getCurrentStudyId();

    if (path.includes('/trialdesign/studies') && !studyId) {
      return { type: 'study-list', studyId: null };
    }
    
    if (path.includes('/study/') && path.includes('/edit')) {
      return { type: 'study-edit', studyId };
    }
    
    if (path.includes('/study/') && path.includes('/design')) {
      const phasePart = path.split('/design/')[1];
      return { 
        type: 'study-design', 
        studyId,
        phase: phasePart?.split('/')[0]
      };
    }
    
    if (path.includes('/study/') && path.includes('/forms')) {
      return { type: 'study-forms', studyId };
    }
    
    if (path.includes('/quick-register')) {
      return { type: 'quick-register', studyId: null };
    }
    
    if (path.includes('/study/')) {
      return { type: 'study-detail', studyId };
    }

    return { type: 'unknown', studyId: null };
  }, [location.pathname, getCurrentStudyId]);

  // Check if currently in a study context
  const isInStudyContext = useCallback((): boolean => {
    const context = getCurrentContext();
    return context.studyId !== null;
  }, [getCurrentContext]);

  // Get destination path for back navigation
  const getBackDestination = useCallback((): string => {
    const context = getCurrentContext();
    
    switch (context.type) {
      case 'study-edit':
      case 'study-design':
      case 'study-forms':
        return `/trialdesign/study/${context.studyId}`;
      
      case 'study-detail':
        return '/trialdesign/studies';
      
      case 'quick-register':
        return '/trialdesign/studies';
      
      default:
        return '/trialdesign/studies';
    }
  }, [getCurrentContext]);

  // Generate breadcrumb information
  const getBreadcrumbInfo = useCallback((): BreadcrumbItem[] => {
    const context = getCurrentContext();
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Studies', path: '/trialdesign/studies' }
    ];

    if (context.studyId) {
      breadcrumbs.push({
        label: `Study ${context.studyId}`,
        path: `/trialdesign/study/${context.studyId}`
      });

      switch (context.type) {
        case 'study-edit':
          breadcrumbs.push({ label: 'Edit', path: null });
          break;
        case 'study-design':
          breadcrumbs.push({ label: 'Design', path: null });
          if (context.phase) {
            breadcrumbs.push({ label: context.phase, path: null });
          }
          break;
        case 'study-forms':
          breadcrumbs.push({ label: 'Forms', path: null });
          break;
      }
    } else if (context.type === 'quick-register') {
      breadcrumbs.push({ label: 'Quick Register', path: null });
    }

    return breadcrumbs;
  }, [getCurrentContext]);

  // Navigation functions
  const navigateBack = useCallback(() => {
    const destination = getBackDestination();
    navigate(destination);
  }, [navigate, getBackDestination]);

  const navigateToStudy = useCallback((studyId: string | number) => {
    navigate(`/trialdesign/study/${studyId}`);
  }, [navigate]);

  const navigateToStudyEdit = useCallback((studyId: string | number) => {
    navigate(`/trialdesign/study/${studyId}/edit`);
  }, [navigate]);

  const navigateToStudyDesign = useCallback((studyId: string | number, phase?: string) => {
    const basePath = `/trialdesign/study/${studyId}/design`;
    navigate(phase ? `${basePath}/${phase}` : basePath);
  }, [navigate]);

  const navigateToStudyForms = useCallback((studyId: string | number) => {
    navigate(`/trialdesign/study/${studyId}/forms`);
  }, [navigate]);

  const navigateToStudiesList = useCallback(() => {
    navigate('/trialdesign/studies');
  }, [navigate]);

  const navigateToCreateStudy = useCallback(() => {
    navigate('/trialdesign/study/create');
  }, [navigate]);

  const navigateToQuickRegister = useCallback(() => {
    navigate('/trialdesign/quick-register');
  }, [navigate]);

  return {
    // Navigation functions
    navigateBack,
    navigateToStudy,
    navigateToStudyEdit,
    navigateToStudyDesign,
    navigateToStudyForms,
    navigateToStudiesList,
    navigateToCreateStudy,
    navigateToQuickRegister,

    // Context helpers
    getCurrentStudyId,
    getCurrentContext,
    isInStudyContext,
    getBreadcrumbInfo,
    getBackDestination
  };
};
