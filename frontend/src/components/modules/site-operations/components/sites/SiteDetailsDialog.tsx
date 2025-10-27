// src/components/admin/SiteManagement/SiteDetailsDialog.tsx
import React, { useState, useEffect } from 'react';
import { 
  X, Building, MapPin, Phone, Mail, User, Calendar, 
  AlertCircle, CheckCircle, Clock, XCircle, Edit, History 
} from 'lucide-react';
import SiteService from 'services/administration/SiteService';

type AuditInfo = {
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;
};

type SiteDetails = {
  id: string;
  name: string;
  siteNumber?: string;
  organizationName?: string;
  status?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  principalInvestigator?: string;
  auditInfo?: AuditInfo;
};

type SiteDetailsDialogProps = {
  open: boolean;
  onClose: () => void;
  site?: SiteDetails | null;
};

const SiteDetailsDialog: React.FC<SiteDetailsDialogProps> = ({ open, onClose, site }) => {
  const [siteDetails, setSiteDetails] = useState<SiteDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open && site) {
      loadSiteDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, site]);

  const loadSiteDetails = async () => {
    if (!site) return;
    try {
      setLoading(true);
      setError('');
      if (site.auditInfo) {
        setSiteDetails(site);
      } else {
        const details: SiteDetails = await SiteService.getSiteById(site.id);
        setSiteDetails(details);
      }
    } catch (error) {
      console.error('Error loading site details:', error);
      setError('Failed to load site details');
      setSiteDetails(site);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const statusConfig: Record<string, string> = {
      active: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
    };
    return statusConfig[status?.toLowerCase() || 'inactive'] || statusConfig.inactive;
  };

  const getStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  if (!open || !site) return null;

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
              <h2 className="text-xl font-semibold text-gray-900">Site Details</h2>
              <p className="text-sm text-gray-600">Detailed information for clinical trial site</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Clock className="w-8 h-8 text-gray-400 animate-spin" />
              <span className="ml-3 text-gray-500">Loading site details...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          ) : siteDetails ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Site Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600"><strong>Site:</strong> {siteDetails.name}</p>
                    <p className="text-sm text-gray-600"><strong>Site Number:</strong> {siteDetails.siteNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600"><strong>Organization:</strong> {siteDetails.organizationName}</p>
                    <p className="text-sm text-gray-600">
                      <strong>Status:</strong>
                      <span className={`ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(siteDetails.status)}`}>
                        {getStatusIcon(siteDetails.status)}
                        <span className="ml-1">{siteDetails.status}</span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              {/* Address Info */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Address</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600"><strong>Address:</strong> {siteDetails.addressLine1} {siteDetails.addressLine2}</p>
                    <p className="text-sm text-gray-600"><strong>City:</strong> {siteDetails.city}</p>
                    <p className="text-sm text-gray-600"><strong>State:</strong> {siteDetails.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600"><strong>ZIP:</strong> {siteDetails.zipCode}</p>
                    <p className="text-sm text-gray-600"><strong>Country:</strong> {siteDetails.country}</p>
                  </div>
                </div>
              </div>
              {/* Contact Info */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Contact</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600"><strong>Phone:</strong> {siteDetails.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600"><strong>Email:</strong> {siteDetails.email}</p>
                  </div>
                </div>
              </div>
              {/* Principal Investigator */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Principal Investigator</h3>
                </div>
                <p className="text-sm text-gray-600">{siteDetails.principalInvestigator}</p>
              </div>
              {/* Audit Info */}
              {siteDetails.auditInfo && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <History className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-blue-900">Audit Trail</h3>
                  </div>
                  <div className="space-y-1 text-xs text-blue-800">
                    <p><strong>Created By:</strong> {siteDetails.auditInfo.createdBy}</p>
                    <p><strong>Created At:</strong> {siteDetails.auditInfo.createdAt}</p>
                    <p><strong>Last Modified By:</strong> {siteDetails.auditInfo.modifiedBy}</p>
                    <p><strong>Last Modified At:</strong> {siteDetails.auditInfo.modifiedAt}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">No site details available.</div>
          )}
        </div>
        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteDetailsDialog;
