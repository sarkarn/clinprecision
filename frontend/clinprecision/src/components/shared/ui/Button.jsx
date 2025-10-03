import React from 'react';

/**
 * Reusable Button component with variant support
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {ReactNode} children - Button content
 * @param {ReactNode} icon - Optional icon (Lucide component)
 * @param {boolean} disabled - Disabled state
 * @param {string} className - Additional CSS classes
 */
const Button = ({
    variant = 'primary',
    size = 'md',
    children,
    icon: Icon,
    disabled = false,
    className = "",
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
        secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300"
    };

    const sizeStyles = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
    };

    const iconSizes = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6"
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {Icon && <Icon className={`${iconSizes[size]} ${children ? 'mr-2' : ''}`} />}
            {children}
        </button>
    );
};

export default Button;
