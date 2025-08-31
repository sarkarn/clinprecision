import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getStudies } from '../../../services/StudyService';
import StudyEditPage from './StudyEditPage';
import StudyViewPage from './StudyViewPage';
import StudyRegister from './StudyRegister';
import StudyList from './StudyList'; // Import the new component

const StudyDesignModule = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
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
        <Route path="list" element={<StudyList />} /> {/* Use the extracted component */}
        <Route path="edit/:studyId" element={<StudyEditPage />} />
        <Route path="view/:studyId" element={<StudyViewPage />} />
        {/* Default to Study Register */}
        <Route index element={<StudyRegister />} />
      </Routes>
    </div>
  );
};

export default StudyDesignModule;