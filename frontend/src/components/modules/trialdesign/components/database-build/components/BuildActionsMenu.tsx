import React, { FC, useState, useRef, useEffect, MouseEvent } from 'react';
import {
  EllipsisVerticalIcon,
  EyeIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { StudyDatabaseBuild, BuildStatus } from '../../../../../../../src/types/domain/DatabaseBuild.types';

interface ActionConfig {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
  color: string;
  destructive?: boolean;
}

interface BuildActionsMenuProps {
  build: StudyDatabaseBuild & {
    buildStatus: BuildStatus;
  };
  onClose: () => void;
  onViewDetails: () => void;
  onRefresh: () => void | Promise<void>;
  onCancel: () => void;
  onRetry: () => void | Promise<void>;
  onValidate: () => void | Promise<void>;
}

/**
 * Actions menu component for build card
 * Provides context-aware actions based on build status
 */
const BuildActionsMenu: FC<BuildActionsMenuProps> = ({
  build,
  onClose,
  onViewDetails,
  onRefresh,
  onCancel,
  onRetry,
  onValidate,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClose = (): void => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleAction = (action: () => void | Promise<void>): void => {
    action();
    handleClose();
  };

  if (!isOpen) return null;

  // Determine available actions based on build status
  const actions: ActionConfig[] = [];

  // View Details - always available
  actions.push({
    label: 'View Details',
    icon: EyeIcon,
    onClick: () => handleAction(onViewDetails),
    color: 'text-blue-600 hover:bg-blue-50',
  });

  // Status-specific actions
  if (build.buildStatus === 'IN_PROGRESS') {
    actions.push({
      label: 'Cancel Build',
      icon: XCircleIcon,
      onClick: () => handleAction(onCancel),
      color: 'text-red-600 hover:bg-red-50',
      destructive: true,
    });
  }

  if (build.buildStatus === 'FAILED') {
    actions.push({
      label: 'Retry Build',
      icon: ArrowPathIcon,
      onClick: () => handleAction(onRetry),
      color: 'text-blue-600 hover:bg-blue-50',
    });
  }

  if (build.buildStatus === 'COMPLETED') {
    actions.push({
      label: 'Validate Database',
      icon: CheckCircleIcon,
      onClick: () => handleAction(onValidate),
      color: 'text-green-600 hover:bg-green-50',
    });
    actions.push({
      label: 'Download Report',
      icon: DocumentArrowDownIcon,
      onClick: () => handleAction(() => console.log('Download report')),
      color: 'text-gray-600 hover:bg-gray-50',
    });
  }

  // Refresh - always available
  actions.push({
    label: 'Refresh Status',
    icon: ArrowPathIcon,
    onClick: () => handleAction(onRefresh),
    color: 'text-gray-600 hover:bg-gray-50',
  });

  return (
    <div
      ref={menuRef}
      className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
    >
      <div className="py-1" role="menu" aria-orientation="vertical">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`
                w-full text-left px-4 py-2 text-sm flex items-center
                ${action.color}
                ${action.destructive ? 'border-t border-gray-100' : ''}
                transition-colors duration-150
              `}
              role="menuitem"
            >
              <Icon className="h-5 w-5 mr-3" />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BuildActionsMenu;
