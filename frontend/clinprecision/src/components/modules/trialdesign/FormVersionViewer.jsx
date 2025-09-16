import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FormVersionService from '../../../services/FormVersionService';
import FormService from '../../../services/FormService';
import StudyFormService from '../../../services/StudyFormService';

const FormVersionViewer = () => {
    const { formId, versionId, studyId } = useParams();
    const [formVersion, setFormVersion] = useState(null);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Determine if we're in study context or global form context
    const isStudyContext = !!studyId;

    useEffect(() => {
        const fetchFormVersionDetails = async () => {
            try {
                setLoading(true);

                // Fetch the form details using appropriate service
                const formData = isStudyContext
                    ? await StudyFormService.getStudyFormById(formId)
                    : await FormService.getFormById(formId);
                setForm(formData);

                // Fetch the specific form version details
                const versionData = await FormVersionService.getFormVersion(formId, versionId);
                setFormVersion(versionData);

                setLoading(false);
            } catch (err) {
                setError('Failed to load form version details');
                setLoading(false);
                console.error(err);
            }
        };

        if (formId && versionId) {
            fetchFormVersionDetails();
        }
    }, [formId, versionId, studyId, isStudyContext]);

    if (loading) return <div className="text-center py-4">Loading form version details...</div>;
    if (error) return <div className="text-red-500 py-4">{error}</div>;
    if (!formVersion) return <div className="text-center py-4">Form version not found</div>;

    // Helper function to render form fields recursively
    const renderFormStructure = (structure) => {
        if (!structure) return null;

        return (
            <div className="ml-4 mb-4">
                {structure.map((item, index) => (
                    <div key={index} className="mb-3">
                        {item.type === 'group' ? (
                            <div className="border-l-2 border-blue-400 pl-3">
                                <h4 className="font-medium text-md">{item.name || 'Unnamed Group'}</h4>
                                {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}
                                {item.fields && renderFormStructure(item.fields)}
                            </div>
                        ) : (
                            <div className="border-l-2 border-gray-200 pl-3">
                                <div className="font-medium">{item.label || item.name || 'Unnamed Field'}</div>
                                <div className="text-sm text-gray-600">
                                    Type: {item.fieldType || 'Unknown'}
                                    {item.required && <span className="text-red-500 ml-2">Required</span>}
                                </div>
                                {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                                {item.options && (
                                    <div className="text-sm mt-1">
                                        <span className="text-gray-600">Options: </span>
                                        {item.options.map((opt, i) => (
                                            <span key={i} className="mr-2 bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                {opt.label || opt.value}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <Link
                    to={isStudyContext
                        ? `/study-design/study/${studyId}/forms/${formId}/versions`
                        : `/study-design/forms/${formId}/versions`
                    }
                    className="text-blue-600 hover:underline"
                >
                    &larr; Back to Version History
                </Link>
                <h2 className="text-2xl font-bold mt-2">{form?.name}: Version {formVersion.version}</h2>
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Created By:</p>
                        <p className="font-medium">{formVersion.createdBy || 'System'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Created Date:</p>
                        <p className="font-medium">{new Date(formVersion.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Status:</p>
                        <p className="font-medium">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${formVersion.status === 'Published' ? 'bg-green-100 text-green-800' :
                                formVersion.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {formVersion.status || 'Draft'}
                            </span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Active:</p>
                        <p className="font-medium">
                            {formVersion.isActive ? (
                                <span className="text-green-600">Yes</span>
                            ) : (
                                <span className="text-gray-600">No</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">Form Structure</h3>

            {formVersion.structure ? (
                <div className="border rounded-md p-4">
                    {renderFormStructure(formVersion.structure)}
                </div>
            ) : (
                <div className="text-gray-500 italic">
                    No structure defined for this form version
                </div>
            )}

            <div className="mt-6 flex justify-between">
                <Link
                    to={isStudyContext
                        ? `/study-design/study/${studyId}/forms/${formId}/versions`
                        : `/study-design/forms/${formId}/versions`
                    }
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                >
                    Back to Version History
                </Link>

                {!formVersion.isActive && (
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
                        onClick={async () => {
                            if (window.confirm('Are you sure you want to set this as the active version? This may affect any studies using this form.')) {
                                try {
                                    await FormVersionService.setActiveFormVersion(formId, versionId);
                                    // Update the local state to reflect the change
                                    setFormVersion(prev => ({ ...prev, isActive: true }));
                                    alert('Version set as active successfully');
                                } catch (err) {
                                    alert(`Error setting active version: ${err.message || 'Unknown error'}`);
                                    console.error(err);
                                }
                            }
                        }}
                    >
                        Set as Active Version
                    </button>
                )}
            </div>
        </div>
    );
};

export default FormVersionViewer;
