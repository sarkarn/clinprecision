// src/components/admin/SiteManagement/SiteManagement.js
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  MapPin,
  Building,
  Phone,
  Mail,
  Eye,
  Edit,
  Play,
  UserPlus,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { SiteService } from '../../../services/SiteService';
import { OrganizationService } from '../../../services/OrganizationService';

import CreateSiteDialog from './CreateSiteDialog';
import SiteDetailsDialog from './SiteDetailsDialog';
import ActivateSiteDialog from './ActivateSiteDialog';



const AssignUserDialog = ({ open, onClose, site, onUserAssigned }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Assign User</h2>
        <p className="text-gray-600 mb-4">Assign user to {site?.name}</p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUserAssigned();
              onClose();
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

const SiteManagement = () => {
  const [sites, setSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterOrganization, setFilterOrganization] = useState('all');
  const [selectedSite, setSelectedSite] = useState(null);
  const [statistics, setStatistics] = useState(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [assignUserDialogOpen, setAssignUserDialogOpen] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load data on component mount
  useEffect(() => {
    loadSites();
    loadOrganizations();
    loadStatistics();
  }, []);

  // Apply filters when search term, status, or organization filter changes
  useEffect(() => {
    applyFilters();
  }, [sites, searchTerm, filterStatus, filterOrganization]);

  const loadSites = async () => {
    try {
      setLoading(true);
      const sitesData = await SiteService.getAllSites();
      setSites(sitesData);
    } catch (error) {
      showNotification('Error loading sites: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const organizationsData = await OrganizationService.getAllOrganizations();
      setOrganizations(organizationsData);
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await SiteService.getSiteStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const applyFilters = () => {
    let filtered = sites;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(site =>
        site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.siteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (site.city && site.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (site.organizationName && site.organizationName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(site => site.status === filterStatus);
    }

    // Organization filter
    if (filterOrganization !== 'all') {
      filtered = filtered.filter(site => site.organizationId === parseInt(filterOrganization));
    }

    setFilteredSites(filtered);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleSiteCreated = () => {
    loadSites();
    loadStatistics();
    setCreateDialogOpen(false);
    showNotification('Site created successfully!');
  };

  const handleSiteActivated = () => {
    loadSites();
    loadStatistics();
    setActivateDialogOpen(false);
    showNotification('Site activated successfully!');
  };

  const handleUserAssigned = () => {
    loadSites();
    setAssignUserDialogOpen(false);
    showNotification('User assigned to site successfully!');
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
    const parts = [];
    if (site.addressLine1) parts.push(site.addressLine1);
    if (site.city) parts.push(site.city);
    if (site.state) parts.push(site.state);
    if (site.country) parts.push(site.country);
    return parts.join(', ') || 'No address provided';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading sites...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clinical Site Management</h1>
        <p className="text-gray-600 mt-1">Manage clinical trial sites with full audit trail compliance</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-2xl font-bold text-blue-600">{statistics.totalSites}</p>
                <p className="text-gray-600">Total Sites</p>
              </div>
              <Building className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-2xl font-bold text-green-600">{statistics.activeSites}</p>
                <p className="text-gray-600">Active Sites</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-2xl font-bold text-yellow-600">{statistics.pendingSites}</p>
                <p className="text-gray-600">Pending Sites</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-2xl font-bold text-red-600">
                  {statistics.inactiveSites + statistics.suspendedSites}
                </p>
                <p className="text-gray-600">Inactive/Suspended</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sites..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Organization Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterOrganization}
            onChange={(e) => setFilterOrganization(e.target.value)}
          >
            <option value="all">All Organizations</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Site
            </button>
            <button
              onClick={loadSites}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSites.map((site) => (
          <div key={site.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">{site.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(site.status)}`}>
                  {getStatusIcon(site.status)}
                  <span className="ml-1">{site.status}</span>
                </span>
              </div>

              {/* Site Number */}
              <p className="text-sm text-gray-600 mb-3">Site Number: {site.siteNumber}</p>

              {/* Organization */}
              <div className="flex items-center mb-2">
                <Building className="w-4 h-4 text-gray-400 mr-2" />
                <p className="text-sm text-gray-600">{site.organizationName || 'Unknown Organization'}</p>
              </div>

              {/* Address */}
              <div className="flex items-start mb-2">
                <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                <p className="text-sm text-gray-600 flex-1">{formatAddress(site)}</p>
              </div>

              {/* Contact Info */}
              {site.phone && (
                <div className="flex items-center mb-2">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-600">{site.phone}</p>
                </div>
              )}

              {site.email && (
                <div className="flex items-center mb-4">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-600">{site.email}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setSelectedSite(site);
                      setDetailsDialogOpen(true);
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Edit Site"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-1">
                  {site.status !== 'active' && (
                    <button
                      onClick={() => {
                        setSelectedSite(site);
                        setActivateDialogOpen(true);
                      }}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      title="Activate Site"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedSite(site);
                      setAssignUserDialogOpen(true);
                    }}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                    title="Assign User"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results message */}
      {filteredSites.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No sites found</h3>
          <p className="text-gray-600 mb-4">
            {sites.length === 0 
              ? "No sites have been created yet. Click 'Create Site' to get started."
              : "No sites match your current filters. Try adjusting your search criteria."
            }
          </p>
          {sites.length === 0 && (
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Create Your First Site
            </button>
          )}
        </div>
      )}

      {/* Dialogs */}
      <CreateSiteDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSiteCreated={handleSiteCreated}
        organizations={organizations}
      />

      <SiteDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        site={selectedSite}
      />

      <ActivateSiteDialog
        open={activateDialogOpen}
        onClose={() => setActivateDialogOpen(false)}
        site={selectedSite}
        onSiteActivated={handleSiteActivated}
      />

      <AssignUserDialog
        open={assignUserDialogOpen}
        onClose={() => setAssignUserDialogOpen(false)}
        site={selectedSite}
        onUserAssigned={handleUserAssigned}
      />

      {/* Notification */}
      {notification.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`p-4 rounded-md shadow-lg flex items-center gap-3 ${
            notification.severity === 'success' ? 'bg-green-100 text-green-800' :
            notification.severity === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {notification.severity === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.severity === 'error' && <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
            <button
              onClick={handleCloseNotification}
              className="ml-2 hover:opacity-75"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteManagement;