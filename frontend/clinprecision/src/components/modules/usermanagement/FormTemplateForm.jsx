import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormTemplateService from '../../../services/FormTemplateService';

export default function FormTemplateForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        templateId: '',
        templateName: '',
        description: '',
        category: '',
        version: '1.0',
        status: 'DRAFT',
        fields: '[]',
        tags: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [fieldsError, setFieldsError] = useState('');

    const categoryOptions = [
        'DEMOGRAPHICS',
        'MEDICAL_HISTORY',
        'VITAL_SIGNS',
        'LABORATORY',
        'ADVERSE_EVENTS',
        'CONCOMITANT_MEDICATIONS',
        'EFFICACY',
        'SAFETY',
        'QUESTIONNAIRE',
        'OTHER'
    ];

    const statusOptions = [
        { value: 'DRAFT', label: 'Draft' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'ARCHIVED', label: 'Archived' }
    ];

    useEffect(() => {
        if (isEdit) {
            fetchTemplate();
        }
        fetchCategories();
    }, [id, isEdit]);

    const fetchTemplate = async () => {
        try {
            setLoading(true);
            const template = await FormTemplateService.getFormTemplateById(id);

            setFormData({
                templateId: template.templateId || '',
                templateName: template.templateName || '',
                description: template.description || '',
                category: template.category || '',
                version: template.version || '1.0',
                status: template.status || 'DRAFT',
                fields: template.fields || '[]',
                tags: template.tags || ''
            });
        } catch (err) {
            setError('Failed to fetch form template');
            console.error('Error fetching template:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await FormTemplateService.getAvailableCategories();
            if (Array.isArray(data) && data.length > 0) {
                setCategories(data);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors when user types
        if (error) setError(null);
        if (name === 'fields' && fieldsError) setFieldsError('');
    };

    const validateFields = (fieldsJson) => {
        try {
            const parsed = JSON.parse(fieldsJson);
            if (!Array.isArray(parsed)) {
                return 'Fields must be a JSON array';
            }
            return '';
        } catch (e) {
            return 'Invalid JSON format';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate fields JSON
        const fieldsValidationError = validateFields(formData.fields);
        if (fieldsValidationError) {
            setFieldsError(fieldsValidationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const templateData = {
                ...formData,
                // Generate templateId if not provided
                templateId: formData.templateId || `TPL_${Date.now()}`,
                fields: formData.fields, // Keep as string - backend will handle JSON parsing
                tags: formData.tags.trim()
            };

            if (isEdit) {
                await FormTemplateService.updateFormTemplate(id, templateData);
            } else {
                await FormTemplateService.createFormTemplate(templateData);
            }

            navigate('/user-management/form-templates');
        } catch (err) {
            setError(isEdit ? 'Failed to update form template' : 'Failed to create form template');
            console.error('Error saving template:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/user-management/form-templates');
    };

    // Sample fields JSON for reference
    const sampleFieldsJson = `[
  {
    "id": "subject_id",
    "label": "Subject ID",
    "type": "text",
    "required": true,
    "validation": {
      "pattern": "^[A-Z]{3}-[0-9]{3}$"
    }
  },
  {
    "id": "visit_date",
    "label": "Visit Date",
    "type": "date",
    "required": true
  },
  {
    "id": "notes",
    "label": "Notes",
    "type": "textarea",
    "required": false
  }
]`;

    if (loading && isEdit) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h3 className="text-xl font-semibold">
                    {isEdit ? 'Edit Form Template' : 'Create Form Template'}
                </h3>
                <p className="text-gray-600 mt-2">
                    {isEdit ? 'Update the form template details below.' : 'Create a new reusable form template.'}
                </p>
            </div>

            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Template ID *
                            </label>
                            <input
                                type="text"
                                name="templateId"
                                value={formData.templateId}
                                onChange={handleInputChange}
                                placeholder="Auto-generated if not provided"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Unique identifier for the template (e.g., TPL_DEMOGRAPHICS_V1)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Template Name *
                            </label>
                            <input
                                type="text"
                                name="templateName"
                                value={formData.templateName}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter template name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Describe the purpose and content of this template"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a category</option>
                                {(categories.length > 0 ? categories : categoryOptions).map((category) => (
                                    <option key={category} value={category}>
                                        {category.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Version *
                            </label>
                            <input
                                type="text"
                                name="version"
                                value={formData.version}
                                onChange={handleInputChange}
                                required
                                placeholder="1.0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status *
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {statusOptions.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags
                        </label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            placeholder="Enter tags separated by commas (e.g., screening, baseline, followup)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Use commas to separate multiple tags
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Fields Definition (JSON) *
                        </label>
                        <textarea
                            name="fields"
                            value={formData.fields}
                            onChange={handleInputChange}
                            rows={12}
                            required
                            placeholder={sampleFieldsJson}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${fieldsError ? 'border-red-300' : 'border-gray-300'
                                }`}
                        />
                        {fieldsError && (
                            <p className="text-red-500 text-xs mt-1">{fieldsError}</p>
                        )}
                        <div className="mt-2">
                            <details className="text-xs text-gray-600">
                                <summary className="cursor-pointer font-medium">Show example JSON format</summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                                    {sampleFieldsJson}
                                </pre>
                            </details>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                        >
                            {loading ? 'Saving...' : (isEdit ? 'Update Template' : 'Create Template')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}