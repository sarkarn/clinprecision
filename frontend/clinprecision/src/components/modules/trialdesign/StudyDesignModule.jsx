import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getStudies } from '../../../services/StudyService';
import StudyEditPage from './StudyEditPage';

// Placeholder component for Study Register
const StudyRegister = () => (
  <div>
    <h3 className="text-xl font-bold mb-4">Study Register</h3>
    <p>Register a new study here.</p>
  </div>
);

// Updated ListOfStudies component that fetches data from StudyService
const ListOfStudies = () => {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const studiesData = await getStudies();
        setStudies(studiesData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load studies');
        setLoading(false);
        console.error(err);
      }
    };

    fetchStudies();
  }, []);

  const handleEditStudy = (studyId) => {
    navigate(`/study-design/edit/${studyId}`);
  };

  if (loading) return <div className="text-center py-4">Loading studies...</div>;
  if (error) return <div className="text-red-500 py-4">{error}</div>;

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">List of Studies</h3>
      {studies.length === 0 ? (
        <p>No studies found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {studies.map((study) => (
                <tr key={study.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{study.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{study.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{study.phase}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${study.status === 'Active' ? 'bg-green-100 text-green-800' :
                        study.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          study.status === 'Recruiting' ? 'bg-purple-100 text-purple-800' :
                            study.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'}`}>
                      {study.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{study.startDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{study.endDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                    <button
                      onClick={() => handleEditStudy(study.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const StudyDesignModule = () => (
  <div className="min-h-screen flex flex-col">
    <header className="bg-white shadow px-8 py-4">
      <Link to="/" className="text-blue-600 hover:underline">
        &larr; Back to Home
      </Link>
    </header>
    <div className="flex flex-1">
      {/* Module-specific side nav and content */}
      <nav className="w-64 bg-white shadow p-6 flex flex-col">
        <h2 className="text-lg font-bold mb-6">Study Design</h2>
        <Link
          to="register"
          className="mb-4 px-4 py-2 rounded hover:bg-blue-100 text-blue-700"
        >
          Study Register
        </Link>
        <Link
          to="list"
          className="px-4 py-2 rounded hover:bg-blue-100 text-blue-700"
        >
          List of Studies
        </Link>
      </nav>
      <main className="flex-1 p-8">
        <Routes>
          <Route path="register" element={<StudyRegister />} />
          <Route path="list" element={<ListOfStudies />} />
          <Route path="edit/:studyId" element={<StudyEditPage />} />
          {/* Default to Study Register */}
          <Route index element={<StudyRegister />} />
        </Routes>
      </main>
    </div>
  </div>
);

export default StudyDesignModule;