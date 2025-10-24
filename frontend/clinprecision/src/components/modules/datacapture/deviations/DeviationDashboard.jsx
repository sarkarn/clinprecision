/**
 * DeviationDashboard Component
 * 
 * Study-wide analytics dashboard for protocol deviations with Tailwind CSS
 * 
 * Created: October 2025
 * Part of: Protocol Deviation Tracking (Feature #3)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProtocolDeviationService from '../../../../services/ProtocolDeviationService';
import { getStudies } from '../../../../services/StudyService';

const DeviationDashboard = () => {
    const { studyId: urlStudyId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // State management
    const [studies, setStudies] = useState([]);
    const [selectedStudy, setSelectedStudy] = useState(urlStudyId || '');
    const [deviations, setDeviations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [metrics, setMetrics] = useState({
        total: 0,
        bySeverity: { MINOR: 0, MAJOR: 0, CRITICAL: 0 },
        byType: {},
        byStatus: {},
        requiresReporting: 0
    });

    // Filters
    const [filters, setFilters] = useState({
        severity: 'ALL',
        type: 'ALL',
        status: 'ALL',
        startDate: '',
        endDate: '',
        requiresReporting: false
    });

    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Load studies on mount
    useEffect(() => {
        loadStudies();
    }, []);

    // Fetch deviations when study or filters change
    useEffect(() => {
        if (selectedStudy) {
            fetchDeviations();
        } else {
            // No study selected, clear data but stop loading
            setDeviations([]);
            calculateMetrics([]);
            setLoading(false);
        }
    }, [selectedStudy, filters]);

    const loadStudies = async () => {
        try {
            const studiesData = await getStudies();
            // Filter for active/published studies
            const activeStudies = studiesData.filter(s =>
                s.status === 'ACTIVE' || s.status === 'RECRUITING' || s.status === 'PUBLISHED'
            );
            setStudies(activeStudies);

            // If preselected study from navigation state
            if (location.state?.preselectedStudy) {
                setSelectedStudy(location.state.preselectedStudy);
            } else if (activeStudies.length === 1) {
                // Auto-select if only one study
                setSelectedStudy(activeStudies[0].id);
            }
        } catch (err) {
            console.error('Error loading studies:', err);
        }
    };

    const fetchDeviations = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                studyId: selectedStudy,
                ...(filters.severity !== 'ALL' && { severity: filters.severity }),
                ...(filters.type !== 'ALL' && { type: filters.type }),
                ...(filters.status !== 'ALL' && { status: filters.status }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate }),
                ...(filters.requiresReporting && { requiresReporting: true })
            };

            const data = await ProtocolDeviationService.getStudyDeviations(params);
            setDeviations(data || []);
            calculateMetrics(data || []);
        } catch (err) {
            console.error('Error fetching deviations:', err);
            setError('Failed to load deviations. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const calculateMetrics = (deviationList) => {
        const bySeverity = { MINOR: 0, MAJOR: 0, CRITICAL: 0 };
        const byType = {};
        const byStatus = {};
        let requiresReporting = 0;

        deviationList.forEach(dev => {
            if (dev.severity) {
                bySeverity[dev.severity] = (bySeverity[dev.severity] || 0) + 1;
            }
            const type = dev.deviationType || 'UNKNOWN';
            byType[type] = (byType[type] || 0) + 1;
            const status = dev.deviationStatus || 'UNKNOWN';
            byStatus[status] = (byStatus[status] || 0) + 1;
            if (dev.requiresReporting) {
                requiresReporting++;
            }
        });

        setMetrics({
            total: deviationList.length,
            bySeverity,
            byType,
            byStatus,
            requiresReporting
        });
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPage(0);
    };

    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDeviation = (deviation) => {
        navigate(`/datacapture/subjects/${deviation.patientId}`, {
            state: { highlightDeviationId: deviation.id }
        });
    };

    const handleExport = () => {
        try {
            const csv = ProtocolDeviationService.exportDeviationsToCsv(deviations);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `deviations-study-${selectedStudy}-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error exporting deviations:', err);
            setError('Failed to export deviations.');
        }
    };

    const getSeverityBadgeClass = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
            case 'MAJOR': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'MINOR': return 'bg-blue-100 text-blue-800 border-blue-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-red-100 text-red-800';
            case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            case 'CLOSED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Paginated data
    const paginatedDeviations = deviations.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const totalPages = Math.ceil(deviations.length / rowsPerPage);

    if (loading && studies.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Header with Study Selector */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Protocol Deviation Dashboard</h1>
                    <p className="text-gray-600 mt-1">Track and analyze protocol deviations across studies</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchDeviations}
                        disabled={loading || !selectedStudy}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={deviations.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Study Selector */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Study</label>
                <select
                    value={selectedStudy}
                    onChange={(e) => {
                        setSelectedStudy(e.target.value);
                        setPage(0); // Reset pagination
                    }}
                    className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">-- Select a Study --</option>
                    {studies.map((study) => (
                        <option key={study.id} value={study.id}>
                            {study.protocolNumber} - {study.title || study.name}
                        </option>
                    ))}
                </select>
                {!selectedStudy && (
                    <p className="text-sm text-gray-500 mt-2">
                        Please select a study to view protocol deviations
                    </p>
                )}
            </div>

            {/* Show content only if study is selected */}
            {!selectedStudy ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Study Selected</h3>
                    <p className="text-gray-500">
                        Select a study from the dropdown above to view protocol deviations and analytics.
                    </p>
                </div>
            ) : loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
                            <span>{error}</span>
                            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-500 mb-1">Total Deviations</div>
                            <div className="text-3xl font-bold text-gray-900">{metrics.total}</div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                            <div className="text-sm text-gray-500 mb-1">Critical</div>
                            <div className="text-3xl font-bold text-red-600">{metrics.bySeverity.CRITICAL}</div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                            <div className="text-sm text-gray-500 mb-1">Major</div>
                            <div className="text-3xl font-bold text-yellow-600">{metrics.bySeverity.MAJOR}</div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                            <div className="text-sm text-gray-500 mb-1">Minor</div>
                            <div className="text-3xl font-bold text-blue-600">{metrics.bySeverity.MINOR}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-500 mb-2">Requires Reporting</div>
                            <div className="text-2xl font-bold text-red-600 mb-1">{metrics.requiresReporting}</div>
                            <div className="text-xs text-gray-500">Sponsor/IRB notification needed</div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-500 mb-2">Deviation Types</div>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(metrics.byType).map(([type, count]) => (
                                    <span key={type} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {ProtocolDeviationService.formatDeviationType(type)}: {count}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Filters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                <select
                                    value={filters.severity}
                                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ALL">All</option>
                                    <option value="CRITICAL">Critical</option>
                                    <option value="MAJOR">Major</option>
                                    <option value="MINOR">Minor</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ALL">All</option>
                                    <option value="VISIT_WINDOW">Visit Window</option>
                                    <option value="PROTOCOL_PROCEDURE">Protocol Procedure</option>
                                    <option value="INFORMED_CONSENT">Informed Consent</option>
                                    <option value="INCLUSION_EXCLUSION">Inclusion/Exclusion</option>
                                    <option value="DOSING">Dosing</option>
                                    <option value="SAFETY_REPORTING">Safety Reporting</option>
                                    <option value="DATA_ENTRY">Data Entry</option>
                                    <option value="REGULATORY">Regulatory</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ALL">All</option>
                                    <option value="OPEN">Open</option>
                                    <option value="UNDER_REVIEW">Under Review</option>
                                    <option value="RESOLVED">Resolved</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting</label>
                                <select
                                    value={filters.requiresReporting ? 'YES' : 'NO'}
                                    onChange={(e) => handleFilterChange('requiresReporting', e.target.value === 'YES')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="NO">All</option>
                                    <option value="YES">Requires Reporting</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Deviations Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deviation ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporting</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedDeviations.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                                No deviations found matching the current filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedDeviations.map((deviation) => (
                                            <tr key={deviation.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    DEV-{deviation.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    PAT-{deviation.patientId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {ProtocolDeviationService.formatDeviationType(deviation.deviationType)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getSeverityBadgeClass(deviation.severity)}`}>
                                                        {deviation.severity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(deviation.deviationStatus)}`}>
                                                        {ProtocolDeviationService.formatStatus(deviation.deviationStatus)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {ProtocolDeviationService.formatDate(deviation.deviationDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {deviation.requiresReporting && (
                                                        <span className="text-red-600" title="Sponsor/IRB Reporting Required">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => handleViewDeviation(deviation)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View Patient Details"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {deviations.length > 0 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => handleChangePage(page - 1)}
                                        disabled={page === 0}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => handleChangePage(page + 1)}
                                        disabled={page >= totalPages - 1}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{page * rowsPerPage + 1}</span> to{' '}
                                            <span className="font-medium">{Math.min((page + 1) * rowsPerPage, deviations.length)}</span> of{' '}
                                            <span className="font-medium">{deviations.length}</span> results
                                        </p>
                                        <select
                                            value={rowsPerPage}
                                            onChange={handleChangeRowsPerPage}
                                            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                                        >
                                            <option value={5}>5 per page</option>
                                            <option value={10}>10 per page</option>
                                            <option value={25}>25 per page</option>
                                            <option value={50}>50 per page</option>
                                        </select>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button
                                                onClick={() => handleChangePage(page - 1)}
                                                disabled={page === 0}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                Page {page + 1} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => handleChangePage(page + 1)}
                                                disabled={page >= totalPages - 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                <span className="sr-only">Next</span>
                                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default DeviationDashboard;
