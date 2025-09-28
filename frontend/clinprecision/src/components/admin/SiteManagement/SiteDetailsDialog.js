// src/components/admin/SiteManagement/SiteDetailsDialog.js
import React, { useState, useEffect } from 'react';
import { 
  X, Building, MapPin, Phone, Mail, User, Calendar, 
  AlertCircle, CheckCircle, Clock, XCircle, Edit, History 
} from 'lucide-react';
import { SiteService } from '../../../services/SiteService';

const SiteDetailsDialog = ({ open, onClose, site }) => {
  const [siteDetails, setSiteDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load detailed site information when dialog opens
  useEffect(() => {
    if (open && site) {
      loadSiteDetails();
    }
  }, [open, site]);

  const loadSiteDetails = async () => {
    if (!site) return;
    
    try {
      setLoading(true);
      setError('');
      // If we already have detailed info, use it, otherwise fetch
      if (site.auditInfo) {
        setSiteDetails(site);
      } else {
        const details = await SiteService.getSiteById(site.id);
        setSiteDetails(details);
      }
    } catch (error) {
      console.error('Error loading site details:', error);
      setError('Failed to load site details');
      setSiteDetails(site); // Fall back to basic info
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
    };
    
    return statusConfig[status?.toLowerCase()] || statusConfig.inactive;
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const formatAddress = (site) => {
    if (!site) return 'No address provided';
    const parts = [];
    if (site.addressLine1) parts.push(site.addressLine1);
    if (site.addressLine2) parts.push(site.addressLine2);
    if (site.city) parts.push(site.city);
    if (site.state) parts.push(site.state);
    if (site.postalCode || site.zipCode) parts.push(site.postalCode || site.zipCode);
    if (site.country) parts.push(site.country);
    return parts.join(', ') || 'No address provided';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {site?.name || 'Site Details'}
              </h2>
              <p className="text-sm text-gray-600">Complete information for this clinical site</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {site && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(site.status)}`}>
                {getStatusIcon(site.status)}
                <span className="ml-2">{site.status}</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading site details...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : siteDetails ? (
            <div className="space-y-6">
              {/* Site Header */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{siteDetails.name}</h3>
                <p className="text-gray-600 text-lg">Site Number: {siteDetails.siteNumber}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information Card */}
                <div className="bg-gray-50 rounded-lg border p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Site Number</p>
                      <p className="font-medium">{siteDetails.siteNumber}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Organization</p>
                        <p className="font-medium">{siteDetails.organizationName || 'Unknown Organization'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Current Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(siteDetails.status)}`}>
                        {getStatusIcon(siteDetails.status)}
                        <span className="ml-1">{siteDetails.status}</span>
                      </span>
                    </div>

                    {siteDetails.studyId && (
                      <div>
                        <p className="text-sm text-gray-600">Associated Study</p>
                        <p className="font-medium">Study ID: {siteDetails.studyId}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Information Card */}
                <div className="bg-gray-50 rounded-lg border p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">{formatAddress(siteDetails)}</p>
                      </div>
                    </div>

                    {siteDetails.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Phone Number</p>
                          <p className="font-medium">{siteDetails.phone}</p>
                        </div>
                      </div>
                    )}

                    {siteDetails.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Email Address</p>
                          <p className="font-medium">{siteDetails.email}</p>
                        </div>
                      </div>
                    )}

                    {siteDetails.principalInvestigator && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Principal Investigator</p>
                          <p className="font-medium">{siteDetails.principalInvestigator}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Audit Trail Information */}
              <div className="bg-gray-50 rounded-lg border p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  Audit Trail Information
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Created Date</p>
                      <p className="font-medium text-sm">{formatDate(siteDetails.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Created By</p>
                      <p className="font-medium text-sm">{siteDetails.createdBy || 'System'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Last Modified</p>
                      <p className="font-medium text-sm">{formatDate(siteDetails.lastModified)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Modified By</p>
                      <p className="font-medium text-sm">{siteDetails.lastModifiedBy || 'System'}</p>
                    </div>
                  </div>
                </div>

                {siteDetails.reason && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Creation Reason (Audit Trail)</p>
                    <div className="p-3 bg-gray-100 rounded border">
                      <p className="text-sm text-gray-700">{siteDetails.reason}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* User Assignments */}
              {siteDetails.assignedUsers && siteDetails.assignedUsers.length > 0 && (
                <div className="bg-gray-50 rounded-lg border p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Assigned Users</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {siteDetails.assignedUsers.map((assignment, index) => (
                      <div key={index} className="p-3 bg-gray-100 rounded border">
                        <p className="font-medium">{assignment.userName || `User ID: ${assignment.userId}`}</p>
                        <p className="text-sm text-gray-600">Role: {assignment.roleName || `Role ID: ${assignment.roleId}`}</p>
                        <p className="text-xs text-gray-500">Assigned: {formatDate(assignment.assignedAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Site Statistics */}
              {(siteDetails.activationDate || siteDetails.studyCount !== undefined || siteDetails.userCount !== undefined) && (
                <div className="bg-gray-50 rounded-lg border p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Site Statistics</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {siteDetails.activationDate && (
                      <div>
                        <p className="text-sm text-gray-600">Activation Date</p>
                        <p className="font-medium">{formatDate(siteDetails.activationDate)}</p>
                      </div>
                    )}
                    
                    {siteDetails.studyCount !== undefined && (
                      <div>
                        <p className="text-sm text-gray-600">Associated Studies</p>
                        <p className="font-medium">{siteDetails.studyCount}</p>
                      </div>
                    )}
                    
                    {siteDetails.userCount !== undefined && (
                      <div>
                        <p className="text-sm text-gray-600">Assigned Users</p>
                        <p className="font-medium">{siteDetails.userCount}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {siteDetails.notes && (
                <div className="bg-gray-50 rounded-lg border p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Notes</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{siteDetails.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No site selected</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {siteDetails && `Site ID: ${siteDetails.id}`}
          </div>
          <div className="flex gap-3">
            <button
              disabled
              className="px-4 py-2 text-gray-400 bg-white border border-gray-300 rounded-md cursor-not-allowed flex items-center gap-2"
              title="Feature coming soon"
            >
              <History className="w-4 h-4" />
              Audit History
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDetailsDialog;