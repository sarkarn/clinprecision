import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';

const DemographicsStep = () => {
    const {
        register,
        formState: { errors },
        control,
    } = useFormContext();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Demographics</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Enter the basic demographic information for the subject.
                </p>
            </div>

            {/* Subject ID */}
            <div>
                <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject ID <span className="text-red-500">*</span>
                </label>
                <input
                    id="subjectId"
                    type="text"
                    {...register('subjectId')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.subjectId
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    placeholder="e.g., SUBJ-001"
                />
                {errors.subjectId && (
                    <p className="mt-1 text-sm text-red-600">{errors.subjectId.message}</p>
                )}
            </div>

            {/* Date of Birth */}
            <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                    id="dateOfBirth"
                    type="date"
                    {...register('dateOfBirth')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.dateOfBirth
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                />
                {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Subject must be at least 18 years old</p>
            </div>

            {/* Gender */}
            <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                </label>
                <select
                    id="gender"
                    {...register('gender')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.gender
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                )}
            </div>

            {/* Phone Number with Mask */}
            <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="phoneNumber"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                        <IMaskInput
                            {...field}
                            mask="(000) 000-0000"
                            placeholder="(123) 456-7890"
                            onAccept={(value) => field.onChange(value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.phoneNumber
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                                }`}
                        />
                    )}
                />
                {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
            </div>
        </div>
    );
};

export default DemographicsStep;
