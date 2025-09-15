import { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import TopNavigationHeader from '../../shared/TopNavigationHeader';
import StudyRegister from './StudyRegister';
import StudyCreationWizard from './study-creation/StudyCreationWizard';
import StudyEditWizard from './study-creation/StudyEditWizard';
import StudyListGrid from './study-management/StudyListGrid';
import StudyOverviewDashboard from './study-management/StudyOverviewDashboard';
import VersionManagementModal from './study-management/VersionManagementModal';
import StudyDesignDashboard from './study-design/StudyDesignDashboard';
import StudyViewPage from './StudyViewPage';
import FormList from './FormList';
import StudyFormList from './StudyFormList';
import FormDesigner from './FormDesigner';
import FormVersionHistory from './FormVersionHistory';
import FormVersionViewer from './FormVersionViewer';
import CRFBuilderIntegration from './CRFBuilderIntegration';
import { useAuth } from '../../login/AuthContext';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';

// Breadcrumb component
const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Find the study-design index to build proper paths
  const studyDesignIndex = pathnames.indexOf('study-design');
  const relevantPathnames = studyDesignIndex >= 0 ? pathnames.slice(studyDesignIndex + 1) : [];

  return (
    <div className="flex items-center text-sm text-gray-600 mb-2">
      <span
        className="cursor-pointer hover:text-blue-600"
        onClick={() => navigate('/')}
      >
        Home
      </span>
      <span className="mx-2">/</span>
      <span
        className="cursor-pointer hover:text-blue-600"
        onClick={() => navigate('/study-design')}
      >
        Study Design
      </span>

      {relevantPathnames.map((name, index) => {
        // Build the absolute path up to this point
        const pathUpToHere = '/study-design/' + relevantPathnames.slice(0, index + 1).join('/');

        // Get display name for breadcrumb item
        let displayName;
        if (name === 'studies') displayName = 'Studies';
        else if (name === 'study') displayName = 'Study Details';
        else if (name === 'register') displayName = 'Register Study';
        else if (name === 'create') displayName = 'Create Study';
        else if (name === 'edit') displayName = 'Edit Study';
        else if (name === 'view') displayName = 'View Study';
        else if (name === 'forms') displayName = 'Forms';
        else if (name === 'designer') displayName = 'Form Designer';
        else if (name === 'versions') displayName = 'Form Versions';
        else if (name === 'builder') displayName = 'CRF Builder';
        else if (index === relevantPathnames.length - 1 && !isNaN(name)) {
          // Skip numeric IDs in the display, but keep them in the path
          return null;
        } else {
          displayName = name.charAt(0).toUpperCase() + name.slice(1);
        }

        return (
          <div key={index}>
            <span className="mx-2">/</span>
            {index === relevantPathnames.length - 1 ? (
              <span className="font-medium text-blue-600">{displayName}</span>
            ) : (
              <span
                className="cursor-pointer hover:text-blue-600"
                onClick={() => navigate(pathUpToHere)}
              >
                {displayName}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const StudyDesignModule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  // Dashboard metrics hook
  const { metrics, loading, error, refreshMetrics, hasData } = useDashboardMetrics();

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
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Design Dashboard</h1>
            <p className="text-gray-600">Manage clinical trial studies and protocols with industry-standard versioning</p>
            {hasData && metrics.lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refreshMetrics}
              disabled={loading}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${loading
                ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              title="Refresh metrics"
            >
              <svg
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="ml-2">{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Studies</h3>
          <p className="text-3xl font-bold text-blue-600">
            {loading ? '...' : (hasData ? metrics.activeStudies : '–')}
          </p>
          <p className="text-sm text-gray-500">Currently recruiting</p>
          {error && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ {error}
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Draft Protocols</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {loading ? '...' : (hasData ? metrics.draftProtocols : '–')}
          </p>
          <p className="text-sm text-gray-500">Awaiting approval</p>
          {error && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ {error}
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Studies</h3>
          <p className="text-3xl font-bold text-green-600">
            {loading ? '...' : (hasData ? metrics.completedStudies : '–')}
          </p>
          <p className="text-sm text-gray-500">Data analysis complete</p>
          {error && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ {error}
            </p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Amendments</h3>
          <p className="text-3xl font-bold text-purple-600">
            {loading ? '...' : (hasData ? metrics.totalAmendments : '–')}
          </p>
          <p className="text-sm text-gray-500">Protocol versions</p>
          {error && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ {error}
            </p>
          )}
        </div>
      </div>

      <StudyListGrid
        onCreateNew={handleCreateNewStudy}
        onViewStudy={handleViewStudy}
        onEditStudy={handleEditStudy}
        onDesignStudy={handleDesignStudy}
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
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => navigate('/study-design/create', { replace: true })}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create New Study
              </button>
              <button
                onClick={() => navigate('/study-design/studies', { replace: true })}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Manage Studies
              </button>
              <button
                onClick={() => navigate('/study-design/register', { replace: true })}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Quick Register
              </button>
              <button
                onClick={() => navigate('/study-design/forms', { replace: true })}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Manage Forms
              </button>
            </div>
          </div>
        )}

        {/* Action buttons for Study Design landing page - show when on main study-design route */}
        {location.pathname === '/study-design' && !isStudySpecificContext() && (
          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => navigate('/study-design/create', { replace: true })}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create New Study
              </button>
              <button
                onClick={() => navigate('/study-design/studies', { replace: true })}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Manage Studies
              </button>
              <button
                onClick={() => navigate('/study-design/register', { replace: true })}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Quick Register
              </button>
              <button
                onClick={() => navigate('/study-design/forms', { replace: true })}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Manage Forms
              </button>
            </div>
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

          {/* Default to modern study dashboard */}
          <Route index element={renderModernDashboard()} />
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