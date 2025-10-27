import React from 'react';
import { FieldWrapper } from './FieldWrapper';

type FieldValue = 
    | string 
    | number 
    | boolean 
    | Date 
    | string[] 
    | number[] 
    | FileValue 
    | VitalSignValue 
    | LabValue 
    | MedicationValue 
    | AdverseEventValue 
    | null 
    | undefined;

interface FileValue {
    filename: string;
    url: string;
    size?: number;
}

interface VitalSignValue {
    value: number;
    unit: string;
    timestamp?: Date;
}

interface LabValue {
    value: number;
    unit: string;
    referenceRange?: { min: number; max: number };
    abnormal?: boolean;
}

interface MedicationValue {
    name: string;
    dose?: string;
    frequency?: string;
    route?: string;
}

interface AdverseEventValue {
    term: string;
    grade?: string;
    serious?: boolean;
}

interface FieldMetadata {
    required?: boolean;
    helpText?: string;
    description?: string;
    clinicalSignificance?: boolean;
    referenceRange?: {
        min: number;
        max: number;
        unit?: string;
    };
    units?: string;
}

interface Field {
    id: string;
    name?: string;
    label?: string;
    type: string;
    required?: boolean;
    metadata?: FieldMetadata;
    options?: Array<{ value: string | number; label: string }>;
}

interface CustomStyles {
    wrapper?: React.CSSProperties;
    label?: React.CSSProperties;
    value?: React.CSSProperties;
    helpText?: React.CSSProperties;
}

interface ReadOnlyDisplayProps {
    field: Field;
    value: FieldValue;
    context?: 'general' | 'study' | 'template' | 'patient';
    customStyles?: CustomStyles;
    showLabel?: boolean;
    showHelpText?: boolean;
    className?: string;
}

/**
 * ReadOnlyDisplay - Display field values in read-only mode
 * Formats values based on field type and provides clinical displays
 */
