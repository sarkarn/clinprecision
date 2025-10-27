import React, { FC, ReactNode } from 'react';

interface ProgressiveLoaderProps {
  isLoading: boolean;
  hasError?: boolean;
  errorMessage?: string;
  children: ReactNode;
  className?: string;
  skeletonType?: 'metrics' | 'generic';
}

interface SkeletonCardProps {
  className?: string;
}

interface LoadingDotsProps {
  className?: string;
}

interface LiveIndicatorProps {
  isLive?: boolean;
  className?: string;
}

/**
 * Skeleton card for metrics display
 */
export const SkeletonCard: FC<SkeletonCardProps> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
);

/**
 * Animated loading dots
 */
export const LoadingDots: FC<LoadingDotsProps> = ({ className = '' }) => (
  <div className={`flex space-x-1 ${className}`}>
    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
  </div>
);

/**
 * Live/cached data indicator
 */
export const LiveIndicator: FC<LiveIndicatorProps> = ({ isLive = true, className = '' }) => (
  <div className={`inline-flex items-center space-x-1 ${className}`}>
    <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
    <span className={`text-xs ${isLive ? 'text-green-600' : 'text-gray-500'}`}>
      {isLive ? 'Live' : 'Cached'}
    </span>
  </div>
);

/**
 * Progressive loader with skeleton states
 */
const ProgressiveLoader: FC<ProgressiveLoaderProps> = ({
  isLoading,
  hasError = false,
  errorMessage = 'An error occurred while loading data',
  children,
  className = '',
  skeletonType = 'generic'
}) => {
  // Error State
  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-600 text-center max-w-md">{errorMessage}</p>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    if (skeletonType === 'metrics') {
      return (
        <div className={className}>
          {/* Metrics Header Skeleton */}
          <div className="mb-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>

          {/* Metrics Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      );
    }

    // Generic Skeleton
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  // Content State
  return <>{children}</>;
};

export default ProgressiveLoader;
