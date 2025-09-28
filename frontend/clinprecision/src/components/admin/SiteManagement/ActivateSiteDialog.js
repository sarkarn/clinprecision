// src/components/admin/SiteManagement/ActivateSiteDialog.js
import React, { useState } from 'react';
import { X, Play, AlertCircle, CheckCircle, Building } from 'lucide-react';
import { SiteService } from '../../../services/SiteService';

const ActivateSiteDialog = ({ open, onClose, site, onSiteActivated }) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const handleActivation = async () => {
    if (!reason.trim()) {
      setError('Activation reason is required for audit compliance');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Site activation is now independent of study context
      await SiteService.activateSite(site.id, { reason: reason.trim() });
      
      setNotification({
        show: true,
        message: 'Site activated successfully!',
        type: 'success'
      });

      setTimeout(() => {
        onSiteActivated();
        onClose();
        resetForm();
      }, 1000);

    } catch (error) {
      console.error('Error activating site:', error);
      setError(error.message || 'Failed to activate site. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setReason('');
    setError('');
    setNotification({ show: false, message: '', type: 'success' });
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!open || !site) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Activate Clinical Trial Site</h2>
              <p className="text-sm text-gray-600">Activate this site to allow participation in clinical trials</p>
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

        {/* Content */}
        <div className="p-6">
          {/* Site Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Site to Activate</h3>
            </div>
            <p className="font-medium text-gray-900">{site.name}</p>
            <p className="text-sm text-gray-600">Site Number: {site.siteNumber}</p>
            <p className="text-sm text-gray-600">Organization: {site.organizationName || 'Unknown'}</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm">Current Status:</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                site.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {site.status}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Important</h4>
              <p className="text-sm text-yellow-700">
                Activating this site makes it available for clinical trial operations. 
                Study-site associations will need to be configured separately for each trial.
                This action will be recorded in the audit trail for regulatory compliance.
              </p>
            </div>
          </div>

          {/* Reason Input */}
          <div className="mb-4">
            <label htmlFor="activationReason" className="block text-sm font-medium text-gray-700 mb-2">
              Activation Reason *
            </label>
            <textarea
              id="activationReason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Site has completed all setup requirements and passed initial qualification review. Principal investigator and site staff have been trained on protocol requirements."
              disabled={loading}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Please provide a detailed reason for site activation (required for audit trail)
            </p>
          </div>

          {/* Notification */}
          {notification.show && (
            <div className={`mb-4 p-4 rounded-md flex items-center gap-3 ${
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

          {/* Status Change Preview */}
          <div className="mb-4 flex items-center justify-center gap-2 text-sm">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              site.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {site.status}
            </span>
            <span className="text-gray-500">→</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              active
            </span>
          </div>

          {/* Regulatory Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Regulatory Notice:</strong> Site activation creates a permanent audit trail entry 
              for FDA 21 CFR Part 11 compliance. This action cannot be undone and will be recorded 
              with your user credentials and timestamp.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleActivation}
            disabled={loading || !reason.trim()}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Activating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Activate Site
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivateSiteDialog;