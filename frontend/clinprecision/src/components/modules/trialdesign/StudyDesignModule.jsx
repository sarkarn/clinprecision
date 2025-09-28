import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import TopNavigationHeader from '../../shared/TopNavigationHeader';
import StudyRegister from './StudyRegister';
import StudyCreationWizard from './study-creation/StudyCreationWizard';
import StudyEditWizard from './study-creation/StudyEditWizard';
import StudyListGrid from './study-management/StudyListGrid';
import StudyOverviewDashboard from './study-management/StudyOverviewDashboard';
import VersionManagementModal from './study-management/VersionManagementModal';
import StudyDesignDashboard from './study-design/StudyDesignDashboard';
import ProtocolManagementDashboard from './protocol-management/ProtocolManagementDashboard';
import StudyViewPage from './StudyViewPage';
import FormList from './FormList';
import StudyFormList from './StudyFormList';
import FormDesigner from './FormDesigner';
import FormVersionHistory from '../../common/forms/FormVersionHistory';
import FormVersionViewer from '../../common/forms/FormVersionViewer';
import CRFBuilderIntegration from '../../common/forms/CRFBuilderIntegration';
import EnhancedDashboardMetrics from './components/EnhancedDashboardMetrics';
import { useAuth } from '../../login/AuthContext';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';
import { useStudyNavigation } from './hooks/useStudyNavigation';

