import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormService from '../../../services/FormService';

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
            const data = await FormService.getForms();
            setForms(data);
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
                await FormService.deleteForm(formId);
                // Remove form from the list without refetching
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

    if (loading) return <div className="text-center py-4">Loading forms...</div>;
    if (error) return <div className="text-red-500 py-4">{error}</div>;

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Form Library</h2>
                <button
                    onClick={handleCreateForm}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Create New Form
                </button>
            </div>

            {forms.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded">
                    <p className="text-gray-500 mb-4">No forms found in your library.</p>
                    <button
                        onClick={handleCreateForm}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Create Your First Form
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Form Name
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
                                <tr key={form.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{form.name}</div>
                                        {form.description && (
                                            <div className="text-xs text-gray-500">{form.description}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {form.type || 'Custom'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(form.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {form.version || '1.0'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${form.status === 'Published' ? 'bg-green-100 text-green-800' :
                                                form.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {form.status || 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/study-design/forms/${form.id}/versions`} className="text-blue-600 hover:text-blue-900 mr-4">
                                            Versions
                                        </Link>
                                        <Link to={`/study-design/forms/builder/${form.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteForm(form.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
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
