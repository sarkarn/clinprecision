import React from 'react';

/**
 * Badge component for status indicators
 * @param {string} variant - 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'blue' | 'violet' | 'amber'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {ReactNode} children - Badge content
 */
const Badge = ({
    variant = 'neutral',
    size = 'md',
    children,
    className = ""
}) => {
    const baseStyles = "inline-flex items-center font-medium rounded-full";

    const variantStyles = {
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        neutral: "bg-gray-100 text-gray-800",
        blue: "bg-blue-100 text-blue-700",
        violet: "bg-violet-100 text-violet-700",
        amber: "bg-amber-100 text-amber-700"
    };

    const sizeStyles = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base"
    };

    return (
        <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
