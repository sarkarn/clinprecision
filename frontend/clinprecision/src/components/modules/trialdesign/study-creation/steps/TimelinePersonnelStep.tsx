import React from 'react';
import FormField from '../../components/FormField';

interface TimelinePersonnelStepProps {
    formData: {
        plannedStartDate?: string;
        plannedEndDate?: string;
        estimatedDuration?: string;
        principalInvestigator?: string;
        studyCoordinator?: string;
        medicalMonitor?: string;
        primaryObjective?: string;
        secondaryObjectives?: string[];
    };
    onFieldChange: (name: string, value: any) => void;
    getFieldError: (fieldName: string) => string | undefined;
    hasFieldError: (fieldName: string) => boolean;
}

/**
 * Step 2: Timeline and Personnel Information
 */
const TimelinePersonnelStep: React.FC<TimelinePersonnelStepProps> = ({
    formData,
    onFieldChange,
    getFieldError,
    hasFieldError
}) => {
    // Calculate estimated duration when dates change
    const calculateDuration = (startDate: string, endDate: string): string => {
        if (!startDate || !endDate) return '';

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths = Math.round(diffDays / 30);
        const diffYears = Math.round(diffDays / 365);

        if (diffYears >= 1) {
            return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
        } else if (diffMonths >= 1) {
            return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
        } else {
            return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
        }
    };

    const handleDateChange = (fieldName: string, value: string): void => {
        onFieldChange(fieldName, value);

        // Auto-calculate duration if both dates are present
        if (fieldName === 'plannedStartDate' && formData.plannedEndDate) {
            const duration = calculateDuration(value, formData.plannedEndDate);
            onFieldChange('estimatedDuration', duration);
        } else if (fieldName === 'plannedEndDate' && formData.plannedStartDate) {
            const duration = calculateDuration(formData.plannedStartDate, value);
            onFieldChange('estimatedDuration', duration);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline & Personnel</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Define the study timeline and key personnel responsible for the study.
                </p>
            </div>

            {/* Timeline Section */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-800 mb-4">Study Timeline</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        label="Planned Start Date"
                        name="plannedStartDate"
                        type="date"
                        value={formData.plannedStartDate}
                        onChange={handleDateChange}
                        error={getFieldError('plannedStartDate')}
                        touched={hasFieldError('plannedStartDate')}
                        helpText="First patient first visit (FPFV)"
                    />

                    <FormField
                        label="Planned End Date"
                        name="plannedEndDate"
                        type="date"
                        value={formData.plannedEndDate}
                        onChange={handleDateChange}
                        error={getFieldError('plannedEndDate')}
                        touched={hasFieldError('plannedEndDate')}
                        helpText="Last patient last visit (LPLV)"
                    />

                    <FormField
                        label="Estimated Duration"
                        name="estimatedDuration"
                        value={formData.estimatedDuration}
                        onChange={onFieldChange}
                        error={getFieldError('estimatedDuration')}
                        touched={hasFieldError('estimatedDuration')}
                        placeholder="e.g., 2 years"
                        helpText="Auto-calculated from dates"
                        disabled={!!(formData.plannedStartDate && formData.plannedEndDate)}
                    />
                </div>
            </div>

            {/* Personnel Section */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-800 mb-4">Key Personnel</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        label="Principal Investigator"
                        name="principalInvestigator"
                        value={formData.principalInvestigator}
                        onChange={onFieldChange}
                        error={getFieldError('principalInvestigator')}
                        touched={hasFieldError('principalInvestigator')}
                        required
                        placeholder="Dr. Jane Smith"
                        helpText="Lead investigator responsible for the study"
                    />

                    <FormField
                        label="Study Coordinator"
                        name="studyCoordinator"
                        value={formData.studyCoordinator}
                        onChange={onFieldChange}
                        error={getFieldError('studyCoordinator')}
                        touched={hasFieldError('studyCoordinator')}
                        placeholder="John Coordinator"
                        helpText="Primary contact for study operations"
                    />

                    <FormField
                        label="Medical Monitor"
                        name="medicalMonitor"
                        value={formData.medicalMonitor}
                        onChange={onFieldChange}
                        error={getFieldError('medicalMonitor')}
                        touched={hasFieldError('medicalMonitor')}
                        placeholder="Dr. Medical Monitor"
                        helpText="Physician overseeing safety aspects"
                    />
                </div>
            </div>

            {/* Study Objectives Section */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-800 mb-4">Study Objectives</h4>

                <div className="space-y-4">
                    <FormField
                        label="Primary Objective"
                        name="primaryObjective"
                        type="textarea"
                        value={formData.primaryObjective}
                        onChange={onFieldChange}
                        error={getFieldError('primaryObjective')}
                        touched={hasFieldError('primaryObjective')}
                        placeholder="Describe the primary endpoint and main goal of the study"
                        rows={3}
                        helpText="The main research question the study aims to answer"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secondary Objectives
                        </label>
                        <div className="space-y-2">
                            {formData.secondaryObjectives?.map((objective, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={objective}
                                        onChange={(e) => {
                                            const newObjectives = [...(formData.secondaryObjectives || [])];
                                            newObjectives[index] = e.target.value;
                                            onFieldChange('secondaryObjectives', newObjectives);
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder={`Secondary objective ${index + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newObjectives = formData.secondaryObjectives?.filter((_, i) => i !== index) || [];
                                            onFieldChange('secondaryObjectives', newObjectives);
                                        }}
                                        className="text-red-600 hover:text-red-800 p-1"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    const currentObjectives = formData.secondaryObjectives || [];
                                    onFieldChange('secondaryObjectives', [...currentObjectives, '']);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                + Add Secondary Objective
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            Additional research questions or endpoints
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelinePersonnelStep;
