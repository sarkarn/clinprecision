import React, { FC } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  StopCircleIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';

type IconType = 'clock' | 'check' | 'exclamation' | 'stop' | 'database';
type ColorVariant = 'blue' | 'green' | 'red' | 'gray' | 'purple';

interface BuildMetricsCardProps {
  title: string;
  count: number;
  color: ColorVariant;
  icon: IconType;
  description?: string;
}

interface ColorClasses {
  bg: string;
  icon: string;
  count: string;
  border: string;
}

/**
 * Metrics card component for displaying build statistics
 */
const BuildMetricsCard: FC<BuildMetricsCardProps> = ({ title, count, color, icon, description }) => {
  // Icon mapping
  const iconMap: Record<IconType, typeof CircleStackIcon> = {
    clock: ClockIcon,
    check: CheckCircleIcon,
    exclamation: XCircleIcon,
    stop: StopCircleIcon,
    database: CircleStackIcon,
  };

  const IconComponent = iconMap[icon] || CircleStackIcon;

  // Color mapping for different variants
  const colorClasses: Record<ColorVariant, ColorClasses> = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      count: 'text-blue-900',
      border: 'border-blue-200',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      count: 'text-green-900',
      border: 'border-green-200',
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      count: 'text-red-900',
      border: 'border-red-200',
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      count: 'text-gray-900',
      border: 'border-gray-200',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      count: 'text-purple-900',
      border: 'border-purple-200',
    },
  };

  const colors = colorClasses[color] || colorClasses.gray;

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          <p className={`text-3xl font-bold ${colors.count}`}>
            {count || 0}
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>
        <div className={`flex-shrink-0 ${colors.icon}`}>
          <IconComponent className="h-10 w-10" />
        </div>
      </div>
    </div>
  );
};

export default BuildMetricsCard;
