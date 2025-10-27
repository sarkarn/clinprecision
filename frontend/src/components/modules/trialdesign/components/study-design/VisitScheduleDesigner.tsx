import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Activity, FileText, LucideIcon } from 'lucide-react';
import { Alert, Button } from '../components/UIComponents';
import VisitDefinitionService, { VisitDefinition, VisitDefinitionCreateData } from 'services/VisitDefinitionService';
import StudyService from 'services/StudyService';
import StudyDesignService from 'services/StudyDesignService';
import type { Study } from '../../../../types';

// ============================================================================
// Types
// ============================================================================

/**
 * Visit type union
 */
type VisitType = 'SCREENING' | 'BASELINE' | 'TREATMENT' | 'FOLLOW_UP' | 'UNSCHEDULED';

/**
 * Timeline view type
 */
type TimelineView = 'days' | 'weeks' | 'months';

/**
 * Transformed visit interface (frontend representation)
 */
interface TransformedVisit {
    id: string | null;
    name: string;
    type: string;
    window: {
        days: [number, number];
        description: string;
    };
    isRequired: boolean;
    forms: any[];
    armId: string | null;
    studyId: number | null;
    sequenceNumber: number | null;
    timepoint: number;
    windowBefore: number;
    windowAfter: number;
    createdAt: string | null;
    updatedAt: string | null;
}

/**
 * Visit update data interface
 */
interface VisitUpdateData {
    name?: string;
    type?: string;
    window?: {
        days?: [number, number];
        description?: string;
    };
    isRequired?: boolean;
}

/**
 * Backend visit update interface
 */
interface BackendVisitUpdate {
    id: string | null;
    name: string;
    visitType: string;
    isRequired: boolean;
    sequenceNumber: number | null;
    description: string;
    timepoint: number;
    windowBefore: number;
    windowAfter: number;
    updatedBy: number;
    armId?: string;
}

/**
 * Visit type option interface
 */
interface VisitTypeOption {
    value: VisitType;
    label: string;
}

/**
 * Component props interfaces
 */
interface VisitScheduleDesignerProps {
    onPhaseCompleted?: () => Promise<void>;
}

interface VisitTimelineProps {
    visits: TransformedVisit[];
    selectedVisit: TransformedVisit | null;
    onVisitSelect: (visit: TransformedVisit) => void;
    study: Study | null;
}

interface VisitListItemProps {
    visit: TransformedVisit;
    isSelected: boolean;
    onClick: () => void;
    onDelete: () => void;
}

interface VisitDetailsPanelProps {
    visit: TransformedVisit;
    onUpdate: (updates: VisitUpdateData) => void;
}

interface RefreshVisitsOptions {
    targetVisitId?: string | number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_VISIT_TYPE: VisitType = 'TREATMENT';

// ============================================================================
// Helper Functions
// ============================================================================

const toNumber = (value: any, fallback: number = 0): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const transformVisitResponse = (visit: any): TransformedVisit | null => {
    if (!visit) {
        return null;
    }

    const visitId = visit.visitId || visit.id || visit.aggregateUuid || null;
    const sequenceNumber = visit.sequenceNumber ?? null;
    const timepoint = toNumber(visit.timepoint, 0);
    const windowBefore = toNumber(visit.windowBefore, 0);
    const windowAfter = toNumber(visit.windowAfter, 0);

    const windowStart = timepoint - windowBefore;
    const windowEnd = timepoint + windowAfter;

    const resolvedName = (visit.name && visit.name.trim().length > 0)
        ? visit.name
        : sequenceNumber != null
            ? `Visit ${sequenceNumber}`
            : 'Visit';

    // BUGFIX: Check visitType field more carefully and add logging
    const visitType = visit.visitType || visit.type || DEFAULT_VISIT_TYPE;
    console.log(`Transform visit ${visit.name}: backend visitType=${visit.visitType}, using=${visitType}`);

    return {
        id: visitId ? String(visitId) : null,
        name: resolvedName,
        type: visitType.toUpperCase(),
        window: {
            days: [windowStart, windowEnd],
            description: visit.description || ''
        },
        isRequired: visit.isRequired !== false,
        forms: visit.visitForms || [],
        armId: visit.armId || null,
        studyId: visit.studyId || null,
        sequenceNumber,
        timepoint,
        windowBefore,
        windowAfter,
        createdAt: visit.createdAt || null,
        updatedAt: visit.updatedAt || null
    };
};

const transformVisitCollection = (visits: any[] = []): TransformedVisit[] =>
    visits.map(transformVisitResponse).filter((v): v is TransformedVisit => v !== null);

// Helper functions
const getVisitTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
        SCREENING: 'bg-red-500 border-red-700',
        BASELINE: 'bg-green-500 border-green-700',
        TREATMENT: 'bg-blue-500 border-blue-700',
        FOLLOW_UP: 'bg-purple-500 border-purple-700',
        UNSCHEDULED: 'bg-gray-500 border-gray-700'
    };
    return colors[type] || 'bg-gray-500 border-gray-700';
};

