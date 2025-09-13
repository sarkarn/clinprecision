import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import StudyRegister from './StudyRegister';
import StudyCreationWizard from './study-creation/StudyCreationWizard';
import StudyEditWizard from './study-creation/StudyEditWizard';
import StudyListGrid from './study-management/StudyListGrid';
import StudyOverviewDashboard from './study-management/StudyOverviewDashboard';
import VersionManagementModal from './study-management/VersionManagementModal';
import StudyDesignDashboard from './study-design/StudyDesignDashboard';
import StudyEditPage from './StudyEditPage';
import StudyViewPage from './StudyViewPage';
import FormList from './FormList';
import FormDesigner from './FormDesigner';
import FormVersionHistory from './FormVersionHistory';
import FormVersionViewer from './FormVersionViewer';
import CRFBuilderIntegration from './CRFBuilderIntegration';
import { useAuth } from '../../login/AuthContext';
import Logout from '../../login/Logout';

// Breadcrumb component
const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Find the study-design index to build proper paths
  const studyDesignIndex = pathnames.indexOf('study-design');
  const relevantPathnames = studyDesignIndex >= 0 ? pathnames.slice(studyDesignIndex + 1) : [];

  return (
    <div className="flex items-center text-sm text-gray-600 mb-4">
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
          <React.Fragment key={index}>
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
          </React.Fragment>
        );
      })}
    </div>
  );
};

const StudyDesignModule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  // State for version management modal
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [selectedStudyForVersion, setSelectedStudyForVersion] = useState(null);

  // Check if we're being rendered directly or within Home component
  const isDirectNavigation = location.pathname.split('/').length <= 2;

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Design Dashboard</h1>
        <p className="text-gray-600">Manage clinical trial studies and protocols with industry-standard versioning</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Studies</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
          <p className="text-sm text-gray-500">Currently recruiting</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Draft Protocols</h3>
          <p className="text-3xl font-bold text-yellow-600">5</p>
          <p className="text-sm text-gray-500">Awaiting approval</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Studies</h3>
          <p className="text-3xl font-bold text-green-600">8</p>
          <p className="text-sm text-gray-500">Data analysis complete</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Amendments</h3>
          <p className="text-3xl font-bold text-purple-600">23</p>
          <p className="text-sm text-gray-500">Protocol versions</p>
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
        <header className="fixed top-0 left-0 right-0 bg-white shadow flex justify-between items-center px-8 py-4 z-10">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-blue-600">ClinicalConnect</h1>
            <Link to="/reports" className="text-gray-700 hover:text-blue-600">Reports</Link>
            <Link to="/help" className="text-gray-700 hover:text-blue-600">Documentation</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-700 hover:text-blue-600">Administration</Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-gray-600">{user.username || user.email}</span>
                <Logout />
              </>
            )}
          </div>
        </header>
      )}

      {/* Main Content Area - conditionally add margin-top */}
      <div className={`container mx-auto px-4 pb-4 flex-1 ${isDirectNavigation ? "mt-16" : "pt-0"}`}>
        {/* Breadcrumb navigation */}
        <Breadcrumb />

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