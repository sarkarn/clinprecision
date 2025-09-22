import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormService from '../../../services/FormService';

const FormTemplateManagement = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFormTemplates();
    }, []);

    const fetchFormTemplates = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch global form templates from Admin Service
            const formsData = await FormService.getForms();
            setForms(formsData);
            setLoading(false);
        } catch (err) {
            setError('Failed to load form templates');
            setLoading(false);
            console.error('Error fetching form templates:', err);
        }
    };

    const handleDeleteForm = async (formId) => {
        if (window.confirm('Are you sure you want to delete this form template? This action cannot be undone.')) {
            try {
                await FormService.deleteForm(formId);
                // Remove form from the list
                setForms(forms.filter(form => form.id !== formId));
                alert('Form template deleted successfully');
            } catch (err) {
                alert(`Error deleting form template: ${err.message || 'Unknown error'}`);
                console.error('Error deleting form template:', err);
            }
        }
    };

    const handleCreateForm = () => {
        navigate('/user-management/form-templates/builder');
    };

    const handleEditForm = (formId) => {
        navigate(`/user-management/form-templates/builder/${formId}`);
    };

    const handlePreviewForm = (formId) => {
        navigate(`/user-management/form-templates/preview/${formId}`);
    };

    const handleFormVersions = (formId) => {
        navigate(`/user-management/form-templates/${formId}/versions`);
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'published':
                return 'bg-green-100 text-green-800';
            case 'approved':
                return 'bg-blue-100 text-blue-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'retired':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading form templates...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Form Templates</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchFormTemplates}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-semibold">Form Templates</h3>
                        <p className="text-gray-600 mt-1">
                            Manage reusable form templates for standardization across studies
                        </p>
                    </div>
                    <Link
                        to="/user-management"
                        className="text-blue-600 hover:underline flex items-center"
                    >
                        ← Back to Administration
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Organization Form Templates
                            </h2>
                            <p className="text-gray-500 mt-2">
                                Reusable form templates available across all studies in your organization
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCreateForm}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create New Template
                            </button>
                        </div>
                    </div>
                </div>

                {/* Form Templates List */}
                {forms.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-400 text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Form Templates Available</h3>
                        <p className="text-gray-500 mb-6">
                            No form templates have been created for your organization yet.
                        </p>
                        <button
                            onClick={handleCreateForm}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Create Your First Template
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Template Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Count</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {forms.map((form) => (
                                    <tr key={form.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="ml-4 min-w-0 flex-1">
                                                    <div className="text-sm font-medium text-gray-900 break-words">{form.name}</div>
                                                    <div className="text-sm text-gray-500 break-words mt-1">{form.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                {form.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {form.version || '1.0'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(form.status)}`}>
                                                {form.status || 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {form.usageCount || 0} studies
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {form.updatedAt ? new Date(form.updatedAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handlePreviewForm(form.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Preview Template"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    onClick={() => handleEditForm(form.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Edit Template"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleFormVersions(form.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                    title="Version History"
                                                >
                                                    🕐
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteForm(form.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete Template"
                                                >
                                                    🗑️
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
        </div>
    );
};

export default FormTemplateManagement;