const getVisitTypeColorClasses = (type: string): string => {
    const colors: Record<string, string> = {
        SCREENING: 'bg-red-100 text-red-800',
        BASELINE: 'bg-green-100 text-green-800',
        TREATMENT: 'bg-blue-100 text-blue-800',
        FOLLOW_UP: 'bg-purple-100 text-purple-800',
        UNSCHEDULED: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
};

// ============================================================================
// Main Component
// ============================================================================

/**
 * Visit Schedule Designer Component
 * Manages study visits and timeline (procedures managed separately)
 */
const VisitScheduleDesigner: React.FC<VisitScheduleDesignerProps> = ({ onPhaseCompleted }) => {
    const { studyId } = useParams<{ studyId: string }>();
    const navigate = useNavigate();

    // State management
    const [study, setStudy] = useState<Study | null>(null);
    const [visits, setVisits] = useState<TransformedVisit[]>([]);
    const [selectedVisit, setSelectedVisit] = useState<TransformedVisit | null>(null);
    const [timelineView, setTimelineView] = useState<TimelineView>('weeks');
    const [loading, setLoading] = useState<boolean>(true);
    const [errors, setErrors] = useState<string[]>([]);
    const [isDirty, setIsDirty] = useState<boolean>(false);

    const refreshVisits = async ({ targetVisitId }: RefreshVisitsOptions = {}): Promise<TransformedVisit[]> => {
        try {
            const visitsData = await VisitDefinitionService.getVisitsByStudy(studyId!);
            console.log('Raw visits data from backend:', visitsData); // Debug log

            const transformedVisits = transformVisitCollection(visitsData);
            setVisits(transformedVisits);

            if (!transformedVisits.length) {
                setSelectedVisit(null);
                return transformedVisits;
            }

            const preferredId = targetVisitId != null
                ? String(targetVisitId)
                : selectedVisit?.id != null
                    ? String(selectedVisit.id)
                    : null;

            const nextSelected = preferredId
                ? transformedVisits.find((visit) => String(visit.id) === preferredId) || transformedVisits[0]
                : transformedVisits[0];

            setSelectedVisit(nextSelected);
            return transformedVisits;
        } catch (error) {
            console.error('Error refreshing visits:', error);
            throw error;
        }
    };

    // Load study data
    useEffect(() => {
        loadStudyData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studyId]);

    const loadStudyData = async (): Promise<void> => {
        try {
            setLoading(true);

            // Load study data first 
            const studyData = await StudyService.getStudyById(studyId!);
            console.log('Study data loaded:', studyData); // Debug log

            setStudy(studyData);
            await refreshVisits();
            setErrors([]);
        } catch (error) {
            console.error('Error loading visit schedule:', error);
            setErrors(['Failed to load visit schedule data']);
        } finally {
            setLoading(false);
        }
    };

    // Add new visit
    const handleAddVisit = async (): Promise<void> => {
        try {
            if (!studyId) {
                throw new Error('Study ID not available');
            }

            // Find the highest sequence number among existing visits to avoid name collisions
            const maxSequence = visits.length > 0
                ? Math.max(...visits.map(v => v.sequenceNumber || 0))
                : 0;
            const nextSequence = maxSequence + 1;

            const newVisitData: VisitDefinitionCreateData = {
                visitName: `Visit ${nextSequence}`,
                visitType: 'TREATMENT',
                dayOffset: 7 * visits.length,
                windowBefore: 0,
                windowAfter: 3,
                description: '',
                isRequired: true
            };

            // Create visit without arm association initially
            // The user can associate it with specific arms later if needed
            const createdVisit = await VisitDefinitionService.createVisit(studyId, newVisitData);
            const newVisitId = createdVisit?.visitId || createdVisit?.id || null;

            // Small delay to allow event sourcing aggregate to process the VisitDefinedEvent
            // This prevents race conditions when immediately trying to delete/update the visit
            await new Promise(resolve => setTimeout(resolve, 500));

            await refreshVisits({ targetVisitId: newVisitId });
            setIsDirty(true);
            setErrors([]);
        } catch (error) {
            console.error('Error creating visit:', error);
            setErrors(['Failed to create visit']);
        }
    };

    // Update visit
    const handleUpdateVisit = async (visitId: string | null, updates: VisitUpdateData): Promise<void> => {
        try {
            if (!studyId) {
                throw new Error('Study ID not available');
            }

            if (!visitId) {
                throw new Error('Visit ID not available');
            }

            // Find the current visit to merge with updates
            const currentVisit = visits.find(v => v.id === visitId);
            if (!currentVisit) {
                throw new Error(`Visit with ID ${visitId} not found`);
            }

            // Transform frontend updates to backend format, merging with current visit data
            const backendUpdates: BackendVisitUpdate = {
                // Include all required fields from current visit
                id: currentVisit.id,
                name: updates.name !== undefined ? updates.name : currentVisit.name,
                visitType: updates.type !== undefined ? updates.type : currentVisit.type,
                isRequired: updates.isRequired !== undefined ? updates.isRequired : currentVisit.isRequired,
                sequenceNumber: currentVisit.sequenceNumber,
                description: currentVisit.window?.description || '',
                // Default timepoint from current visit
                timepoint: currentVisit.timepoint || 0,
                windowBefore: currentVisit.windowBefore || 0,
                windowAfter: currentVisit.windowAfter || 0,
                // Include updatedBy for audit trail (use user ID 1 as default for now)
                updatedBy: 1
            };

            // Apply window updates if provided
            if (updates.window) {
                if (updates.window.days) {
                    const [startDay, endDay] = updates.window.days;
                    const timepoint = Math.round((startDay + endDay) / 2);
                    const windowBefore = Math.max(0, timepoint - startDay);
                    const windowAfter = Math.max(0, endDay - timepoint);

                    backendUpdates.timepoint = timepoint;
                    backendUpdates.windowBefore = windowBefore;
                    backendUpdates.windowAfter = windowAfter;
                }
                if (updates.window.description !== undefined) {
                    backendUpdates.description = updates.window.description;
                }
            }

            // Include arm association if present
            if (currentVisit.armId) {
                backendUpdates.armId = currentVisit.armId;
            }

            console.log('Current visit before update:', currentVisit); // Debug log
            console.log('Updates requested:', updates); // Debug log
            console.log('Sending backend updates:', backendUpdates); // Debug log

            await VisitDefinitionService.updateVisit(studyId, visitId, backendUpdates);
            await refreshVisits({ targetVisitId: visitId });
            setIsDirty(true);
            setErrors([]);
        } catch (error) {
            console.error('Error updating visit:', error);
            setErrors(['Failed to update visit']);
        }
    };

    // Delete visit
    const handleDeleteVisit = async (visitId: string | null): Promise<void> => {
        if (window.confirm('Are you sure you want to delete this visit? This action cannot be undone.')) {
            try {
                if (!studyId) {
                    throw new Error('Study ID not available');
                }

                if (!visitId) {
                    throw new Error('Visit ID not available');
                }

                await VisitDefinitionService.deleteVisit(studyId, visitId);
                await refreshVisits();
                setIsDirty(true);
                setErrors([]);
            } catch (error: any) {
                console.error('Error deleting visit:', error);

                // Check if this is an "entity not found" error (race condition)
                const errorMsg = error?.response?.data?.message || error?.message || '';
                if (errorMsg.includes('does not exist') || errorMsg.includes('not found')) {
                    setErrors([
                        'The visit was just created and the system is still processing it. ' +
                        'Please wait a moment and try again.'
                    ]);
                } else {
                    setErrors(['Failed to delete visit. Please try again.']);
                }
            }
        }
    };

    // Note: Procedure management moved to separate VisitForm endpoints
    // Use VisitFormService to manage visit-form associations separately

    // Calculate visit day from window
    const getVisitDay = (visit: TransformedVisit): number => {
        const { days } = visit.window;
        return Math.round((days[0] + days[1]) / 2);
    };

    // Get visit position for timeline
    const getVisitPosition = (visit: TransformedVisit): number => {
        const day = getVisitDay(visit);
        const totalDays = ((study as any)?.duration || 104) * 7; // Default 104 weeks = ~2 years
        return (day / totalDays) * 100;
    };

    // Save changes
    const handleSave = async (): Promise<void> => {
        try {
            // Validate data
            const validationErrors = validateVisitsData();
            if (validationErrors.length > 0) {
                setErrors(validationErrors);
                return;
            }

            // Mock save - replace with actual API call
            console.log('Saving visit schedule:', { studyId, visits });

            // Update design progress to indicate visits phase is completed
            await StudyDesignService.updateDesignProgress(studyId!, {
                phase: 'visits',
                isComplete: true,
                percentageComplete: 100
            });

            setIsDirty(false);
            setErrors([]);

            // Notify parent component to refresh progress state
            if (onPhaseCompleted) {
                await onPhaseCompleted();
            }
        } catch (error) {
            console.error('Error saving visit schedule:', error);
            setErrors(['Failed to save visit schedule']);
        }
    };

    // Validate visits data
    const validateVisitsData = (): string[] => {
        const errors: string[] = [];

        if (visits.length === 0) {
            errors.push('At least one visit is required');
        }

        // Note: Baseline visit requirement removed - studies can be flexible in visit types

        visits.forEach((visit, index) => {
            if (!visit.name.trim()) {
                errors.push(`Visit ${index + 1}: Name is required`);
            }
            // Note: Procedure validation moved to separate form assignment step
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
                            Configure study visits and timeline for {study?.name}
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
                        <div className="text-2xl font-bold text-green-900 mt-1">{(study as any)?.duration || 0}w</div>
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
                    message={errors.join('; ')}
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
                            onUpdate={(updates) => handleUpdateVisit(selectedVisit.id, updates)}
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

// ============================================================================
// Sub-Components
// ============================================================================

// Visit Timeline Component
const VisitTimeline: React.FC<VisitTimelineProps> = ({ visits, selectedVisit, onVisitSelect, study }) => {
    const maxDays = ((study as any)?.duration || 104) * 7; // Default 104 weeks = ~2 years

    // Calculate visit day from window
    const getVisitDay = (visit: TransformedVisit): number => {
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
const VisitListItem: React.FC<VisitListItemProps> = ({ visit, isSelected, onClick, onDelete }) => {
    const getVisitDay = (visit: TransformedVisit): number => {
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
const VisitDetailsPanel: React.FC<VisitDetailsPanelProps> = ({ visit, onUpdate }) => {
    // Visit types must match backend VisitType enum exactly
    const visitTypes: VisitTypeOption[] = [
        { value: 'SCREENING', label: 'Screening' },
        { value: 'BASELINE', label: 'Baseline' },
        { value: 'TREATMENT', label: 'Treatment' },
        { value: 'FOLLOW_UP', label: 'Follow-up' },
        { value: 'UNSCHEDULED', label: 'Unscheduled' }
    ];

    // Debug: Log the visit data being rendered
    console.log('VisitDetailsPanel rendering with visit:', visit);

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
                            onChange={(e) => {
                                console.log('Dropdown changed from', visit.type, 'to', e.target.value);
                                onUpdate({ type: e.target.value });
                            }}
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

            {/* Note: Form/Procedure management moved to separate VisitForm workflow */}
            <div className="p-6 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Forms & Procedures</h4>
                            <p className="text-sm text-blue-700">
                                Visit forms and procedures are managed in a separate step of the study design workflow.
                                Complete the visit schedule design first, then proceed to form assignment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitScheduleDesigner;
