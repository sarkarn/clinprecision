// ReviewStep.tsx - Final Review and Confirmation Step
import React from 'react';

// Type definitions
interface ReviewStepProps {
    formData: {
        subjectId?: string;
        dateOfBirth?: string;
        gender?: string;
        phoneNumber?: string;
        studyId?: number;
        siteId?: number;
    };
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const reviewSections = [
        {
            title: 'Demographics',
            fields: [
                { label: 'Subject ID', value: formData.subjectId },
                { label: 'Date of Birth', value: formatDate(formData.dateOfBirth) },
                { label: 'Gender', value: formData.gender },
                { label: 'Phone Number', value: formData.phoneNumber },
            ],
        },
        {
            title: 'Study & Site',
            fields: [
                { label: 'Study ID', value: formData.studyId },
                { label: 'Site ID', value: formData.siteId },
            ],
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Review & Confirm</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Please review all information before submitting the enrollment.
                </p>
            </div>

            {/* Review Sections */}
            {reviewSections.map((section, sectionIndex) => (
                <div
                    key={sectionIndex}
                    className="bg-gray-50 rounded-lg border border-gray-200 p-5"
                >
                    <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold mr-2">
                            {sectionIndex + 1}
                        </span>
                        {section.title}
                    </h4>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {section.fields.map((field, fieldIndex) => (
                            <div key={fieldIndex}>
                                <dt className="text-sm font-medium text-gray-600 mb-1">{field.label}</dt>
                                <dd className="text-sm text-gray-900 font-semibold">
                                    {field.value || 'N/A'}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            ))}

            {/* Warning Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <div className="flex">
                    <svg
                        className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <div>
                        <h5 className="text-sm font-medium text-amber-900 mb-1">
                            Confirm Before Submission
                        </h5>
                        <p className="text-sm text-amber-800">
                            Once you submit this enrollment, you will not be able to edit these details.
                            Please ensure all information is correct.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewStep;
