import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const FormList = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            setLoading(true);

            // Mock data instead of API call
            const mockForms = [
                {
                    id: 'FORM-001',
                    name: 'Patient Demographics Form',
                    description: 'Standard demographic information collection',
                    type: 'Demographics',
                    version: '2.1',
                    status: 'Published',
                    updatedAt: '2024-03-10T10:30:00Z'
                },
                {
                    id: 'FORM-002',
                    name: 'Adverse Event Report',
                    description: 'Comprehensive adverse event documentation',
                    type: 'Safety',
                    version: '1.5',
                    status: 'Published',
                    updatedAt: '2024-03-08T14:20:00Z'
                },
                {
                    id: 'FORM-003',
                    name: 'Laboratory Results Entry',
                    description: 'Lab values and test results',
                    type: 'Laboratory',
                    version: '3.0',
                    status: 'Draft',
                    updatedAt: '2024-03-12T09:15:00Z'
                },
                {
                    id: 'FORM-004',
                    name: 'Medication History',
                    description: 'Prior and concomitant medication tracking',
                    type: 'Medical History',
                    version: '1.8',
                    status: 'Published',
                    updatedAt: '2024-03-05T16:45:00Z'
                },
                {
                    id: 'FORM-005',
                    name: 'Visit Compliance Checklist',
                    description: 'Protocol compliance verification',
                    type: 'Compliance',
                    version: '1.0',
                    status: 'Draft',
                    updatedAt: '2024-03-11T11:22:00Z'
                }
            ];

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            setForms(mockForms);
            setLoading(false);
        } catch (err) {
            setError('Failed to load forms');
            setLoading(false);
            console.error(err);
        }
    };

    const handleDeleteForm = async (formId) => {
        if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
            try {
                // Mock delete operation instead of API call
                // await FormService.deleteForm(formId);

                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // Remove form from the list
                setForms(forms.filter(form => form.id !== formId));
                alert('Form deleted successfully');
            } catch (err) {
                alert(`Error deleting form: ${err.message || 'Unknown error'}`);
                console.error(err);
            }
        }
    };

    const handleCreateForm = () => {
        navigate('/study-design/forms/builder');
    };

    if (loading) return (
        <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading forms...</span>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error Loading Forms</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Form Library</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage clinical research forms and CRF templates
                    </p>
                </div>
                <button
                    onClick={handleCreateForm}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Form
                </button>
            </div>

            {forms.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found in your library</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first clinical research form.</p>
                    <button
                        onClick={handleCreateForm}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Create Your First Form
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Form Details
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Updated
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Version
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {forms.map((form) => (
                                <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{form.name}</div>
                                            {form.description && (
                                                <div className="text-sm text-gray-500 mt-1">{form.description}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {form.type || 'Custom'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(form.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                            v{form.version || '1.0'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${form.status === 'Published' ? 'bg-green-100 text-green-800' :
                                            form.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                            {form.status || 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <Link
                                                to={`/study-design/forms/${form.id}/versions`}
                                                className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                                            >
                                                Versions
                                            </Link>
                                            <Link
                                                to={`/study-design/forms/builder/${form.id}`}
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteForm(form.id)}
                                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
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

export default FormList;
