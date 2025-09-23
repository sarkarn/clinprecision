import React from 'react';

/**
 * Progressive Loading Component for Dashboard Metrics
 * Provides elegant loading states with skeleton UI
 */
const ProgressiveLoader = ({
    isLoading,
    hasError,
    errorMessage,
    children,
    className = "",
    skeletonType = "metrics"
}) => {
    if (hasError) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Unable to load data</h3>
                        <p className="text-sm text-red-600 mt-1">{errorMessage}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isLoading) {
        if (skeletonType === "metrics") {
            return (
                <div className={`space-y-6 ${className}`}>
                    {/* Header skeleton */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <div className="h-8 bg-gray-200 rounded-md w-80 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded-md w-96 animate-pulse"></div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                    </div>

                    {/* Metrics skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                                    <div className="w-6 h-4 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                    <div className="h-10 bg-gray-200 rounded w-16 animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-28 animate-pulse"></div>
                                    <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Additional skeleton content */}
                    <div className="space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // Generic skeleton
        return (
            <div className={`space-y-4 ${className}`}>
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
            </div>
        );
    }

    return <div className={className}>{children}</div>;
};

/**
 * Skeleton Card Component for individual metric cards
 */
export const SkeletonCard = ({ className = "" }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-6 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-28 animate-pulse"></div>
        </div>
    </div>
);

/**
 * Loading Dots Animation
 */
export const LoadingDots = ({ className = "" }) => (
    <div className={`flex space-x-1 ${className}`}>
        {Array.from({ length: 3 }).map((_, index) => (
            <div
                key={index}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${index * 0.1}s` }}
            ></div>
        ))}
    </div>
);

/**
 * Pulse Animation for live data indicator
 */
export const LiveIndicator = ({ isLive = true, className = "" }) => (
    <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        <span className="text-xs text-gray-500">
            {isLive ? 'Live data' : 'Cached data'}
        </span>
    </div>
);

export default ProgressiveLoader;