export const ReadOnlyDisplay: React.FC<ReadOnlyDisplayProps> = ({
    field,
    value,
    context = 'general',
    customStyles = {},
    showLabel = true,
    showHelpText = true,
    className = ''
}) => {
    /**
     * Format value based on field type
     */
    const formatValue = (): React.ReactNode => {
        // Handle null/undefined values
        if (value === null || value === undefined || value === '') {
            return <span className="text-gray-400 italic">Not specified</span>;
        }

        switch (field.type) {
            case 'text':
            case 'textarea':
                return <span>{String(value)}</span>;

            case 'number': {
                const numValue = Number(value);
                const units = field.metadata?.units;
                const formatted = units ? `${numValue} ${units}` : numValue.toString();

                // Check for abnormal values based on reference range
                const refRange = field.metadata?.referenceRange;
                const isAbnormal = refRange && (numValue < refRange.min || numValue > refRange.max);

                return (
                    <span className={isAbnormal ? 'text-red-600 font-semibold' : ''}>
                        {formatted}
                        {isAbnormal && ' (Abnormal)'}
                    </span>
                );
            }

            case 'date':
                if (value instanceof Date) {
                    return <span>{value.toLocaleDateString()}</span>;
                }
                return <span>{new Date(String(value)).toLocaleDateString()}</span>;

            case 'time':
                if (value instanceof Date) {
                    return <span>{value.toLocaleTimeString()}</span>;
                }
                return <span>{new Date(String(value)).toLocaleTimeString()}</span>;

            case 'datetime':
            case 'datetime-local':
                if (value instanceof Date) {
                    return <span>{value.toLocaleString()}</span>;
                }
                return <span>{new Date(String(value)).toLocaleString()}</span>;

            case 'select':
            case 'radio': {
                // Find the option label
                const option = field.options?.find(opt => opt.value === value);
                return <span>{option?.label || String(value)}</span>;
            }

            case 'multiselect':
            case 'checkbox-group':
                if (Array.isArray(value)) {
                    return (
                        <div className="flex flex-wrap gap-1">
                            {value.map((v, index) => {
                                const option = field.options?.find(opt => opt.value === v);
                                const label = option?.label || String(v);
                                return (
                                    <span
                                        key={index}
                                        className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                    >
                                        {label}
                                    </span>
                                );
                            })}
                        </div>
                    );
                }
                return <span>{String(value)}</span>;

            case 'checkbox':
                return (
                    <span className={value ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                        {value ? 'Yes' : 'No'}
                    </span>
                );

            case 'file':
            case 'upload':
                if (typeof value === 'object' && value !== null && 'filename' in value) {
                    const fileValue = value as FileValue;
                    return (
                        <a
                            href={fileValue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            {fileValue.filename}
                            {fileValue.size && ` (${formatFileSize(fileValue.size)})`}
                        </a>
                    );
                }
                return <span>{String(value)}</span>;

            case 'range':
            case 'slider': {
                const numValue = Number(value);
                return (
                    <div className="flex items-center space-x-3">
                        <span className="font-semibold">{numValue}</span>
                        <div className="flex-1 max-w-xs h-2 bg-gray-200 rounded">
                            <div
                                className="h-full bg-blue-500 rounded"
                                style={{ width: `${numValue}%` }}
                            />
                        </div>
                    </div>
                );
            }

            case 'vital-sign':
                if (typeof value === 'object' && value !== null && 'value' in value) {
                    const vitalValue = value as VitalSignValue;
                    return (
                        <div className="space-y-1">
                            <span className="font-semibold">
                                {vitalValue.value} {vitalValue.unit}
                            </span>
                            {vitalValue.timestamp && (
                                <span className="text-xs text-gray-500 ml-2">
                                    ({new Date(vitalValue.timestamp).toLocaleString()})
                                </span>
                            )}
                        </div>
                    );
                }
                return <span>{String(value)}</span>;

            case 'lab-value':
                if (typeof value === 'object' && value !== null && 'value' in value) {
                    const labValue = value as LabValue;
                    const isAbnormal = labValue.abnormal || 
                        (labValue.referenceRange && 
                         (labValue.value < labValue.referenceRange.min || 
                          labValue.value > labValue.referenceRange.max));

                    return (
                        <div className="space-y-1">
                            <span className={isAbnormal ? 'text-red-600 font-semibold' : 'font-semibold'}>
                                {labValue.value} {labValue.unit}
                                {isAbnormal && ' (Abnormal)'}
                            </span>
                            {labValue.referenceRange && (
                                <div className="text-xs text-gray-500">
                                    Reference: {labValue.referenceRange.min} - {labValue.referenceRange.max} {labValue.unit}
                                </div>
                            )}
                        </div>
                    );
                }
                return <span>{String(value)}</span>;

            case 'medication':
            case 'conmed':
                if (typeof value === 'object' && value !== null && 'name' in value) {
                    const medValue = value as MedicationValue;
                    return (
                        <div className="space-y-1">
                            <div className="font-semibold">{medValue.name}</div>
                            {medValue.dose && <div className="text-sm">Dose: {medValue.dose}</div>}
                            {medValue.frequency && <div className="text-sm">Frequency: {medValue.frequency}</div>}
                            {medValue.route && <div className="text-sm">Route: {medValue.route}</div>}
                        </div>
                    );
                }
                return <span>{String(value)}</span>;

            case 'adverse-event':
                if (typeof value === 'object' && value !== null && 'term' in value) {
                    const aeValue = value as AdverseEventValue;
                    return (
                        <div className="space-y-1">
                            <div className={aeValue.serious ? 'text-red-600 font-semibold' : 'font-semibold'}>
                                {aeValue.term}
                                {aeValue.serious && ' (Serious)'}
                            </div>
                            {aeValue.grade && <div className="text-sm">Grade: {aeValue.grade}</div>}
                        </div>
                    );
                }
                return <span>{String(value)}</span>;

            default:
                return <span>{String(value)}</span>;
        }
    };

    /**
     * Format file size for display
     */
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <FieldWrapper
            field={field}
            context={context}
            customStyles={customStyles}
            showLabel={showLabel}
            showHelpText={showHelpText}
            showErrors={false}
            className={`read-only-field ${className}`}
        >
            <div className="py-2 px-3 bg-gray-50 rounded border border-gray-200" style={customStyles.value}>
                {formatValue()}
            </div>
        </FieldWrapper>
    );
};

export default ReadOnlyDisplay;
