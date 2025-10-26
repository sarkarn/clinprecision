import React, { useState } from 'react';
import { X, Building, User, Mail, Phone } from 'lucide-react';
import { Alert, Button } from '../../modules/trialdesign/components/UIComponents';
import { sendDemoRequestEmail } from 'services/EmailService';

interface DemoFormData {
    name: string;
    organizationName: string;
    organizationEmail: string;
    contactPhone: string;
}

interface FormErrors {
    name?: string;
    organizationName?: string;
    organizationEmail?: string;
    contactPhone?: string;
}

interface RequestDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Modal for collecting demo request information and sending via EmailJS
 */
const RequestDemoModal: React.FC<RequestDemoModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState<DemoFormData>({
        name: '',
        organizationName: '',
        organizationEmail: '',
        contactPhone: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    const resetForm = () => {
        setFormData({
            name: '',
            organizationName: '',
            organizationEmail: '',
            contactPhone: ''
        });
        setErrors({});
        setShowSuccess(false);
        setShowError(false);
    };

    const handleInputChange = (field: keyof DemoFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.organizationName.trim()) {
            newErrors.organizationName = 'Organization name is required';
        }

        if (!formData.organizationEmail.trim()) {
            newErrors.organizationEmail = 'Organization email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.organizationEmail)) {
                newErrors.organizationEmail = 'Please enter a valid email address';
            }
        }

        if (!formData.contactPhone.trim()) {
            newErrors.contactPhone = 'Contact phone is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setShowError(false);

        try {
            // Send demo request email using EmailJS
            await sendDemoRequestEmail(formData);

            setShowSuccess(true);

            // Reset form after 3 seconds and close modal
            setTimeout(() => {
                resetForm();
                onClose();
            }, 3000);

        } catch (error) {
            console.error('Error sending demo request:', error);
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 max-w-2xl shadow-lg rounded-md bg-white">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <Building className="w-6 h-6 text-blue-600 mr-2" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Request Demo</h3>
                            <p className="text-sm text-gray-600">
                                Get a personalized demo of ClinPrecision
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={loading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Success Alert */}
                {showSuccess && (
                    <div className="mb-4">
                        <Alert
                            type="success"
                            title="Demo Request Sent!"
                            message="Thank you for your interest. Our team will contact you within 1-2 business days to schedule your personalized demo."
                        />
                    </div>
                )}

                {/* Error Alert */}
                {showError && (
                    <div className="mb-4">
                        <Alert
                            type="error"
                            title="Request Failed"
                            message="We're sorry, but there was an issue sending your demo request. Please try again or contact us directly."
                            onClose={() => setShowError(false)}
                        />
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <User className="w-4 h-4 inline mr-1" />
                            Full Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter your full name"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'
                                }`}
                            disabled={loading}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Organization Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Building className="w-4 h-4 inline mr-1" />
                            Organization Name *
                        </label>
                        <input
                            type="text"
                            value={formData.organizationName}
                            onChange={(e) => handleInputChange('organizationName', e.target.value)}
                            placeholder="Enter your organization name"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.organizationName ? 'border-red-300' : 'border-gray-300'
                                }`}
                            disabled={loading}
                        />
                        {errors.organizationName && (
                            <p className="mt-1 text-sm text-red-600">{errors.organizationName}</p>
                        )}
                    </div>

                    {/* Organization Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Organization Email *
                        </label>
                        <input
                            type="email"
                            value={formData.organizationEmail}
                            onChange={(e) => handleInputChange('organizationEmail', e.target.value)}
                            placeholder="Enter your organization email"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.organizationEmail ? 'border-red-300' : 'border-gray-300'
                                }`}
                            disabled={loading}
                        />
                        {errors.organizationEmail && (
                            <p className="mt-1 text-sm text-red-600">{errors.organizationEmail}</p>
                        )}
                    </div>

                    {/* Contact Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Phone className="w-4 h-4 inline mr-1" />
                            Contact Phone *
                        </label>
                        <input
                            type="tel"
                            value={formData.contactPhone}
                            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                            placeholder="Enter your contact phone number"
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.contactPhone ? 'border-red-300' : 'border-gray-300'
                                }`}
                            disabled={loading}
                        />
                        {errors.contactPhone && (
                            <p className="mt-1 text-sm text-red-600">{errors.contactPhone}</p>
                        )}
                    </div>

                    {/* Info Message */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-700">
                            <strong>What happens next?</strong> Our team will review your request and contact you within 1-2 business days to schedule a personalized demo of ClinPrecision's clinical trial management platform.
                        </p>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            onClick={handleClose}
                            variant="outline"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {loading ? 'Sending Request...' : 'Request Demo'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestDemoModal;
