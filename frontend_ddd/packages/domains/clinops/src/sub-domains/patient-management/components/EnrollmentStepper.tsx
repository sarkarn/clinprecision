// EnrollmentStepper.tsx - Multi-Step Enrollment Wizard
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DemographicsStep from './enrollment/DemographicsStep';
import StudySiteStep from './enrollment/StudySiteStep';
import ReviewStep from './enrollment/ReviewStep';
import {
    demographicsSchema,
    studySiteSchema,
    completeEnrollmentSchema,
} from '../validation/enrollmentSchema';

// Type definitions
interface Study {
    id: number;
    protocolNumber?: string;
    title?: string;
    name?: string;
    phase?: string;
}

interface StepConfig {
    id: number;
    name: string;
    schema: any;
}

interface EnrollmentStepperProps {
    onClose: () => void;
    onSubmit: (data: any) => void;
    studies: Study[];
}

const STEPS: StepConfig[] = [
    { id: 1, name: 'Demographics', schema: demographicsSchema },
    { id: 2, name: 'Study & Site', schema: studySiteSchema },
    { id: 3, name: 'Review', schema: completeEnrollmentSchema },
];

const EnrollmentStepper: React.FC<EnrollmentStepperProps> = ({ onClose, onSubmit, studies }) => {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [formData, setFormData] = useState<any>({});

    const methods = useForm({
        resolver: yupResolver(STEPS[currentStep - 1].schema),
        mode: 'onChange',
        defaultValues: formData,
    });

    const { handleSubmit, trigger } = methods;

    const handleNext = async () => {
        const isValid = await trigger();
        if (isValid) {
            const currentData = methods.getValues();
            setFormData({ ...formData, ...currentData });
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
        }
    };

    const handleBack = () => {
        const currentData = methods.getValues();
        setFormData({ ...formData, ...currentData });
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleFinalSubmit = handleSubmit((data) => {
        const completeData = { ...formData, ...data };
        onSubmit(completeData);
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Enroll New Subject</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex items-center">
                                    <div
                                        className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${currentStep > step.id
                                            ? 'bg-green-500 text-white'
                                            : currentStep === step.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                            }`}
                                    >
                                        {currentStep > step.id ? (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            step.id
                                        )}
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:inline">
                                        {step.name}
                                    </span>
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <FormProvider {...methods}>
                    <form onSubmit={handleFinalSubmit} className="px-6 py-6">
                        {currentStep === 1 && <DemographicsStep />}
                        {currentStep === 2 && <StudySiteStep studies={studies} />}
                        {currentStep === 3 && <ReviewStep formData={{ ...formData, ...methods.getValues() }} />}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Back
                            </button>

                            {currentStep < STEPS.length ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Submit Enrollment
                                </button>
                            )}
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
};

export default EnrollmentStepper;
