import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserTypeService } from "../../../../services/auth/UserTypeService";

interface FormData {
    name: string;
    description: string;
    code: string;
    category: string;
}

const UserTypeForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState<FormData>({
        name: "",
        description: "",
        code: "",
        category: ""
    });
    const [loading, setLoading] = useState(isEditMode);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // User type categories
    const userTypeCategories = [
        'SPONSOR_USER',
        'CRO_USER',
        'SITE_USER',
        'VENDOR_USER',
        'SUBJECT_USER',
        'SYSTEM_USER'
    ];

    useEffect(() => {
        if (isEditMode) {
            fetchUserType();
        }
    }, [id, isEditMode]);

    const fetchUserType = async () => {
        try {
            setLoading(true);
            const data = await UserTypeService.getUserTypeById(id as any);
            setFormData({
                name: (data as any).name || "",
                description: (data as any).description || "",
                code: (data as any).code || "",
                category: (data as any).category || ""
            });
            setError(null);
        } catch (err) {
            console.error("Error fetching user type:", err);
            setError("Failed to load user type data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            if (isEditMode) {
                await UserTypeService.updateUserType(id as any, formData);
            } else {
                await UserTypeService.createUserType(formData);
            }

            setSuccess(true);

            // Navigate back to the list after a short delay
            setTimeout(() => {
                navigate("/identity-access/user-types");
            }, 1500);
        } catch (err) {
            console.error("Error saving user type:", err);
            setError("Failed to save user type. Please try again later.");
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h3 className="text-xl font-semibold">
                    {isEditMode ? "Edit User Type" : "Create User Type"}
                </h3>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    User type {isEditMode ? "updated" : "created"} successfully!
                </div>
            )}

            {loading && !isEditMode ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                            Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="code">
                            Code *
                        </label>
                        <input
                            type="text"
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            A unique code to identify this user type (e.g., PI, CRA, DM)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="category">
                            Category *
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Select a category</option>
                            {userTypeCategories.map((category) => (
                                <option key={category} value={category}>
                                    {category.split('_').map(word =>
                                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                    ).join(' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate("/identity-access/user-types")}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : (
                                isEditMode ? 'Update User Type' : 'Create User Type'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default UserTypeForm;
