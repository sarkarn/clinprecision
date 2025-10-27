// src/components/admin/SiteManagement/CreateSiteDialog.js
import React, { useState, useEffect } from 'react';
import { X, Building, MapPin, Phone, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { SiteService } from 'services/SiteService';

const CreateSiteDialog = ({ open, onClose, onSiteCreated, organizations = [], site = null }) => {
  const isEditMode = !!site;
  
  const [formData, setFormData] = useState({
    name: '',
    siteNumber: '',
    organizationId: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    email: '',
    principalInvestigator: '',
    reason: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Reset or populate form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (site) {
        // Edit mode - populate with site data
        setFormData({
          name: site.name || '',
          siteNumber: site.siteNumber || '',
          organizationId: site.organizationId || '',
          addressLine1: site.addressLine1 || '',
          addressLine2: site.addressLine2 || '',
          city: site.city || '',
          state: site.state || '',
          zipCode: site.zipCode || '',
          country: site.country || '',
          phone: site.phone || '',
          email: site.email || '',
          principalInvestigator: site.principalInvestigator || '',
          reason: ''
        });
      } else {
        // Create mode - reset form
        setFormData({
          name: '',
          siteNumber: '',
          organizationId: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          phone: '',
          email: '',
          principalInvestigator: '',
          reason: ''
        });
      }
      setErrors({});
      setNotification({ show: false, message: '', type: 'success' });
    }
  }, [open, site]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name?.trim()) {
      newErrors.name = 'Site name is required';
    }

    if (!formData.siteNumber?.trim()) {
      newErrors.siteNumber = 'Site number is required';
    }

    if (!formData.organizationId) {
      newErrors.organizationId = 'Organization is required';
    }

    if (!formData.reason?.trim()) {
      newErrors.reason = 'Reason for creation is required for audit trail';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Site number validation (basic alphanumeric)
    if (formData.siteNumber && !/^[A-Za-z0-9\-_]+$/.test(formData.siteNumber)) {
      newErrors.siteNumber = 'Site number can only contain letters, numbers, hyphens, and underscores';
    }

    // Length validations
    if (formData.name && formData.name.length > 100) {
      newErrors.name = 'Site name must be less than 100 characters';
    }

    if (formData.siteNumber && formData.siteNumber.length > 20) {
      newErrors.siteNumber = 'Site number must be less than 20 characters';
    }

    if (formData.reason && formData.reason.length > 500) {
      newErrors.reason = 'Reason must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setNotification({
        show: true,
        message: 'Please fix the errors below',
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      const siteData = {
        ...formData,
        organizationId: parseInt(formData.organizationId)
      };

      if (isEditMode) {
        // Update existing site
        await SiteService.updateSite(site.id, siteData);
        setNotification({
          show: true,
          message: 'Site updated successfully!',
          type: 'success'
        });
      } else {
        // Create new site
        siteData.status = 'pending'; // New sites start as pending
        await SiteService.createSite(siteData);
        setNotification({
          show: true,
          message: 'Site created successfully!',
          type: 'success'
        });
      }

      setTimeout(() => {
        onSiteCreated();
        onClose();
      }, 1000);

    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} site:`, error);
      setNotification({
        show: true,
        message: error.message || `Failed to ${isEditMode ? 'update' : 'create'} site. Please try again.`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const getOrganizationName = (orgId) => {
    const org = organizations.find(o => o.id === parseInt(orgId));
    return org ? org.name : '';
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{isEditMode ? 'Edit' : 'Create New'} Clinical Trial Site</h2>
              <p className="text-sm text-gray-600">All site {isEditMode ? 'changes' : 'creations'} are recorded in the audit trail for regulatory compliance</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`mx-6 mt-4 p-4 rounded-md flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.type === 'success' ? 
              <CheckCircle className="w-5 h-5" /> : 
              <AlertCircle className="w-5 h-5" />
            }
            <span className="text-sm">{notification.message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Memorial Healthcare Center"
                  disabled={loading}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="siteNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Site Number *
                </label>
                <input
                  type="text"
                  id="siteNumber"
                  value={formData.siteNumber}
                  onChange={(e) => handleInputChange('siteNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.siteNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., SITE-001"
                  disabled={loading}
                />
                {errors.siteNumber && <p className="mt-1 text-sm text-red-600">{errors.siteNumber}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization *
                </label>
                <select
                  id="organizationId"
                  value={formData.organizationId}
                  onChange={(e) => handleInputChange('organizationId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.organizationId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <option value="">Select an organization</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                {errors.organizationId && <p className="mt-1 text-sm text-red-600">{errors.organizationId}</p>}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              Address Information
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 123 Main Street"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Suite 400"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Boston"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., MA"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 02101"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., United States"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-600" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., +1-617-555-0123"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., contact@site.com"
                  disabled={loading}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="principalInvestigator" className="block text-sm font-medium text-gray-700 mb-1">
                  Principal Investigator
                </label>
                <input
                  type="text"
                  id="principalInvestigator"
                  value={formData.principalInvestigator}
                  onChange={(e) => handleInputChange('principalInvestigator', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Principal Investigator name"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Audit Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Information</h3>
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Site Creation *
              </label>
              <textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.reason ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., New site required for Phase II clinical trial expansion to increase patient enrollment in the Northeast region."
                disabled={loading}
              />
              {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
              <p className="mt-1 text-sm text-gray-500">Explain why this site is being created (required for audit trail)</p>
            </div>
          </div>

          {/* Summary */}
          {formData.name && formData.organizationId && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Site Summary</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Site:</strong> {formData.name} ({formData.siteNumber})</p>
                <p><strong>Organization:</strong> {getOrganizationName(formData.organizationId)}</p>
                {formData.city && formData.state && (
                  <p><strong>Location:</strong> {formData.city}, {formData.state}</p>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Building className="w-4 h-4" />
                {isEditMode ? 'Update Site' : 'Create Site'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSiteDialog;