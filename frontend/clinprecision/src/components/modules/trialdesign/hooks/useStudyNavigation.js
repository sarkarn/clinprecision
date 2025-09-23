import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Custom hook for consistent navigation behavior across Study Design module
 * Provides intelligent back navigation and context-aware routing
 */
export const useStudyNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get current study ID from URL path
  const getCurrentStudyId = useCallback(() => {
    const pathParts = location.pathname.split('/');
    const studyIndex = pathParts.findIndex(part => part === 'study');
    if (studyIndex !== -1 && pathParts[studyIndex + 1]) {
      return pathParts[studyIndex + 1];
    }
    return null;
  }, [location.pathname]);

  // Determine the appropriate back destination based on current context
  const getBackDestination = useCallback(() => {
    const path = location.pathname;
    const studyId = getCurrentStudyId();

    // Handle specific navigation contexts
    if (path.includes('/design/')) {
      // From design phase back to study overview
      return studyId ? `/study-design/study/${studyId}` : '/study-design/studies';
    }
    
    if (path.includes('/forms/')) {
      // From forms back to study overview
      return studyId ? `/study-design/study/${studyId}` : '/study-design/studies';
    }
    
    if (path.includes('/edit/')) {
      // From edit back to study overview
      return studyId ? `/study-design/study/${studyId}` : '/study-design/studies';
    }
    
    if (path.includes('/create')) {
      // From create back to studies list
      return '/study-design/studies';
    }
    
    if (path.includes('/register')) {
      // From register back to studies list
      return '/study-design/studies';
    }
    
    if (path.match(/\/study\/\d+$/)) {
      // From study overview back to studies list
      return '/study-design/studies';
    }

    // Default fallback
    return '/study-design/studies';
  }, [location.pathname, getCurrentStudyId]);

  // Navigate back with context awareness
  const navigateBack = useCallback((customDestination = null) => {
    // Ensure customDestination is a string or null, not an event object
    const destination = (typeof customDestination === 'string' ? customDestination : null) || getBackDestination();
    navigate(destination, { replace: false });
  }, [navigate, getBackDestination]);

  // Navigate to specific study contexts
  const navigateToStudy = useCallback((studyId) => {
    // Ensure studyId is valid
    if (typeof studyId === 'string' || typeof studyId === 'number') {
      navigate(`/study-design/study/${studyId}`);
    }
  }, [navigate]);

  const navigateToStudyEdit = useCallback((studyId) => {
    // Ensure studyId is valid
    if (typeof studyId === 'string' || typeof studyId === 'number') {
      navigate(`/study-design/edit/${studyId}`);
    }
  }, [navigate]);

  const navigateToStudyDesign = useCallback((studyId, phase = 'basic-info') => {
    // Ensure studyId is valid
    if (typeof studyId === 'string' || typeof studyId === 'number') {
      navigate(`/study-design/study/${studyId}/design/${phase}`);
    }
  }, [navigate]);

  const navigateToStudyForms = useCallback((studyId) => {
    // Ensure studyId is valid
    if (typeof studyId === 'string' || typeof studyId === 'number') {
      navigate(`/study-design/study/${studyId}/forms`);
    }
  }, [navigate]);

  const navigateToStudiesList = useCallback(() => {
    navigate('/study-design/studies');
  }, [navigate]);

  const navigateToCreateStudy = useCallback(() => {
    navigate('/study-design/create');
  }, [navigate]);

  const navigateToQuickRegister = useCallback(() => {
    navigate('/study-design/register');
  }, [navigate]);

  // Get current context information
  const getCurrentContext = useCallback(() => {
    const path = location.pathname;
    const studyId = getCurrentStudyId();

    if (path.includes('/design/')) {
      const phase = path.split('/design/')[1]?.split('/')[0];
      return { type: 'design', studyId, phase };
    }
    
    if (path.includes('/forms/')) {
      return { type: 'forms', studyId };
    }
    
    if (path.includes('/edit/')) {
      return { type: 'edit', studyId };
    }
    
    if (path.includes('/create')) {
      return { type: 'create', studyId: null };
    }
    
    if (path.includes('/register')) {
      return { type: 'register', studyId: null };
    }
    
    if (path.match(/\/study\/\d+$/)) {
      return { type: 'overview', studyId };
    }
    
    if (path.includes('/studies')) {
      return { type: 'list', studyId: null };
    }

    return { type: 'unknown', studyId };
  }, [location.pathname, getCurrentStudyId]);

  // Check if we're in a study-specific context
  const isInStudyContext = useCallback(() => {
    return getCurrentStudyId() !== null;
  }, [getCurrentStudyId]);

  // Get breadcrumb information
  const getBreadcrumbInfo = useCallback(() => {
    const context = getCurrentContext();
    const breadcrumbs = [
      { label: 'Home', path: '/' },
      { label: 'Study Design', path: '/study-design' }
    ];

    if (context.type === 'list') {
      breadcrumbs.push({ label: 'Studies', path: '/study-design/studies' });
    } else if (context.type === 'create') {
      breadcrumbs.push({ label: 'Studies', path: '/study-design/studies' });
      breadcrumbs.push({ label: 'Create Study', path: null });
    } else if (context.type === 'register') {
      breadcrumbs.push({ label: 'Studies', path: '/study-design/studies' });
      breadcrumbs.push({ label: 'Quick Register', path: null });
    } else if (context.studyId) {
      breadcrumbs.push({ label: 'Studies', path: '/study-design/studies' });
      breadcrumbs.push({ 
        label: 'Study Overview', 
        path: context.type === 'overview' ? null : `/study-design/study/${context.studyId}` 
      });
      
      if (context.type === 'edit') {
        breadcrumbs.push({ label: 'Edit Study', path: null });
      } else if (context.type === 'design') {
        breadcrumbs.push({ label: 'Design', path: null });
      } else if (context.type === 'forms') {
        breadcrumbs.push({ label: 'Forms', path: null });
      }
    }

    return breadcrumbs;
  }, [getCurrentContext]);

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
    
    // Context information
    getCurrentStudyId,
    getCurrentContext,
    isInStudyContext,
    getBreadcrumbInfo,
    getBackDestination,
    
    // Current location info
    pathname: location.pathname,
    location
  };
};