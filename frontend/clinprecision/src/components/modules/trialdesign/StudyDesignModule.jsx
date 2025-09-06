import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import StudyRegister from './StudyRegister';
import StudyEditPage from './StudyEditPage';
import StudyViewPage from './StudyViewPage';
import StudyList from './StudyList';
import { useAuth } from '../../login/AuthContext';
import Logout from '../../login/Logout';

// Breadcrumb component
const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Remove the module name from breadcrumbs since we're already in that module
  const relevantPathnames = pathnames.filter(name => name !== 'study-design');

  let breadcrumbPath = '';

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
        breadcrumbPath += `/${name}`;

        // Get display name for breadcrumb item
        let displayName;
        if (name === 'list') displayName = 'Study List';
        else if (name === 'register') displayName = 'Register Study';
        else if (name === 'edit') displayName = 'Edit Study';
        else if (name === 'view') displayName = 'View Study';
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
                onClick={() => navigate(`/study-design${breadcrumbPath}`)}
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

  // Check if we're being rendered directly or within Home component
  const isDirectNavigation = location.pathname.split('/').length <= 2;

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
              onClick={() => navigate('/study-design/register')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Register Study
            </button>
            <button
              onClick={() => navigate('/study-design/list')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              View Studies
            </button>
          </div>
        </div>

        <Routes>
          <Route path="register" element={<StudyRegister />} />
          <Route path="list" element={<StudyList />} />
          <Route path="edit/:studyId" element={<StudyEditPage />} />
          <Route path="view/:studyId" element={<StudyViewPage />} />
          {/* Default to Study Register */}
          <Route index element={<StudyRegister />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudyDesignModule;