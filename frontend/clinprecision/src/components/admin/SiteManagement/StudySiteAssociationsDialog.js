// src/components/admin/SiteManagement/StudySiteAssociationsDialog.js
import React, { useState, useEffect } from 'react';
import { X, Plus, Play, Trash2, AlertCircle, CheckCircle, Building, BookOpen } from 'lucide-react';
import { SiteService } from '../../../services/SiteService';
import StudyService from '../../../services/StudyService';

const StudySiteAssociationsDialog = ({ open, onClose, site }) => {
  const [loading, setLoading] = useState(false);
  const [associations, setAssociations] = useState([]);
  const [studies, setStudies] = useState([]);
  const [studiesLoading, setStudiesLoading] = useState(false);
  const [newStudyId, setNewStudyId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (open && site) {
      fetchAssociations();
      fetchStudies();
    }
  }, [open, site]);

  const fetchAssociations = async () => {
    try {
      setLoading(true);
      const data = await SiteService.getStudyAssociationsForSite(site.id);
      setAssociations(data);
    } catch (error) {
      console.error('Error fetching associations:', error);
      setError('Failed to load study associations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudies = async () => {
    try {
      setStudiesLoading(true);
      const data = await StudyService.getStudies();
      setStudies(data); // Set all studies initially, filtering will be done in render
    } catch (error) {
      console.error('Error fetching studies:', error);
      // Don't set error state here, just log it - studies dropdown will show loading state
    } finally {
      setStudiesLoading(false);
    }
  };

  // Get available studies (not already associated)
  const getAvailableStudies = () => {
    return studies.filter(study => 
      !associations.some(assoc => 
        assoc.studyId === study.protocolNumber || 
        assoc.studyId === study.id?.toString() ||
        assoc.studyId === study.name
      )
    );
  };

  const handleAddAssociation = async () => {
    if (!newStudyId.trim() || !reason.trim()) {
      setError('Study selection and reason are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await SiteService.associateSiteWithStudy(site.id, {
        studyId: newStudyId.trim(),
        reason: reason.trim()
      });

      setNotification({
        show: true,
        message: 'Study association created successfully!',
        type: 'success'
      });

      // Refresh associations
      await fetchAssociations();
      setNewStudyId('');
      setReason('');

      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);

    } catch (error) {
      console.error('Error creating association:', error);
      setError(error.message || 'Failed to create study association');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateForStudy = async (studyId, activationReason) => {
    try {
      setLoading(true);
      setError('');
      
      await SiteService.activateSiteForStudy(site.id, studyId, {
        reason: activationReason
      });

      setNotification({
        show: true,
        message: 'Site activated for study successfully!',
        type: 'success'
      });

      // Refresh associations
      await fetchAssociations();

      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);

    } catch (error) {
      console.error('Error activating for study:', error);
      setError(error.message || 'Failed to activate site for study');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssociation = async (studyId, removalReason) => {
    try {
      setLoading(true);
      setError('');
      
      await SiteService.removeSiteStudyAssociation(site.id, studyId, removalReason);

      setNotification({
        show: true,
        message: 'Study association removed successfully!',
        type: 'success'
      });

      // Refresh associations
      await fetchAssociations();

      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);

    } catch (error) {
      console.error('Error removing association:', error);
      setError(error.message || 'Failed to remove study association');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewStudyId('');
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Study-Site Associations</h2>
              <p className="text-sm text-gray-600">Manage study associations for {site.name}</p>
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
              <h3 className="font-semibold text-gray-900">Site Information</h3>
            </div>
            <p className="font-medium text-gray-900">{site.name}</p>
            <p className="text-sm text-gray-600">Site Number: {site.siteNumber}</p>
            <p className="text-sm text-gray-600">Organization: {site.organizationName || 'Unknown'}</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

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

          {/* Add New Association */}
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Study Association
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="studyId" className="block text-sm font-medium text-gray-700 mb-2">
                  Study *
                </label>
                <select
                  id="studyId"
                  value={newStudyId}
                  onChange={(e) => setNewStudyId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading || studiesLoading}
                >
                  <option value="">
                    {studiesLoading ? 'Loading studies...' : 'Select a study...'}
                  </option>
                  {getAvailableStudies().map((study) => (
                    <option 
                      key={study.id || study.protocolNumber} 
                      value={study.protocolNumber || study.id}
                    >
                      {study.protocolNumber || study.id} - {study.name}
                    </option>
                  ))}
                </select>
                {getAvailableStudies().length === 0 && !studiesLoading && (
                  <p className="mt-1 text-sm text-gray-500">
                    No available studies to associate
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason *
                </label>
                <input
                  type="text"
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Site selected for multi-center trial"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={handleAddAssociation}
                disabled={loading || !newStudyId.trim() || !reason.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Association
              </button>
            </div>
          </div>

          {/* Existing Associations */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Current Study Associations</h3>
            
            {loading && associations.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600">Loading associations...</p>
              </div>
            ) : associations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No study associations found</p>
                <p className="text-sm">Add a study association to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {associations.map((association) => (
                  <StudyAssociationCard
                    key={association.id}
                    association={association}
                    onActivate={handleActivateForStudy}
                    onRemove={handleRemoveAssociation}
                    disabled={loading}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
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

// Individual study association card component
const StudyAssociationCard = ({ association, onActivate, onRemove, disabled }) => {
  const [showActivatePrompt, setShowActivatePrompt] = useState(false);
  const [showRemovePrompt, setShowRemovePrompt] = useState(false);
  const [activationReason, setActivationReason] = useState('');
  const [removalReason, setRemovalReason] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className="font-medium text-gray-900">Study: {association.studyId}</h4>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(association.status)}`}>
              {association.status}
            </span>
          </div>
          
          <div className="mt-2 text-sm text-gray-600 space-y-1">
            <p>Association ID: {association.id}</p>
            {association.activationDate && (
              <p>Activated: {new Date(association.activationDate).toLocaleDateString()}</p>
            )}
            {association.subjectEnrollmentCap && (
              <p>Enrollment Cap: {association.subjectEnrollmentCount || 0} / {association.subjectEnrollmentCap}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {association.status === 'PENDING' && (
            <button
              onClick={() => setShowActivatePrompt(true)}
              disabled={disabled}
              className="px-3 py-1 text-green-600 border border-green-600 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              Activate
            </button>
          )}
          
          <button
            onClick={() => setShowRemovePrompt(true)}
            disabled={disabled}
            className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Remove
          </button>
        </div>
      </div>

      {/* Activate Prompt */}
      {showActivatePrompt && (
        <div className="mt-4 p-3 border-t bg-green-50">
          <p className="text-sm text-green-800 mb-2">Activate this site for the study:</p>
          <input
            type="text"
            value={activationReason}
            onChange={(e) => setActivationReason(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-green-300 rounded-md mb-2"
            placeholder="Reason for activation..."
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (activationReason.trim()) {
                  onActivate(association.studyId, activationReason.trim());
                  setShowActivatePrompt(false);
                  setActivationReason('');
                }
              }}
              disabled={!activationReason.trim()}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              Confirm
            </button>
            <button
              onClick={() => {
                setShowActivatePrompt(false);
                setActivationReason('');
              }}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Remove Prompt */}
      {showRemovePrompt && (
        <div className="mt-4 p-3 border-t bg-red-50">
          <p className="text-sm text-red-800 mb-2">Remove this study association:</p>
          <input
            type="text"
            value={removalReason}
            onChange={(e) => setRemovalReason(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-red-300 rounded-md mb-2"
            placeholder="Reason for removal..."
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                const reason = removalReason.trim() || 'Administrative removal';
                onRemove(association.studyId, reason);
                setShowRemovePrompt(false);
                setRemovalReason('');
              }}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Confirm
            </button>
            <button
              onClick={() => {
                setShowRemovePrompt(false);
                setRemovalReason('');
              }}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudySiteAssociationsDialog;