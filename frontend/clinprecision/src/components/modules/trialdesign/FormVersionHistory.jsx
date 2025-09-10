import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FormVersionService from '../../../services/FormVersionService';
import FormService from '../../../services/FormService';

const FormVersionHistory = () => {
    const { formId } = useParams();
    const [form, setForm] = useState(null);
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedVersions, setSelectedVersions] = useState([]);
    const [comparison, setComparison] = useState(null);

    useEffect(() => {
        const fetchFormAndVersions = async () => {
            try {
                setLoading(true);

                // Fetch form details
                const formData = await FormService.getFormById(formId);
                setForm(formData);

                // Fetch form versions
                const versionsData = await FormVersionService.getFormVersions(formId);
                setVersions(versionsData);

                setLoading(false);
            } catch (err) {
                setError('Failed to load form version history');
                setLoading(false);
                console.error(err);
            }
        };

        if (formId) {
            fetchFormAndVersions();
        }
    }, [formId]);

    const handleSelectVersion = (versionId) => {
        setSelectedVersions(prev => {
            // If already selected, remove it
            if (prev.includes(versionId)) {
                return prev.filter(id => id !== versionId);
            }

            // If we already have 2 selections, replace the oldest one
            if (prev.length >= 2) {
                return [prev[1], versionId];
            }

            // Otherwise add to selection
            return [...prev, versionId];
        });
    };

    const handleCompareVersions = async () => {
        if (selectedVersions.length !== 2) {
            alert('Please select exactly 2 versions to compare');
            return;
        }

        try {
            const comparisonData = await FormVersionService.compareFormVersions(
                formId,
                selectedVersions[0],
                selectedVersions[1]
            );
            setComparison(comparisonData);
        } catch (err) {
            alert(`Error comparing versions: ${err.message || 'Unknown error'}`);
            console.error(err);
        }
    };

    const handleSetActiveVersion = async (versionId) => {
        if (window.confirm('Are you sure you want to set this as the active version? This may affect any studies using this form.')) {
            try {
                await FormVersionService.setActiveFormVersion(formId, versionId);

                // Refresh form versions to show the new active version
                const versionsData = await FormVersionService.getFormVersions(formId);
                setVersions(versionsData);

                alert('Version activated successfully');
            } catch (err) {
                alert(`Error setting active version: ${err.message || 'Unknown error'}`);
                console.error(err);
            }
        }
    };

    if (loading) return <div className="text-center py-4">Loading form version history...</div>;
    if (error) return <div className="text-red-500 py-4">{error}</div>;
    if (!form) return <div className="text-center py-4">Form not found</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
                <Link to="/study-design/forms" className="text-blue-600 hover:underline">
                    &larr; Back to Forms
                </Link>
                <h2 className="text-2xl font-bold mt-2">Form Version History: {form.name}</h2>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div>
                    <span className="text-gray-600">Current Active Version: </span>
                    <span className="font-medium">
                        {versions.find(v => v.isActive)?.version || 'None'}
                    </span>
                </div>
                {selectedVersions.length === 2 && (
                    <button
                        onClick={handleCompareVersions}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                        Compare Selected Versions
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Select
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Version
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created By
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created Date
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
                        {versions.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    No versions found for this form
                                </td>
                            </tr>
                        ) : (
                            versions.map((version) => (
                                <tr key={version.id} className={version.isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedVersions.includes(version.id)}
                                            onChange={() => handleSelectVersion(version.id)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {version.version}
                                            {version.isActive && (
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{version.createdBy || 'System'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(version.createdAt).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${version.status === 'Published' ? 'bg-green-100 text-green-800' :
                                                version.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {version.status || 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            to={`/study-design/forms/${formId}/versions/${version.id}/view`}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            View
                                        </Link>
                                        {!version.isActive && (
                                            <button
                                                onClick={() => handleSetActiveVersion(version.id)}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Set Active
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Version Comparison Section */}
            {comparison && (
                <div className="mt-8 border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">Version Comparison</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-md p-4">
                            <h4 className="font-medium text-sm mb-2">
                                Version {versions.find(v => v.id === selectedVersions[0])?.version}
                            </h4>
                            <div className="text-sm">
                                <div><span className="font-medium">Fields:</span> {comparison.version1.fieldCount}</div>
                                <div><span className="font-medium">Field Groups:</span> {comparison.version1.groupCount}</div>
                                <div><span className="font-medium">Created:</span> {new Date(comparison.version1.createdAt).toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="border rounded-md p-4">
                            <h4 className="font-medium text-sm mb-2">
                                Version {versions.find(v => v.id === selectedVersions[1])?.version}
                            </h4>
                            <div className="text-sm">
                                <div><span className="font-medium">Fields:</span> {comparison.version2.fieldCount}</div>
                                <div><span className="font-medium">Field Groups:</span> {comparison.version2.groupCount}</div>
                                <div><span className="font-medium">Created:</span> {new Date(comparison.version2.createdAt).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 border rounded-md p-4">
                        <h4 className="font-medium text-sm mb-2">Changes</h4>
                        <ul className="list-disc pl-5 text-sm">
                            {comparison.changes.map((change, index) => (
                                <li key={index} className="mb-1">
                                    <span className={
                                        change.type === 'added' ? 'text-green-600' :
                                            change.type === 'removed' ? 'text-red-600' :
                                                change.type === 'modified' ? 'text-yellow-600' : ''
                                    }>
                                        {change.description}
                                    </span>
                                </li>
                            ))}
                            {comparison.changes.length === 0 && (
                                <li className="text-gray-500">No changes detected between these versions</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FormVersionHistory;
