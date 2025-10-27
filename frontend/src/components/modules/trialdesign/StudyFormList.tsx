import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StudyFormService from 'services/study-design/StudyFormService';
import StudyService from 'services/study-management/StudyService';
import { Alert } from './components/UIComponents';

interface Study {
    id: number | string;
    name: string;
    protocol: string;
    phase: string;
    status: string;
}

interface StudyForm {
    id: number | string;
    name: string;
    description?: string;
    formType?: string;
    version: string;
    isLatestVersion?: boolean;
    status: string;
    isLocked?: boolean;
    templateId?: number | string;
    updatedAt?: string;
}

interface Template {
    id: number | string;
    name: string;
    type: string;
    description: string;
    version: string;
    status: string;
}

interface AlertMessage {
    title: string;
    message: string;
}

const StudyFormList: React.FC = () => {
    const { studyId } = useParams<{ studyId: string }>();
    const [study, setStudy] = useState<Study | null>(null);
    const [forms, setForms] = useState<StudyForm[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showTemplateSelector, setShowTemplateSelector] = useState<boolean>(false);
    const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState<boolean>(false);

    // Success message state
    const [successMessage, setSuccessMessage] = useState<AlertMessage | null>(null);

    // Error message state  
    const [errorMessage, setErrorMessage] = useState<AlertMessage | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (studyId) {
            fetchStudyAndForms();
        } else {
            setError('Study ID is required for study-specific forms');
            setLoading(false);
        }
    }, [studyId]);

    const fetchStudyAndForms = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            // Fetch study information
            try {
                const studyData = await StudyService.getStudyById(studyId as any);
                setStudy(studyData as any);
            } catch (studyError) {
                // Fallback to mock study data if service fails
                console.warn('Using mock study data:', studyError);
                setStudy({
                    id: studyId!,
                    name: 'Clinical Trial Study',
                    protocol: `STUDY-${studyId}`,
                    phase: 'Phase III',
                    status: 'Active'
                });
            }

            // Fetch study-specific forms
            const formsData = await StudyFormService.getFormsByStudy(studyId as any);
            setForms(Array.isArray(formsData) ? formsData as any : []);
            setLoading(false);
        } catch (err: any) {
            setError('Failed to load study forms');
            setLoading(false);
            console.error('Error fetching study forms:', err);
        }
    };

    const fetchTemplates = async (): Promise<void> => {
        try {
            setTemplatesLoading(true);
            const templates = await StudyFormService.getAvailableTemplates();
            setAvailableTemplates(Array.isArray(templates) ? templates as any : []);
        } catch (err) {
            console.error('Error fetching templates:', err);
            setAvailableTemplates([]);
        } finally {
            setTemplatesLoading(false);
        }
    };

    const handleDeleteForm = async (formId: number | string): Promise<void> => {
        if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
            try {
                await StudyFormService.deleteStudyForm(formId as any);
                setForms(forms.filter(form => form.id !== formId));
                setSuccessMessage({
                    title: 'Success',
                    message: 'Form deleted successfully'
                });

                // Auto-dismiss after 3 seconds
                setTimeout(() => {
                    setSuccessMessage(null);
                }, 3000);
            } catch (err: any) {
                setErrorMessage({
                    title: 'Error',
                    message: `Error deleting form: ${err.message || 'Unknown error'}`
                });
                console.error('Error deleting form:', err);
            }
        }
    };

    const handleCreateForm = (): void => {
        navigate(`/study-design/study/${studyId}/forms/builder`);
    };

    const handleCreateFromTemplate = (): void => {
        setShowTemplateSelector(true);
        if (availableTemplates.length === 0) {
            fetchTemplates();
        }
    };

    const handleTemplateSelection = async (template: Template): Promise<void> => {
        try {
            const formName = `${template.name} - ${study?.name || 'Study'} Version`;

            const newForm = await StudyFormService.createStudyFormFromTemplate(
                studyId as any,
                template.id as any,
                formName
            );

            // Show success message
            setSuccessMessage({
                title: 'Success',
                message: `Form created successfully from template "${template.name}"!`
            });

            setShowTemplateSelector(false);

            // Auto-dismiss message after 3 seconds and navigate
            setTimeout(() => {
                setSuccessMessage(null);
                navigate(`/study-design/study/${studyId}/forms/builder/${newForm.id}`);
            }, 3000);
        } catch (err: any) {
            setErrorMessage({
                title: 'Error',
                message: `Error creating form from template: ${err.message || 'Unknown error'}`
            });
            console.error('Error creating form from template:', err);
        }
    };

    const handleEditForm = (formId: number | string): void => {
        navigate(`/study-design/study/${studyId}/forms/builder/${formId}`);
    };

    const handlePreviewForm = (formId: number | string): void => {
        navigate(`/study-design/study/${studyId}/forms/builder/${formId}`);
    };

    const handleFormVersions = (formId: number | string): void => {
        navigate(`/study-design/study/${studyId}/forms/${formId}/versions`);
    };

    const getStatusBadgeClass = (status?: string): string => {
        switch (status?.toLowerCase()) {
            case 'published':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-blue-100 text-blue-800';
            case 'retired':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getFormTypeColor = (type?: string): string => {
        switch (type?.toLowerCase()) {
            case 'screening':
                return 'bg-purple-100 text-purple-800';
            case 'demographics':
                return 'bg-blue-100 text-blue-800';
            case 'safety':
                return 'bg-red-100 text-red-800';
            case 'laboratory':
                return 'bg-green-100 text-green-800';
            case 'medication':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading study forms...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Study Forms</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchStudyAndForms}
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
            {/* Success Message */}
            {successMessage && (
                <div className="mb-6">
                    <Alert
                        type="success"
                        title={successMessage.title}
                        message={successMessage.message}
                        onClose={() => setSuccessMessage(null)}
                    />
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div className="mb-6">
                    <Alert
                        type="error"
                        title={errorMessage.title}
                        message={errorMessage.message}
                        onClose={() => setErrorMessage(null)}
                    />
                </div>
            )}

            <div className="bg-white rounded-lg shadow">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Study Forms - {study?.name || 'Loading...'}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                Study ID: {studyId} | Protocol: {study?.protocol} | Phase: {study?.phase} | Status: {study?.status}
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCreateFromTemplate}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Create from Template
                            </button>
                            <button
                                onClick={handleCreateForm}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create New Form
                            </button>
                        </div>
                    </div>
                </div>

                {/* Forms List */}
                {forms.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Forms Found</h3>
                        <p className="text-gray-500 mb-6">Get started by creating your first study form.</p>
                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={handleCreateFromTemplate}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Create from Template
                            </button>
                            <button
                                onClick={handleCreateForm}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create New Form
                            </button>
                        </div>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFormTypeColor(form.formType)}`}>
                                                {form.formType || 'Custom'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {form.version}
                                            {form.isLatestVersion && (
                                                <span className="ml-1 text-xs text-green-600 font-medium">Latest</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(form.status)}`}>
                                                {form.status}
                                            </span>
                                            {form.isLocked && (
                                                <span className="ml-1 text-xs text-red-600">🔒</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {form.templateId ? (
                                                <span className="text-blue-600">Template #{form.templateId}</span>
                                            ) : (
                                                <span className="text-gray-400">Custom</span>
                                            )}
                                        </td>
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

            {/* Template Selection Modal */}
            {showTemplateSelector && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Select a Template</h3>
                                <button
                                    onClick={() => setShowTemplateSelector(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {templatesLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading templates...</p>
                                </div>
                            ) : availableTemplates.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 mb-4">No templates available.</p>
                                    <button
                                        onClick={() => setShowTemplateSelector(false)}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {availableTemplates.map((template) => (
                                        <div
                                            key={template.id}
                                            className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                            onClick={() => handleTemplateSelection(template)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900">{template.name}</h4>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getFormTypeColor(template.type)}`}>
                                                    {template.type}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span>v{template.version}</span>
                                                <span>{template.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyFormList;
