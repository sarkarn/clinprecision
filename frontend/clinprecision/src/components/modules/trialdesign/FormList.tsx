import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormService from '../../../services/FormService';

interface Study {
    id: string | number;
    name: string;
    protocol: string;
    phase: string;
    status: string;
}

interface Form {
    id: string | number;
    name: string;
    description?: string;
    type: string;
    version: string | number;
    status: string;
    binding?: string;
    visits?: string[];
    updatedAt?: string;
}

const FormList: React.FC = () => {
    const { studyId } = useParams<{ studyId: string }>();
    const [study, setStudy] = useState<Study | null>(null);
    const [forms, setForms] = useState<Form[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (studyId) {
            fetchStudyAndForms();
        } else {
            fetchForms();
        }
    }, [studyId]);

    const fetchStudyAndForms = async (): Promise<void> => {
        try {
            setLoading(true);

            // Mock study data
            const mockStudy: Study = {
                id: studyId!,
                name: 'Phase III Oncology Trial - Advanced NSCLC',
                protocol: 'ONCO-2024-001',
                phase: 'Phase III',
                status: 'Design'
            };

            setStudy(mockStudy);

            // Fetch study-specific forms
            await fetchForms();
        } catch (err) {
            setError('Failed to load study information');
            setLoading(false);
            console.error(err);
        }
    };

    const fetchForms = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            let formsData: any[];
            if (studyId) {
                // Fetch study-specific forms
                formsData = await FormService.getFormsByStudy(studyId);
            } else {
                // Fetch global form library
                formsData = await FormService.getForms();
            }

            setForms(formsData);
            setLoading(false);
        } catch (err) {
            setError('Failed to load forms');
            setLoading(false);
            console.error('Error fetching forms:', err);
        }
    };

    const handleDeleteForm = async (formId: string | number): Promise<void> => {
        if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
            try {
                await FormService.deleteForm(String(formId));

                // Remove form from the list
                setForms(forms.filter(form => form.id !== formId));
                alert('Form deleted successfully');
            } catch (err: any) {
                alert(`Error deleting form: ${err.message || 'Unknown error'}`);
                console.error('Error deleting form:', err);
            }
        }
    };

    const handleCreateForm = (): void => {
        const baseRoute = studyId ? `/study-design/study/${studyId}/forms/builder` : '/study-design/forms/builder';
        navigate(baseRoute);
    };

    const handleEditForm = (formId: string | number): void => {
        const baseRoute = studyId ? `/study-design/study/${studyId}/forms/builder/${formId}` : `/study-design/forms/builder/${formId}`;
        navigate(baseRoute);
    };

    const handlePreviewForm = (formId: string | number): void => {
        // For now, use the CRFBuilder which has preview functionality
        const baseRoute = studyId ? `/study-design/study/${studyId}/forms/builder/${formId}` : `/study-design/forms/builder/${formId}`;
        navigate(baseRoute);
    };

    const handleFormVersions = (formId: string | number): void => {
        const baseRoute = studyId ? `/study-design/study/${studyId}/forms/${formId}/versions` : `/study-design/forms/${formId}/versions`;
        navigate(baseRoute);
    };

    const getStatusBadgeClass = (status?: string): string => {
        switch (status?.toLowerCase()) {
            case 'published':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'archived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading forms...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Forms</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="bg-white rounded-lg shadow">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {studyId ? `Study Forms - ${study?.name || 'Loading...'}` : 'Global Form Library'}
                            </h2>
                            {studyId && (
                                <p className="text-gray-600 mt-1">
                                    Protocol: {study?.protocol} | Phase: {study?.phase} | Status: {study?.status}
                                </p>
                            )}
                            <p className="text-gray-500 mt-2">
                                {studyId ? 'Forms associated with this study' : 'Available form templates for all studies'}
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
                                Create New Form
                            </button>
                            {studyId && (
                                <Link
                                    to="/study-design/forms"
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                                    </svg>
                                    Global Forms
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Forms List */}
                {forms.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="text-gray-400 text-6xl mb-4">📄</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Forms Available</h3>
                        <p className="text-gray-500 mb-6">
                            {studyId ? 'No forms have been created for this study yet.' : 'No forms are available in the global library.'}
                        </p>
                        <button
                            onClick={handleCreateForm}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Create Your First Form
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    {studyId && (
                                        <>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Binding</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                                        </>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {forms.map((form) => (
                                    <tr key={form.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{form.name}</div>
                                                <div className="text-sm text-gray-500">{form.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {form.type}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {form.version}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(form.status)}`}>
                                                {form.status}
                                            </span>
                                        </td>
                                        {studyId && (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${form.binding === 'Required' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {form.binding || 'Optional'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <div className="max-w-xs">
                                                        {form.visits && form.visits.length > 0 ? (
                                                            form.visits.map((visit, index) => (
                                                                <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                                                                    {visit}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400">No visits assigned</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {form.updatedAt ? new Date(form.updatedAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handlePreviewForm(form.id)}
                                                    className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                                                    title="Preview Form"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleEditForm(form.id)}
                                                    className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                                                    title="Edit Form"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleFormVersions(form.id)}
                                                    className="text-purple-600 hover:text-purple-900 px-2 py-1 rounded hover:bg-purple-50"
                                                    title="Version History"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteForm(form.id)}
                                                    className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                                                    title="Delete Form"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
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

export default FormList;
