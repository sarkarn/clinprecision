import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OrganizationService } from "../../../../services/OrganizationService";

interface FormData {
    name: string;
    externalId: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
    website: string;
    status: string;
}

const OrganizationForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState<FormData>({
        name: "",
        externalId: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phone: "",
        email: "",
        website: "",
        status: "active"
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // If in edit mode, fetch organization data
                if (isEditMode) {
                    const orgData = await OrganizationService.getOrganizationById(id as any) as any;
                    console.log("Loaded organization data:", orgData); // Debug log
                    setFormData({
                        name: orgData.name || "",
                        externalId: orgData.externalId || "",
                        addressLine1: orgData.addressLine1 || "",
                        addressLine2: orgData.addressLine2 || "",
                        city: orgData.city || "",
                        state: orgData.state || "",
                        postalCode: orgData.postalCode || "",
                        country: orgData.country || "",
                        phone: orgData.phone || "",
                        email: orgData.email || "",
                        website: orgData.website || "",
                        status: orgData.status || "active"
                    });
                }

                setError(null);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isEditMode]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

            // Use form data directly (no more organizationType field)
            const organizationData = { ...formData };

            if (isEditMode) {
                await OrganizationService.updateOrganization(id as any, organizationData as any);
            } else {
                await OrganizationService.createOrganization(organizationData as any);
            }

            setSuccess(true);

            // Navigate back to the list after a short delay
            setTimeout(() => {
                navigate("/organization-admin/organizations");
            }, 1500);
        } catch (err) {
            console.error("Error saving organization:", err);
            setError("Failed to save organization. Please try again later.");
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <h3 className="text-xl font-semibold">
                    {isEditMode ? "Edit Organization" : "Create Organization"}
                </h3>
                <p className="text-gray-600 mt-1">
                    {isEditMode
                        ? "Update organization details"
                        : "Enter information to create a new organization"}
                </p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    Organization {isEditMode ? "updated" : "created"} successfully!
                </div>
            )}

            {loading && !formData.name ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Organization Information
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                                    Organization Name *
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
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="externalId">
                                    External ID
                                </label>
                                <input
                                    type="text"
                                    id="externalId"
                                    name="externalId"
                                    value={formData.externalId}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    External identifier for reference (e.g., DUNS number)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="status">
                                    Status *
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Contact Information
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="phone">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="website">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    id="website"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">
                            Address
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="addressLine1">
                                    Address Line 1
                                </label>
                                <input
                                    type="text"
                                    id="addressLine1"
                                    name="addressLine1"
                                    value={formData.addressLine1}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="addressLine2">
                                    Address Line 2
                                </label>
                                <input
                                    type="text"
                                    id="addressLine2"
                                    name="addressLine2"
                                    value={formData.addressLine2}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="city">
                                    City
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="state">
                                    State/Province
                                </label>
                                <input
                                    type="text"
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="postalCode">
                                    Postal Code
                                </label>
                                <input
                                    type="text"
                                    id="postalCode"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="country">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate("/organization-admin/organizations")}
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
                                isEditMode ? 'Update Organization' : 'Create Organization'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default OrganizationForm;
