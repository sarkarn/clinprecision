import React from 'react';
import { ArrowLeft, Home, Menu, X } from 'lucide-react';
import { useStudyNavigation } from '../hooks/useStudyNavigation';

/**
 * NavigationSidebar - Provides quick navigation and exit paths for complex workflows
 * Shows contextual navigation options and quick escape routes
 */
const NavigationSidebar = ({
    isOpen,
    onToggle,
    currentWorkflow,
    workflowSteps = [],
    currentStep,
    study = null
}) => {
    const {
        navigateBack,
        navigateToStudiesList,
        navigateToStudy,
        getCurrentContext,
        isInStudyContext
    } = useStudyNavigation();

    const context = getCurrentContext();
    const inStudyContext = isInStudyContext();

    // Quick navigation options based on current context
    const getQuickActions = () => {
        const actions = [
            {
                label: 'Studies List',
                onClick: () => navigateToStudiesList(),
                icon: Home,
                description: 'Return to main studies dashboard'
            }
        ];

        if (inStudyContext && study) {
            actions.unshift({
                label: 'Study Overview',
                onClick: () => navigateToStudy(context.studyId),
                icon: ArrowLeft,
                description: `Back to ${study.name || 'study'} overview`
            });
        }

        return actions;
    };

    const quickActions = getQuickActions();

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-lg z-50 w-80
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:shadow-none lg:z-auto
      `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
                    <button
                        onClick={onToggle}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Current Context */}
                <div className="p-4 bg-blue-50 border-b border-blue-100">
                    <h3 className="text-sm font-medium text-blue-900 mb-1">Current Location</h3>
                    <p className="text-sm text-blue-700">
                        {currentWorkflow || 'Study Design Module'}
                    </p>
                    {study && (
                        <p className="text-xs text-blue-600 mt-1">
                            Working on: {study.name}
                        </p>
                    )}
                </div>

                {/* Workflow Steps (if applicable) */}
                {workflowSteps.length > 0 && (
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Workflow Progress</h3>
                        <div className="space-y-2">
                            {workflowSteps.map((step, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center p-2 rounded-lg ${index === currentStep
                                        ? 'bg-blue-100 border border-blue-200'
                                        : index < currentStep
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-gray-50 border border-gray-200'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 ${index === currentStep
                                        ? 'bg-blue-500 text-white'
                                        : index < currentStep
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${index === currentStep ? 'text-blue-900' : 'text-gray-700'
                                            }`}>
                                            {step.title}
                                        </p>
                                        {step.description && (
                                            <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Navigation</h3>
                    <div className="space-y-2">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.onClick}
                                className="w-full flex items-start p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                            >
                                <action.icon className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{action.label}</p>
                                    <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

/**
 * NavigationToggle - Button to show/hide navigation sidebar
 */
export const NavigationToggle = ({ onClick, isOpen }) => (
    <button
        onClick={onClick}
        className="fixed top-4 left-4 z-30 p-2 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-200 lg:hidden"
        aria-label="Toggle navigation"
    >
        {isOpen ? (
            <X className="w-5 h-5 text-gray-600" />
        ) : (
            <Menu className="w-5 h-5 text-gray-600" />
        )}
    </button>
);

export default NavigationSidebar;