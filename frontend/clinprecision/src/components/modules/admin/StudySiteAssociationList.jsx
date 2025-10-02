import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Search, RefreshCw, Eye, Edit, Play, Trash2,
    Building, BookOpen, Users, Calendar, Filter,
    CheckCircle, Clock, XCircle, AlertTriangle
} from 'lucide-react';
import { SiteService } from '../../../services/SiteService';
import { SiteService as StudySiteService } from '../../../services/SiteService';
import StudyService from '../../../services/StudyService';

export default function StudySiteAssociationList() {
    const [associations, setAssociations] = useState([]);
    const [filteredAssociations, setFilteredAssociations] = useState([]);
    const [sites, setSites] = useState([]);
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [selectedSite, setSelectedSite] = useState('');
    const [selectedStudy, setSelectedStudy] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Selection for bulk operations
    const [selectedItems, setSelectedItems] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);

    // Notification
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [associations, selectedSite, selectedStudy, selectedStatus, searchTerm]);

    useEffect(() => {
        setShowBulkActions(selectedItems.length > 0);
    }, [selectedItems]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load sites, studies, and get all associations
            const [sitesData, studiesData] = await Promise.all([
                SiteService.getAllSites(),
                StudyService.getStudies()
            ]);

            console.log('Loaded sites:', sitesData.length);
            console.log('Loaded studies:', studiesData.length);
            console.log('Studies data structure:', studiesData.map(s => ({ id: s.id, name: s.name, title: s.title, protocolNumber: s.protocolNumber })));

            setSites(sitesData);
            setStudies(studiesData);

            // Load associations for all sites
            const allAssociations = [];
            for (const site of sitesData) {
                try {
                    const siteAssociations = await StudySiteService.getStudyAssociationsForSite(site.id);
                    const enrichedAssociations = siteAssociations.map(assoc => {
                        // Convert studyId to number for proper comparison
                        const studyIdAsNumber = Number(assoc.studyId);

                        // Find study by ID (primary match) or fallback to protocol number
                        const matchedStudy = studiesData.find(s =>
                            s.id === studyIdAsNumber ||
                            s.id === assoc.studyId ||
                            s.protocolNumber === assoc.studyId?.toString()
                        );

                        console.log(`Study lookup for association ${assoc.id}:`, {
                            studyId: assoc.studyId,
                            studyIdAsNumber,
                            matchedStudy: matchedStudy ? { id: matchedStudy.id, name: matchedStudy.name, title: matchedStudy.title } : null
                        });

                        return {
                            ...assoc,
                            siteId: site.id, // Add site ID for backend calls
                            siteName: site.name,
                            siteNumber: site.siteNumber,
                            studyName: matchedStudy?.title || matchedStudy?.name || `Study ID: ${assoc.studyId}`
                        };
                    });
                    allAssociations.push(...enrichedAssociations);
                } catch (error) {
                    console.warn(`Failed to load associations for site ${site.id}:`, error);
                }
            }

            setAssociations(allAssociations);

        } catch (error) {
            console.error('Error loading study site associations:', error);
            setError('Failed to load study site associations');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...associations];

        // Site filter
        if (selectedSite) {
            filtered = filtered.filter(assoc => assoc.siteId?.toString() === selectedSite);
        }

        // Study filter
        if (selectedStudy) {
            filtered = filtered.filter(assoc => assoc.studyId === selectedStudy);
        }

        // Status filter
        if (selectedStatus) {
            filtered = filtered.filter(assoc => assoc.status === selectedStatus);
        }

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(assoc =>
                assoc.siteName?.toLowerCase().includes(term) ||
                assoc.siteNumber?.toLowerCase().includes(term) ||
                assoc.studyId?.toLowerCase().includes(term) ||
                assoc.studyName?.toLowerCase().includes(term)
            );
        }

        setFilteredAssociations(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    };

    const handleActivateAssociation = async (association) => {
        const reason = prompt('Please enter a reason for activation:');
        if (!reason) return;

        try {
            await StudySiteService.activateSiteForStudy(association.siteId, association.studyId, { reason });
            showNotification('Study site association activated successfully!', 'success');
            loadData(); // Refresh data
        } catch (error) {
            console.error('Error activating association:', error);
            showNotification('Failed to activate study site association', 'error');
        }
    };

    const handleRemoveAssociation = async (association) => {
        const reason = prompt('Please enter a reason for removal:');
        if (!reason) return;

        if (!window.confirm(`Are you sure you want to remove the association between ${association.siteName} and study ${association.studyId}?`)) {
            return;
        }

        try {
            await StudySiteService.removeSiteStudyAssociation(association.siteId, association.studyId, reason);
            showNotification('Study site association removed successfully!', 'success');
            loadData(); // Refresh data
        } catch (error) {
            console.error('Error removing association:', error);
            showNotification('Failed to remove study site association', 'error');
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle },
            PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: Clock },
            INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', icon: XCircle }
        };

        const config = statusConfig[status] || statusConfig.INACTIVE;
        const IconComponent = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
                <IconComponent className="w-3 h-3 mr-1" />
                {status}
            </span>
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            const currentPageItems = getCurrentPageItems().map(item => item.id);
            setSelectedItems(currentPageItems);
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (itemId, checked) => {
        if (checked) {
            setSelectedItems([...selectedItems, itemId]);
        } else {
            setSelectedItems(selectedItems.filter(id => id !== itemId));
        }
    };

    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredAssociations.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filteredAssociations.length / itemsPerPage);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading study site associations...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={loadData}
                            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Study Site Associations</h1>
                        <p className="text-gray-600 mt-1">Manage relationships between studies and clinical sites</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={loadData}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                        <Link
                            to="/user-management/study-site-associations/create"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Association
                        </Link>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-2xl font-bold text-blue-600">{associations.length}</p>
                            <p className="text-gray-600">Total Associations</p>
                        </div>
                        <BookOpen className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-2xl font-bold text-green-600">
                                {associations.filter(a => a.status === 'ACTIVE').length}
                            </p>
                            <p className="text-gray-600">Active Associations</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-2xl font-bold text-yellow-600">
                                {associations.filter(a => a.status === 'PENDING').length}
                            </p>
                            <p className="text-gray-600">Pending Activation</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
                    <div className="flex items-center">
                        <div className="flex-1">
                            <p className="text-2xl font-bold text-gray-600">{sites.length}</p>
                            <p className="text-gray-600">Total Sites</p>
                        </div>
                        <Building className="w-8 h-8 text-gray-500" />
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search associations..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Site Filter */}
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={selectedSite}
                        onChange={(e) => setSelectedSite(e.target.value)}
                    >
                        <option value="">All Sites</option>
                        {sites.map(site => (
                            <option key={site.id} value={site.id}>
                                {site.siteNumber} - {site.name}
                            </option>
                        ))}
                    </select>

                    {/* Study Filter */}
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={selectedStudy}
                        onChange={(e) => setSelectedStudy(e.target.value)}
                    >
                        <option value="">All Studies</option>
                        {studies.map(study => (
                            <option key={study.id} value={study.protocolNumber || study.id}>
                                {study.protocolNumber || study.id} - {study.name}
                            </option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    {/* Clear Filters */}
                    <button
                        onClick={() => {
                            setSelectedSite('');
                            setSelectedStudy('');
                            setSelectedStatus('');
                            setSearchTerm('');
                        }}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Bulk Actions */}
            {showBulkActions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Users className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-blue-800 font-medium">
                                {selectedItems.length} association{selectedItems.length > 1 ? 's' : ''} selected
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                                Bulk Activate
                            </button>
                            <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                                Bulk Remove
                            </button>
                            <button
                                onClick={() => setSelectedItems([])}
                                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Associations Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        checked={selectedItems.length === getCurrentPageItems().length && getCurrentPageItems().length > 0}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Site Information
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Study Information
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Association ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {getCurrentPageItems().map((association) => (
                                <tr key={association.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(association.id)}
                                            onChange={(e) => handleSelectItem(association.id, e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Building className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{association.siteName}</div>
                                                <div className="text-sm text-gray-500">Site #{association.siteNumber}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <BookOpen className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{association.studyName}</div>
                                                <div className="text-sm text-gray-500">{association.studyId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(association.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {association.id || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {association.createdAt ? new Date(association.createdAt).toLocaleDateString() : 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="text-green-600 hover:text-green-900"
                                                title="Edit Association"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            {association.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleActivateAssociation(association)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Activate Association"
                                                >
                                                    <Play className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleRemoveAssociation(association)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Remove Association"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                                    {' '}to{' '}
                                    <span className="font-medium">
                                        {Math.min(currentPage * itemsPerPage, filteredAssociations.length)}
                                    </span>
                                    {' '}of{' '}
                                    <span className="font-medium">{filteredAssociations.length}</span>
                                    {' '}results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    {[...Array(totalPages)].map((_, index) => {
                                        const page = index + 1;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* No results message */}
            {filteredAssociations.length === 0 && !loading && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No study site associations found</h3>
                    <p className="text-gray-600 mb-4">
                        {associations.length === 0
                            ? "No associations have been created yet. Create your first association to get started."
                            : "No associations match your current filters. Try adjusting your search criteria."
                        }
                    </p>
                    {associations.length === 0 && (
                        <Link
                            to="/user-management/study-site-associations/create"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Association
                        </Link>
                    )}
                </div>
            )}

            {/* Notification */}
            {notification.show && (
                <div className="fixed bottom-4 right-4 z-50">
                    <div className={`p-4 rounded-md shadow-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-100 text-green-800' :
                        notification.type === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
                        {notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
                        <span>{notification.message}</span>
                        <button
                            onClick={() => setNotification({ ...notification, show: false })}
                            className="ml-2 hover:opacity-75"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}