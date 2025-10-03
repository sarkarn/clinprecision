import React from 'react';

/**
 * Reusable Card component for consistent layouts
 * @param {ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 * @param {boolean} hoverable - Add hover effect
 * @param {function} onClick - Click handler
 */
export const Card = ({
    children,
    className = "",
    hoverable = false,
    onClick,
    ...props
}) => {
    const hoverStyles = hoverable ? "hover:shadow-lg hover:scale-[1.02] cursor-pointer" : "";

    return (
        <div
            className={`bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 ${hoverStyles} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};

/**
 * Card Header component
 */
export const CardHeader = ({ children, className = "" }) => (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
        {children}
    </div>
);

/**
 * Card Body component
 */
export const CardBody = ({ children, className = "" }) => (
    <div className={`px-6 py-4 ${className}`}>
        {children}
    </div>
);

/**
 * Card Actions component
 */
export const CardActions = ({ children, className = "" }) => (
    <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg flex items-center justify-end gap-2 ${className}`}>
        {children}
    </div>
);

export default Card;
