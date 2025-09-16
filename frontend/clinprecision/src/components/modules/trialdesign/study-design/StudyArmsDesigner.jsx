import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, Target, Shuffle } from 'lucide-react';
import { Alert, Button } from '../components/UIComponents';
import StudyDesignService from '../../../../services/StudyDesignService';
import StudyService from '../../../../services/StudyService';

/**
 * Study Arms Designer Component
 * Manages treatment arms, interventions, and randomization strategy
 */
const StudyArmsDesigner = () => {
    const { studyId } = useParams();
    const navigate = useNavigate();

    // State management
    const [study, setStudy] = useState(null);
    const [studyArms, setStudyArms] = useState([]);
    const [selectedArm, setSelectedArm] = useState(null);
    const [randomizationStrategy, setRandomizationStrategy] = useState({
        type: 'SIMPLE',
        blockSize: 4,
        stratificationFactors: [],
        allocationRatios: {} // Object to store arm ID -> ratio mapping
    });
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
            const [studyData, studyArmsData] = await Promise.all([
                StudyService.getStudyById(studyId),
                StudyDesignService.getStudyArms(studyId)
            ]);

            setStudy(studyData);

            // Ensure each arm has an interventions array
            const armsWithInterventions = (studyArmsData || []).map(arm => ({
                ...arm,
                interventions: arm.interventions || []
            }));
            setStudyArms(armsWithInterventions);

            // Initialize allocation ratios - default to 1:1 for all arms
            if (armsWithInterventions && armsWithInterventions.length > 0) {
                const initialRatios = {};
                armsWithInterventions.forEach(arm => {
                    initialRatios[arm.id] = 1;
                });
                setRandomizationStrategy(prev => ({
                    ...prev,
                    allocationRatios: initialRatios
                }));
                setSelectedArm(armsWithInterventions[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading study:', error);
            setErrors(['Failed to load study data']);
            setLoading(false);
        }
    };

    // Add new study arm
    const handleAddArm = async () => {
        try {
            const newArm = {
                name: `Arm ${studyArms.length + 1}`,
                description: '',
                type: 'TREATMENT',
                sequence: studyArms.length + 1,
                plannedSubjects: 0,
                interventions: []
            };

            const createdArm = await StudyDesignService.createStudyArm(studyId, newArm);
            const updatedArms = [...studyArms, createdArm];
            setStudyArms(updatedArms);

            // Initialize allocation ratio for new arm
            setRandomizationStrategy(prev => ({
                ...prev,
                allocationRatios: {
                    ...prev.allocationRatios,
                    [createdArm.id]: 1
                }
            }));

            setSelectedArm(createdArm);
            setIsDirty(true);
        } catch (error) {
            console.error('Error creating study arm:', error);
            setErrors(['Failed to create study arm']);
        }
    };

    // Update study arm
    const handleUpdateArm = async (armId, updates) => {
        try {
            const updatedArm = await StudyDesignService.updateStudyArm(armId, updates);
            const updatedArms = studyArms.map(arm =>
                arm.id === armId ? updatedArm : arm
            );
            setStudyArms(updatedArms);
            if (selectedArm && selectedArm.id === armId) {
                setSelectedArm(updatedArm);
            }
            setIsDirty(true);
        } catch (error) {
            console.error('Error updating study arm:', error);
            setErrors(['Failed to update study arm']);
        }
    };

    // Delete study arm
    const handleDeleteArm = async (armId) => {
        if (window.confirm('Are you sure you want to delete this arm? This action cannot be undone.')) {
            try {
                await StudyDesignService.deleteStudyArm(armId);
                const updatedArms = studyArms.filter(arm => arm.id !== armId);
                setStudyArms(updatedArms);

                // Remove allocation ratio for deleted arm
                setRandomizationStrategy(prev => {
                    const { [armId]: removed, ...remainingRatios } = prev.allocationRatios;
                    return { ...prev, allocationRatios: remainingRatios };
                });

                if (selectedArm && selectedArm.id === armId) {
                    setSelectedArm(updatedArms.length > 0 ? updatedArms[0] : null);
                }
                setIsDirty(true);
            } catch (error) {
                console.error('Error deleting study arm:', error);
                setErrors(['Failed to delete study arm']);
            }
        }
    };

    // Update allocation ratio for a specific arm
    const handleAllocationRatioChange = (armId, ratio) => {
        setRandomizationStrategy(prev => ({
            ...prev,
            allocationRatios: {
                ...prev.allocationRatios,
                [armId]: parseInt(ratio) || 1
            }
        }));
        setIsDirty(true);
    };

    // Add intervention to arm
    const handleAddIntervention = (armId) => {
        const arm = studyArms.find(a => a.id === armId);
        if (!arm) return;

        const newIntervention = {
            id: `INT-${Date.now()}`,
            type: 'DRUG',
            name: '',
            dosage: '',
            frequency: '',
            route: ''
        };

        handleUpdateArm(armId, {
            interventions: [...(arm.interventions || []), newIntervention]
        });
    };

    // Update intervention
    const handleUpdateIntervention = (armId, interventionId, updates) => {
        const arm = studyArms.find(a => a.id === armId);
        if (arm) {
            const updatedInterventions = arm.interventions.map(int =>
                int.id === interventionId ? { ...int, ...updates } : int
            );
            handleUpdateArm(armId, { interventions: updatedInterventions });
        }
    };

    // Delete intervention
    const handleDeleteIntervention = (armId, interventionId) => {
        const arm = studyArms.find(a => a.id === armId);
        if (arm) {
            const updatedInterventions = arm.interventions.filter(int => int.id !== interventionId);
            handleUpdateArm(armId, { interventions: updatedInterventions });
        }
    };

    // Save changes
    const handleSave = async () => {
        try {
            // Validate data
            const validationErrors = validateArmsData();
            if (validationErrors.length > 0) {
                setErrors(validationErrors);
                return;
            }

            // Mock save - replace with actual API call
            console.log('Saving study arms:', { studyId, arms: studyArms, randomization: randomizationStrategy });
            setIsDirty(false);
            setErrors([]);
        } catch (error) {
            console.error('Error saving study arms:', error);
            setErrors(['Failed to save study arms']);
        }
    };

    // Validate arms data
    const validateArmsData = () => {
        const errors = [];

        if (studyArms.length === 0) {
            errors.push('At least one study arm is required');
        }

        studyArms.forEach((arm, index) => {
            if (!arm.name.trim()) {
                errors.push(`Arm ${index + 1}: Name is required`);
            }
            if (!arm.plannedSubjects || arm.plannedSubjects <= 0) {
                errors.push(`Arm ${index + 1}: Planned subjects must be greater than 0`);
            }
            if (arm.interventions.length === 0) {
                errors.push(`Arm ${index + 1}: At least one intervention is required`);
            }
        });

        return errors;
    };

    // Calculate total subjects
    const totalPlannedSubjects = studyArms.reduce((total, arm) => total + (arm.plannedSubjects || 0), 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading study data...</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Study Arms Design</h1>
                        <p className="text-gray-600 mt-1">
                            Configure treatment arms and randomization strategy for {study?.name}
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
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Target className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-900">Total Arms</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-900 mt-1">{studyArms.length}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Users className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-900">Planned Subjects</span>
                        </div>
                        <div className="text-2xl font-bold text-green-900 mt-1">{totalPlannedSubjects}</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Shuffle className="h-5 w-5 text-purple-600 mr-2" />
                            <span className="text-sm font-medium text-purple-900">Randomization</span>
                        </div>
                        <div className="text-sm font-bold text-purple-900 mt-1 capitalize">
                            {randomizationStrategy.type.replace('_', ' ')}
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

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Arms List */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">Study Arms</h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddArm}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Arm
                                </Button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {studyArms.map((arm) => (
                                <div
                                    key={arm.id}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedArm?.id === arm.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                                        }`}
                                    onClick={() => setSelectedArm(arm)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{arm.name}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{arm.description}</p>
                                            <div className="flex items-center mt-2 space-x-4">
                                                <span className={`px-2 py-1 text-xs rounded-full ${arm.type === 'TREATMENT' ? 'bg-green-100 text-green-800' :
                                                    arm.type === 'PLACEBO' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {arm.type}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {arm.plannedSubjects} subjects
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteArm(arm.id);
                                            }}
                                            className="text-red-600 hover:text-red-800 p-1"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {studyArms.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                                    <p>No study arms defined</p>
                                    <button
                                        onClick={handleAddArm}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                                    >
                                        Add your first study arm
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Arm Details */}
                <div className="lg:col-span-2">
                    {selectedArm ? (
                        <ArmDetailsPanel
                            arm={selectedArm}
                            onUpdate={(updates) => handleUpdateArm(selectedArm.id, updates)}
                            onAddIntervention={() => handleAddIntervention(selectedArm.id)}
                            onUpdateIntervention={(interventionId, updates) =>
                                handleUpdateIntervention(selectedArm.id, interventionId, updates)
                            }
                            onDeleteIntervention={(interventionId) =>
                                handleDeleteIntervention(selectedArm.id, interventionId)
                            }
                        />
                    ) : (
                        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Study Arm</h3>
                            <p>Choose an arm from the list to view and edit its details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Randomization Strategy */}
            <RandomizationPanel
                strategy={randomizationStrategy}
                onChange={setRandomizationStrategy}
                studyArms={studyArms}
                onAllocationRatioChange={handleAllocationRatioChange}
            />
        </div>
    );
};

// Arm Details Panel Component
const ArmDetailsPanel = ({
    arm,
    onUpdate,
    onAddIntervention,
    onUpdateIntervention,
    onDeleteIntervention
}) => {
    const armTypes = [
        { value: 'TREATMENT', label: 'Treatment' },
        { value: 'PLACEBO', label: 'Placebo' },
        { value: 'CONTROL', label: 'Control' },
        { value: 'ACTIVE_COMPARATOR', label: 'Active Comparator' }
    ];

    const interventionTypes = [
        { value: 'DRUG', label: 'Drug' },
        { value: 'DEVICE', label: 'Device' },
        { value: 'PROCEDURE', label: 'Procedure' },
        { value: 'BEHAVIORAL', label: 'Behavioral' },
        { value: 'OTHER', label: 'Other' }
    ];

    return (
        <div className="bg-white rounded-lg shadow space-y-6">
            {/* Basic Info */}
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Arm Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Arm Name *
                        </label>
                        <input
                            type="text"
                            value={arm.name}
                            onChange={(e) => onUpdate({ name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter arm name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Arm Type *
                        </label>
                        <select
                            value={arm.type}
                            onChange={(e) => onUpdate({ type: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {armTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Planned Subjects *
                        </label>
                        <input
                            type="number"
                            value={arm.plannedSubjects}
                            onChange={(e) => onUpdate({ plannedSubjects: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sequence Order
                        </label>
                        <input
                            type="number"
                            value={arm.sequence}
                            onChange={(e) => onUpdate({ sequence: parseInt(e.target.value) || 1 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="1"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={arm.description}
                            onChange={(e) => onUpdate({ description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            placeholder="Describe this study arm"
                        />
                    </div>
                </div>
            </div>

            {/* Interventions */}
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Interventions</h4>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onAddIntervention}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Intervention
                    </Button>
                </div>

                <div className="space-y-4">
                    {arm.interventions?.map((intervention) => (
                        <div key={intervention.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                                <h5 className="font-medium text-gray-900">Intervention {intervention.id}</h5>
                                <button
                                    onClick={() => onDeleteIntervention(intervention.id)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type *
                                    </label>
                                    <select
                                        value={intervention.type}
                                        onChange={(e) => onUpdateIntervention(intervention.id, { type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {interventionTypes.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={intervention.name}
                                        onChange={(e) => onUpdateIntervention(intervention.id, { name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Intervention name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dosage
                                    </label>
                                    <input
                                        type="text"
                                        value={intervention.dosage}
                                        onChange={(e) => onUpdateIntervention(intervention.id, { dosage: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., 10mg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Frequency
                                    </label>
                                    <input
                                        type="text"
                                        value={intervention.frequency}
                                        onChange={(e) => onUpdateIntervention(intervention.id, { frequency: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., Daily, BID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Route
                                    </label>
                                    <input
                                        type="text"
                                        value={intervention.route}
                                        onChange={(e) => onUpdateIntervention(intervention.id, { route: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g., Oral, IV"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {(!arm.interventions || arm.interventions.length === 0) && (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                            <Plus className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p>No interventions defined</p>
                            <button
                                onClick={onAddIntervention}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                            >
                                Add first intervention
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Randomization Panel Component
const RandomizationPanel = ({ strategy, onChange, studyArms, onAllocationRatioChange }) => {
    const randomizationTypes = [
        { value: 'SIMPLE', label: 'Simple Randomization', description: 'Basic random assignment' },
        { value: 'BLOCK', label: 'Block Randomization', description: 'Randomization in blocks' },
        { value: 'STRATIFIED', label: 'Stratified Randomization', description: 'Randomization by strata' },
        { value: 'ADAPTIVE', label: 'Adaptive Randomization', description: 'Dynamic randomization' }
    ];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Randomization Strategy</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Randomization Type
                    </label>
                    <div className="space-y-2">
                        {randomizationTypes.map(type => (
                            <label key={type.value} className="flex items-start">
                                <input
                                    type="radio"
                                    name="randomizationType"
                                    value={type.value}
                                    checked={strategy.type === type.value}
                                    onChange={(e) => onChange({ ...strategy, type: e.target.value })}
                                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{type.label}</div>
                                    <div className="text-sm text-gray-500">{type.description}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="space-y-4">
                        {strategy.type === 'BLOCK' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Block Size
                                </label>
                                <input
                                    type="number"
                                    value={strategy.blockSize}
                                    onChange={(e) => onChange({ ...strategy, blockSize: parseInt(e.target.value) || 4 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    min="2"
                                />
                            </div>
                        )}

                        {/* Randomization Ratio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Allocation Ratio
                            </label>
                            <div className="flex items-center space-x-2">
                                {studyArms.map((arm, index) => (
                                    <React.Fragment key={arm.id}>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500 mb-1">{arm.name}</div>
                                            <input
                                                type="number"
                                                value={strategy.allocationRatios?.[arm.id] || 1}
                                                onChange={(e) => {
                                                    if (onAllocationRatioChange) {
                                                        onAllocationRatioChange(arm.id, e.target.value);
                                                    }
                                                }}
                                                readOnly={!onAllocationRatioChange}
                                                className={`w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!onAllocationRatioChange ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                                min="1"
                                            />
                                        </div>
                                        {index < studyArms.length - 1 && (
                                            <span className="text-gray-500">:</span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyArmsDesigner;
