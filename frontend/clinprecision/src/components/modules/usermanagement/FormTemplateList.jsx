import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormTemplateService from '../../../services/FormTemplateService';

export default function FormTemplateList() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    const statuses = [
        { value: '', label: 'All Statuses' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'DRAFT', label: 'Draft' },
        { value: 'ARCHIVED', label: 'Archived' }
    ];

    useEffect(() => {
        fetchTemplates();
        fetchCategories();
    }, []);

    useEffect(() => {
        handleSearch();
    }, [searchTerm, selectedCategory, selectedStatus]);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await FormTemplateService.getAllFormTemplates();
            setTemplates(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to fetch form templates');
            console.error('Error fetching templates:', err);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await FormTemplateService.getAvailableCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setCategories([]);
        }
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            let data = [];

            if (searchTerm) {
                data = await FormTemplateService.searchFormTemplatesByName(searchTerm);
            } else if (selectedCategory) {
                data = await FormTemplateService.getFormTemplatesByCategory(selectedCategory);
            } else if (selectedStatus) {
                data = await FormTemplateService.getFormTemplatesByStatus(selectedStatus);
            } else {
                data = await FormTemplateService.getAllFormTemplates();
            }

            setTemplates(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to search form templates');
            console.error('Error searching templates:', err);
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this form template?')) {
            try {
                await FormTemplateService.deleteFormTemplate(id);
                fetchTemplates();
            } catch (err) {
                setError('Failed to delete form template');
                console.error('Error deleting template:', err);
            }
        }
    };

    const handleStatusChange = async (id, action) => {
        try {
            let response;
            switch (action) {
                case 'activate':
                    response = await FormTemplateService.activateFormTemplate(id);
                    break;
                case 'deactivate':
                    response = await FormTemplateService.deactivateFormTemplate(id);
                    break;
                case 'archive':
                    response = await FormTemplateService.archiveFormTemplate(id);
                    break;
                default:
                    return;
            }
            fetchTemplates();
        } catch (err) {
            setError(`Failed to ${action} form template`);
            console.error(`Error ${action} template:`, err);
        }
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            ACTIVE: 'bg-green-100 text-green-800',
            INACTIVE: 'bg-yellow-100 text-yellow-800',
            DRAFT: 'bg-blue-100 text-blue-800',
            ARCHIVED: 'bg-gray-100 text-gray-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-semibold">Form Templates</h3>
                <Link
                    to="/user-management/form-templates/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Create New Template
                </Link>
            </div>

            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Search and Filter Controls */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search by Name
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Enter template name..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {statuses.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Templates Table */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                {templates.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-500 text-lg">No form templates found</p>
                        <p className="text-gray-400 text-sm mt-2">Create your first template to get started</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Template Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Version
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Usage Count
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {templates.map((template) => (
                                    <tr key={template.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {template.templateName}
                                                </div>
                                                {template.description && (
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {template.description}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {template.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {template.version}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(template.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {template.usageCount || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <Link
                                                    to={`/user-management/form-templates/edit/${template.id}`}
                                                    className="text-blue-600 hover:text-blue-900 text-sm"
                                                >
                                                    Edit
                                                </Link>

                                                {template.status === 'ACTIVE' && (
                                                    <button
                                                        onClick={() => handleStatusChange(template.id, 'deactivate')}
                                                        className="text-yellow-600 hover:text-yellow-900 text-sm"
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}

                                                {template.status === 'INACTIVE' && (
                                                    <button
                                                        onClick={() => handleStatusChange(template.id, 'activate')}
                                                        className="text-green-600 hover:text-green-900 text-sm"
                                                    >
                                                        Activate
                                                    </button>
                                                )}

                                                {(template.status === 'ACTIVE' || template.status === 'INACTIVE') && (
                                                    <button
                                                        onClick={() => handleStatusChange(template.id, 'archive')}
                                                        className="text-gray-600 hover:text-gray-900 text-sm"
                                                    >
                                                        Archive
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDelete(template.id)}
                                                    className="text-red-600 hover:text-red-900 text-sm"
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

            {/* Summary Stats */}
            {templates.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                    Showing {templates.length} template{templates.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}