// src/components/admin/SiteManagement/AssignUserDialog.js
import React, { useState, useEffect } from 'react';
import { X, UserPlus, User, Badge, MapPin, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { SiteService } from '../../../../services/SiteService';

const AssignUserDialog = ({ open, onClose, site, onUserAssigned }) => {
  const [formData, setFormData] = useState({
    userId: '',
    roleId: '',
    reason: ''
  });
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (open) {
      loadUsers();
      loadRoles();
    }
  }, [open]);

  // Filter users based on search term
  useEffect(() => {
    if (userSearchTerm) {
      const filtered = users.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.title.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, userSearchTerm]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      // Mock data - replace with actual UserService call
      const mockUsers = [
        {
          id: 1,
          firstName: 'Dr. Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@example.com',
          title: 'Principal Investigator',
          department: 'Oncology',
          isActive: true
        },
        {
          id: 2,
          firstName: 'Michael',
          lastName: 'Chen',
          email: 'michael.chen@example.com',
          title: 'Study Coordinator',
          department: 'Clinical Research',
          isActive: true
        },
        {
          id: 3,
          firstName: 'Dr. Emily',
          lastName: 'Rodriguez',
          email: 'emily.rodriguez@example.com',
          title: 'Sub-Investigator',
          department: 'Cardiology',
          isActive: true
        },
        {
          id: 4,
          firstName: 'James',
          lastName: 'Wilson',
          email: 'james.wilson@example.com',
          title: 'Clinical Research Associate',
          department: 'Clinical Research',
          isActive: true
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(mockUsers.filter(user => user.isActive));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadRoles = async () => {
    setLoadingRoles(true);
    try {
      // Mock data - replace with actual RoleService call
      const mockRoles = [
        {
          id: 1,
          name: 'Principal Investigator',
          description: 'Lead investigator responsible for the conduct of the clinical trial',
          permissions: ['site_management', 'patient_enrollment', 'data_entry', 'safety_reporting']
        },
        {
          id: 2,
          name: 'Sub-Investigator',
          description: 'Licensed physician who participates in the conduct of a clinical trial',
          permissions: ['patient_enrollment', 'data_entry', 'safety_reporting']
        },
        {
          id: 3,
          name: 'Study Coordinator',
          description: 'Professional who coordinates the administrative aspects of clinical trials',
          permissions: ['patient_scheduling', 'data_entry', 'regulatory_compliance']
        },
        {
          id: 4,
          name: 'Clinical Research Associate',
          description: 'Monitor who ensures trial compliance and data quality',
          permissions: ['data_monitoring', 'source_verification', 'regulatory_compliance']
        },
        {
          id: 5,
          name: 'Site Administrator',
          description: 'Administrative oversight of site operations',
          permissions: ['user_management', 'site_configuration', 'reporting']
        }
      ];
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setRoles(mockRoles);
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userId) {
      newErrors.userId = 'Please select a user to assign to this site';
    }

    if (!formData.roleId) {
      newErrors.roleId = 'Please select a role for the user assignment';
    }

    if (!formData.reason?.trim()) {
      newErrors.reason = 'Reason for user assignment is required for audit compliance';
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

  const handleUserSelect = (user) => {
    setFormData(prev => ({ ...prev, userId: user.id }));
    setUserSearchTerm(`${user.firstName} ${user.lastName}`);
    setShowUserDropdown(false);
    if (errors.userId) {
      setErrors(prev => ({ ...prev, userId: '' }));
    }
  };

  const handleSubmit = async () => {
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
      
      const assignmentData = {
        userId: parseInt(formData.userId),
        roleId: parseInt(formData.roleId),
        reason: formData.reason.trim()
      };

      await SiteService.assignUserToSite(site.id, assignmentData);
      
      setNotification({
        show: true,
        message: 'User assigned to site successfully!',
        type: 'success'
      });

      setTimeout(() => {
        onUserAssigned();
        onClose();
        resetForm();
      }, 1000);

    } catch (error) {
      console.error('Error assigning user to site:', error);
      setNotification({
        show: true,
        message: error.message || 'Failed to assign user to site. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ userId: '', roleId: '', reason: '' });
    setUserSearchTerm('');
    setErrors({});
    setNotification({ show: false, message: '', type: 'success' });
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const getSelectedUser = () => {
    return users.find(user => user.id === parseInt(formData.userId));
  };

  const getSelectedRole = () => {
    return roles.find(role => role.id === parseInt(formData.roleId));
  };

  if (!open || !site) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <UserPlus className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Assign User to Site</h2>
              <p className="text-sm text-gray-600">Assign a user role to {site.name} for clinical trial operations</p>
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
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Site Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600"><strong>Site:</strong> {site.name}</p>
                <p className="text-sm text-gray-600"><strong>Site Number:</strong> {site.siteNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600"><strong>Organization:</strong> {site.organizationName}</p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> 
                  <span className={`ml-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    site.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {site.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => {
                    setUserSearchTerm(e.target.value);
                    setShowUserDropdown(true);
                    if (formData.userId) {
                      setFormData(prev => ({ ...prev, userId: '' }));
                    }
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.userId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Search users..."
                  disabled={loadingUsers}
                />
                {showUserDropdown && userSearchTerm && filteredUsers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredUsers.slice(0, 10).map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserSelect(user)}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{user.title} | {user.department}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.userId && <p className="mt-1 text-sm text-red-600">{errors.userId}</p>}
              {!errors.userId && <p className="mt-1 text-sm text-gray-500">Search and select a user to assign to this site</p>}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role *
              </label>
              <select
                value={formData.roleId}
                onChange={(e) => handleInputChange('roleId', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.roleId ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loadingRoles}
              >
                <option value="">Select a role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.roleId && <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>}
              {!errors.roleId && <p className="mt-1 text-sm text-gray-500">Select the role this user will have at the site</p>}
            </div>
          </div>

          {/* Assignment Preview */}
          {formData.userId && formData.roleId && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="text-sm font-semibold text-purple-800 mb-3">Assignment Preview</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">
                      User: {getSelectedUser()?.firstName} {getSelectedUser()?.lastName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {getSelectedUser()?.title} | {getSelectedUser()?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Role: {getSelectedRole()?.name}</p>
                    <p className="text-xs text-gray-600">{getSelectedRole()?.description}</p>
                  </div>
                </div>
              </div>
              
              {getSelectedRole()?.permissions && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {getSelectedRole().permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"
                      >
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reason for Assignment */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for User Assignment *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.reason ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Assigning Dr. Johnson as Principal Investigator for the Phase II oncology study. She has completed GCP training and has experience with similar protocols."
              disabled={loading}
            />
            {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
            {!errors.reason && <p className="mt-1 text-sm text-gray-500">Provide a detailed reason for this user assignment (required for regulatory audit trail)</p>}
          </div>

          {/* Notification */}
          {notification.show && (
            <div className={`mt-4 p-4 rounded-md flex items-center gap-3 ${
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

          {/* Regulatory Notice */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Regulatory Notice:</strong> User assignments create permanent audit trail entries 
              for FDA 21 CFR Part 11 compliance. This action will be recorded with your credentials, 
              timestamp, and the reason provided above.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || loadingUsers || loadingRoles || !formData.userId || !formData.roleId}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Assign User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignUserDialog;