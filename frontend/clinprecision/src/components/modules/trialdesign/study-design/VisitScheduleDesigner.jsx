import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Activity, FileText } from 'lucide-react';
import { Alert, Button } from '../components/UIComponents';
import VisitService from '../../../../services/VisitService';
import StudyService from '../../../../services/StudyService';

/**
 * Visit Schedule Designer Component
 * Manages study visits, procedures, and timeline
 */
const VisitScheduleDesigner = () => {
    const { studyId } = useParams();
    const navigate = useNavigate();

    // State management
    const [study, setStudy] = useState(null);
    const [visits, setVisits] = useState([]);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [procedures, setProcedures] = useState([]);
    const [timelineView, setTimelineView] = useState('weeks'); // 'days', 'weeks', 'months'
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);
    const [isDirty, setIsDirty] = useState(false);

    // Load study data
    useEffect(() => {
        loadStudyData();
    }, [studyId]);

    const loadStudyData = async () => {
        try {
            setLoading(true);

            // Load actual data from backend APIs
            const [studyData, visitsData] = await Promise.all([
                StudyService.getStudyById(studyId),
                VisitService.getVisitsByStudy(studyId)
            ]);

            setStudy(studyData);

            // Transform backend visit data to frontend format
            const transformedVisits = (visitsData || []).map(visit => ({
                id: visit.id,
                name: visit.name || `Visit ${visit.sequenceNumber || ''}`,
                type: visit.visitType || 'TREATMENT',
                window: {
                    days: [
                        (visit.timepoint || 0) - (visit.windowBefore || 0),
                        (visit.timepoint || 0) + (visit.windowAfter || 0)
                    ],
                    description: visit.description || ''
                },
                isRequired: visit.isRequired !== false,
                procedures: visit.visitForms ? visit.visitForms.map(vf => vf.formDefinition?.id) || [] : [],
                forms: visit.visitForms || [],
                armId: visit.armId,
                studyId: visit.studyId,
                sequenceNumber: visit.sequenceNumber,
                timepoint: visit.timepoint,
                windowBefore: visit.windowBefore,
                windowAfter: visit.windowAfter,
                createdAt: visit.createdAt,
                updatedAt: visit.updatedAt
            }));

            setVisits(transformedVisits);

            // Set default procedures - could be loaded from a procedures API if available
            setProcedures([
                { id: 'informed_consent', name: 'Informed Consent', category: 'Regulatory', duration: 30 },
                { id: 'medical_history', name: 'Medical History', category: 'Assessment', duration: 15 },
                { id: 'physical_exam', name: 'Physical Examination', category: 'Assessment', duration: 20 },
                { id: 'lab_work', name: 'Laboratory Tests', category: 'Laboratory', duration: 15 },
                { id: 'vital_signs', name: 'Vital Signs', category: 'Assessment', duration: 10 },
                { id: 'ecg', name: 'ECG', category: 'Cardiac', duration: 15 },
                { id: 'randomization', name: 'Randomization', category: 'Regulatory', duration: 10 },
                { id: 'drug_dispensing', name: 'Drug Dispensing', category: 'Drug Management', duration: 10 },
                { id: 'safety_assessment', name: 'Safety Assessment', category: 'Assessment', duration: 20 },
                { id: 'adverse_events', name: 'Adverse Events Review', category: 'Safety', duration: 15 },
                { id: 'efficacy_assessment', name: 'Efficacy Assessment', category: 'Assessment', duration: 25 },
                { id: 'imaging', name: 'Imaging (CT/MRI)', category: 'Imaging', duration: 60 },
                { id: 'final_assessment', name: 'Final Assessment', category: 'Assessment', duration: 30 },
                { id: 'drug_return', name: 'Drug Return', category: 'Drug Management', duration: 10 },
                { id: 'survival_follow_up', name: 'Survival Follow-up', category: 'Follow-up', duration: 15 }
            ]);

            if (transformedVisits && transformedVisits.length > 0) {
                setSelectedVisit(transformedVisits[0]);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading visit schedule:', error);
            setErrors(['Failed to load visit schedule data']);
            setLoading(false);
        }
    };

    // Add new visit
    const handleAddVisit = async () => {
        try {
            const newVisitData = {
                name: `Visit ${visits.length + 1}`,
                visitType: 'TREATMENT',
                timepoint: 7 * visits.length,
                windowBefore: 0,
                windowAfter: 3,
                description: '',
                isRequired: true,
                studyId: parseInt(studyId)
            };

            const createdVisit = await VisitService.createVisit(studyId, newVisitData);

            // Transform to frontend format
            const transformedVisit = {
                id: createdVisit.id,
                name: createdVisit.name || `Visit ${createdVisit.sequenceNumber || ''}`,
                type: createdVisit.visitType || 'TREATMENT',
                window: {
                    days: [
                        (createdVisit.timepoint || 0) - (createdVisit.windowBefore || 0),
                        (createdVisit.timepoint || 0) + (createdVisit.windowAfter || 0)
                    ],
                    description: createdVisit.description || ''
                },
                isRequired: createdVisit.isRequired !== false,
                procedures: [],
                forms: [],
                armId: createdVisit.armId,
                studyId: createdVisit.studyId,
                sequenceNumber: createdVisit.sequenceNumber,
                timepoint: createdVisit.timepoint,
                windowBefore: createdVisit.windowBefore,
                windowAfter: createdVisit.windowAfter,
                createdAt: createdVisit.createdAt,
                updatedAt: createdVisit.updatedAt
            };

            const updatedVisits = [...visits, transformedVisit];
            setVisits(updatedVisits);
            setSelectedVisit(transformedVisit);
            setIsDirty(true);
        } catch (error) {
            console.error('Error creating visit:', error);
            setErrors(['Failed to create visit']);
        }
    };

    // Update visit
    const handleUpdateVisit = async (visitId, updates) => {
        try {
            // Transform frontend updates to backend format
            const backendUpdates = {};

            if (updates.name !== undefined) backendUpdates.name = updates.name;
            if (updates.type !== undefined) backendUpdates.visitType = updates.type;
            if (updates.isRequired !== undefined) backendUpdates.isRequired = updates.isRequired;
            if (updates.window) {
                if (updates.window.days) {
                    const [startDay, endDay] = updates.window.days;
                    const timepoint = Math.round((startDay + endDay) / 2);
                    const windowBefore = timepoint - startDay;
                    const windowAfter = endDay - timepoint;

                    backendUpdates.timepoint = timepoint;
                    backendUpdates.windowBefore = windowBefore;
                    backendUpdates.windowAfter = windowAfter;
                }
                if (updates.window.description !== undefined) {
                    backendUpdates.description = updates.window.description;
                }
            }

            const updatedVisit = await VisitService.updateVisit(visitId, backendUpdates);

            // Transform the response back to frontend format
            const transformedVisit = {
                id: updatedVisit.id,
                name: updatedVisit.name || `Visit ${updatedVisit.sequenceNumber || ''}`,
                type: updatedVisit.visitType || 'TREATMENT',
                window: {
                    days: [
                        (updatedVisit.timepoint || 0) - (updatedVisit.windowBefore || 0),
                        (updatedVisit.timepoint || 0) + (updatedVisit.windowAfter || 0)
                    ],
                    description: updatedVisit.description || ''
                },
                isRequired: updatedVisit.isRequired !== false,
                procedures: updatedVisit.visitForms ? updatedVisit.visitForms.map(vf => vf.formDefinition?.id) || [] : [],
                forms: updatedVisit.visitForms || [],
                armId: updatedVisit.armId,
                studyId: updatedVisit.studyId,
                sequenceNumber: updatedVisit.sequenceNumber,
                timepoint: updatedVisit.timepoint,
                windowBefore: updatedVisit.windowBefore,
                windowAfter: updatedVisit.windowAfter,
                createdAt: updatedVisit.createdAt,
                updatedAt: updatedVisit.updatedAt
            };

            const updatedVisits = visits.map(visit =>
                visit.id === visitId ? transformedVisit : visit
            );
            setVisits(updatedVisits);
            if (selectedVisit && selectedVisit.id === visitId) {
                setSelectedVisit(transformedVisit);
            }
            setIsDirty(true);
        } catch (error) {
            console.error('Error updating visit:', error);
            setErrors(['Failed to update visit']);
        }
    };

    // Delete visit
    const handleDeleteVisit = async (visitId) => {
        if (window.confirm('Are you sure you want to delete this visit? This action cannot be undone.')) {
            try {
                await VisitService.deleteVisit(visitId);
                const updatedVisits = visits.filter(visit => visit.id !== visitId);
                setVisits(updatedVisits);
                if (selectedVisit && selectedVisit.id === visitId) {
                    setSelectedVisit(updatedVisits.length > 0 ? updatedVisits[0] : null);
                }
                setIsDirty(true);
            } catch (error) {
                console.error('Error deleting visit:', error);
                setErrors(['Failed to delete visit']);
            }
        }
    };

    // Add procedure to visit
    const handleAddProcedure = (visitId, procedureId) => {
        const visit = visits.find(v => v.id === visitId);
        if (visit && !visit.procedures.includes(procedureId)) {
            const updatedProcedures = [...visit.procedures, procedureId];
            handleUpdateVisit(visitId, { procedures: updatedProcedures });
        }
    };

    // Remove procedure from visit
    const handleRemoveProcedure = (visitId, procedureId) => {
        const visit = visits.find(v => v.id === visitId);
        if (visit) {
            const updatedProcedures = visit.procedures.filter(p => p !== procedureId);
            handleUpdateVisit(visitId, { procedures: updatedProcedures });
        }
    };

    // Calculate visit day from window
    const getVisitDay = (visit) => {
        const { days } = visit.window;
        return Math.round((days[0] + days[1]) / 2);
    };

    // Get visit position for timeline
    const getVisitPosition = (visit) => {
        const day = getVisitDay(visit);
        const totalDays = study?.duration * 7 || 728; // Default 2 years
        return (day / totalDays) * 100;
    };

    // Save changes
    const handleSave = async () => {
        try {
            // Validate data
            const validationErrors = validateVisitsData();
            if (validationErrors.length > 0) {
                setErrors(validationErrors);
                return;
            }

            // Mock save - replace with actual API call
            console.log('Saving visit schedule:', { studyId, visits });
            setIsDirty(false);
            setErrors([]);
        } catch (error) {
            console.error('Error saving visit schedule:', error);
            setErrors(['Failed to save visit schedule']);
        }
    };

    // Validate visits data
    const validateVisitsData = () => {
        const errors = [];

        if (visits.length === 0) {
            errors.push('At least one visit is required');
        }

        // Check for baseline visit
        const hasBaseline = visits.some(v => v.type === 'BASELINE');
        if (!hasBaseline) {
            errors.push('A baseline visit is required');
        }

        visits.forEach((visit, index) => {
            if (!visit.name.trim()) {
                errors.push(`Visit ${index + 1}: Name is required`);
            }
            if (visit.procedures.length === 0) {
                errors.push(`Visit ${index + 1}: At least one procedure is required`);
            }
        });

        return errors;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading visit schedule...</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Visit Schedule Design</h1>
                        <p className="text-gray-600 mt-1">
                            Configure study visits, procedures, and timeline for {study?.name}
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            Back
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!isDirty}
                            variant="primary"
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-900">Total Visits</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900 mt-1">{visits.length}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Clock className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-900">Study Duration</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900 mt-1">{study?.duration || 0}w</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Activity className="h-5 w-5 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-900">Procedures</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-900 mt-1">{procedures.length}</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <FileText className="h-5 w-5 text-orange-600 mr-2" />
                            <span className="text-sm font-medium text-orange-900">Required Visits</span>
                        </div>
                        <div className="text-2xl font-bold text-orange-900 mt-1">
                            {visits.filter(v => v.isRequired).length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <Alert
                    type="error"
                    title="Validation Errors"
                    message={
                        <ul className="list-disc list-inside space-y-1">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    }
                    onClose={() => setErrors([])}
                />
            )}

            {/* Timeline View */}
            <VisitTimeline
                visits={visits}
                selectedVisit={selectedVisit}
                onVisitSelect={setSelectedVisit}
                study={study}
            />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visits List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Study Visits</h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddVisit}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Visit
                                </Button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                            {visits.map((visit) => (
                                <VisitListItem
                                    key={visit.id}
                                    visit={visit}
                                    isSelected={selectedVisit?.id === visit.id}
                                    onClick={() => setSelectedVisit(visit)}
                                    onDelete={() => handleDeleteVisit(visit.id)}
                                />
                            ))}
                            {visits.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p>No visits defined</p>
                                    <button
                                        onClick={handleAddVisit}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                                    >
                                        Add your first visit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Visit Details */}
                <div className="lg:col-span-2">
                    {selectedVisit ? (
                        <VisitDetailsPanel
                            visit={selectedVisit}
                            procedures={procedures}
                            onUpdate={(updates) => handleUpdateVisit(selectedVisit.id, updates)}
                            onAddProcedure={(procedureId) => handleAddProcedure(selectedVisit.id, procedureId)}
                            onRemoveProcedure={(procedureId) => handleRemoveProcedure(selectedVisit.id, procedureId)}
                        />
                    ) : (
                        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Visit</h3>
                            <p>Choose a visit from the list to view and edit its details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Visit Timeline Component
const VisitTimeline = ({ visits, selectedVisit, onVisitSelect, study }) => {
    const maxDays = study?.duration * 7 || 728;

    // Calculate visit day from window
    const getVisitDay = (visit) => {
        const { days } = visit.window;
        return Math.round((days[0] + days[1]) / 2);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Visit Timeline</h3>

            {/* Timeline Scale */}
            <div className="relative h-20 border-2 border-gray-200 rounded-lg bg-gray-50 mb-4">
                {/* Timeline axis */}
                <div className="absolute bottom-2 left-4 right-4 h-1 bg-gray-300"></div>

                {/* Scale markers */}
                {[0, 25, 50, 75, 100].map(percent => (
                    <div key={percent} className="absolute bottom-0" style={{ left: `${percent}%` }}>
                        <div className="w-px h-4 bg-gray-400"></div>
                        <div className="text-xs text-gray-500 mt-1 transform -translate-x-1/2">
                            {Math.round((percent / 100) * maxDays)}d
                        </div>
                    </div>
                ))}

                {/* Visit markers */}
                {visits.map(visit => {
                    const position = (getVisitDay(visit) / maxDays) * 100;
                    const isSelected = selectedVisit?.id === visit.id;

                    return (
                        <div
                            key={visit.id}
                            className={`absolute bottom-2 transform -translate-x-1/2 cursor-pointer ${isSelected ? 'z-10' : 'z-0'
                                }`}
                            style={{ left: `${Math.max(2, Math.min(98, position))}%` }}
                            onClick={() => onVisitSelect(visit)}
                        >
                            <div className={`w-3 h-3 rounded-full border-2 ${isSelected
                                ? 'bg-blue-600 border-blue-800'
                                : getVisitTypeColor(visit.type)
                                }`}></div>
                            <div className={`text-xs mt-1 px-1 py-0.5 rounded whitespace-nowrap ${isSelected
                                ? 'bg-blue-100 text-blue-900 font-medium'
                                : 'bg-white text-gray-700 border'
                                }`}>
                                {visit.name}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span>Screening</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Baseline</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span>Treatment</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span>Follow-up</span>
                </div>
            </div>
        </div>
    );
};

// Visit List Item Component
const VisitListItem = ({ visit, isSelected, onClick, onDelete }) => {
    const getVisitDay = (visit) => {
        const { days } = visit.window;
        return Math.round((days[0] + days[1]) / 2);
    };

    return (
        <div
            className={`p-4 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">{visit.name}</h4>
                        {visit.isRequired && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                                Required
                            </span>
                        )}
                    </div>
                    <div className="flex items-center mt-1 space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getVisitTypeColorClasses(visit.type)}`}>
                            {visit.type.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                            Day {getVisitDay(visit)}
                        </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        {visit.procedures.length} procedures
                    </div>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="text-red-600 hover:text-red-800 p-1"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

// Visit Details Panel Component
const VisitDetailsPanel = ({ visit, procedures, onUpdate, onAddProcedure, onRemoveProcedure }) => {
    const visitTypes = [
        { value: 'SCREENING', label: 'Screening' },
        { value: 'BASELINE', label: 'Baseline' },
        { value: 'TREATMENT', label: 'Treatment' },
        { value: 'FOLLOW_UP', label: 'Follow-up' },
        { value: 'END_OF_TREATMENT', label: 'End of Treatment' },
        { value: 'SAFETY_FOLLOW_UP', label: 'Safety Follow-up' },
        { value: 'UNSCHEDULED', label: 'Unscheduled' }
    ];

    const procedureCategories = [...new Set(procedures.map(p => p.category))];

    // Defensive check: ensure visit.window exists with proper structure
    if (!visit || !visit.window || !Array.isArray(visit.window.days)) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <div className="text-lg font-medium text-gray-900 mb-2">Loading Visit Details...</div>
                <p>Please wait while visit data is being loaded.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow space-y-6">
            {/* Basic Info */}
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Visit Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Visit Name *
                        </label>
                        <input
                            type="text"
                            value={visit.name}
                            onChange={(e) => onUpdate({ name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter visit name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Visit Type *
                        </label>
                        <select
                            value={visit.type}
                            onChange={(e) => onUpdate({ type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {visitTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Visit Window (Start Day)
                        </label>
                        <input
                            type="number"
                            value={visit.window.days[0]}
                            onChange={(e) => onUpdate({
                                window: {
                                    ...visit.window,
                                    days: [parseInt(e.target.value) || 0, visit.window.days[1]]
                                }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Visit Window (End Day)
                        </label>
                        <input
                            type="number"
                            value={visit.window.days[1]}
                            onChange={(e) => onUpdate({
                                window: {
                                    ...visit.window,
                                    days: [visit.window.days[0], parseInt(e.target.value) || 0]
                                }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Window Description
                        </label>
                        <input
                            type="text"
                            value={visit.window.description}
                            onChange={(e) => onUpdate({
                                window: {
                                    ...visit.window,
                                    description: e.target.value
                                }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Week 4 ± 2 days"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={visit.isRequired}
                                onChange={(e) => onUpdate({ isRequired: e.target.checked })}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Required Visit</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Procedures */}
            <ProceduresSection
                visit={visit}
                procedures={procedures}
                procedureCategories={procedureCategories}
                onAddProcedure={onAddProcedure}
                onRemoveProcedure={onRemoveProcedure}
            />
        </div>
    );
};

// Procedures Section Component
const ProceduresSection = ({ visit, procedures, procedureCategories, onAddProcedure, onRemoveProcedure }) => {
    const [selectedCategory, setSelectedCategory] = useState('');

    const assignedProcedures = procedures.filter(p => visit.procedures.includes(p.id));
    const availableProcedures = procedures.filter(p => !visit.procedures.includes(p.id));
    const filteredProcedures = selectedCategory
        ? availableProcedures.filter(p => p.category === selectedCategory)
        : availableProcedures;

    const totalDuration = assignedProcedures.reduce((total, p) => total + p.duration, 0);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h4 className="text-md font-medium text-gray-900">Visit Procedures</h4>
                    <p className="text-sm text-gray-500">
                        {assignedProcedures.length} procedures • ~{totalDuration} minutes
                    </p>
                </div>
            </div>

            {/* Assigned Procedures */}
            <div className="mb-6">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Assigned Procedures</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {assignedProcedures.map(procedure => (
                        <div key={procedure.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div>
                                <div className="font-medium text-blue-900">{procedure.name}</div>
                                <div className="text-sm text-blue-700">{procedure.category} • {procedure.duration}min</div>
                            </div>
                            <button
                                onClick={() => onRemoveProcedure(procedure.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {assignedProcedures.length === 0 && (
                        <div className="md:col-span-2 text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                            No procedures assigned to this visit
                        </div>
                    )}
                </div>
            </div>

            {/* Available Procedures */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h5 className="text-sm font-medium text-gray-700">Available Procedures</h5>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1"
                    >
                        <option value="">All Categories</option>
                        {procedureCategories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {filteredProcedures.map(procedure => (
                        <div key={procedure.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <div>
                                <div className="font-medium text-gray-900">{procedure.name}</div>
                                <div className="text-sm text-gray-600">{procedure.category} • {procedure.duration}min</div>
                            </div>
                            <button
                                onClick={() => onAddProcedure(procedure.id)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {filteredProcedures.length === 0 && (
                        <div className="md:col-span-2 text-center py-4 text-gray-500">
                            No available procedures in this category
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper functions
const getVisitTypeColor = (type) => {
    const colors = {
        SCREENING: 'bg-red-500 border-red-700',
        BASELINE: 'bg-green-500 border-green-700',
        TREATMENT: 'bg-blue-500 border-blue-700',
        FOLLOW_UP: 'bg-purple-500 border-purple-700',
        END_OF_TREATMENT: 'bg-orange-500 border-orange-700',
        SAFETY_FOLLOW_UP: 'bg-yellow-500 border-yellow-700',
        UNSCHEDULED: 'bg-gray-500 border-gray-700'
    };
    return colors[type] || 'bg-gray-500 border-gray-700';
};

const getVisitTypeColorClasses = (type) => {
    const colors = {
        SCREENING: 'bg-red-100 text-red-800',
        BASELINE: 'bg-green-100 text-green-800',
        TREATMENT: 'bg-blue-100 text-blue-800',
        FOLLOW_UP: 'bg-purple-100 text-purple-800',
        END_OF_TREATMENT: 'bg-orange-100 text-orange-800',
        SAFETY_FOLLOW_UP: 'bg-yellow-100 text-yellow-800',
        UNSCHEDULED: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
};

export default VisitScheduleDesigner;