// Enhanced Breadcrumb component with improved route handling
const Breadcrumb = () => {
  const { getBreadcrumbInfo } = useStudyNavigation();
  const navigate = useNavigate();

  const breadcrumbs = getBreadcrumbInfo();

  return (
    <nav className="flex items-center text-sm text-gray-600 mb-4 bg-gray-50 px-4 py-2 rounded-lg" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}

            {crumb.path ? (
              <button
                onClick={() => navigate(crumb.path)}
                className="text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center"
                aria-label={`Go to ${crumb.label}`}
              >
                {index === 0 && (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l4-4 4 4" />
                  </svg>
                )}
                {crumb.label}
              </button>
            ) : (
              <span className="font-medium text-blue-600" aria-current="page">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

const StudyDesignModule = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Dashboard metrics hook
  const { metrics, loading, error, refreshMetrics } = useDashboardMetrics();

  // State for version management modal
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [selectedStudyForVersion, setSelectedStudyForVersion] = useState(null);

  // Since ALL routes go through Home component which already provides TopNavigationHeader,
  // StudyDesignModule should never show its own header when accessed through the app
  // Only show header for study-specific contexts (forms, design sub-routes)
  const isDirectNavigation = false; // Always false since we're always embedded in Home

  // Check if we're embedded within the Home component (not direct navigation)
  const isEmbeddedInHome = location.pathname.startsWith('/study-design');

  // Check if we're in a study-specific context (should hide main navigation)
  const isStudySpecificContext = () => {
    const path = location.pathname;
    // Hide header for study sub-routes: forms, design, etc. 
    // But show header for main study overview (/study-design/study/:studyId)
    const pathParts = path.split('/');
    if (pathParts.includes('study') && pathParts.length > 4) {
      // If we have more than 4 parts and includes 'study', we're in a sub-context
      return true;
    }
    return false;
  };

  // Modern study management handlers
  const handleCreateNewStudy = () => {
    navigate('/study-design/create', { replace: true });
  };

  const handleViewStudy = (study) => {
    navigate(`/study-design/study/${study.id}`, { replace: true });
  };

  const handleEditStudy = (study) => {
    navigate(`/study-design/edit/${study.id}`, { replace: true });
  };

  const handleDesignStudy = (study) => {
    navigate(`/study-design/study/${study.id}/design/basic-info`, { replace: true });
  };

  const handleManageProtocols = (study) => {
    navigate(`/study-design/study/${study.id}/protocols`, { replace: true });
  };

  const handleDeleteStudy = (study) => {
    // Handle study deletion
    console.log('Delete study:', study.id);
    // Add confirmation dialog and API call here
  };

  const handleCreateVersion = (study) => {
    setSelectedStudyForVersion(study);
    setShowVersionModal(true);
  };

  const handleVersionCreated = (newVersion) => {
    console.log('New version created:', newVersion);
    setShowVersionModal(false);
    setSelectedStudyForVersion(null);
    // Refresh the current view or navigate as needed
  };

  const handleBackToDashboard = () => {
    navigate('/study-design/studies', { replace: true });
  };

  // Dashboard component with modern design
  const renderModernDashboard = () => (
    <div className="space-y-6">
      {/* Enhanced Dashboard Metrics */}
      <EnhancedDashboardMetrics
        metrics={metrics}
        loading={loading}
        error={error}
        onRefresh={refreshMetrics}
        isDataFresh={true} // Could be enhanced with actual freshness logic
      />

      <StudyListGrid
        onCreateNew={handleCreateNewStudy}
        onViewStudy={handleViewStudy}
        onEditStudy={handleEditStudy}
        onDesignStudy={handleDesignStudy}
        onManageProtocols={handleManageProtocols}
        onDeleteStudy={handleDeleteStudy}
      />
    </div>
  );

  return (
    <div className={isDirectNavigation ? "min-h-screen flex flex-col" : ""}>
      {/* Only show header when navigated to directly, not when inside Home */}
      {isDirectNavigation && (
        <TopNavigationHeader
          showFullNavigation={false}
          className="fixed top-0 left-0 right-0"
        />
      )}

      {/* Main Content Area - conditionally add margin-top */}
      <div className={`container mx-auto px-4 pb-4 flex-1 ${isDirectNavigation ? "mt-16" : isEmbeddedInHome ? "pt-0" : "pt-4"}`}>
        {/* Breadcrumb navigation */}
        <Breadcrumb />

        {/* Main navigation header - only show when accessed directly, not through Home */}
        {isDirectNavigation && !isStudySpecificContext() && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Study Design</h2>
            <p className="text-gray-600 mb-4">Design and manage clinical trial protocols with comprehensive study management tools</p>
          </div>
        )}

        <Routes>
          {/* Modern study management routes */}
          <Route path="studies" element={renderModernDashboard()} />
          <Route
            path="study/:studyId"
            element={
              <StudyOverviewDashboard
                studyId={location.pathname.split('/').pop()}
                onBack={handleBackToDashboard}
                onEdit={handleEditStudy}
                onCreateVersion={handleCreateVersion}
              />
            }
          />

          {/* Study creation and editing */}
          <Route
            path="create/*"
            element={
              <StudyCreationWizard
                onComplete={(studyData) => {
                  console.log('Study created:', studyData);
                  navigate('studies');
                }}
                onCancel={() => navigate('studies')}
              />
            }
          />

          {/* Legacy routes for backward compatibility */}
          <Route path="register" element={<StudyRegister />} />
          <Route path="edit/:studyId" element={<StudyEditWizard />} />
          <Route path="view/:studyId" element={<StudyViewPage />} />

          {/* Form Management Routes */}
          <Route path="forms" element={<FormList />} />
          <Route path="forms/designer" element={<FormDesigner />} />
          <Route path="forms/designer/:formId" element={<FormDesigner />} />
          <Route path="forms/:formId/versions" element={<FormVersionHistory />} />
          <Route path="forms/:formId/versions/:versionId/view" element={<FormVersionViewer />} />
          <Route path="forms/builder" element={<CRFBuilderIntegration />} />
          <Route path="forms/builder/:formId" element={<CRFBuilderIntegration />} />
          <Route path="forms/builder/:formId/:versionId" element={<CRFBuilderIntegration />} />

          {/* Study-specific Form Management Routes */}
          <Route path="study/:studyId/forms" element={<StudyFormList />} />
          <Route path="study/:studyId/forms/designer" element={<FormDesigner />} />
          <Route path="study/:studyId/forms/designer/:formId" element={<FormDesigner />} />
          <Route path="study/:studyId/forms/:formId/versions" element={<FormVersionHistory />} />
          <Route path="study/:studyId/forms/:formId/versions/:versionId/view" element={<FormVersionViewer />} />
          <Route path="study/:studyId/forms/builder" element={<CRFBuilderIntegration />} />
          <Route path="study/:studyId/forms/builder/:formId" element={<CRFBuilderIntegration />} />
          <Route path="study/:studyId/forms/builder/:formId/:versionId" element={<CRFBuilderIntegration />} />

          {/* Study Design Workflow - New comprehensive design flow */}
          <Route path="study/:studyId/design/*" element={<StudyDesignDashboard />} />

          {/* Protocol Management - Dedicated protocol version management */}
          <Route path="study/:studyId/protocols" element={<ProtocolManagementDashboard />} />

          {/* Default to modern study dashboard */}
          <Route index element={<Navigate to="studies" replace />} />
        </Routes>
      </div>

      {/* Version Management Modal */}
      <VersionManagementModal
        isOpen={showVersionModal}
        onClose={() => {
          setShowVersionModal(false);
          setSelectedStudyForVersion(null);
        }}
        study={selectedStudyForVersion}
        onVersionCreated={handleVersionCreated}
      />
    </div>
  );
};

export default StudyDesignModule;