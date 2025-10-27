import { AlertCircle, Building, CheckCircle, Play, X } from 'lucide-react';
import React, { useState } from 'react';
import SiteService from 'services/administration/SiteService';


interface ActivateSiteDialogProps {
  open: boolean;
  onClose: () => void;
  site: {
    id: string;
    name: string;
    siteNumber: string;
    organizationName?: string;
    status: string;
  } | null;
  onSiteActivated: () => void;
}

const ActivateSiteDialog: React.FC<ActivateSiteDialogProps> = ({ open, onClose, site, onSiteActivated }) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  const handleActivation = async () => {
    if (!reason.trim()) {
      setError('Activation reason is required for audit compliance');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await SiteService.activateSite(site!.id, { reason: reason.trim() });
      setNotification({ show: true, message: 'Site activated successfully!', type: 'success' });
      setTimeout(() => {
        onSiteActivated();
        onClose();
        resetForm();
      }, 1000);
    } catch (error: any) {
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

  if (!open || !site) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Play className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Activate Clinical Trial Site</h2>
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Site Information */}
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Building className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">Site to Activate</h3>
            </div>
            <p className="font-medium text-gray-900 text-sm">{site.name}</p>
            <div className="mt-1 text-xs text-gray-600 space-y-1">
              <p>Site Number: {site.siteNumber}</p>
              <p>Organization: {site.organizationName || 'Unknown'}</p>
              <div className="flex items-center gap-1">
                <span>Status:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  site.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {site.status}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800 text-sm mb-1">Important</h4>
              <p className="text-xs text-yellow-700">
                Activating this site makes it available for clinical trial operations. 
                Study-site associations will need to be configured separately for each trial.
                This action will be recorded in the audit trail for regulatory compliance.
              </p>
            </div>
          </div>

          {/* Reason Input */}
          <div>
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
              rows={3}
              className={`w-full px-3 py-2 text-sm border rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Site has completed all setup requirements and passed initial qualification review..."
              disabled={loading}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Please provide a detailed reason for site activation (required for audit trail)
            </p>
          </div>

          {/* Notification */}
          {notification.show && (
            <div className={`mb-3 p-3 rounded-md flex items-center gap-2 ${
              notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {notification.type === 'success' ? 
                <CheckCircle className="w-4 h-4" /> : 
                <AlertCircle className="w-4 h-4" />
              }
              <span className="text-xs">{notification.message}</span>
            </div>
          )}

          {/* Status Change Preview */}
          <div className="mb-3 flex items-center justify-center gap-2 text-xs">
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
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Regulatory Notice:</strong> Site activation creates a permanent audit trail entry 
              for FDA 21 CFR Part 11 compliance. This action cannot be undone and will be recorded 
              with your user credentials and timestamp.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleActivation}
            disabled={loading || !reason.trim()}
            className="px-5 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
